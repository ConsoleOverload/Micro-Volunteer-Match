import express from 'express';
import { Team } from '../models/Team.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/teams
// @desc    Get all teams with optional search and category filter
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { campusLocation: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const teams = await Team.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teams', error: error.message });
  }
});

// @route   GET /api/teams/:id
// @desc    Get detailed team info by ID with member profiles
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('createdBy', 'name email karmaScore trustBadges')
      .populate('members', 'name email skills interests karmaScore streakCount trustBadges campusLocation');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team details', error: error.message });
  }
});

// @route   POST /api/teams
// @desc    Create a new team/club
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, category, campusLocation } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Team name and description are required' });
    }

    const existingTeam = await Team.findOne({ name: name.trim() });
    if (existingTeam) {
      return res.status(400).json({ message: 'A team with this name already exists' });
    }

    const team = new Team({
      name: name.trim(),
      description: description.trim(),
      category: category || 'General Club',
      campusLocation: campusLocation ? campusLocation.trim() : 'Campus Center',
      createdBy: req.user.id,
      members: [req.user.id]
    });

    await team.save();
    await team.populate('createdBy', 'name email');
    await team.populate('members', 'name email skills karmaScore');

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error creating team', error: error.message });
  }
});

// @route   POST /api/teams/:id/join
// @desc    Join a team
router.post('/:id/join', protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const userIdStr = req.user.id.toString();
    const isMember = team.members.some(memberId => memberId.toString() === userIdStr);

    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this team' });
    }

    team.members.push(req.user.id);
    await team.save();
    await team.populate('members', 'name email skills interests karmaScore streakCount trustBadges campusLocation');

    res.json({ message: 'Joined team successfully', team });
  } catch (error) {
    res.status(500).json({ message: 'Error joining team', error: error.message });
  }
});

// @route   POST /api/teams/:id/leave
// @desc    Leave a team
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const userIdStr = req.user.id.toString();
    const isMember = team.members.some(memberId => memberId.toString() === userIdStr);

    if (!isMember) {
      return res.status(400).json({ message: 'You are not a member of this team' });
    }

    team.members = team.members.filter(memberId => memberId.toString() !== userIdStr);
    await team.save();
    await team.populate('members', 'name email skills interests karmaScore streakCount trustBadges campusLocation');

    res.json({ message: 'Left team successfully', team });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving team', error: error.message });
  }
});

// @route   DELETE /api/teams/:id
// @desc    Delete team (creator only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Forbidden: Only the team creator can delete this team' });
    }

    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting team', error: error.message });
  }
});

// @route   POST /api/teams/:id/chat
// @desc    Send a message in the team chat (members only)
router.post('/:id/chat', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text cannot be empty' });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const userIdStr = req.user.id.toString();
    const isMember = team.members.some(memberId => memberId.toString() === userIdStr);

    if (!isMember) {
      return res.status(403).json({ message: 'Forbidden: Only team members can send messages in team chat' });
    }

    const newMessage = {
      sender: req.user.id,
      senderName: req.user.name,
      text: text.trim(),
      createdAt: new Date()
    };

    team.messages.push(newMessage);
    await team.save();

    res.status(201).json({ message: 'Message sent', messages: team.messages });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// @route   GET /api/teams/:id/chat
// @desc    Get team chat messages (members only)
router.get('/:id/chat', protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const userIdStr = req.user.id.toString();
    const isMember = team.members.some(memberId => memberId.toString() === userIdStr);

    if (!isMember) {
      return res.status(403).json({ message: 'Forbidden: Join this team to access team chat' });
    }

    res.json({ messages: team.messages || [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team chat', error: error.message });
  }
});

export default router;

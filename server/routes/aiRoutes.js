import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { User } from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
};

// @route   POST /api/ai/match
// @desc    Use Gemini AI to match task description with best candidate volunteers
router.post('/match', protect, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const candidates = await User.find({
      _id: { $ne: req.user.id }
    }).select('name email skills interests campusLocation karmaScore trustBadges');

    if (candidates.length === 0) {
      return res.json({ matches: [], note: 'No candidate volunteers found in campus pool.' });
    }

    const genAI = getGenAIClient();
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
You are an AI volunteer matching engine for a college micro-volunteering campus application.
Match the following task with the top 3 best candidate volunteers from the provided list.

TASK DETAILS:
- Title: ${title}
- Description: ${description}
- Category: ${category}

CANDIDATES:
${JSON.stringify(candidates.map(c => ({
  id: c._id,
  name: c.name,
  skills: c.skills,
  interests: c.interests,
  location: c.campusLocation,
  karmaScore: c.karmaScore,
  badges: c.trustBadges
})), null, 2)}

Return a JSON array of the top candidate matches in this exact format:
[
  {
    "userId": "string_id",
    "name": "Candidate Name",
    "matchScore": 95,
    "oneLineReason": "Brief 1-sentence reason why this volunteer is a great fit."
  }
]
Return ONLY raw valid JSON array, no markdown wrappers or extra text.
`;

        const response = await model.generateContent(prompt);
        const textResult = response.response.text() || '';
        const cleanedJson = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
        const matches = JSON.parse(cleanedJson);

        return res.json({ matches, isAiGenerated: true });
      } catch (aiErr) {
        console.warn('Gemini API call failed, using heuristic match fallback:', aiErr.message);
      }
    }

    // Heuristic Fallback matching
    const taskWords = `${title} ${description} ${category}`.toLowerCase().split(/\s+/);
    const scoredCandidates = candidates.map(c => {
      let score = 50;
      const userTags = [...c.skills, ...c.interests].map(t => t.toLowerCase());

      userTags.forEach(tag => {
        if (taskWords.some(w => w.includes(tag) || tag.includes(w))) {
          score += 20;
        }
      });

      if (c.skills.some(s => s.toLowerCase() === category.toLowerCase())) {
        score += 25;
      }

      score += Math.min(c.karmaScore / 10, 15);

      return {
        userId: c._id,
        name: c.name,
        matchScore: Math.min(Math.round(score), 99),
        oneLineReason: `Matches skills (${c.skills.slice(0, 2).join(', ') || 'General Help'}) and active at ${c.campusLocation}.`
      };
    });

    scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);
    const topMatches = scoredCandidates.slice(0, 3);

    res.json({ matches: topMatches, isAiGenerated: false });
  } catch (error) {
    res.status(500).json({ message: 'Error running AI candidate match', error: error.message });
  }
});

// @route   POST /api/ai/summarize
// @desc    Generate a 1-line AI preview summary of a task description
router.post('/summarize', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const genAI = getGenAIClient();
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Summarize this campus help request into a snappy, single-line preview (10-15 words max):\nTitle: ${title}\nDescription: ${description}`;
        const response = await model.generateContent(prompt);
        return res.json({ summary: response.response.text().trim() });
      } catch (err) {
        console.warn('Gemini summarize failed, returning fallback preview:', err.message);
      }
    }

    const summary = description.length > 80 ? description.substring(0, 80) + '...' : description;
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: 'Error generating task summary', error: error.message });
  }
});

export default router;

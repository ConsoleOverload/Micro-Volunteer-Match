import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Task } from './models/Task.js';
import { SkillVerification } from './models/SkillVerification.js';
import { Team } from './models/Team.js';
import { computeTrustBadges } from './utils/badges.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/micro_volunteer_match';
    console.log(`Connecting to MongoDB for seeding at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Task.deleteMany({});
    await SkillVerification.deleteMany({});
    await Team.deleteMany({});

    const passwordHash = await bcrypt.hash('password123', 10);

    console.log('Creating demo Anurag University campus users...');
    const users = await User.create([
      {
        name: 'Alex Rivera',
        email: 'alex@anurag.edu.in',
        passwordHash,
        role: 'both',
        skills: ['Tutoring', 'Calculus', 'Python', 'Translation'],
        interests: ['STEM Tutoring', 'Peer Mentoring', 'Coding'],
        campusLocation: 'Anurag University - Central Library',
        karmaScore: 210,
        streakCount: 4,
        lastHelpedDate: new Date()
      },
      {
        name: 'Maya Patel',
        email: 'maya@anurag.edu.in',
        passwordHash,
        role: 'both',
        skills: ['Design', 'Poster Art', 'Canva', 'Social Media'],
        interests: ['Community Art', 'Campus Events', 'Graphic Design'],
        campusLocation: 'Anurag University - Student Activity Center',
        karmaScore: 160,
        streakCount: 3,
        lastHelpedDate: new Date()
      },
      {
        name: 'Jordan Chen',
        email: 'jordan@anurag.edu.in',
        passwordHash,
        role: 'both',
        skills: ['Donation Sorting', 'Event Logistics', 'Directions'],
        interests: ['Sustainability', 'Food Drive', 'Campus Guides'],
        campusLocation: 'Anurag University - A-Block (Engineering)',
        karmaScore: 85,
        streakCount: 2,
        lastHelpedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Samantha Lee',
        email: 'samantha@anurag.edu.in',
        passwordHash,
        role: 'both',
        skills: ['Translation', 'Spanish', 'Telugu', 'Tutoring'],
        interests: ['Language Exchange', 'International Students'],
        campusLocation: 'Anurag University - C-Block (Management & Humanities)',
        karmaScore: 320,
        streakCount: 6,
        lastHelpedDate: new Date()
      }
    ]);

    const [alex, maya, jordan, samantha] = users;

    console.log('Creating demo Anurag University micro-help tasks...');
    const tasks = await Task.create([
      {
        title: 'Need quick 15-min Data Structures & Python check',
        description: 'Stuck on problem #4 involving Binary Trees before class starts at 11:15 AM! Looking for a quick explanation at A-Block.',
        category: 'Tutoring',
        postedBy: maya._id,
        isUrgent: true,
        estimatedMinutes: 15,
        campusLocation: 'Anurag University - A-Block (Engineering)',
        status: 'open',
        createdAt: new Date(Date.now() - 10 * 60 * 1000)
      },
      {
        title: 'Help sort tech fest event banners & posters for 15 mins',
        description: 'We just received printed banners at the Student Activity Center. Need 1-2 volunteers to sort items into boxes.',
        category: 'Donation Sorting',
        postedBy: jordan._id,
        isUrgent: false,
        estimatedMinutes: 15,
        campusLocation: 'Anurag University - Student Activity Center',
        status: 'open',
        createdAt: new Date(Date.now() - 35 * 60 * 1000)
      },
      {
        title: 'Quick review of IEEE event poster layout',
        description: 'Designed a technical symposium poster in Canva. Need a second pair of eyes on color contrast and typography before print.',
        category: 'Design',
        postedBy: alex._id,
        isUrgent: false,
        estimatedMinutes: 15,
        campusLocation: 'Anurag University - Central Library',
        status: 'open',
        createdAt: new Date(Date.now() - 60 * 60 * 1000)
      },
      {
        title: 'Translation of 1-paragraph orientation note into Telugu',
        description: 'Need help translating a short 100-word orientation welcome message into Telugu for campus newsletter.',
        category: 'Translation',
        postedBy: maya._id,
        acceptedBy: samantha._id,
        isUrgent: true,
        estimatedMinutes: 15,
        campusLocation: 'Anurag University - C-Block (Management & Humanities)',
        status: 'accepted',
        acceptedAt: new Date(Date.now() - 15 * 60 * 1000),
        createdAt: new Date(Date.now() - 25 * 60 * 1000)
      },
      {
        title: 'Directions & escort to Pharmacy Block Lab 2',
        description: 'First year student looking for someone to show the shortcut to B-Block Pharmacy Lab 2 from Central Library.',
        category: 'Directions',
        postedBy: samantha._id,
        acceptedBy: alex._id,
        isUrgent: false,
        estimatedMinutes: 10,
        campusLocation: 'Anurag University - B-Block (Pharmacy & Sciences)',
        status: 'completed',
        postedByConfirmed: true,
        acceptedByConfirmed: true,
        acceptedAt: new Date(Date.now() - 120 * 60 * 1000),
        completedAt: new Date(Date.now() - 100 * 60 * 1000),
        createdAt: new Date(Date.now() - 150 * 60 * 1000)
      }
    ]);

    console.log('Creating demo skill verifications...');
    await SkillVerification.create([
      {
        skill: 'Tutoring',
        user: alex._id,
        verifiedBy: samantha._id,
        taskId: tasks[4]._id
      },
      {
        skill: 'Tutoring',
        user: alex._id,
        verifiedBy: maya._id,
        taskId: tasks[4]._id
      },
      {
        skill: 'Tutoring',
        user: alex._id,
        verifiedBy: jordan._id,
        taskId: tasks[4]._id
      },
      {
        skill: 'Translation',
        user: samantha._id,
        verifiedBy: maya._id,
        taskId: tasks[3]._id
      }
    ]);

    console.log('Creating demo Anurag University campus teams & clubs with chat...');
    await Team.create([
      {
        name: 'Anurag Green Campus Initiative',
        description: 'Student-led sustainability group organizing quick 15-minute campus cleanup drives, recycling sorting, and tree-planting volunteer shifts around Anurag University.',
        category: 'Volunteer Corps',
        campusLocation: 'Anurag University - Student Activity Center',
        createdBy: jordan._id,
        members: [jordan._id, alex._id, maya._id],
        messages: [
          {
            sender: jordan._id,
            senderName: 'Jordan Chen',
            text: 'Welcome team! Next 15-min campus recycling drive is on Friday at 4 PM near the Cafeteria.',
            createdAt: new Date(Date.now() - 120 * 60 * 1000)
          },
          {
            sender: alex._id,
            senderName: 'Alex Rivera',
            text: 'Awesome! Count me in for 15 minutes right after my lab at A-Block.',
            createdAt: new Date(Date.now() - 60 * 60 * 1000)
          }
        ]
      },
      {
        name: 'Anurag CS & Coding Peer Mentors',
        description: 'Helping fellow Anurag University students with 15-minute code reviews, Python/Java lab help, and data structures problem solving.',
        category: 'Academic Club',
        campusLocation: 'Anurag University - A-Block (Engineering)',
        createdBy: alex._id,
        members: [alex._id, maya._id],
        messages: [
          {
            sender: alex._id,
            senderName: 'Alex Rivera',
            text: 'Hey mentors! I will be at Central Library from 2-4 PM today for quick code reviews.',
            createdAt: new Date(Date.now() - 180 * 60 * 1000)
          }
        ]
      },
      {
        name: 'Anurag Cultural & Event Volunteers',
        description: 'Connecting campus volunteers to organize quick 15-minute fest setup, poster design, and event coordination.',
        category: 'Cultural Org',
        campusLocation: 'Anurag University - C-Block (Management & Humanities)',
        createdBy: samantha._id,
        members: [samantha._id, alex._id],
        messages: [
          {
            sender: samantha._id,
            senderName: 'Samantha Lee',
            text: 'We are printing event banners today! Let me know if anyone can help sort them for 10 mins.',
            createdAt: new Date(Date.now() - 90 * 60 * 1000)
          }
        ]
      }
    ]);

    console.log('Computing and updating user trust badges...');
    for (const u of [alex, maya, jordan, samantha]) {
      u.trustBadges = await computeTrustBadges(u);
      await u.save();
    }

    console.log('Seed completed successfully for Anurag University!');
    console.log('Demo Accounts Created (Password for all: password123):');
    console.log(' 1. alex@anurag.edu.in (Volunteer/Requester - 210 Karma, Verified Skill: Tutoring ✓)');
    console.log(' 2. maya@anurag.edu.in (Volunteer/Requester - 160 Karma)');
    console.log(' 3. jordan@anurag.edu.in (Volunteer/Requester - 85 Karma)');
    console.log(' 4. samantha@anurag.edu.in (Volunteer/Requester - 320 Karma, Community Champion)');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();

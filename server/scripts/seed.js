const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('../models/User');
const Task = require('../models/Task');
const Participation = require('../models/Participation');
const Notification = require('../models/Notification');
const SavedTask = require('../models/SavedTask');

const { seedUsers, seedTaskTemplates } = require('../utils/seedData');
const { evaluateAndAwardBadges } = require('../services/badgeEngine');

async function runSeed() {
  console.log('🌱 Starting Micro-Volunteer Match database seeding...');

  let mongoServer = null;
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/micro_volunteer_match';
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log(`Connected to MongoDB: ${mongoose.connection.host}`);
    } catch (err) {
      console.warn(`Local MongoDB unavailable (${err.message}). Starting MongoMemoryServer...`);
      mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
      console.log('Connected to In-Memory MongoDB Server!');
    }

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    await Participation.deleteMany({});
    await Notification.deleteMany({});
    await SavedTask.deleteMany({});

    console.log('🧹 Cleared existing database records.');

    // 1. Create Users
    const createdUsers = [];
    for (const userData of seedUsers) {
      const user = new User(userData);
      await user.save(); // triggers pre-save bcrypt hash
      createdUsers.push(user);
    }

    console.log(`👤 Created ${createdUsers.length} users.`);

    const demoUser = createdUsers.find((u) => u.email === 'demo@example.com');
    const alexUser = createdUsers.find((u) => u.email === 'alex@example.com');
    const mariaUser = createdUsers.find((u) => u.email === 'maria@example.com');
    const liamUser = createdUsers.find((u) => u.email === 'liam@example.com');

    // 2. Create Tasks
    const createdTasks = [];
    const creators = [alexUser, mariaUser, liamUser];

    for (let i = 0; i < seedTaskTemplates.length; i++) {
      const template = seedTaskTemplates[i];
      const creator = creators[i % creators.length];

      const task = await Task.create({
        ...template,
        creator: creator._id,
        status: i < 15 ? 'OPEN' : 'COMPLETED',
      });
      createdTasks.push(task);
    }

    console.log(`📋 Created ${createdTasks.length} micro-tasks.`);

    // 3. Create completed participations for demo user to establish impact history & badges
    const completedTasksForDemo = createdTasks.slice(15, 19);
    for (const completedTask of completedTasksForDemo) {
      await Participation.create({
        volunteer: demoUser._id,
        task: completedTask._id,
        status: 'COMPLETED',
        acceptedAt: new Date(Date.now() - 86400000 * 3),
        completedAt: new Date(Date.now() - 86400000 * 2),
        confirmedAt: new Date(Date.now() - 86400000 * 1),
      });

      completedTask.volunteers.push(demoUser._id);
      completedTask.status = 'COMPLETED';
      await completedTask.save();
    }

    // 4. Create 1 upcoming accepted task for demo user
    const acceptedTask = createdTasks[0];
    await Participation.create({
      volunteer: demoUser._id,
      task: acceptedTask._id,
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    });
    acceptedTask.volunteers.push(demoUser._id);
    acceptedTask.status = 'ACCEPTED';
    await acceptedTask.save();

    // 5. Evaluate and award badges for all users
    for (const u of createdUsers) {
      await evaluateAndAwardBadges(u);
    }

    // 6. Create sample notifications for demo user
    await Notification.create([
      {
        recipient: demoUser._id,
        type: 'MATCH',
        title: 'New 94% Match Found! 🎯',
        message: 'A new task matching your Python skills and Education interest was posted: "Help a junior student debug Python list comprehension".',
        relatedTask: createdTasks[0]._id,
        read: false,
      },
      {
        recipient: demoUser._id,
        type: 'TASK_COMPLETED',
        title: 'Impact Verified! 🎉',
        message: 'Your 15-minute tutoring session was confirmed by Alex Rivera. +15 contribution minutes added.',
        relatedTask: completedTasksForDemo[0]._id,
        read: false,
      },
      {
        recipient: demoUser._id,
        type: 'BADGE_EARNED',
        title: 'Badge Earned: 💙 Community Builder',
        message: 'You have contributed over 60 minutes of volunteer time to your community!',
        read: true,
      },
    ]);

    // 7. Save 2 sample tasks for demo user
    await SavedTask.create([
      { user: demoUser._id, task: createdTasks[1]._id },
      { user: demoUser._id, task: createdTasks[2]._id },
    ]);

    console.log('\n✅ Database Seeding Completed Successfully!');
    console.log('----------------------------------------------------');
    console.log('🔑 DEMO CREDENTIALS:');
    console.log('   Email:    demo@example.com');
    console.log('   Password: Demo@123');
    console.log('----------------------------------------------------');
    console.log('🔑 ADMIN CREDENTIALS:');
    console.log('   Email:    admin@example.com');
    console.log('   Password: Demo@123');
    console.log('----------------------------------------------------');

    if (!mongoServer) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeed();

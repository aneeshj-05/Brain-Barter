// backend/seeder.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');
const User = require('./models/User');

async function connectDB() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  }
}

connectDB().then(seedUsers);

async function seedUsers() {
  try {
    await User.deleteMany();
    console.log('🧹 Existing users removed.');

    const passwordHash = await bcrypt.hash('Passcode08', 10);

    const skillPool = [
      'Web Development', 'Graphic Design', 'Cooking', 'Photography', 'Guitar',
      'Public Speaking', 'Machine Learning', 'Data Analysis', 'Yoga', 'UI/UX Design',
      'Digital Marketing', 'Content Writing', 'Video Editing', 'Python', 'C++',
      'Chess', 'Gardening', 'Singing', 'Fitness Training', 'Meditation'
    ];

    // Utility function to pick random unique skills
    const getRandomSkills = (arr, num) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, num);
    };

    const users = [];

    for (let i = 0; i < 50; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ firstName, lastName }).toLowerCase();

      // Random number of skills for variety
      const skills = getRandomSkills(skillPool, faker.number.int({ min: 2, max: 5 }));
      // Exclude their own skills to avoid duplication in “wanted”
      const remaining = skillPool.filter(skill => !skills.includes(skill));
      const skillsWanted = getRandomSkills(remaining, faker.number.int({ min: 2, max: 4 }));

      users.push({
        firstName,
        lastName,
        email,
        username: faker.internet.username({ firstName, lastName }),
        password_hash: passwordHash,
        skills,
        skillsWanted,
        credits: faker.number.int({ min: 1, max: 10 }),
        rating: faker.number.float({ min: 2, max: 5, precision: 0.1 }),
        reviews: [],
        matches: [],
        createdAt: faker.date.past({ years: 1 }),
      });
    }

    await User.insertMany(users);
    console.log(`✅ Seeded ${users.length} users successfully with random skills!`);
    console.log('🔑 Common password for all: Passcode08\n');

    // Print 5 sample users
    console.log('🧑‍💻 Sample logins:');
    users.slice(0, 5).forEach((u, i) =>
      console.log(`${i + 1}. ${u.email} | Skills: ${u.skills.join(', ')} | Wants: ${u.skillsWanted.join(', ')}`)
    );

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding users:', err);
    process.exit(1);
  }
}

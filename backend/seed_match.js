// backend/seed_matches.js
require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const User = require('./models/User');
const MatchRequest = require('./models/MatchRequest');

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

connectDB().then(seedMatchRequests);

async function seedMatchRequests() {
  try {
    await MatchRequest.deleteMany();
    console.log('🧹 Old match requests cleared.');

    const users = await User.find({});
    console.log(`👥 Found ${users.length} users.`);

    const requests = [];

    for (let i = 0; i < users.length; i++) {
      const sender = users[i];

      // pick a few random other users to send match requests to
      const potentialRecipients = users
        .filter(u => u._id.toString() !== sender._id.toString())
        .sort(() => 0.5 - Math.random())
        .slice(0, faker.number.int({ min: 3, max: 5 })); // each user sends 3–5 requests

      potentialRecipients.forEach(recipient => {
        // find overlapping skills
        const offeredSkill = faker.helpers.arrayElement(sender.skills);
        const requestedSkill = faker.helpers.arrayElement(recipient.skills);

        // avoid duplicates or nonsense
        if (!offeredSkill || !requestedSkill || offeredSkill === requestedSkill) return;

        requests.push({
          senderId: sender._id.toString(),
          senderName: `${sender.firstName} ${sender.lastName}`,
          recipientId: recipient._id.toString(),
          recipientName: `${recipient.firstName} ${recipient.lastName}`,
          skillOffered: offeredSkill,
          skillRequested: requestedSkill,
          status: 'pending',
          createdAt: new Date()
        });
      });
    }

    await MatchRequest.insertMany(requests);
    console.log(`✅ Inserted ${requests.length} match requests.`);

    // show 5 samples
    console.log('\n📬 Sample Match Requests:');
    requests.slice(0, 5).forEach((r, i) => {
      console.log(
        `${i + 1}. ${r.senderName} → ${r.recipientName} | Offers: ${r.skillOffered}, Wants: ${r.skillRequested}`
      );
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding match requests:', err);
    process.exit(1);
  }
}

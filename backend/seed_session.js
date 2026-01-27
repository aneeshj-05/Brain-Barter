
require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const User = require('./models/User');
const Session = require('./models/Session');

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

connectDB().then(seedSessions);

async function seedSessions() {
  try {
    await Session.deleteMany();
    console.log('🧹 Cleared existing sessions');

    const users = await User.find({});
    if (users.length < 2) {
      console.error('❌ Not enough users to create sessions');
      process.exit(1);
    }

    const sessions = [];
    const reviewsToInsert = [];

    for (let i = 0; i < 100; i++) {
      const learner = faker.helpers.arrayElement(users);
      let teacher = faker.helpers.arrayElement(users);
      while (teacher._id.toString() === learner._id.toString()) {
        teacher = faker.helpers.arrayElement(users);
      }

      const skill = faker.helpers.arrayElement(teacher.skills);

      const isCompleted = faker.datatype.boolean();
      const session = new Session({
        learnerId: learner._id,
        teacherId: teacher._id,
        skill,
        status: isCompleted ? 'completed' : 'pending',
        learnerCompleted: isCompleted,
        teacherCompleted: isCompleted,
        createdAt: faker.date.recent({ days: 30 })
      });
      sessions.push(session);

      // If completed, create reviews
      if (isCompleted) {
        const learnerRating = faker.number.int({ min: 3, max: 5 });
        const teacherRating = faker.number.int({ min: 3, max: 5 });

        reviewsToInsert.push({
          user: teacher, // teacher gets reviewed by learner
          review: {
            fromUserId: learner._id,
            sessionId: session._id,
            rating: learnerRating,
            comment: faker.lorem.sentence(),
            createdAt: new Date()
          }
        });

        reviewsToInsert.push({
          user: learner, // learner gets reviewed by teacher
          review: {
            fromUserId: teacher._id,
            sessionId: session._id,
            rating: teacherRating,
            comment: faker.lorem.sentence(),
            createdAt: new Date()
          }
        });
      }
    }

    await Session.insertMany(sessions);
    console.log(`✅ Created ${sessions.length} sessions`);

    // Attach reviews to users
    for (const { user, review } of reviewsToInsert) {
      const target = await User.findById(user._id);
      if (!target) continue;
      target.reviews.push(review);
      await target.save();

      // Update rating
      const totalRating = target.reviews.reduce((acc, r) => acc + r.rating, 0);
      target.rating = (totalRating / target.reviews.length).toFixed(1);
      await target.save();
    }

    console.log(`⭐ Added ${reviewsToInsert.length} reviews and updated ratings`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding sessions:', err);
    process.exit(1);
  }
}

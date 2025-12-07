// Migration script to add points and badges to existing users
const mongoose = require('mongoose');

// Connect to your MongoDB database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swachhta';

async function migrateUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all users to have points and badges fields if they don't exist
    const result = await mongoose.connection.db.collection('users').updateMany(
      { 
        $or: [
          { points: { $exists: false } },
          { badges: { $exists: false } }
        ]
      },
      { 
        $set: { 
          points: 0,
          badges: []
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} users with points and badges fields`);

    // Now let's calculate and update points for existing users based on their activities
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    for (const user of users) {
      let totalPoints = 0;
      const badges = [];

      // Count issues created by this user
      const issuesCount = await mongoose.connection.db.collection('issues').countDocuments({
        createdBy: new mongoose.Types.ObjectId(user._id)
      });

      // Count votes by this user
      const votesCount = await mongoose.connection.db.collection('votes').countDocuments({
        user: new mongoose.Types.ObjectId(user._id)
      });

      // Calculate points
      totalPoints = (issuesCount * 10) + (votesCount * 5);

      // Award badges based on activities
      if (issuesCount >= 1) {
        badges.push('First Issue');
      }
      if (issuesCount >= 5) {
        badges.push('Issue Hunter');
      }
      if (votesCount >= 10) {
        badges.push('Community Helper');
      }
      if (votesCount >= 25) {
        badges.push('Voting Master');
      }
      if (totalPoints >= 100) {
        badges.push('Local Hero');
      }

      // Update user with calculated points and badges
      await mongoose.connection.db.collection('users').updateOne(
        { _id: user._id },
        { 
          $set: { 
            points: totalPoints,
            badges: badges
          }
        }
      );

      console.log(`Updated user ${user.name}: ${totalPoints} points, ${badges.length} badges`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateUsers();



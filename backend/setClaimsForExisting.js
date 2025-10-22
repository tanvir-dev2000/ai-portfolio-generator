require('dotenv').config(); // Add this line at the top!

const admin = require('./config/firebase');

async function setClaimsForAllUsers() {
  try {
    const listUsersResult = await admin.auth().listUsers();
    
    for (const user of listUsersResult.users) {
      await admin.auth().setCustomUserClaims(user.uid, {
        role: 'authenticated'
      });
      console.log(`Claims set for ${user.email}`);
    }
    
    console.log('Done! All users updated.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setClaimsForAllUsers();

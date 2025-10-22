const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// This function runs automatically when a new user is created
exports.addCustomClaims = functions.auth.user().onCreate(async (user) => {
  try {
    // Add the 'authenticated' role to the user
    await admin.auth().setCustomUserClaims(user.uid, {
      role: "authenticated",
    });

    console.log(`Custom claims set for user: ${user.uid}`);
    return null;
  } catch (error) {
    console.error("Error setting custom claims:", error);
    return null;
  }
});

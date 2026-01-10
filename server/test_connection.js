require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

console.log("\n📡 Testing MongoDB Connection...");

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log("\n✅ SUCCESS! Connection established.");
        console.log("You can now run your server normally.\n");
        process.exit(0);
    })
    .catch(err => {
        console.log("\n❌ CONNECTION FAILED");
        console.log("---------------------------------------------------");
        console.log("Error: " + err.message);
        console.log("---------------------------------------------------");
        console.log("👉 EXPLANATION: MongoDB blocked your connection because your internet IP address changed.");
        console.log("👉 FIX: Go to MongoDB Atlas website -> Network Access -> Add 0.0.0.0/0 to whitelist.\n");
        process.exit(1);
    });

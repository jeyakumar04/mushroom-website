require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

// Same config as modified index.js
const options = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4
};

console.log("\n🧪 TESTING FINAL MONGOOSE CONNECTION...");
console.log("URI:", uri.replace(/:([^:@]{1,})@/, ':****@')); // Hide password
console.log("Options:", options);

mongoose.connect(uri, options)
    .then(() => {
        console.log("\n✅ SUCCESS! Mongoose connected with these settings.");
        console.log("   The issue might be elsewhere in the main server file?\n");
        process.exit(0);
    })
    .catch(err => {
        console.log("\n❌ FAILED AGAIN.");
        console.log("Error Name:", err.name);
        console.log("Error Message:", err.message);

        // Debugging hint
        if (err.message.includes('whitelist')) {
            console.log("\n🤔 STILL WHITELIST ERROR.");
            console.log("   This is extremely rare if you added 0.0.0.0/0.");
            console.log("   Double check if you have TWO 'Network Access' entries that conflict?");
        }
        process.exit(1);
    });

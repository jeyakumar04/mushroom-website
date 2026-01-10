require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

const uri = process.env.MONGODB_URI;
// Extract hostname from mongodb+srv://USER:PASS@HOSTNAME/...
const hostname = uri.split('@')[1].split('/')[0];

console.log("\n🔍 DIAGNOSTIC MODE V2: Checking Cluster Status...");
console.log(`Target: ${hostname}`);

// 1. Check SRV Record (The entry point for Atlas)
console.log(`\n1. Checking Atlas Configuration (DNS SRV)...`);
dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
    if (err) {
        console.log("❌ CRITICAL ERROR: Could not find the Cluster configuration.");
        console.log("   Error code:", err.code);
        console.log("   This usually means:");
        console.log("   1. You are disconnected from the internet.");
        console.log("   2. A firewall is strictly blocking DNS.");
        process.exit(1);
    } else {
        console.log("✅ Configuration found. Cluster members:", addresses);

        // 2. Try Connection
        console.log("\n2. Attempting full connection...");
        mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
            .then(() => {
                console.log("\n✅ SUCCESS! Connection established.");
                process.exit(0);
            })
            .catch(err => {
                console.log("\n❌ CONNECTION REFUSED");
                console.log("---------------------------------------------------");
                console.log(err.message);
                console.log("---------------------------------------------------");

                console.log("\n👇 MOST LIKELY CAUSES 👇");
                console.log("1. **CLUSTER IS PAUSED** (Most Common in Free Tier)");
                console.log("   👉 Go to cloud.mongodb.com -> Check if there is a 'RESUME' button.");
                console.log("");
                console.log("2. **IP WHITELIST DELAY**");
                console.log("   👉 It takes 1-2 minutes after you add 0.0.0.0/0 to work.");
                process.exit(1);
            });
    }
});

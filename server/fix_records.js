const mongoose = require('mongoose');
const path = require('path');
const Customer = require('./models/Customer');

async function fix() {
    try {
        const LOCAL_URI = 'mongodb://localhost:27017/tjp_mushroom_local';
        await mongoose.connect(LOCAL_URI);
        console.log('Connected to Local DB');

        const targets = [
            { phone: '9500591897', total: 45 },
            { phone: '6384163485', total: 21 },
            { phone: '9159659711', total: 4 } // Partha's alternate?
        ];

        for (const target of targets) {
            let customer = await Customer.findOne({ contactNumber: target.phone });
            if (customer) {
                let total = target.total;
                let free = 0;
                while (total >= 10) {
                    free += 1;
                    total -= 10;
                }
                customer.cycleCount = total;
                customer.freePocketsClaimed = free;
                customer.totalLifetime = target.total;
                customer.rewardsRedeemed = 0; // Reset for testing
                await customer.save();
                console.log(`✅ FIXED ${customer.name} (${target.phone}): Cycle ${total}/10, Free ${free}`);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
fix();

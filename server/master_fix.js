const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Customer = require('./models/Customer');
const Sales = require('./models/Sales');

async function checkAndFix() {
    try {
        const LOCAL_URI = 'mongodb://localhost:27017/tjp_mushroom_local';
        await mongoose.connect(LOCAL_URI);
        console.log('Connected to Local MongoDB');

        const targets = [
            { name: 'logesh', phone: '6384163485' },
            { name: 'Parthasarathi', phone: '9159659711' } // Assuming this is his number from previous context
        ];

        for (const target of targets) {
            const customer = await Customer.findOne({
                $or: [
                    { name: new RegExp(target.name, 'i') },
                    { contactNumber: target.phone }
                ]
            });

            if (customer) {
                console.log(`\nFound Customer: ${customer.name} (${customer.contactNumber})`);
                console.log(`Current DB State -> Cycle: ${customer.cycleCount}, Total Free: ${customer.freePocketsClaimed}`);

                // Fetch all mushroom sales to get actual total
                const sales = await Sales.find({
                    contactNumber: customer.contactNumber,
                    productType: 'Mushroom',
                    pricePerUnit: { $gte: 50 }
                });

                const totalPockets = sales.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
                console.log(`Actual Sales History: ${totalPockets} pockets`);

                // APPLY STRIKE ANTI-GRAVITY v5.0 Logic
                let total = totalPockets;
                let free = 0;
                while (total >= 10) {
                    free += 1;
                    total -= 10;
                }

                customer.cycleCount = total;
                customer.freePocketsClaimed = free;
                customer.totalLifetime = totalPockets;
                await customer.save();

                console.log(`FIXED DB State -> Cycle: ${customer.cycleCount}, Total Free: ${customer.freePocketsClaimed}`);
            } else {
                console.log(`Customer ${target.name} not found.`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkAndFix();

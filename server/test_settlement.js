const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Sales = require('./models/Sales');

async function testSettlement() {
    try {
        console.log('🔄 Connecting to LOCAL MongoDB...');
        await mongoose.connect('mongodb://localhost:27017/mushroom_db');
        console.log('✅ Connected to LOCAL.');

        // Find all Credit sales
        const creditSales = await Sales.find({ paymentType: 'Credit' });
        console.log(`\n📊 Found ${creditSales.length} Credit sales:`);

        creditSales.forEach(sale => {
            console.log(`- ${sale.orderId || sale._id}: ${sale.customerName} - ₹${sale.totalAmount} - Status: ${sale.paymentStatus}`);
        });

        // Now test settling the FIRST one to Cash
        if (creditSales.length > 0) {
            const testSale = creditSales[0];
            console.log(`\n🔧 Testing settlement of: ${testSale.orderId || testSale._id}`);

            testSale.paymentStatus = 'Paid';
            testSale.paymentType = 'Cash';
            testSale.settledDate = new Date();
            testSale.settledBy = 'Cash';

            testSale.markModified('paymentStatus');
            testSale.markModified('paymentType');

            await testSale.save();

            console.log('✅ Settlement SAVED!');

            // Verify
            const verified = await Sales.findById(testSale._id);
            console.log(`\n🔍 Verification:`);
            console.log(`- Payment Type: ${verified.paymentType}`);
            console.log(`- Payment Status: ${verified.paymentStatus}`);
            console.log(`- Settled By: ${verified.settledBy}`);
        } else {
            console.log('\n⚠️ No Credit sales found to test with.');
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testSettlement();

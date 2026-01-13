/**
 * Quick check to find Jeyanthi and Parthasarathi records
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Define Sales Schema
const salesSchema = new mongoose.Schema({
    productType: String,
    quantity: Number,
    amount: Number,
    pricePerUnit: Number,
    customerName: String,
    contactNumber: String,
    paymentType: { type: String, enum: ['Cash', 'GPay', 'Kadan'], default: 'Cash' },
    paymentStatus: { type: String, enum: ['Paid', 'Unpaid'], default: 'Paid' },
    settledDate: Date,
    settledBy: String,
    date: { type: Date, default: Date.now }
});

const Sales = mongoose.model('Sales', salesSchema);

async function checkCustomers() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');

        // Find all records with names similar to Jeyanthi
        console.log('🔍 Searching for Jeyanthi...');
        const jeyanthiRecords = await Sales.find({
            customerName: /jeyanthi/i
        }).sort({ date: -1 }).limit(5);

        console.log(`Found ${jeyanthiRecords.length} records:`);
        jeyanthiRecords.forEach((record, index) => {
            console.log(`  ${index + 1}. Name: ${record.customerName}`);
            console.log(`     Type: ${record.paymentType}, Status: ${record.paymentStatus}`);
            console.log(`     Amount: ₹${record.amount}, Date: ${record.date.toLocaleDateString()}\n`);
        });

        // Find all records with names similar to Parthasarathi
        console.log('\n🔍 Searching for Parthasarathi...');
        const parthasarathiRecords = await Sales.find({
            customerName: /partha/i
        }).sort({ date: -1 }).limit(5);

        console.log(`Found ${parthasarathiRecords.length} records:`);
        parthasarathiRecords.forEach((record, index) => {
            console.log(`  ${index + 1}. Name: ${record.customerName}`);
            console.log(`     Type: ${record.paymentType}, Status: ${record.paymentStatus}`);
            console.log(`     Amount: ₹${record.amount}, Date: ${record.date.toLocaleDateString()}\n`);
        });

        // Also check for any unpaid records
        console.log('\n🔍 Checking all unpaid (Kadan) records...');
        const unpaidRecords = await Sales.find({
            paymentType: 'Kadan',
            paymentStatus: 'Unpaid'
        }).sort({ date: -1 }).limit(10);

        console.log(`Found ${unpaidRecords.length} unpaid records:`);
        unpaidRecords.forEach((record, index) => {
            console.log(`  ${index + 1}. ${record.customerName || 'No name'}`);
            console.log(`     Phone: ${record.contactNumber || 'N/A'}`);
            console.log(`     Amount: ₹${record.amount}, Date: ${record.date.toLocaleDateString()}\n`);
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkCustomers();

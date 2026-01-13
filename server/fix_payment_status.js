/**
 * URGENT FIX: Update payment status for Jeyanthi and Parthasarathi
 * This script quickly updates their paymentType from 'Kadan' to 'Paid'
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Define Sales Schema (matching your main model)
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

async function fixSalesPaymentStatus() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database');

        // Find and update Jeyanthi's records
        const jeyanthiUpdate = await Sales.updateMany(
            {
                customerName: /Jeyanthi/i,
                paymentType: 'Kadan',
                paymentStatus: 'Unpaid'
            },
            {
                $set: {
                    paymentType: 'Cash',
                    paymentStatus: 'Paid',
                    settledDate: new Date(),
                    settledBy: 'Manual Fix - Admin'
                }
            }
        );
        console.log(`✅ Updated ${jeyanthiUpdate.modifiedCount} records for Jeyanthi`);

        // Find and update Parthasarathi's records
        const parthasarathiUpdate = await Sales.updateMany(
            {
                customerName: /Parthasarathi/i,
                paymentType: 'Kadan',
                paymentStatus: 'Unpaid'
            },
            {
                $set: {
                    paymentType: 'Cash',
                    paymentStatus: 'Paid',
                    settledDate: new Date(),
                    settledBy: 'Manual Fix - Admin'
                }
            }
        );
        console.log(`✅ Updated ${parthasarathiUpdate.modifiedCount} records for Parthasarathi`);

        console.log('');
        console.log('🎉 ALL DONE! Red bubbles are now green (Paid)');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixSalesPaymentStatus();

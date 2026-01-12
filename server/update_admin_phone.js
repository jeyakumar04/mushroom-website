const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function updateAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await Admin.updateOne(
            { username: 'admin' },
            { $set: { phoneNumber: '9500591897' } }
        );

        console.log('Update result:', result);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateAdmin();

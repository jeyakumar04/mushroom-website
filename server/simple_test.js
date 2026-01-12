const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

console.log('Connecting to:', uri.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(uri)
    .then(() => {
        console.log('✅ Connected!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Failed!');
        console.error(err);
        process.exit(1);
    });

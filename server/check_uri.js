const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.log('❌ MONGODB_URI is UNDEFINED');
} else {
    // Obscure password for safety
    const obscured = uri.replace(/:([^@]+)@/, ':****@');
    console.log('✅ MONGODB_URI found:', obscured);

    // Check for common issues
    if (!uri.startsWith('mongodb+srv://')) {
        console.log('⚠️ Warning: URI does not start with mongodb+srv://');
    }
    if (uri.includes(' ')) {
        console.log('⚠️ Warning: URI contains spaces');
    }
}

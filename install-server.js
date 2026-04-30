const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('--- TJP Mushroom: Custom Install Script ---');

// 1. Detect Environment
if (process.env.VERCEL) {
    console.log('⚠️  Vercel detected. Skipping server dependencies install to prevent build/deployment issues.');
    process.exit(0);
}

// 2. Define Paths
const serverDir = path.join(__dirname, 'server');

// 3. Install Server Dependencies
if (fs.existsSync(serverDir)) {
    console.log('📂 Server directory found. Installing dependencies for Backend (Koyeb/Local)...');
    try {
        console.log('👉 Running "npm install" in ./server...');
        execSync('npm install', { cwd: serverDir, stdio: 'inherit' });
        console.log('✅ Server dependencies installed successfully.');
    } catch (error) {
        console.error('❌ Failed to install server dependencies:', error.message);
        process.exit(1);
    }
} else {
    console.log('ℹ️  No server directory found. Skipping.');
}

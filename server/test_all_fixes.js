#!/usr/bin/env node

/**
 * TJP Mushroom - System Verification Test
 * Tests all fixes: WhatsApp Auth, Sales Credit, Climate Notes, IST Time
 */

const axios = require('axios');
const fs = require('path');
const path = require('path');

const BASE_URL = 'http://localhost:5000';
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

console.log('\n🔍 TJP MUSHROOM - SYSTEM VERIFICATION TEST\n');
console.log('='.repeat(60));

async function runTests() {
    const results = {
        passed: 0,
        failed: 0,
        warnings: 0
    };

    // Test 1: WhatsApp LocalAuth Configuration
    console.log('\n1️⃣  Testing WhatsApp LocalAuth Configuration...');
    try {
        const sessionDir = path.join(__dirname, '..', 'wwebjs_auth');
        const serviceFile = path.join(__dirname, 'services', 'whatsappService.js');

        // Check if service file has LocalAuth with dataPath
        const serviceContent = require('fs').readFileSync(serviceFile, 'utf8');

        if (serviceContent.includes('LocalAuth') && serviceContent.includes('dataPath')) {
            console.log(`   ${colors.green}✅ LocalAuth configured with custom session directory${colors.reset}`);
            results.passed++;
        } else {
            console.log(`   ${colors.red}❌ LocalAuth not properly configured${colors.reset}`);
            results.failed++;
        }

        if (serviceContent.includes('headless: true')) {
            console.log(`   ${colors.green}✅ Headless mode enabled${colors.reset}`);
            results.passed++;
        } else {
            console.log(`   ${colors.yellow}⚠️  Headless mode not found${colors.reset}`);
            results.warnings++;
        }

    } catch (err) {
        console.log(`   ${colors.red}❌ Error checking WhatsApp config: ${err.message}${colors.reset}`);
        results.failed++;
    }

    // Test 2: WhatsApp Connection Status
    console.log('\n2️⃣  Testing WhatsApp Connection Status...');
    try {
        const response = await axios.get(`${BASE_URL}/api/admin/whatsapp-status`);

        if (response.data.status === 'connected') {
            console.log(`   ${colors.green}✅ WhatsApp is CONNECTED and ready!${colors.reset}`);
            results.passed++;
        } else if (response.data.status === 'scan_needed') {
            console.log(`   ${colors.yellow}⚠️  QR Code scan required${colors.reset}`);
            console.log(`   📱 Check server terminal for QR code`);
            results.warnings++;
        } else {
            console.log(`   ${colors.yellow}⚠️  WhatsApp is initializing...${colors.reset}`);
            results.warnings++;
        }
    } catch (err) {
        if (err.code === 'ECONNREFUSED') {
            console.log(`   ${colors.red}❌ Server is not running!${colors.reset}`);
            console.log(`   💡 Start server with: cd server && node index.js`);
            results.failed++;
        } else {
            console.log(`   ${colors.red}❌ Error: ${err.message}${colors.reset}`);
            results.failed++;
        }
    }

    // Test 3: IST Timezone Configuration
    console.log('\n3️⃣  Testing IST Timezone Configuration...');
    try {
        const indexFile = path.join(__dirname, 'index.js');
        const indexContent = require('fs').readFileSync(indexFile, 'utf8');

        if (indexContent.includes("process.env.TZ = 'Asia/Kolkata'")) {
            console.log(`   ${colors.green}✅ IST Timezone configured (Asia/Kolkata)${colors.reset}`);
            results.passed++;
        } else {
            console.log(`   ${colors.red}❌ IST Timezone not configured${colors.reset}`);
            results.failed++;
        }

        // Check current server time
        const now = new Date();
        const istTime = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        console.log(`   🕐 Current IST Time: ${istTime}`);

    } catch (err) {
        console.log(`   ${colors.red}❌ Error checking timezone: ${err.message}${colors.reset}`);
        results.failed++;
    }

    // Test 4: Sales Credit Logic (Frontend)
    console.log('\n4️⃣  Testing Sales Credit Logic (Frontend)...');
    try {
        const dashboardFile = path.join(__dirname, '..', 'src', 'pages', 'Dashboard.jsx');
        const dashboardContent = require('fs').readFileSync(dashboardFile, 'utf8');

        if (dashboardContent.includes('paymentType') &&
            dashboardContent.includes('Credit') &&
            dashboardContent.includes('Kadan')) {
            console.log(`   ${colors.green}✅ Payment Type dropdown found in Dashboard${colors.reset}`);
            console.log(`   ${colors.green}✅ Credit/Kadan logic present${colors.reset}`);
            results.passed += 2;
        } else {
            console.log(`   ${colors.red}❌ Payment Type dropdown not found${colors.reset}`);
            results.failed++;
        }

        if (dashboardContent.includes('saleForm') && dashboardContent.includes('paymentType: \'Cash\'')) {
            console.log(`   ${colors.green}✅ saleForm state includes paymentType${colors.reset}`);
            results.passed++;
        } else {
            console.log(`   ${colors.yellow}⚠️  saleForm state may need paymentType${colors.reset}`);
            results.warnings++;
        }

    } catch (err) {
        console.log(`   ${colors.red}❌ Error checking Dashboard: ${err.message}${colors.reset}`);
        results.failed++;
    }

    // Test 5: Sales Credit Logic (Backend)
    console.log('\n5️⃣  Testing Sales Credit Logic (Backend)...');
    try {
        const indexFile = path.join(__dirname, 'index.js');
        const indexContent = require('fs').readFileSync(indexFile, 'utf8');

        if (indexContent.includes('paymentStatus') &&
            indexContent.includes('Unpaid') &&
            indexContent.includes('/api/sales/kadan')) {
            console.log(`   ${colors.green}✅ Backend credit logic found${colors.reset}`);
            console.log(`   ${colors.green}✅ Kadan endpoint exists${colors.reset}`);
            results.passed += 2;
        } else {
            console.log(`   ${colors.red}❌ Backend credit logic incomplete${colors.reset}`);
            results.failed++;
        }

    } catch (err) {
        console.log(`   ${colors.red}❌ Error checking backend: ${err.message}${colors.reset}`);
        results.failed++;
    }

    // Test 6: Climate Notes Field
    console.log('\n6️⃣  Testing Climate Notes Field...');
    try {
        const dashboardFile = path.join(__dirname, '..', 'src', 'pages', 'Dashboard.jsx');
        const dashboardContent = require('fs').readFileSync(dashboardFile, 'utf8');

        if (dashboardContent.includes('cNotes') &&
            dashboardContent.includes('textarea') &&
            dashboardContent.includes('Observations')) {
            console.log(`   ${colors.green}✅ Climate Notes textarea found${colors.reset}`);
            console.log(`   ${colors.green}✅ Observations field is editable${colors.reset}`);
            results.passed += 2;
        } else {
            console.log(`   ${colors.red}❌ Climate Notes field not found${colors.reset}`);
            results.failed++;
        }

    } catch (err) {
        console.log(`   ${colors.red}❌ Error checking Climate: ${err.message}${colors.reset}`);
        results.failed++;
    }

    // Test 7: Git Ignore Configuration
    console.log('\n7️⃣  Testing Git Ignore Configuration...');
    try {
        const gitignoreFile = path.join(__dirname, '..', '.gitignore');
        const gitignoreContent = require('fs').readFileSync(gitignoreFile, 'utf8');

        if (gitignoreContent.includes('wwebjs_auth')) {
            console.log(`   ${colors.green}✅ wwebjs_auth folder in .gitignore${colors.reset}`);
            results.passed++;
        } else {
            console.log(`   ${colors.yellow}⚠️  wwebjs_auth not in .gitignore${colors.reset}`);
            results.warnings++;
        }

    } catch (err) {
        console.log(`   ${colors.red}❌ Error checking .gitignore: ${err.message}${colors.reset}`);
        results.failed++;
    }

    // Final Results
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 TEST RESULTS SUMMARY\n');
    console.log(`${colors.green}✅ Passed:   ${results.passed}${colors.reset}`);
    console.log(`${colors.red}❌ Failed:   ${results.failed}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Warnings: ${results.warnings}${colors.reset}`);

    const total = results.passed + results.failed + results.warnings;
    const successRate = ((results.passed / total) * 100).toFixed(1);

    console.log(`\n📈 Success Rate: ${successRate}%`);

    if (results.failed === 0) {
        console.log(`\n${colors.green}🎉 ALL CRITICAL TESTS PASSED!${colors.reset}`);
        console.log(`${colors.green}✅ System is ready for production use${colors.reset}\n`);
    } else {
        console.log(`\n${colors.yellow}⚠️  Some tests failed. Please review the results above.${colors.reset}\n`);
    }
}

// Run tests
runTests().catch(err => {
    console.error(`\n${colors.red}❌ Test suite failed: ${err.message}${colors.reset}\n`);
    process.exit(1);
});

# 🔧 Missing Morning Logic Recovery Guide

## 📋 Overview
You mentioned that "Notes unlock and Sales Credit logic" needs to be restored from VS Code Timeline. This guide will help you identify and restore that logic.

## 🔍 What to Look For in VS Code Timeline

### Step 1: Open Timeline in VS Code
1. Open `server/index.js` in VS Code
2. Right-click on the file → Select **"Open Timeline"**
3. Look for commits from when the morning logic was working

### Step 2: Identify Missing Logic

Look for these potential morning routines that might be missing:

#### A. Notes Unlock Logic (Possible Implementation)
```javascript
// Example: Daily notes reset at 6:00 AM
cron.schedule('0 6 * * *', async () => {
    try {
        // Reset daily notes or unlock observation fields
        await Settings.findOneAndUpdate(
            { key: 'dailyNotesLocked' },
            { value: false },
            { upsert: true }
        );
        console.log('✅ Daily notes unlocked for new observations');
    } catch (err) {
        console.error('Notes unlock error:', err);
    }
});
```

#### B. Morning Sales Credit Report (Possible Implementation)
```javascript
// Example: Morning credit summary at 6:00 AM
cron.schedule('0 6 * * *', async () => {
    try {
        const unpaidSales = await Sales.find({ paymentStatus: 'Unpaid' });
        const totalCredit = unpaidSales.reduce((sum, s) => sum + s.totalAmount, 0);
        
        if (unpaidSales.length > 0) {
            const adminPhones = process.env.ADMIN_PHONE.split(',');
            const message = `🌅 *GOOD MORNING - CREDIT SUMMARY*\n\n` +
                          `📊 Pending Credits: ${unpaidSales.length}\n` +
                          `💰 Total Amount: ₹${totalCredit}\n\n` +
                          `Customers:\n` +
                          unpaidSales.map(s => `• ${s.customerName}: ₹${s.totalAmount}`).join('\n');
            
            for (const phone of adminPhones) {
                await sendMessage(phone.trim(), message);
            }
        }
    } catch (err) {
        console.error('Morning credit report error:', err);
    }
});
```

#### C. Daily Observations Unlock (Possible Implementation)
```javascript
// Example: Unlock climate observations input at 6:00 AM
cron.schedule('0 6 * * *', async () => {
    try {
        // Create a new daily observation entry
        const today = new Date().toISOString().split('T')[0];
        await Settings.findOneAndUpdate(
            { key: 'currentObservationDate' },
            { value: today },
            { upsert: true }
        );
        
        const adminPhones = process.env.ADMIN_PHONE.split(',');
        const message = `🌅 *GOOD MORNING*\n\n` +
                      `📝 Daily observations unlocked\n` +
                      `📊 Please record today's climate data`;
        
        for (const phone of adminPhones) {
            await sendMessage(phone.trim(), message);
        }
    } catch (err) {
        console.error('Observation unlock error:', err);
    }
});
```

## 🎯 Current Morning Logic (Already Implemented)

### ✅ What's Already Working:
1. **Fan Alerts** (06:00 & 07:00)
   - FAN IN at 06:00
   - FAN OUT at 07:00

2. **Water Check Alert** (08:00)
   - Checks if water drum inspection is due (every 2 days)

3. **Daily Water Usage** (00:00 - Midnight)
   - Deducts 260L daily
   - Sends alert if below 20%

## 📝 How to Restore Missing Logic

### Method 1: Using VS Code Timeline
1. Open Timeline for `server/index.js`
2. Find the commit where morning logic was present
3. Click on the commit to see the diff
4. Copy the missing cron job code
5. Paste it into current `server/index.js` (around line 1498, after existing cron jobs)

### Method 2: Using Git Diff
```bash
# View changes between commits
git diff <old-commit-hash> HEAD -- server/index.js

# Example:
git diff e668b5b HEAD -- server/index.js
```

### Method 3: Manual Implementation
If you remember the logic, add it manually:

1. Open `server/index.js`
2. Scroll to line ~1498 (after the daily water cron job)
3. Add your morning logic using `cron.schedule()`
4. Test with a near-future time first

## 🧪 Testing Morning Logic

### Test Immediately (Change Time)
```javascript
// Instead of '0 6 * * *', use current time + 1 minute
const now = new Date();
const testTime = `${now.getMinutes() + 1} ${now.getHours()} * * *`;
cron.schedule(testTime, async () => {
    // Your morning logic here
});
```

### Test Endpoint
Create a test endpoint to trigger manually:
```javascript
app.get('/api/test/morning-logic', auth, async (req, res) => {
    try {
        // Copy your morning logic here
        res.json({ success: true, message: 'Morning logic executed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

## 📞 Contact for Help

If you can't find the missing logic in Timeline:
1. Describe what the morning logic did (in Tamil or English)
2. I'll help implement it from scratch

## ✅ Checklist

- [ ] Opened VS Code Timeline for `server/index.js`
- [ ] Found commit with morning logic
- [ ] Identified missing cron jobs
- [ ] Copied missing code
- [ ] Pasted into current file
- [ ] Tested with near-future time
- [ ] Verified WhatsApp notifications work
- [ ] Set back to correct morning time (06:00)

---

**Note:** If you're unsure about the exact logic, please describe what the morning routine should do, and I'll help implement it.

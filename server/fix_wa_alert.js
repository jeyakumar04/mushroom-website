const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldCatch = `        } catch (err) {
            console.error('Bill Error:', err);
            setBillSentStatus('error');
            setTimeout(() => setBillSentStatus(null), 5000);
            alert('❌ Bill generation/sending failed: ' + err.message);
        } finally {`;

const newCatch = `        } catch (err) {
            console.error('Bill Error:', err);
            setBillSentStatus('error');
            setTimeout(() => setBillSentStatus(null), 5000);
            
            // 🚀 TJP ANTI-GRAVITY: Show manual fallback card if data exists
            if (sale) {
                const totalBalance = (kadanList || []).filter(k => k.contactNumber === sale.contactNumber).reduce((sum, s) => sum + s.totalAmount, 0);
                setWaPrompt({
                    customerName: sale.customerName,
                    amount: sale.totalAmount,
                    balance: totalBalance,
                    phone: sale.contactNumber
                });
            }
        } finally {`;

if (content.indexOf(`alert('❌ Bill generation/sending failed: ' + err.message);`) !== -1) {
    // Replace with a simpler slice-based replacement if possible, or string.replace
    content = content.replace(`alert('❌ Bill generation/sending failed: ' + err.message);`, `
            // 🚀 TJP ANTI-GRAVITY: Show manual fallback card if data exists
            if (sale) {
                const totalBalance = (kadanList || []).filter(k => k.contactNumber === sale.contactNumber).reduce((sum, s) => sum + s.totalAmount, 0);
                setWaPrompt({
                    customerName: sale.customerName,
                    amount: sale.totalAmount,
                    balance: totalBalance,
                    phone: sale.contactNumber
                });
            }`);
    fs.writeFileSync(filePath, content);
    console.log('✅ Successfully removed the alert and added fallback logic!');
} else {
    console.error('❌ Could not find the alert line to replace.');
}

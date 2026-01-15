const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// The error happens in the catch block where I tried to set billLink: result.imageUrl
// In the catch block, result doesn't exist. I should set it to null.

content = content.replace(
    /billLink:\s*result\.imageUrl\s*}\);(\s*})\s*catch\s*\(err\)\s*{\s*console\.error\('Bill Error:',\s*err\);\s*setBillSentStatus\('error'\);\s*setTimeout\(\(\)\s*=>\s*setBillSentStatus\(null\),\s*5000\);\s*\/\/\s*🚀\s*TJP\s*ANTI-GRAVITY:\s*Show\s*manual\s*fallback\s*card\s*if\s*data\s*exists\s*if\s*\(sale\)\s*{\s*const\s*totalBalance\s*=\s*\(kadanList\s*\|\|\s*\[\]\)\.filter\(k\s*=>\s*k\.contactNumber\s*===\s*sale\.contactNumber\)\.reduce\(\(sum,\s*s\)\s*=>\s*sum\s*\+\s*s\.totalAmount,\s*0\);\s*setWaPrompt\({\s*customerName:\s*sale\.customerName,\s*amount:\s*sale\.totalAmount,\s*balance:\s*totalBalance,\s*phone:\s*sale\.contactNumber,\s*billLink:\s*result\.imageUrl\s*}\);\s*}/,
    `billLink: result.imageUrl
            });
        } catch (err) {
            console.error('Bill Error:', err);
            setBillSentStatus('error');
            setTimeout(() => setBillSentStatus(null), 5000);
            
            if (sale) {
                const totalBalance = (kadanList || []).filter(k => k.contactNumber === sale.contactNumber).reduce((sum, s) => sum + s.totalAmount, 0);
                setWaPrompt({
                    customerName: sale.customerName,
                    amount: sale.totalAmount,
                    balance: totalBalance,
                    phone: sale.contactNumber,
                    billLink: null // Setting to null in case of error
                });
            }
        }`
);

// Actually, I'll just look for 'billLink: result.imageUrl' inside the catch block if any and replace it
const lines = content.split('\n');
let fixedLines = [];
let inCatch = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('catch (err)')) inCatch = true;
    if (inCatch && lines[i].includes('billLink: result.imageUrl')) {
        fixedLines.push(lines[i].replace('result.imageUrl', 'null'));
    } else {
        fixedLines.push(lines[i]);
    }
}

fs.writeFileSync(filePath, fixedLines.join('\n'));
console.log('✅ Corrected the undefined result error in Dashboard.jsx!');

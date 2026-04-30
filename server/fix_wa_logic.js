const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Update success block
content = content.replace(
    /setWaPrompt\({\s*customerName:\s*sale\.customerName,\s*amount:\s*sale\.totalAmount,\s*balance:\s*totalBalance,\s*phone:\s*sale\.contactNumber\s*}\);/g,
    `setWaPrompt({
                customerName: sale.customerName,
                amount: sale.totalAmount,
                balance: totalBalance,
                phone: sale.contactNumber,
                billLink: result.imageUrl
            });`
);

// Update catch block
content = content.replace(
    /if\s*\(sale\)\s*{\s*const\s*totalBalance\s*=\s*\(kadanList\s*\|\|\s*\[\]\)\.filter\(k\s*=>\s*k\.contactNumber\s*===\s*sale\.contactNumber\)\.reduce\(\(sum,\s*s\)\s*=>\s*sum\s*\+\s*s\.totalAmount,\s*0\);\s*setWaPrompt\({\s*customerName:\s*sale\.customerName,\s*amount:\s*sale\.totalAmount,\s*balance:\s*totalBalance,\s*phone:\s*sale\.contactNumber\s*}\);\s*}/,
    `if (sale) {
                const totalBalance = (kadanList || []).filter(k => k.contactNumber === sale.contactNumber).reduce((sum, s) => sum + s.totalAmount, 0);
                setWaPrompt({
                    customerName: sale.customerName,
                    amount: sale.totalAmount,
                    balance: totalBalance,
                    phone: sale.contactNumber,
                    billLink: null
                });
            }`
);

fs.writeFileSync(filePath, content);
console.log('✅ Successfully updated Dashboard.jsx logic!');

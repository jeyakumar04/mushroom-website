const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Update for preview
content = content.replace(
    /customerName:\s*waPrompt\.customerName}\s*<\/p>\s*<div\s*className="flex\s*justify-between\s*items-center/,
    `customerName: waPrompt.customerName}</p>

                        {waPrompt.billLink && (
                            <div className="mb-4 rounded-2xl overflow-hidden border-2 border-white/50 shadow-inner">
                                <img 
                                    src={waPrompt.billLink} 
                                    alt="Digital Bill Preview" 
                                    className="w-full h-auto object-cover max-h-32 opacity-90"
                                    onError={(e) => e.target.style.display='none'}
                                />
                            </div>
                        )}

                        <div className="flex justify-between items-center`
);

// Update for link
content = content.replace(
    /`\*TJP Mushroom - Bill Receipt\* 🍄\\n-----------------------------\\nHello \${waPrompt\.customerName},\\nYour bill amount: ₹\${waPrompt\.amount}\\nPending Balance \(KADAN\): ₹\${waPrompt\.balance}\\n\\nThank you for choosing TJP Farming!\\nVisit: tjpmushroom\.com`/,
    `\`*TJP Mushroom - Bill Receipt* 🍄\\n-----------------------------\\nHello \${waPrompt.customerName},\\nYour bill amount: ₹\${waPrompt.amount}\\nPending Balance (KADAN): ₹\${waPrompt.balance}\\n\\n\${waPrompt.billLink ? \`View Digital Bill: \${window.location.protocol}//\${window.location.host}\${waPrompt.billLink}\\n\\n\` : ''}Thank you for choosing TJP Farming!\\nVisit: tjpmushroom.com\``
);

fs.writeFileSync(filePath, content);
console.log('✅ Successfully updated Dashboard.jsx modal with preview!');

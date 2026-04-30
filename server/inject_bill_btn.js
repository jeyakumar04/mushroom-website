const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// The line we found: onClick={() => setEditingSalesId(sale._id)}
// We want to wrap it in our div with the BILL button.

const tagToLookFor = `onClick={() => setEditingSalesId(sale._id)}`;

if (content.includes(tagToLookFor)) {
    // Let's find the start of the <button and end of the </button> around this
    const lines = content.split('\n');
    let updatedLines = [];
    let replaced = false;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(tagToLookFor) && !replaced) {
            // Find the button boundaries
            let startIdx = i;
            while (startIdx >= 0 && !lines[startIdx].includes('<button')) startIdx--;

            let endIdx = i;
            while (endIdx < lines.length && !lines[endIdx].includes('</button>')) endIdx++;

            if (startIdx >= 0 && endIdx < lines.length) {
                const indent = lines[startIdx].match(/^\s*/)[0];
                const replacement = `${indent}<div className="flex items-center gap-2">\n${indent}    <button onClick={() => handleSendBill(sale)} className="text-green-600 font-black text-[10px] hover:underline">BILL</button>\n${lines.slice(startIdx, endIdx + 1).join('\n')}\n${indent}</div>`;

                updatedLines.push(replacement);
                i = endIdx; // Skip to end of button
                replaced = true;
                continue;
            }
        }
        updatedLines.push(lines[i]);
    }

    if (replaced) {
        fs.writeFileSync(filePath, updatedLines.join('\n'));
        console.log('✅ Successfully updated Dashboard.jsx using line-by-line search!');
    } else {
        console.error('❌ Found the text but could not identify full button block.');
    }
} else {
    console.error('❌ Could not find the EDIT button tag.');
}

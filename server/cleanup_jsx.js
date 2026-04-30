const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
let newLines = [];
let skipLine1685 = false;
let skipLine1688 = false;

for (let i = 0; i < lines.length; i++) {
    // Check for the specific broken structure
    if (lines[i].includes(') : (') && lines[i + 1] && lines[i + 1].trim() === '<button' && lines[i + 2] && lines[i + 2].includes('<div className="flex items-center gap-2">')) {
        newLines.push(lines[i]);
        // Skip the next line which is the dangling <button
        i++;
        continue;
    }

    if (lines[i].includes('BILL</button>') && lines[i + 1] && lines[i + 1].trim() === '<button' && lines[i + 2] && lines[i + 2].includes('onClick={() => setEditingSalesId(sale._id)}')) {
        newLines.push(lines[i]);
        // Skip the next line which is the dangling <button
        i++;
        continue;
    }

    newLines.push(lines[i]);
}

fs.writeFileSync(filePath, newLines.join('\n'));
console.log('✅ Successfully cleaned up the broken JSX tags!');

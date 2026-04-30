const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
let fixedLines = [];
let skipIndices = new Set();

// Find the duplicated block
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("document.getElementById('closeWaPopup').onclick") && i > 500) {
        // This is likely the duplicate
        skipIndices.add(i);
        skipIndices.add(i + 1);
        skipIndices.add(i + 2);
        skipIndices.add(i + 3); // The extra };
    }
}

for (let i = 0; i < lines.length; i++) {
    if (!skipIndices.has(i)) {
        fixedLines.push(lines[i]);
    }
}

fs.writeFileSync(filePath, fixedLines.join('\n'));
console.log('✅ Successfully removed the duplicated syntax block!');

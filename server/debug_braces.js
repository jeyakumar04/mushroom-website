const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
console.log('Total lines:', lines.length);

let depth = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Ignore braces inside strings/backticks (simplified check)
    if (line.includes('`') || line.includes("'") || line.includes('"')) {
        // Skip complex lines for this simple check
    } else {
        depth += (line.split('{').length - 1);
        depth -= (line.split('}').length - 1);
    }

    if (depth < 0) {
        console.log('UNEXPECTED CLOSING AT LINE', i + 1, ':', line);
        depth = 0; // Reset to continue
    }
}
console.log('Final depth:', depth);

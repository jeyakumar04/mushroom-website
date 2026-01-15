const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = "const handleSaleSubmit = async (e) => {";
const insertion = `        document.getElementById('closeWaPopup').onclick = () => {
            document.body.removeChild(popup);
        };
    };

`;

const parts = content.split(target);
if (parts.length > 1) {
    // We want to insert it before the last handleSaleSubmit (there's only one in this context)
    // But let's check if the previous lines are already closing something
    let before = parts[0].trimEnd();
    if (!before.endsWith("};")) {
        // It definitely needs closing
        content = before + "\n" + insertion + target + parts.slice(1).join(target);
        fs.writeFileSync(filePath, content);
        console.log('✅ Successfully fixed the syntax by inserting missing braces!');
    } else {
        console.log('ℹ️ Braces might already be there, checking...');
    }
} else {
    console.log('❌ Could not find the target string');
}

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
let fixedLines = [];
let foundStart = false;

for (let i = 0; i < lines.length; i++) {
    fixedLines.push(lines[i]);

    // Check if we are at the end of waRedirectBtn.onclick
    if (lines[i].includes("document.body.removeChild(popup);") && lines[i + 1] && lines[i + 1].trim() === "};" && lines[i + 2] && lines[i + 2].trim() === "" && lines[i + 6] && lines[i + 6].includes("handleSaleSubmit")) {
        // We are in the broken gap
        fixedLines.push("        };");
        fixedLines.push("");
        fixedLines.push("        document.getElementById('closeWaPopup').onclick = () => {");
        fixedLines.push("            document.body.removeChild(popup);");
        fixedLines.push("        };");
        fixedLines.push("    };");

        // Skip the empty lines until handleSaleSubmit
        while (i + 1 < lines.length && !lines[i + 1].includes("handleSaleSubmit")) {
            i++;
        }
    }
}

fs.writeFileSync(filePath, fixedLines.join('\n'));
console.log('✅ Corrected the missing closing braces in handleSalesAndBill!');

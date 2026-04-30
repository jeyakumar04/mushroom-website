const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = `                                                             ) : (
                                                                 <div className="flex items-center gap-2">
                                                                     <button onClick={() => handleSendBill(sale)} className="text-green-600 font-black text-[10px] hover:underline">BILL</button>
                                                                     onClick={() => setEditingSalesId(sale._id)}
                                                                     className="text-blue-500 font-black text-[10px] hover:underline"
                                                                 >
                                                                     EDIT
                                                                 </button>
                                                                 </div>
                                                             )}`;

const replacement = `                                                             ) : (
                                                                 <div className="flex items-center gap-2">
                                                                     <button onClick={() => handleSendBill(sale)} className="text-green-600 font-black text-[10px] hover:underline">BILL</button>
                                                                     <button
                                                                         onClick={() => setEditingSalesId(sale._id)}
                                                                         className="text-blue-500 font-black text-[10px] hover:underline"
                                                                     >
                                                                         EDIT
                                                                     </button>
                                                                 </div>
                                                             )`;

// Use a more robust check - find the lines and replace them
const lines = content.split('\n');
let startIndex = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(') : (') && i + 1 < lines.length && lines[i + 1].includes('flex items-center gap-2')) {
        startIndex = i;
        break;
    }
}

if (startIndex !== -1) {
    // Find the end index (the next ')}' after startIndex)
    let endIndex = -1;
    for (let j = startIndex; j < lines.length; j++) {
        if (lines[j].trim() === ')}') {
            endIndex = j;
            break;
        }
    }

    if (endIndex !== -1) {
        console.log(`Found block from line ${startIndex + 1} to ${endIndex + 1}`);
        const newLines = [
            ...lines.slice(0, startIndex + 1),
            `                                                                 <div className="flex items-center gap-2">`,
            `                                                                     <button onClick={() => handleSendBill(sale)} className="text-green-600 font-black text-[10px] hover:underline">BILL</button>`,
            `                                                                     <button`,
            `                                                                         onClick={() => setEditingSalesId(sale._id)}`,
            `                                                                         className="text-blue-500 font-black text-[10px] hover:underline"`,
            `                                                                     >`,
            `                                                                         EDIT`,
            `                                                                     </button>`,
            `                                                                 </div>`,
            ...lines.slice(endIndex)
        ];
        fs.writeFileSync(filePath, newLines.join('\n'));
        console.log('✅ Successfully fixed the JSX structure in Dashboard.jsx');
    } else {
        console.error('❌ Could not find the end of the block.');
    }
} else {
    console.error('❌ Could not find the start of the block.');
}

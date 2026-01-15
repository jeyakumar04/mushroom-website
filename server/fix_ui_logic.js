const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix Button Label and Color in the form
content = content.replace(
    /className="w-full bg-green-600 text-white font-black uppercase py-4 md:py-6 rounded-xl md:rounded-2xl shadow-xl hover:bg-green-700 transition-all text-sm md:text-lg"\s*>\s*Complete Sale & Generate Bill/g,
    `className="w-full bg-[#25D366] text-white font-black uppercase py-5 md:py-7 rounded-2xl md:rounded-[30px] shadow-[0_15px_30px_rgba(37,211,102,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all text-base md:text-xl border-4 border-white"\n                                    >\n                                        RECORD SALE & COPY BILL`
);

// 2. Remove the duplicate bill call (handleSendBill) from handleSaleSubmit
content = content.replace(
    /\/\/ Still generate the image bill in background if needed\s*handleSendBill\(data\.sale,\s*data\.loyaltyUpdate\);/g,
    `// 🚀 Duplication removed to solve "same bill" issue`
);

// 3. Fix the popup styles and success notification in handleSalesAndBill
content = content.replace(
    /const handleSalesAndBill = async \(saleData\) => {/g,
    `const handleSalesAndBill = async (saleData) => {
        setBillSentStatus('success');
        setTimeout(() => setBillSentStatus(null), 4000);`
);

// Fix the double style attribute and colors in the popup
content = content.replace(
    /<div style="background: white; w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"\s*style="width: 60px; height: 60px; border-radius: 50%; background: white; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">/g,
    `<div style="width: 70px; height: 70px; border-radius: 50%; background: white; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; shadow: 0 10px 20px rgba(0,0,0,0.1); border: 4px solid #f0fdf4;">`
);

// Fix Header Color in popup
content = content.replace(
    /<h2 style="color: #022C22; margin-bottom: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;">Bill Generated!<\/h2>/g,
    `<h2 style="color: #1b4332; margin-bottom: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: -1.5px;">RECORDED SUCCESSFULLY! 🍄</h2>`
);

fs.writeFileSync(filePath, content);
console.log('✅ Successfully fixed duplicate bill and button colors!');

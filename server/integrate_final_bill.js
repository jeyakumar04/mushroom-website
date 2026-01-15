const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add the handleSalesAndBill function and the styleSheet logic
const handleSalesAndBillCode = `
    const handleSalesAndBill = async (saleData) => {
        const { name, phone, amount, balance, loyaltyPoints } = saleData;
        const loyaltyMsg = \`Loyalty: \${loyaltyPoints} pockets purchased. \${10 - (loyaltyPoints % 10)} more for 1 FREE!\`;
        
        const finalBillText = \`
*TJP Mushroom Farming* 🍄
--------------------------
Customer: \${name}
Amount: ₹\${amount}
Status: \${balance > 0 ? 'KADAN (Pending: ₹' + balance + ')' : 'PAID'}
--------------------------
\${loyaltyMsg}
--------------------------
📍 Pulimalaipatty, Melur, Madurai.
📞 +91 9159659711 | +91 9500591897
        \`.trim();

        try {
            await navigator.clipboard.writeText(finalBillText);
            console.log("Bill data copied!");
        } catch (err) {
            console.warn("Copy failed!");
        }

        const popup = document.createElement('div');
        popup.id = 'tjp-wa-popup';
        popup.style.cssText = \`
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: #CBCCCB; padding: 30px; border-radius: 40px;
            box-shadow: 0 30px 70px rgba(0,0,0,0.6); z-index: 99999;
            text-align: center; border: 6px solid white;
            animation: floatAnim 3s ease-in-out infinite;
            max-width: 350px; width: 90%; font-family: 'Outfit', sans-serif;
        \`;

        popup.innerHTML = \`
            <div style="background: white; w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" 
                 style="width: 60px; height: 60px; border-radius: 50%; background: white; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 30px;">🍄</span>
            </div>
            <h2 style="color: #022C22; margin-bottom: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;">Bill Generated!</h2>
            <p style="color: #444; font-weight: bold; font-size: 14px; margin-bottom: 20px;">
                Madurai Footer Added. <br/>
                <span style="color: #1b4332; background: rgba(255,255,255,0.5); padding: 2px 8px; border-radius: 5px;">CTRL + V</span> to paste in WhatsApp.
            </p>
            <button id="waRedirectBtn" style="
                background: #25D366; color: white; padding: 18px 30px;
                border: none; border-radius: 20px; font-weight: 900; 
                cursor: pointer; font-size: 16px; width: 100%;
                box-shadow: 0 10px 20px rgba(37,211,102,0.3);
                transition: all 0.3s;
            ">🚀 OPEN WHATSAPP CHAT</button>
            <button id="closeWaPopup" style="margin-top: 15px; background: transparent; border: none; color: #666; font-weight: bold; cursor: pointer; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">🚫 Close Prompt</button>
        \`;

        document.body.appendChild(popup);

        document.getElementById('waRedirectBtn').onclick = () => {
            const cleanPhone = phone.startsWith('91') ? phone : \`91\${phone}\`;
            const waUrl = \`https://web.whatsapp.com/send?phone=\${cleanPhone}\`;
            window.open(waUrl, '_blank');
            document.body.removeChild(popup);
        };

        document.getElementById('closeWaPopup').onclick = () => {
            document.body.removeChild(popup);
        };
    };
`;

// 2. Add the animation CSS logic
const styleSheetCode = `
    useEffect(() => {
        if (!document.getElementById('tjp-float-anim')) {
            const style = document.createElement('style');
            style.id = 'tjp-float-anim';
            style.innerHTML = \`
                @keyframes floatAnim {
                    0%, 100% { transform: translate(-50%, -52%); }
                    50% { transform: translate(-50%, -48%); }
                }
            \`;
            document.head.appendChild(style);
        }
    }, []);
`;

// Insert the handleSalesAndBill function after other handlers
if (content.indexOf('const handleSaleSubmit') !== -1) {
    const splitTag = 'const handleSaleSubmit = async (e) => {';
    const index = content.indexOf(splitTag);
    content = content.slice(0, index) + handleSalesAndBillCode + '\n' + content.slice(index);
}

// Insert the useEffect for animation
const useEffectTarget = 'useEffect(() => {';
const indexEF = content.indexOf(useEffectTarget);
if (indexEF !== -1) {
    content = content.slice(0, indexEF) + styleSheetCode + '\n' + content.slice(indexEF);
}

// Update handleSaleSubmit to call handleSalesAndBill
content = content.replace(
    /await handleSendBill\(data\.sale,\s*data\.loyaltyUpdate\);/g,
    `// 🚀 TJP ULTRA FIX: Call the Final Admin Bill Logic
                const totalKadan = (kadanList || []).filter(k => k.contactNumber === saleForm.contactNumber).reduce((sum, s) => sum + s.totalAmount, 0);
                await handleSalesAndBill({
                    name: saleForm.customerName,
                    phone: saleForm.contactNumber,
                    amount: saleForm.quantity * saleForm.pricePerUnit,
                    balance: totalKadan,
                    loyaltyPoints: (data.loyaltyUpdate?.totalLifetime || 0)
                });
                
                // Still generate the image bill in background if needed
                handleSendBill(data.sale, data.loyaltyUpdate);`
);

fs.writeFileSync(filePath, content);
console.log('✅ Successfully integrated the Final Admin Bill Logic into Dashboard.jsx!');

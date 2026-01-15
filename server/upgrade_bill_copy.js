const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Redefine handleSalesAndBill to handle Image Copy and Speed
const newHandleSalesAndBill = `
    const handleSalesAndBill = async (saleData, originalSale, loyaltyUpdate) => {
        setBillSentStatus('success');
        setTimeout(() => setBillSentStatus(null), 4000);
        const { name, phone, amount, balance, loyaltyPoints } = saleData;

        // 🚀 Prepare Hidden Bill Component for Image Generation
        setBillData({
            sale: { ...originalSale, pricePerPocket: originalSale.pricePerUnit },
            customer: {
                loyaltyCount: loyaltyUpdate?.currentCycle || 0,
                rewardsEarned: loyaltyUpdate?.freePocketsEarned || 0,
                totalLifetime: loyaltyUpdate?.totalLifetime || 0,
                reachedCycle: loyaltyUpdate?.reachedCycle || false
            }
        });

        // 🚀 Fast wait for render
        await new Promise(r => setTimeout(r, 300));

        // 🚀 Copy Bill Image to Clipboard
        try {
            const { toBlob } = await import('html-to-image');
            if (billRef.current) {
                const blob = await toBlob(billRef.current, { pixelRatio: 2, skipFonts: true });
                const item = new ClipboardItem({ "image/png": blob });
                await navigator.clipboard.write([item]);
                console.log("✅ Bill Image copied to clipboard!");
            }
        } catch (err) {
            console.warn("Image copy failed, falling back to text", err);
            const text = \`*TJP Mushroom Farming* 🍄\\n--------------------------\\nCustomer: \${name}\\nAmount: ₹\${amount}\\nStatus: \${balance > 0 ? 'KADAN' : 'PAID'}\\n--------------------------\\n📍 Pulimalaipatty, Madurai.\`;
            await navigator.clipboard.writeText(text);
        }

        const popup = document.createElement('div');
        popup.id = 'tjp-wa-popup';
        popup.style.cssText = \`
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: #CBCCCB; padding: 40px; border-radius: 40px;
            box-shadow: 0 40px 100px rgba(0,0,0,0.7); z-index: 99999;
            text-align: center; border: 8px solid white;
            animation: floatAnim 3s ease-in-out infinite;
            max-width: 400px; width: 90%; font-family: 'Inter', sans-serif;
        \`;

        popup.innerHTML = \`
            <div style="width: 80px; height: 80px; border-radius: 50%; background: #25D366; margin: 0 auto 25px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(37,211,102,0.4);">
                <span style="font-size: 40px; color: white;">✅</span>
            </div>
            <h2 style="color: #022C22; margin-bottom: 5px; font-weight: 900; text-transform: uppercase; font-size: 24px;">Bill Ready! 🍄</h2>
            <p style="color: #1b4332; font-weight: 800; font-size: 16px; margin-bottom: 25px; letter-spacing: -0.5px;">
                Image Copied to Clipboard. <br/>
                Just <span style="background: white; padding: 2px 10px; border-radius: 8px;">CTRL + V</span> in WhatsApp Chat!
            </p>
            <button id="waRedirectBtn" style="
                background: #022C22; color: white; padding: 18px 40px;
                border: none; border-radius: 25px; font-weight: 900; 
                cursor: pointer; font-size: 18px; width: 100%;
                box-shadow: 0 15px 30px rgba(0,0,0,0.2);
                transition: all 0.3s;
                text-transform: uppercase;
            ">Go to Customer Chat</button>
            <button id="closeWaPopup" style="margin-top: 20px; background: transparent; border: none; color: #444; font-weight: 900; cursor: pointer; text-transform: uppercase; font-size: 11px; letter-spacing: 2px; opacity: 0.6;">🚫 Close Prompt</button>
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

// Replace handleSalesAndBill function
content = content.replace(/const handleSalesAndBill = async \(saleData\) => \{[\s\S]*?\};/m, newHandleSalesAndBill);

// Update implementation in handleSaleSubmit to pass more data
content = content.replace(
    /await handleSalesAndBill\({\s*name: saleForm\.customerName,\s*phone: saleForm\.contactNumber,\s*amount: saleForm\.quantity \* saleForm\.pricePerUnit,\s*balance: totalKadan,\s*loyaltyPoints: \(data\.loyaltyUpdate\?\.totalLifetime \|\| 0\)\s*}\);/g,
    `await handleSalesAndBill({
                    name: saleForm.customerName,
                    phone: saleForm.contactNumber,
                    amount: saleForm.quantity * saleForm.pricePerUnit,
                    balance: totalKadan,
                    loyaltyPoints: (data.loyaltyUpdate?.totalLifetime || 0)
                }, data.sale, data.loyaltyUpdate);`
);

fs.writeFileSync(filePath, content);
console.log('✅ Successfully updated for Image Copying and removed preview!');

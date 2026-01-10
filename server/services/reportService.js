const nodemailer = require('nodemailer');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const sendMonthlyReport = async (sales, expenditures, inventory, climate, customers, month, year) => {
    try {
        const reportEmail = process.env.REPORT_EMAIL || 'jpfarming10@gmail.com';
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;

        if (!smtpUser || !smtpPass) {
            console.error('❌ Monthly Report Error: SMTP credentials not found in .env');
            return;
        }

        // 1. Create Excel Workbook
        const workbook = XLSX.utils.book_new();

        // 2. Sales Sheet
        const salesData = sales.map(s => ({
            Date: new Date(s.date).toLocaleDateString(),
            Product: s.productType,
            Quantity: s.quantity,
            Unit: s.unit,
            PricePerUnit: s.pricePerUnit,
            Total: s.totalAmount,
            Customer: s.customerName,
            Phone: s.contactNumber
        }));
        const salesWS = XLSX.utils.json_to_sheet(salesData);
        XLSX.utils.book_append_sheet(workbook, salesWS, "Sales");

        // 3. Expenditure Sheet
        const expData = expenditures.map(e => ({
            Date: new Date(e.date).toLocaleDateString(),
            Category: e.category,
            Description: e.description || '-',
            Amount: e.amount
        }));
        const expWS = XLSX.utils.json_to_sheet(expData);
        XLSX.utils.book_append_sheet(workbook, expWS, "Expenditure");

        // 4. Inventory Sheet
        const invData = inventory.map(i => ({
            Item: i.itemName,
            CurrentStock: i.currentStock,
            Unit: i.unit,
            StartingStock: i.startingStock
        }));
        const invWS = XLSX.utils.json_to_sheet(invData);
        XLSX.utils.book_append_sheet(workbook, invWS, "Inventory");

        // 5. Climate Sheet
        const climData = climate.map(c => ({
            Date: new Date(c.date).toLocaleString(),
            Temperature: c.temperature + '°C',
            Moisture: c.moisture + '%',
            Notes: c.notes || '-'
        }));
        const climWS = XLSX.utils.json_to_sheet(climData);
        XLSX.utils.book_append_sheet(workbook, climWS, "Climate");

        // 6. Customers/Loyalty Sheet
        const custData = customers.map(c => ({
            Name: c.name,
            Phone: c.contactNumber,
            LoyaltyCount: c.loyaltyCount,
            LifetimePockets: c.lifetimePockets,
            TotalOrders: c.totalOrders
        }));
        const custWS = XLSX.utils.json_to_sheet(custData);
        XLSX.utils.book_append_sheet(workbook, custWS, "Loyalty Hub");

        // 4. Save file temporarily
        const fileName = `TJP_Report_${month}_${year}.xlsx`;
        const filePath = path.join(__dirname, '..', 'public', 'reports', fileName);

        if (!fs.existsSync(path.join(__dirname, '..', 'public', 'reports'))) {
            fs.mkdirSync(path.join(__dirname, '..', 'public', 'reports'), { recursive: true });
        }

        XLSX.writeFile(workbook, filePath);

        // 5. Setup Email Transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        // 6. Send Email
        const mailOptions = {
            from: `"TJP Mushroom Farming" <${smtpUser}>`,
            to: reportEmail,
            subject: `📊 TJP Monthly Report - ${month}/${year}`,
            text: `வணக்கம்! Attached is the monthly sales and expenditure report for ${month}/${year}.`,
            attachments: [
                {
                    filename: fileName,
                    path: filePath
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Monthly Report Sent:', info.messageId);

        // Cleanup: delete temp file after some time or immediately
        // fs.unlinkSync(filePath); 

    } catch (error) {
        console.error('❌ Monthly Report Error:', error);
    }
};

module.exports = { sendMonthlyReport };

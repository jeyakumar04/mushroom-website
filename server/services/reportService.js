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
            LoyaltyCount: c.cycleCount,
            LifetimePockets: c.totalLifetime,
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

const sendDailyReport = async (sales, expenditures) => {
    try {
        const adminEmail1 = process.env.REPORT_EMAIL || 'jpfarming10@gmail.com';
        const adminEmail2 = process.env.REPORT_EMAIL_2 || '9500591897@gmail.com'; // Fallback or placeholder
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;

        if (!smtpUser || !smtpPass) {
            console.error('❌ Daily Report Error: SMTP credentials missing');
            return;
        }

        const todayStr = new Date().toLocaleDateString();

        // 1. Calculate Summary
        const totalSales = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        const totalExp = expenditures.reduce((sum, e) => sum + (e.amount || 0), 0);
        const netProfit = totalSales - totalExp;

        // 2. Create Excel
        const workbook = XLSX.utils.book_new();

        const salesData = sales.map(s => ({
            Date: new Date(s.date).toLocaleDateString(),
            Product: s.productType,
            Qty: s.quantity,
            Price: s.pricePerUnit,
            Total: s.totalAmount,
            Customer: s.customerName
        }));
        const salesWS = XLSX.utils.json_to_sheet(salesData);
        XLSX.utils.book_append_sheet(workbook, salesWS, "Daily Sales");

        const expData = expenditures.map(e => ({
            Date: new Date(e.date).toLocaleDateString(),
            Category: e.category,
            Description: e.description,
            Amount: e.amount
        }));
        const expWS = XLSX.utils.json_to_sheet(expData);
        XLSX.utils.book_append_sheet(workbook, expWS, "Daily Expenditure");

        const fileName = `TJP_Daily_Backup_${new Date().toISOString().split('T')[0]}.xlsx`;
        const filePath = path.join(__dirname, '..', 'public', 'reports', fileName);
        if (!fs.existsSync(path.dirname(filePath))) fs.mkdirSync(path.dirname(filePath), { recursive: true });
        XLSX.writeFile(workbook, filePath);

        // 3. Email Body (Table)
        const emailHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                <h2 style="color: #022C22; text-align: center;">🍄 TJP Mushroom Daily Summary</h2>
                <p style="text-align: center; color: #666;">Date: ${todayStr}</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background-color: #f4f4f4;">
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Category</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;">Today's Total Sales</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: green;">₹${totalSales.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;">Today's Total Expenses</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: red;">₹${totalExp.toLocaleString()}</td>
                        </tr>
                        <tr style="background-color: #e8f5e9;">
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Net Profit</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: darkgreen;">₹${netProfit.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
                
                <p style="margin-top: 20px; font-size: 0.9rem; color: #888;">Attached: Excel Master Backup (Today's Data)</p>
                <hr style="border: 0.5px solid #eee; margin-top: 30px;">
                <p style="text-align: center; font-style: italic; color: #aaa;">Generated Automatically by TJP System</p>
            </div>
        `;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: smtpUser, pass: smtpPass }
        });

        const recipients = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [adminEmail1, adminEmail2];

        const mailOptions = {
            from: `"TJP Mushroom Farming" <${smtpUser}>`,
            to: recipients.join(', '),
            subject: `📊 TJP Daily Report - ${todayStr}`,
            html: emailHTML,
            attachments: [{ filename: fileName, path: filePath }]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Daily 8 PM Report Sent:', info.messageId);

    } catch (error) {
        console.error('❌ Daily Report Error:', error);
    }
};

module.exports = { sendMonthlyReport, sendDailyReport };

// --- KADAN/CREDIT SETTLEMENT ---
app.patch('/api/sales/:id/settle', auth, async (req, res) => {
    try {
        const { settledBy } = req.body; // 'Cash' or 'GPay'
        const sale = await Sales.findById(req.params.id);

        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        if (sale.paymentStatus === 'Paid') {
            return res.status(400).json({ message: 'Already settled' });
        }

        // Mark as settled
        sale.paymentStatus = 'Paid';
        sale.settledDate = new Date();
        sale.settledBy = settledBy;
        await sale.save();

        res.json({ message: 'Kadan settled successfully', sale });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Settlement failed' });
    }
});

// --- GET KADAN LIST (Unpaid Sales) ---
app.get('/api/sales/kadan', auth, async (req, res) => {
    try {
        const kadanList = await Sales.find({ paymentStatus: 'Unpaid' }).sort({ date: -1 });
        res.json(kadanList);
    } catch (error) {
        res.status(500).json({ message: 'Fetch kadan failed' });
    }
});

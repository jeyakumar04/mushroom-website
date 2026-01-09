import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    FaUser, FaPhone, FaMoneyBillWave, FaShieldAlt, FaCheckCircle,
    FaBox, FaChartBar, FaWarehouse, FaDownload, FaWhatsapp,
    FaGift, FaPlusCircle, FaHistory, FaEraser, FaBell, FaClock,
    FaLeaf, FaPlus, FaMinus, FaFileExcel, FaCalendarAlt, FaSeedling,
    FaLightbulb, FaWater, FaFan, FaRupeeSign, FaArrowUp, FaArrowDown,
    FaReceipt, FaShoppingCart, FaTruck, FaStore, FaImage, FaLayerGroup
} from 'react-icons/fa';
import { toPng } from 'html-to-image';
import Footer from '../Component/Footer';
import DigitalBill from '../Component/DigitalBill';

const Dashboard = () => {
    const billRef = useRef(null);
    const [billData, setBillData] = useState(null);
    const [isGeneratingBill, setIsGeneratingBill] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [bookings, setBookings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [sales, setSales] = useState([]);
    const [expenditures, setExpenditures] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState(null);
    const [financeData, setFinanceData] = useState(null);
    const [batches, setBatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState(null);
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Form States
    const [saleForm, setSaleForm] = useState({
        productType: 'Mushroom',
        quantity: 1,
        pricePerUnit: 50,
        customerName: '',
        contactNumber: ''
    });

    const [expenditureForm, setExpenditureForm] = useState({
        category: 'Seeds',
        description: '',
        quantity: 0,
        unit: 'kg',
        amount: 0,
        addToInventory: false
    });

    const [inventoryForm, setInventoryForm] = useState({
        itemId: '',
        quantity: 0,
        type: 'use',
        notes: ''
    });

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // --- TJP Smart Hub Definitions ---
    const [soakingStartTime, setSoakingStartTime] = useState(null);

    const formatDate = (date) => {
        if (!date) return '-';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };
    // ---------------------------------

    // Batch Form State
    const [batchForm, setBatchForm] = useState({
        batchName: '',
        bedDate: new Date().toISOString().split('T')[0],
        seedsUsed: 0,
        notes: ''
    });

    const token = localStorage.getItem('adminToken');
    const GOOGLE_MAPS_LINK = "https://maps.app.goo.gl/nNmZaYwtJvmXbXBz5";

    // Update time every minute for alerts
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const [bookRes, orderRes, invRes, statRes, custRes, salesRes, expRes, alertRes, finRes, batchRes] = await Promise.all([
                fetch('http://localhost:5000/api/bookings', { headers }),
                fetch('http://localhost:5000/api/orders', { headers }),
                fetch('http://localhost:5000/api/inventory', { headers }),
                fetch('http://localhost:5000/api/admin/stats', { headers }),
                fetch('http://localhost:5000/api/customers', { headers }),
                fetch('http://localhost:5000/api/sales', { headers }),
                fetch('http://localhost:5000/api/expenditure', { headers }),
                fetch('http://localhost:5000/api/alerts', { headers }),
                fetch(`http://localhost:5000/api/finance/summary?month=${selectedMonth}&year=${selectedYear}`, { headers }),
                fetch('http://localhost:5000/api/batches', { headers })
            ]);

            const [bData, oData, iData, sData, cData, salesData, expData, alertData, finData, batchData] = await Promise.all([
                bookRes.json(), orderRes.json(), invRes.json(), statRes.json(),
                custRes.json(), salesRes.json(), expRes.json(), alertRes.json(), finRes.json(), batchRes.json()
            ]);

            setBookings(Array.isArray(bData) ? bData : []);
            setOrders(Array.isArray(oData) ? oData : []);
            setInventory(Array.isArray(iData) ? iData : []);
            setCustomers(Array.isArray(cData) ? cData : []);
            setSales(salesData.sales || []);
            setExpenditures(expData.expenditures || []);
            setAlerts(Array.isArray(alertData) ? alertData : []);
            setStats(sData);
            setFinanceData(finData);
            setBatches(Array.isArray(batchData) ? batchData : []);
        } catch (err) {
            setError('Backend Connection Error');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [token, selectedMonth, selectedYear]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Check current alerts & Routine Alarms
    const getActiveAlerts = useCallback(() => {
        const now = currentTime;
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

        const routineAlarms = [
            { time: '06:00', title: '🍄 EXHAUST FAN ON', msg: 'Time to turn ON the exhaust fan!' },
            { time: '06:30', title: '🌀 BED CHANGE', msg: 'Routine Bed Change Alert!' }
        ];

        const triggered = routineAlarms.filter(a => a.time === currentTimeString);
        if (triggered.length > 0) {
            // Beep sound (using browser synth)
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
            oscillator.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 1);
        }

        // 18 Hour Soaking Timer check
        if (soakingStartTime) {
            const soakingEnd = new Date(new Date(soakingStartTime).getTime() + 18 * 60 * 60 * 1000);
            if (now >= soakingEnd) {
                // Trigger Soak Alarm
            }
        }

        return alerts.filter(alert => {
            const [alertHour, alertMinute] = alert.scheduledTime.split(':').map(Number);
            const alertTime = alertHour * 60 + alertMinute;
            const nowTime = currentHour * 60 + currentMinute;
            return Math.abs(nowTime - alertTime) <= 30;
        });
    }, [currentTime, alerts, soakingStartTime]);

    // SALES HANDLER
    const handleSaleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(saleForm)
            });
            const data = await res.json();
            if (res.ok) {
                alert(`✅ Sale recorded! Total: ₹${saleForm.quantity * saleForm.pricePerUnit}`);

                // Check for loyalty alert
                if (data.loyaltyUpdate?.reachedCycle) {
                    const message = `🎉 வாழ்த்துக்கள் ${saleForm.customerName}! 20 பாக்கெட்கள் cycle complete ஆகிவிட்டது! உங்கள் அடுத்த order-ல் FREE POCKET பெறலாம்! 🍄`;
                    window.open(`https://wa.me/91${saleForm.contactNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                }

                if (data.loyaltyUpdate?.bulkOffer) {
                    alert('🔥 BULK OFFER: 2 Free Pockets for 20+ order!');
                }

                setSaleForm({ productType: 'Mushroom', quantity: 1, pricePerUnit: 50, customerName: '', contactNumber: '' });
                fetchData();
            }
        } catch (err) {
            console.error(err);
            alert('Sale recording failed');
        }
    };

    // Generic Delete Handler
    const handleDelete = async (model, id) => {
        if (!window.confirm("Permanent-ah delete pannanuma?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/delete/${model}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchData();
        } catch (err) { alert('Delete failed'); }
    };

    // EXPENDITURE HANDLER
    const handleExpenditureSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/expenditure', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(expenditureForm)
            });
            if (res.ok) {
                alert(`✅ Expenditure recorded! Amount: ₹${expenditureForm.amount}`);
                setExpenditureForm({ category: 'Seeds', description: '', quantity: 0, unit: 'kg', amount: 0, addToInventory: false });
                fetchData();
            }
        } catch (err) {
            console.error(err);
            alert('Expenditure recording failed');
        }
    };

    // INVENTORY USAGE HANDLER
    const handleInventoryUpdate = async (itemId, type, quantity, notes = '') => {
        try {
            const endpoint = type === 'use' ? 'use' : 'add';
            const res = await fetch(`http://localhost:5000/api/inventory/${itemId}/${endpoint}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity, notes })
            });
            if (res.ok) {
                fetchData();
            }
        } catch (err) {
            console.error(err);
            alert('Inventory update failed');
        }
    };

    // RESET LOYALTY
    const resetLoyalty = async (id) => {
        if (!window.confirm("Reset loyalty count?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/customers/${id}/reset`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchData();
        } catch (err) { alert('Reset failed'); }
    };

    // BATCH HANDLERS
    const handleBatchSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/batches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(batchForm)
            });
            if (res.ok) {
                alert(`✅ New Batch Created! Expected Harvest: ${new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toLocaleDateString()}`);
                setBatchForm({ batchName: '', bedDate: new Date().toISOString().split('T')[0], seedsUsed: 0, notes: '' });
                fetchData();
            }
        } catch (err) {
            alert('Batch creation failed');
        }
    };

    const handleHarvest = async (id) => {
        const qty = prompt("Enter harvested quantity (kg):", "2");
        if (!qty) return;
        try {
            const res = await fetch(`http://localhost:5000/api/batches/${id}/harvest`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ harvestedQuantity: Number(qty) })
            });
            if (res.ok) fetchData();
        } catch (err) {
            alert('Harvest update failed');
        }
    };

    // UNIVERSAL EXCEL EXPORT
    const exportToExcel = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "TJP MUSHROOM FARMING - MASTER DATA REPORT\n";
        csvContent += `Generated Date: ${formatDate(new Date())}\n\n`;

        // SALES
        csvContent += "SALES DATA\nDate,Product,Qty,Unit,Price,Total,Customer,Phone\n";
        sales.forEach(s => {
            csvContent += `${formatDate(s.date)},${s.productType},${s.quantity},${s.unit},${s.pricePerUnit},${s.totalAmount},${s.customerName},${s.contactNumber}\n`;
        });
        csvContent += `\nTOTAL SALES:,,,,,₹${sales.reduce((sum, s) => sum + s.totalAmount, 0)}\n\n`;

        // EXPENDITURE
        csvContent += "EXPENDITURE DATA\nDate,Category,Description,Amount\n";
        expenditures.forEach(e => {
            csvContent += `${formatDate(e.date)},${e.category},${e.description || '-'},₹${e.amount}\n`;
        });
        csvContent += `\nTOTAL EXPENSES:,,,₹${expenditures.reduce((sum, e) => sum + e.amount, 0)}\n\n`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `TJP_Master_Report_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const activeAlerts = getActiveAlerts();

    const renderTab = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Harvesting Alerts Banner */}
                        {batches.some(b => b.status === 'Ready for Harvest') && (
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-6 shadow-lg animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl">🍄</div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-wider">Ready for Harvest!</h3>
                                        <p className="text-white/90 font-bold">
                                            {batches.filter(b => b.status === 'Ready for Harvest').length} Batches have reached 15-18 days. Time to pick!
                                        </p>
                                    </div>
                                    <button onClick={() => setActiveTab('batches')} className="ml-auto bg-white text-green-700 px-6 py-2 rounded-xl font-black uppercase text-sm hover:bg-green-50">View Batches</button>
                                </div>
                            </div>
                        )}

                        {/* Routine Alerts Banner */}
                        {activeAlerts.length > 0 && (
                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-6 shadow-lg">
                                <div className="flex items-center gap-4">
                                    <FaBell className="text-4xl text-white" />
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase">Active Routine Alert</h3>
                                        {activeAlerts.map((alert, idx) => (
                                            <p key={idx} className="text-white/90 font-bold">
                                                {alert.icon} {alert.message}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-3xl p-8 shadow-xl border-l-4 border-green-500">
                                <div className="flex items-center justify-between mb-4">
                                    <FaArrowUp className="text-green-500 text-2xl" />
                                    <span className="text-xs font-bold uppercase text-gray-400">Total Sales</span>
                                </div>
                                <p className="text-4xl font-black text-gray-800">₹{stats?.totalSales || 0}</p>
                            </div>
                            <div className="bg-white rounded-3xl p-8 shadow-xl border-l-4 border-red-500">
                                <div className="flex items-center justify-between mb-4">
                                    <FaArrowDown className="text-red-500 text-2xl" />
                                    <span className="text-xs font-bold uppercase text-gray-400">Expenditure</span>
                                </div>
                                <p className="text-4xl font-black text-gray-800">₹{stats?.totalExpenditure || 0}</p>
                            </div>
                            <div className="bg-white rounded-3xl p-8 shadow-xl border-l-4 border-blue-500">
                                <div className="flex items-center justify-between mb-4">
                                    <FaRupeeSign className="text-blue-500 text-2xl" />
                                    <span className="text-xs font-bold uppercase text-gray-400">Net Profit</span>
                                </div>
                                <p className={`text-4xl font-black ${(stats?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ₹{stats?.netProfit || 0}
                                </p>
                            </div>
                            <div className="bg-white rounded-3xl p-8 shadow-xl border-l-4 border-purple-500">
                                <div className="flex items-center justify-between mb-4">
                                    <FaUser className="text-purple-500 text-2xl" />
                                    <span className="text-xs font-bold uppercase text-gray-400">Customers</span>
                                </div>
                                <p className="text-4xl font-black text-gray-800">{customers.length}</p>
                            </div>
                        </div>

                        {/* Routine Alerts Schedule */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl">
                            <h3 className="text-xl font-black uppercase text-gray-800 mb-6 flex items-center gap-3">
                                <FaClock className="text-amber-500" /> Daily Routine Alerts
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {alerts.map((alert, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
                                            {alert.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-gray-800">{alert.title}</p>
                                            <p className="text-sm text-gray-500">{alert.message}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-amber-600">{alert.scheduledTime}</span>
                                            <p className="text-xs text-gray-400 uppercase font-bold">AM</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Inventory Overview */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl">
                            <h3 className="text-xl font-black uppercase text-gray-800 mb-6 flex items-center gap-3">
                                <FaWarehouse className="text-blue-500" /> Inventory Status
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {inventory.map(item => (
                                    <div key={item._id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center border border-blue-100">
                                        <FaSeedling className="text-4xl text-blue-500 mx-auto mb-4" />
                                        <h4 className="font-black text-gray-800 uppercase text-sm mb-2">{item.itemName}</h4>
                                        <p className="text-4xl font-black text-blue-600">{item.currentStock}</p>
                                        <p className="text-xs text-gray-500 uppercase font-bold">{item.unit}</p>
                                        <p className="text-xs text-gray-400 mt-2">Starting: {item.startingStock} {item.unit}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'sales':
                return (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Sales Form */}
                            <div className="bg-white rounded-3xl p-8 shadow-xl">
                                <h3 className="text-xl font-black uppercase text-gray-800 mb-6 flex items-center gap-3">
                                    <FaShoppingCart className="text-green-500" /> Record Sale
                                </h3>
                                <form onSubmit={handleSaleSubmit} className="space-y-5">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Product Type</label>
                                        <select
                                            value={saleForm.productType}
                                            onChange={e => setSaleForm({ ...saleForm, productType: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-bold text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                        >
                                            <option value="Mushroom">🍄 Mushroom</option>
                                            <option value="Seeds">🌱 Seeds</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Quantity</label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={saleForm.quantity}
                                                onChange={e => setSaleForm({ ...saleForm, quantity: Number(e.target.value) })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-bold text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Price / Unit (₹)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={saleForm.pricePerUnit}
                                                onChange={e => setSaleForm({ ...saleForm, pricePerUnit: Number(e.target.value) })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-bold text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Customer Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={saleForm.customerName}
                                            onChange={async (e) => {
                                                const val = e.target.value;
                                                setSaleForm({ ...saleForm, customerName: val });
                                                if (val.length > 2) {
                                                    const res = await fetch(`http://localhost:5000/api/customers/search?name=${val}`, { headers: { 'Authorization': `Bearer ${token}` } });
                                                    const suggestedData = await res.json();
                                                    // Auto-fill logic
                                                    if (suggestedData.length > 0) {
                                                        const first = suggestedData[0];
                                                        if (window.confirm(`Auto-fill details for ${first.name}?`)) {
                                                            setSaleForm({ ...saleForm, customerName: first.name, contactNumber: first.contactNumber });
                                                        }
                                                    }
                                                }
                                            }}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-bold text-gray-800"
                                            placeholder="Customer name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            required
                                            value={saleForm.contactNumber}
                                            onChange={e => setSaleForm({ ...saleForm, contactNumber: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-bold text-gray-800"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                        <p className="text-xs font-bold text-green-600 uppercase">Total Amount</p>
                                        <p className="text-3xl font-black text-green-700">₹{saleForm.quantity * saleForm.pricePerUnit}</p>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-black uppercase tracking-wide hover:shadow-lg transition-all"
                                    >
                                        Record Sale & Send Bill
                                    </button>
                                </form>
                            </div>

                            {/* Sales History */}
                            <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl">
                                <h3 className="text-xl font-black uppercase text-gray-800 mb-6 flex items-center gap-3">
                                    <FaHistory className="text-blue-500" /> Recent Sales
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b-2 border-gray-100">
                                                <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Date</th>
                                                <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Product</th>
                                                <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Qty</th>
                                                <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Amount</th>
                                                <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Customer</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sales.slice(0, 15).map((sale, idx) => (
                                                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                                                    <td className="py-4 text-sm font-bold text-gray-600">
                                                        {formatDate(sale.date)}
                                                    </td>
                                                    <td className="py-4">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${sale.productType === 'Mushroom' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                                            {sale.productType}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-sm font-bold text-gray-800">{sale.quantity} {sale.unit}</td>
                                                    <td className="py-4 text-sm font-black text-green-600">₹{sale.totalAmount}</td>
                                                    <td className="py-4">
                                                        <p className="text-sm font-bold text-gray-800">{sale.customerName}</p>
                                                        <p className="text-[10px] text-gray-400">{sale.contactNumber}</p>
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <button onClick={() => handleDelete('sales', sale._id)} className="text-red-400 hover:text-red-600 transition-all"><FaEraser /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {/* Totals Row */}
                                            <tr className="bg-gray-900 text-white rounded-xl">
                                                <td colSpan="2" className="py-4 px-6 font-black uppercase text-xs">Total Sales</td>
                                                <td className="py-4 font-black">{sales.reduce((sum, s) => sum + s.quantity, 0)} Pkts</td>
                                                <td className="py-4 font-black">₹{sales.reduce((sum, s) => sum + s.totalAmount, 0)}</td>
                                                <td colSpan="2"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'expenditure':
                return (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Expenditure Form */}
                            <div className="bg-white rounded-3xl p-8 shadow-xl">
                                <h3 className="text-xl font-black uppercase text-gray-800 mb-6 flex items-center gap-3">
                                    <FaMoneyBillWave className="text-red-500" /> Add Expenditure
                                </h3>
                                <form onSubmit={handleExpenditureSubmit} className="space-y-5">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Category</label>
                                        <select
                                            value={expenditureForm.category}
                                            onChange={e => setExpenditureForm({ ...expenditureForm, category: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-bold text-gray-800 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                                        >
                                            <option value="Seeds">🌱 Seeds (Spawns)</option>
                                            <option value="Hay">🌾 Hay (Vaikol)</option>
                                            <option value="Covers">🛡️ Covers</option>
                                            <option value="Electricity">⚡ Electricity</option>
                                            <option value="Labor">👷 Labor</option>
                                            <option value="Transport">🚚 Transport</option>
                                            <option value="Other">📦 Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Description</label>
                                        <input
                                            type="text"
                                            value={expenditureForm.description}
                                            onChange={e => setExpenditureForm({ ...expenditureForm, description: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-bold text-gray-800 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                                            placeholder="Details (optional)"
                                        />
                                    </div>
                                    {expenditureForm.category === 'Seeds' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Quantity (kg)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={expenditureForm.quantity}
                                                    onChange={e => setExpenditureForm({ ...expenditureForm, quantity: Number(e.target.value) })}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-bold text-gray-800 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <label className="flex items-center gap-3 cursor-pointer bg-blue-50 rounded-xl px-4 py-4 border border-blue-200 w-full">
                                                    <input
                                                        type="checkbox"
                                                        checked={expenditureForm.addToInventory}
                                                        onChange={e => setExpenditureForm({ ...expenditureForm, addToInventory: e.target.checked })}
                                                        className="w-5 h-5 text-blue-600"
                                                    />
                                                    <span className="text-xs font-bold text-blue-700">Add to Inventory</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Amount (₹)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={expenditureForm.amount}
                                            onChange={e => setExpenditureForm({ ...expenditureForm, amount: Number(e.target.value) })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-bold text-gray-800 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                                            placeholder="Enter amount"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white py-4 rounded-xl font-black uppercase tracking-wide hover:shadow-lg transition-all"
                                    >
                                        Record Expenditure
                                    </button>
                                </form>
                            </div>

                            {/* Expenditure History */}
                            <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl">
                                <h3 className="text-xl font-black uppercase text-gray-800 mb-6 flex items-center gap-3">
                                    <FaReceipt className="text-red-500" /> Expenditure History
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b-2 border-gray-100">
                                                <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Date</th>
                                                <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Category</th>
                                                <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Description</th>
                                                <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expenditures.slice(0, 15).map((exp, idx) => (
                                                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                                                    <td className="py-4 text-sm font-bold text-gray-600">
                                                        {formatDate(exp.date)}
                                                    </td>
                                                    <td className="py-4">
                                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700">
                                                            {exp.category}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-sm text-gray-600 font-bold">{exp.description || '-'}</td>
                                                    <td className="py-4 text-sm font-black text-red-600">₹{exp.amount}</td>
                                                    <td className="py-4 text-right">
                                                        <button onClick={() => handleDelete('expenditure', exp._id)} className="text-red-400 hover:text-red-700"><FaEraser /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {/* Expenditure Totals */}
                                            <tr className="bg-gray-800 text-white">
                                                <td colSpan="3" className="py-4 px-6 font-black uppercase text-xs">Total Expenditure</td>
                                                <td className="py-4 font-black">₹{expenditures.reduce((sum, e) => sum + e.amount, 0)}</td>
                                                <td></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'inventory':
                return (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {inventory.map(item => (
                                <div key={item._id} className="bg-white rounded-3xl p-8 shadow-xl">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                                            <FaWarehouse className="text-2xl text-white" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold uppercase text-gray-400">Starting Stock</p>
                                            <p className="text-lg font-black text-gray-500">{item.startingStock} {item.unit}</p>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black uppercase text-gray-800 mb-4">{item.itemName}</h3>
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6">
                                        <p className="text-xs font-bold uppercase text-blue-600 mb-1">Current Stock</p>
                                        <p className="text-5xl font-black text-blue-700">{item.currentStock}</p>
                                        <p className="text-sm font-bold text-blue-500">{item.unit}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                const qty = prompt(`How much ${item.unit} to USE?`, '1');
                                                if (qty && !isNaN(qty)) handleInventoryUpdate(item._id, 'use', Number(qty));
                                            }}
                                            className="flex-1 bg-red-100 text-red-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-200 transition-all"
                                        >
                                            <FaMinus /> Use
                                        </button>
                                        <button
                                            onClick={() => {
                                                const qty = prompt(`How much ${item.unit} to ADD?`, '1');
                                                if (qty && !isNaN(qty)) handleInventoryUpdate(item._id, 'add', Number(qty));
                                            }}
                                            className="flex-1 bg-green-100 text-green-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-200 transition-all"
                                        >
                                            <FaPlus /> Add
                                        </button>
                                    </div>
                                    {/* Usage History */}
                                    {item.usageHistory && item.usageHistory.length > 0 && (
                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            <p className="text-xs font-bold uppercase text-gray-400 mb-3">Recent Activity</p>
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {item.usageHistory.slice(-5).reverse().map((h, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-xs">
                                                        <span className={`font-bold ${h.type === 'use' ? 'text-red-500' : 'text-green-500'}`}>
                                                            {h.type === 'use' ? '-' : '+'}{h.quantity} {item.unit}
                                                        </span>
                                                        <span className="text-gray-400">{new Date(h.date).toLocaleDateString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'loyalty':
                return (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="bg-white rounded-3xl p-8 shadow-xl">
                            <h3 className="text-xl font-black uppercase text-gray-800 mb-6 flex items-center gap-3">
                                <FaGift className="text-amber-500" /> Smart Loyalty Hub
                            </h3>
                            <p className="text-sm text-gray-500 mb-8">
                                Track regular customers. 10 Pockets = 1 Free Pocket! Points auto-update with each sale.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {customers.map(customer => (
                                    <div
                                        key={customer._id}
                                        className={`rounded-3xl p-6 border-2 transition-all ${customer.loyaltyCount >= 10 ? 'bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-400 shadow-lg' : 'bg-gray-50 border-gray-200'}`}
                                    >
                                        <div className="flex items-center gap-4 mb-5">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${customer.loyaltyCount >= 10 ? 'bg-amber-500' : 'bg-gray-300'}`}>
                                                <FaUser className="text-xl text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-gray-800 uppercase">{customer.name}</h4>
                                                <p className="text-xs text-gray-500 flex items-center gap-2">
                                                    {customer.contactNumber}
                                                    <FaWhatsapp className="text-green-500" />
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-xs font-bold uppercase text-gray-400">Cycle (0-20)</p>
                                                <p className="text-4xl font-black text-gray-800">{customer.loyaltyCycleCount}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold uppercase text-gray-400">Total Lifetime</p>
                                                <p className="text-2xl font-black text-gray-600">{customer.lifetimePockets}</p>
                                            </div>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full rounded-full transition-all"
                                                style={{ width: `${(customer.loyaltyCycleCount / 20) * 100}%` }}
                                            ></div>
                                        </div>
                                        {customer.loyaltyCycleCount >= 20 ? (
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-amber-500 text-white py-3 px-4 rounded-xl text-center font-black uppercase text-sm animate-pulse">
                                                    🎁 FREE POCKET EARNED!
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-center text-sm text-gray-500">
                                                <span className="font-bold text-amber-600">{20 - customer.loyaltyCycleCount}</span> more pockets for free!
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'finance':
                return (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Month/Year Selector */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl">
                            <div className="flex flex-wrap items-center justify-between gap-6">
                                <h3 className="text-xl font-black uppercase text-gray-800 flex items-center gap-3">
                                    <FaChartBar className="text-purple-500" /> Finance Report
                                </h3>
                                <div className="flex items-center gap-4">
                                    <select
                                        value={selectedMonth}
                                        onChange={e => setSelectedMonth(Number(e.target.value))}
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 font-bold text-gray-800"
                                    >
                                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                            <option key={i} value={i + 1}>{m}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedYear}
                                        onChange={e => setSelectedYear(Number(e.target.value))}
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 font-bold text-gray-800"
                                    >
                                        {[2024, 2025, 2026, 2027].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={exportToExcel}
                                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                                    >
                                        <FaFileExcel /> Export Excel
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sales vs Expenses Graph (Premium Visual) */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl">
                            <h3 className="text-xl font-black uppercase text-gray-800 mb-8">Monthly Progress: Sales vs Expenses</h3>
                            <div className="flex flex-col gap-8">
                                {/* Sales Bar */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-black uppercase text-green-600">Total Sales</span>
                                        <span className="text-lg font-black text-gray-800">₹{financeData?.totalSales || 0}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden border border-gray-100">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000"
                                            style={{ width: `${Math.min((financeData?.totalSales / (financeData?.totalSales + financeData?.totalExpenditure || 1)) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                {/* Expenses Bar */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-black uppercase text-red-600">Total Expenses</span>
                                        <span className="text-lg font-black text-gray-800">₹{financeData?.totalExpenditure || 0}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden border border-gray-100">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-400 to-orange-500 transition-all duration-1000"
                                            style={{ width: `${Math.min((financeData?.totalExpenditure / (financeData?.totalSales + financeData?.totalExpenditure || 1)) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl p-8 text-white shadow-xl hover:scale-[1.02] transition-all">
                                <FaArrowUp className="text-4xl mb-4 opacity-80" />
                                <p className="text-green-100 font-bold uppercase text-sm mb-2">Total Sales</p>
                                <p className="text-5xl font-black">₹{financeData?.totalSales || 0}</p>
                            </div>
                            <div className="bg-gradient-to-br from-red-400 to-rose-500 rounded-3xl p-8 text-white shadow-xl hover:scale-[1.02] transition-all">
                                <FaArrowDown className="text-4xl mb-4 opacity-80" />
                                <p className="text-red-100 font-bold uppercase text-sm mb-2">Total Expenditure</p>
                                <p className="text-5xl font-black">₹{financeData?.totalExpenditure || 0}</p>
                            </div>
                            <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-3xl p-8 text-white shadow-xl hover:scale-[1.02] transition-all">
                                <FaRupeeSign className="text-4xl mb-4 opacity-80" />
                                <p className="text-gray-300 font-bold uppercase text-sm mb-2">Net Profit</p>
                                <p className={`text-5xl font-black ${(financeData?.netProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    ₹{financeData?.netProfit || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'batches':
                return (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* New Batch Form */}
                            <div className="bg-white rounded-3xl p-8 shadow-xl">
                                <h3 className="text-xl font-black uppercase text-gray-800 mb-6 flex items-center gap-3">
                                    <FaPlusCircle className="text-blue-500" /> New Production Batch
                                </h3>
                                <form onSubmit={handleBatchSubmit} className="space-y-5">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Batch Name/ID</label>
                                        <input
                                            type="text"
                                            required
                                            value={batchForm.batchName}
                                            onChange={e => setBatchForm({ ...batchForm, batchName: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-bold text-gray-800 focus:border-blue-500 outline-none"
                                            placeholder="Example: Batch A-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Bed Preparation Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={batchForm.bedDate}
                                            onChange={e => setBatchForm({ ...batchForm, bedDate: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-bold text-gray-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Seeds Used (kg)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={batchForm.seedsUsed}
                                            onChange={e => setBatchForm({ ...batchForm, seedsUsed: Number(e.target.value) })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-bold text-gray-800"
                                        />
                                    </div>
                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                        <p className="text-xs font-bold text-blue-600 uppercase">Est. Harvest Date</p>
                                        <p className="text-xl font-black text-blue-800">
                                            {new Date(new Date(batchForm.bedDate).getTime() + 16 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-xl font-black uppercase tracking-wide hover:shadow-lg transition-all"
                                    >
                                        Start Production Batch
                                    </button>
                                </form>
                            </div>

                            {/* Batch Monitoring */}
                            <div className="lg:col-span-2 space-y-6">
                                <h3 className="text-xl font-black uppercase text-gray-800 flex items-center gap-3">
                                    <FaHistory className="text-blue-500" /> Open Batches
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {batches.filter(b => b.status !== 'Harvested').map((batch, idx) => (
                                        <div key={idx} className={`bg-white rounded-3xl p-6 shadow-xl border-t-8 ${batch.status === 'Ready for Harvest' ? 'border-green-500' : 'border-blue-400'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${batch.status === 'Ready for Harvest' ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-blue-100 text-blue-700'}`}>
                                                    {batch.status}
                                                </span>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Started: {new Date(batch.bedDate).toLocaleDateString()}</p>
                                            </div>
                                            <h4 className="text-lg font-black text-gray-800 mb-4">{batch.batchName}</h4>

                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 mb-1">
                                                        <span>Growth Progress</span>
                                                        <span>{Math.min(Math.round(((new Date() - new Date(batch.bedDate)) / (16 * 24 * 60 * 60 * 1000)) * 100), 100)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-1000 ${batch.status === 'Ready for Harvest' ? 'bg-green-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${Math.min(Math.round(((new Date() - new Date(batch.bedDate)) / (16 * 24 * 60 * 60 * 1000)) * 100), 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Exp. Harvest</p>
                                                        <p className="font-black text-gray-800">{new Date(batch.expectedHarvestDate).toLocaleDateString()}</p>
                                                    </div>
                                                    {batch.status === 'Ready for Harvest' && (
                                                        <button
                                                            onClick={() => handleHarvest(batch._id)}
                                                            className="bg-green-600 text-white px-6 py-2 rounded-xl font-black uppercase text-xs hover:bg-green-700 transition-all"
                                                        >
                                                            Harvest Now
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#CBCCCB' }}>
            {/* Header */}
            <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-8 shadow-2xl">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                                TJP MUSHROOM FARMING
                            </h1>
                            <p className="text-gray-400 font-bold mt-1">Management Dashboard v5.0</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-xs font-bold text-gray-400 uppercase">Current Time</p>
                                <p className="text-xl font-black">{currentTime.toLocaleTimeString()}</p>
                            </div>
                            <FaShieldAlt className="text-4xl text-amber-500" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="bg-white shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex overflow-x-auto gap-2 py-4">
                        {[
                            { id: 'overview', label: 'Overview', icon: FaChartBar },
                            { id: 'batches', label: 'Production', icon: FaLayerGroup },
                            { id: 'sales', label: 'Sales', icon: FaShoppingCart },
                            { id: 'expenditure', label: 'Expenditure', icon: FaMoneyBillWave },
                            { id: 'inventory', label: 'Inventory', icon: FaWarehouse },
                            { id: 'loyalty', label: 'Loyalty Hub', icon: FaGift },
                            { id: 'finance', label: 'Finance Report', icon: FaFileExcel }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase whitespace-nowrap transition-all ${activeTab === tab.id
                                    ? 'bg-gray-900 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <tab.icon />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-gray-400 border-t-gray-800 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="font-black uppercase text-gray-600 tracking-widest">Loading Data...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="text-center text-red-600">
                            <p className="font-black text-2xl">{error}</p>
                            <p className="text-gray-500 mt-2">Please check if the server is running</p>
                        </div>
                    </div>
                ) : (
                    renderTab()
                )}
            </main>

            <Footer />

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;

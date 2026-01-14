import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    FaUser, FaPhone, FaMoneyBillWave, FaShieldAlt, FaCheckCircle,
    FaBox, FaChartBar, FaWarehouse, FaDownload, FaWhatsapp,
    FaGift, FaPlusCircle, FaHistory, FaEraser, FaBell, FaClock,
    FaLeaf, FaPlus, FaMinus, FaFileExcel, FaCalendarAlt, FaSeedling,
    FaLightbulb, FaWater, FaFan, FaRupeeSign, FaArrowUp, FaArrowDown,
    FaReceipt, FaShoppingCart, FaTruck, FaStore, FaImage, FaLayerGroup, FaEnvelope, FaFileCsv, FaBook
} from 'react-icons/fa';
import { toPng } from 'html-to-image';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Footer from '../Component/Footer';
import DigitalBill from '../Component/DigitalBill';

const Dashboard = () => {
    const billRef = useRef(null);
    const [billData, setBillData] = useState(null);
    const [isGeneratingBill, setIsGeneratingBill] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [billSentStatus, setBillSentStatus] = useState(null); // null, 'success', 'error'
    const [bookings, setBookings] = useState([]);
    const [orders, setOrders] = useState([]);
    // --- BLOG STATE & LOGIC (MANUAL PASTE) ---
    const [blogData, setBlogData] = useState({
        title: '',
        content: '',
        image: '',
        category: 'Growing Tips'
    });

    const handleBlogSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/blogs/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(blogData)
            });
            const data = await response.json();
            if (data.success) {
                alert("✅ Mushroom Blog Published Successfully!");
                setBlogData({ title: '', content: '', image: '', category: 'Growing Tips' });
            }
        } catch (err) {
            alert("❌ Error posting blog. Backend check pannunga.");
        }
    };
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
    const [climateData, setClimateData] = useState([]);
    const [kadanList, setKadanList] = useState([]);
    const [settlePopup, setSettlePopup] = useState({ open: false, saleId: null });
    const [cTemp, setCTemp] = useState('');
    const [cMoist, setCMoist] = useState('');
    const [cNotes, setCNotes] = useState('');
    const [entryDate, setEntryDate] = useState({
        day: new Date().getDate(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
    const [exportYear, setExportYear] = useState(new Date().getFullYear());
    const [waterLevel, setWaterLevel] = useState(70);
    const [lowWaterAlert, setLowWaterAlert] = useState(false);
    const [nextSprayTime, setNextSprayTime] = useState(null);
    const [customerSuggestions, setCustomerSuggestions] = useState([]);
    const [editingSalesId, setEditingSalesId] = useState(null);
    const [editingInventoryId, setEditingInventoryId] = useState(null);
    const [editingClimateId, setEditingClimateId] = useState(null);
    const [editingExpenditureId, setEditingExpenditureId] = useState(null);
    const [editingSeedIdx, setEditingSeedIdx] = useState(null);
    const [editedData, setEditedData] = useState({});

    // Form States
    const [saleForm, setSaleForm] = useState({
        productType: 'Mushroom',
        quantity: 1,
        pricePerUnit: 50,
        customerName: '',
        contactNumber: '',
        paymentType: 'Cash'
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
        itemName: '',
        startingStock: 0,
        unit: 'bags'
    });
    const [showAddItem, setShowAddItem] = useState(false);

    // Alert Form State
    const [alertForm, setAlertForm] = useState({
        id: null, // If present, it's an edit
        title: '',
        message: '',
        scheduledTime: '06:00',
        icon: '⏰'
    });
    const [isAlertFormOpen, setIsAlertFormOpen] = useState(false);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(new Date().getDate()); // Default to Today
    const [lastWaterCheck, setLastWaterCheck] = useState(null);
    const [reportArchives, setReportArchives] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [notificationLogs, setNotificationLogs] = useState([]);
    const [connectionMode, setConnectionMode] = useState({ isLocal: false, mode: 'CLOUD' });

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

    useEffect(() => {
        const timer = setInterval(() => {
            const phoneInput = document.getElementById('customerPhone');
            if (phoneInput && phoneInput.value && phoneInput.value !== saleForm.contactNumber) {
                setSaleForm(prev => ({ ...prev, contactNumber: phoneInput.value }));
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [saleForm.contactNumber]);

    // Update time every minute for alerts
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const [bookRes, orderRes, invRes, statRes, custRes, salesRes, expRes, alertRes, finRes, batchRes, climateRes, waterCheckRes, reportsRes, logsRes, kadanRes, sokRes] = await Promise.all([
                fetch('http://localhost:5000/api/bookings', { headers }),
                fetch('http://localhost:5000/api/orders', { headers }),
                fetch('http://localhost:5000/api/inventory', { headers }),
                fetch('http://localhost:5000/api/admin/stats', { headers }),
                fetch('http://localhost:5000/api/customers', { headers }),
                fetch('http://localhost:5000/api/sales', { headers }),
                fetch('http://localhost:5000/api/expenditure', { headers }),
                fetch('http://localhost:5000/api/alerts', { headers }),
                fetch(`http://localhost:5000/api/finance/summary?month=${selectedMonth}&year=${selectedYear}`, { headers }),
                fetch('http://localhost:5000/api/batches', { headers }),
                fetch('http://localhost:5000/api/climate', { headers }),
                fetch('http://localhost:5000/api/settings/water-check', { headers }),
                fetch('http://localhost:5000/api/admin/reports-list', { headers }),
                fetch('http://localhost:5000/api/admin/notification-logs', { headers }),
                fetch('http://localhost:5000/api/sales/kadan', { headers }),
                fetch('http://localhost:5000/api/settings/soaking', { headers })
            ]);

            const [bData, oData, iData, sData, cData, sld, exd, ald, finD, bthD, clmD, wtrR, rptL, nLog, kdnL, sokD] = await Promise.all([
                bookRes.json(), orderRes.json(), invRes.json(), statRes.json(),
                custRes.json(), salesRes.json(), expRes.json(), alertRes.json(),
                finRes.json(), batchRes.json(), climateRes.json(), waterCheckRes.json(),
                reportsRes.json(), logsRes.json(), kadanRes.json(), sokRes.json()
            ]);

            setBookings(Array.isArray(bData) ? bData : []);
            setOrders(Array.isArray(oData) ? oData : []);
            setInventory(Array.isArray(iData) ? iData : []);
            setCustomers(Array.isArray(cData) ? cData : []);
            setSales(sld.sales || []);
            setExpenditures(exd.expenditures || []);
            setAlerts(Array.isArray(ald) ? ald : []);
            setStats(sData);
            setFinanceData(finD);
            setBatches(Array.isArray(bthD) ? bthD : []);
            setClimateData(Array.isArray(clmD) ? clmD : []);
            setKadanList(Array.isArray(kdnL) ? kdnL : []);
            setLastWaterCheck(wtrR?.lastCheck || null);
            setWaterLevel(wtrR?.percentage || 70);
            setLowWaterAlert(wtrR?.isLow || false);
            if (sokD?.startTime) {
                setSoakingStartTime(new Date(sokD.startTime));
            }

            // Calculate next spray time
            const getNextSprayTime = () => {
                const now = new Date();
                const currentHour = now.getHours();
                const sprayHours = [0, 1, 3, 5, 7, 9, 11, 12, 14, 16, 18, 20, 22];
                for (let hour of sprayHours) {
                    if (hour > currentHour) {
                        const next = new Date(now);
                        next.setHours(hour, 0, 0, 0);
                        return next;
                    }
                }
                // Next day
                const next = new Date(now);
                next.setDate(next.getDate() + 1);
                next.setHours(0, 0, 0, 0);
                return next;
            };
            setNextSprayTime(getNextSprayTime());

            setReportArchives(Array.isArray(rptL) ? rptL : []);

            try {
                const statusRes = await fetch('http://localhost:5000/api/status', { headers });
                const statusD = await statusRes.json();
                setConnectionMode({ isLocal: statusD.isLocal, mode: statusD.mode });
            } catch (e) {
                console.warn("Status fetch failed");
            }
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
            { time: "06:00", title: "WATER CHECK", msg: "Time for 1st Water Check" },
            { time: "12:00", title: "WATER CHECK", msg: "Time for 2nd Water Check" },
            { time: "18:00", title: "WATER CHECK", msg: "Time for 3rd Water Check" },
            { time: "21:00", title: "WATER CHECK", msg: "Time for 4th Water Check" }
        ];

        const triggered = routineAlarms.filter(a => a.time === currentTimeString);
        if (triggered.length > 0) {
            // Beep sound
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
                oscillator.connect(audioCtx.destination);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 1);
            } catch (e) { }
        }

        // 18 Hour Soak Check
        const soakAlerts = [];
        if (soakingStartTime) {
            const soakingEnd = new Date(new Date(soakingStartTime).getTime() + 18 * 60 * 60 * 1000);
            if (now >= soakingEnd) {
                soakAlerts.push({ title: '🔥 SOAKING COMPLETE', msg: '18 Hours finished! Begin Bed Prep.', type: 'soak' });
            }
        }

        const activeRoutine = routineAlarms.filter(a => a.time === currentTimeString);
        return [...activeRoutine, ...soakAlerts];
    }, [currentTime, soakingStartTime]);

    const handleCreateInventoryItem = async (e) => {
        e.preventDefault();
        try {
            // Use the global 'token' variable
            const res = await fetch('http://localhost:5000/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(inventoryForm)
            });
            if (res.ok) {
                alert('✅ New Item Added!');
                setInventoryForm({ itemName: '', startingStock: 0, unit: 'bags' });
                setShowAddItem(false);
                fetchData();
            } else {
                alert('Failed to add item');
            }
        } catch (error) {
            console.error('Add item error:', error);
        }
    };

    const handleReset = async (customerId) => {
        if (!window.confirm("Pazhaya loyalty data-vai delete panni fresh-ah start pannaatuma?")) return;
        try {
            const response = await fetch('http://localhost:5000/api/loyalty/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ customerId })
            });

            if (response.ok) {
                alert("Data Reset! Ready for new entries.");
                fetchData(); // Dashboard refresh aagum
            } else {
                alert("Reset failed");
            }
        } catch (err) {
            console.error(err);
            alert("Reset error");
        }
    };

    const handleResetLoyalty = async (customerId) => {
        if (!window.confirm("Confirm: Mark 1 Free Pocket as claimed?")) return;
        try {
            // Find the customer to get their contact number
            const customer = customers.find(c => c._id === customerId);
            if (!customer) {
                alert('Customer not found');
                return;
            }

            const res = await fetch(`http://localhost:5000/api/loyalty/claim-reward`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ contactNumber: customer.contactNumber })
            });

            const data = await res.json();

            if (res.ok) {
                alert(`✅ Reward Claimed! ${data.available} free pocket(s) remaining.`);
                fetchData();
            } else {
                alert(data.error || 'Claim failed');
            }
        } catch (err) {
            console.error(err);
            alert('Claim failed');
        }
    };

    const handleClaim = async (contactNumber) => {
        if (!token) {
            alert("Session expired. Please re-login.");
            return;
        }
        if (window.confirm("Indha Free Pocket-ai claim pannaatuma? (Idhu 0 aagi vidum)")) {
            try {
                // Determine API URL based on current host
                const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
                const response = await fetch(`${apiUrl}/api/loyalty/claim-reward`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ contactNumber })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("✅ Reward Claimed Successfully! 🍄");
                    fetchData(); // Dashboard refresh
                } else {
                    alert("❌ " + (data.error || "Claim failed"));
                }
            } catch (err) {
                console.error(err);
                alert("Network error: Claim failed");
            }
        }
    };

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
                // 🌌 ANTI-GRAVITY LOYALTY NOTIFICATIONS
                if (data.loyaltyUpdate) {
                    const { freePocketsEarned, currentCycle, reachedCycle } = data.loyaltyUpdate;

                    if (reachedCycle) {
                        alert(`🎁 *LOYALTY REWARD!* \n${saleForm.customerName} can get ${freePocketsEarned} FREE POCKET(s) now! \nBalance: ${currentCycle}/10`);
                    } else if (currentCycle >= 8) {
                        alert(`🔥 ALMOST THERE! \n${saleForm.customerName} has ${currentCycle}/10 pockets. Just ${10 - currentCycle} more for FREE!`);
                    }
                }

                // TRIGGER DIGITAL BILL GEN & UPLOAD
                await handleSendBill(data.sale, data.loyaltyUpdate);

                setSaleForm({ productType: 'Mushroom', quantity: 1, pricePerUnit: 50, customerName: '', contactNumber: '', paymentType: 'Cash' });
                setCustomerSuggestions([]);
                fetchData();
            }
        } catch (err) {
            console.error(err);
            alert('Sale recording failed');
        }
    };

    const handleSoakingChange = async (val) => {
        if (!val) return;
        const [h, m] = val.split(':');
        const start = new Date();
        start.setHours(h, m, 0, 0);
        setSoakingStartTime(start);

        try {
            await fetch('http://localhost:5000/api/settings/soaking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ startTime: start.toISOString() })
            });
        } catch (e) {
            console.error("Save soaking failed", e);
        }
    };

    const handleCustomerNameChange = async (name) => {
        setSaleForm({ ...saleForm, customerName: name });
        if (name.length > 1) {
            try {
                const res = await fetch(`http://localhost:5000/api/customers/search?name=${encodeURIComponent(name)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data && data.length > 0) {
                    setCustomerSuggestions(data);
                } else {
                    setCustomerSuggestions([]);
                }
            } catch (err) {
                console.error(err);
                setCustomerSuggestions([]);
            }
        } else {
            setCustomerSuggestions([]);
        }
    };

    const selectCustomer = (customer) => {
        setSaleForm({
            ...saleForm,
            customerName: customer.name,
            contactNumber: customer.contactNumber
        });
        setCustomerSuggestions([]);
    };

    const handleSendBill = async (sale, loyaltyUpdate) => {
        if (!billRef.current) return;

        setIsGeneratingBill(true);
        setBillSentStatus(null);
        try {
            // Set data for the hidden bill component
            setBillData({
                sale: { ...sale, pricePerPocket: sale.pricePerUnit },
                customer: {
                    loyaltyCount: loyaltyUpdate?.currentCycle || 0,
                    rewardsEarned: loyaltyUpdate?.freePocketsEarned || 0,
                    totalLifetime: loyaltyUpdate?.totalLifetime || 0,
                    reachedCycle: loyaltyUpdate?.reachedCycle || false
                }
            });

            // Wait for render and generate image
            await new Promise(r => setTimeout(r, 600));
            const { toPng } = await import('html-to-image');
            const dataUrl = await toPng(billRef.current, { cacheBust: true, pixelRatio: 2 });

            // Upload to server & Send via WhatsApp Backend
            const response = await fetch('http://localhost:5000/api/send-bill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    image: dataUrl,
                    customerName: sale.customerName,
                    contactNumber: sale.contactNumber
                })
            });

            const result = await response.json();

            if (result.success) {
                setBillSentStatus('success');
                setTimeout(() => setBillSentStatus(null), 5000);
            } else {
                throw new Error(result.message || 'WhatsApp sending failed');
            }

        } catch (err) {
            console.error('Bill Error:', err);
            setBillSentStatus('error');
            setTimeout(() => setBillSentStatus(null), 5000);
            alert('❌ Bill generation/sending failed: ' + err.message);
        } finally {
            setIsGeneratingBill(false);
        }
    };

    const handleShare = (bill) => {
        const number = bill.customerPhone; // Ensure this matches your data key
        const billText = `*TJP MUSHROOM FARM*%0A--------------------------%0ADate: ${bill.date}%0ABill No: ${bill.order_id}%0A--------------------------%0ATotal: ₹${bill.total}%0AStatus: Paid (GP)%0A--------------------------%0AThank you!`;

        // Direct Protocol for App (Skips Intermediate Page)
        const whatsappUrl = `whatsapp://send?phone=91${number}&text=${billText}`;

        // Fallback for Web Browser if App is not installed
        const webUrl = `https://web.whatsapp.com/send?phone=91${number}&text=${billText}`;

        // Try to open App directly, if it fails or on Desktop, use Web link
        window.location.href = whatsappUrl;

        // Small delay: if the protocol fails to open, fallback to Web WhatsApp
        setTimeout(() => {
            if (document.hasFocus()) {
                window.open(webUrl, '_blank');
            }
        }, 500);
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

    // Climate Submit
    const handleClimateSubmit = async (e) => {
        e.preventDefault();
        const temp = Number(cTemp);
        const moist = Number(cMoist);
        const notesValue = cNotes.trim();

        if (!cTemp || !cMoist || !notesValue) {
            alert("🛑 ALL FIELDS REQUIRED: Temp, Moisture, and Observations cannot be empty!");
            return;
        }

        const payload = {
            temperature: temp,
            moisture: moist,
            humidity: moist,
            notes: notesValue,
            date: new Date(entryDate.year, entryDate.month - 1, entryDate.day)
        };

        try {
            const res = await fetch('http://localhost:5000/api/climate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setCTemp(''); setCMoist(''); setCNotes('');
                fetchData();
            } else {
                alert('Server rejected entry');
            }
        } catch (err) { alert('Entry failed: Connection Issue'); }
    };

    // ALERT HANDLERS
    const handleAlertSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = alertForm.id ? 'PATCH' : 'POST';
            const url = alertForm.id
                ? `http://localhost:5000/api/alerts/${alertForm.id}`
                : 'http://localhost:5000/api/alerts';

            // Remove id from body for cleanliness, though mongo ignores it usually
            const { id, ...body } = alertForm;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                alert(alertForm.id ? '✅ Alert Updated!' : '✅ New Alert Scheduled!');
                setAlertForm({ id: null, title: '', message: '', scheduledTime: '06:00', icon: '⏰' });
                setIsAlertFormOpen(false);
                fetchData();
            }
        } catch (err) {
            console.error(err);
            alert('Alert operation failed');
        }
    };

    const handleAlertDelete = async (id) => {
        if (!window.confirm("Delete this alarm permanently?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/alerts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchData();
        } catch (err) { alert('Delete failed'); }
    };

    const openEditAlert = (alert) => {
        setAlertForm({
            id: alert._id,
            title: alert.title,
            message: alert.message,
            scheduledTime: alert.scheduledTime,
            icon: alert.icon || '⏰'
        });
        setIsAlertFormOpen(true);
        // Scroll to top or form location if needed
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

    // 🛠️ INVENTORY EDIT HANDLER
    const handleUpdateInventory = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:5000/api/inventory/${editingProduct._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editingProduct)
            });
            if (res.ok) {
                alert("✅ Product Updated!");
                setEditingProduct(null);
                fetchData();
            }
        } catch (err) {
            console.error(err);
            alert("Update Failed");
        }
    };

    const handleResetInventory = async () => {
        if (!window.confirm("ΓÜá∩╕Å DANGER: Motha inventory data-vaiyum erase panni fresh-ah start pannaatuma? Indha step-ai undo panna mudiyaadhu!")) return;
        try {
            const res = await fetch('http://localhost:5000/api/inventory/reset-all', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert("Γ£à Inventory Reset Done! Starting fresh.");
                fetchData();
            } else {
                alert("Reset failed");
            }
        } catch (err) {
            console.error(err);
            alert("Reset Error");
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

        // INVENTORY
        csvContent += "INVENTORY STATUS\nItem,Current Stock,Unit,Starting Stock\n";
        inventory.forEach(i => {
            csvContent += `${i.itemName},${i.currentStock},${i.unit},${i.startingStock}\n`;
        });
        csvContent += "\n";

        // CLIMATE
        csvContent += "CLIMATE RECORDS\nDate,Temp,Moisture,Notes\n";
        climateData.forEach(c => {
            csvContent += `${formatDate(c.date)},${c.temperature}°C,${c.moisture}%,${c.notes || '-'}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `TJP_Farm_System_Report_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportSalesToExcel = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "TJP MUSHROOM FARMING - SALES REPORT\n";
        csvContent += `Generated Date: ${formatDate(new Date())}\n\n`;
        csvContent += "Date,Product,Qty,Unit,Price,Total,Customer,Phone\n";
        sales.forEach(s => {
            csvContent += `${formatDate(s.date)},${s.productType},${s.quantity},${s.unit},${s.pricePerUnit},${s.totalAmount},${s.customerName},${s.contactNumber}\n`;
        });
        csvContent += `\nTOTAL SALES:,,,,,₹${sales.reduce((sum, s) => sum + s.totalAmount, 0)}\n`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `TJP_Sales_Report_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportExpenditureToExcel = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "TJP MUSHROOM FARMING - EXPENDITURE REPORT\n";
        csvContent += `Generated Date: ${formatDate(new Date())}\n\n`;
        csvContent += "Date,Category,Description,Amount\n";
        expenditures.forEach(e => {
            csvContent += `${formatDate(e.date)},${e.category},${e.description || '-'},₹${e.amount}\n`;
        });
        csvContent += `\nTOTAL EXPENSES:,,,₹${expenditures.reduce((sum, e) => sum + e.amount, 0)}\n`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `TJP_Expenditure_Report_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportClimateToExcel = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "TJP MUSHROOM FARMING - CLIMATE REPORT\n";
        csvContent += `Generated Date: ${formatDate(new Date())}\n\n`;
        csvContent += "Date,Temperature (°C),Moisture (%),Observations\n";
        climateData.forEach(c => {
            const notes = (c.notes || '-').replace(/,/g, ';'); // Replace commas to avoid CSV issues
            csvContent += `${formatDate(c.date)},${c.temperature},${c.moisture || c.humidity},"${notes}"\n`;
        });
        csvContent += `\nTOTAL RECORDS:,${climateData.length}\n`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `TJP_Climate_Report_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportMonthlyReport = async (section) => {
        // Use state values directly instead of prompt
        const month = exportMonth;
        const year = exportYear;

        if (!month || !year) {
            alert('Please select month and year');
            return;
        }
        if (!month || !year) return;

        try {
            const response = await fetch(`http://localhost:5000/api/export/${section}?month=${month}&year=${year}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `TJP_${section.charAt(0).toUpperCase() + section.slice(1)}_Report_${month}_${year}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                alert('No data found or export failed');
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed');
        }
    };

    const activeAlerts = getActiveAlerts();

    const renderTab = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-8 animate-fadeIn">
                        {/* STICKY ALARM HEADER */}
                        {activeAlerts.length > 0 && (
                            <div className="bg-red-600 text-white p-6 rounded-3xl shadow-2xl animate-bounce flex items-center justify-between border-4 border-white/20">
                                <div className="flex items-center gap-4">
                                    <FaBell className="text-3xl" />
                                    <div>
                                        <p className="font-black text-xl uppercase tracking-wider">{activeAlerts[0].title}</p>
                                        <p className="font-bold text-base tracking-wide">{activeAlerts[0].msg}</p>
                                    </div>
                                </div>
                                <button onClick={() => fetchData()} className="bg-white text-red-600 px-6 py-2 rounded-xl font-black text-sm shadow-lg active:scale-95 transition-all">DISMISS</button>
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
                            {/* JANUARY BED COUNTER */}
                            <div className="bg-white rounded-3xl p-8 shadow-xl border-l-4 border-amber-500">
                                <div className="flex items-center justify-between mb-4">
                                    <FaLayerGroup className="text-amber-500 text-2xl" />
                                    <span className="text-xs font-bold uppercase text-gray-400">Total Beds (YTD)</span>
                                </div>
                                <p className="text-4xl font-black text-gray-800">
                                    {stats?.ytdBeds || 0}
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">Since Jan 1st, {new Date().getFullYear()}</p>
                            </div>
                        </div>

                        {/* TJP SMART HUB (Alarms & Soaking) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="text-xl font-black uppercase tracking-wider mb-6 flex items-center gap-3">
                                        <FaWater className="text-blue-200" /> Soaking Alarm (18 Hrs)
                                    </h3>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-xs font-black uppercase text-blue-200 block mb-3 tracking-widest">Start Time (Today)</label>
                                            <input
                                                type="time"
                                                className="w-full bg-white/20 border-2 border-white/30 rounded-2xl px-6 py-5 font-black text-3xl outline-none text-white focus:bg-white/30 transition-all"
                                                onChange={(e) => handleSoakingChange(e.target.value)}
                                            />
                                        </div>
                                        {soakingStartTime && (
                                            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                                                <p className="text-[10px] font-black uppercase text-blue-200 mb-2">Finish Alert (18 Hours Later)</p>
                                                <p className="text-3xl font-black">
                                                    {new Date(soakingStartTime.getTime() + 18 * 60 * 60 * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                </p>
                                                <p className="text-[10px] font-bold text-blue-300 mt-1 uppercase italic">
                                                    Tomorrow • {new Date(soakingStartTime.getTime() + 18 * 60 * 60 * 1000).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <FaClock className="absolute top-[-20px] right-[-20px] text-[200px] text-white/5 rotate-12" />
                            </div>

                            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-black uppercase text-gray-800 flex items-center gap-3">
                                            <FaClock className="text-amber-500" /> Daily Routine Alarms
                                        </h3>
                                        <button
                                            onClick={() => {
                                                setAlertForm({ id: null, title: 'WATER CHECK', message: '', scheduledTime: '06:00', icon: '💧' });
                                                setIsAlertFormOpen(!isAlertFormOpen);
                                            }}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition-all flex items-center gap-2"
                                        >
                                            <FaPlusCircle /> {isAlertFormOpen ? 'Close' : 'Add New'}
                                        </button>
                                    </div>

                                    {isAlertFormOpen && (
                                        <form onSubmit={handleAlertSubmit} className="mb-8 p-6 bg-indigo-50 rounded-2xl border-2 border-indigo-100 animate-fadeIn">
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-indigo-400 block mb-2">Alarm Title</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 font-bold text-gray-800 outline-none focus:border-indigo-500"
                                                        value={alertForm.title}
                                                        onChange={e => setAlertForm({ ...alertForm, title: e.target.value })}
                                                        placeholder="e.g. WATER CHECK"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-indigo-400 block mb-2">Time</label>
                                                        <input
                                                            type="time"
                                                            className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 font-bold text-gray-800 outline-none focus:border-indigo-500"
                                                            value={alertForm.scheduledTime}
                                                            onChange={e => setAlertForm({ ...alertForm, scheduledTime: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-indigo-400 block mb-2">Icon</label>
                                                        <select
                                                            className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 font-bold text-gray-800 outline-none focus:border-indigo-500"
                                                            value={alertForm.icon}
                                                            onChange={e => setAlertForm({ ...alertForm, icon: e.target.value })}
                                                        >
                                                            <option value="💧">💧 Water</option>
                                                            <option value="⏰">⏰ Alert</option>
                                                            <option value="🍄">🍄 Mushroom</option>
                                                            <option value="💨">💨 Fan</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-indigo-400 block mb-2">Message</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 font-bold text-gray-800 outline-none focus:border-indigo-500"
                                                        value={alertForm.message}
                                                        onChange={e => setAlertForm({ ...alertForm, message: e.target.value })}
                                                        placeholder="Description..."
                                                    />
                                                </div>
                                                <button type="submit" className="w-full bg-indigo-600 text-white font-black uppercase py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-all">
                                                    {alertForm.id ? 'Save Changes' : 'Set Alarm Engine'}
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    <div className="grid grid-cols-1 gap-3">
                                        {alerts.length > 0 ? (
                                            alerts.map((alert, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-l-8 border-indigo-600 group hover:bg-white hover:shadow-md transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-lg">
                                                            {alert.icon || '💧'}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-lg text-gray-800 leading-none">{alert.scheduledTime}</p>
                                                            <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">{alert.message || alert.title}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                            <span className="text-[10px] font-black text-green-600 uppercase">Live</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleAlertDelete(alert._id)}
                                                            className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        >
                                                            <FaEraser size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center py-10 font-bold text-gray-400 uppercase text-xs italic">No manual alarms set.</p>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-8 flex items-center gap-3 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <FaBell className="text-white animate-bounce" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-indigo-900 uppercase tracking-tighter">{alerts.length} Automatic Routine Alerts</p>
                                        <p className="text-[9px] font-bold text-indigo-600 uppercase opacity-80">Strictly Managed by Engine</p>
                                    </div>
                                </div>
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
                    </div >
                );

            case 'kadan':
                // Use the kadanList state fetched from /api/sales/kadan
                const totalUnpaid = kadanList.reduce((sum, s) => sum + s.totalAmount, 0);

                return (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black uppercase text-gray-800 flex items-center gap-4">
                                <FaBook className="text-red-500" /> Kadan Ledger (Credit Log)
                            </h2>
                            <div className="bg-red-100 px-6 py-3 rounded-2xl border-2 border-red-200">
                                <span className="text-xs font-black uppercase text-red-400 block">Total Pending</span>
                                <span className="text-3xl font-black text-red-600">₹{totalUnpaid}</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-xl">
                            {kadanList.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b-2 border-gray-100">
                                                <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Date</th>
                                                <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Customer</th>
                                                <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Product</th>
                                                <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Amount</th>
                                                <th className="text-right py-4 text-xs font-black uppercase text-gray-400">Settle via</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {kadanList.map((k, idx) => (
                                                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                                                    <td className="py-4 text-sm font-bold text-gray-600">{formatDate(k.date)}</td>
                                                    <td className="py-4">
                                                        <p className="font-black text-gray-800 uppercase">{k.customerName}</p>
                                                        <p className="text-[10px] text-gray-400">{k.contactNumber}</p>
                                                    </td>
                                                    <td className="py-4 text-sm font-black italic">{k.quantity} {k.unit} {k.productType}</td>
                                                    <td className="py-4 text-lg font-black text-red-600">₹{k.totalAmount}</td>
                                                    <td className="py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm(`Settle ₹${k.totalAmount} via CASH?`)) {
                                                                        const res = await fetch(`http://localhost:5000/api/sales/${k._id}/settle`, {
                                                                            method: 'PATCH',
                                                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                                            body: JSON.stringify({ settledBy: 'Cash' })
                                                                        });
                                                                        if (res.ok) {
                                                                            window.location.reload();
                                                                        }
                                                                    }
                                                                }}
                                                                className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-green-700 transition-all"
                                                            >
                                                                💵 Cash
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm(`Settle ₹${k.totalAmount} via GPAY?`)) {
                                                                        const res = await fetch(`http://localhost:5000/api/sales/${k._id}/settle`, {
                                                                            method: 'PATCH',
                                                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                                            body: JSON.stringify({ settledBy: 'GPay' })
                                                                        });
                                                                        if (res.ok) {
                                                                            window.location.reload();
                                                                        }
                                                                    }
                                                                }}
                                                                className="bg-purple-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-purple-700 transition-all"
                                                            >
                                                                📱 GPay
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-20 text-center">
                                    <FaCheckCircle className="text-64px text-green-500 mx-auto mb-4 opacity-20" size={64} />
                                    <p className="font-black uppercase text-gray-400 tracking-widest text-xl">All Credits Settled! No Kadan.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'sales':
                return (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Sales Form */}
                            <div className="bg-white rounded-3xl p-8 shadow-xl">
                                <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                                    <h3 className="text-xl font-black uppercase text-gray-800 flex items-center gap-3">
                                        <FaShoppingCart className="text-green-500" /> Record Sale
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <select value={selectedDate || ''} onChange={e => setSelectedDate(e.target.value ? Number(e.target.value) : null)} className="text-xs font-bold border rounded-lg px-2 py-1">
                                            <option value="">All Dates</option>
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="text-xs font-bold border rounded-lg px-2 py-1">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="text-xs font-bold border rounded-lg px-2 py-1">
                                            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <form onSubmit={handleSaleSubmit} className="space-y-6">
                                    <div>
                                        <label className="text-sm font-black uppercase text-gray-600 block mb-3">Product Type</label>
                                        <select
                                            value={saleForm.productType}
                                            onChange={e => setSaleForm({ ...saleForm, productType: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-5 font-black text-lg text-gray-800 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all appearance-none"
                                        >
                                            <option value="Mushroom">🍄 Mushroom</option>
                                            <option value="Seeds">🌱 Seeds</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="text-sm font-black uppercase text-gray-600 block mb-3">Quantity</label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={saleForm.quantity}
                                                onChange={e => setSaleForm({ ...saleForm, quantity: Number(e.target.value) })}
                                                className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-5 font-black text-lg text-gray-800 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-black uppercase text-gray-600 block mb-3">Price / Unit (₹)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={saleForm.pricePerUnit}
                                                onChange={e => setSaleForm({ ...saleForm, pricePerUnit: Number(e.target.value) })}
                                                className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-5 font-black text-lg text-gray-800 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <label className="text-sm font-black uppercase text-gray-600 block mb-3">Customer Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={saleForm.customerName}
                                            onChange={e => handleCustomerNameChange(e.target.value)}
                                            onBlur={() => setTimeout(() => setCustomerSuggestions([]), 200)}
                                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-5 font-black text-lg text-gray-800"
                                            placeholder="Enter name (Auto-fill)"
                                        />
                                        {customerSuggestions.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl z-10 max-h-40 overflow-y-auto mt-1">
                                                {customerSuggestions.map((customer, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => selectCustomer(customer)}
                                                        className="px-6 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <div className="font-black text-gray-800">{customer.name}</div>
                                                        <div className="text-sm text-gray-500">{customer.contactNumber}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-black uppercase text-gray-600 block mb-3">Phone Number</label>
                                        <input
                                            id="customerPhone"
                                            type="tel"
                                            required
                                            value={saleForm.contactNumber}
                                            onChange={e => setSaleForm({ ...saleForm, contactNumber: e.target.value })}
                                            onInput={e => setSaleForm({ ...saleForm, contactNumber: e.target.value })}
                                            onBlur={e => setSaleForm({ ...saleForm, contactNumber: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-5 font-black text-lg text-gray-800 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                                            placeholder="Auto-fills from name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-black uppercase text-gray-600 block mb-3">💳 Selection Payment Type</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 'Cash', label: 'Cash', icon: '💵', color: 'green' },
                                                { id: 'GPay', label: 'GPay', icon: '📱', color: 'purple' },
                                                { id: 'Credit', label: 'Kadan', icon: '🔴', color: 'red' }
                                            ].map(type => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setSaleForm({ ...saleForm, paymentType: type.id })}
                                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${saleForm.paymentType === type.id
                                                        ? (type.color === 'green' ? 'bg-green-50 border-green-500 shadow-inner scale-95' :
                                                            type.color === 'purple' ? 'bg-purple-50 border-purple-500 shadow-inner scale-95' :
                                                                'bg-red-50 border-red-500 shadow-inner scale-95')
                                                        : 'bg-white border-gray-100 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <span className="text-2xl mb-1">{type.icon}</span>
                                                    <span className={`text-[10px] font-black uppercase ${saleForm.paymentType === type.id
                                                        ? (type.color === 'green' ? 'text-green-700' :
                                                            type.color === 'purple' ? 'text-purple-700' :
                                                                'text-red-700')
                                                        : 'text-gray-400'
                                                        }`}>
                                                        {type.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-green-100 rounded-2xl p-6 border-2 border-green-200 shadow-inner">
                                        <p className="text-sm font-black text-green-700 uppercase mb-1">Total Amount</p>
                                        <p className="text-5xl font-black text-green-900">₹{saleForm.quantity * saleForm.pricePerUnit}</p>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-6 rounded-2xl font-black text-xl uppercase tracking-wider hover:shadow-2xl active:scale-95 transition-all shadow-lg"
                                    >
                                        Record Sale & Send Bill
                                    </button>
                                </form>
                            </div>

                            {/* Sales History & Summary */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Totals Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-white rounded-3xl p-5 shadow-lg border-b-4 border-green-500">
                                        <p className="text-[10px] font-black uppercase text-gray-400">Total Cash</p>
                                        <p className="text-2xl font-black text-green-600">
                                            ₹{sales.filter(s => {
                                                const d = new Date(s.date);
                                                const matchesMonth = (d.getMonth() + 1) === selectedMonth;
                                                const matchesYear = d.getFullYear() === selectedYear;
                                                const matchesDate = selectedDate === null || d.getDate() === selectedDate;
                                                return matchesMonth && matchesYear && matchesDate && s.paymentType === 'Cash';
                                            }).reduce((sum, s) => sum + s.totalAmount, 0)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-3xl p-5 shadow-lg border-b-4 border-purple-500">
                                        <p className="text-[10px] font-black uppercase text-gray-400">Total GPay</p>
                                        <p className="text-2xl font-black text-purple-600">
                                            ₹{sales.filter(s => {
                                                const d = new Date(s.date);
                                                const matchesMonth = (d.getMonth() + 1) === selectedMonth;
                                                const matchesYear = d.getFullYear() === selectedYear;
                                                const matchesDate = selectedDate === null || d.getDate() === selectedDate;
                                                return matchesMonth && matchesYear && matchesDate && s.paymentType === 'GPay';
                                            }).reduce((sum, s) => sum + s.totalAmount, 0)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-3xl p-5 shadow-lg border-b-4 border-red-500">
                                        <p className="text-[10px] font-black uppercase text-gray-400">Total Kadan</p>
                                        <p className="text-2xl font-black text-red-600">
                                            ₹{sales.filter(s => {
                                                const d = new Date(s.date);
                                                const matchesMonth = (d.getMonth() + 1) === selectedMonth;
                                                const matchesYear = d.getFullYear() === selectedYear;
                                                const matchesDate = selectedDate === null || d.getDate() === selectedDate;
                                                return matchesMonth && matchesYear && matchesDate && s.paymentType === 'Credit' && s.paymentStatus === 'Unpaid';
                                            }).reduce((sum, s) => sum + s.totalAmount, 0)}
                                        </p>
                                    </div>
                                    <div className="bg-gray-900 rounded-3xl p-5 shadow-xl text-white">
                                        <p className="text-[10px] font-black uppercase text-gray-400">Total Income</p>
                                        <p className="text-2xl font-black">
                                            ₹{sales.filter(s => {
                                                const d = new Date(s.date);
                                                const matchesMonth = (d.getMonth() + 1) === selectedMonth;
                                                const matchesYear = d.getFullYear() === selectedYear;
                                                const matchesDate = selectedDate === null || d.getDate() === selectedDate;
                                                return matchesMonth && matchesYear && matchesDate;
                                            }).reduce((sum, s) => sum + s.totalAmount, 0)}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl p-8 shadow-xl">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-black uppercase text-gray-800 flex items-center gap-3">
                                            <FaHistory className="text-blue-500" /> Recent Sales
                                        </h3>
                                        <button
                                            onClick={exportSalesToExcel}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all flex items-center gap-2"
                                        >
                                            <FaFileExcel /> Export Excel
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b-2 border-gray-100">
                                                    <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Date</th>
                                                    <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Product</th>
                                                    <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Qty</th>
                                                    <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Price</th>
                                                    <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Pay</th>
                                                    <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Total</th>
                                                    <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Customer</th>
                                                    <th className="text-right py-4 text-xs font-black uppercase text-gray-400">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sales.filter(s => {
                                                    const d = new Date(s.date);
                                                    const matchesMonth = (d.getMonth() + 1) === selectedMonth;
                                                    const matchesYear = d.getFullYear() === selectedYear;
                                                    const matchesDate = selectedDate === null || d.getDate() === selectedDate;
                                                    return matchesMonth && matchesYear && matchesDate;
                                                }).map((sale, idx) => (
                                                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                                                        <td className="py-4 text-sm font-bold text-gray-600">
                                                            {formatDate(sale.date)}
                                                        </td>
                                                        <td className="py-4">
                                                            {editingSalesId === sale._id ? (
                                                                <select
                                                                    value={editedData[sale._id]?.productType || sale.productType}
                                                                    onChange={(e) => setEditedData(prev => ({
                                                                        ...prev,
                                                                        [sale._id]: { ...prev[sale._id], productType: e.target.value }
                                                                    }))}
                                                                    className="w-full px-2 py-1 text-[10px] font-black border-2 border-blue-500 rounded"
                                                                >
                                                                    <option value="Mushroom">🍄 Mushroom</option>
                                                                    <option value="Seeds">🌱 Seeds</option>
                                                                </select>
                                                            ) : (
                                                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-700">
                                                                    {sale.productType}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-4 text-sm font-black italic">
                                                            {editingSalesId === sale._id ? (
                                                                <input
                                                                    type="number"
                                                                    value={editedData[sale._id]?.quantity || sale.quantity}
                                                                    onChange={(e) => setEditedData(prev => ({
                                                                        ...prev,
                                                                        [sale._id]: { ...prev[sale._id], quantity: Number(e.target.value) }
                                                                    }))}
                                                                    className={`w-16 px-2 py-1 text-sm font-black border-2 rounded ${editingSalesId === sale._id ? 'border-blue-500' : 'border-gray-300'}`}
                                                                    readOnly={editingSalesId !== sale._id}
                                                                />
                                                            ) : (
                                                                `${sale.quantity} ${sale.unit}`
                                                            )}
                                                        </td>
                                                        <td className="py-4 text-sm font-black">
                                                            {editingSalesId === sale._id ? (
                                                                <input
                                                                    type="number"
                                                                    value={editedData[sale._id]?.pricePerUnit || sale.pricePerUnit}
                                                                    onChange={(e) => setEditedData(prev => ({
                                                                        ...prev,
                                                                        [sale._id]: { ...prev[sale._id], pricePerUnit: Number(e.target.value) }
                                                                    }))}
                                                                    className="w-16 px-2 py-1 text-sm font-black border-2 border-blue-500 rounded"
                                                                />
                                                            ) : (
                                                                `₹${sale.pricePerUnit}`
                                                            )}
                                                        </td>
                                                        <td className="py-4">
                                                            {editingSalesId === sale._id ? (
                                                                <select
                                                                    value={editedData[sale._id]?.paymentType || sale.paymentType}
                                                                    onChange={(e) => setEditedData(prev => ({
                                                                        ...prev,
                                                                        [sale._id]: { ...prev[sale._id], paymentType: e.target.value }
                                                                    }))}
                                                                    className="w-full px-2 py-1 text-[9px] font-black border-2 border-blue-500 rounded"
                                                                >
                                                                    <option value="Cash">Cash</option>
                                                                    <option value="GPay">GPay</option>
                                                                    <option value="Credit">Kadan</option>
                                                                </select>
                                                            ) : (
                                                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${sale.paymentType === 'Cash' ? 'bg-green-100 text-green-700' :
                                                                    sale.paymentType === 'GPay' ? 'bg-purple-100 text-purple-700' :
                                                                        'bg-red-100 text-red-700'
                                                                    }`}>
                                                                    {sale.paymentType === 'Credit' ? 'Kadan' : sale.paymentType}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-4 text-sm font-black text-green-600">
                                                            {editingSalesId === sale._id ? (
                                                                <span className="text-sm font-black text-green-600">
                                                                    ₹{(editedData[sale._id]?.quantity || sale.quantity) * (editedData[sale._id]?.pricePerUnit || sale.pricePerUnit)}
                                                                </span>
                                                            ) : (
                                                                `₹${sale.totalAmount}`
                                                            )}
                                                        </td>
                                                        <td className="py-4">
                                                            {editingSalesId === sale._id ? (
                                                                <div className="flex flex-col gap-1">
                                                                    <input
                                                                        type="text"
                                                                        value={editedData[sale._id]?.customerName || sale.customerName}
                                                                        onChange={(e) => setEditedData(prev => ({
                                                                            ...prev,
                                                                            [sale._id]: { ...prev[sale._id], customerName: e.target.value }
                                                                        }))}
                                                                        className="w-full px-2 py-1 text-[10px] font-black border-2 border-blue-500 rounded"
                                                                        placeholder="Customer Name"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={editedData[sale._id]?.contactNumber || sale.contactNumber}
                                                                        onChange={(e) => setEditedData(prev => ({
                                                                            ...prev,
                                                                            [sale._id]: { ...prev[sale._id], contactNumber: e.target.value }
                                                                        }))}
                                                                        className="w-full px-2 py-1 text-[10px] font-black border-2 border-blue-500 rounded"
                                                                        placeholder="Contact Number"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-black text-gray-800 uppercase">{sale.customerName}</span>
                                                                    <span className="text-[10px] font-bold text-gray-400">{sale.contactNumber}</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-4 text-right flex gap-2 justify-end">
                                                            {editingSalesId === sale._id ? (
                                                                <>
                                                                    <button
                                                                        onClick={async () => {
                                                                            const updatedData = editedData[sale._id];
                                                                            if (updatedData) {
                                                                                const quantity = updatedData.quantity || sale.quantity;
                                                                                const pricePerUnit = updatedData.pricePerUnit || sale.pricePerUnit;
                                                                                const totalAmount = quantity * pricePerUnit;

                                                                                await fetch(`http://localhost:5000/api/edit/sales/${sale._id}`, {
                                                                                    method: 'PATCH',
                                                                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                                                    body: JSON.stringify({
                                                                                        productType: updatedData.productType || sale.productType,
                                                                                        quantity: quantity,
                                                                                        pricePerUnit: pricePerUnit,
                                                                                        paymentType: updatedData.paymentType || sale.paymentType,
                                                                                        totalAmount: totalAmount,
                                                                                        customerName: updatedData.customerName || sale.customerName,
                                                                                        contactNumber: updatedData.contactNumber || sale.contactNumber
                                                                                    })
                                                                                });
                                                                                setEditingSalesId(null);
                                                                                setEditedData(prev => {
                                                                                    const newData = { ...prev };
                                                                                    delete newData[sale._id];
                                                                                    return newData;
                                                                                });
                                                                                fetchData();
                                                                            }
                                                                        }}
                                                                        className="text-green-500 font-black text-[10px] hover:underline"
                                                                    >
                                                                        SAVE
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingSalesId(null);
                                                                            setEditedData(prev => {
                                                                                const newData = { ...prev };
                                                                                delete newData[sale._id];
                                                                                return newData;
                                                                            });
                                                                        }}
                                                                        className="text-orange-500 font-black text-[10px] hover:underline"
                                                                    >
                                                                        RESET
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setEditingSalesId(sale._id)}
                                                                    className="text-blue-500 font-black text-[10px] hover:underline"
                                                                >
                                                                    EDIT
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleDelete('sales', sale._id)} className="text-red-400 hover:text-red-700"><FaEraser /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-gray-800 text-white font-black text-xs">
                                                    <td colSpan="3" className="py-4 px-6 uppercase tracking-widest">Total Sales ({selectedDate ? `${selectedDate}/` : ''}{selectedMonth}/{selectedYear})</td>
                                                    <td className="py-4">₹{sales.filter(s => {
                                                        const d = new Date(s.date);
                                                        const matchesMonth = (d.getMonth() + 1) === selectedMonth;
                                                        const matchesYear = d.getFullYear() === selectedYear;
                                                        const matchesDate = selectedDate === null || d.getDate() === selectedDate;
                                                        return matchesMonth && matchesYear && matchesDate;
                                                    }).reduce((sum, s) => sum + s.totalAmount, 0)}</td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
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
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black uppercase text-gray-800 flex items-center gap-3">
                                        <FaReceipt className="text-red-500" /> Record Expense
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <select value={selectedDate || ''} onChange={e => setSelectedDate(e.target.value ? Number(e.target.value) : null)} className="text-xs font-bold border rounded-lg px-2 py-1">
                                            <option value="">All Dates</option>
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="text-xs font-bold border rounded-lg px-2 py-1">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="text-xs font-bold border rounded-lg px-2 py-1">
                                            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <form onSubmit={handleExpenditureSubmit} className="space-y-6">
                                    <div>
                                        <label className="text-sm font-black uppercase text-gray-600 block mb-3">Category</label>
                                        <select
                                            value={expenditureForm.category}
                                            onChange={e => setExpenditureForm({ ...expenditureForm, category: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-5 font-black text-lg text-gray-800 focus:border-red-400 focus:ring-4 focus:ring-red-100 outline-none transition-all appearance-none"
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
                                        <label className="text-sm font-black uppercase text-gray-600 block mb-3">Description</label>
                                        <input
                                            type="text"
                                            value={expenditureForm.description}
                                            onChange={e => setExpenditureForm({ ...expenditureForm, description: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-5 font-black text-lg text-gray-800 focus:border-red-400 focus:ring-4 focus:ring-red-100 outline-none transition-all"
                                            placeholder="Details (optional)"
                                        />
                                    </div>
                                    {expenditureForm.category === 'Seeds' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="text-sm font-black uppercase text-gray-600 block mb-3">Quantity (kg)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={expenditureForm.quantity}
                                                    onChange={e => setExpenditureForm({ ...expenditureForm, quantity: Number(e.target.value) })}
                                                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-5 font-black text-lg text-gray-800 focus:border-red-400 focus:ring-4 focus:ring-red-100 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <label className="flex items-center gap-4 cursor-pointer bg-blue-50 rounded-2xl px-6 py-5 border-2 border-blue-200 w-full shadow-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={expenditureForm.addToInventory}
                                                        onChange={e => setExpenditureForm({ ...expenditureForm, addToInventory: e.target.checked })}
                                                        className="w-6 h-6 text-blue-600"
                                                    />
                                                    <span className="text-sm font-black text-blue-800 uppercase">Add to Inventory</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm font-black uppercase text-gray-600 block mb-3">Amount (₹)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={expenditureForm.amount}
                                            onChange={e => setExpenditureForm({ ...expenditureForm, amount: Number(e.target.value) })}
                                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-5 font-black text-lg text-gray-800 focus:border-red-400 focus:ring-4 focus:ring-red-100 outline-none transition-all"
                                            placeholder="Enter amount"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-gradient-to-r from-red-600 to-rose-700 text-white py-6 rounded-2xl font-black text-xl uppercase tracking-wider hover:shadow-2xl active:scale-95 transition-all shadow-lg"
                                        >
                                            Record Expenditure
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setExpenditureForm({ category: 'Seeds', description: '', quantity: 0, unit: 'kg', amount: 0, addToInventory: false })}
                                            className="bg-gray-100 text-gray-500 px-6 rounded-2xl font-black hover:bg-gray-200 transition-all"
                                            title="Clear Form"
                                        >
                                            <FaEraser />
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Expenditure History */}
                            <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-black uppercase text-gray-800 flex items-center gap-3">
                                        <FaReceipt className="text-red-500" /> Expenditure History
                                    </h3>
                                    <button
                                        onClick={exportExpenditureToExcel}
                                        className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-700 transition-all flex items-center gap-2"
                                    >
                                        <FaFileExcel /> Export Excel
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b-2 border-gray-100">
                                                <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Date</th>
                                                <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Category</th>
                                                <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Description</th>
                                                <th className="text-left py-4 text-xs font-black uppercase text-gray-400">Amount</th>
                                                <th className="text-right py-4 text-xs font-black uppercase text-gray-400">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expenditures.filter(e => {
                                                const d = new Date(e.date);
                                                const matchesMonth = (d.getMonth() + 1) === selectedMonth;
                                                const matchesYear = d.getFullYear() === selectedYear;
                                                const matchesDate = selectedDate === null || d.getDate() === selectedDate;
                                                return matchesMonth && matchesYear && matchesDate;
                                            }).map((exp, idx) => (
                                                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                                                    <td className="py-4 text-sm font-bold text-gray-600">
                                                        {editingExpenditureId === exp._id ? (
                                                            <input
                                                                type="date"
                                                                value={editedData[exp._id]?.date?.split('T')[0] ?? new Date(exp.date).toISOString().split('T')[0]}
                                                                onChange={(e) => setEditedData(prev => ({
                                                                    ...prev,
                                                                    [exp._id]: { ...prev[exp._id], date: e.target.value }
                                                                }))}
                                                                className="w-full px-2 py-1 border rounded text-xs"
                                                            />
                                                        ) : (
                                                            formatDate(exp.date)
                                                        )}
                                                    </td>
                                                    <td className="py-4">
                                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700">
                                                            {exp.category}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-sm text-gray-600 font-bold">
                                                        {editingExpenditureId === exp._id ? (
                                                            <input
                                                                type="text"
                                                                value={editedData[exp._id]?.description ?? exp.description ?? ''}
                                                                onChange={(e) => setEditedData(prev => ({
                                                                    ...prev,
                                                                    [exp._id]: { ...prev[exp._id], description: e.target.value }
                                                                }))}
                                                                className="w-full px-2 py-1 border rounded text-xs"
                                                            />
                                                        ) : (
                                                            exp.description || '-'
                                                        )}
                                                    </td>
                                                    <td className="py-4 text-sm font-black text-red-600">
                                                        {editingExpenditureId === exp._id ? (
                                                            <input
                                                                type="number"
                                                                value={editedData[exp._id]?.amount ?? exp.amount ?? 0}
                                                                onChange={(e) => setEditedData(prev => ({
                                                                    ...prev,
                                                                    [exp._id]: { ...prev[exp._id], amount: Number(e.target.value) }
                                                                }))}
                                                                className="w-20 px-2 py-1 border rounded text-xs"
                                                            />
                                                        ) : (
                                                            `₹${exp.amount}`
                                                        )}
                                                    </td>
                                                    <td className="py-4 text-right flex gap-3 justify-end items-center">
                                                        {editingExpenditureId === exp._id ? (
                                                            <>
                                                                <button
                                                                    onClick={async () => {
                                                                        const updateBody = editedData[exp._id];
                                                                        if (updateBody) {
                                                                            await fetch(`http://localhost:5000/api/edit/expenditure/${exp._id}`, {
                                                                                method: 'PATCH',
                                                                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                                                body: JSON.stringify(updateBody)
                                                                            });
                                                                            setEditingExpenditureId(null);
                                                                            setEditedData(prev => {
                                                                                const rd = { ...prev };
                                                                                delete rd[exp._id];
                                                                                return rd;
                                                                            });
                                                                            fetchData();
                                                                        }
                                                                    }}
                                                                    className="text-green-600 font-black text-[10px] uppercase hover:underline"
                                                                >
                                                                    SAVE
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingExpenditureId(null);
                                                                        setEditedData(prev => {
                                                                            const rd = { ...prev };
                                                                            delete rd[exp._id];
                                                                            return rd;
                                                                        });
                                                                    }}
                                                                    className="text-orange-500 font-black text-[10px] uppercase hover:underline"
                                                                >
                                                                    RESET
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => setEditingExpenditureId(exp._id)}
                                                                    className="text-blue-500 font-black text-[10px] uppercase hover:underline"
                                                                >
                                                                    EDIT
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete('expenditure', exp._id)}
                                                                    className="text-red-400 hover:text-red-700 transition-all"
                                                                    title="Delete"
                                                                >
                                                                    <FaEraser />
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-800 text-white font-black text-xs">
                                                <td colSpan="3" className="py-4 px-6 uppercase tracking-widest">Total Expenses ({selectedMonth}/{selectedYear})</td>
                                                <td className="py-4">₹{expenditures.filter(e => {
                                                    const d = new Date(e.date);
                                                    return (d.getMonth() + 1) === selectedMonth && d.getFullYear() === selectedYear;
                                                }).reduce((sum, e) => sum + e.amount, 0)}</td>
                                                <td></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'analytics':
                // 1. Prepare Data for Sales vs Expenses (Monthly)
                const monthlyData = [];
                sales.forEach(s => {
                    const date = new Date(s.date);
                    const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
                    let entry = monthlyData.find(d => d.name === key);
                    if (!entry) {
                        entry = { name: key, Sales: 0, Expenses: 0 };
                        monthlyData.push(entry);
                    }
                    entry.Sales += s.totalAmount;
                });
                expenditures.forEach(e => {
                    const date = new Date(e.date);
                    const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
                    let entry = monthlyData.find(d => d.name === key);
                    if (!entry) {
                        entry = { name: key, Sales: 0, Expenses: 0 };
                        monthlyData.push(entry);
                    }
                    entry.Expenses += e.amount;
                });
                // Sort by earliest date (using a dummy date comparison would be better but simple string match for now assumes standard entry order or small dataset)

                // 2. Prepare Data for Expense Breakdown
                const expenseMap = {};
                expenditures.forEach(e => {
                    expenseMap[e.category] = (expenseMap[e.category] || 0) + e.amount;
                });
                const expensePieData = Object.keys(expenseMap).map(key => ({ name: key, value: expenseMap[key] }));
                const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

                return (
                    <div className="space-y-8 animate-fadeIn">
                        <h2 className="text-2xl font-black uppercase text-gray-800">Farm Analytics</h2>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* 1. Revenue vs Expenses */}
                            <div className="bg-white p-6 rounded-3xl shadow-xl">
                                <h3 className="text-lg font-black text-gray-700 mb-4">💰 Sales vs Expenses Trend</h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="Sales" fill="#82ca9d" name="Sales (₹)" />
                                            <Bar dataKey="Expenses" fill="#ff7f7f" name="Expenses (₹)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* 2. Expense Category Breakdown */}
                            <div className="bg-white p-6 rounded-3xl shadow-xl">
                                <h3 className="text-lg font-black text-gray-700 mb-4">💸 Expense Breakdown</h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={expensePieData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {expensePieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'inventory':
                return (
                    <div className="space-y-8 animate-fadeIn p-6 rounded-[2.5rem] shadow-inner" style={{ backgroundColor: '#CBCCCB' }}>
                        {/* 1. Header & Quick Actions */}
                        <div className="flex flex-col md:flex-row justify-between items-center bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/50 gap-4">
                            <div>
                                <h2 className="text-3xl font-black uppercase text-gray-800 tracking-tighter">Inventory Hub</h2>
                                <p className="text-xs font-bold text-gray-600 uppercase italic">Master Stock & Daily Consumption</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 bg-white/50 p-2 rounded-2xl border border-white">
                                    <select value={exportMonth} onChange={e => setExportMonth(Number(e.target.value))} className="bg-transparent border-none outline-none text-xs font-black text-gray-800 px-2">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <select value={exportYear} onChange={e => setExportYear(Number(e.target.value))} className="bg-transparent border-none outline-none text-xs font-black text-gray-800 px-2">
                                        {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <button onClick={() => exportMonthlyReport('inventory')} className="bg-green-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase hover:scale-105 transition-all shadow-lg flex items-center gap-2">
                                    <FaFileExcel /> Export Inventory
                                </button>
                                <button onClick={handleResetInventory} className="bg-red-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase hover:scale-105 transition-all shadow-lg flex items-center gap-2">
                                    <FaEraser /> Reset All
                                </button>
                                <button
                                    onClick={() => setShowAddItem(!showAddItem)}
                                    className="bg-indigo-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                                >
                                    <FaPlusCircle /> {showAddItem ? 'Hide' : 'Add New'}
                                </button>
                            </div>
                        </div>

                        {/* 2. Add New Item Form */}
                        {showAddItem && (
                            <div className="bg-white/80 backdrop-blur-sm border-2 border-white rounded-3xl p-8 shadow-2xl animate-slideDown">
                                <h3 className="text-lg font-black uppercase text-indigo-900 mb-6 flex items-center gap-2">
                                    <FaPlusCircle className="text-indigo-600" /> Create New Inventory Category
                                </h3>
                                <form onSubmit={handleCreateInventoryItem} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">Item Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={inventoryForm.itemName}
                                            onChange={e => setInventoryForm({ ...inventoryForm, itemName: e.target.value })}
                                            className="w-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-800 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="e.g. Plastic Sleeves"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">Starting Stock</label>
                                        <input
                                            type="number"
                                            required
                                            value={inventoryForm.startingStock}
                                            onChange={e => setInventoryForm({ ...inventoryForm, startingStock: Number(e.target.value) })}
                                            className="w-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-800 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">Unit</label>
                                        <select
                                            value={inventoryForm.unit}
                                            onChange={e => setInventoryForm({ ...inventoryForm, unit: e.target.value })}
                                            className="w-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-800 focus:border-indigo-500 outline-none transition-all"
                                        >
                                            <option value="bags">Bags</option>
                                            <option value="pockets">Pockets</option>
                                            <option value="kg">Kg</option>
                                            <option value="liters">Liters</option>
                                            <option value="nos">Nos</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-4 flex justify-end">
                                        <button type="submit" className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl active:scale-95 transition-all">
                                            Initialize Category
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* 3. Master List Table */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-8 shadow-2xl overflow-hidden border border-white">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                    <FaWarehouse className="text-amber-600" />
                                </div>
                                {/* --- MANUAL BLOG FORM --- */}
                                <div className="glass-box" style={{ padding: '20px', marginTop: '20px', background: 'rgba(255, 255, 255, 0.1)' }}>
                                    <h3 style={{ color: '#fff' }}>🍄 Post New Mushroom Blog</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <input
                                            type="text"
                                            placeholder="Blog Title"
                                            value={blogData.title}
                                            onChange={(e) => setBlogData({ ...blogData, title: e.target.value })}
                                            style={{ padding: '10px', borderRadius: '5px', border: 'none' }}
                                        />
                                        <textarea
                                            placeholder="Mushroom Growing Secrets..."
                                            value={blogData.content}
                                            onChange={(e) => setBlogData({ ...blogData, content: e.target.value })}
                                            style={{ padding: '10px', borderRadius: '5px', border: 'none', height: '80px' }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Anti-Gravity Image Link"
                                            value={blogData.image}
                                            onChange={(e) => setBlogData({ ...blogData, image: e.target.value })}
                                            style={{ padding: '10px', borderRadius: '5px', border: 'none' }}
                                        />
                                        <button onClick={handleBlogSubmit} style={{ background: '#FFD700', padding: '10px', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                            PUBLISH BLOG
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black uppercase text-gray-800">Inventory Master List</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-100">
                                            <th className="py-4 text-left text-[10px] font-black uppercase text-gray-400">Edit</th>
                                            <th className="py-4 text-left text-[10px] font-black uppercase text-gray-400">Item Name</th>
                                            <th className="py-4 text-center text-[10px] font-black uppercase text-gray-400">Stock Status</th>
                                            <th className="py-4 text-center text-[10px] font-black uppercase text-gray-400">Initial</th>
                                            <th className="py-4 text-left text-[10px] font-black uppercase text-gray-400">Unit</th>
                                            <th className="py-4 text-right text-[10px] font-black uppercase text-gray-400">Quick Tools</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventory.map((item) => (
                                            <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50 transition-all font-bold">
                                                <td className="py-5">
                                                    <button onClick={() => setEditingProduct(item)} className="text-blue-500 hover:scale-125 transition-all"><FaBox /></button>
                                                </td>
                                                <td className="py-5 text-gray-800 uppercase text-sm tracking-tight">{item.itemName}</td>
                                                <td className="py-5 text-center">
                                                    <span className={`text-xl font-black ${item.currentStock < (item.startingStock * 0.2) ? 'text-red-500 animate-pulse' : 'text-indigo-600'}`}>
                                                        {item.currentStock}
                                                    </span>
                                                </td>
                                                <td className="py-5 text-center text-xs text-gray-400">{item.startingStock}</td>
                                                <td className="py-5 text-[10px] font-black text-gray-500 uppercase">{item.unit}</td>
                                                <td className="py-5">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => {
                                                            const q = prompt("Use Amount:", "1");
                                                            if (q) handleInventoryUpdate(item._id, 'use', Number(q));
                                                        }} className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase hover:bg-red-100 border border-red-100">- Use</button>
                                                        <button onClick={() => {
                                                            const q = prompt("Add Amount:", "1");
                                                            if (q) handleInventoryUpdate(item._id, 'add', Number(q));
                                                        }} className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase hover:bg-green-100 border border-green-100">+ Add</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 4. Daily Intake History (Seeds Primary) */}
                        <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] p-10 shadow-2xl border-4 border-white">
                            <h3 className="text-2xl font-black uppercase text-gray-800 mb-8 flex items-center gap-4">
                                <div className="p-3 bg-green-100 rounded-2xl"><FaSeedling className="text-green-600" /></div>
                                Daily Seed Intake Detail
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 text-[10px] text-gray-400 uppercase font-black tracking-widest italic">
                                            <th className="py-4 text-left">Date</th>
                                            <th className="py-4 text-left">Type</th>
                                            <th className="py-4 text-left">Quantity</th>
                                            <th className="py-4 text-left">Notes</th>
                                            <th className="py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventory.find(i => i.itemName === 'Seeds')?.usageHistory?.slice(-20).reverse().map((h, idx) => (
                                            <tr key={h._id || idx} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                                                <td className="py-5">
                                                    {editingSeedIdx === idx ? (
                                                        <input
                                                            type="date"
                                                            value={editedData[`seed-${idx}`]?.date || new Date(h.date).toISOString().split('T')[0]}
                                                            onChange={(e) => setEditedData(prev => ({ ...prev, [`seed-${idx}`]: { ...prev[`seed-${idx}`], date: e.target.value } }))}
                                                            className="bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold"
                                                        />
                                                    ) : (
                                                        <span className="font-bold text-sm text-gray-600">{formatDate(h.date)}</span>
                                                    )}
                                                </td>
                                                <td className="py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${h.type === 'add' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {h.type === 'add' ? 'Added' : 'Used'}
                                                    </span>
                                                </td>
                                                <td className="py-5">
                                                    {editingSeedIdx === idx ? (
                                                        <input
                                                            type="number"
                                                            value={editedData[`seed-${idx}`]?.quantity ?? h.quantity}
                                                            onChange={(e) => setEditedData(prev => ({ ...prev, [`seed-${idx}`]: { ...prev[`seed-${idx}`], quantity: Number(e.target.value) } }))}
                                                            className="w-20 bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold"
                                                        />
                                                    ) : (
                                                        <span className={`font-black text-sm ${h.type === 'add' ? 'text-green-600' : 'text-red-500'}`}>
                                                            {h.type === 'add' ? '+' : '-'}{h.quantity} kg
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-5">
                                                    {editingSeedIdx === idx ? (
                                                        <input
                                                            type="text"
                                                            value={editedData[`seed-${idx}`]?.notes || h.notes || ''}
                                                            onChange={(e) => setEditedData(prev => ({ ...prev, [`seed-${idx}`]: { ...prev[`seed-${idx}`], notes: e.target.value } }))}
                                                            className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-400 text-xs italic">{h.notes || '-'}</span>
                                                    )}
                                                </td>
                                                <td className="py-5 text-right">
                                                    {editingSeedIdx === idx ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={async () => {
                                                                    const item = inventory.find(i => i.itemName === 'Seeds');
                                                                    const up = editedData[`seed-${idx}`];
                                                                    if (item && up) {
                                                                        await fetch(`http://localhost:5000/api/inventory/usage/${h._id}`, {
                                                                            method: 'PUT',
                                                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                                            body: JSON.stringify({
                                                                                quantity: up.quantity ?? h.quantity,
                                                                                notes: up.notes ?? h.notes,
                                                                                date: up.date ?? h.date
                                                                            })
                                                                        });
                                                                        setEditingSeedIdx(null);
                                                                        fetchData();
                                                                    }
                                                                }}
                                                                className="text-green-600 font-black text-[10px] uppercase hover:underline"
                                                            >Save</button>
                                                            <button onClick={() => setEditingSeedIdx(null)} className="text-orange-500 font-black text-[10px] uppercase hover:underline">Reset</button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => setEditingSeedIdx(idx)} className="text-blue-500 font-black text-[10px] uppercase hover:underline">Edit</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Inventory Edit Modal Overlay */}
                        {editingProduct && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
                                <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-3xl text-gray-800 border-4 border-white">
                                    <h3 className="text-2xl font-black uppercase text-gray-800 mb-8 border-b-4 border-blue-500 pb-4 inline-block">Edit Product Profile</h3>
                                    <form onSubmit={handleUpdateInventory} className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Display Name</label>
                                            <input
                                                type="text"
                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-800 focus:border-blue-500 outline-none transition-all"
                                                value={editingProduct.itemName}
                                                onChange={e => setEditingProduct({ ...editingProduct, itemName: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Starting Stock</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-800"
                                                    value={editingProduct.startingStock}
                                                    onChange={e => setEditingProduct({ ...editingProduct, startingStock: Number(e.target.value) })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Current Stock</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-800"
                                                    value={editingProduct.currentStock}
                                                    onChange={e => setEditingProduct({ ...editingProduct, currentStock: Number(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-8">
                                            <button type="button" onClick={() => setEditingProduct(null)} className="bg-gray-100 text-gray-500 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Cancel</button>
                                            <button type="submit" className="bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all">Update Info</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'loyalty':
                return (
                    <div className="space-y-8 animate-fadeIn p-8 rounded-[2.5rem]" style={{ backgroundColor: '#CBCCCB', minHeight: '100vh' }}>

                        {/* 📊 Summary Cards Section - Requested Style */}
                        <div className="flex flex-wrap gap-6 mb-8">
                            {/* Total Customer Count Card */}
                            <div className="bg-[#333] text-white p-8 rounded-3xl min-w-[280px] shadow-2xl transition-transform hover:scale-105 border-b-8 border-indigo-500">
                                <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Total Unique Customers</h3>
                                <p className="text-5xl font-black flex items-center gap-3">
                                    {customers.length} <span className="text-3xl opacity-80">👤</span>
                                </p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase mt-4 tracking-tighter">Verified Database Entries</p>
                            </div>

                            {/* Optional: Add more cards like Total Sales here */}
                        </div>

                        <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-white">
                            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                                <h3 className="text-xl font-black uppercase text-gray-800 flex items-center gap-3">
                                    <FaGift className="text-amber-500" /> Smart Loyalty Hub
                                </h3>
                                <div className="flex items-center gap-2">
                                    <select value={exportMonth} onChange={e => setExportMonth(Number(e.target.value))} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs font-bold text-gray-800">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <select value={exportYear} onChange={e => setExportYear(Number(e.target.value))} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs font-bold text-gray-800">
                                        {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                    <button
                                        onClick={() => exportMonthlyReport('loyalty')}
                                        className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-green-700 transition-all flex items-center gap-2"
                                    >
                                        <FaFileExcel /> Export Report
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 mb-8">
                                Track regular customers. 10 Pockets = 1 Free Pocket! Points auto-update with each sale.
                            </p>

                            {/* 🎖️ LOYALTY MASTER TABLE */}
                            <div className="bg-white rounded-3xl p-8 shadow-sm border-2 border-gray-100 mt-8 mb-12">
                                <h3 className="text-xl font-black uppercase text-gray-800 mb-6 flex items-center gap-3">
                                    <FaHistory className="text-indigo-500" /> Customer Loyalty Master List
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b-2 border-gray-100 italic">
                                                <th className="py-4 text-left text-[10px] font-black uppercase text-gray-400">Customer</th>
                                                <th className="py-4 text-center text-[10px] font-black uppercase text-gray-400">Current Pockets</th>
                                                <th className="py-4 text-center text-[10px] font-black uppercase text-gray-400">Total Lifetime</th>
                                                <th className="py-4 text-center text-[10px] font-black uppercase text-gray-400">Free Rewards</th>
                                                <th className="py-4 text-right text-[10px] font-black uppercase text-gray-400">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customers.map((c) => (
                                                <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                                                    <td className="py-4">
                                                        <p className="font-black text-gray-800 uppercase text-sm">{c.name}</p>
                                                        <p className="text-[10px] text-gray-400">{c.contactNumber}</p>
                                                    </td>
                                                    <td className="py-4 text-center font-black text-indigo-600 text-lg">
                                                        {c.cycleCount}/10
                                                    </td>
                                                    <td className="py-4 text-center font-bold text-gray-400 text-sm">
                                                        {c.totalLifetime || 0}
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        {(c.freePocketsClaimed - (c.rewardsRedeemed || 0)) > 0 ? (
                                                            <button
                                                                onClick={() => handleClaim(c.contactNumber)}
                                                                style={{
                                                                    backgroundColor: '#007bff',
                                                                    color: 'white',
                                                                    padding: '8px 15px',
                                                                    borderRadius: '5px',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '11px'
                                                                }}
                                                            >
                                                                🎁 {(c.freePocketsClaimed - (c.rewardsRedeemed || 0))} FREE POCKET READY! (Click to Claim)
                                                            </button>
                                                        ) : (
                                                            <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">No Rewards</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <button
                                                            onClick={() => handleReset(c._id)}
                                                            className="text-red-300 hover:text-red-500 transition-all p-2"
                                                            title="Hard Reset Loyalty"
                                                        >
                                                            <FaEraser size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {customers.map(customer => (
                                    <div
                                        key={customer._id}
                                        className={`rounded-3xl p-6 border-2 transition-all ${customer.cycleCount >= 10 ? 'bg-gradient-to-br from-indigo-50 to-blue-100 border-blue-400 shadow-lg' : 'bg-gray-50 border-gray-200'}`}
                                    >
                                        <div className="flex items-center gap-4 mb-5">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${customer.cycleCount >= 10 ? 'bg-indigo-600' : 'bg-gray-300'}`}>
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
                                                <p className="text-xs font-bold uppercase text-gray-400">Current Cycle</p>
                                                <p className="text-4xl font-black text-gray-800">{(Number(customer.cycleCount) || 0)}<span className="text-xs text-gray-400">/10</span></p>
                                            </div>
                                            {(customer.freePocketsClaimed - (customer.rewardsRedeemed || 0)) > 0 && (
                                                <div className="bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                                                    <FaGift size={12} /> {(customer.freePocketsClaimed - (customer.rewardsRedeemed || 0))} Available
                                                </div>
                                            )}
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all"
                                                style={{ width: `${((Number(customer.cycleCount) || 0) / 10) * 100}%` }}
                                            ></div>
                                        </div>

                                        {(customer.freePocketsClaimed - (customer.rewardsRedeemed || 0)) > 0 ? (
                                            <div className="flex flex-col gap-3">
                                                <div className="bg-blue-600 text-white py-3 px-4 rounded-xl text-center font-black uppercase text-sm animate-pulse">
                                                    🎁 {customer.freePocketsClaimed - (customer.rewardsRedeemed || 0)} FREE POCKET(S) READY!
                                                </div>
                                                <button
                                                    onClick={() => handleResetLoyalty(customer._id)}
                                                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-black uppercase text-xs hover:bg-black transition-all"
                                                >
                                                    Mark 1 Reward as Claimed
                                                </button>
                                                <button
                                                    onClick={() => handleReset(customer._id)}
                                                    className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-black uppercase text-xs hover:bg-red-100 transition-all mt-2 border border-red-100"
                                                >
                                                    🗑️ Wipe Local History
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-center text-sm text-gray-500 mb-3">
                                                    <span className="font-bold text-indigo-600">{10 - ((Number(customer.cycleCount) || 0) % 10)}</span> more for FREE!
                                                </p>
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => handleResetLoyalty(customer._id)}
                                                        className="w-full bg-white border border-gray-200 text-gray-400 py-3 rounded-xl font-black uppercase text-xs hover:text-gray-600 transition-all opacity-50"
                                                        disabled
                                                    >
                                                        No Rewards Ready
                                                    </button>
                                                    <button
                                                        onClick={() => handleReset(customer._id)}
                                                        className="w-full bg-transparent text-gray-400 py-2 rounded-xl font-bold uppercase text-[10px] hover:text-red-500 transition-all"
                                                    >
                                                        Hard Reset
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div >
                );

            case 'climate':
                return (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="bg-white rounded-3xl p-8 shadow-xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-black uppercase text-gray-800 flex items-center gap-3">
                                        <FaFan className="text-blue-400" /> Climate Capture
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <select value={entryDate.day} onChange={e => setEntryDate({ ...entryDate, day: Number(e.target.value) })} className="text-[10px] font-bold border rounded p-1">
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        <select value={entryDate.month} onChange={e => setEntryDate({ ...entryDate, month: Number(e.target.value) })} className="text-[10px] font-bold border rounded p-1">
                                            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <form onSubmit={handleClimateSubmit} className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-400 block mb-2">Temp (°C)</label>
                                            <input
                                                type="text"
                                                value={cTemp}
                                                onChange={e => { if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) setCTemp(e.target.value) }}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-800"
                                                placeholder="28.0"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-400 block mb-2">Moist (%)</label>
                                            <input
                                                type="text"
                                                value={cMoist}
                                                onChange={e => { if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) setCMoist(e.target.value) }}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-800"
                                                placeholder="80"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <label className="text-xs font-black uppercase text-blue-600 block mb-2 flex items-center gap-2">
                                            <FaHistory className="text-[10px]" /> Observations
                                        </label>
                                        <textarea
                                            value={cNotes}
                                            onChange={(e) => setCNotes(e.target.value)}
                                            className="w-full bg-white border-2 border-blue-50 rounded-xl px-4 py-3 font-bold text-gray-800 h-32 focus:border-blue-400 outline-none transition-all"
                                            placeholder="Detailed observations..."
                                        />
                                        <p className="text-[9px] font-bold text-blue-400 mt-1 uppercase tracking-widest italic">Status: <span className="text-green-500 font-black">ACTIVE & SYNCED</span></p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCTemp('');
                                                setCMoist('');
                                                setCNotes('');
                                            }}
                                            className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl font-black uppercase shadow-lg hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
                                        >
                                            <FaEraser /> Reset
                                        </button>
                                        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase shadow-lg hover:bg-blue-700 transition-all">
                                            Add Reading
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-black uppercase text-gray-800 flex items-center gap-2">
                                        <FaCalendarAlt className="text-blue-500" /> Climate Table
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <select value={selectedDate || ''} onChange={e => setSelectedDate(e.target.value ? Number(e.target.value) : null)} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[10px] font-bold text-gray-800">
                                            <option value="">All Dates</option>
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[10px] font-bold text-gray-800">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[10px] font-bold text-gray-800">
                                            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                        <button
                                            onClick={() => exportMonthlyReport('climate')}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all flex items-center gap-2"
                                        >
                                            <FaFileExcel /> Export Report
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b text-xs text-gray-400 font-black">
                                                <th className="py-4 text-left">Date</th>
                                                <th className="py-4 text-left">Temp</th>
                                                <th className="py-4 text-left">Moist</th>
                                                <th className="py-4 text-left">Observations</th>
                                                <th className="py-4 text-left">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {climateData.filter(c => {
                                                const d = new Date(c.date);
                                                const matchesMonth = (d.getMonth() + 1) === selectedMonth;
                                                const matchesYear = d.getFullYear() === selectedYear;
                                                const matchesDate = selectedDate === null || d.getDate() === selectedDate;
                                                return matchesMonth && matchesYear && matchesDate;
                                            }).map((c, idx) => (
                                                <tr key={idx} className="border-b border-gray-50">
                                                    <td className="py-4 font-bold text-gray-600">{formatDate(c.date)}</td>
                                                    <td className="py-4 font-black text-red-500">{c.temperature}°C</td>
                                                    <td className="py-4 font-black text-blue-600">{c.moisture || c.humidity}%</td>
                                                    <td className="py-4 text-gray-700 font-medium text-sm border-l border-gray-50 pl-4 bg-gray-50/10">
                                                        <div className="max-w-[300px] break-words">
                                                            {editingClimateId === c._id ? (
                                                                <textarea
                                                                    value={editedData[c._id]?.notes || c.notes || ''}
                                                                    onChange={(e) => setEditedData(prev => ({
                                                                        ...prev,
                                                                        [c._id]: { ...prev[c._id], notes: e.target.value }
                                                                    }))}
                                                                    className={`w-full px-2 py-1 text-sm border-2 rounded ${editingClimateId === c._id ? 'border-blue-500' : 'border-gray-300'}`}
                                                                    rows="2"
                                                                    readOnly={editingClimateId !== c._id}
                                                                />
                                                            ) : (
                                                                c.notes || <span className="text-gray-300 italic">No notes</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 flex gap-2">
                                                        {editingClimateId === c._id ? (
                                                            <>
                                                                <button
                                                                    onClick={async () => {
                                                                        const updatedData = editedData[c._id];
                                                                        if (updatedData) {
                                                                            await fetch(`http://localhost:5000/api/edit/climate/${c._id}`, {
                                                                                method: 'PATCH',
                                                                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                                                body: JSON.stringify({ notes: updatedData.notes })
                                                                            });
                                                                            setEditingClimateId(null);
                                                                            setEditedData(prev => {
                                                                                const newData = { ...prev };
                                                                                delete newData[c._id];
                                                                                return newData;
                                                                            });
                                                                            fetchData();
                                                                        }
                                                                    }}
                                                                    className="text-green-600 font-black text-[10px] uppercase"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingClimateId(null);
                                                                        setEditedData(prev => {
                                                                            const newData = { ...prev };
                                                                            delete newData[c._id];
                                                                            return newData;
                                                                        });
                                                                    }}
                                                                    className="text-orange-600 font-black text-[10px] uppercase"
                                                                >
                                                                    Reset
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => setEditingClimateId(c._id)}
                                                                className="text-blue-600 font-black text-[10px] uppercase"
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleDelete('climate', c._id)} className="text-red-500 font-black text-[10px] uppercase">Del</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
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
                                        <FaFileExcel /> Export Finance Overview
                                    </button>
                                    <button
                                        onClick={() => exportMonthlyReport('master')}
                                        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                                    >
                                        <FaFileExcel /> ⭐ Monthly Master Report
                                    </button>
                                    <button
                                        onClick={() => exportMonthlyReport('month-end')}
                                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                                    >
                                        <FaFileExcel /> Month-End Sheet
                                    </button>
                                    <button
                                        onClick={() => exportMonthlyReport('year-end')}
                                        className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                                    >
                                        <FaFileExcel /> Yearly Summary
                                    </button>
                                    <button
                                        onClick={() => exportMonthlyReport('master-year')}
                                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                                    >
                                        <FaFileExcel /> 📅 Yearly Master Report
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                const res = await fetch('http://localhost:5000/api/admin/send-monthly-report', {
                                                    method: 'POST',
                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                });
                                                if (res.ok) alert('✅ Monthly Excel Report sent to jpfarming10@gmail.com!');
                                                else alert('❌ Sending failed. Please check SMTP settings.');
                                            } catch (err) { alert('Request failed'); }
                                        }}
                                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                                    >
                                        <FaEnvelope /> Send to Email
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

                        {/* OTHER EXPENSES VISUAL (Pie Style breakdown) */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl">
                            <h3 className="text-xl font-black uppercase text-gray-800 mb-6 flex items-center gap-2">
                                <FaChartBar className="text-red-500" /> Expense Category Breakdown
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                {financeData?.categoryBreakdown && Object.entries(financeData.categoryBreakdown).map(([cat, amt], idx) => (
                                    <div key={idx} className="flex-1 min-w-[150px] bg-gray-50 p-4 rounded-2xl border-l-4 border-red-500">
                                        <p className="text-[10px] font-black uppercase text-gray-400">{cat}</p>
                                        <p className="text-xl font-black text-gray-800">₹{amt}</p>
                                        <div className="w-full bg-gray-200 h-1 mt-2 rounded-full overflow-hidden">
                                            <div className="bg-red-500 h-full" style={{ width: `${(amt / financeData.totalExpenditure) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* MONTHLY EXCEL ARCHIVES */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl mt-8">
                            <h3 className="text-xl font-black uppercase text-gray-800 mb-6 flex items-center gap-3">
                                <FaLayerGroup className="text-blue-500" /> Monthly Excel Storage Archives
                            </h3>
                            {reportArchives.length === 0 ? (
                                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-400 font-bold">No archived reports found.</p>
                                    <p className="text-[10px] uppercase text-gray-300 mt-1">Reports are automatically saved at month end.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {reportArchives.map((report, idx) => (
                                        <a
                                            key={idx}
                                            href={`http://localhost:5000${report.url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-5 p-6 bg-gray-50 rounded-2xl border-2 border-gray-100 hover:border-blue-400 hover:shadow-xl transition-all group"
                                        >
                                            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <FaFileExcel size={30} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-sm text-gray-800 truncate uppercase">{report.name}</p>
                                                <p className="text-xs font-bold text-gray-400 uppercase">{new Date(report.date).toLocaleDateString()}</p>
                                            </div>
                                            <FaDownload className="text-gray-300 group-hover:text-blue-500" size={16} />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'water':
                return (
                    <div className="space-y-8 animate-fadeIn">
                        {lowWaterAlert && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl mb-6 flex items-center gap-3">
                                <FaBell className="text-red-500" />
                                <div>
                                    <p className="font-black text-sm">2-Day Refill Reminder</p>
                                    <p className="text-xs">Water level is low. Please refill the tank soon.</p>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
                                <h3 className="text-xl font-black uppercase text-gray-800 mb-6 flex items-center justify-center gap-3">
                                    <FaWater className="text-blue-500" /> Water Drum Status
                                </h3>
                                <div className="flex flex-col items-center gap-3 mb-6">
                                    <div className="flex items-center gap-2">
                                        <select value={exportMonth} onChange={e => setExportMonth(Number(e.target.value))} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs font-bold text-gray-800">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <select value={exportYear} onChange={e => setExportYear(Number(e.target.value))} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs font-bold text-gray-800">
                                            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => exportMonthlyReport('water')}
                                        className="bg-green-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase hover:bg-green-700 transition-all flex items-center gap-2"
                                    >
                                        <FaFileExcel /> Export Monthly Report
                                    </button>
                                </div>
                                <div className="flex justify-center">
                                    {/* Main Water Drum */}
                                    <div className="relative group">
                                        <div className="w-40 h-60 border-4 border-gray-300 rounded-2xl overflow-hidden relative bg-gray-100">
                                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-1000" style={{ height: `${waterLevel}%` }}></div>
                                            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                                                <span className="text-3xl font-black text-white drop-shadow-md">{waterLevel}%</span>
                                            </div>
                                        </div>
                                        <p className="mt-4 font-black text-gray-600 uppercase text-center">Main Water Drum</p>
                                        <p className="text-xs text-gray-500 text-center">Capacity: 5000L</p>
                                        <p className="text-xs text-gray-500 text-center">Next Spray: {nextSprayTime ? nextSprayTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Last Checked</p>
                                    <p className="text-xl font-black text-gray-800">
                                        {lastWaterCheck ? new Date(lastWaterCheck).toLocaleDateString() : 'Not recorded'}
                                        <span className="text-sm text-gray-400 block">{lastWaterCheck ? new Date(lastWaterCheck).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : '-'}</span>
                                    </p>
                                    <button
                                        onClick={async () => {
                                            try {
                                                const res = await fetch('http://localhost:5000/api/settings/water-check', {
                                                    method: 'POST',
                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                });
                                                if (res.ok) {
                                                    alert('✅ Water Filled/Checked! Next alert set for 2 days later.');
                                                    fetchData();
                                                }
                                            } catch (err) { alert('Update failed'); }
                                        }}
                                        className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase hover:bg-blue-700 transition-all shadow-lg text-sm"
                                    >
                                        Mark as Checked / Filled
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                const res = await fetch('http://localhost:5000/api/water/spray', {
                                                    method: 'POST',
                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                });
                                                if (res.ok) {
                                                    alert('✅ Manual Spray Triggered! 20L deducted.');
                                                    fetchData();
                                                } else {
                                                    alert('Spray failed');
                                                }
                                            } catch (err) { alert('Update failed'); }
                                        }}
                                        className="mt-4 px-8 py-3 bg-green-600 text-white rounded-xl font-black uppercase hover:bg-green-700 transition-all shadow-lg text-sm"
                                    >
                                        Manual Spray
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl">
                                <h3 className="text-xl font-black uppercase tracking-wider mb-6">
                                    <FaClock className="inline mr-3" /> Check Schedule
                                </h3>
                                <div className="space-y-6">
                                    <div className="bg-white/10 p-6 rounded-2xl border border-white/10">
                                        <p className="text-xs font-bold uppercase text-blue-200 mb-1">Frequency</p>
                                        <p className="text-2xl font-black">Every 2 Days</p>
                                    </div>
                                    <div className="bg-white/10 p-6 rounded-2xl border border-white/10">
                                        <p className="text-xs font-bold uppercase text-blue-200 mb-1">Next Automated Alert</p>
                                        <p className="text-2xl font-black">
                                            {lastWaterCheck
                                                ? new Date(new Date(lastWaterCheck).getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()
                                                : 'Pending First Check'}
                                        </p>
                                        <p className="text-xs text-blue-300 mt-1 italic">08:00 AM • Notification + Voice Call</p>
                                    </div>
                                    <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-black">!</div>
                                        <div>
                                            <p className="font-bold text-sm">Maintenance Tip</p>
                                            <p className="text-xs opacity-80">Clean filters when level is below 20%.</p>
                                        </div>
                                    </div>
                                </div>
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
        <div className="min-h-screen bg-[#CBCCCB] font-sans">
            {/* Connection Mode Indicator */}
            {connectionMode.isLocal && (
                <div className="bg-orange-600 text-white py-2 px-4 text-center font-black uppercase text-xs tracking-widest shadow-lg sticky top-0 z-[100]">
                    ⚠️ Local Mode Active: Saving to your PC • System will sync when Atlas returns
                </div>
            )}
            {/* Header */}
            {/* Header */}
            <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-6 md:py-8 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="text-center md:text-left">
                            <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tight">
                                TJP MUSHROOM FARMING
                            </h1>
                            <p className="text-gray-400 font-bold mt-1 text-xs md:text-base">Management Dashboard v5.0</p>
                        </div>
                        <div className="flex items-center justify-center md:justify-end gap-4 md:gap-6">
                            <div className="hidden lg:flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-full">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">System Live & Monitoring</span>
                            </div>
                            <div className="text-right hidden md:block">
                                <p className="text-xs font-bold text-gray-400 uppercase">Current Time</p>
                                <p className="text-xl font-black">{currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                            </div>
                            <FaShieldAlt className="text-3xl md:text-4xl text-amber-500" />
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
                            { id: 'kadan', label: 'Kadan Ledger', icon: FaBook },
                            { id: 'expenditure', label: 'Expenditure', icon: FaMoneyBillWave },
                            { id: 'inventory', label: 'Inventory', icon: FaWarehouse },
                            { id: 'water', label: 'Water Status', icon: FaWater },
                            { id: 'climate', label: 'Climate', icon: FaFan },
                            { id: 'loyalty', label: 'Loyalty Hub', icon: FaGift },
                            { id: 'finance', label: 'Finance Report', icon: FaFileExcel },
                            { id: 'analytics', label: 'Analytics', icon: FaChartBar }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-8 py-5 rounded-2xl font-black text-base uppercase whitespace-nowrap transition-all shadow-sm ${activeTab === tab.id
                                    ? 'bg-gray-900 text-white shadow-2xl scale-105'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                <tab.icon className="text-xl" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* SENDING LOADER OVERLAY */}
            {isGeneratingBill && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md">
                    <div className="bg-white rounded-3xl p-10 shadow-2xl text-center animate-scaleIn">
                        <div className="w-20 h-20 border-8 border-green-100 border-t-green-600 rounded-full animate-spin mx-auto mb-6"></div>
                        <h3 className="text-2xl font-black uppercase text-gray-800 mb-2">Sending Bill...</h3>
                        <p className="text-gray-500 font-bold">TJP WhatsApp is crunching the data 🍄</p>
                    </div>
                </div>
            )}

            {/* NOTIFICATION TOAST */}
            {billSentStatus === 'success' && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[10000] animate-bounce">
                    <div className="bg-green-600 text-white px-10 py-5 rounded-2xl shadow-2xl border-4 border-white/20 flex items-center gap-4">
                        <FaCheckCircle className="text-2xl" />
                        <span className="font-black uppercase tracking-widest text-lg">Bill Sent Successfully! ✅</span>
                    </div>
                </div>
            )}

            {billSentStatus === 'error' && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[10000] animate-pulse">
                    <div className="bg-red-600 text-white px-10 py-5 rounded-2xl shadow-2xl border-4 border-white/20 flex items-center gap-4">
                        <FaEraser className="text-2xl" />
                        <span className="font-black uppercase tracking-widest text-lg">Failed to send bill! ❌</span>
                    </div>
                </div>
            )}

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
                    <>
                        {renderTab()}
                        {/* Hidden Bill Capture Area */}
                        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                            <div ref={billRef}>
                                <DigitalBill
                                    saleData={billData?.sale}
                                    customerData={billData?.customer}
                                />
                            </div>
                        </div>
                    </>
                )}
            </main>

            <Footer />


        </div>
    );
};

export default Dashboard;

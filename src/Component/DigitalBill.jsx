import React, { forwardRef } from 'react';

const DigitalBill = forwardRef(({ saleData, customerData }, ref) => {
    const logo = '/assets/logo-final.png';
    if (!saleData || !customerData) return null;

    const date = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const price = Number(saleData.pricePerPocket || 0);
    const qty = Number(saleData.quantity || 0);
    const totalAmount = price * qty;
    const currentCycle = Number(customerData.loyaltyCount || 0);
    const remaining = Math.max(0, 10 - currentCycle);

    return (
        <div
            ref={ref}
            style={{
                width: '600px',
                minHeight: '850px',
                backgroundColor: '#022C22',
                padding: '40px',
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxSizing: 'border-box'
            }}
        >
            {/* Header / Logo */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <img
                    src={logo}
                    alt="TJP Logo"
                    style={{
                        width: '320px',
                        objectContain: 'contain',
                        marginBottom: '10px'
                    }}
                />
            </div>

            {/* Brand Title */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    margin: 0,
                    letterSpacing: '-0.5px'
                }}>TJP MUSHROOM FARMING</h1>
                <p style={{
                    fontSize: '12px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '5px',
                    color: '#888',
                    marginTop: '5px'
                }}>Quality • Freshness • Health</p>
            </div>

            {/* Customer & Date */}
            <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'between',
                borderTop: '2px solid rgba(255,255,255,0.1)',
                paddingTop: '15px',
                marginBottom: '25px'
            }}>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '10px', fontWeight: '900', color: '#4ADE80', textTransform: 'uppercase', margin: 0 }}>Customer</p>
                    <h3 style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', margin: '5px 0 0 0' }}>{saleData.customerName}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '10px', fontWeight: '900', color: '#4ADE80', textTransform: 'uppercase', margin: 0 }}>Date</p>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', margin: '5px 0 0 0' }}>{date}</h3>
                </div>
            </div>

            {/* Order Card */}
            <div style={{
                width: '100%',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '25px',
                padding: '30px',
                marginBottom: '20px',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <span style={{ color: '#ccc', fontWeight: '700', fontSize: '14px' }}>Product</span>
                    <span style={{ fontWeight: '900', fontSize: '14px' }}>{saleData.productType === 'Seeds' ? 'Oyster Mushroom Spawn' : 'Oyster Mushroom'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <span style={{ color: '#ccc', fontWeight: '700', fontSize: '14px' }}>Quantity</span>
                    <span style={{ fontWeight: '900', fontSize: '14px' }}>{qty} {saleData.productType === 'Seeds' ? 'kg' : 'Pockets'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', paddingBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ color: '#ccc', fontWeight: '700', fontSize: '14px' }}>Price</span>
                    <span style={{ fontWeight: '900', fontSize: '14px' }}>₹{price}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#4ADE80', fontWeight: '900', fontSize: '18px', textTransform: 'uppercase' }}>Total Paid</span>
                    <span style={{ fontSize: '36px', fontWeight: '900' }}>₹{totalAmount}</span>
                </div>
            </div>

            {/* Loyalty Tracker */}
            <div style={{
                width: '100%',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: '25px',
                padding: '30px',
                marginBottom: '40px',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', backgroundColor: '#FACC15', borderRadius: '50%' }}></div>
                        <span style={{ fontSize: '12px', fontWeight: '900', color: '#FACC15', textTransform: 'uppercase' }}>TJP Mushroom Farming</span>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#666', textTransform: 'uppercase' }}>Track ID: {customerData.totalLifetime || 0}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#ccc', textTransform: 'uppercase' }}>Total Purchased</span>
                    <span style={{ fontSize: '14px', fontWeight: '900' }}>{customerData.totalLifetime || 0} Pockets</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#ccc', textTransform: 'uppercase' }}>Current Cycle</span>
                    <span style={{ fontSize: '16px', fontWeight: '900', color: '#FACC15' }}>{currentCycle}/10</span>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '15px' }}>
                    <div style={{
                        width: `${(currentCycle / 10) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #F59E0B, #FACC15)',
                        borderRadius: '10px'
                    }}></div>
                </div>

                <p style={{ textAlign: 'center', fontSize: '12px', fontWeight: '800', color: '#4ADE80', textTransform: 'uppercase', margin: 0 }}>
                    Next Free Pocket in: <span style={{ color: 'white' }}>{remaining} Pockets</span>
                </p>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: 'auto', width: '100%' }}>
                <p style={{ fontSize: '11px', fontWeight: '600', color: '#888', fontStyle: 'italic', marginBottom: '15px' }}>
                    "இயற்கையோடு இணைந்த சுவை, உடலிற்கு மருந்து!"
                </p>
                <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    PULIMALAIPATTY, MELUR, MADURAI
                </h2>
                <p style={{ fontSize: '18px', fontWeight: '900', color: '#4ADE80', margin: 0, letterSpacing: '1px' }}>
                    PH: +91 95005 91897 PH: +91 91596 59711
                </p>
            </div>
        </div>
    );
});

export default DigitalBill;

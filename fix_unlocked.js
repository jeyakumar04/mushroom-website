const fs = require('fs');
const path = 'f:\\TJP\\mushroom-website\\src\\pages\\Dashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Separate the climate states
content = content.replace(
    /const \[climateForm, setClimateForm\] = useState\(\{ temperature: '', moisture: '', notes: '' \}\);/,
    `const [cTemp, setCTemp] = useState('');
    const [cMoist, setCMoist] = useState('');
    const [cNotes, setCNotes] = useState('');`
);

// 2. Update Climate Submit Handler
content = content.replace(
    /const handleClimateSubmit = async \(e\) => \{[\s\S]*?const temp = Number\(climateForm\.temperature\);[\s\S]*?const moist = Number\(climateForm\.moisture\);[\s\S]*?temperature: temp,[\s\S]*?moisture: moist,[\s\S]*?humidity: moist,[\s\S]*?notes: climateForm\.notes,[\s\S]*?setClimateForm\(\{ temperature: '', moisture: '', notes: '' \}\);[\s\S]*?\};/,
    `const handleClimateSubmit = async (e) => {
        e.preventDefault();
        
        const temp = Number(cTemp);
        const moist = Number(cMoist);

        if (isNaN(temp) || isNaN(moist)) {
            alert("Please enter valid numeric values");
            return;
        }

        const payload = {
            temperature: temp,
            moisture: moist,
            humidity: moist,
            notes: cNotes.trim(),
            date: new Date(entryDate.year, entryDate.month - 1, entryDate.day)
        };

        try {
            const res = await fetch('http://localhost:5000/api/climate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ token }` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setCTemp('');
                setCMoist('');
                setCNotes('');
                fetchData();
            } else {
                alert('Server rejected entry');
            }
        } catch (err) { alert('Entry failed: Connection Issue'); }
    };`
);

// 3. Update Inputs in JSX
// Temp Input
content = content.replace(
    /value=\{climateForm\.temperature\}[\s\S]*?onChange=\{e => \{[\s\S]*?setClimateForm\(\{ \.\.\.climateForm, temperature: val \}\);[\s\S]*?\}\}/,
    `value={cTemp}
    onChange={e => {
        const val = e.target.value;
        if (val === '' || /^\\d*\\.?\\d*$/.test(val)) {
            setCTemp(val);
        }
    }}`
);

// Moisture Input
content = content.replace(
    /value=\{climateForm\.moisture\}[\s\S]*?onChange=\{e => \{[\s\S]*?setClimateForm\(\{ \.\.\.climateForm, moisture: val \}\);[\s\S]*?\}\}/,
    `value={cMoist}
    onChange={e => {
        const val = e.target.value;
        if (val === '' || (/^\\d*\\.?\\d*$/.test(val) && Number(val) <= 100)) {
            setCMoist(val);
        }
    }}`
);

// Notes Textarea (Finding the robust version I just added)
content = content.replace(
    /value=\{climateForm\.notes \|\| ''\}[\s\S]*?onChange=\{\(e\) => \{[\s\S]*?setClimateForm\(prev => \(\{ \.\.\.prev, notes: val \}\)\);[\s\S]*?\}\}/,
    `value={cNotes}
    onChange={(e) => setCNotes(e.target.value)}`
);

// Fix character counter
content = content.replace(
    /Characters: \{\(climateForm\.notes \|\| ""\)\.length\}/,
    `Characters: {cNotes.length}`
);

// Update version
content = content.replace('v5.4 - Fix Active', 'v5.5 - Input Unlocked');

fs.writeFileSync(path, content, 'utf8');
console.log("Dashboard.jsx updated with separate climate states.");

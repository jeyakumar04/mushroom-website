const fs = require('fs');
const path = 'f:\\TJP\\mushroom-website\\src\\pages\\Dashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// The broken block starts around line 1913
const brokenStart = '<tbody>';
const nextTab = 'case \'finance\':';
const startIdx = content.indexOf(brokenStart);
const endIdx = content.indexOf(nextTab);

const correctTableBody = `<tbody>
                                            {climateData.map((c, idx) => (
                                                <tr key={idx} className="border-b border-gray-50">
                                                    <td className="py-4 font-bold text-gray-600">{formatDate(c.date)}</td>
                                                    <td className="py-4 font-black text-red-500">{c.temperature != null ? \`\${c.temperature}°C\` : '-'}</td>
                                                    <td className="py-4 font-black text-blue-600">
                                                        {(() => {
                                                            const mVal = c.moisture ?? c.humidity ?? c.moist;
                                                            return (mVal !== undefined && mVal !== null) ? \`\${mVal}%\` : '-';
                                                        })()}
                                                    </td>
                                                    <td className="py-4 text-gray-700 font-medium text-sm border-l border-gray-50 pl-4 bg-gray-50/30" title={c.notes}>
                                                        <div className="max-w-[400px] break-words">
                                                            {c.notes || <span className="text-gray-300 italic">No notes recorded</span>}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-right flex gap-3 justify-end items-center">
                                                        <button
                                                            onClick={async () => {
                                                                const newTemp = prompt("Edit Temp (°C):", c.temperature);
                                                                if (newTemp === null) return;
                                                                const newMoisture = prompt("Edit Moisture (%):", c.moisture);
                                                                if (newMoisture === null) return;
                                                                const newNotes = prompt("Edit Notes:", c.notes || "");
                                                                if (newNotes === null) return;

                                                                try {
                                                                    await fetch(\`http://localhost:5000/api/edit/climate/\${c._id}\`, {
                                                                        method: 'PATCH',
                                                                        headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
                                                                        body: JSON.stringify({
                                                                            temperature: Number(newTemp),
                                                                            moisture: Number(newMoisture),
                                                                            notes: newNotes
                                                                        })
                                                                    });
                                                                    fetchData();
                                                                } catch (err) { alert("Update failed"); }
                                                            }}
                                                            className="text-blue-600 font-black text-[10px] uppercase hover:bg-blue-50 px-2 py-1 rounded transition-all"
                                                        >
                                                            EDIT
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete('climate', c._id)}
                                                            className="bg-red-50 text-red-600 px-3 py-1 rounded-lg font-black text-[10px] hover:bg-red-600 hover:text-white transition-all uppercase"
                                                        >
                                                            RESET
                                                        </button>
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

            `;

if (startIdx !== -1 && endIdx !== -1) {
    // We need to keep the close for the overview tab
    content = content.substring(0, startIdx) + correctTableBody + content.substring(endIdx);
}

fs.writeFileSync(path, content, 'utf8');
console.log("Dashboard.jsx table structure restored.");

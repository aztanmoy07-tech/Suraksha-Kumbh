module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    res.json({
        kumbhYear: 2026,
        venue: "Prayagraj Triveni Sangam",
        timestamp: new Date().toISOString(),
        sectors: {
            "sangam-nose": { name: "Sangam Nose (Main Ghat)", density: 3.8, capacity: 85, status: "WARNING", flowRate: "+420/min", sector: 1 },
            "ram-ghat": { name: "Ram Ghat & Dashashwamedh", density: 2.1, capacity: 55, status: "NORMAL", flowRate: "+180/min", sector: 2 },
            "pontoon-3": { name: "Pontoon Bridge #3 (Daraganj)", density: 4.1, capacity: 92, status: "CRITICAL", flowRate: "+580/min", sector: 3 },
            "pontoon-4": { name: "Pontoon Bridge #4 (Jhunsi)", density: 3.9, capacity: 88, status: "WARNING", flowRate: "+490/min", sector: 4 },
            "arail-ghat": { name: "Arail Ghat (South Bank)", density: 1.4, capacity: 35, status: "NORMAL", flowRate: "+90/min", sector: 6 },
            "holding-jhunsi": { name: "Jhunsi Holding Paddock", density: 1.1, capacity: 28, status: "BUFFER_READY", flowRate: "-120/min", sector: 8 }
        }
    });
};

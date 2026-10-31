const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');

// Environment check: Vercel serverless vs Local stand-alone
const isVercel = process.env.VERCEL === '1' || process.env.NOW_REGION !== undefined;
const certExists = fs.existsSync(path.join(__dirname, 'key.pem')) && fs.existsSync(path.join(__dirname, 'cert.pem'));

let server;
if (!isVercel && certExists) {
    try {
        const options = {
            key: fs.readFileSync(path.join(__dirname, 'key.pem')),
            cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
        };
        server = https.createServer(options, app);
    } catch (err) {
        console.warn("HTTPS certificate load error, falling back to HTTP:", err.message);
        server = http.createServer(app);
    }
} else {
    server = http.createServer(app);
}

const io = require('socket.io')(server, {
    cors: { origin: "*" }
});

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route for Control Room (Admin)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for User Interface (Citizen App)
app.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, 'User_Interface.html'));
});

// 3D Digital Twin of Prayagraj Sangam
app.get('/twin', (req, res) => {
    res.sendFile(path.join(__dirname, 'prayagraj_twin.html'));
});

// Open Standard NDMA / ITU-T X.1303 CAP (Common Alerting Protocol) JSON Feed
app.get('/api/cap', (req, res) => {
    res.json({
        standard: "ITU-T X.1303 / NDMA CAP India v1.2",
        authority: "Suraksha Kumbh ICCC Prayagraj",
        generatedAt: new Date().toISOString(),
        alerts: activeCapAlerts
    });
});

// Live Crowd Density Surge Index (CDSI) endpoint
app.get('/api/cdsi', (req, res) => {
    res.json({
        kumbhYear: 2026,
        venue: "Prayagraj Triveni Sangam",
        timestamp: new Date().toISOString(),
        sectors: sectorCrowdMetrics
    });
});

// Store connected users & mesh nodes
let connectedUsers = {};
let meshNodes = {};

// Cached disaster feed for Maha Kumbh
let latestFeedData = {
    cyclone: "Calm (2.1 km/h)",
    river: "Normal (2160 m³/s)",
    fire: "Low (24°C, 65%)",
    location: "Prayagraj Triveni Sangam",
    timestamp: new Date().toLocaleTimeString()
};

// ITU-T X.1303 CAP (Common Alerting Protocol) India / NDMA SACHET alert cache
let activeCapAlerts = [
    {
        identifier: "CAP-IN-UP-KUMBH-2026-001",
        sender: "UP-SDMA-ICCC-PRAYAGRAJ",
        sent: new Date().toISOString(),
        status: "Actual",
        msgType: "Alert",
        scope: "Public",
        info: {
            category: "Safety",
            event: "Pontoon Bridge 4 High Crowd Density Alert",
            urgency: "Immediate",
            severity: "Severe",
            certainty: "Observed",
            headline: "Heavy Crowd Surge at Pontoon Bridge #4 (Ganga)",
            headline_hi: "पांटून पुल संख्या 4 पर अत्यधिक भीड़ का दबाव - मार्ग परिवर्तन",
            description: "Crowd density has reached 3.9 persons/sqm. Ingress halted. Pilgrims being diverted to Jhunsi Holding Paddock.",
            description_hi: "भीड़ घनत्व 3.9 व्यक्ति/वर्गमीटर पार कर गया है। प्रवेश रोक दिया गया है। श्रद्धालुओं को झूंसी होल्डिंग एरिया की ओर मोड़ा जा रहा है।",
            areaDesc: "Sector 3 to Sector 8, Pontoon Bridge 4, Prayagraj",
            instruction: "Follow volunteer instructions. Do not stop on pontoon bridge. Use southern pedestrian ramp.",
            instruction_hi: "स्वयंसेवकों के निर्देशों का पालन करें। पांटून पुल पर न रुकें। दक्षिणी पैदल मार्ग का उपयोग करें।"
        }
    }
];

// Live Kumbh Sector Crowd Density & Flow Index (CDSI)
let sectorCrowdMetrics = {
    "sangam-nose": { name: "Sangam Nose (Main Ghat)", density: 3.8, capacity: 85, status: "WARNING", flowRate: "+420/min", sector: 1 },
    "ram-ghat": { name: "Ram Ghat & Dashashwamedh", density: 2.1, capacity: 55, status: "NORMAL", flowRate: "+180/min", sector: 2 },
    "pontoon-3": { name: "Pontoon Bridge #3 (Daraganj)", density: 4.1, capacity: 92, status: "CRITICAL", flowRate: "+580/min", sector: 3 },
    "pontoon-4": { name: "Pontoon Bridge #4 (Jhunsi)", density: 3.9, capacity: 88, status: "WARNING", flowRate: "+490/min", sector: 4 },
    "arail-ghat": { name: "Arail Ghat (South Bank)", density: 1.4, capacity: 35, status: "NORMAL", flowRate: "+90/min", sector: 6 },
    "holding-jhunsi": { name: "Jhunsi Holding Paddock", density: 1.1, capacity: 28, status: "BUFFER_READY", flowRate: "-120/min", sector: 8 }
};

// All event types relayed across the SURAKSHA KUMBH network
const FORWARDED_EVENTS = [
    'LOCATION_UPDATE',
    'SOS',
    'TRIAGE_REPORT',
    'MEDICAL_REPORT',
    'RESOURCE_UPDATE',
    'RESOURCE_DISPATCHED',
    'DISASTER_ALERT',
    'DISASTER_CLEAR',
    'HELP_REQUEST',
    'VOLUNTEER_JOIN',
    'FOUND_PERSON',
    'MISSING_PERSON',
    'DAMAGE_REPORT',
    'LOST_ITEM',
    'SOS_ACKNOWLEDGE',
    'SOS_RESOLVE',
    // NDMA CAP Protocol events
    'CAP_ALERT_BROADCAST',
    'CAP_ALERT_ACK',
    // Crowd Surge & Diversion events
    'CDSI_UPDATE',
    'DIVERSION_TRIGGER',
    // Mesh Network Events (Work without Internet across Local LAN/Hotspot)
    'MESH_PACKET',
    'MESH_PING',
    'MESH_DISCOVERY',
    'MESH_RELAY'
];

io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    // Send latest feed and current active users count immediately
    socket.emit('DISASTER_FEED_UPDATE', latestFeedData);
    socket.emit('ACTIVE_USERS_COUNT', Object.keys(connectedUsers).length);
    socket.emit('CAP_ALERTS_SYNC', activeCapAlerts);
    socket.emit('CDSI_UPDATE', sectorCrowdMetrics);

    // Identify client
    socket.on('identify', (data) => {
        console.log('Client identified:', data);
        if (data && data.type === 'USER') {
            connectedUsers[socket.id] = data;
            io.emit('ACTIVE_USERS_COUNT', Object.keys(connectedUsers).length);
        }
        if (data && data.nodeId) {
            meshNodes[socket.id] = data;
            io.emit('MESH_PEERS_UPDATE', Object.values(meshNodes));
        }
    });

    // CAP Alert Broadcast
    socket.on('CAP_ALERT_BROADCAST', (capAlert) => {
        console.log(`[NDMA CAP ALERT] ${capAlert.identifier} - ${capAlert.info?.headline}`);
        activeCapAlerts.unshift(capAlert);
        if (activeCapAlerts.length > 20) activeCapAlerts.pop();
        io.emit('CAP_ALERT_BROADCAST', capAlert);
        io.emit('CAP_ALERTS_SYNC', activeCapAlerts);
    });

    // Crowd Density Surge Update & Diversion Trigger
    socket.on('DIVERSION_TRIGGER', (diversionData) => {
        console.log(`[DIVERSION TRIGGERED] From: ${diversionData.fromSector} -> Divert to: ${diversionData.toSector}`);
        if (sectorCrowdMetrics[diversionData.fromSector]) {
            sectorCrowdMetrics[diversionData.fromSector].status = 'DIVERTING';
        }
        io.emit('DIVERSION_TRIGGER', diversionData);
        io.emit('CDSI_UPDATE', sectorCrowdMetrics);
    });

    // Mesh packet relay (Works over local Wi-Fi / Hotspot with 0% external internet)
    socket.on('MESH_PACKET', (packet) => {
        console.log(`[MESH PACKET] Origin: ${packet.originNode} -> Type: ${packet.type} -> Hops: ${packet.hops}`);
        // Broadcast to all other peers on local network
        socket.broadcast.emit('MESH_PACKET', packet);
        io.emit('MESH_PACKET_MONITOR', packet);
    });

    // Forward all SARAL / Suraksha Kumbh events
    FORWARDED_EVENTS.forEach((eventName) => {
        socket.on(eventName, (data) => {
            console.log(`[Event ${eventName}] from ${socket.id}`);
            io.emit(eventName, data);
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        if (connectedUsers[socket.id]) {
            delete connectedUsers[socket.id];
            io.emit('ACTIVE_USERS_COUNT', Object.keys(connectedUsers).length);
        }
        if (meshNodes[socket.id]) {
            delete meshNodes[socket.id];
            io.emit('MESH_PEERS_UPDATE', Object.values(meshNodes));
        }
    });
});

// Detect Local LAN IP for offline hotspot / Wi-Fi usage
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

const PORT = process.env.PORT || 3000;
const LOCAL_IP = getLocalIp();

// --- REAL-TIME DATA FETCHING (PRAYAGRAJ & SANGAM) ---
const API_KEY = '427b095f5b1efd5d706bb36999355fb1';
const LOC_PRAYAGRAJ = { lat: 25.4358, lon: 81.8463 }; // Prayagraj Sangam

async function fetchDisasterData() {
    try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${LOC_PRAYAGRAJ.lat}&lon=${LOC_PRAYAGRAJ.lon}&units=metric&appid=${API_KEY}`;
        const weatherRes = await axios.get(weatherUrl, { timeout: 8000 });
        const w = weatherRes.data;

        let windStatus = "Calm";
        if (w.wind.speed > 40) windStatus = `High Wind (${w.wind.speed} km/h)`;
        else windStatus = `Normal (${w.wind.speed} km/h)`;

        let fireRisk = "Low";
        if (w.main.temp > 35 && w.main.humidity < 35) fireRisk = "High";
        const fireDetails = `${fireRisk} (${Math.round(w.main.temp)}°C, ${w.main.humidity}%)`;

        let riverStatus = latestFeedData.river;
        try {
            const floodUrl = `https://flood-api.open-meteo.com/v1/flood?latitude=${LOC_PRAYAGRAJ.lat}&longitude=${LOC_PRAYAGRAJ.lon}&daily=river_discharge&forecast_days=1`;
            const floodRes = await axios.get(floodUrl, { timeout: 8000 });
            const discharge = floodRes.data?.daily?.river_discharge?.[0];
            if (typeof discharge === 'number') {
                riverStatus = `Normal (${Math.round(discharge)} m³/s)`;
                if (discharge > 5000) riverStatus = `DANGER (${Math.round(discharge)} m³/s)`;
                else if (discharge > 2500) riverStatus = `Rising (${Math.round(discharge)} m³/s)`;
            }
        } catch (floodErr) {
            // Keep previous river status
        }

        latestFeedData = {
            cyclone: windStatus,
            river: riverStatus,
            fire: fireDetails,
            location: "Prayagraj Triveni Sangam",
            timestamp: new Date().toLocaleTimeString()
        };

        io.emit('DISASTER_FEED_UPDATE', latestFeedData);

    } catch (error) {
        latestFeedData.timestamp = new Date().toLocaleTimeString();
        io.emit('DISASTER_FEED_UPDATE', latestFeedData);
    }
}

// Only listen if run directly (standalone / local), not on Vercel serverless
if (!isVercel) {
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`\n======================================================`);
        console.log(`🔱 SURAKSHA KUMBH SERVER RUNNING (Maha Kumbh 2026)`);
        console.log(`Local Access:  https://localhost:${PORT}`);
        console.log(`LAN / Hotspot: https://${LOCAL_IP}:${PORT} (Access from phones without internet!)`);
        console.log(`Pilgrim App:   https://${LOCAL_IP}:${PORT}/user`);
        console.log(`======================================================\n`);
    });

    // Fetch every 30 seconds
    setInterval(fetchDisasterData, 30000);
}

// Initial fetch
fetchDisasterData().catch(() => {});

// Export app for Vercel Serverless
module.exports = app;

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    res.json({
        standard: "ITU-T X.1303 / NDMA CAP India v1.2",
        authority: "Suraksha Kumbh ICCC Prayagraj",
        generatedAt: new Date().toISOString(),
        alerts: [
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
        ]
    });
};

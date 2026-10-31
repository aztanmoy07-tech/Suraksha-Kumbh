/**
 * SURAKSHA KUMBH 2026 - ZERO-WAN OFFLINE TACTICAL WALKIE-TALKIE & MESH MESSENGER
 * COPYRIGHT (C) 2026 OJSHWIRAJ. ALL RIGHTS RESERVED.
 * 
 * Works 100% offline without internet using BroadcastChannel P2P + Multi-Hop Relays + Web Audio FX
 */

class SurakshaMeshMessenger {
    constructor(options = {}) {
        this.nodeId = options.nodeId || 'NODE-' + Math.floor(Math.random() * 9000 + 1000);
        this.role = options.role || 'Field Sevadar';
        this.containerId = options.containerId || 'mesh-chat-container';
        this.activeChannel = 'ALL';
        this.audioEnabled = true;
        this.channel = new BroadcastChannel('suraksha_kumbh_mesh_chat');
        this.seenMessages = new Set();
        this.messages = this.loadHistory();
        this.audioCtx = null;

        this.init();
    }

    init() {
        // Listen on offline BroadcastChannel
        this.channel.onmessage = (event) => {
            this.handleIncoming(event.data);
        };

        // If local socket exists, also bridge
        if (typeof socket !== 'undefined' && socket && socket.on) {
            socket.on('MESH_CHAT_RELAY', (msg) => {
                this.handleIncoming(msg);
            });
        }

        // Render UI into container if present
        this.renderUI();
        this.renderMessages();
    }

    loadHistory() {
        try {
            const raw = localStorage.getItem('suraksha_mesh_chat_history');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed.slice(-50);
            }
        } catch (e) {}
        return [
            {
                id: 'MSG-INIT-1',
                sender: 'COMMAND-HQ',
                role: 'Central Dispatch',
                channel: 'EMERGENCY',
                text: 'Tactical Mesh Radio active across Sangam sectors. All field units check in.',
                hops: 0,
                timestamp: Date.now() - 600000
            },
            {
                id: 'MSG-INIT-2',
                sender: 'SEVADAR-SECTOR-4',
                role: 'Crowd Marshal',
                channel: 'SEVADARS',
                text: 'Sector 4 pontoon barricades secured. Flow steady at 1.8 ppl/m².',
                hops: 1,
                timestamp: Date.now() - 300000
            }
        ];
    }

    saveHistory() {
        try {
            localStorage.setItem('suraksha_mesh_chat_history', JSON.stringify(this.messages.slice(-50)));
        } catch (e) {}
    }

    // Web Audio Synthesizer: Authentic Walkie-Talkie Chirp (100% offline, zero assets)
    playChirp(type = 'rx') {
        if (!this.audioEnabled) return;
        try {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            if (type === 'tx') {
                // Tactical mic key-up tone: quick dual high beep
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1200, now);
                osc.frequency.setValueAtTime(1600, now + 0.04);
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.13);
            } else {
                // Incoming transmission radio squelch chirp
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.setValueAtTime(1150, now + 0.05);
                osc.frequency.setValueAtTime(700, now + 0.1);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
                osc.start(now);
                osc.stop(now + 0.17);
            }
        } catch (e) {
            // Audio blocked until user interaction
        }
    }

    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        const btn = document.getElementById(this.containerId + '-audio-btn');
        if (btn) {
            btn.innerHTML = this.audioEnabled 
                ? '<i class="fas fa-volume-high text-emerald-500"></i> <span class="hidden sm:inline">Chirps ON</span>' 
                : '<i class="fas fa-volume-xmark text-slate-400"></i> <span class="hidden sm:inline">Muted</span>';
        }
    }

    setChannel(ch) {
        this.activeChannel = ch;
        // Update filter button styles
        const btns = document.querySelectorAll(`.${this.containerId}-ch-btn`);
        btns.forEach(b => {
            if (b.dataset.ch === ch) {
                b.className = `${this.containerId}-ch-btn px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-600 text-white shadow-sm transition`;
            } else {
                b.className = `${this.containerId}-ch-btn px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition`;
            }
        });
        this.renderMessages();
    }

    sendMessage(textInputId) {
        const input = document.getElementById(textInputId);
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        const selectCh = document.getElementById(this.containerId + '-send-ch');
        const channel = selectCh ? selectCh.value : (this.activeChannel === 'ALL' ? 'EMERGENCY' : this.activeChannel);

        const msg = {
            id: 'MSG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
            sender: this.nodeId,
            role: this.role,
            channel: channel,
            text: text,
            hops: 0,
            relayPath: [this.nodeId],
            timestamp: Date.now()
        };

        this.seenMessages.add(msg.id);
        this.messages.push(msg);
        this.saveHistory();
        this.renderMessages();
        this.playChirp('tx');

        // Broadcast to all offline peers
        this.channel.postMessage(msg);

        // Also emit to socket if connected
        if (typeof socket !== 'undefined' && socket && socket.emit) {
            socket.emit('MESH_PACKET', {
                packetId: msg.id,
                originNode: this.nodeId,
                type: 'MESH_CHAT',
                payload: msg,
                hops: 0,
                relayPath: [this.nodeId],
                timestamp: msg.timestamp
            });
        }

        input.value = '';
        input.focus();
    }

    sendPreset(presetText, channel = 'EMERGENCY') {
        const input = document.getElementById(this.containerId + '-input');
        if (input) {
            input.value = presetText;
            const selectCh = document.getElementById(this.containerId + '-send-ch');
            if (selectCh) selectCh.value = channel;
            this.sendMessage(this.containerId + '-input');
        }
    }

    handleIncoming(msg) {
        if (!msg || !msg.id) return;
        if (this.seenMessages.has(msg.id)) return;
        this.seenMessages.add(msg.id);

        // Save & render
        this.messages.push(msg);
        this.saveHistory();
        this.renderMessages();
        this.playChirp('rx');

        // Multi-hop relay forwarding (up to 4 hops)
        if (msg.hops < 4 && msg.sender !== this.nodeId) {
            const relayed = {
                ...msg,
                hops: msg.hops + 1,
                relayPath: [...(msg.relayPath || []), this.nodeId]
            };
            this.channel.postMessage(relayed);
        }
    }

    renderUI() {
        const root = document.getElementById(this.containerId);
        if (!root) return;

        root.innerHTML = `
            <div class="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[520px]">
                
                <!-- TOP HEADER -->
                <div class="p-3.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 flex items-center justify-center text-sm font-bold">
                            <i class="fas fa-walkie-talkie"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Offline Tactical Walkie-Talkie</h3>
                                <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 animate-pulse">
                                    0% WAN Radio Active
                                </span>
                            </div>
                            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Node ID: <span class="font-bold text-orange-600">${this.nodeId}</span> • ${this.role}</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <button id="${this.containerId}-audio-btn" onclick="window.__surakshaMessenger.toggleAudio()" 
                            class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-sm transition hover:bg-slate-50">
                            <i class="fas fa-volume-high text-emerald-500"></i>
                            <span class="hidden sm:inline">Chirps ON</span>
                        </button>
                        <button onclick="window.__surakshaMessenger.clearHistory()" title="Clear Local Chat"
                            class="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-red-500 transition">
                            <i class="fas fa-trash-can"></i>
                        </button>
                    </div>
                </div>

                <!-- CHANNELS FILTER BAR -->
                <div class="px-3 py-2 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto custom-scroll">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Ch:</span>
                    <button data-ch="ALL" onclick="window.__surakshaMessenger.setChannel('ALL')" class="${this.containerId}-ch-btn px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-600 text-white shadow-sm transition">ALL</button>
                    <button data-ch="EMERGENCY" onclick="window.__surakshaMessenger.setChannel('EMERGENCY')" class="${this.containerId}-ch-btn px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition">🚨 EMERGENCY</button>
                    <button data-ch="POLICE" onclick="window.__surakshaMessenger.setChannel('POLICE')" class="${this.containerId}-ch-btn px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition">👮 POLICE/QRT</button>
                    <button data-ch="MEDICAL" onclick="window.__surakshaMessenger.setChannel('MEDICAL')" class="${this.containerId}-ch-btn px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition">🏥 MEDICAL</button>
                    <button data-ch="SEVADARS" onclick="window.__surakshaMessenger.setChannel('SEVADARS')" class="${this.containerId}-ch-btn px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition">🚩 SEVADARS</button>
                </div>

                <!-- MESSAGES STREAM -->
                <div id="${this.containerId}-stream" class="flex-grow p-3 space-y-2.5 overflow-y-auto custom-scroll bg-slate-50/50 dark:bg-slate-950/40">
                </div>

                <!-- QUICK PRESET CHIPS -->
                <div class="px-3 py-1.5 bg-slate-100/80 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto custom-scroll text-[11px]">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Quick Tx:</span>
                    <button onclick="window.__surakshaMessenger.sendPreset('🚨 High Crowd Surge at Sangam Nose! Dispatch Quick Response.', 'EMERGENCY')"
                        class="px-2 py-0.5 rounded-md bg-red-100 hover:bg-red-200 dark:bg-red-950/60 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 font-medium whitespace-nowrap transition">
                        🚨 Surge at Sangam
                    </button>
                    <button onclick="window.__surakshaMessenger.sendPreset('🏥 Medical Priority: Need Stretcher & First-Aid at Pontoon 3', 'MEDICAL')"
                        class="px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-medium whitespace-nowrap transition">
                        🏥 Stretcher Pontoon 3
                    </button>
                    <button onclick="window.__surakshaMessenger.sendPreset('🚰 Drinking water tanker & ORS replenishment needed in Sector 2', 'SEVADARS')"
                        class="px-2 py-0.5 rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-medium whitespace-nowrap transition">
                        🚰 Water Sector 2
                    </button>
                    <button onclick="window.__surakshaMessenger.sendPreset('🟢 Ghat area clear. Crowd flow steady and disciplined.', 'POLICE')"
                        class="px-2 py-0.5 rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium whitespace-nowrap transition">
                        🟢 Sector Clear
                    </button>
                </div>

                <!-- INPUT BAR -->
                <div class="p-3 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <select id="${this.containerId}-send-ch" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none">
                        <option value="EMERGENCY">🚨 EMERG</option>
                        <option value="POLICE">👮 POLICE</option>
                        <option value="MEDICAL">🏥 MEDIC</option>
                        <option value="SEVADARS">🚩 SEVA</option>
                    </select>

                    <input id="${this.containerId}-input" type="text" placeholder="Type tactical radio message... (Works 100% offline)"
                        onkeydown="if(event.key==='Enter') window.__surakshaMessenger.sendMessage('${this.containerId}-input')"
                        class="flex-grow p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500">

                    <button onclick="window.__surakshaMessenger.sendMessage('${this.containerId}-input')"
                        class="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 active:scale-95 shrink-0">
                        <i class="fas fa-tower-broadcast"></i>
                        <span>TRANSMIT</span>
                    </button>
                </div>

            </div>
        `;
    }

    renderMessages() {
        const stream = document.getElementById(this.containerId + '-stream');
        if (!stream) return;

        const filtered = this.activeChannel === 'ALL' 
            ? this.messages 
            : this.messages.filter(m => m.channel === this.activeChannel);

        if (filtered.length === 0) {
            stream.innerHTML = `
                <div class="text-center py-10 text-xs text-slate-400">
                    <i class="fas fa-radio text-2xl mb-2 opacity-50"></i>
                    <p>No transmissions on channel <span class="font-bold text-orange-600">${this.activeChannel}</span></p>
                </div>
            `;
            return;
        }

        stream.innerHTML = filtered.map(m => {
            const isMe = m.sender === this.nodeId;
            let chColor = 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-800';
            if (m.channel === 'POLICE') chColor = 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            if (m.channel === 'MEDICAL') chColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            if (m.channel === 'SEVADARS') chColor = 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-800';

            const timeStr = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const hopStr = m.hops === 0 ? '📡 Direct Radio' : `⚡ ${m.hops} Hop${m.hops > 1 ? 's' : ''}`;

            return `
                <div class="p-2.5 rounded-xl border ${isMe ? 'bg-orange-50/60 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/40' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'} shadow-sm text-xs space-y-1">
                    <div class="flex items-center justify-between text-[10px]">
                        <div class="flex items-center gap-1.5">
                            <span class="px-1.5 py-0.5 rounded font-mono font-bold border text-[9px] ${chColor}">${m.channel}</span>
                            <span class="font-mono font-bold ${isMe ? 'text-orange-600 dark:text-orange-400' : 'text-slate-800 dark:text-slate-200'}">${m.sender}</span>
                            <span class="text-slate-400">(${m.role || 'Node'})</span>
                        </div>
                        <div class="flex items-center gap-2 text-slate-400 font-mono text-[9px]">
                            <span>${hopStr}</span>
                            <span>${timeStr}</span>
                        </div>
                    </div>
                    <p class="text-slate-800 dark:text-slate-200 font-medium leading-relaxed pl-1">${escapeHtml(m.text)}</p>
                </div>
            `;
        }).join('');

        stream.scrollTop = stream.scrollHeight;
    }

    clearHistory() {
        if (confirm("Clear local walkie-talkie message history?")) {
            this.messages = [];
            this.saveHistory();
            this.renderMessages();
        }
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

window.SurakshaMeshMessenger = SurakshaMeshMessenger;

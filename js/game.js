

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const hud = document.getElementById('gameHUD');
const msgBox = document.getElementById('message');

// Audio Context Setup
let audioCtx = null;
let audioUnlocked = false;
function initAudio() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;
    if (!audioCtx) audioCtx = new AudioCtor();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (!audioUnlocked) {
        const unlockBuffer = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);
        const unlockSource = audioCtx.createBufferSource();
        unlockSource.buffer = unlockBuffer;
        unlockSource.connect(audioCtx.destination);
        unlockSource.start(0);
        audioUnlocked = true;
    }
}

function playSound(type) {
    if (!audioCtx) initAudio();
    if (!audioCtx || setVolM == 0 || setVolS == 0) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            if (audioCtx.state === 'running') playSound(type);
        }).catch(() => {});
        return;
    }
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    
    let vol = (setVolM / 100) * (setVolS / 100);
    
    if (type === 'success') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(vol * 0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start(); osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'fail') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol * 0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start(); osc.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'emp') {
        osc.type = 'square'; osc.frequency.setValueAtTime(40, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol * 0.6, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.0);
        osc.start(); osc.stop(audioCtx.currentTime + 1.0);
    } else if (type === 'tick') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol * 0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'alarm') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(320, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(640, audioCtx.currentTime + 0.18);
        osc.frequency.linearRampToValueAtTime(320, audioCtx.currentTime + 0.36);
        gain.gain.setValueAtTime(vol * 0.18, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
        osc.start(); osc.stop(audioCtx.currentTime + 0.45);
    } else if (type === 'menuHover') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(520, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol * 0.035, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.07);
        osc.start(); osc.stop(audioCtx.currentTime + 0.07);
    } else if (type === 'menuSelect') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(360, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(720, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(vol * 0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
        osc.start(); osc.stop(audioCtx.currentTime + 0.18);
    } else if (type === 'menuBack') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(260, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol * 0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.13);
        osc.start(); osc.stop(audioCtx.currentTime + 0.13);
    } else if (type === 'unlock') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(460, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(920, audioCtx.currentTime + 0.22);
        gain.gain.setValueAtTime(vol * 0.14, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start(); osc.stop(audioCtx.currentTime + 0.35);
    }
}

// Versioned local progress with a backup copy and import/export support.
const GAME_VERSION = '2.3.1';
const SAVE_SCHEMA_VERSION = 7;
const SAVE_KEY = 'br_save_v2';
const SAVE_BACKUP_KEY = 'br_save_backup_v2';

const MAP_DEFINITIONS = {
    level0: { id: 'level0', name: 'LEVEL 0 — THE MAZE', description: 'The original shifting maze.', campaignOrder: 0 },
    boilerworks: { id: 'boilerworks', name: 'LEVEL 3 — THE BOILERWORKS', description: 'Long industrial halls, hot machinery, and Aeson.', campaignOrder: 1 },
    hotel: { id: 'hotel', name: 'THE ENDLESS HOTEL', description: 'Carpeted wings, guest rooms, employees, and Bassam.', campaignOrder: 2 },
    crimson: { id: 'crimson', name: 'THE CRIMSON CONTAINMENT', description: 'Break the seal route, survive Rhys, and trap him.', campaignOrder: 3 }
};

const LOADOUT_DEFINITIONS = {
    free: { name: 'FREE CARRY', description: 'Use any items you own.', items: null },
    chase: { name: 'CHASE KIT', description: 'Adrenaline, Flashbangs, and Bear Traps.', items: ['adrenaline', 'flashbang', 'bearTrap'] },
    utility: { name: 'UTILITY KIT', description: 'Noise Makers, Batteries, and Breath Filters.', items: ['noiseMaker', 'battery', 'breathFilter'] }
};

const DAILY_OBJECTIVE_POOL = [
    { id: 'repair-3', label: 'Repair 3 generators', type: 'generators', target: 3, reward: 12 },
    { id: 'win-1', label: 'Complete 1 run', type: 'wins', target: 1, reward: 20 },
    { id: 'boilerworks-1', label: 'Play 1 Boilerworks run', type: 'boilerworks', target: 1, reward: 18 },
    { id: 'valves-3', label: 'Activate 3 cooling valves', type: 'cooling', target: 3, reward: 16 },
    { id: 'items-2', label: 'Use 2 consumable items', type: 'items', target: 2, reward: 10 },
    { id: 'catch-aeson', label: 'Catch Aeson', type: 'aeson', target: 1, reward: 25 },
    { id: 'no-items', label: 'Win without using items', type: 'noItems', target: 1, reward: 30 }
];

function safeStorageGet(key) {
    try { return localStorage.getItem(key); } catch (error) { return null; }
}

function boundedInt(value, min, max, fallback = min) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(min, Math.min(max, Math.floor(number))) : fallback;
}

function normalizeCosmetics(value) {
    const source = value && typeof value === 'object' ? value : {};
    const colors = ['blue', 'crimson', 'violet', 'green', 'amber', 'gold'];
    const trails = ['none', 'spark', 'ghost', 'ember'];
    const unlocked = Array.isArray(source.unlocked) ? source.unlocked.filter(id => colors.includes(id) || trails.includes(id)) : [];
    return {
        color: colors.includes(source.color) ? source.color : 'blue',
        trail: trails.includes(source.trail) ? source.trail : 'none',
        unlocked: Array.from(new Set(['blue', 'none', ...unlocked]))
    };
}

function normalizeStats(value) {
    const source = value && typeof value === 'object' ? value : {};
    const names = ['CALEB', 'MALAKAI', 'JORDAN', 'AESON', 'BASSAM', 'RHYS'];
    const encounters = {};
    names.forEach(name => encounters[name] = boundedInt(source.encounters?.[name], 0, 999999, 0));
    const encounteredNames = names.filter(name => encounters[name] > 0);
    const favorite = names.includes(source.favoriteMonster) && encounters[source.favoriteMonster] > 0
        ? source.favoriteMonster
        : (encounteredNames.sort((a, b) => encounters[b] - encounters[a])[0] || 'None');
    return {
        games: boundedInt(source.games, 0, 999999, 0),
        wins: boundedInt(source.wins, 0, 999999, 0),
        losses: boundedInt(source.losses, 0, 999999, 0),
        generators: boundedInt(source.generators, 0, 999999, 0),
        caught: boundedInt(source.caught, 0, 999999, 0),
        timesCaught: boundedInt(source.timesCaught, 0, 999999, 0),
        bestEndless: boundedInt(source.bestEndless, 0, 999999, 0),
        fastestWin: boundedInt(source.fastestWin, 0, 86400000, 0),
        mostGenerators: boundedInt(source.mostGenerators, 0, 999999, 0),
        itemsUsed: boundedInt(source.itemsUsed, 0, 999999, 0),
        favoriteMonster: favorite,
        encounters
    };
}

function normalizeProgress(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const source = raw.progress && typeof raw.progress === 'object' ? raw.progress : raw;
    if (raw.schemaVersion !== undefined && raw.schemaVersion > SAVE_SCHEMA_VERSION) return null;
    if (source.tokens === undefined && source.upgShoe === undefined) return null;
    const unlockedMaps = Array.isArray(source.unlockedMaps) ? source.unlockedMaps.filter(id => MAP_DEFINITIONS[id]) : ['level0'];
    const dailySource = source.daily && typeof source.daily === 'object' ? source.daily : {};
    const dailyObjectives = Array.isArray(dailySource.objectives) ? dailySource.objectives.map(item => ({
        id: String(item.id || ''), label: String(item.label || 'Daily objective'), type: String(item.type || ''),
        target: boundedInt(item.target, 1, 999, 1), progress: boundedInt(item.progress, 0, 999, 0),
        reward: boundedInt(item.reward, 0, 9999, 0), claimed: Boolean(item.claimed)
    })).slice(0, 3) : [];
    return {
        tokens: boundedInt(source.tokens, 0, 999999, 0),
        upgShoe: boundedInt(source.upgShoe, 0, 3, 0),
        upgHack: boundedInt(source.upgHack, 0, 2, 0),
        upgQuick: boundedInt(source.upgQuick, 0, 3, 0),
        upgCoin: boundedInt(source.upgCoin, 0, 1, 0),
        invAdrenaline: boundedInt(source.invAdrenaline, 0, 9999, 0),
        invFlashbang: boundedInt(source.invFlashbang, 0, 9999, 0),
        invNoiseMaker: boundedInt(source.invNoiseMaker, 0, 9999, 0),
        invBearTrap: boundedInt(source.invBearTrap, 0, 9999, 0),
        invBattery: boundedInt(source.invBattery, 0, 9999, 0),
        invBreathFilter: boundedInt(source.invBreathFilter, 0, 9999, 0),
        cosmetics: normalizeCosmetics(source.cosmetics),
        stats: normalizeStats(source.stats),
        unlockedMaps: Array.from(new Set(['level0', ...unlockedMaps])),
        campaignCleared: Array.isArray(source.campaignCleared) ? source.campaignCleared.filter(id => MAP_DEFINITIONS[id]) : [],
        selectedLoadout: LOADOUT_DEFINITIONS[source.selectedLoadout] ? source.selectedLoadout : 'free',
        daily: { date: String(dailySource.date || ''), objectives: dailyObjectives }
    };
}

function loadProgress() {
    for (const key of [SAVE_KEY, SAVE_BACKUP_KEY]) {
        const stored = safeStorageGet(key);
        if (stored) {
            try {
                const parsed = normalizeProgress(JSON.parse(stored));
                if (parsed) return parsed;
            } catch (error) { /* Try the backup or legacy save next. */ }
        }
    }
    return normalizeProgress({
        tokens: safeStorageGet('br_tokens'),
        upgShoe: safeStorageGet('br_shoe'),
        upgHack: safeStorageGet('br_hack'),
        upgQuick: safeStorageGet('br_quick'),
        upgCoin: safeStorageGet('br_coin'),
        invAdrenaline: safeStorageGet('br_adrenaline'),
        invFlashbang: safeStorageGet('br_flashbang'),
        invNoiseMaker: safeStorageGet('br_noiseMaker'),
        invBearTrap: safeStorageGet('br_bearTrap')
    }) || { tokens: 0, upgShoe: 0, upgHack: 0, upgQuick: 0, upgCoin: 0, invAdrenaline: 0, invFlashbang: 0, invNoiseMaker: 0, invBattery: 0, invBreathFilter: 0, cosmetics: { color: 'blue', trail: 'none', unlocked: ['blue', 'none'] }, stats: {} };
}

const loadedProgress = loadProgress();
let tokens = loadedProgress.tokens;
let upgShoe = loadedProgress.upgShoe;
let upgHack = loadedProgress.upgHack;
let upgQuick = loadedProgress.upgQuick;
let upgCoin = loadedProgress.upgCoin;
let invAdrenaline = loadedProgress.invAdrenaline;
let invFlashbang = loadedProgress.invFlashbang;
let invNoiseMaker = loadedProgress.invNoiseMaker;
let invBearTrap = loadedProgress.invBearTrap || 0;
let invBattery = loadedProgress.invBattery;
let invBreathFilter = loadedProgress.invBreathFilter;
let cosmetics = normalizeCosmetics(loadedProgress.cosmetics);
let stats = normalizeStats(loadedProgress.stats);
let unlockedMaps = loadedProgress.unlockedMaps || ['level0'];
let campaignCleared = loadedProgress.campaignCleared || [];
let selectedLoadout = loadedProgress.selectedLoadout || 'free';
let daily = loadedProgress.daily || { date: '', objectives: [] };

// Settings Data
let setFPS = localStorage.getItem('br_fps') === 'true';
let setCRT = localStorage.getItem('br_crt') === 'true';
let setOptimization = localStorage.getItem('br_optimization') === 'true';
let setVolM = localStorage.getItem('br_volM') || 100;
let setVolS = localStorage.getItem('br_volS') || 100;

function currentProgress() {
    return { tokens, upgShoe, upgHack, upgQuick, upgCoin, invAdrenaline, invFlashbang, invNoiseMaker, invBearTrap, invBattery, invBreathFilter, cosmetics, stats, unlockedMaps, campaignCleared, selectedLoadout, daily };
}

function getDateKey(date = new Date()) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function ensureDailyObjectives() {
    const today = getDateKey();
    if (daily.date === today && daily.objectives?.length === 3) return;
    const seed = today.split('-').reduce((total, part) => total + Number(part), 0);
    daily = {
        date: today,
        objectives: [0, 1, 2].map(offset => {
            const item = DAILY_OBJECTIVE_POOL[(seed + offset * 3) % DAILY_OBJECTIVE_POOL.length];
            return { ...item, progress: 0, claimed: false };
        })
    };
    saveData();
}

function advanceDailyObjective(type, amount = 1) {
    ensureDailyObjectives();
    let changed = false;
    for (const objective of daily.objectives) {
        if (objective.type !== type || objective.claimed) continue;
        const previous = objective.progress;
        objective.progress = Math.min(objective.target, objective.progress + amount);
        changed ||= objective.progress !== previous;
    }
    if (changed) saveData();
}

function claimDailyObjective(index) {
    ensureDailyObjectives();
    const objective = daily.objectives[index];
    if (!objective || objective.claimed || objective.progress < objective.target) return;
    objective.claimed = true;
    tokens += objective.reward;
    saveData();
    renderDailyObjectives();
    showMsg(`<span style="color:#0f0">DAILY REWARD +${objective.reward} TOKENS</span>`, 1200);
}

function itemAllowed(type) {
    const loadout = LOADOUT_DEFINITIONS[selectedLoadout] || LOADOUT_DEFINITIONS.free;
    return !loadout.items || loadout.items.includes(type);
}

function renderDailyObjectives() {
    ensureDailyObjectives();
    const content = document.getElementById('dailyObjectivesContent');
    if (!content) return;
    content.innerHTML = daily.objectives.map((objective, index) => {
        const complete = objective.progress >= objective.target;
        const action = complete && !objective.claimed ? ` <button onclick="claimDailyObjective(${index})">CLAIM ${objective.reward} T</button>` : '';
        return `<div class="objective-row"><div><b>${objective.label}</b><br><span>${Math.min(objective.progress, objective.target)}/${objective.target}${objective.claimed ? ' · CLAIMED' : ''}</span></div>${action}</div>`;
    }).join('');
}

function renderLoadouts() {
    const content = document.getElementById('loadoutsContent');
    if (!content) return;
    content.innerHTML = Object.entries(LOADOUT_DEFINITIONS).map(([id, loadout]) => `<button class="loadout-option" ${selectedLoadout === id ? 'style="border-color:#0f0;color:#0f0"' : ''} onclick="selectLoadout('${id}')"><b>${loadout.name}</b><br><span>${loadout.description}</span></button>`).join('');
}

function mountSurvivalSetup() {
    const source = document.querySelector('#survivalMenu > div');
    const target = document.getElementById('runSetupOptions');
    if (!source || !target || source.dataset.mounted === 'true') return;
    source.dataset.mounted = 'true';
    source.id = 'embeddedSurvivalFields';
    target.insertBefore(source, target.firstChild);
}

function renderRunSetup() {
    mountSurvivalSetup();
    const standard = document.getElementById('standardDifficultyOptions');
    const runOptions = document.getElementById('runSetupOptions');
    const survivalFields = document.querySelector('#embeddedSurvivalFields');
    const survivalStart = document.getElementById('startSurvivalButton');
    const isSurvival = gameMode === 'survival';
    if (standard) standard.style.display = isSurvival ? 'none' : 'block';
    if (runOptions) runOptions.style.display = 'block';
    if (survivalFields) survivalFields.style.display = isSurvival ? 'block' : 'none';
    if (survivalStart) survivalStart.style.display = isSurvival ? 'block' : 'none';
    const heading = document.querySelector('#diffMenu h2');
    if (heading) heading.textContent = isSurvival ? 'RUN SETUP' : 'SELECT DIFFICULTY';
    const loadoutTarget = document.getElementById('runLoadoutOptions');
    if (loadoutTarget) loadoutTarget.innerHTML = Object.entries(LOADOUT_DEFINITIONS).map(([id, loadout]) => `<button class="loadout-option" ${selectedLoadout === id ? 'style="border-color:#0f0;color:#0f0"' : ''} onclick="selectLoadout('${id}')"><b>${loadout.name}</b><br><span>${loadout.description}</span></button>`).join('');
}

function renderRecords() {
    ensureDailyObjectives();
    const content = document.getElementById('recordsContent');
    if (!content) return;
    const fastest = stats.fastestWin ? `${(stats.fastestWin / 1000).toFixed(1)}s` : '—';
    const readyDaily = daily.objectives.filter(objective => objective.progress >= objective.target && !objective.claimed).length;
    const colorOptions = [{ id:'blue', label:'Default Blue' }, { id:'crimson', label:'Crimson' }, { id:'violet', label:'Violet' }, { id:'green', label:'Green' }, { id:'amber', label:'Amber' }, { id:'gold', label:'Containment Gold' }];
    const trailOptions = [{ id:'none', label:'No trail' }, { id:'spark', label:'Spark trail' }, { id:'ghost', label:'Ghost trail' }, { id:'ember', label:'Ember trail' }];
    const cosmeticControls = `<b>PLAYER COLOR</b><br>${colorOptions.map(item => `<button ${cosmetics.unlocked.includes(item.id) ? '' : 'disabled'} onclick="selectCosmetic('color','${item.id}'); renderRecords();">${cosmetics.color === item.id ? '✓ ' : ''}${item.label}</button>`).join('')}<br><b>TRAIL</b><br>${trailOptions.map(item => `<button ${cosmetics.unlocked.includes(item.id) ? '' : 'disabled'} onclick="selectCosmetic('trail','${item.id}'); renderRecords();">${cosmetics.trail === item.id ? '✓ ' : ''}${item.label}</button>`).join('')}`;
    content.innerHTML = `<details class="record-section" open><summary>RUN STATISTICS</summary><div>Games: <b>${stats.games}</b><br>Wins / Losses: <b>${stats.wins} / ${stats.losses}</b><br>Generators repaired: <b>${stats.generators}</b><br>Monsters caught: <b>${stats.caught}</b><br>Best Endless round: <b>${stats.bestEndless}</b><br>Fastest win: <b>${fastest}</b><br>Items used: <b>${stats.itemsUsed}</b><br>Favorite monster: <b>${stats.favoriteMonster}</b></div></details><details class="record-section"><summary>COSMETICS & COLLECTION</summary><div>${cosmetics.unlocked.length} cosmetic unlocks · ${unlockedMaps.length}/${Object.keys(MAP_DEFINITIONS).length} maps unlocked<br><br>${cosmeticControls}<br><br>${Object.values(MAP_DEFINITIONS).map(mapDef => `<div class="collection-row"><strong>${mapDef.name}</strong><span>${unlockedMaps.includes(mapDef.id) ? 'UNLOCKED' : 'LOCKED'}</span></div>`).join('')}</div></details><details class="record-section"><summary>DAILY OBJECTIVES ${readyDaily ? `· ${readyDaily} READY` : ''}</summary><div>${daily.objectives.map((objective, index) => `<div class="objective-row"><div><b>${objective.label}</b><br><span>${Math.min(objective.progress, objective.target)}/${objective.target}${objective.claimed ? ' · CLAIMED' : ''}</span></div>${objective.progress >= objective.target && !objective.claimed ? `<button onclick="claimDailyObjective(${index}); renderRecords();">CLAIM ${objective.reward} T</button>` : ''}</div>`).join('')}</div></details>`;
}

function selectLoadout(id) {
    if (!LOADOUT_DEFINITIONS[id]) return;
    selectedLoadout = id;
    saveData();
    renderLoadouts();
    renderRunSetup();
}

function setSaveStatus(text, color = '#8f8') {
    const status = document.getElementById('saveStatus');
    if (status) {
        status.textContent = text;
        status.style.color = color;
    }
}

function saveSettings() {
    localStorage.setItem('br_fps', setFPS);
    localStorage.setItem('br_crt', setCRT);
    localStorage.setItem('br_optimization', setOptimization);
    setVolM = document.getElementById('volMaster').value;
    setVolS = document.getElementById('volSFX').value;
    localStorage.setItem('br_volM', setVolM);
    localStorage.setItem('br_volS', setVolS);
    applySettings();
}

function applySettings() {
    document.getElementById('fpsCounter').style.display = setFPS ? 'block' : 'none';
    document.getElementById('crtFilter').style.display = setCRT ? 'block' : 'none';
    document.getElementById('btnFPS').innerText = setFPS ? 'ON' : 'OFF';
    document.getElementById('btnFPS').style.color = setFPS ? '#0f0' : '#fff';
    document.getElementById('btnCRT').innerText = setCRT ? 'ON' : 'OFF';
    document.getElementById('btnCRT').style.color = setCRT ? '#0f0' : '#fff';
    document.getElementById('btnOptimization').innerText = setOptimization ? 'ON' : 'OFF';
    document.getElementById('btnOptimization').style.color = setOptimization ? '#0f0' : '#fff';
    document.getElementById('volMaster').value = setVolM;
    document.getElementById('volSFX').value = setVolS;
}

function toggleSetting(type) {
    if(type === 'fps') setFPS = !setFPS;
    if(type === 'crt') setCRT = !setCRT;
    if(type === 'optimization') setOptimization = !setOptimization;
    saveSettings();
}

function saveData() {
    const payload = {
        gameVersion: GAME_VERSION,
        schemaVersion: SAVE_SCHEMA_VERSION,
        savedAt: new Date().toISOString(),
        progress: currentProgress()
    };
    try {
        const previous = localStorage.getItem(SAVE_KEY);
        if (previous) localStorage.setItem(SAVE_BACKUP_KEY, previous);
        localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
        // Keep the old keys temporarily so existing installations remain compatible.
        localStorage.setItem('br_tokens', tokens);
        localStorage.setItem('br_shoe', upgShoe);
        localStorage.setItem('br_hack', upgHack);
        localStorage.setItem('br_quick', upgQuick);
        localStorage.setItem('br_coin', upgCoin);
        localStorage.setItem('br_adrenaline', invAdrenaline);
        localStorage.setItem('br_flashbang', invFlashbang);
        localStorage.setItem('br_noiseMaker', invNoiseMaker);
        localStorage.setItem('br_bearTrap', invBearTrap);
        setSaveStatus(`Progress saved · ${new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`);
    } catch (error) {
        setSaveStatus('Save unavailable on this device', '#ff8888');
    }
    updateMenuData();
}

function exportSave() {
    const payload = {
        game: "The Backrooms: Caleb's Shift",
        gameVersion: GAME_VERSION,
        schemaVersion: SAVE_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        progress: currentProgress()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'calebs-shift-save.json';
    link.click();
    URL.revokeObjectURL(url);
    setSaveStatus('Save file exported');
}

function importSave(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const imported = normalizeProgress(JSON.parse(reader.result));
            if (!imported) throw new Error('Invalid save');
            if (!confirm('Replace your current progress with this save file?')) return;
            tokens = imported.tokens;
            upgShoe = imported.upgShoe;
            upgHack = imported.upgHack;
            upgQuick = imported.upgQuick;
            upgCoin = imported.upgCoin;
            invAdrenaline = imported.invAdrenaline;
            invFlashbang = imported.invFlashbang;
            invNoiseMaker = imported.invNoiseMaker;
            invBearTrap = imported.invBearTrap;
            invBattery = imported.invBattery;
            invBreathFilter = imported.invBreathFilter;
            cosmetics = normalizeCosmetics(imported.cosmetics);
            stats = normalizeStats(imported.stats);
            saveData();
            setSaveStatus('Save imported successfully');
        } catch (error) {
            setSaveStatus('That save file is invalid', '#ff8888');
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file);
}

function resetProgress() {
    if (!confirm('Reset all tokens, upgrades, and items? Your previous save will remain in the backup slot.')) return;
    tokens = 0; upgShoe = 0; upgHack = 0; upgQuick = 0; upgCoin = 0; invAdrenaline = 0; invFlashbang = 0; invNoiseMaker = 0; invBearTrap = 0; invBattery = 0; invBreathFilter = 0;
    saveData();
    setSaveStatus('Progress reset; previous save kept as backup');
}

function updateMenuData() {
    ensureDailyObjectives();
    document.getElementById('tokenDisplayMain').innerText = `Tokens: ${tokens}`;
    document.getElementById('tokenDisplayShop').innerText = `Tokens: ${tokens}`;
    document.getElementById('shoeTier').innerText = upgShoe;
    document.getElementById('hackTier').innerText = upgHack;
    document.getElementById('quickTier').innerText = upgQuick;
    document.getElementById('coinTier').innerText = upgCoin;
    const status = document.getElementById('menuStatusRow');
    if (status) {
        const dailyReady = daily.objectives.filter(objective => objective.progress >= objective.target && !objective.claimed).length;
        status.innerHTML = `<span>${unlockedMaps.length}/${Object.keys(MAP_DEFINITIONS).length} MAPS</span><span>${dailyReady ? `${dailyReady} DAILY READY` : 'DAILY ACTIVE'}</span><span>${LOADOUT_DEFINITIONS[selectedLoadout].name}</span>`;
    }
    
    let btnShoe = document.getElementById('btnShoe');
    if (upgShoe >= 3) { btnShoe.innerText = "MAX"; btnShoe.disabled = true; }
    else { btnShoe.innerText = `${50 + (upgShoe*50)} T`; btnShoe.disabled = false; }
    
    let btnHack = document.getElementById('btnHack');
    if (upgHack >= 2) { btnHack.innerText = "MAX"; btnHack.disabled = true; }
    else { btnHack.innerText = `${75 + (upgHack*75)} T`; btnHack.disabled = false; }
    
    let btnQuick = document.getElementById('btnQuick');
    if (upgQuick >= 3) { btnQuick.innerText = "MAX"; btnQuick.disabled = true; }
    else { btnQuick.innerText = `${40 + (upgQuick*40)} T`; btnQuick.disabled = false; }
    
    let btnCoin = document.getElementById('btnCoin');
    if (upgCoin >= 1) { btnCoin.innerText = "MAX"; btnCoin.disabled = true; }
    else { btnCoin.innerText = `150 T`; btnCoin.disabled = false; }
}

function renderStats() {
    const fastest = stats.fastestWin ? `${(stats.fastestWin / 1000).toFixed(1)}s` : '—';
    document.getElementById('statsContent').innerHTML = `Games: <b>${stats.games}</b><br>Wins / Losses: <b>${stats.wins} / ${stats.losses}</b><br>Generators repaired: <b>${stats.generators}</b><br>Monsters caught: <b>${stats.caught}</b><br>Times caught: <b>${stats.timesCaught}</b><br>Best Endless round: <b>${stats.bestEndless}</b><br>Fastest win: <b>${fastest}</b><br>Most generators in one run: <b>${stats.mostGenerators}</b><br>Items used: <b>${stats.itemsUsed}</b><br>Favorite monster: <b>${stats.favoriteMonster}</b>`;
}

let cosmeticTab = 'colors';
function selectCosmetic(type, value) {
    cosmetics[type] = value;
    saveData(); renderCosmetics();
}

function setCosmeticTab(tab) { cosmeticTab = tab; renderCosmetics(); }

function renderCosmetics() {
    const groups = {
        colors: { type:'color', items:[
            { id:'blue', label:'Default Blue', desc:'The original survivor color.', how:'Available from the start.', preview:'#00f' },
            { id:'crimson', label:'Crimson', desc:'A deep red finish.', how:'Win a Hard run.', preview:'#d22' },
            { id:'violet', label:'Violet', desc:'A hunter-purple finish.', how:'Catch Malakai.', preview:'#a64dff' },
            { id:'green', label:'Green', desc:'A mimic-green finish.', how:'Catch Jordan.', preview:'#19c76b' },
            { id:'amber', label:'Amber', desc:'A quick-escape gold.', how:'Win a run in under two minutes.', preview:'#e7a21a' },
            { id:'gold', label:'Containment Gold', desc:'A yellow Rhys-themed finish.', how:'Catch Rhys in Crimson Containment.', preview:'#e9cf38' }
        ]},
        trails: { type:'trail', items:[
            { id:'none', label:'No Trail', desc:'No motion effect.', how:'Available from the start.', preview:'#888' },
            { id:'spark', label:'Spark Trail', desc:'A short fading line of sparks.', how:'Clear Endless round 3.', preview:'#ffd750' },
            { id:'ghost', label:'Ghost Trail', desc:'A soft spectral after-trail.', how:'Win without items.', preview:'#b4d7ff' },
            { id:'ember', label:'Ember Trail', desc:'A warm containment glow.', how:'Catch Rhys in Crimson Containment.', preview:'#ffb347' }
        ]}
    };
    const content = document.getElementById('cosmeticsContent'); if (!content) return;
    if (cosmeticTab === 'hats') { content.innerHTML = '<div class="cosmetic-book"><div class="coming-soon"><div><b>HATS</b><br><br>Coming soon — waiting for hat PNG designs.</div></div></div>'; return; }
    const group = groups[cosmeticTab] || groups.colors;
    content.innerHTML = `<div class="cosmetic-book"><div class="cosmetic-grid">${group.items.map(item => { const unlocked = cosmetics.unlocked.includes(item.id); const equipped = cosmetics[group.type] === item.id; return `<div class="cosmetic-card"><div class="cosmetic-preview" style="color:${item.preview}; text-shadow:0 0 14px ${item.preview};">● ${item.label.toUpperCase()}</div><b>${item.label}</b><small>${item.desc}<br><span style="color:#d4c09a">How: ${item.how}</span></small><button ${unlocked ? '' : 'disabled'} onclick="selectCosmetic('${group.type}','${item.id}')">${equipped ? 'EQUIPPED' : unlocked ? 'EQUIP' : 'LOCKED'}</button></div>`; }).join('')}</div></div>`;
}

function renderCollection() {
    const content = document.getElementById('collectionContent');
    if (!content) return;
    const monsterRows = [
        ['CALEB', 'The Disruptor', 'EMP blackout hunter'],
        ['MALAKAI', 'The Blood Hunter', 'Tracks loud mistakes'],
        ['JORDAN', 'The Mimic', 'Generator impersonator'],
        ['AESON', 'The Firestarter', 'Ignites the Boilerworks'],
        ['BASSAM', 'The Concierge', unlockedMaps.includes('hotel') ? 'Employee-disguise predator' : 'Unlock the Endless Hotel'],
        ['RHYS', 'The Contained', unlockedMaps.includes('crimson') ? 'Goop-spitting dash predator' : 'Unlock Crimson Containment']
    ];
    const mutationRows = ['Speed Demon','Phantom','Frenzy','Camouflage','Giant','Gloom','Reinforced','Lethargy','Resilient','Scrambler','Hexed','Hallucinations','All-Seeing','Locked In','Echo','False Objective','Watcher','Panic','Heavy Footfall','Afterimage'];
    content.innerHTML = `<b>MONSTERS</b>${monsterRows.map(row => `<div class="collection-row"><strong>${row[0]}</strong><span>${row[1]} · ${row[2]}</span></div>`).join('')}<br><b>MAPS</b>${Object.values(MAP_DEFINITIONS).map(mapDef => `<div class="collection-row"><strong>${mapDef.name}</strong><span>${unlockedMaps.includes(mapDef.id) ? 'UNLOCKED' : 'LOCKED'}</span></div>`).join('')}<br><b>MUTATIONS</b><div class="collection-tags">${mutationRows.map(name => `<span>${name}</span>`).join('')}</div>`;
}

function showMenu(menuId) {
    document.querySelectorAll('.menu-panel').forEach(p => p.style.display = 'none');
    hud.style.display = 'none';
    document.getElementById(menuId).style.display = 'flex';
    updateMenuData();
    if (menuId === 'statsMenu') renderStats();
    if (menuId === 'cosmeticsMenu') renderCosmetics();
    if (menuId === 'objectivesMenu') renderDailyObjectives();
    if (menuId === 'loadoutsMenu') renderLoadouts();
    if (menuId === 'collectionMenu') renderCollection();
    if (menuId === 'recordsMenu') renderRecords();
    if (menuId === 'diffMenu') renderRunSetup();
    if (menuId === 'mapMenu') renderMapMenu();
}

function showInstallHelp() { showMenu('installMenu'); }

function chooseMode(mode) {
    gameMode = mode;
    survivalConfig = null;
    endlessRound = 1;
    showMenu('mapMenu');
}

function renderMapMenu() {
    const content = document.getElementById('mapOptions');
    if (!content) return;
    content.innerHTML = Object.values(MAP_DEFINITIONS).map(mapDef => {
        const unlocked = unlockedMaps.includes(mapDef.id);
        const campaignLocked = gameMode === 'campaign' && mapDef.campaignOrder > campaignCleared.length;
        const disabled = !unlocked || campaignLocked;
        const label = disabled ? 'LOCKED' : 'SELECT';
        return `<button ${disabled ? 'disabled' : ''} onclick="selectMap('${mapDef.id}')"><b>${mapDef.name}</b><br><span style="font-size:12px;color:#aaa">${disabled ? 'Complete the previous campaign map first.' : mapDef.description}</span><br><span style="font-size:12px;color:${disabled ? '#777' : '#0f0'}">${label}</span></button>`;
    }).join('');
}

function selectMap(mapId) {
    if (!MAP_DEFINITIONS[mapId] || !unlockedMaps.includes(mapId)) return;
    if (gameMode === 'campaign' && MAP_DEFINITIONS[mapId].campaignOrder > campaignCleared.length) return;
    currentMapId = mapId;
    if (gameMode === 'survival') {
        const survivalMap = document.getElementById('survivalMap');
        if (survivalMap) survivalMap.value = mapId;
    }
    showMenu('diffMenu');
}

function startSelectedGame(diffLevel) {
    if (gameMode === 'survival') { startSurvival(); return; }
    startGame(diffLevel);
}

function startSurvival() {
    const names = [];
    if (document.getElementById('survivalCaleb').checked) names.push('CALEB');
    if (document.getElementById('survivalMalakai').checked) names.push('MALAKAI');
    if (document.getElementById('survivalJordan').checked) names.push('JORDAN');
    if (document.getElementById('survivalAeson').checked) names.push('AESON');
    if (document.getElementById('survivalBassam')?.checked) names.push('BASSAM');
    if (document.getElementById('survivalRhys')?.checked) names.push('RHYS');
    if (names.length === 0) { showMsg('SELECT AT LEAST ONE MONSTER', 1600); return; }
    gameMode = 'survival';
    endlessRound = 1;
    currentMapId = document.getElementById('survivalMap').value;
    if (!unlockedMaps.includes(currentMapId)) { showMsg('UNLOCK THIS MAP IN CAMPAIGN FIRST', 1400); return; }
    survivalConfig = {
        names,
        count: Number(document.getElementById('survivalCount').value),
        generators: Number(document.getElementById('survivalGens').value),
        mutations: Number(document.getElementById('survivalMuts').value),
        events: document.getElementById('survivalEvents').checked
    };
    startGame(Number(document.getElementById('survivalDiff').value));
}

async function testSound() {
    initAudio();
    if (audioCtx?.state === 'suspended') await audioCtx.resume();
    playSound('success');
}

function openShop() { showMenu('shopMenu'); }

function buyUpgrade(type, baseCost) {
    let cost = baseCost;
    if (type === 'shoe') cost += (upgShoe * 50);
    if (type === 'hack') cost += (upgHack * 75);
    if (type === 'quick') cost += (upgQuick * 40);

    if (tokens >= cost) {
        tokens -= cost;
        if (type === 'shoe' && upgShoe < 3) upgShoe++;
        if (type === 'hack' && upgHack < 2) upgHack++;
        if (type === 'quick' && upgQuick < 3) upgQuick++;
        if (type === 'coin' && upgCoin < 1) upgCoin++;
        saveData();
    }
}
function buyConsumable(type, cost) {
    const carried = invAdrenaline + invFlashbang + invNoiseMaker + invBearTrap + invBattery + invBreathFilter;
    if (carried >= 5) { setSaveStatus('Inventory full — carry at most 5 consumables', '#ffcc66'); return; }
    if (tokens >= cost) {
        tokens -= cost;
        if (type === 'adrenaline') invAdrenaline++;
        if (type === 'flashbang') invFlashbang++;
        if (type === 'noiseMaker') invNoiseMaker++;
        if (type === 'bearTrap') invBearTrap++;
        if (type === 'battery') invBattery++;
        if (type === 'breathFilter') invBreathFilter++;
        saveData();
    }
}

// Game Core Settings
const TS = 40;
// The maze sits inside a larger canvas grid. The spare border is used for real
// side rooms, so they are physically connected to the maze rather than painted on it.
let COLS = 41, ROWS = 33;
const MAZE_LEFT = 5, MAZE_TOP = 5, MAZE_COLS = 31, MAZE_ROWS = 23;
let state = 0; let currentDiff = 0; let rewardTokens = 0;
let gameMode = 'normal', endlessRound = 1, survivalConfig = null, eventsEnabled = true, safeRoomsReliable = true;
let currentMapId = 'level0';

let map = [], floors = [], rooms = [], fuses = [], hidingSpots = [], coolingValves = [], employees = [];
let reservedObjectTiles = new Set(), hotelDoorTiles = [], hotelBlockedDoor = null, hotelCorridorSections = [];
let centralBoiler = null, boilerShutdown = false, boilerReadyShown = false;
let hotelElevator = null, hotelLockdownTimer = 0, hotelEventCooldown = 0, hotelLockdownActive = false;
let rhysSeal = null, rhysChest = null, rhysChestKey = null, rhysBreakWall = null, rhysTrap = null, rhysRoute = 'search', rhysSealCollected = false, rhysTrapArmed = false;
let playerTrail = [];
let hotelEmployeesRequired = 3, hotelDialogueOpen = false, hotelTaskSerial = 0;
let nearFuse = null, nearHide = null, nearValve = null, nearBoiler = false, nearEmployee = null, nearElevator = false, nearHotelTask = null, nearRhysSeal = false, nearRhysKey = false, nearRhysChest = false, nearRhysTrap = false;
let player = { x: 0, y: 0, r: 12, baseSpeed: 3.8, speed: 3.8, boostTimer: 0, stunTimer: 0, crouching: false, breathing: false, breathTimer: 0, breathCooldown: 0, heat: 0, inHeatZone: false, hidden: false, hideTimer: 0, hideCompromised: false };
let monster = { name: '', x: 0, y: 0, r: 14, drawRadius: 14, speed: 2.2, baseSpeed: 2.2, color: '', textColor: '', activeMutations: [], isReinforced: false, hasGloom: false, isResilient: false, hasScrambler: false, hasHexed: false, hasHallucinations: false, hasLockedIn: false, hasEcho: false, hasFalseObjective: false, hasWatcher: false, hasPanic: false, hasHeavyFootfall: false, hasAfterimage: false, allSeeing: false, heatAlertTimer: 0, heatAlertX: 0, heatAlertY: 0, stunTimer: 0, lastTargetC: -1, lastTargetR: -1 };
let monsters = [];
let camera = { x: 0, y: 0, targetZoom: 1.0, zoom: 1.0 };
let nearGen = null; 

let generators = [], activeGens = 0, totalGens = 0;
let puzzleSequence = [], circuitSequence = [], circuitStage = 0, circuitRequired = 3, currentGen = null;
let lastSingleMutation = null; 

// AI & Item Variables
let jordanState = 'saboteur', mimicTimer = 0, stateTimer = 0, jordanSabotageCooldown = 0, bassamState = 'roaming', bassamRevealPending = false, bassamTrapTaskId = null, bassamFakeTask = null, bassamStaffDepartment = 'FRONT DESK', bassamFakeLine = '', bassamAmbushActive = false, bassamLostTimer = 0, bassamAmbushCooldown = 0;
let hotelTaskGame = null;
let empTimer = 0, empWarning = 0, empActive = 0, flashAlpha = 0;
let powerOutageTimer = 0, powerOutageCooldown = 0, flickerTimer = 0, flickerCooldown = 0, emergencyTimer = 0, emergencyCooldown = 0, outageFlickerTimer = 0;
let noiseTarget = null, noiseTimer = 0, bearTraps = [], heatZones = [], heatEventCooldown = 0;
let goopZones = [], goopShots = [], rhysSpitCooldown = 0, rhysDashTimer = 0, rhysDashCooldown = 0, rhysDashTarget = null, rhysEventCooldown = 900, rhysSweepTimer = 0, rhysSweepRadius = 0, rhysPressureZones = [];
let heatOverlay = null;
let ambienceClock = 0;
let runStartedAt = 0, runItemsUsed = 0, hallucinationHudTimer = 0;
let mobileMenuPaused = false;

// Skill Check Variables
let scNeedle = 0, scSpeed = 0, scZoneStart = 0, scZoneEnd = 0, scHits = 0, scRequired = 0, scDelay = 0;

let lastTime = 0, frames = 0;
let lastFrameTime = 0, gameAccumulator = 0;
let lastDrawTime = 0;
const keys = { w: false, a: false, s: false, d: false };

function clearMovementKeys() {
    keys.w = false; keys.a = false; keys.s = false; keys.d = false;
}

function activateBreath() {
    if ((state === 1 || state === 3) && !player.hidden && player.breathCooldown <= 0 && player.breathTimer <= 0) {
        const filtered = itemAllowed('breathFilter') && invBreathFilter > 0;
        if (filtered) invBreathFilter--;
        player.breathTimer = filtered ? 480 : 300;
        player.breathing = true;
        if (filtered) { runItemsUsed++; stats.itemsUsed++; advanceDailyObjective('items'); saveData(); }
        showMsg('<span style="color:#b8aaff">HOLDING BREATH</span>', 800);
    }
}

function useBattery() {
    if (!itemAllowed('battery') || (state !== 1 && state !== 3) || invBattery <= 0 || powerOutageTimer <= 0) return;
    invBattery--; runItemsUsed++; stats.itemsUsed++;
    advanceDailyObjective('items');
    powerOutageTimer = 0; powerOutageCooldown = 1500;
    playSound('success'); saveData(); updateHUD();
    showMsg('<span style="color:#b8eaff">EMERGENCY BATTERY USED</span>', 900);
}

function toggleHide() {
    if (state !== 1 || !nearHide || player.stunTimer > 0) return;
    if (!player.hidden) {
        const wasSeenEntering = monsterCanSeeUnhiddenPlayer();
        player.hidden = true;
        player.hideTimer = 1200;
        player.hideCompromised = wasSeenEntering;
        nearHide.occupied = true;
        clearMovementKeys();
        if (wasSeenEntering) {
            showMsg('<span style="color:#ff4444">SPOTTED HIDING</span>', 900);
        } else {
            for (const enemy of monsters) enemy.path = [];
            showMsg('<span style="color:#ff9900">HIDDEN</span>', 700);
        }
    } else {
        player.hidden = false;
        player.hideCompromised = false;
        nearHide.occupied = false;
        showMsg('BACK OUT', 500);
    }
}

function useNoiseMaker() {
    if (!itemAllowed('noiseMaker') || (state !== 1 && state !== 3) || invNoiseMaker <= 0 || player.hidden) return;
    invNoiseMaker--;
    runItemsUsed++; stats.itemsUsed++;
    advanceDailyObjective('items');
    const options = floors.filter(tile => Math.hypot(tile.c * TS + TS / 2 - player.x, tile.r * TS + TS / 2 - player.y) > 240);
    const tile = options[Math.floor(Math.random() * Math.max(1, options.length))] || floors[0];
    noiseTarget = { x: tile.c * TS + TS / 2, y: tile.r * TS + TS / 2 };
    noiseTimer = 600;
    for (const enemy of monsters) enemy.path = findPath(Math.floor(enemy.x / TS), Math.floor(enemy.y / TS), tile.c, tile.r);
    saveData(); updateHUD(); playSound('tick');
    showMsg('<span style="color:#ff66cc">NOISE MAKER THROWN</span>', 900);
}

function triggerBloodHunt() {
    for (const enemy of monsters) {
        if (enemy.name !== 'MALAKAI' || player.hidden || isSafeRoom(player.x, player.y)) continue;
        enemy.bloodHuntTimer = 300;
        enemy.bloodHuntX = player.x;
        enemy.bloodHuntY = player.y;
        enemy.path = [];
    }
    if (monsters.some(enemy => enemy.name === 'MALAKAI' && enemy.bloodHuntTimer > 0)) {
        showMsg('<span style="color:#d4f">MALAKAI CAUGHT YOUR TRAIL</span>', 900);
    }
}

function placeBearTrap() {
    if (!itemAllowed('bearTrap') || (state !== 1 && state !== 3) || invBearTrap <= 0 || player.hidden || player.stunTimer > 0) return;
    if (bearTraps.length >= 2) { showMsg('ONLY TWO TRAPS CAN BE ACTIVE', 800); return; }
    invBearTrap--; runItemsUsed++; stats.itemsUsed++; advanceDailyObjective('items');
    bearTraps.push({ x: player.x, y: player.y, life: 1800, triggered: false });
    saveData(); updateHUD();
    showMsg('<span style="color:#bbb">BEAR TRAP PLACED</span>', 800);
}

function triggerBearTrap(enemy) {
    const trap = bearTraps.find(candidate => !candidate.triggered && Math.hypot(candidate.x - enemy.x, candidate.y - enemy.y) < enemy.r + 13);
    if (!trap) return false;
    trap.triggered = true; trap.life = 45;
    enemy.stunTimer = enemy.isResilient || enemy.name === 'MALAKAI' ? 120 : 240;
    enemy.path = [];
    showMsg(`<span style="color:#ddd">${enemy.name} HIT A BEAR TRAP</span>`, 750);
    return true;
}

function beginCircuitPuzzle() {
    state = 6;
    circuitStage = currentGen.stage;
    circuitSequence = [];
    const options = ['w', 'a', 's', 'd'];
    const length = 3 + circuitStage;
    for (let i = 0; i < length; i++) circuitSequence.push(options[Math.floor(Math.random() * options.length)]);
    updateHUD();
}

function boilerObjectiveComplete() {
    return currentMapId !== 'boilerworks' || (activeGens >= totalGens && coolingValves.length === 3 && coolingValves.every(valve => valve.active));
}

function beginFinalChase() {
    state = 3;
    for (const enemy of monsters) enemy.speed = Math.max(enemy.speed, 4.0 + (gameMode === 'endless' ? (endlessRound - 1) * 0.18 : 0));
    player.speed = player.baseSpeed + 1.0;
    const targetText = monsters.length === 1 ? monster.name : 'THE MONSTERS';
    const objectiveCompleteText = currentMapId === 'boilerworks' ? 'CENTRAL BOILER SHUT DOWN' : currentMapId === 'hotel' ? 'EMPLOYEES EVACUATED' : currentMapId === 'crimson' ? 'RHYS CONTAINED' : 'POWER RESTORED';
    showMsg(`<span style="color:#0f0">${objectiveCompleteText}</span><br>GO CATCH ${targetText}`, 3500);
    if (monster.isPhantom) {
        monster.isPhantom = false;
        let closestFloor = floors[0], minDist = Infinity;
        for (let f of floors) {
            let d = Math.hypot(f.c * TS + TS / 2 - monster.x, f.r * TS + TS / 2 - monster.y);
            if (d < minDist) { minDist = d; closestFloor = f; }
        }
        monster.x = closestFloor.c * TS + TS / 2;
        monster.y = closestFloor.r * TS + TS / 2;
        monster.path = [];
    }
    canvas.classList.remove('shake');
}

function activateCoolingValve() {
    if (!nearValve || nearValve.active) return;
    nearValve.active = true;
    advanceDailyObjective('cooling');
    playSound('success');
    showMsg(`<span style="color:#66ddff">COOLING VALVE ${coolingValves.filter(valve => valve.active).length}/${coolingValves.length} ACTIVE</span>`, 900);
    updateHUD();
    if (boilerObjectiveComplete() && !boilerReadyShown) {
        boilerReadyShown = true;
        showMsg('<span style="color:#ffcc00">CENTRAL BOILER READY</span><br>FIND THE BOILER', 1500);
    }
}

function finishGeneratorInteraction() {
    if (currentGen.type === 'multi' && currentGen.stage < currentGen.requiredStages - 1) {
        currentGen.stage++;
        playSound('success');
        showMsg(`<span style="color:#ffcc00">CIRCUIT STAGE ${currentGen.stage + 1}/${currentGen.requiredStages}</span>`, 850);
        beginCircuitPuzzle();
        return;
    }
    currentGen.active = true;
    currentGen.repairFlash = 45;
    noiseTarget = { x: currentGen.x, y: currentGen.y };
    noiseTimer = 300;
    activeGens++;
    stats.generators++;
    advanceDailyObjective('generators');
    playSound('success');
    showMsg('<span style="color:#0f0">GENERATOR ONLINE</span>', 900);
    triggerBloodHunt();
    state = 1;
    checkPhase();
    if (state === 1) for (const enemy of monsters) if (enemy.isFrenzy) enemy.speed += 0.15;
}

window.addEventListener('keydown', (e) => {
    let k = e.key.toLowerCase();
    if (hotelDialogueOpen) {
        if (k === 'escape' || k === 'e') closeHotelDialogue();
        return;
    }
    if (state === 0 || state === 4) return;
    
    // Adrenaline
    if (itemAllowed('adrenaline') && (state === 1 || state === 3) && k === ' ' && invAdrenaline > 0 && player.boostTimer <= 0 && player.stunTimer <= 0) {
        invAdrenaline--;
        runItemsUsed++; stats.itemsUsed++; advanceDailyObjective('items');
        player.boostTimer = monsters.some(enemy => enemy.hasHexed) ? 120 : 240; 
        saveData(); updateHUD();
    }

    // Flashbang
    if (itemAllowed('flashbang') && (state === 1 || state === 3) && k === 'f' && invFlashbang > 0 && monsters.some(enemy => enemy.stunTimer <= 0)) {
        invFlashbang--;
        runItemsUsed++; stats.itemsUsed++; advanceDailyObjective('items');
        for (const enemy of monsters) enemy.stunTimer = enemy.isResilient ? 120 : 240;
        flashAlpha = 1.0;
        playSound('emp');
        saveData(); updateHUD();
    }

    if ((state === 1 || state === 3) && k === 'shift') player.crouching = true;
    if ((state === 1 || state === 3) && k === 'b') activateBreath();
    if (state === 1 && k === 'h') toggleHide();
    if ((state === 1 || state === 3) && k === 'n') useNoiseMaker();
    if ((state === 1 || state === 3) && k === 't') placeBearTrap();
    if ((state === 1 || state === 3) && k === 'r') useBattery();

    // Generator Interaction
    if (state === 1 && k === 'e' && player.stunTimer <= 0) {
        const nearbyRoom = getRoomAt(player.x, player.y);
        if (nearbyRoom?.type === 'maintenance' && powerOutageTimer > 0) {
            powerOutageTimer = 0;
            powerOutageCooldown = 1500;
            playSound('success');
            showMsg('<span style="color:#ffcc00">MAINTENANCE POWER RESTORED</span>', 1200);
            return;
        }
        if (nearEmployee) { interactWithEmployee(); return; }
        if (nearHotelTask) { completeHotelTaskAtTarget(); return; }
        if (currentMapId === 'crimson') {
            if (nearRhysKey && rhysChestKey && !rhysChestKey.collected) { rhysChestKey.collected = true; notify('CHEST KEY FOUND', 'unlock'); updateHUD(); return; }
            if (nearRhysChest && rhysChest && rhysChestKey?.collected && !rhysChest.opened) { rhysChest.opened = true; rhysSeal.accessible = true; notify('CRIMSON CHEST OPENED', 'unlock'); updateHUD(); return; }
            if (nearRhysSeal && rhysSeal?.accessible && !rhysSeal.collected) { rhysSeal.collected = true; rhysSealCollected = true; notify('CRIMSON SEAL RECOVERED', 'unlock'); updateHUD(); return; }
            if (nearRhysTrap && rhysSealCollected) { rhysTrapArmed = true; notify('CONTAINMENT TRAP ARMED · LURE RHYS INSIDE', 'warning'); updateHUD(); return; }
        }
        if (nearValve) { activateCoolingValve(); return; }
        if (currentMapId === 'boilerworks' && nearBoiler) {
            if (!boilerObjectiveComplete()) {
                showMsg('<span style="color:#ffcc00">BOILER LOCKED</span><br>REPAIR GENERATORS AND ACTIVATE ALL COOLING VALVES', 1200);
                return;
            }
            boilerShutdown = true;
            beginFinalChase();
            return;
        }
        if (currentMapId === 'hotel' && nearElevator) { useHotelElevator(); return; }
        if (nearFuse) {
            nearFuse.collected = true;
            const fuseGenerator = generators.find(generator => generator.type === 'fuse');
            if (fuseGenerator) fuseGenerator.collectedFuses = fuses.filter(fuse => fuse.collected).length;
            showMsg('<span style="color:#ffcc00">FUSE COLLECTED</span>', 700);
            updateHUD();
            return;
        }
        if (nearHide) { toggleHide(); return; }
        if (!nearGen) return;
        currentGen = nearGen;
        clearMovementKeys();

        if (currentGen.isFalse) {
            triggerBloodHunt();
            state = 1; player.stunTimer = 120; playSound('fail');
            showMsg(`<span style="color:#ff4444">FALSE GENERATOR</span><br>THAT'S NOT REAL`, 1400);
            return;
        }
        if (currentGen.type === 'fuse' && currentGen.collectedFuses < currentGen.requiredFuses) {
            showMsg(`<span style="color:#ffcc00">MISSING FUSES</span><br>${currentGen.collectedFuses}/${currentGen.requiredFuses}`, 1200);
            return;
        }
        if (currentGen.type === 'multi') {
            beginCircuitPuzzle();
            return;
        }

        let roll = Math.random();
        let isSkillCheck = (currentDiff === 0 && roll < 0.2) || (currentDiff === 1 && roll < 0.5) || (currentDiff === 2 && roll < 0.8);
        
        if (isSkillCheck) {
            state = 5;
            scNeedle = 0; scHits = 0; 
            scRequired = Math.max(1, 3 - upgHack + (monsters.some(enemy => enemy.isReinforced) ? 1 : 0));
            scSpeed = (currentDiff === 0 ? 0.0195 : currentDiff === 1 ? 0.0325 : 0.0455) * (1 - (upgQuick * 0.10));
            let zoneWidth = currentDiff === 0 ? Math.PI/2 : currentDiff === 1 ? Math.PI/3 : Math.PI/5;
            if (monsters.some(enemy => enemy.hasPanic && Math.hypot(enemy.x - player.x, enemy.y - player.y) < 260)) zoneWidth *= 0.72;
            scZoneStart = Math.random() * (Math.PI*2 - zoneWidth);
            scZoneEnd = scZoneStart + zoneWidth;
            scDelay = 60; 
        } else {
            state = 2;
            let opts = ['w','a','s','d'];
            let seqLength = Math.max(1, 3 - upgHack + (monsters.some(enemy => enemy.isReinforced) ? 1 : 0));
            puzzleSequence = [];
            for(let i=0; i<seqLength; i++) puzzleSequence.push(opts[Math.floor(Math.random()*4)]);
        }
        updateHUD();
        return;
    }

    // Skill Check Input
    if (state === 5 && k === ' ' && scDelay <= 0) {
        if (scNeedle >= scZoneStart && scNeedle <= scZoneEnd) {
            scHits++;
            playSound('success');
            if (scHits >= scRequired) {
                finishGeneratorInteraction();
            } else {
                scZoneStart = Math.random() * (Math.PI*2 - (scZoneEnd - scZoneStart));
                let nextZoneWidth = currentDiff === 0 ? Math.PI/2 : currentDiff === 1 ? Math.PI/3 : Math.PI/5;
                if (monsters.some(enemy => enemy.hasPanic && Math.hypot(enemy.x - player.x, enemy.y - player.y) < 260)) nextZoneWidth *= 0.72;
                scZoneEnd = scZoneStart + nextZoneWidth;
                scNeedle = 0;
            }
        } else {
            triggerBloodHunt();
            state = 1; player.stunTimer = 120;
            playSound('fail'); showMsg('<span style="color:#ff4444">WIRING FAILED</span>', 900);
            keys.w = false; keys.a = false; keys.s = false; keys.d = false;
        }
        return;
    }
    
    // Typing Input
    if (state === 2) {
        if (k === puzzleSequence[0]) {
            puzzleSequence.shift();
            playSound('tick');
            if (puzzleSequence.length === 0) {
                finishGeneratorInteraction();
            }
        } else if (['w','a','s','d'].includes(k)) {
            triggerBloodHunt();
            state = 1; player.stunTimer = 120; playSound('fail');
            showMsg('<span style="color:#ff4444">WRONG CONNECTION</span>', 900);
        }
        return;
    }
    if (state === 6 && ['w','a','s','d'].includes(k)) {
        if (k === circuitSequence[0]) {
            circuitSequence.shift(); playSound('tick');
            if (circuitSequence.length === 0) finishGeneratorInteraction();
        } else {
            triggerBloodHunt();
            state = 1; player.stunTimer = 120; playSound('fail');
            showMsg('<span style="color:#ff4444">CIRCUIT FAILED</span>', 900);
        }
        return;
    }
    if (k in keys) {
        keys[k] = true;
    }
});
window.addEventListener('keyup', (e) => {
    let k = e.key.toLowerCase();
    if (k in keys) {
        keys[k] = false;
    }
    if (k === 'shift') player.crouching = false;
    if (k === 'b') player.breathing = false;
});

function rebuildFloors() {
    floors = [];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (map[r][c] === 0) floors.push({ r, c });
        }
    }
}

function generateMaze() {
    map = Array.from({length: ROWS}, () => Array(COLS).fill(1));
    reservedObjectTiles = new Set(); hotelDoorTiles = []; employees = [];
    function carve(r, c) {
        map[r][c] = 0;
        let dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]];
        dirs.sort(() => Math.random() - 0.5);
        for (let d of dirs) {
            let nr = r + d[0], nc = c + d[1];
            if (nr > MAZE_TOP && nr < MAZE_TOP + MAZE_ROWS - 1 && nc > MAZE_LEFT && nc < MAZE_LEFT + MAZE_COLS - 1 && map[nr][nc] === 1) {
                map[r + d[0]/2][c + d[1]/2] = 0;
                carve(nr, nc);
            }
        }
    }
    carve(MAZE_TOP + 1, MAZE_LEFT + 1);
    for (let r = MAZE_TOP + 1; r < MAZE_TOP + MAZE_ROWS - 1; r++) {
        for (let c = MAZE_LEFT + 1; c < MAZE_LEFT + MAZE_COLS - 1; c++) {
            if (map[r][c] === 1) {
                let vert = map[r-1][c] === 0 && map[r+1][c] === 0;
                let horz = map[r][c-1] === 0 && map[r][c+1] === 0;
                if ((vert || horz) && Math.random() < 0.15) map[r][c] = 0;
            }
        }
    }
    rebuildFloors();
}

function carveBoilerRect(c, r, width, height) {
    for (let row = Math.max(1, r - Math.floor(height / 2)); row <= Math.min(ROWS - 2, r + Math.floor(height / 2)); row++) {
        for (let col = Math.max(1, c - Math.floor(width / 2)); col <= Math.min(COLS - 2, c + Math.floor(width / 2)); col++) map[row][col] = 0;
    }
}

function carveBoilerCorridor(a, b) {
    let c = a.c, r = a.r;
    const horizontalFirst = Math.random() < 0.65;
    const carve = (col, row) => { if (map[row]?.[col] !== undefined) map[row][col] = 0; };
    const horizontal = () => { while (c !== b.c) { carve(c, r); carve(c, r + 1); c += Math.sign(b.c - c); } };
    const vertical = () => { while (r !== b.r) { carve(c, r); carve(c + 1, r); r += Math.sign(b.r - r); } };
    if (horizontalFirst) { horizontal(); vertical(); } else { vertical(); horizontal(); }
    carve(b.c, b.r); carve(b.c + 1, b.r);
}

function reserveObjectTile(c, r, radius = 1) {
    for (let row = r - radius; row <= r + radius; row++) {
        for (let col = c - radius; col <= c + radius; col++) reservedObjectTiles.add(`${col},${row}`);
    }
}

function isReservedObjectSpot(x, y, distance = TS * 1.5) {
    const c = Math.floor(x / TS), r = Math.floor(y / TS);
    const radius = Math.ceil(distance / TS);
    for (let row = r - radius; row <= r + radius; row++) {
        for (let col = c - radius; col <= c + radius; col++) {
            if (reservedObjectTiles.has(`${col},${row}`)) return true;
        }
    }
    return false;
}

function generateBoilerworks() {
    map = Array.from({length: ROWS}, () => Array(COLS).fill(1));
    rooms = []; hidingSpots = []; coolingValves = []; fuses = []; employees = [];
    reservedObjectTiles = new Set(); hotelDoorTiles = [];
    const nodes = [];
    const roomCount = 12;
    for (let i = 0; i < roomCount; i++) {
        const c = Math.min(COLS - 5, 4 + i * 5 + Math.floor(Math.random() * 3) - 1);
        const r = 5 + Math.floor(Math.random() * (ROWS - 10));
        const width = 3 + Math.floor(Math.random() * 4);
        const height = 3 + Math.floor(Math.random() * 4);
        carveBoilerRect(c, r, width, height);
        nodes.push({ c, r, width, height });
        const type = i === 0 ? 'maintenance' : i === roomCount - 1 ? 'boiler' : [1, 4, 7].includes(i) ? 'cooling' : i === 2 ? 'storage' : i === 9 ? 'control' : 'industrial';
        rooms.push({ type, side: 'interior', c, r, width, height, x: c * TS + TS / 2, y: r * TS + TS / 2 });
        if (i > 0) carveBoilerCorridor(nodes[i - 1], nodes[i]);
        if (i > 0) {
            const previous = nodes[i - 1], directionC = Math.sign(previous.c - c), directionR = Math.sign(previous.r - r);
            reserveObjectTile(c + (directionC * (Math.floor(width / 2) + 1)), r + (directionR * (Math.floor(height / 2) + 1)), 1);
        }
    }
    // A few cross-connections keep the long halls navigable and prevent one-route dead ends.
    for (let i = 0; i < 3; i++) {
        const a = nodes[Math.floor(Math.random() * (nodes.length - 2))];
        const b = nodes[Math.min(nodes.length - 1, nodes.indexOf(a) + 2 + Math.floor(Math.random() * 2))];
        if (b) carveBoilerCorridor(a, b);
    }
    rebuildFloors();

    const storageRoom = rooms.find(room => room.type === 'storage');
    const controlRoom = rooms.find(room => room.type === 'control');
    if (storageRoom) hidingSpots.push({ x: storageRoom.x, y: storageRoom.y, occupied: false });
    if (controlRoom) hidingSpots.push({ x: controlRoom.x, y: controlRoom.y, occupied: false });
    centralBoiler = rooms[rooms.length - 1] ? { x: rooms[rooms.length - 1].x, y: rooms[rooms.length - 1].y } : null;

    const valveRooms = [rooms[1], rooms[4], rooms[7]].filter(Boolean);
    coolingValves = valveRooms.map((room, index) => ({ x: room.x, y: room.y, active: false, index }));
    // Room interiors and door thresholds are reserved before object placement.
}

function carveHotelRoom(room) {
    const left = room.c - Math.floor(room.width / 2), top = room.r - Math.floor(room.height / 2);
    for (let r = top; r < top + room.height; r++) for (let c = left; c < left + room.width; c++) {
        if (map[r]?.[c] !== undefined) map[r][c] = 0;
    }
}

function hotelRoomFits(candidate) {
    const left = candidate.c - Math.floor(candidate.width / 2) - 2;
    const right = candidate.c + Math.ceil(candidate.width / 2) + 2;
    const top = candidate.r - Math.floor(candidate.height / 2) - 2;
    const bottom = candidate.r + Math.ceil(candidate.height / 2) + 2;
    return left > 1 && right < COLS - 2 && top > 1 && bottom < ROWS - 2 && !rooms.some(room =>
        Math.abs(room.c - candidate.c) < (room.width + candidate.width) / 2 + 3 &&
        Math.abs(room.r - candidate.r) < (room.height + candidate.height) / 2 + 3
    );
}

function carveHotelSegment(from, to) {
    const cells = [];
    const horizontal = from.r === to.r;
    const step = horizontal ? Math.sign(to.c - from.c) : Math.sign(to.r - from.r);
    const length = horizontal ? Math.abs(to.c - from.c) : Math.abs(to.r - from.r);
    for (let i = 0; i <= length; i++) {
        const c = horizontal ? from.c + i * step : from.c;
        const r = horizontal ? from.r : from.r + i * step;
        const pair = horizontal ? [{ c, r }, { c, r: r + 1 }] : [{ c, r }, { c: c + 1, r }];
        for (const cell of pair) if (map[cell.r]?.[cell.c] !== undefined) { map[cell.r][cell.c] = 0; cells.push(cell); }
    }
    if (cells.length > 8) hotelCorridorSections.push({ cells, horizontal });
}

function connectHotelRooms(a, b) {
    const horizontalFirst = Math.random() < 0.5;
    const corner = horizontalFirst ? { c: b.c, r: a.r } : { c: a.c, r: b.r };
    carveHotelSegment({ c: a.c, r: a.r }, corner);
    carveHotelSegment(corner, { c: b.c, r: b.r });
    hotelDoorTiles.push({ c: a.c, r: a.r }, { c: b.c, r: b.r });
}

function generateHotel() {
    map = Array.from({length: ROWS}, () => Array(COLS).fill(1));
    rooms = []; hidingSpots = []; coolingValves = []; fuses = []; employees = [];
    reservedObjectTiles = new Set(); hotelDoorTiles = []; hotelCorridorSections = [];
    const roomSpecs = [
        ['lobby', 11, 8], ['ballroom', 12, 9], ['dining', 9, 7], ['kitchen', 8, 6],
        ['laundry', 8, 6], ['office', 7, 6], ['security', 7, 6], ['service', 8, 6],
        ['elevator', 7, 6], ['storage', 7, 6], ['guest', 7, 6], ['guest', 7, 6],
        ['guest', 7, 6], ['bathroom', 6, 5], ['maintenance', 8, 6]
    ];
    const lobby = { type: 'lobby', c: Math.floor(COLS / 2), r: Math.floor(ROWS / 2), width: 11, height: 8 };
    rooms.push(lobby); carveHotelRoom(lobby);
    for (const [type, baseWidth, baseHeight] of roomSpecs.slice(1)) {
        let placed = null, parent = null;
        for (let tries = 0; tries < 240 && !placed; tries++) {
            parent = rooms[Math.floor(Math.random() * rooms.length)];
            const direction = [[1,0],[-1,0],[0,1],[0,-1]][Math.floor(Math.random() * 4)];
            const width = baseWidth + (Math.random() < .35 ? 1 : 0);
            const height = baseHeight + (Math.random() < .3 ? 1 : 0);
            const distance = 4 + Math.floor(Math.random() * 5);
            const c = parent.c + direction[0] * (Math.ceil(parent.width / 2) + Math.ceil(width / 2) + distance);
            const r = parent.r + direction[1] * (Math.ceil(parent.height / 2) + Math.ceil(height / 2) + distance);
            const candidate = { type, c, r, width, height };
            if (hotelRoomFits(candidate)) placed = candidate;
        }
        if (!placed) continue;
        rooms.push(placed); carveHotelRoom(placed); connectHotelRooms(parent, placed);
    }
    // Add a few room-to-room links so each wing has alternate routes, never isolated hall ends.
    for (let i = 0; i < 4; i++) {
        const a = rooms[Math.floor(Math.random() * rooms.length)], b = rooms[Math.floor(Math.random() * rooms.length)];
        if (a !== b && Math.abs(a.c - b.c) + Math.abs(a.r - b.r) < 32) connectHotelRooms(a, b);
    }
    for (const room of rooms) {
        room.x = room.c * TS + TS / 2; room.y = room.r * TS + TS / 2;
        reserveObjectTile(room.c, room.r, 1);
    }
    rebuildFloors();
    const staffRooms = ['lobby','laundry','kitchen','office'].map(type => rooms.find(room => room.type === type)).filter(Boolean);
    const staffNames = ['FRONT DESK', 'MAINTENANCE', 'HOUSEKEEPING', 'KITCHEN'];
    staffRooms.forEach((room, index) => {
        employees.push({ x: room.x, y: room.y, r: 10, homeRoom: room, department: staffNames[index], index, path: [], roamTimer: 0, task: null, evacuated: false });
    });
    // Each staff task receives a real reserved floor tile now, before generators
    // are placed. The object only becomes visible after the player accepts it.
    employees.forEach(employee => {
        employee.task = chooseHotelTaskTarget(employee);
        reserveObjectTile(Math.floor(employee.task.x / TS), Math.floor(employee.task.y / TS), 1);
    });
    const storageRoom = rooms.find(room => room.type === 'storage');
    const serviceRoom = rooms.find(room => room.type === 'service');
    if (storageRoom) hidingSpots.push({ x: storageRoom.x, y: storageRoom.y, occupied: false });
    if (serviceRoom) hidingSpots.push({ x: serviceRoom.x, y: serviceRoom.y, occupied: false });
    const elevatorRoom = rooms.find(room => room.type === 'elevator') || rooms.at(-1);
    hotelElevator = elevatorRoom ? { x: elevatorRoom.x, y: elevatorRoom.y, room: elevatorRoom } : null;
}

function generateCrimsonContainment() {
    map = Array.from({length: ROWS}, () => Array(COLS).fill(1));
    rooms = []; hidingSpots = []; coolingValves = []; fuses = []; employees = []; reservedObjectTiles = new Set();
    const types = ['intake','archive','medical','storage','processing','security','maintenance','containment','vault','service','trap'];
    const nodes = [];
    for (let i = 0; i < types.length; i++) {
        const c = 6 + i * 8 + Math.floor(Math.random() * 3), r = 7 + Math.floor(Math.random() * (ROWS - 14));
        const width = types[i] === 'containment' || types[i] === 'trap' ? 9 : 6 + Math.floor(Math.random() * 3);
        const height = types[i] === 'containment' || types[i] === 'trap' ? 8 : 5 + Math.floor(Math.random() * 3);
        const node = { c, r, width, height, type: types[i], x: c * TS + TS / 2, y: r * TS + TS / 2 };
        carveBoilerRect(c, r, width, height); rooms.push(node); nodes.push(node);
        if (i > 0) carveBoilerCorridor(nodes[i - 1], node);
        // Every room has a different internal footprint without turning into the Hotel grid.
        if (['archive','medical','processing','security'].includes(node.type)) {
            const wallC = c, gapR = r;
            for (let rr = r - Math.floor(height / 2) + 1; rr <= r + Math.floor(height / 2) - 1; rr++) if (rr !== gapR) map[rr][wallC] = 1;
        }
    }
    for (let i = 0; i < 3; i++) { const a = nodes[Math.floor(Math.random() * (nodes.length - 2))], b = nodes[Math.min(nodes.length - 1, nodes.indexOf(a) + 2)]; if (a && b) carveBoilerCorridor(a, b); }
    rebuildFloors();
    const intake = rooms[0], vault = rooms.find(room => room.type === 'vault'), trapRoom = rooms.find(room => room.type === 'trap');
    rhysRoute = ['search','break','chest'][Math.floor(Math.random() * 3)];
    rhysSeal = { x: vault.x, y: vault.y, collected:false, accessible: rhysRoute !== 'break' };
    rhysChest = rhysRoute === 'chest' ? { x: vault.x, y: vault.y, opened:false } : null;
    const keyRoom = rooms.find(room => room.type === 'security') || intake;
    rhysChestKey = rhysRoute === 'chest' ? { x:keyRoom.x, y:keyRoom.y, collected:false } : null;
    rhysBreakWall = rhysRoute === 'break' ? { x:vault.x - Math.floor(vault.width / 2) * TS, y:vault.y, broken:false, r:18 } : null;
    rhysTrap = trapRoom ? { x:trapRoom.x, y:trapRoom.y, room:trapRoom } : null;
    [rhysSeal, rhysChest, rhysChestKey, rhysBreakWall, rhysTrap].filter(Boolean).forEach(object => reserveObjectTile(Math.floor(object.x / TS), Math.floor(object.y / TS), 1));
    if (intake) hidingSpots.push({ x:intake.x, y:intake.y, occupied:false });
}

function isInHeatZone(x, y) {
    return heatZones.some(zone => zone.life > 0 && Math.hypot(zone.x - x, zone.y - y) < zone.radius);
}

function updateAesonEvents() {
    if (currentMapId !== 'boilerworks' || !monsters.some(enemy => enemy.name === 'AESON') || state !== 1 || !eventsEnabled) return;
    if (heatEventCooldown > 0) { heatEventCooldown--; return; }
    const options = floors.filter(tile => Math.hypot(tile.c * TS + TS / 2 - player.x, tile.r * TS + TS / 2 - player.y) > 180);
    const tile = options[Math.floor(Math.random() * Math.max(1, options.length))] || floors[0];
    heatZones.push({ x: tile.c * TS + TS / 2, y: tile.r * TS + TS / 2, radius: 58, life: 720 });
    heatEventCooldown = 720;
    playSound('alarm');
    showMsg('<span style="color:#ff6b2b">AESON IGNITED A SECTION</span>', 950);
}

function isDynamicBlockedCell(c, r) {
    return currentMapId === 'hotel' && hotelLockdownActive && hotelBlockedDoor?.cells?.some(cell => cell.c === c && cell.r === r);
}

function updateHotelEvents() {
    if (currentMapId !== 'hotel' || state !== 1 || !eventsEnabled) return;
    if (hotelLockdownActive) {
        hotelLockdownTimer--;
        if (hotelLockdownTimer <= 0) {
            hotelLockdownActive = false;
            hotelBlockedDoor = null;
            notify('HOTEL LOCKDOWN RELEASED', 'info');
        }
        return;
    }
    if (hotelEventCooldown > 0) { hotelEventCooldown--; return; }
    hotelEventCooldown = 1200;
    if (hotelCorridorSections.length) {
        const candidates = hotelCorridorSections.filter(section => {
            const middle = section.cells[Math.floor(section.cells.length / 2)];
            return Math.hypot(middle.c * TS + TS / 2 - player.x, middle.r * TS + TS / 2 - player.y) > 180;
        });
        const section = candidates[Math.floor(Math.random() * Math.max(1, candidates.length))] || hotelCorridorSections[0];
        const middleIndex = Math.floor(section.cells.length / 2);
        const first = section.cells[middleIndex];
        const second = section.cells[middleIndex + 1] || section.cells[middleIndex - 1];
        hotelBlockedDoor = { cells: [first, second].filter(Boolean) };
        hotelLockdownActive = true;
        hotelLockdownTimer = 720 + (monster.hasLockedIn ? 300 : 0);
        playSound('alarm');
        notify('HOTEL LOCKDOWN · CORRIDOR SEALED', 'danger');
        showMsg('<span style="color:#ff4444">HOTEL LOCKDOWN</span><br>FIND ANOTHER ROUTE', 1200);
    }
}

function updateRhysEvents() {
    if (currentMapId !== 'crimson' || state !== 1 || !eventsEnabled) return;
    if (rhysSweepTimer > 0) { rhysSweepTimer--; rhysSweepRadius += 16; }
    if (rhysEventCooldown > 0) { rhysEventCooldown--; return; }
    rhysEventCooldown = 1200 + Math.floor(Math.random() * 900);
    const event = Math.floor(Math.random() * 4);
    if (event === 0) { notify('CONTAINMENT ALARM · RHYS INVESTIGATING', 'danger'); noiseTarget = { x:player.x, y:player.y }; noiseTimer = 240; }
    else if (event === 1) { const tile = floors[Math.floor(Math.random() * floors.length)]; if (tile) rhysPressureZones.push({ x:tile.c*TS+TS/2, y:tile.r*TS+TS/2, life:420, radius:52 }); notify('PRESSURE RELEASE · AVOID THE HISS', 'warning'); }
    else if (event === 2) { rhysSweepTimer = 150; rhysSweepRadius = 0; emergencyTimer = Math.max(emergencyTimer, 150); notify('EMERGENCY LIGHT SWEEP', 'warning'); }
    else if (!rhysSealCollected) { notify('SEAL RESONANCE · RHYS HEARD IT', 'warning'); noiseTarget = { x:rhysSeal.x, y:rhysSeal.y }; noiseTimer = 300; }
}

function updateRhysCombat(canSeePlayer) {
    if (monster.name !== 'RHYS' || currentMapId !== 'crimson' || state !== 1) return false;
    if (rhysSpitCooldown > 0) rhysSpitCooldown--;
    if (rhysDashCooldown > 0) rhysDashCooldown--;
    for (const shot of goopShots) { shot.x += shot.vx; shot.y += shot.vy; shot.life--; if (shot.life <= 0 || checkWall({ x:shot.x, y:shot.y, r:4 })) { goopZones.push({ x:shot.x, y:shot.y, life:540, radius:42 }); shot.life = 0; } }
    goopShots = goopShots.filter(shot => shot.life > 0);
    for (const zone of goopZones) zone.life--; goopZones = goopZones.filter(zone => zone.life > 0);
    for (const zone of rhysPressureZones) zone.life--; rhysPressureZones = rhysPressureZones.filter(zone => zone.life > 0);
    if (rhysDashTimer > 0) {
        rhysDashTimer--; moveEntity(monster, Math.cos(rhysDashTarget.angle) * 7.8, Math.sin(rhysDashTarget.angle) * 7.8);
        if (rhysBreakWall && !rhysBreakWall.broken && Math.hypot(monster.x-rhysBreakWall.x, monster.y-rhysBreakWall.y) < 32) { rhysBreakWall.broken = true; rhysSeal.accessible = true; monster.stunTimer = 90; notify('RHYS BROKE THE WALL', 'unlock'); updateHUD(); }
        if (rhysDashTimer <= 0) monster.stunTimer = 45;
        return true;
    }
    const dist = Math.hypot(player.x-monster.x, player.y-monster.y);
    if (rhysSpitCooldown <= 0 && (canSeePlayer ? dist < 250 : Math.random() < 0.004)) {
        const targetX = canSeePlayer ? player.x : monster.x + (Math.random()-.5)*180, targetY = canSeePlayer ? player.y : monster.y + (Math.random()-.5)*180;
        const angle = Math.atan2(targetY-monster.y,targetX-monster.x); goopShots.push({ x:monster.x, y:monster.y, vx:Math.cos(angle)*4.4, vy:Math.sin(angle)*4.4, life:Math.max(18,Math.min(58,dist/4)) }); rhysSpitCooldown = canSeePlayer ? 210 : 330;
    }
    if (canSeePlayer && rhysDashCooldown <= 0 && dist > 120 && dist < 360 && Math.random() < 0.012) { rhysDashTarget = { angle:Math.atan2(player.y-monster.y,player.x-monster.x) }; rhysDashTimer = 38; rhysDashCooldown = 420; notify('RHYS IS CHARGING', 'danger'); }
    return false;
}

function updateHeat() {
    heatOverlay ||= document.getElementById('heatOverlay');
    if (currentMapId !== 'boilerworks') {
        player.heat = 0; player.inHeatZone = false;
        if (heatOverlay) { heatOverlay.style.opacity = '0'; heatOverlay.style.backdropFilter = 'blur(0px)'; }
        return;
    }
    const hot = isInHeatZone(player.x, player.y);
    if (hot && !player.inHeatZone) {
        for (const enemy of monsters) {
            if (enemy.name !== 'AESON') continue;
            enemy.heatAlertTimer = 420;
            enemy.heatAlertX = player.x;
            enemy.heatAlertY = player.y;
            enemy.path = [];
        }
        showMsg('<span style="color:#ff6b2b">THE FIRE GIVES YOU AWAY</span>', 850);
    }
    player.inHeatZone = hot;
    player.heat = Math.max(0, Math.min(300, player.heat + (hot ? 3.8 : -2.2)));
    if (heatOverlay) {
        const intensity = Math.min(0.78, (player.heat / 300) * 0.68 + (hot ? 0.18 : 0));
        const blur = setOptimization ? (hot ? 1.5 : 0) : (hot ? 4 : Math.min(3, player.heat / 100));
        heatOverlay.style.opacity = intensity.toFixed(2);
        heatOverlay.style.backdropFilter = `blur(${blur.toFixed(1)}px)`;
    }
}

function generateSpecialRooms() {
    rooms = [];
    hidingSpots = [];
    employees = [];
    const roomTypes = ['storage', 'maintenance', 'empty', 'safe'].sort(() => Math.random() - 0.5);
    const sides = ['north', 'south', 'west', 'east'].sort(() => Math.random() - 0.5);
    const mazeRight = MAZE_LEFT + MAZE_COLS - 1;
    const mazeBottom = MAZE_TOP + MAZE_ROWS - 1;

    for (let index = 0; index < roomTypes.length; index++) {
        const type = roomTypes[index], side = sides[index];
        let candidates, c, r, corridor = [];
        if (side === 'north' || side === 'south') {
            candidates = floors.filter(tile => tile.c > MAZE_LEFT + 2 && tile.c < mazeRight - 2 && (side === 'north' ? tile.r < MAZE_TOP + 6 : tile.r > mazeBottom - 6));
            const door = candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : floors[Math.floor(Math.random() * floors.length)];
            c = door.c; r = side === 'north' ? 1 : ROWS - 2;
            const step = side === 'north' ? -1 : 1;
            for (let y = door.r; side === 'north' ? y >= 3 : y <= ROWS - 4; y += step) corridor.push({ c, r: y });
        } else {
            candidates = floors.filter(tile => tile.r > MAZE_TOP + 2 && tile.r < mazeBottom - 2 && (side === 'west' ? tile.c < MAZE_LEFT + 6 : tile.c > mazeRight - 6));
            const door = candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : floors[Math.floor(Math.random() * floors.length)];
            c = side === 'west' ? 1 : COLS - 2; r = door.r;
            const step = side === 'west' ? -1 : 1;
            for (let x = door.c; side === 'west' ? x >= 3 : x <= COLS - 4; x += step) corridor.push({ c: x, r });
        }
        for (let rr = r - 1; rr <= r + 1; rr++) for (let cc = c - 1; cc <= c + 1; cc++) map[rr][cc] = 0;
        for (const tile of corridor) map[tile.r][tile.c] = 0;
        rooms.push({ type, side, c, r, x: c * TS + TS / 2, y: r * TS + TS / 2 });
    }
    rebuildFloors();
    // Empty rooms always contain a cabinet. Storage may receive a generator later,
    // so its cabinet is added only if that room remains free.
    const emptyRoom = rooms.find(room => room.type === 'empty');
    if (emptyRoom) hidingSpots.push({ x: emptyRoom.x, y: emptyRoom.y, occupied: false });
}

function getRoomAt(x, y) {
    return rooms.find(room => {
        const halfWidth = Math.max(1, Math.floor((room.width || 3) / 2)) * TS;
        const halfHeight = Math.max(1, Math.floor((room.height || 3) / 2)) * TS;
        return Math.abs(room.x - x) <= halfWidth && Math.abs(room.y - y) <= halfHeight;
    }) || null;
}

function isSafeRoom(x, y) {
    return safeRoomsReliable && getRoomAt(x, y)?.type === 'safe';
}

function monsterCanSeeUnhiddenPlayer(enemy = monster) {
    if (isSafeRoom(player.x, player.y)) return false;
    return emergencyTimer > 0 || getLineOfSight(enemy.x, enemy.y, player.x, player.y);
}

function isOpenObjectSpot(x, y, distance = TS * 1.5) {
    const tile = map[Math.floor(y / TS)]?.[Math.floor(x / TS)];
    if (tile !== 0 || isReservedObjectSpot(x, y, distance)) return false;
    if (generators.some(generator => Math.hypot(generator.x - x, generator.y - y) < distance)) return false;
    if (hidingSpots.some(spot => Math.hypot(spot.x - x, spot.y - y) < distance)) return false;
    if (fuses.some(fuse => Math.hypot(fuse.x - x, fuse.y - y) < distance)) return false;
    if (employees.some(employee => Math.hypot(employee.x - x, employee.y - y) < distance)) return false;
    if (currentMapId === 'hotel' && hotelElevator && Math.hypot(hotelElevator.x - x, hotelElevator.y - y) < distance) return false;
    return true;
}

function activeHotelTasks() { return [...employees.map(employee => employee.task), bassamFakeTask].filter(task => task && ['accepted', 'readyToReport'].includes(task.status)); }
function reportedHotelEmployees() { return employees.filter(employee => employee.task?.status === 'reported'); }
function evacuatedHotelEmployees() { return employees.filter(employee => employee.evacuated); }
function hotelElevatorReady() { return activeGens >= totalGens && reportedHotelEmployees().length >= hotelEmployeesRequired; }
function hotelObjectiveComplete() { return currentMapId !== 'hotel' || (activeGens >= totalGens && evacuatedHotelEmployees().length >= hotelEmployeesRequired); }

function chooseHotelItemTile(room) {
    const candidates = [];
    const left = room.c - Math.floor(room.width / 2) + 1, right = room.c + Math.floor(room.width / 2) - 1;
    const top = room.r - Math.floor(room.height / 2) + 1, bottom = room.r + Math.floor(room.height / 2) - 1;
    for (let r = top; r <= bottom; r++) for (let c = left; c <= right; c++) {
        const x = c * TS + TS / 2, y = r * TS + TS / 2;
        if (map[r]?.[c] !== 0) continue;
        if (employees.some(employee => employee.task && Math.floor(employee.task.x / TS) === c && Math.floor(employee.task.y / TS) === r)) continue;
        if (generators.some(generator => Math.hypot(generator.x - x, generator.y - y) < TS * 1.5)) continue;
        if (hidingSpots.some(spot => Math.hypot(spot.x - x, spot.y - y) < TS * 1.5)) continue;
        candidates.push({ c, r });
    }
    return candidates[Math.floor(Math.random() * Math.max(1, candidates.length))] || { c: room.c, r: room.r };
}

function chooseHotelTaskTarget(employee) {
    const targets = rooms.filter(room => !['lobby', 'elevator', employee.homeRoom.type].includes(room.type));
    const room = targets[Math.floor(Math.random() * Math.max(1, targets.length))] || employee.homeRoom;
    const taskByDepartment = {
        'FRONT DESK': ['Recover the reservation ledger', 'Check the guest register'],
        'MAINTENANCE': ['Reset the service panel', 'Inspect the maintenance relay'],
        'HOUSEKEEPING': ['Collect the lost room key', 'Check the linen delivery'],
        'KITCHEN': ['Recover the banquet inventory', 'Inspect the dining supply cart']
    };
    const label = (taskByDepartment[employee.department] || ['Inspect the hotel wing'])[Math.floor(Math.random() * 2)];
    const taskKinds = { 'FRONT DESK':'ledger', 'MAINTENANCE':'panel', 'HOUSEKEEPING':'search', 'KITCHEN':'inventory' };
    const itemNames = { 'FRONT DESK':'RESERVATION LEDGER', 'MAINTENANCE':'SERVICE PANEL', 'HOUSEKEEPING':'ROOM KEY', 'KITCHEN':'BANQUET CRATE' };
    const tile = chooseHotelItemTile(room);
    return { id: ++hotelTaskSerial, department: employee.department, kind: taskKinds[employee.department] || 'search', label, itemName: itemNames[employee.department] || 'HOTEL SUPPLIES', room, x: tile.c * TS + TS / 2, y: tile.r * TS + TS / 2, status: 'offered', fake: false };
}

function renderHotelTasks() {
    const panel = document.getElementById('hotelTaskHUD'), list = document.getElementById('hotelTaskList'), count = document.getElementById('hotelTaskCount');
    if (!panel || !list || currentMapId !== 'hotel' || state === 0 || state === 4) return;
    const tasks = [...employees.map(employee => ({ employee, task: employee.task })), ...(bassamFakeTask ? [{ employee: null, task: bassamFakeTask }] : [])].filter(entry => entry.task && ['accepted','readyToReport'].includes(entry.task.status));
    panel.style.display = 'block'; count.textContent = `${tasks.length}/2`;
    list.innerHTML = tasks.length ? tasks.map(({ employee, task }) => `<div class="hotel-task ${task.status === 'readyToReport' ? 'ready' : ''}"><b>${task.department || employee.department}</b><br>${task.label}<small>${task.status === 'readyToReport' ? `Return to ${employee.department}` : `Go to ${task.room.type.toUpperCase()}`}</small></div>`).join('') : '<div class="hotel-task"><small>Speak with hotel staff to accept an assignment.</small></div>';
}

function openHotelDialogue(name, text, choices = []) {
    const dialogue = document.getElementById('hotelDialogue');
    if (!dialogue) return;
    hotelDialogueOpen = true; clearMovementKeys();
    document.getElementById('hotelDialogueName').textContent = name;
    document.getElementById('hotelDialogueText').textContent = text;
    const holder = document.getElementById('hotelDialogueChoices'); holder.innerHTML = '';
    choices.forEach(choice => { const button = document.createElement('button'); button.textContent = choice.label; button.onclick = choice.action; holder.appendChild(button); });
    dialogue.style.display = 'flex';
}

function closeHotelDialogue() { hotelDialogueOpen = false; hotelTaskGame = null; const dialogue = document.getElementById('hotelDialogue'); if (dialogue) dialogue.style.display = 'none'; }

function acceptEmployeeTask(index) {
    const employee = employees[index]; if (!employee || employee.evacuated || activeHotelTasks().length >= 2) return;
    employee.task ||= chooseHotelTaskTarget(employee); employee.task.status = 'accepted';
    closeHotelDialogue(); renderHotelTasks(); updateHUD(); notify(`${employee.department} ASSIGNMENT ACCEPTED`, 'info');
}

function reportEmployeeTask(index) {
    const employee = employees[index]; if (!employee?.task || employee.task.status !== 'readyToReport') return;
    employee.task.status = 'reported';
    closeHotelDialogue(); renderHotelTasks(); updateHUD(); playSound('success');
    notify(`${employee.department}: TASK REPORTED`, 'unlock');
    checkPhase();
}

function finishHotelTask(task) {
    task.status = 'readyToReport'; hotelTaskGame = null; renderHotelTasks(); updateHUD(); playSound('success');
    notify('ASSIGNMENT COMPLETE · REPORT BACK', 'unlock'); closeHotelDialogue();
}

function startHotelTaskMiniGame(task) {
    const gameData = {
        ledger: { title:'RESERVATION LEDGER', prompt:'Find the three stamped reservation pages.', options:['SUITE 204','SUITE 317','SUITE 118','SUITE 402'] },
        panel: { title:'SERVICE PANEL', prompt:'Reconnect the service panel in the correct order.', options:['RED LINE','BLUE LINE','GREEN LINE','YELLOW LINE'] },
        search: { title:'GUEST ROOM SEARCH', prompt:'Search the room furniture for the missing key.', options:['DESK','DRESSER','NIGHTSTAND','CLOSET'] },
        inventory: { title:'BANQUET INVENTORY', prompt:'Match the stock labels on the banquet crate.', options:['LINENS','GLASSWARE','CUTLERY','PLATES'] }
    }[task.kind] || { title:'HOTEL TASK', prompt:'Complete the assigned work.', options:['A','B','C','D'] };
    const sequence = [...gameData.options].sort(() => Math.random() - .5).slice(0, 3);
    hotelTaskGame = { task, ...gameData, sequence, step: 0 };
    renderHotelTaskMiniGame();
}

function renderHotelTaskMiniGame() {
    if (!hotelTaskGame) return;
    const game = hotelTaskGame;
    openHotelDialogue(game.title, `${game.prompt} (${game.step + 1}/${game.sequence.length})`, game.options.map(option => ({ label: option, action: () => hotelTaskMiniInput(option) })));
}

function hotelTaskMiniInput(option) {
    const game = hotelTaskGame; if (!game) return;
    if (option !== game.sequence[game.step]) {
        game.step = 0; playSound('fail'); notify('WRONG STEP · START AGAIN', 'warning'); renderHotelTaskMiniGame(); return;
    }
    game.step++; playSound('tick');
    if (game.step >= game.sequence.length) finishHotelTask(game.task);
    else renderHotelTaskMiniGame();
}

function completeHotelTaskAtTarget() {
    const { employee, task } = nearHotelTask || {}; if (!task || task.status !== 'accepted') return false;
    if (task.fake) {
        task.status = 'failed'; bassamTrapTaskId = task.id; bassamRevealPending = true; bassamFakeTask = null;
        closeHotelDialogue(); renderHotelTasks(); notify('THE ASSIGNMENT WAS A LIE', 'danger');
        showMsg('<span style="color:#ff5555">NO ONE IS WAITING HERE</span>', 1100); return true;
    }
    startHotelTaskMiniGame(task); return true;
}

function interactWithEmployee() {
    if (!nearEmployee) return false;
    if (nearEmployee.isBassam) {
        if (bassamFakeTask?.status === 'accepted') { openHotelDialogue(bassamStaffDepartment, 'Please hurry. The guest is waiting in the room I marked.'); return true; }
        if (!bassamFakeTask) {
            const targetRooms = rooms.filter(room => ['guest','bathroom','storage','service'].includes(room.type));
            const room = targetRooms[Math.floor(Math.random() * Math.max(1, targetRooms.length))] || rooms.at(-1);
            const fakeTile = chooseHotelItemTile(room);
            bassamFakeTask = { id: ++hotelTaskSerial, department: bassamStaffDepartment, label: 'Deliver the room key', itemName: 'ROOM KEY', room, x: fakeTile.c * TS + TS / 2, y: fakeTile.r * TS + TS / 2, status: 'offered', fake: true };
            bassamFakeLine = ['A room key was left in the wrong wing. Could you return it?', 'A guest requested their key at the service desk. Can you take it over?', 'The front desk is short-handed. Please deliver this key for me.'][Math.floor(Math.random() * 3)];
        }
        const fakeTask = bassamFakeTask;
        if (activeHotelTasks().length >= 2) { openHotelDialogue(bassamStaffDepartment, 'You are already carrying two assignments. Return when you have room.'); return true; }
        openHotelDialogue(bassamStaffDepartment, bassamFakeLine, [{ label: 'ACCEPT ASSIGNMENT', action: () => { fakeTask.status = 'accepted'; bassamTrapTaskId = fakeTask.id; closeHotelDialogue(); renderHotelTasks(); notify(`${bassamStaffDepartment} ASSIGNMENT ACCEPTED`, 'info'); } }]);
        return true;
    }
    if (nearEmployee.evacuated) return false;
    const employee = nearEmployee;
    if (employee.task?.status === 'readyToReport') {
        openHotelDialogue(employee.department, 'You finished it? Thank you. I am ready to evacuate once the elevator has power.', [{ label: 'REPORT COMPLETION', action: () => reportEmployeeTask(employee.index) }]);
    } else if (employee.task?.status === 'reported') {
        openHotelDialogue(employee.department, hotelElevatorReady() ? 'The elevator has power. Please send us through when you reach it.' : 'I will wait near the lobby. The elevator still needs generator power.');
    } else if (employee.task?.status === 'accepted') {
        openHotelDialogue(employee.department, `Your assignment is still active. Go to the ${employee.task.room.type.toUpperCase()} and finish it, then come back.`);
    } else if (activeHotelTasks().length >= 2) {
        openHotelDialogue(employee.department, 'You are already carrying two assignments. Finish one and return to me.');
    } else {
        employee.task = chooseHotelTaskTarget(employee);
        openHotelDialogue(employee.department, `I need you to ${employee.task.label.toLowerCase()} in the ${employee.task.room.type.toUpperCase()}. Will you take it?`, [{ label: 'ACCEPT ASSIGNMENT', action: () => acceptEmployeeTask(employee.index) }]);
    }
    return true;
}

function evacuateEmployee(index) {
    const employee = employees[index]; if (!employee || employee.evacuated || employee.task?.status !== 'reported') return;
    employee.evacuated = true; employee.x = -100; employee.y = -100; employee.path = [];
    closeHotelDialogue(); renderHotelTasks(); updateHUD(); playSound('success');
    notify(`${employee.department} EVACUATED`, 'unlock'); checkPhase();
}

function useHotelElevator() {
    if (!hotelElevator || !nearElevator) return false;
    if (activeGens < totalGens) { showMsg('<span style="color:#ffcc66">ELEVATOR HAS NO POWER</span><br>REPAIR THE GENERATORS', 1200); return true; }
    const waiting = reportedHotelEmployees().filter(employee => !employee.evacuated);
    if (!waiting.length) { showMsg('<span style="color:#ffcc66">NO STAFF ARE READY</span><br>REPORT COMPLETED ASSIGNMENTS', 1200); return true; }
    openHotelDialogue('ELEVATOR CONTROL', 'Choose a staff member to send to safety.', waiting.map(employee => ({ label: `EVACUATE ${employee.department}`, action: () => evacuateEmployee(employee.index) })));
    return true;
}

function moveBassamToEmployee() {
    if (currentMapId !== 'hotel' || bassamState !== 'disguised') return;
    const room = rooms.filter(candidate => candidate.type !== 'elevator')[Math.floor(Math.random() * Math.max(1, rooms.length - 1))] || rooms[0];
    monster.path = findPath(Math.floor(monster.x / TS), Math.floor(monster.y / TS), room.c, room.r);
    stateTimer = 360 + Math.floor(Math.random() * 300);
}

function isOnPlayerScreen(entity) {
    return Math.abs(entity.x - player.x) < canvas.width / (2 * camera.zoom) + 45 && Math.abs(entity.y - player.y) < canvas.height / (2 * camera.zoom) + 45;
}

function updateHotelEmployees() {
    if (currentMapId !== 'hotel' || state !== 1) return;
    for (const employee of employees) {
        if (employee.evacuated) continue;
        employee.roamTimer--;
        if (employee.roamTimer <= 0 || employee.path.length === 0) {
            const options = rooms.filter(room => !['elevator', 'security'].includes(room.type));
            const destination = options[Math.floor(Math.random() * Math.max(1, options.length))] || employee.homeRoom;
            employee.path = findPath(Math.floor(employee.x / TS), Math.floor(employee.y / TS), destination.c, destination.r);
            employee.roamTimer = 300 + Math.floor(Math.random() * 300);
        }
        moveMonsterAlongPath(1.05, employee);
    }
}

function modeMonsterCount() {
    if (gameMode === 'survival') return survivalConfig?.count || 1;
    if (gameMode === 'endless') return Math.min(4, 1 + Math.floor((endlessRound - 1) / 3));
    if ((gameMode === 'normal' || gameMode === 'campaign') && currentMapId === 'boilerworks' && Math.random() < 0.06) return 2;
    return 1;
}

function createExtraMonster(name, diffData, index) {
    const candidates = floors.filter(tile => {
        const x = tile.c * TS + TS / 2, y = tile.r * TS + TS / 2;
        return !isSafeRoom(x, y) && !isReservedObjectSpot(x, y, TS * 2) && (currentMapId === 'level0' || !getRoomAt(x, y)) && monsters.every(other => Math.hypot(other.x - x, other.y - y) > TS * 6);
    });
    const tile = candidates[Math.floor(Math.random() * Math.max(1, candidates.length))] || floors[0];
    const enemy = {
        name, x: tile.c * TS + TS / 2, y: tile.r * TS + TS / 2,
        r: 14, drawRadius: 14, speed: diffData.mSpd, baseSpeed: diffData.mSpd,
        color: '#800', textColor: 'red', allSeeing: false, isPhantom: false,
        isFrenzy: false, isReinforced: false, hasGloom: false, isResilient: false,
        hasScrambler: false, hasHexed: false, hasHallucinations: false, hasLockedIn: false, hasEcho: false, hasFalseObjective: false, hasWatcher: false, hasPanic: false, hasHeavyFootfall: false, hasAfterimage: false,
        heatAlertTimer: 0, heatAlertX: 0, heatAlertY: 0, stunTimer: 0, bloodHuntTimer: 0, bloodHuntX: 0, bloodHuntY: 0, lastTargetC: -1, lastTargetR: -1, path: [], activeMutations: [], extra: true
    };
    if (name === 'MALAKAI') { enemy.baseSpeed += 0.45; enemy.speed = enemy.baseSpeed; enemy.color = '#50a'; enemy.textColor = '#d4f'; }
    if (name === 'JORDAN') { enemy.baseSpeed += 0.18; enemy.speed = enemy.baseSpeed; enemy.color = '#050'; enemy.textColor = '#0f0'; }
    if (name === 'AESON') { enemy.baseSpeed += 0.12; enemy.speed = enemy.baseSpeed; enemy.color = '#d43b18'; enemy.textColor = '#ff9a66'; }
    if (name === 'BASSAM') { enemy.baseSpeed += 0.05; enemy.speed = enemy.baseSpeed; enemy.color = '#8d7654'; enemy.textColor = '#d4c09a'; }
    if (name === 'RHYS') { enemy.baseSpeed += 0.16; enemy.speed = enemy.baseSpeed; enemy.color = '#d8bd32'; enemy.textColor = '#ffe878'; }
    const count = gameMode === 'survival' ? (survivalConfig?.mutations || 0) : Math.min(3, Math.floor((endlessRound - 1) / 2));
    const pool = ['Speed Demon', 'Giant', 'Reinforced', 'Resilient', 'All-Seeing'];
    for (let i = 0; i < count; i++) {
        const mutation = pool[(index + i) % pool.length];
        if (enemy.activeMutations.includes(mutation)) continue;
        enemy.activeMutations.push(mutation);
        if (mutation === 'Speed Demon') { enemy.baseSpeed += 0.45; enemy.speed = enemy.baseSpeed; }
        if (mutation === 'Giant') enemy.drawRadius = 22;
        if (mutation === 'Reinforced') enemy.isReinforced = true;
        if (mutation === 'Resilient') enemy.isResilient = true;
        if (mutation === 'All-Seeing') enemy.allSeeing = true;
    }
    return enemy;
}

function startGame(diffLevel) {
    initAudio();
    currentDiff = diffLevel;
    runStartedAt = performance.now(); runItemsUsed = 0;
    stats.games++;
    if (currentMapId === 'boilerworks') advanceDailyObjective('boilerworks');
    document.querySelectorAll('.menu-panel').forEach(p => p.style.display = 'none');
    hud.style.display = 'block';
    hud.classList.toggle('rhys-objective-hud', currentMapId === 'crimson');
    
    if (currentMapId === 'boilerworks') { COLS = 65; ROWS = 49; }
    else if (currentMapId === 'hotel') { COLS = 91; ROWS = 69; }
    else if (currentMapId === 'crimson') { COLS = 93; ROWS = 65; }
    else { COLS = 41; ROWS = 33; }
    hotelTaskSerial = 0;
    if (currentMapId === 'boilerworks') generateBoilerworks();
    else if (currentMapId === 'hotel') generateHotel();
    else if (currentMapId === 'crimson') generateCrimsonContainment();
    else { generateMaze(); generateSpecialRooms(); }
    if (currentMapId !== 'hotel') hotelElevator = null;
    if (currentMapId !== 'boilerworks') { centralBoiler = null; coolingValves = []; }
    
    const spawnRoom = (currentMapId === 'boilerworks' || currentMapId === 'hotel' || currentMapId === 'crimson') ? rooms[0] : null;
    player.x = spawnRoom?.x || (MAZE_LEFT + 1.5) * TS; player.y = spawnRoom?.y || (MAZE_TOP + 1.5) * TS;
    player.baseSpeed = 4.3 * (1 + (upgShoe * 0.05));
    player.speed = player.baseSpeed;
    playerTrail = [];
    player.boostTimer = 0; player.stunTimer = 0; player.crouching = false; player.breathing = false; player.breathTimer = 0; player.breathCooldown = 0; player.heat = 0; player.inHeatZone = false; player.hidden = false; player.hideTimer = 0; player.hideCompromised = false;
    ambienceClock = 0;
    camera.targetZoom = 1.0; camera.zoom = 1.0;
    nearGen = null; nearValve = null; nearBoiler = false; flashAlpha = 0;
    boilerShutdown = false; boilerReadyShown = false; heatZones = []; heatEventCooldown = currentMapId === 'boilerworks' ? 360 : 0;
    rhysSealCollected = false; rhysTrapArmed = false; goopZones = []; goopShots = []; rhysSpitCooldown = 180; rhysDashTimer = 0; rhysDashCooldown = 360; rhysEventCooldown = 900; rhysSweepTimer = 0; rhysSweepRadius = 0; rhysPressureZones = [];
    hotelLockdownTimer = 0; hotelEventCooldown = currentMapId === 'hotel' ? 480 : 0; hotelLockdownActive = false; hotelBlockedDoor = null;
    bassamState = 'roaming'; bassamRevealPending = false; bassamTrapTaskId = null; bassamFakeTask = null; bassamFakeLine = ''; bassamAmbushActive = false; bassamLostTimer = 0; bassamAmbushCooldown = 900; hotelTaskGame = null; bassamStaffDepartment = ['FRONT DESK','MAINTENANCE','HOUSEKEEPING','KITCHEN'][Math.floor(Math.random() * 4)]; closeHotelDialogue();
    document.getElementById('hotelTaskHUD').style.display = currentMapId === 'hotel' ? 'block' : 'none';
    
    const roundScale = gameMode === 'endless' ? endlessRound - 1 : 0;
    eventsEnabled = gameMode !== 'survival' || survivalConfig?.events !== false;
    safeRoomsReliable = gameMode !== 'endless' || Math.random() < Math.max(0.35, 1 - roundScale * 0.14);
    let diffData = [
        { t: 10, gMin: 3, gMax: 4, mMin: 0, mMax: 1, mSpd: 2.5 },
        { t: 25, gMin: 4, gMax: 5, mMin: 1, mMax: 2, mSpd: 3.0 },
        { t: 40, gMin: 5, gMax: 6, mMin: 2, mMax: 3, mSpd: 3.4 }
    ][diffLevel];
    diffData = { ...diffData };
    if (gameMode === 'endless') {
        diffData.gMin += Math.floor((roundScale + 1) / 2);
        diffData.gMax += Math.floor((roundScale + 2) / 2);
        diffData.mMin += Math.floor(roundScale / 2);
        diffData.mMax += Math.floor((roundScale + 1) / 2);
        diffData.mSpd += roundScale * 0.22;
    }
    if (gameMode === 'survival' && survivalConfig) {
        diffData.gMin = survivalConfig.generators;
        diffData.gMax = survivalConfig.generators;
        diffData.mMin = survivalConfig.mutations;
        diffData.mMax = survivalConfig.mutations;
    }
    
    rewardTokens = diffData.t + (gameMode === 'endless' ? roundScale * 8 : gameMode === 'survival' ? (survivalConfig?.count || 1) * 5 : 0);

    let rand = Math.random();
    let monsterName = 'CALEB';
    if (currentMapId === 'crimson' && gameMode !== 'survival') {
        monsterName = 'RHYS';
    } else if (currentMapId === 'hotel' && gameMode !== 'survival') {
        monsterName = 'BASSAM';
    } else if (currentMapId === 'boilerworks' && gameMode !== 'survival') {
        if (rand < 0.58) monsterName = 'AESON';
        else if (rand < 0.78) monsterName = 'JORDAN';
        else if (rand < 0.91) monsterName = 'CALEB';
        else monsterName = 'MALAKAI';
    } else if (diffLevel === 0) {
        if (rand > 0.95) monsterName = 'JORDAN';
        else if (rand > 0.8) monsterName = 'MALAKAI';
    } else if (diffLevel === 1) {
        if (rand > 0.85) monsterName = 'JORDAN';
        else if (rand > 0.5) monsterName = 'MALAKAI';
    } else {
        if (rand > 0.7) monsterName = 'JORDAN';
        else if (rand > 0.25) monsterName = 'MALAKAI';
    }
    if (gameMode === 'survival' && survivalConfig) monsterName = survivalConfig.names[0];

    const monsterTiles = floors.filter(tile => {
        const x = tile.c * TS + TS / 2, y = tile.r * TS + TS / 2;
        return !isSafeRoom(x, y) && !isReservedObjectSpot(x, y, TS * 2) && (currentMapId === 'level0' || !getRoomAt(x, y)) && Math.hypot(player.x - x, player.y - y) > TS * 8;
    });
    let startTile = monsterTiles.at(-1) || floors.at(-1);
    
    monster = { 
        name: monsterName,
        x: startTile.c * TS + TS / 2, y: startTile.r * TS + TS / 2, 
        r: 14, drawRadius: 14, 
        speed: diffData.mSpd, baseSpeed: diffData.mSpd,
         color: '#800', textColor: 'red',
         allSeeing: false, isPhantom: false, isFrenzy: false, isReinforced: false, hasGloom: false, isResilient: false, hasScrambler: false, hasHexed: false, hasHallucinations: false, hasLockedIn: false, hasEcho: false, hasFalseObjective: false, hasWatcher: false, hasPanic: false, hasHeavyFootfall: false, hasAfterimage: false, stunTimer: 0, bloodHuntTimer: 0, bloodHuntX: 0, bloodHuntY: 0, lastTargetC: -1, lastTargetR: -1,
        path: [], activeMutations: []
    };
    monsters = [monster];

    empTimer = 0; empWarning = 0; empActive = 0;
    powerOutageTimer = 0; outageFlickerTimer = 0; powerOutageCooldown = Math.floor(Math.random() * 600) + 900;
    flickerTimer = 0; flickerCooldown = Math.floor(Math.random() * 600) + 600;
    emergencyTimer = 0; emergencyCooldown = currentMapId === 'crimson' ? 999999 : Math.floor(Math.random() * 1200) + 1200;
    noiseTarget = null; noiseTimer = 0; fuses = [];
    jordanSabotageCooldown = 0;

    if (monsterName === 'MALAKAI') {
        monster.baseSpeed += 0.45; monster.speed = monster.baseSpeed;
        monster.color = '#50a'; monster.textColor = '#d4f';
    } else if (monsterName === 'JORDAN') {
        monster.color = '#050'; monster.textColor = '#0f0';
        jordanState = 'saboteur'; mimicTimer = 600; 
    } else if (monsterName === 'AESON') {
        monster.baseSpeed += 0.12; monster.speed = monster.baseSpeed;
        monster.color = '#d43b18'; monster.textColor = '#ff9a66';
    } else if (monsterName === 'BASSAM') {
        monster.baseSpeed += 0.05; monster.speed = monster.baseSpeed;
        monster.color = '#8d7654'; monster.textColor = '#d4c09a';
        bassamState = 'disguised';
    } else if (monsterName === 'RHYS') {
        monster.baseSpeed += 0.16; monster.speed = monster.baseSpeed;
        monster.color = '#d8bd32'; monster.textColor = '#ffe878';
    } else if (monsterName === 'CALEB') {
        empTimer = Math.floor(Math.random() * 600) + 600; 
    }

    let numMutations = Math.floor(Math.random() * (diffData.mMax - diffData.mMin + 1)) + diffData.mMin;
    let possibleMutations = [
        { name: 'Speed Demon', apply: (m) => { m.baseSpeed += 0.6; m.speed = m.baseSpeed; } }, 
        { name: 'Phantom', apply: (m) => { m.isPhantom = true; m.color = 'rgba(136, 0, 0, 0.3)'; m.baseSpeed *= 0.45; m.speed = m.baseSpeed; } },
        { name: 'Frenzy', apply: (m) => m.isFrenzy = true },
        { name: 'Camouflage', apply: (m) => { m.color = '#8b7355'; m.textColor = 'rgba(0,0,0,0)'; } },
        { name: 'Giant', apply: (m) => m.drawRadius = 26 },
        { name: 'Gloom', apply: (m) => m.hasGloom = true },
        { name: 'Reinforced', apply: (m) => m.isReinforced = true },
        { name: 'Lethargy', apply: (m) => { player.baseSpeed *= 0.9; player.speed = player.baseSpeed; } },
        { name: 'Resilient', apply: (m) => m.isResilient = true },
        { name: 'Scrambler', apply: (m) => m.hasScrambler = true },
        { name: 'Hexed', apply: (m) => m.hasHexed = true },
        { name: 'Hallucinations', apply: (m) => m.hasHallucinations = true },
        { name: 'Locked In', apply: (m) => m.hasLockedIn = true },
        { name: 'Echo', apply: (m) => m.hasEcho = true },
        { name: 'False Objective', apply: (m) => m.hasFalseObjective = true },
        { name: 'Watcher', apply: (m) => { m.hasWatcher = true; m.allSeeing = true; } },
        { name: 'Panic', apply: (m) => m.hasPanic = true },
        { name: 'Heavy Footfall', apply: (m) => { m.hasHeavyFootfall = true; m.baseSpeed = Math.max(1.8, m.baseSpeed - 0.22); m.speed = m.baseSpeed; } },
        { name: 'Afterimage', apply: (m) => m.hasAfterimage = true }
    ];

    if (Math.random() > 0.25) possibleMutations = possibleMutations.filter(mut => mut.name !== 'Phantom');
    if (Math.random() > 0.30) possibleMutations = possibleMutations.filter(mut => mut.name !== 'Camouflage');

    if (monsterName !== 'MALAKAI' && monsterName !== 'JORDAN') {
        possibleMutations.push({ name: 'All-Seeing', apply: (m) => m.allSeeing = true });
    }

    if (numMutations === 1 && lastSingleMutation) {
        possibleMutations = possibleMutations.filter(mut => mut.name !== lastSingleMutation);
    }
    
    let chosenMuts = [];
    for(let i = 0; i < numMutations; i++) {
        if (possibleMutations.length === 0) break;
        let idx = Math.floor(Math.random() * possibleMutations.length);
        let mut = possibleMutations[idx];
        chosenMuts.push(mut);
        possibleMutations.splice(idx, 1);
        
        if (mut.name === 'Phantom') possibleMutations = possibleMutations.filter(m => m.name !== 'Camouflage');
        else if (mut.name === 'Camouflage') possibleMutations = possibleMutations.filter(m => m.name !== 'Phantom');
    }

    for (let mut of chosenMuts) {
        mut.apply(monster);
        monster.activeMutations.push(mut.name);
    }
    lastSingleMutation = monster.activeMutations.length === 1 ? monster.activeMutations[0] : null;

    const requestedCount = modeMonsterCount();
    const survivalNames = survivalConfig?.names || [];
    for (let i = 1; i < requestedCount; i++) {
        const name = gameMode === 'survival'
            ? survivalNames[i % survivalNames.length]
            : currentMapId === 'boilerworks'
                ? ['JORDAN', 'CALEB', 'MALAKAI'][(endlessRound + i - 1) % 3]
                : ['CALEB', 'MALAKAI', 'JORDAN'][(endlessRound + i - 1) % 3];
        monsters.push(createExtraMonster(name, diffData, i));
    }
    
    totalGens = Math.floor(Math.random() * (diffData.gMax - diffData.gMin + 1)) + diffData.gMin;
    if (currentMapId === 'hotel') totalGens = Math.max(4, Math.min(7, totalGens + 1));
    if (currentMapId === 'crimson') totalGens = Math.max(5, Math.min(7, totalGens + 1));
    activeGens = 0; generators = [];
    
    let genPool = floors.filter(tile => !getRoomAt(tile.c * TS + TS / 2, tile.r * TS + TS / 2)).sort(() => Math.random() - 0.5);
    for (let tile of genPool) {
        if (generators.length >= totalGens) break;
        let tx = tile.c * TS + TS / 2, ty = tile.r * TS + TS / 2;
        if (isOpenObjectSpot(tx, ty, TS * 6)) {
            generators.push({ x: tx, y: ty, r: 12, active: false, type: 'normal', isFalse: false, repairFlash: 0, stage: 0, requiredStages: 3, requiredFuses: 2, collectedFuses: 0 });
        }
    }
    while (generators.length < totalGens) {
        let tile = genPool.pop();
        if (!tile) break; // Breakout to prevent infinite generation looping
        let tx = tile.c * TS + TS / 2, ty = tile.r * TS + TS / 2;
        if (isOpenObjectSpot(tx, ty, TS * 2)) generators.push({ x: tx, y: ty, r: 12, active: false, type: 'normal', isFalse: false, repairFlash: 0, stage: 0, requiredStages: 3, requiredFuses: 2, collectedFuses: 0 });
    }
    // A crowded procedural seed should never create an unwinnable run. Relax only
    // the spacing distance for a final pass; rooms, doors, walls, and other objects
    // are still protected by isOpenObjectSpot.
    if (generators.length < totalGens) {
        for (const tile of floors) {
            if (generators.length >= totalGens) break;
            const tx = tile.c * TS + TS / 2, ty = tile.r * TS + TS / 2;
            if (isOpenObjectSpot(tx, ty, TS)) generators.push({ x: tx, y: ty, r: 12, active: false, type: 'normal', isFalse: false, repairFlash: 0, stage: 0, requiredStages: 3, requiredFuses: 2, collectedFuses: 0 });
        }
    }

    let fuseGeneratorAssigned = false;
    let multiGeneratorAssigned = false;
    for (const generator of generators) {
        const roll = Math.random();
        if (!fuseGeneratorAssigned && roll < 0.12) {
            generator.type = 'fuse';
            fuseGeneratorAssigned = true;
            const fuseTiles = floors
                .filter(tile => !getRoomAt(tile.c * TS + TS / 2, tile.r * TS + TS / 2))
                .filter(tile => isOpenObjectSpot(tile.c * TS + TS / 2, tile.r * TS + TS / 2, TS * 2))
                .sort(() => Math.random() - 0.5)
                .slice(0, generator.requiredFuses);
            for (const tile of fuseTiles) fuses.push({ x: tile.c * TS + TS / 2, y: tile.r * TS + TS / 2, collected: false });
        } else if (!multiGeneratorAssigned && roll < 0.30) {
            generator.type = 'multi';
            multiGeneratorAssigned = true;
        } else if (roll < 0.50 && generators.filter(other => !other.isFalse).length > 1 && generators.filter(other => other.isFalse).length < 1) {
            generator.isFalse = true;
        }
    }
    // Decoys never count toward the power objective.
    totalGens = generators.filter(generator => !generator.isFalse).length;
    const storageRoom = rooms.find(room => room.type === 'storage');
    if (storageRoom && !generators.some(generator => generator.x === storageRoom.x && generator.y === storageRoom.y)) {
        hidingSpots.push({ x: storageRoom.x, y: storageRoom.y, occupied: false });
    }
    
    stats.encounters[monster.name] = (stats.encounters[monster.name] || 0) + 1;
    stats.favoriteMonster = Object.entries(stats.encounters).sort((a,b) => b[1] - a[1])[0]?.[0] || 'None';
    canvas.classList.remove('shake');
    state = 1; updateHUD(); renderHotelTasks();
}

function unlockCosmetic(id) {
    if (!cosmetics.unlocked.includes(id)) {
        cosmetics.unlocked.push(id);
        notify(`UNLOCKED: ${id.toUpperCase()}`, 'unlock');
    }
}

function endGame(isWin, sourceMonster = monster) {
    if (state === 4 || (gameMode === 'endless' && state === 0)) return;
    if (isWin && gameMode === 'endless') {
        const earned = Math.floor(rewardTokens * (upgCoin > 0 ? 1.5 : 1));
        tokens += earned;
        stats.wins++; stats.caught++; stats.bestEndless = Math.max(stats.bestEndless, endlessRound);
        if (endlessRound >= 3) unlockCosmetic('spark');
        saveData();
        playSound('success');
        endlessRound++;
        state = 0;
        showMsg(`<span style="color:#0f0">ROUND CLEARED</span><br>ROUND ${endlessRound} STARTING`, 1100);
        setTimeout(() => startGame(currentDiff), 1200);
        return;
    }
    state = 4;
    document.querySelectorAll('.menu-panel').forEach(p => p.style.display = 'none');
    hud.style.display = 'none';
    hud.classList.remove('rhys-objective-hud');
    closeHotelDialogue(); document.getElementById('hotelTaskHUD').style.display = 'none';
    document.getElementById('endMenu').style.display = 'flex';
    document.getElementById('endTitle').innerText = isWin ? "YOU WIN!" : "CAUGHT!";
    document.getElementById('endTitle').style.color = isWin ? "#0f0" : "#f00";
    
    if (isWin) {
        let earned = Math.floor(rewardTokens * (upgCoin > 0 ? 1.5 : 1));
        tokens += earned;
        stats.wins++; stats.caught++;
        stats.mostGenerators = Math.max(stats.mostGenerators, totalGens);
        const elapsed = performance.now() - runStartedAt;
        if (!stats.fastestWin || elapsed < stats.fastestWin) stats.fastestWin = elapsed;
        if (elapsed < 120000) unlockCosmetic('amber');
        if (currentDiff === 2) unlockCosmetic('crimson');
        if (sourceMonster.name === 'MALAKAI') unlockCosmetic('violet');
        if (sourceMonster.name === 'JORDAN') unlockCosmetic('green');
        if (runItemsUsed === 0) unlockCosmetic('ghost');
        advanceDailyObjective('wins');
        if (sourceMonster.name === 'AESON') advanceDailyObjective('aeson');
        if (sourceMonster.name === 'RHYS') { unlockCosmetic('gold'); unlockCosmetic('ember'); }
        if (runItemsUsed === 0) advanceDailyObjective('noItems');
        if (gameMode === 'campaign') {
            if (!campaignCleared.includes(currentMapId)) campaignCleared.push(currentMapId);
            const nextMap = Object.values(MAP_DEFINITIONS).find(mapDef => mapDef.campaignOrder === MAP_DEFINITIONS[currentMapId].campaignOrder + 1);
            if (nextMap && !unlockedMaps.includes(nextMap.id)) {
                unlockedMaps.push(nextMap.id);
                notify(`${nextMap.name} UNLOCKED`, 'unlock');
            }
        }
        saveData();
        playSound('success');
        document.getElementById('endDesc').innerHTML = `You caught ${sourceMonster.name}.<br>+${earned} Tokens`;
    } else {
        stats.losses++; stats.timesCaught++;
        saveData();
        playSound('fail');
        document.getElementById('endDesc').innerHTML = `${sourceMonster.name} tore you apart.`;
    }
}

function playAgainFromEnd() {
    saveData();
    if (gameMode === 'endless') endlessRound = 1;
    state = 0;
    startGame(currentDiff);
}

function returnToMainMenu() {
    saveData();
    state = 0;
    mobileMenuPaused = false;
    document.getElementById('mobileActionMenu').style.display = 'none';
    closeHotelDialogue(); document.getElementById('hotelTaskHUD').style.display = 'none';
    hud.classList.remove('rhys-objective-hud');
    showMenu('mainMenu');
}

function checkPhase() {
    updateHUD();
    if (activeGens >= totalGens) {
        if (currentMapId === 'boilerworks') {
            if (coolingValves.length < 3 || coolingValves.some(valve => !valve.active)) {
                showMsg(`<span style="color:#ffcc00">GENERATORS ONLINE</span><br>ACTIVATE ${coolingValves.filter(valve => !valve.active).length} COOLING VALVE(S)`, 1300);
            } else if (!boilerReadyShown) {
                boilerReadyShown = true;
                showMsg('<span style="color:#ffcc00">CENTRAL BOILER READY</span><br>FIND THE BOILER', 1500);
            }
            return;
        }
        if (currentMapId === 'hotel') {
            if (reportedHotelEmployees().length < hotelEmployeesRequired) showMsg(`<span style="color:#d4c09a">GENERATORS ONLINE</span><br>REPORT ${hotelEmployeesRequired - reportedHotelEmployees().length} EMPLOYEE(S)`, 1300);
            else if (evacuatedHotelEmployees().length < hotelEmployeesRequired) { notify('THE ELEVATOR IS READY FOR STAFF', 'unlock'); showMsg(`<span style="color:#d4c09a">ELEVATOR POWERED</span><br>EVACUATE ${hotelEmployeesRequired - evacuatedHotelEmployees().length} EMPLOYEE(S)`, 1500); }
            else beginFinalChase();
            return;
        }
        if (currentMapId === 'crimson') { showMsg('<span style="color:#ffe878">GENERATORS ONLINE</span><br>LOCATE THE CRIMSON SEAL', 1400); return; }
        beginFinalChase();
    }
}

function showMsg(text, time = 0) {
    msgBox.innerHTML = text;
    msgBox.classList.toggle('top-alert', text.includes("THAT'S NOT A GENERATOR"));
    msgBox.style.display = 'block';
    if (time > 0) setTimeout(hideMsg, time);
}
function hideMsg() { msgBox.style.display = 'none'; msgBox.classList.remove('top-alert'); }

function notify(text, tone = 'info', duration = 2600) {
    const stack = document.getElementById('notificationStack');
    if (!stack) return;
    const item = document.createElement('div');
    item.className = `notification notification-${tone}`;
    item.textContent = text;
    stack.appendChild(item);
    if (tone === 'unlock') playSound('unlock');
    setTimeout(() => {
        item.classList.add('notification-leave');
        setTimeout(() => item.remove(), 280);
    }, duration);
}

function updateHUD() {
    const shownGens = hallucinationHudTimer > 0 ? `${Math.max(0, activeGens + (ambienceClock % 2 ? 1 : -1))}/${totalGens}` : `${activeGens}/${totalGens}`;
    document.getElementById('genCount').innerText = monsters.some(enemy => enemy.hasScrambler) ? "?/?" : shownGens;
    const objective = document.getElementById('mapObjective');
    if (objective) {
        const falseObjective = monster.hasFalseObjective && Math.floor(ambienceClock / 180) % 2 === 1;
        objective.textContent = falseObjective
            ? 'Objective signal corrupted · CHECK THE LANDMARKS'
            : currentMapId === 'boilerworks'
                ? `Cooling valves: ${coolingValves.filter(valve => valve.active).length}/${coolingValves.length || 3}${boilerReadyShown ? ' · FIND THE BOILER' : ''}`
                : currentMapId === 'hotel'
                    ? `Hotel: ${activeGens}/${totalGens} generators · Staff ${evacuatedHotelEmployees().length}/${hotelEmployeesRequired} evacuated${hotelObjectiveComplete() ? ' · CATCH BASSAM' : ''}`
                    : currentMapId === 'crimson'
                        ? `Containment: ${activeGens}/${totalGens} generators · ${activeGens < totalGens ? 'Restore facility power' : !rhysSealCollected ? rhysRoute === 'break' && !rhysBreakWall?.broken ? 'Bait Rhys into the cracked wall' : rhysRoute === 'chest' && !rhysChestKey?.collected ? 'Find the chest key' : rhysRoute === 'chest' && !rhysChest?.opened ? 'Open the Crimson Chest' : 'Recover the Crimson Seal' : !rhysTrapArmed ? 'Arm the containment trap' : 'Lure Rhys into containment'}`
                    : 'Find and repair every generator';
    }
    
    let invText = [];
    if (itemAllowed('adrenaline') && invAdrenaline > 0) invText.push(`Adrenaline: ${invAdrenaline} (SPACE)`);
    if (itemAllowed('flashbang') && invFlashbang > 0) invText.push(`Flashbang: ${invFlashbang} (F)`);
    if (itemAllowed('noiseMaker') && invNoiseMaker > 0) invText.push(`Noise: ${invNoiseMaker} (N)`);
    if (itemAllowed('bearTrap') && invBearTrap > 0) invText.push(`Trap: ${invBearTrap} (T)`);
    if (itemAllowed('battery') && invBattery > 0) invText.push(`Battery: ${invBattery} (R)`);
    if (itemAllowed('breathFilter') && invBreathFilter > 0) invText.push(`Filter: ${invBreathFilter}`);
    if (currentMapId === 'boilerworks' && player.heat > 0) invText.push(`HEAT: ${Math.round(player.heat / 3)}/100`);
    if (player.crouching) invText.push('CROUCHING');
    if (player.breathing) invText.push(`BREATH: ${Math.ceil(player.breathTimer / 60)}s`);
    if (fuses.some(fuse => !fuse.collected)) invText.push(`Fuses: ${fuses.filter(fuse => !fuse.collected).length}`);
    if (player.hidden) invText.push(`HIDDEN: ${Math.ceil(player.hideTimer / 60)}s`);
    document.getElementById('inventory').innerText = invText.join(' | ');
    
    let mText = monsters.length > 1 ? '[Open roster]' : (monster.activeMutations.length > 0 ? `[${monster.activeMutations.join(', ')}]` : '[None]');
    let title = monsters.length > 1 ? 'MULTIPLE MONSTERS' : ((monster.name === 'JORDAN' && jordanState === 'mimic') || (monster.name === 'BASSAM' && bassamState === 'disguised') ? '???' : monster.name);
    const titleColor = monsters.length > 1 ? '#ffb0b0' : monster.textColor;
    const modeText = gameMode === 'endless' ? `ROUND ${endlessRound}` : gameMode === 'survival' ? 'SURVIVAL' : gameMode.toUpperCase();
    const multiNotice = monsters.length > 1 ? '<br><span style="color:#ffb0b0">Multiple monsters — open roster</span>' : '';
    document.getElementById('mutations').innerHTML = `<span style="color:${titleColor}">${title}</span> <br> ${modeText} · Mutations: ${mText}${multiNotice}`;
    const toggle = document.getElementById('monsterRosterToggle');
    const roster = document.getElementById('monsterRoster');
    if (monsters.length > 1) {
        toggle.style.display = 'block';
        roster.innerHTML = monsters.map((enemy, index) => `${index + 1}. <b style="color:${enemy.textColor}">${enemy.name}</b><br><span>${enemy.activeMutations.length ? enemy.activeMutations.join(', ') : 'No mutations'}</span>`).join('<hr>');
    } else { toggle.style.display = 'none'; roster.style.display = 'none'; }
}

function toggleMonsterRoster() {
    const roster = document.getElementById('monsterRoster');
    const expanded = roster.style.display === 'block';
    roster.style.display = expanded ? 'none' : 'block';
    document.getElementById('monsterRosterToggle').textContent = expanded ? 'MONSTERS ▾' : 'MONSTERS ▴';
}

function moveEntity(ent, dx, dy) {
    ent.x += dx; if (checkWall(ent)) ent.x -= dx;
    ent.y += dy; if (checkWall(ent)) ent.y -= dy;
}

function checkWall(ent) {
    let mc = Math.floor((ent.x - ent.r) / TS), xc = Math.floor((ent.x + ent.r) / TS);
    let mr = Math.floor((ent.y - ent.r) / TS), xr = Math.floor((ent.y + ent.r) / TS);
    for (let r = mr; r <= xr; r++) {
        for (let c = mc; c <= xc; c++) {
            // BOUNDARY FIX: Ensure checking completely stops entity from escaping array bounds.
            if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return true;
            if (map[r][c] === 1 || isDynamicBlockedCell(c, r)) return true;
        }
    }
    return false;
}

function getLineOfSight(x1, y1, x2, y2) {
    let dist = Math.hypot(x2 - x1, y2 - y1), steps = dist / 5;
    if (steps === 0) return true;
    let dx = (x2 - x1) / steps, dy = (y2 - y1) / steps;
    let cx = x1, cy = y1;
    for (let i = 0; i < steps; i++) {
        cx += dx; cy += dy;
        let mapC = Math.floor(cx / TS), mapR = Math.floor(cy / TS);
        if (mapR >= 0 && mapR < ROWS && mapC >= 0 && mapC < COLS) {
            if (map[mapR][mapC] === 1 || isDynamicBlockedCell(mapC, mapR)) return false;
        } else return false;
    }
    return true;
}

function findPath(sc, sr, tc, tr) {
    // Fast breadth-first search. The old version copied a full path for every
    // queued cell, which became extremely expensive with multiple monsters.
    if (sc < 0 || sc >= COLS || sr < 0 || sr >= ROWS || tc < 0 || tc >= COLS || tr < 0 || tr >= ROWS) return [];
    if (map[tr][tc] === 1 || isDynamicBlockedCell(tc, tr)) return [];

    const queue = [{ c: sc, r: sr }];
    let queueIndex = 0;
    let visited = Array.from({length: ROWS}, () => Array(COLS).fill(false));
    let parent = Array.from({length: ROWS}, () => Array(COLS).fill(null));
    visited[sr][sc] = true;
    let dirs = [[0,1], [1,0], [0,-1], [-1,0]];
    while(queueIndex < queue.length) {
        let curr = queue[queueIndex++];
        if (curr.c === tc && curr.r === tr) break;
        for (let d of dirs) {
            let nc = curr.c + d[0], nr = curr.r + d[1];
            if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && map[nr][nc] === 0 && !isDynamicBlockedCell(nc, nr) && !visited[nr][nc]) {
                visited[nr][nc] = true;
                parent[nr][nc] = curr;
                queue.push({ c: nc, r: nr });
            }
        }
    }
    if (!visited[tr][tc]) return [];
    const path = [];
    let cursor = { c: tc, r: tr };
    while (cursor.c !== sc || cursor.r !== sr) {
        path.unshift(cursor);
        cursor = parent[cursor.r][cursor.c];
        if (!cursor) return [];
    }
    return path;
}

function moveMonsterAlongPath(spd, enemy = monster) {
    if (enemy.path.length > 0) {
        let target = enemy.path[0], tx = target.c * TS + TS/2, ty = target.r * TS + TS/2;
        if (Math.hypot(tx - enemy.x, ty - enemy.y) < spd) {
            enemy.x = tx; enemy.y = ty; enemy.path.shift();
        } else {
            let ang = Math.atan2(ty - enemy.y, tx - enemy.x);
            moveEntity(enemy, Math.cos(ang) * spd, Math.sin(ang) * spd);
        }
    }
}

function getMonsterSpeed(enemy = monster) {
    return enemy.speed * (player.crouching ? 0.55 : 1);
}

function updateExtraMonsters() {
    for (const enemy of monsters.slice(1)) {
        triggerBearTrap(enemy);
        if (enemy.stunTimer > 0) { enemy.stunTimer--; continue; }
        const protectedPlayer = player.hidden || isSafeRoom(player.x, player.y);
        const sawHide = player.hidden && player.hideCompromised;
        const tracksBlood = !protectedPlayer && enemy.name === 'MALAKAI' && enemy.bloodHuntTimer > 0;
        const tracksHeat = !protectedPlayer && enemy.name === 'AESON' && enemy.heatAlertTimer > 0;
        const alliedSight = monsters.some(other => other !== enemy && !player.hidden && !isSafeRoom(player.x, player.y) && (monsterCanSeeUnhiddenPlayer(other) || (other.name === 'AESON' && player.heat > 120)));
        const tracksPlayer = !protectedPlayer && (emergencyTimer > 0 || enemy.allSeeing || alliedSight || monsterCanSeeUnhiddenPlayer(enemy) || (enemy.name === 'AESON' && player.heat > 120));
        let targetC, targetR;
        if (sawHide) {
            targetC = Math.floor(player.x / TS); targetR = Math.floor(player.y / TS);
        } else if (state === 3) {
            const far = floors.reduce((best, tile) => Math.hypot(tile.c * TS - player.x, tile.r * TS - player.y) > Math.hypot(best.c * TS - player.x, best.r * TS - player.y) ? tile : best, floors[0]);
            targetC = far.c; targetR = far.r;
        } else if (tracksBlood) {
            targetC = Math.floor(enemy.bloodHuntX / TS); targetR = Math.floor(enemy.bloodHuntY / TS);
        } else if (tracksHeat) {
            targetC = Math.floor(enemy.heatAlertX / TS); targetR = Math.floor(enemy.heatAlertY / TS);
        } else if (tracksPlayer) {
            targetC = Math.floor(player.x / TS); targetR = Math.floor(player.y / TS);
        } else if (noiseTarget && noiseTimer > 0) {
            targetC = Math.floor(noiseTarget.x / TS); targetR = Math.floor(noiseTarget.y / TS);
        } else if (enemy.path.length === 0) {
            const tile = floors[Math.floor(Math.random() * floors.length)];
            targetC = tile.c; targetR = tile.r;
        }
        if (targetC !== undefined && (enemy.lastTargetC !== targetC || enemy.lastTargetR !== targetR || enemy.path.length === 0)) {
            enemy.path = findPath(Math.floor(enemy.x / TS), Math.floor(enemy.y / TS), targetC, targetR);
            enemy.lastTargetC = targetC; enemy.lastTargetR = targetR;
        }
        moveMonsterAlongPath(getMonsterSpeed(enemy), enemy);
        const touching = Math.hypot(player.x - enemy.x, player.y - enemy.y) < player.r + enemy.r - 2;
        if (state === 1 && (sawHide || (!protectedPlayer && touching))) { endGame(false, enemy); return; }
        if (state === 3 && touching) { endGame(true, enemy); return; }
    }
}

function separateMonsters() {
    for (let i = 0; i < monsters.length; i++) {
        for (let j = i + 1; j < monsters.length; j++) {
            const a = monsters[i], b = monsters[j];
            const dx = b.x - a.x, dy = b.y - a.y, distance = Math.hypot(dx, dy);
            if (distance > 0 && distance < 30) {
                const push = (30 - distance) * 0.5;
                moveEntity(a, -dx / distance * push, -dy / distance * push);
                moveEntity(b, dx / distance * push, dy / distance * push);
            }
        }
    }
}

function update() {
    if (mobileMenuPaused) return;
    if (state !== 1 && state !== 3 && state !== 5 && state !== 6) return;

    if (flashAlpha > 0) flashAlpha -= 0.02;
    ambienceClock++;
    if (jordanSabotageCooldown > 0) jordanSabotageCooldown--;

    for (const generator of generators) {
        if (generator.repairFlash > 0) generator.repairFlash--;
    }

    if (player.breathCooldown > 0) player.breathCooldown--;
    if (player.breathing) {
        player.breathTimer--;
        if (player.breathTimer <= 0) { player.breathing = false; player.breathCooldown = 180; }
    }
    if (player.hidden) {
        player.hideTimer--;
        if (player.hideTimer <= 0) {
            player.hidden = false;
            player.hideCompromised = false;
            if (nearHide) nearHide.occupied = false;
            showMsg('HIDING SPOT EXPIRED', 900);
        }
    }
    if (hallucinationHudTimer > 0) hallucinationHudTimer--;
    for (const enemy of monsters) {
        if (enemy.bloodHuntTimer > 0) enemy.bloodHuntTimer--;
        if (enemy.heatAlertTimer > 0) enemy.heatAlertTimer--;
    }
    for (const trap of bearTraps) trap.life--;
    bearTraps = bearTraps.filter(trap => trap.life > 0);
    for (const zone of heatZones) zone.life--;
    heatZones = heatZones.filter(zone => zone.life > 0);
    updateHeat();
    updateAesonEvents();
    updateRhysEvents();
    updateHotelEvents();
    updateHotelEmployees();
    if (monsters.some(enemy => enemy.hasHallucinations) && state === 1 && Math.random() < 0.0025) {
        hallucinationHudTimer = 120;
        if (Math.random() < 0.3) showMsg('<span style="color:#77ffdd">POWER RESTORED</span>', 700);
        updateHUD();
    }
    if (monsters.some(enemy => enemy.hasFalseObjective) && ambienceClock % 60 === 0) updateHUD();

    if ((state === 1 || state === 3) && eventsEnabled) {
        if (currentMapId !== 'crimson' && powerOutageTimer > 0) {
            powerOutageTimer--;
            if (powerOutageTimer === 0) { powerOutageCooldown = gameMode === 'endless' ? Math.max(600, 1500 - endlessRound * 110) : 1500; showMsg('LIGHTS RESTORED', 800); }
        } else if (currentMapId !== 'crimson' && powerOutageCooldown > 0) powerOutageCooldown--;
        else if (currentMapId !== 'crimson') { powerOutageTimer = 1080 + (gameMode === 'endless' ? (endlessRound - 1) * 90 : 0); outageFlickerTimer = 45; showMsg('<span style="color:#888">POWER OUTAGE</span>', 1000); playSound('emp'); }
        if (outageFlickerTimer > 0) outageFlickerTimer--;
        if (flickerTimer > 0) flickerTimer--;
        else if (flickerCooldown > 0) flickerCooldown--;
        else { flickerTimer = 90 + (gameMode === 'endless' ? (endlessRound - 1) * 12 : 0); flickerCooldown = gameMode === 'endless' ? Math.max(500, 1500 - endlessRound * 100) : 1500; playSound('tick'); }
        if (emergencyTimer > 0) emergencyTimer--;
        else if (currentMapId !== 'crimson' && emergencyCooldown > 0) emergencyCooldown--;
        else if (currentMapId !== 'crimson') { emergencyTimer = 420 + (gameMode === 'endless' ? (endlessRound - 1) * 30 : 0); emergencyCooldown = gameMode === 'endless' ? Math.max(900, 2100 - endlessRound * 120) : 2100; showMsg('<span style="color:#f44">EMERGENCY LIGHTS</span>', 1200); playSound('alarm'); }
        if (noiseTimer > 0) noiseTimer--;
        else noiseTarget = null;
    }

    if (eventsEnabled && monster.name === 'CALEB' && state === 1) {
        if (empActive > 0) {
            empActive--;
        } else if (empWarning > 0) {
            empWarning--;
            if (empWarning <= 0) {
                playSound('emp');
                empActive = 210; 
                empTimer = Math.floor(Math.random() * 900) + 900; 
            }
        } else {
            empTimer--;
            if (empTimer <= 0) {
                empWarning = 60;
                showMsg('<span style="color:#ff0">EMP INCOMING</span>', 1000);
            }
        }
    } else {
        empActive = 0; empWarning = 0;
    }

    if (player.stunTimer > 0) {
        player.stunTimer--;
    } else if (!player.hidden && !hotelDialogueOpen) {
        const heatPenalty = currentMapId === 'boilerworks'
            ? (player.inHeatZone ? 0.48 : 1 - Math.min(0.28, player.heat / 1070))
            : 1;
        const rhysSlow = currentMapId === 'crimson' && [...goopZones, ...rhysPressureZones].some(zone => Math.hypot(player.x - zone.x, player.y - zone.y) < zone.radius);
        const normalSpeed = (player.crouching ? player.baseSpeed * 0.55 : player.baseSpeed) * heatPenalty * (rhysSlow ? 0.62 : 1);
        if (player.boostTimer > 0) {
            player.boostTimer--;
            player.speed = normalSpeed * 1.5;
        } else player.speed = normalSpeed;

        let dx = 0, dy = 0;
        if (keys.w && (state === 1 || state === 3)) dy -= player.speed;
        if (keys.s && (state === 1 || state === 3)) dy += player.speed;
        if (keys.a && (state === 1 || state === 3)) dx -= player.speed;
        if (keys.d && (state === 1 || state === 3)) dx += player.speed;
        if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
        if (dx !== 0 || dy !== 0) moveEntity(player, dx, dy);
    }
    if (state === 1 && !player.hidden && ambienceClock % 3 === 0) {
        playerTrail.push({ x: player.x, y: player.y });
        if (playerTrail.length > 22) playerTrail.shift();
    }

    nearGen = null; nearFuse = null; nearHide = null; nearValve = null; nearBoiler = false; nearEmployee = null; nearElevator = false; nearHotelTask = null; nearRhysSeal = false; nearRhysKey = false; nearRhysChest = false; nearRhysTrap = false;
    if (state === 1 && player.stunTimer <= 0) {
        for (let g of generators) {
            if (!g.active && Math.hypot(player.x - g.x, player.y - g.y) < player.r + g.r + 15) {
                nearGen = g; break;
            }
        }
        nearFuse = fuses.find(fuse => !fuse.collected && Math.hypot(player.x - fuse.x, player.y - fuse.y) < 25) || null;
        nearHide = hidingSpots.find(spot => Math.hypot(player.x - spot.x, player.y - spot.y) < 30) || null;
        nearValve = currentMapId === 'boilerworks' ? coolingValves.find(valve => !valve.active && Math.hypot(player.x - valve.x, player.y - valve.y) < 32) || null : null;
        nearBoiler = currentMapId === 'boilerworks' && centralBoiler && Math.hypot(player.x - centralBoiler.x, player.y - centralBoiler.y) < 42;
        if (currentMapId === 'crimson') {
            nearRhysSeal = Boolean(rhysSeal && Math.hypot(player.x-rhysSeal.x, player.y-rhysSeal.y) < 34);
            nearRhysKey = Boolean(rhysChestKey && Math.hypot(player.x-rhysChestKey.x, player.y-rhysChestKey.y) < 34);
            nearRhysChest = Boolean(rhysChest && Math.hypot(player.x-rhysChest.x, player.y-rhysChest.y) < 38);
            nearRhysTrap = Boolean(rhysTrap && Math.hypot(player.x-rhysTrap.x, player.y-rhysTrap.y) < 44);
        }
        if (currentMapId === 'hotel') {
            nearEmployee = employees.find(employee => !employee.evacuated && Math.hypot(player.x - employee.x, player.y - employee.y) < 34) || null;
            if (monster.name === 'BASSAM' && bassamState === 'disguised' && Math.hypot(player.x - monster.x, player.y - monster.y) < 34) {
                nearEmployee = { x: monster.x, y: monster.y, department: bassamStaffDepartment, isBassam: true };
            }
            const taskEntries = [...employees.map(employee => ({ employee, task: employee.task })), ...(bassamFakeTask ? [{ employee: null, task: bassamFakeTask }] : [])];
            nearHotelTask = taskEntries.find(entry => entry.task?.status === 'accepted' && Math.hypot(player.x - entry.task.x, player.y - entry.task.y) < 34) || null;
            nearElevator = Boolean(hotelElevator && Math.hypot(player.x - hotelElevator.x, player.y - hotelElevator.y) < 44);
        }
    }

    camera.targetZoom = (empActive > 0) ? 1.4 : 1.0;
    camera.zoom += (camera.targetZoom - camera.zoom) * 0.05;
    camera.x = player.x - (canvas.width / (2 * camera.zoom));
    camera.y = player.y - (canvas.height / (2 * camera.zoom));
    camera.x = Math.max(0, Math.min(camera.x, COLS * TS - canvas.width / camera.zoom));
    camera.y = Math.max(0, Math.min(camera.y, ROWS * TS - canvas.height / camera.zoom));

    if (state === 5) {
        if (scDelay > 0) {
            scDelay--;
        } else {
            scNeedle += scSpeed;
            if (scNeedle > Math.PI * 2) scNeedle -= Math.PI * 2; 
        }
    }

    // --- MONSTER AI ---
    // A hiding spot or safe room breaks detection, but never pauses the monster.
    triggerBearTrap(monster);
    if (monster.stunTimer > 0) {
        monster.stunTimer--;
    } else if (state === 1 || state === 3) {
        let canSeePlayer = !player.hidden && !player.breathing && !isSafeRoom(player.x, player.y) && (monsterCanSeeUnhiddenPlayer() || (monster.name === 'AESON' && player.heat > 120));
        let tracksBlood = !player.hidden && !isSafeRoom(player.x, player.y) && monster.name === 'MALAKAI' && monster.bloodHuntTimer > 0;
        let tracksHeat = !player.hidden && !isSafeRoom(player.x, player.y) && monster.name === 'AESON' && monster.heatAlertTimer > 0;
        
        if (state === 1 && player.hidden && player.hideCompromised) {
            // The monster watched the player enter this exact hiding spot.
            const targetC = Math.floor(player.x / TS), targetR = Math.floor(player.y / TS);
            if (monster.lastTargetC !== targetC || monster.lastTargetR !== targetR || monster.path.length === 0) {
                monster.path = findPath(Math.floor(monster.x / TS), Math.floor(monster.y / TS), targetC, targetR);
                monster.lastTargetC = targetC; monster.lastTargetR = targetR;
            }
            moveMonsterAlongPath(getMonsterSpeed());
            if (Math.hypot(player.x - monster.x, player.y - monster.y) < player.r + monster.r + 4) endGame(false);
        } else if (state === 1 && monster.name === 'BASSAM' && currentMapId === 'hotel') {
            if (bassamState === 'disguised') {
                stateTimer--;
                if (bassamAmbushCooldown > 0) bassamAmbushCooldown--;
                if (bassamRevealPending && !isOnPlayerScreen(monster)) {
                    bassamState = 'revealed'; bassamRevealPending = false; bassamAmbushActive = false; monster.path = [];
                    notify('BASSAM DROPPED THE DISGUISE', 'danger'); showMsg('<span style="color:#ff5555">BASSAM FOUND YOU</span>', 1250); updateHUD();
                } else if (bassamFakeTask?.status !== 'accepted' && bassamAmbushCooldown <= 0 && !player.hidden && !isSafeRoom(player.x, player.y) && Math.hypot(player.x - monster.x, player.y - monster.y) < 190 && Math.random() < 0.0012) {
                    bassamState = 'revealed'; bassamAmbushActive = true; bassamLostTimer = 0; monster.path = [];
                    notify('THE EMPLOYEE TURNS TOWARD YOU', 'danger'); showMsg('<span style="color:#ff5555">BASSAM REVEALS HIMSELF</span>', 1000); updateHUD();
                } else {
                    if (stateTimer <= 0) moveBassamToEmployee();
                    moveMonsterAlongPath(1.15, monster);
                }
            } else if (bassamState === 'escaping') {
                moveMonsterAlongPath(getMonsterSpeed(monster) * 1.45, monster);
                if (!isOnPlayerScreen(monster)) {
                    bassamState = 'disguised'; bassamAmbushActive = false; bassamAmbushCooldown = 900; bassamLostTimer = 0; monster.path = []; moveBassamToEmployee(); updateHUD();
                }
            } else if (bassamState === 'roaming') {
                if (monster.path.length === 0) { const tile = floors[Math.floor(Math.random() * floors.length)]; monster.path = findPath(Math.floor(monster.x / TS), Math.floor(monster.y / TS), tile.c, tile.r); }
                moveMonsterAlongPath(getMonsterSpeed(monster));
            } else {
                if (bassamAmbushActive && bassamFakeTask?.status !== 'accepted') {
                    const lost = player.hidden || !monsterCanSeeUnhiddenPlayer(monster) || Math.hypot(player.x - monster.x, player.y - monster.y) > 340;
                    bassamLostTimer = lost ? bassamLostTimer + 1 : 0;
                    if (bassamLostTimer >= 210) {
                        const escapeTiles = floors.filter(tile => Math.hypot(tile.c * TS + TS / 2 - player.x, tile.r * TS + TS / 2 - player.y) > 520);
                        const escape = escapeTiles[Math.floor(Math.random() * Math.max(1, escapeTiles.length))] || floors.at(-1);
                        monster.path = findPath(Math.floor(monster.x / TS), Math.floor(monster.y / TS), escape.c, escape.r);
                        bassamState = 'escaping'; notify('BASSAM VANISHED INTO THE HOTEL', 'warning'); updateHUD(); return;
                    }
                }
                const pC = Math.floor(player.x / TS), pR = Math.floor(player.y / TS);
                if (monster.lastTargetC !== pC || monster.lastTargetR !== pR || monster.path.length === 0) {
                    monster.path = findPath(Math.floor(monster.x / TS), Math.floor(monster.y / TS), pC, pR);
                    monster.lastTargetC = pC; monster.lastTargetR = pR;
                }
                moveMonsterAlongPath(getMonsterSpeed(monster) * 1.08);
                if (!player.hidden && !isSafeRoom(player.x, player.y) && Math.hypot(player.x - monster.x, player.y - monster.y) < player.r + monster.r) endGame(false, monster);
            }
        } else if (state === 1 && monster.name === 'RHYS' && currentMapId === 'crimson') {
            const dashing = updateRhysCombat(canSeePlayer);
            if (!dashing) {
                const target = canSeePlayer ? player : (noiseTarget && noiseTimer > 0 ? noiseTarget : null);
                if (target) {
                    const targetC = Math.floor(target.x / TS), targetR = Math.floor(target.y / TS);
                    if (monster.lastTargetC !== targetC || monster.lastTargetR !== targetR || monster.path.length === 0) {
                        monster.path = findPath(Math.floor(monster.x / TS), Math.floor(monster.y / TS), targetC, targetR);
                        monster.lastTargetC = targetC; monster.lastTargetR = targetR;
                    }
                } else if (monster.path.length === 0) {
                    const tile = floors[Math.floor(Math.random() * floors.length)];
                    monster.path = findPath(Math.floor(monster.x / TS), Math.floor(monster.y / TS), tile.c, tile.r);
                }
                moveMonsterAlongPath(getMonsterSpeed(monster), monster);
            }
            if (rhysTrapArmed && rhysTrap && Math.hypot(monster.x - rhysTrap.x, monster.y - rhysTrap.y) < 26) endGame(true, monster);
            else if (!player.hidden && !isSafeRoom(player.x, player.y) && Math.hypot(player.x - monster.x, player.y - monster.y) < player.r + monster.r) endGame(false, monster);
        } else if (state === 1 && monster.name === 'JORDAN') {
            if (jordanState === 'saboteur') {
                mimicTimer--;
                let targetGen = null;
                if (jordanSabotageCooldown <= 0) {
                    targetGen = generators.find(g => g.active);
                }

                if (targetGen) {
                    let pC = Math.floor(targetGen.x/TS), pR = Math.floor(targetGen.y/TS);
                    if (monster.lastTargetC !== pC || monster.lastTargetR !== pR || monster.path.length === 0) {
                        monster.path = findPath(Math.floor(monster.x/TS), Math.floor(monster.y/TS), pC, pR);
                        monster.lastTargetC = pC; monster.lastTargetR = pR;
                    }
                    moveMonsterAlongPath(getMonsterSpeed());
                    
                    if (Math.hypot(monster.x - targetGen.x, monster.y - targetGen.y) < 10) {
                        targetGen.active = false; activeGens--; 
                        jordanSabotageCooldown = 1800; 
                        showMsg('<span style="color:#0f0">GENERATOR SABOTAGED</span>', 1300);
                        updateHUD(); monster.path = [];
                    }
                } else {
                    if (monster.path.length === 0) {
                        let tile = floors[Math.floor(Math.random() * floors.length)];
                        monster.path = findPath(Math.floor(monster.x/TS), Math.floor(monster.y/TS), tile.c, tile.r);
                    }
                    moveMonsterAlongPath(getMonsterSpeed());
                }
                
                if (mimicTimer <= 0) {
                    let safeTile = floors[Math.floor(Math.random() * floors.length)];
                    let attempts = 0; // INFINITE LOOP PREVENTION
                    while((generators.some(g => Math.abs(g.x - (safeTile.c*TS+TS/2)) < TS && Math.abs(g.y - (safeTile.r*TS+TS/2)) < TS) || isSafeRoom(safeTile.c*TS+TS/2, safeTile.r*TS+TS/2)) && attempts < 50) {
                        safeTile = floors[Math.floor(Math.random() * floors.length)];
                        attempts++;
                    }
                    monster.x = safeTile.c * TS + TS/2; monster.y = safeTile.r * TS + TS/2;
                    jordanState = 'mimic'; stateTimer = 900; monster.path = []; updateHUD();
                }
                
                if (!player.hidden && !isSafeRoom(player.x, player.y) && Math.hypot(player.x - monster.x, player.y - monster.y) < player.r + monster.r) {
                    endGame(false);
                }
            } else if (jordanState === 'mimic') {
                stateTimer--;
                if (stateTimer <= 0) { jordanState = 'saboteur'; mimicTimer = 600; updateHUD(); }
                if (!player.hidden && !isSafeRoom(player.x, player.y) && Math.hypot(player.x - monster.x, player.y - monster.y) < player.r + monster.r + 5) {
                    jordanState = 'stun'; stateTimer = 180; 
                    playSound('fail');
                    showMsg(`<span style='color:red; font-size:30px'>THAT'S NOT A GENERATOR...</span>`, 2500); updateHUD();
                }
            } else if (jordanState === 'stun') {
                stateTimer--;
                if (stateTimer <= 0) { jordanState = 'enrage'; stateTimer = 600; canvas.classList.add('shake'); playSound('emp'); }
            } else if (jordanState === 'enrage') {
                stateTimer--;
                let boostSpeed = monster.baseSpeed * 1.45 * (player.crouching ? 0.55 : 1); 
                let pC = Math.floor(player.x/TS), pR = Math.floor(player.y/TS);
                if (monster.lastTargetC !== pC || monster.lastTargetR !== pR || monster.path.length === 0) {
                    monster.path = findPath(Math.floor(monster.x/TS), Math.floor(monster.y/TS), pC, pR);
                    monster.lastTargetC = pC; monster.lastTargetR = pR;
                }
                moveMonsterAlongPath(boostSpeed);
                
                if (stateTimer <= 0) { jordanState = 'saboteur'; mimicTimer = 600; canvas.classList.remove('shake'); }
                if (!player.hidden && !isSafeRoom(player.x, player.y) && Math.hypot(player.x - monster.x, player.y - monster.y) < player.r + monster.r) {
                    canvas.classList.remove('shake'); endGame(false);
                }
            }
        } 
        else if (state === 1) { // Chase
            if (tracksHeat) {
                const heatC = Math.floor(monster.heatAlertX / TS), heatR = Math.floor(monster.heatAlertY / TS);
                if (monster.lastTargetC !== heatC || monster.lastTargetR !== heatR || monster.path.length === 0) {
                    monster.path = findPath(Math.floor(monster.x / TS), Math.floor(monster.y / TS), heatC, heatR);
                    monster.lastTargetC = heatC; monster.lastTargetR = heatR;
                }
                moveMonsterAlongPath(getMonsterSpeed());
                if (Math.hypot(monster.x - monster.heatAlertX, monster.y - monster.heatAlertY) < 24) monster.heatAlertTimer = 0;
            } else if (monster.isPhantom) {
                let ang = Math.atan2(player.y - monster.y, player.x - monster.x);
                const phantomSpeed = getMonsterSpeed();
                monster.x += Math.cos(ang) * phantomSpeed;
                monster.y += Math.sin(ang) * phantomSpeed;
            } else {
                if (canSeePlayer) {
                    let pC = Math.floor(player.x/TS), pR = Math.floor(player.y/TS);
                    if (monster.lastTargetC !== pC || monster.lastTargetR !== pR || monster.path.length === 0) {
                        monster.path = findPath(Math.floor(monster.x/TS), Math.floor(monster.y/TS), pC, pR);
                        monster.lastTargetC = pC; monster.lastTargetR = pR;
                    }
                    moveMonsterAlongPath(getMonsterSpeed());
                } else {
                    if (tracksBlood) {
                        const bC = Math.floor(monster.bloodHuntX / TS), bR = Math.floor(monster.bloodHuntY / TS);
                        if (monster.lastTargetC !== bC || monster.lastTargetR !== bR || monster.path.length === 0) {
                            monster.path = findPath(Math.floor(monster.x / TS), Math.floor(monster.y / TS), bC, bR);
                            monster.lastTargetC = bC; monster.lastTargetR = bR;
                        }
                        moveMonsterAlongPath(getMonsterSpeed());
                        if (Math.hypot(monster.x - monster.bloodHuntX, monster.y - monster.bloodHuntY) < 22) monster.bloodHuntTimer = 0;
                    } else if (noiseTarget && noiseTimer > 0) {
                        const nC = Math.floor(noiseTarget.x / TS), nR = Math.floor(noiseTarget.y / TS);
                        if (monster.lastTargetC !== nC || monster.lastTargetR !== nR || monster.path.length === 0) {
                            monster.path = findPath(Math.floor(monster.x / TS), Math.floor(monster.y / TS), nC, nR);
                            monster.lastTargetC = nC; monster.lastTargetR = nR;
                        }
                        moveMonsterAlongPath(getMonsterSpeed());
                        if (Math.hypot(monster.x - noiseTarget.x, monster.y - noiseTarget.y) < 18) {
                            noiseTarget = null; noiseTimer = 0;
                        }
                    } else {
                    if (monster.path.length === 0 || (monster.allSeeing && Math.random() < 0.05)) {
                        const tracksPlayer = (monster.allSeeing || emergencyTimer > 0) && !player.breathing && !player.hidden && !isSafeRoom(player.x, player.y);
                        let targetC = tracksPlayer ? Math.floor(player.x/TS) : floors[Math.floor(Math.random() * floors.length)].c;
                        let targetR = tracksPlayer ? Math.floor(player.y/TS) : floors[Math.floor(Math.random() * floors.length)].r;
                        monster.path = findPath(Math.floor(monster.x/TS), Math.floor(monster.y/TS), targetC, targetR);
                    }
                    moveMonsterAlongPath(getMonsterSpeed());
                    }
                }
            }
            if (!player.hidden && !isSafeRoom(player.x, player.y) && Math.hypot(player.x - monster.x, player.y - monster.y) < player.r + monster.r - 2) {
                endGame(false);
            }
        } 
        else if (state === 3) { // Flee
            if (monster.path.length === 0 || canSeePlayer) {
                let bestTile = floors[0], maxDist = 0;
                for (let f of floors) {
                    let d = Math.hypot(f.c*TS - player.x, f.r*TS - player.y);
                    if (d > maxDist) { maxDist = d; bestTile = f; }
                }
                monster.path = findPath(Math.floor(monster.x/TS), Math.floor(monster.y/TS), bestTile.c, bestTile.r);
            }
            moveMonsterAlongPath(getMonsterSpeed());
            
            if (Math.hypot(player.x - monster.x, player.y - monster.y) < player.r + monster.r - 2) {
                endGame(true);
            }
        }
    }
    if (state === 1 || state === 3) { updateExtraMonsters(); separateMonsters(); }
}

function draw() {
    if (state === 0 || state === 4) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x - canvas.width/2, -camera.y - canvas.height/2);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (map[r][c] === 1) {
                ctx.fillStyle = currentMapId === 'boilerworks' ? '#171a1d' : currentMapId === 'hotel' ? '#211a20' : currentMapId === 'crimson' ? '#241012' : '#2d2216'; ctx.fillRect(c * TS, r * TS, TS, TS);
                if (!setOptimization) { ctx.strokeStyle = currentMapId === 'boilerworks' ? '#0b0d0f' : currentMapId === 'hotel' ? '#0e0a10' : currentMapId === 'crimson' ? '#100506' : '#181109'; ctx.strokeRect(c * TS, r * TS, TS, TS); }
            } else {
                ctx.fillStyle = currentMapId === 'boilerworks' ? '#4b4540' : currentMapId === 'hotel' ? ((r + c) % 2 ? '#5b4850' : '#65505a') : currentMapId === 'crimson' ? ((r + c) % 2 ? '#6f2429' : '#7d2b30') : '#8b7355'; ctx.fillRect(c * TS, r * TS, TS, TS);
                if (!setOptimization && currentMapId === 'boilerworks' && (r + c) % 7 === 0) {
                    ctx.fillStyle = 'rgba(180,120,55,0.2)'; ctx.fillRect(c * TS + 5, r * TS + 7, TS - 10, 3);
                }
                if (!setOptimization && currentMapId === 'hotel' && r % 3 === 0) { ctx.fillStyle = 'rgba(220,190,180,0.08)'; ctx.fillRect(c * TS + 4, r * TS + 18, TS - 8, 2); }
            }
        }
    }

    for (const room of rooms) {
        const roomColor = currentMapId === 'boilerworks'
            ? (room.type === 'boiler' ? 'rgba(255,80,20,0.3)' : room.type === 'maintenance' ? 'rgba(80,180,220,0.22)' : room.type === 'cooling' ? 'rgba(40,190,220,0.2)' : room.type === 'control' ? 'rgba(160,100,220,0.2)' : room.type === 'storage' ? 'rgba(180,180,180,0.16)' : 'rgba(160,100,50,0.18)')
            : currentMapId === 'hotel'
                ? ({ lobby:'rgba(190,150,90,0.34)', guest:'rgba(125,90,125,0.24)', laundry:'rgba(80,180,210,0.24)', conference:'rgba(180,140,60,0.25)', kitchen:'rgba(200,100,60,0.24)', service:'rgba(80,150,105,0.24)', office:'rgba(120,100,180,0.24)', elevator:'rgba(210,210,220,0.3)', storage:'rgba(140,140,140,0.2)' }[room.type] || 'rgba(90,70,90,0.22)')
                : currentMapId === 'crimson'
                    ? ({ intake:'rgba(180,80,55,.24)', archive:'rgba(140,35,48,.28)', medical:'rgba(170,95,95,.25)', storage:'rgba(110,80,65,.27)', processing:'rgba(215,145,48,.22)', security:'rgba(90,110,145,.26)', maintenance:'rgba(150,130,55,.25)', containment:'rgba(205,55,45,.31)', vault:'rgba(150,35,65,.32)', service:'rgba(105,65,70,.24)', trap:'rgba(240,200,70,.24)' }[room.type] || 'rgba(120,35,45,.22)')
                : (room.type === 'safe' ? 'rgba(40,110,255,0.28)' : room.type === 'maintenance' ? 'rgba(255,190,40,0.22)' : room.type === 'storage' ? 'rgba(180,180,180,0.16)' : 'rgba(80,80,80,0.14)');
        ctx.fillStyle = roomColor;
        const roomWidth = room.width || 3, roomHeight = room.height || 3;
        ctx.fillRect((room.c - Math.floor(roomWidth / 2)) * TS, (room.r - Math.floor(roomHeight / 2)) * TS, TS * roomWidth, TS * roomHeight);
        ctx.strokeStyle = room.type === 'safe' ? '#5790ff' : currentMapId === 'boilerworks' && room.type === 'boiler' ? '#ff6622' : currentMapId === 'hotel' && room.type === 'elevator' ? '#e7e7ff' : 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect((room.c - Math.floor(roomWidth / 2)) * TS, (room.r - Math.floor(roomHeight / 2)) * TS, TS * roomWidth, TS * roomHeight);
        ctx.fillStyle = room.type === 'safe' ? '#9fc0ff' : currentMapId === 'boilerworks' && room.type === 'boiler' ? '#ff9a66' : currentMapId === 'hotel' ? '#f1d9c4' : currentMapId === 'crimson' ? '#ffd0ad' : '#ddd';
        ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center';
        ctx.fillText(room.type.toUpperCase(), room.x, room.y - 24);
    }

    for (const employee of employees) {
        if (employee.evacuated) continue;
        const x = employee.x, y = employee.y;
        ctx.fillStyle = '#d4c09a';
        ctx.fillRect(x - 9, y - 14, 18, 28);
        ctx.fillStyle = '#f0d5b5'; ctx.beginPath(); ctx.arc(x, y - 19, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.fillRect(x - 4, y - 6, 8, 6);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'center'; ctx.fillText(employee.department, x, y - 30);
        if (nearEmployee === employee && state === 1) {
            ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Arial'; ctx.fillText('[E] TALK', x, y + 28);
        }
    }

    if (monster.name === 'BASSAM' && bassamState === 'disguised' && state !== 3) {
        ctx.fillStyle = '#d4c09a'; ctx.fillRect(monster.x - 9, monster.y - 14, 18, 28);
        ctx.fillStyle = '#f0d5b5'; ctx.beginPath(); ctx.arc(monster.x, monster.y - 19, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.fillRect(monster.x - 4, monster.y - 6, 8, 6);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'center'; ctx.fillText(bassamStaffDepartment, monster.x, monster.y - 30);
        if (nearEmployee?.isBassam && state === 1) { ctx.font = 'bold 11px Arial'; ctx.fillText('[E] TALK', monster.x, monster.y + 28); }
    }

    const visibleHotelTasks = [...employees.map(employee => employee.task), bassamFakeTask].filter(task => task?.status === 'accepted');
    for (const task of visibleHotelTasks) {
        ctx.fillStyle = '#d4c09a'; ctx.fillRect(task.x - 10, task.y - 8, 20, 16);
        ctx.strokeStyle = '#271b1b'; ctx.lineWidth = 2; ctx.strokeRect(task.x - 10, task.y - 8, 20, 16);
        ctx.fillStyle = '#fff2c8'; ctx.fillRect(task.x - 5, task.y - 4, 10, 8);
        ctx.fillStyle = '#f1d9c4'; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'center'; ctx.fillText(task.itemName, task.x, task.y - 15);
        if (nearHotelTask?.task === task) { ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Arial'; ctx.fillText('[E] COLLECT', task.x, task.y + 22); }
    }

    if (currentMapId === 'hotel' && hotelElevator) {
        ctx.fillStyle = hotelElevatorReady() ? '#e9e9ff' : '#666078';
        ctx.fillRect(hotelElevator.x - 20, hotelElevator.y - 25, 40, 50);
        ctx.strokeStyle = '#201a2a'; ctx.lineWidth = 3; ctx.strokeRect(hotelElevator.x - 20, hotelElevator.y - 25, 40, 50);
        ctx.fillStyle = '#201a2a'; ctx.fillRect(hotelElevator.x - 2, hotelElevator.y - 18, 4, 36);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center'; ctx.fillText('ELEVATOR', hotelElevator.x, hotelElevator.y - 32);
        if (nearElevator && state === 1) ctx.fillText('[E] EVACUATE', hotelElevator.x, hotelElevator.y + 38);
    }

    if (hotelLockdownActive && hotelBlockedDoor?.cells) {
        ctx.fillStyle = 'rgba(160,20,30,0.8)';
        for (const cell of hotelBlockedDoor.cells) ctx.fillRect(cell.c * TS - 2, cell.r * TS - 2, TS + 4, TS + 4);
        const first = hotelBlockedDoor.cells[0];
        ctx.fillStyle = '#ffd0d0'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center'; ctx.fillText('LOCKDOWN', first.c * TS + TS / 2, first.r * TS - 8);
    }

    for (const fuse of fuses) {
        if (fuse.collected) continue;
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(fuse.x - 4, fuse.y - 8, 8, 16);
        ctx.fillStyle = '#fff4a0';
        ctx.fillRect(fuse.x - 2, fuse.y - 6, 4, 4);
    }

    for (const valve of coolingValves) {
        ctx.save();
        ctx.translate(valve.x, valve.y);
        ctx.fillStyle = valve.active ? '#48dfff' : '#276b7a';
        ctx.strokeStyle = valve.active ? '#d8fbff' : '#111';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.moveTo(0, -8); ctx.lineTo(0, 8); ctx.stroke();
        if (!valve.active && nearValve === valve && state === 1) {
            ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center'; ctx.fillText('[E] VALVE', 0, -18);
        }
        ctx.restore();
    }

    if (centralBoiler) {
        ctx.fillStyle = boilerShutdown ? '#226b70' : '#a53d20';
        ctx.strokeStyle = '#160b08'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(centralBoiler.x, centralBoiler.y, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffd0a0'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center';
        ctx.fillText(boilerShutdown ? 'OFFLINE' : 'BOILER', centralBoiler.x, centralBoiler.y + 4);
        if (nearBoiler && state === 1) {
            ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Arial';
            ctx.fillText('[E] SHUT DOWN', centralBoiler.x, centralBoiler.y - 25);
        }
    }

    if (currentMapId === 'crimson') {
        if (rhysBreakWall && !rhysBreakWall.broken) {
            ctx.fillStyle = '#4b1215'; ctx.fillRect(rhysBreakWall.x - 20, rhysBreakWall.y - 20, 40, 40);
            ctx.strokeStyle = '#f0c55e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(rhysBreakWall.x - 12, rhysBreakWall.y - 14); ctx.lineTo(rhysBreakWall.x + 8, rhysBreakWall.y + 12); ctx.moveTo(rhysBreakWall.x + 10, rhysBreakWall.y - 12); ctx.lineTo(rhysBreakWall.x - 7, rhysBreakWall.y + 14); ctx.stroke();
            ctx.fillStyle = '#ffe69a'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center'; ctx.fillText('CRACKED WALL', rhysBreakWall.x, rhysBreakWall.y - 28);
        }
        if (rhysChestKey && !rhysChestKey.collected) {
            ctx.fillStyle = '#f5db58'; ctx.fillRect(rhysChestKey.x - 10, rhysChestKey.y - 4, 16, 8); ctx.beginPath(); ctx.arc(rhysChestKey.x - 10, rhysChestKey.y, 6, 0, Math.PI * 2); ctx.strokeStyle = '#fff1a0'; ctx.lineWidth = 2; ctx.stroke();
            if (nearRhysKey) { ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Arial'; ctx.fillText('[E] TAKE KEY', rhysChestKey.x, rhysChestKey.y - 16); }
        }
        if (rhysChest && !rhysChest.opened) {
            ctx.fillStyle = '#662b17'; ctx.fillRect(rhysChest.x - 15, rhysChest.y - 11, 30, 22); ctx.strokeStyle = '#e3b34f'; ctx.lineWidth = 3; ctx.strokeRect(rhysChest.x - 15, rhysChest.y - 11, 30, 22);
            if (nearRhysChest) { ctx.fillStyle = rhysChestKey?.collected ? '#fff' : '#ffb3a3'; ctx.font = 'bold 11px Arial'; ctx.fillText(rhysChestKey?.collected ? '[E] OPEN CHEST' : 'KEY REQUIRED', rhysChest.x, rhysChest.y - 20); }
        }
        if (rhysSeal && !rhysSeal.collected) {
            ctx.strokeStyle = rhysSeal.accessible ? '#ffe55c' : '#8c3339'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(rhysSeal.x, rhysSeal.y, 15 + Math.sin(ambienceClock * .12) * 2, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = rhysSeal.accessible ? '#fff5a8' : '#64252a'; ctx.beginPath(); ctx.arc(rhysSeal.x, rhysSeal.y, 7, 0, Math.PI * 2); ctx.fill();
            if (nearRhysSeal) { ctx.fillStyle = rhysSeal.accessible ? '#fff' : '#ffb3a3'; ctx.font = 'bold 11px Arial'; ctx.fillText(rhysSeal.accessible ? '[E] RECOVER SEAL' : 'ROUTE LOCKED', rhysSeal.x, rhysSeal.y - 25); }
        }
        if (rhysTrap) {
            ctx.strokeStyle = rhysTrapArmed ? '#84ff8b' : '#e7c86b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(rhysTrap.x, rhysTrap.y, 18, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = rhysTrapArmed ? 'rgba(80,255,120,.3)' : 'rgba(255,210,80,.18)'; ctx.beginPath(); ctx.arc(rhysTrap.x, rhysTrap.y, 12, 0, Math.PI * 2); ctx.fill();
            if (nearRhysTrap) { ctx.fillStyle = rhysSealCollected && !rhysTrapArmed ? '#fff' : '#ffdb8a'; ctx.font = 'bold 11px Arial'; ctx.fillText(rhysTrapArmed ? 'TRAP ARMED' : rhysSealCollected ? '[E] ARM TRAP' : 'SEAL REQUIRED', rhysTrap.x, rhysTrap.y - 28); }
        }
    }

    for (const spot of hidingSpots) {
        ctx.fillStyle = spot.occupied ? '#552200' : '#8c4d20';
        ctx.fillRect(spot.x - 12, spot.y - 17, 24, 34);
        ctx.strokeStyle = '#1b0d05'; ctx.strokeRect(spot.x - 12, spot.y - 17, 24, 34);
        ctx.fillStyle = '#ffb060'; ctx.fillRect(spot.x + 5, spot.y - 2, 3, 3);
    }

    if (noiseTarget && noiseTimer > 0) {
        const pulse = 14 + Math.sin(ambienceClock * 0.18) * 5;
        ctx.beginPath(); ctx.arc(noiseTarget.x, noiseTarget.y, pulse, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,102,204,0.7)'; ctx.lineWidth = 3; ctx.stroke();
    }

    for (const trap of bearTraps) {
        ctx.save();
        ctx.translate(trap.x, trap.y);
        ctx.fillStyle = trap.triggered ? '#ddd' : '#777';
        ctx.strokeStyle = '#222'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.moveTo(0, -8); ctx.lineTo(0, 8); ctx.stroke();
        ctx.restore();
    }

    for (const zone of heatZones) {
        const pulse = 0.28 + Math.sin(ambienceClock * 0.12 + zone.x) * 0.06;
        ctx.fillStyle = `rgba(255, 70, 0, ${Math.max(0.12, pulse)})`;
        ctx.beginPath(); ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,190,60,0.95)'; ctx.lineWidth = 4; ctx.stroke();
        for (let flame = 0; flame < (setOptimization ? 2 : 5); flame++) {
            const angle = ambienceClock * 0.02 + flame * 1.25;
            const fx = zone.x + Math.cos(angle) * (zone.radius * 0.65);
            const fy = zone.y + Math.sin(angle) * (zone.radius * 0.65);
            ctx.fillStyle = 'rgba(255,220,100,0.82)';
            ctx.beginPath(); ctx.arc(fx, fy, 5 + (flame % 2) * 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#ffe0a0'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
        ctx.fillText('BURNING', zone.x, zone.y - zone.radius - 7);
    }

    for (const zone of rhysPressureZones) {
        ctx.fillStyle = 'rgba(255,220,120,.14)'; ctx.beginPath(); ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,238,170,.7)'; ctx.lineWidth = 2; ctx.stroke();
    }
    for (const zone of goopZones) {
        ctx.fillStyle = 'rgba(205,185,45,.34)'; ctx.beginPath(); ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,238,100,.8)'; ctx.lineWidth = 2; ctx.stroke();
    }
    for (const shot of goopShots) { ctx.fillStyle = '#e1cf37'; ctx.beginPath(); ctx.arc(shot.x, shot.y, 6, 0, Math.PI * 2); ctx.fill(); }

    if (empWarning > 0) {
        let maxRad = 400;
        let currentRad = (1 - (empWarning / 60)) * maxRad;
        ctx.beginPath();
        ctx.arc(monster.x, monster.y, currentRad, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 0, ${empWarning / 60})`;
        ctx.lineWidth = 10;
        ctx.stroke();
    }

    if (!setOptimization && monster.hasEcho && state === 1 && ambienceClock % 90 < 35) {
        const echoTile = floors[(Math.floor(ambienceClock / 90) * 17) % Math.max(1, floors.length)];
        if (echoTile) {
            ctx.strokeStyle = 'rgba(210,180,255,0.5)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(echoTile.c * TS + TS / 2, echoTile.r * TS + TS / 2, 18 + (ambienceClock % 30), 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = 'rgba(230,220,255,0.7)'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center'; ctx.fillText('ECHO', echoTile.c * TS + TS / 2, echoTile.r * TS + TS / 2 - 24);
        }
    }

    for (let g of generators) {
        if (g.active || g.repairFlash > 0) {
            const glow = g.repairFlash > 0 ? 0.35 + (g.repairFlash / 45) * 0.35 : 0.16;
            const glowRadius = g.repairFlash > 0 ? 34 : 24;
            const gradient = ctx.createRadialGradient(g.x, g.y, 4, g.x, g.y, glowRadius);
            gradient.addColorStop(0, `rgba(0,255,80,${glow})`);
            gradient.addColorStop(1, 'rgba(0,255,80,0)');
            ctx.fillStyle = gradient;
            ctx.beginPath(); ctx.arc(g.x, g.y, glowRadius, 0, Math.PI * 2); ctx.fill();
        }
        const generatorColor = g.active ? '#0f0' : g.isFalse ? '#9a8060' : g.type === 'fuse' ? '#ffcc00' : g.type === 'multi' ? '#ff8c3a' : '#888';
        ctx.fillStyle = generatorColor;
        ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = g.active ? '#031' : g.type === 'fuse' ? '#5a4300' : g.type === 'multi' ? '#5a2500' : '#222';
        ctx.fillRect(g.x - 3, g.y - 8, 6, 16);
        ctx.fillStyle = g.active ? '#afffb0' : '#aaa';
        ctx.beginPath(); ctx.arc(g.x, g.y - 2, 2, 0, Math.PI * 2); ctx.fill();
        if (!g.active && g.isFalse) {
            // Deliberately subtle: a small offset amber status light, not a giveaway label.
            ctx.fillStyle = '#c9872a';
            ctx.fillRect(g.x + 7, g.y - 10, 5, 5);
            ctx.fillStyle = '#ffe08a';
            ctx.fillRect(g.x + 8, g.y - 9, 2, 2);
        } else if (!g.active && g.type === 'fuse') {
            ctx.fillStyle = '#fff0a0'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center';
            ctx.fillText(`${g.collectedFuses}/${g.requiredFuses} FUSE`, g.x, g.y + 24);
        } else if (!g.active && g.type === 'multi') {
            ctx.fillStyle = '#ffbb80'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center';
            ctx.fillText(`${g.stage}/${g.requiredStages} STAGES`, g.x, g.y + 24);
        }
        
        if (state === 1 && nearGen === g && player.stunTimer <= 0) {
            ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
            ctx.fillText("[E]", g.x, g.y - 18);
        }
    }

    if (nearFuse && state === 1) {
        ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
        ctx.fillText('[E] FUSE', nearFuse.x, nearFuse.y - 14);
    }
    if (nearHide && state === 1 && !player.hidden) {
        ctx.fillStyle = '#ffb060'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
        ctx.fillText('[H] HIDE', nearHide.x, nearHide.y - 22);
    }
    const nearbyRoom = getRoomAt(player.x, player.y);
    if (nearbyRoom?.type === 'maintenance' && state === 1 && powerOutageTimer > 0) {
        ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
        ctx.fillText('[E] POWER PANEL', nearbyRoom.x, nearbyRoom.y + 42);
    }

    if (!setOptimization && monster.hasHallucinations && state === 1 && !player.hidden) {
        // Visual decoys only: hallucinations never collide and never affect monster AI.
        const hallucinationSeed = Math.floor(ambienceClock / 75);
        for (let i = 0; i < 2; i++) {
            const tile = floors[(hallucinationSeed * 17 + i * 31) % Math.max(1, floors.length)];
            if (!tile) continue;
            const hx = tile.c * TS + TS / 2, hy = tile.r * TS + TS / 2;
            if (Math.hypot(hx - player.x, hy - player.y) < 260) {
                ctx.fillStyle = 'rgba(255,255,255,0.18)';
                ctx.beginPath(); ctx.arc(hx, hy, 13, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = 'rgba(255,0,0,0.35)'; ctx.font = 'bold 9px Arial'; ctx.fillText('?', hx, hy - 18);
            }
        }
        const fakeTile = floors[(hallucinationSeed * 43 + 9) % Math.max(1, floors.length)];
        if (fakeTile) {
            const fx = fakeTile.c * TS + TS / 2, fy = fakeTile.r * TS + TS / 2;
            if (Math.hypot(fx - player.x, fy - player.y) < 300) {
                ctx.globalAlpha = 0.45;
                ctx.fillStyle = '#00ff99'; ctx.beginPath(); ctx.arc(fx, fy, 12, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#afffb0'; ctx.font = 'bold 9px Arial'; ctx.fillText('ONLINE', fx, fy + 24);
                ctx.globalAlpha = 1;
            }
        }
    }

    let dist = Math.hypot(player.x - monster.x, player.y - monster.y);
    if (!setOptimization && monster.hasAfterimage && state === 1 && monster.path.length > 0) {
        const previous = monster.path[0];
        const ax = previous.c * TS + TS / 2, ay = previous.r * TS + TS / 2;
        ctx.fillStyle = 'rgba(255,255,255,0.13)';
        ctx.beginPath(); ctx.arc(ax, ay, monster.drawRadius * 0.8, 0, Math.PI * 2); ctx.fill();
    }
    if (!(monster.name === 'BASSAM' && bassamState === 'disguised' && state !== 3)) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath(); ctx.ellipse(monster.x, monster.y + monster.drawRadius * 0.65, monster.drawRadius * 0.9, monster.drawRadius * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (monster.name === 'BASSAM' && bassamState === 'disguised' && state !== 3) {
        // The matching employee sprite was drawn above; the disguise must not
        // reveal Bassam until the player interacts with him.
    } else if (monster.name === 'JORDAN' && jordanState === 'mimic' && state !== 3) {
        ctx.fillStyle = '#888';
        ctx.beginPath(); ctx.arc(monster.x, monster.y, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#222';
        ctx.fillRect(monster.x - 3, monster.y - 8, 6, 16);
        ctx.fillStyle = '#aaa';
        ctx.beginPath(); ctx.arc(monster.x, monster.y - 2, 2, 0, Math.PI * 2); ctx.fill();
    } else if (!monster.isPhantom || dist < 200 || state === 3) {
        ctx.fillStyle = monster.stunTimer > 0 ? '#fff' : (state === 3 ? '#555' : monster.color); 
        ctx.beginPath(); ctx.arc(monster.x, monster.y, monster.drawRadius, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = state === 3 ? 'black' : monster.textColor;
        ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
        ctx.fillText(monster.name, monster.x, monster.y - monster.drawRadius - 5);
        if (state !== 3 && monster.stunTimer <= 0) {
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(monster.x - monster.drawRadius * 0.3, monster.y - 2, 2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(monster.x + monster.drawRadius * 0.3, monster.y - 2, 2, 0, Math.PI * 2); ctx.fill();
        }
    }

    for (const enemy of monsters.slice(1)) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath(); ctx.ellipse(enemy.x, enemy.y + enemy.drawRadius * 0.65, enemy.drawRadius * 0.9, enemy.drawRadius * 0.35, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = enemy.stunTimer > 0 ? '#fff' : (state === 3 ? '#555' : enemy.color);
        ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.drawRadius, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = state === 3 ? '#000' : enemy.textColor;
        ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center';
        ctx.fillText(enemy.name, enemy.x, enemy.y - enemy.drawRadius - 5);
        if (state !== 3 && enemy.stunTimer <= 0) {
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(enemy.x - enemy.drawRadius * 0.3, enemy.y - 2, 2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(enemy.x + enemy.drawRadius * 0.3, enemy.y - 2, 2, 0, Math.PI * 2); ctx.fill();
        }
    }

    if (!player.hidden) {
        const playerColors = { blue:'#00f', crimson:'#d22', violet:'#a64dff', green:'#19c76b', amber:'#e7a21a', gold:'#e9ca35' };
        if (cosmetics.trail !== 'none') {
            const trailColor = cosmetics.trail === 'spark' ? 'rgba(255,215,80,.64)' : cosmetics.trail === 'ember' ? 'rgba(255,104,42,.62)' : 'rgba(180,210,255,.42)';
            ctx.strokeStyle = trailColor; ctx.lineWidth = cosmetics.trail === 'ghost' ? 10 : 6; ctx.lineCap = 'round'; ctx.beginPath();
            playerTrail.forEach((point, index) => { if (index === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y); }); ctx.stroke();
            const spacing = cosmetics.trail === 'spark' ? 3 : 5;
            for (let index = 0; index < playerTrail.length; index += spacing) { const point = playerTrail[index]; ctx.globalAlpha = Math.max(.1, index / playerTrail.length); ctx.fillStyle = trailColor; ctx.beginPath(); ctx.arc(point.x, point.y, cosmetics.trail === 'ghost' ? 5 : 3, 0, Math.PI * 2); ctx.fill(); }
            ctx.globalAlpha = 1;
        }
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath(); ctx.ellipse(player.x, player.y + player.r * 0.7, player.r * 0.9, player.r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = player.boostTimer > 0 ? '#0ff' : (player.stunTimer > 0 ? '#ff0' : (playerColors[cosmetics.color] || '#00f'));
        ctx.beginPath(); ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    if (currentMapId === 'crimson' && rhysSweepTimer > 0) {
        const centerX = (COLS * TS) / 2, centerY = (ROWS * TS) / 2;
        const screenX = canvas.width / 2 + (centerX - camera.x - canvas.width / 2) * camera.zoom;
        const screenY = canvas.height / 2 + (centerY - camera.y - canvas.height / 2) * camera.zoom;
        ctx.strokeStyle = `rgba(255,235,150,${Math.min(.9, rhysSweepTimer / 100)})`;
        ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(screenX, screenY, rhysSweepRadius * camera.zoom, 0, Math.PI * 2); ctx.stroke();
    }

    if (state === 1 || state === 2 || state === 3 || state === 5 || state === 6) {
        if (empActive > 0) {
            let grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 20, canvas.width/2, canvas.height/2, 250);
            grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,0.98)');
            ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            let darkness = monster.hasGloom ? 0.85 : 0.55;
            if (powerOutageTimer > 0) darkness = Math.min(0.92, darkness + 0.25);
            if (outageFlickerTimer > 0 && ambienceClock % 6 < 3) darkness = Math.max(0.05, darkness - 0.42);
            if (flickerTimer > 0 && ambienceClock % 8 < 4) darkness = Math.max(0, darkness - 0.25);
            ctx.fillStyle = `rgba(0, 0, 0, ${darkness})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    if (emergencyTimer > 0) {
        ctx.fillStyle = `rgba(150,0,0,${0.13 + Math.sin(ambienceClock * 0.35) * 0.04})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const worldToScreen = (x, y) => [canvas.width / 2 + (x - camera.x - canvas.width / 2) * camera.zoom, canvas.height / 2 + (y - camera.y - canvas.height / 2) * camera.zoom];
        const [playerScreenX, playerScreenY] = worldToScreen(player.x, player.y);
        ctx.strokeStyle = '#ff3030'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(playerScreenX, playerScreenY, 22, 0, Math.PI * 2); ctx.stroke();
        for (const enemy of monsters) {
            if (enemy.name === 'BASSAM' && bassamState === 'disguised') continue;
            const [monsterScreenX, monsterScreenY] = worldToScreen(enemy.x, enemy.y);
            ctx.beginPath(); ctx.arc(monsterScreenX, monsterScreenY, enemy.drawRadius + 12, 0, Math.PI * 2); ctx.stroke();
        }
    }

    if (flashAlpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (state === 2) {
        let cx = canvas.width/2, cy = canvas.height/2;
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '24px Arial'; 
        ctx.fillText(`WIRING...`, cx, cy - 40);
        ctx.fillStyle = 'yellow'; ctx.font = '45px Arial'; 
        ctx.fillText(`${puzzleSequence[0].toUpperCase()}`, cx, cy + 20);
    }

    if (state === 6) {
        let cx = canvas.width/2, cy = canvas.height/2;
        ctx.fillStyle = 'rgba(0,0,0,0.72)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffcc00'; ctx.textAlign = 'center'; ctx.font = '24px Arial';
        ctx.fillText(`CIRCUIT REPAIR · STAGE ${circuitStage + 1}/${currentGen.requiredStages}`, cx, cy - 55);
        ctx.fillStyle = '#fff'; ctx.font = '18px Arial'; ctx.fillText('Enter the wire sequence', cx, cy - 20);
        ctx.font = '38px Arial'; ctx.fillText(circuitSequence.map(key => key.toUpperCase()).join('  '), cx, cy + 35);
        ctx.font = '16px Arial'; ctx.fillText('Use the W A S D buttons', cx, cy + 78);
    }

    if (state === 5) {
        let cx = canvas.width/2, cy = canvas.height/2, r = 100;
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 25; ctx.stroke();
        
        ctx.beginPath(); ctx.arc(cx, cy, r, scZoneStart, scZoneEnd);
        ctx.strokeStyle = '#0f0'; ctx.lineWidth = 25; ctx.stroke();

        ctx.beginPath(); ctx.moveTo(cx, cy);
        if (scDelay <= 0) {
            ctx.lineTo(cx + Math.cos(scNeedle)*r, cy + Math.sin(scNeedle)*r);
        } else {
            ctx.lineTo(cx + Math.cos(0)*r, cy + Math.sin(0)*r); 
        }
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke();

        ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
        ctx.font = '24px Arial'; ctx.fillText(`Hits: ${scHits} / ${scRequired}`, cx, cy - 140);
        ctx.font = '18px Arial';
        ctx.fillText(window.matchMedia?.('(pointer: coarse), (max-width: 700px)').matches ? 'TAP SKILL CHECK IN THE GREEN ZONE' : 'Press SPACE in the Green Zone', cx, cy + 140);
    }
}

function loop(timestamp) {
    if (setFPS) {
        if (timestamp - lastTime >= 1000) {
            document.getElementById('fpsCounter').innerText = `${frames} FPS`;
            frames = 0; lastTime = timestamp;
        }
        frames++;
    }
    if (!lastFrameTime) lastFrameTime = timestamp;
    gameAccumulator += Math.min(100, timestamp - lastFrameTime);
    lastFrameTime = timestamp;
    const fixedStep = 1000 / 60;
    let updatesThisFrame = 0;
    while (gameAccumulator >= fixedStep && updatesThisFrame < 6) {
        update();
        gameAccumulator -= fixedStep;
        updatesThisFrame++;
    }
    if (!setOptimization || timestamp - lastDrawTime >= 33) {
        draw();
        lastDrawTime = timestamp;
    }
    requestAnimationFrame(loop);
}

document.querySelectorAll('#infoVersion, #settingsVersion').forEach(element => element.textContent = GAME_VERSION);
applySettings();
updateMenuData();
requestAnimationFrame(loop);

function mobileKey(key) {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    if (key !== ' ') window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
}

async function toggleFullscreen() {
    try {
        if (!document.documentElement.requestFullscreen) { showMsg('For fullscreen, use<br><b>ADD TO HOME SCREEN</b>', 3000); return; }
        if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
        else await document.exitFullscreen();
    } catch (error) { showMsg('Use <b>PHONE / INSTALL</b><br>for fullscreen mode.', 3000); }
}

function closeMobileActionMenu() {
    document.getElementById('mobileActionMenu').style.display = 'none';
    mobileMenuPaused = false;
}

function openMobileActionMenu(kind) {
    if (state !== 1 && state !== 3) return;
    mobileMenuPaused = true;
    const title = document.getElementById('mobileActionTitle');
    const content = document.getElementById('mobileActionContent');
    document.getElementById('mobileActionMenu').style.display = 'flex';
    if (kind === 'abilities') {
        title.textContent = 'ABILITIES';
        content.innerHTML = `<button onclick="player.crouching=!player.crouching; updateHUD(); closeMobileActionMenu()">${player.crouching ? 'STOP CROUCHING' : 'CROUCH'}</button><button onclick="activateBreath(); closeMobileActionMenu()">HOLD BREATH</button><button onclick="toggleHide(); closeMobileActionMenu()">HIDE / LEAVE HIDING</button><p style="font-size:12px;color:#aaa">Crouching is a toggle on phone. It slows both you and the monsters.</p>`;
    } else if (kind === 'items') {
        title.textContent = 'ITEMS';
        const usable = (type, count) => itemAllowed(type) && count > 0 ? '' : 'disabled';
        content.innerHTML = `<button ${usable('adrenaline', invAdrenaline)} onclick="mobileKey(' '); closeMobileActionMenu()">ADRENALINE (${invAdrenaline})</button><button ${usable('flashbang', invFlashbang)} onclick="mobileKey('f'); closeMobileActionMenu()">FLASHBANG (${invFlashbang})</button><button ${usable('noiseMaker', invNoiseMaker)} onclick="mobileKey('n'); closeMobileActionMenu()">NOISE MAKER (${invNoiseMaker})</button><button ${usable('bearTrap', invBearTrap)} onclick="mobileKey('t'); closeMobileActionMenu()">BEAR TRAP (${invBearTrap})</button><button ${usable('battery', invBattery)} onclick="mobileKey('r'); closeMobileActionMenu()">EMERGENCY BATTERY (${invBattery})</button>`;
    }
}

function updateMobileSkillCheckButton() {
    const button = document.getElementById('touchSkillCheck');
    if (!button) return;
    const active = state === 5;
    button.style.display = active ? 'block' : 'none';
    button.disabled = !active || scDelay > 0;
    button.textContent = scDelay > 0 ? 'READY...' : 'HIT';
}




/* Mobile/PWA support */
(function setupMobileControls() {
    const touchControls = document.getElementById('touchControls');
    const joystick = document.getElementById('joystick');
    const knob = document.getElementById('joystickKnob');
    if (!touchControls || !joystick || !knob) return;

    const movementKeys = ['w', 'a', 's', 'd'];
    let joystickPointerId = null;
    const maxDistance = 39;

    function clearMovement(resetKnob = true) {
        movementKeys.forEach(key => keys[key] = false);
        if (resetKnob) knob.style.transform = 'translate(0px, 0px)';
    }

    function updateJoystick(clientX, clientY) {
        const rect = joystick.getBoundingClientRect();
        let dx = clientX - (rect.left + rect.width / 2);
        let dy = clientY - (rect.top + rect.height / 2);
        const distance = Math.hypot(dx, dy);
        if (distance > maxDistance) {
            dx = dx / distance * maxDistance;
            dy = dy / distance * maxDistance;
        }
        clearMovement();
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
        const deadzone = 12;
        if (Math.hypot(dx, dy) < deadzone) return;
        const horizontalThreshold = maxDistance * 0.28;
        const verticalThreshold = maxDistance * 0.28;
        if (Math.abs(dx) >= horizontalThreshold) keys[dx > 0 ? 'd' : 'a'] = true;
        if (Math.abs(dy) >= verticalThreshold) keys[dy > 0 ? 's' : 'w'] = true;
    }

    joystick.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        joystickPointerId = event.pointerId;
        joystick.setPointerCapture(event.pointerId);
        updateJoystick(event.clientX, event.clientY);
    });
    joystick.addEventListener('pointermove', (event) => {
        if (event.pointerId === joystickPointerId) {
            event.preventDefault();
            updateJoystick(event.clientX, event.clientY);
        }
    });
    const releaseJoystick = (event) => {
        if (event.pointerId === joystickPointerId) {
            event.preventDefault();
            joystickPointerId = null;
            clearMovement();
        }
    };
    joystick.addEventListener('pointerup', releaseJoystick);
    joystick.addEventListener('pointercancel', releaseJoystick);

    function triggerKey(key) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
        if (key !== ' ') window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
    }
    function bindAction(id, key) {
        const button = document.getElementById(id);
        if (!button) return;
        button.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            triggerKey(key);
        });
    }
    function bindHoldAction(id, key) {
        const button = document.getElementById(id);
        if (!button) return;
        const release = (event) => {
            event.preventDefault();
            window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
        };
        button.addEventListener('pointerdown', event => {
            event.preventDefault();
            button.setPointerCapture(event.pointerId);
            window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
        });
        button.addEventListener('pointerup', release);
        button.addEventListener('pointercancel', release);
    }

    bindAction('touchInteract', 'e');
    document.getElementById('touchAbilities')?.addEventListener('pointerdown', event => { event.preventDefault(); openMobileActionMenu('abilities'); });
    document.getElementById('touchItems')?.addEventListener('pointerdown', event => { event.preventDefault(); openMobileActionMenu('items'); });
    document.getElementById('touchSkillCheck')?.addEventListener('pointerdown', event => {
        event.preventDefault();
        if (state === 5 && scDelay <= 0) mobileKey(' ');
    });

    document.querySelectorAll('[data-puzzle-key]').forEach(button => {
        button.addEventListener('pointerdown', event => {
            event.preventDefault();
            triggerKey(button.dataset.puzzleKey);
        });
    });

    const puzzlePad = document.getElementById('touchPuzzle');
    function updatePuzzlePad() {
        if (puzzlePad) puzzlePad.style.display = (state === 2 || state === 6) ? 'grid' : 'none';
        updateMobileSkillCheckButton();
    }
    setInterval(updatePuzzlePad, 100);


document.addEventListener('contextmenu', event => event.preventDefault());
})();

document.addEventListener('pointerover', event => {
    if (event.target.closest('.menu-panel button:not(:disabled)')) playSound('menuHover');
});
document.addEventListener('click', event => {
    const button = event.target.closest('.menu-panel button');
    if (!button) return;
    if (button.disabled) { playSound('fail'); return; }
    playSound(/\bBACK\b/i.test(button.textContent) ? 'menuBack' : 'menuSelect');
});

// Mobile browsers require audio to be created or resumed from a user gesture.
window.addEventListener('pointerdown', () => initAudio(), { passive: true });
window.addEventListener('touchstart', () => initAudio(), { passive: true });
window.addEventListener('touchend', () => initAudio(), { passive: true });
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && audioCtx?.state === 'suspended') audioCtx.resume();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js').then(registration => {
            registration.update();
            const banner = document.getElementById('updateBanner');
            const updateButton = document.getElementById('updateButton');
            const showUpdate = () => { if (banner) banner.style.display = 'flex'; };
            if (registration.waiting) showUpdate();
            registration.addEventListener('updatefound', () => {
                const worker = registration.installing;
                worker?.addEventListener('statechange', () => {
                    if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate();
                });
            });
            updateButton?.addEventListener('click', () => {
                if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                else window.location.reload();
            });
            navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());
        }).catch(() => {
            // The game remains playable if offline caching is unavailable.
        });
    });
}

let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    const installButton = document.getElementById('installButton');
    if (installButton) installButton.style.display = 'block';
});
document.getElementById('installButton')?.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    document.getElementById('installButton').style.display = 'none';
});

window.addEventListener('pagehide', () => saveData());

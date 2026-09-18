

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
    }
}

// Versioned local progress with a backup copy and import/export support.
const GAME_VERSION = '2.0.1';
const SAVE_SCHEMA_VERSION = 6;
const SAVE_KEY = 'br_save_v2';
const SAVE_BACKUP_KEY = 'br_save_backup_v2';

const MAP_DEFINITIONS = {
    level0: { id: 'level0', name: 'LEVEL 0 — THE MAZE', description: 'The original shifting maze.', campaignOrder: 0 },
    boilerworks: { id: 'boilerworks', name: 'LEVEL 3 — THE BOILERWORKS', description: 'Long industrial halls, hot machinery, and Aeson.', campaignOrder: 1 }
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
    const colors = ['blue', 'crimson', 'violet', 'green', 'amber'];
    const trails = ['none', 'spark', 'ghost'];
    const unlocked = Array.isArray(source.unlocked) ? source.unlocked.filter(id => colors.includes(id) || trails.includes(id)) : [];
    return {
        color: colors.includes(source.color) ? source.color : 'blue',
        trail: trails.includes(source.trail) ? source.trail : 'none',
        unlocked: Array.from(new Set(['blue', 'none', ...unlocked]))
    };
}

function normalizeStats(value) {
    const source = value && typeof value === 'object' ? value : {};
    const names = ['CALEB', 'MALAKAI', 'JORDAN', 'AESON'];
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

function selectLoadout(id) {
    if (!LOADOUT_DEFINITIONS[id]) return;
    selectedLoadout = id;
    saveData();
    renderLoadouts();
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
    document.getElementById('volMaster').value = setVolM;
    document.getElementById('volSFX').value = setVolS;
}

function toggleSetting(type) {
    if(type === 'fps') setFPS = !setFPS;
    if(type === 'crt') setCRT = !setCRT;
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

function selectCosmetic(type, value) {
    cosmetics[type] = value;
    saveData(); renderCosmetics();
}

function renderCosmetics() {
    const colors = [{ id:'blue', label:'Default Blue' }, { id:'crimson', label:'Crimson — win Hard' }, { id:'violet', label:'Violet — catch Malakai' }, { id:'green', label:'Green — catch Jordan' }, { id:'amber', label:'Amber — fast win' }];
    const trails = [{ id:'none', label:'No trail' }, { id:'spark', label:'Spark trail — clear Endless round 3' }, { id:'ghost', label:'Ghost trail — win with no items' }];
    const locked = (item) => cosmetics.unlocked.includes(item.id);
    document.getElementById('cosmeticsContent').innerHTML = `<b>PLAYER COLOR</b><br>${colors.map(item => `<button ${locked(item) ? '' : 'disabled'} onclick="selectCosmetic('color','${item.id}')">${cosmetics.color === item.id ? '✓ ' : ''}${item.label}${locked(item) ? '' : ' (locked)'}</button>`).join('')}<br><br><b>TRAIL</b><br>${trails.map(item => `<button ${locked(item) ? '' : 'disabled'} onclick="selectCosmetic('trail','${item.id}')">${cosmetics.trail === item.id ? '✓ ' : ''}${item.label}${locked(item) ? '' : ' (locked)'}</button>`).join('')}`;
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
    showMenu('diffMenu');
}

function startSelectedGame(diffLevel) {
    startGame(diffLevel);
}

function startSurvival() {
    const names = [];
    if (document.getElementById('survivalCaleb').checked) names.push('CALEB');
    if (document.getElementById('survivalMalakai').checked) names.push('MALAKAI');
    if (document.getElementById('survivalJordan').checked) names.push('JORDAN');
    if (document.getElementById('survivalAeson').checked) names.push('AESON');
    if (names.length === 0) { showMsg('SELECT AT LEAST ONE MONSTER', 1600); return; }
    gameMode = 'survival';
    endlessRound = 1;
    currentMapId = document.getElementById('survivalMap').value;
    if (!unlockedMaps.includes(currentMapId)) { showMsg('UNLOCK THE BOILERWORKS IN CAMPAIGN FIRST', 1400); return; }
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

let map = [], floors = [], rooms = [], fuses = [], hidingSpots = [], coolingValves = [];
let centralBoiler = null, boilerShutdown = false, boilerReadyShown = false;
let nearFuse = null, nearHide = null, nearValve = null, nearBoiler = false;
let player = { x: 0, y: 0, r: 12, baseSpeed: 3.8, speed: 3.8, boostTimer: 0, stunTimer: 0, crouching: false, breathing: false, breathTimer: 0, breathCooldown: 0, heat: 0, inHeatZone: false, hidden: false, hideTimer: 0, hideCompromised: false };
let monster = { name: '', x: 0, y: 0, r: 14, drawRadius: 14, speed: 2.2, baseSpeed: 2.2, color: '', textColor: '', activeMutations: [], isReinforced: false, hasGloom: false, isResilient: false, hasScrambler: false, hasHexed: false, hasHallucinations: false, allSeeing: false, heatAlertTimer: 0, heatAlertX: 0, heatAlertY: 0, stunTimer: 0, lastTargetC: -1, lastTargetR: -1 };
let monsters = [];
let camera = { x: 0, y: 0, targetZoom: 1.0, zoom: 1.0 };
let nearGen = null; 

let generators = [], activeGens = 0, totalGens = 0;
let puzzleSequence = [], circuitSequence = [], circuitStage = 0, circuitRequired = 3, currentGen = null;
let lastSingleMutation = null; 

// AI & Item Variables
let jordanState = 'saboteur', mimicTimer = 0, stateTimer = 0, jordanSabotageCooldown = 0;
let empTimer = 0, empWarning = 0, empActive = 0, flashAlpha = 0;
let powerOutageTimer = 0, powerOutageCooldown = 0, flickerTimer = 0, flickerCooldown = 0, emergencyTimer = 0, emergencyCooldown = 0, outageFlickerTimer = 0;
let noiseTarget = null, noiseTimer = 0, bearTraps = [], heatZones = [], heatEventCooldown = 0;
let heatOverlay = null;
let ambienceClock = 0;
let runStartedAt = 0, runItemsUsed = 0, hallucinationHudTimer = 0;
let mobileMenuPaused = false;

// Skill Check Variables
let scNeedle = 0, scSpeed = 0, scZoneStart = 0, scZoneEnd = 0, scHits = 0, scRequired = 0, scDelay = 0;

let lastTime = 0, frames = 0;
let lastFrameTime = 0, gameAccumulator = 0;
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
    showMsg(`<span style="color:#0f0">${currentMapId === 'boilerworks' ? 'CENTRAL BOILER SHUT DOWN' : 'POWER RESTORED'}</span><br>GO CATCH ${targetText}`, 3500);
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
                scZoneEnd = scZoneStart + (currentDiff === 0 ? Math.PI/2 : currentDiff === 1 ? Math.PI/3 : Math.PI/5);
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

function generateBoilerworks() {
    map = Array.from({length: ROWS}, () => Array(COLS).fill(1));
    rooms = []; hidingSpots = []; coolingValves = []; fuses = [];
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
        rooms.push({ type, side: 'interior', c, r, x: c * TS + TS / 2, y: r * TS + TS / 2 });
        if (i > 0) carveBoilerCorridor(nodes[i - 1], nodes[i]);
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
    // Keep the spawn and objective objects separated inside the connected floor network.
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
        const blur = hot ? 4 : Math.min(3, player.heat / 100);
        heatOverlay.style.opacity = intensity.toFixed(2);
        heatOverlay.style.backdropFilter = `blur(${blur.toFixed(1)}px)`;
    }
}

function generateSpecialRooms() {
    rooms = [];
    hidingSpots = [];
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
    return rooms.find(room => Math.abs(room.x - x) <= TS * 1.5 && Math.abs(room.y - y) <= TS * 1.5) || null;
}

function isSafeRoom(x, y) {
    return safeRoomsReliable && getRoomAt(x, y)?.type === 'safe';
}

function monsterCanSeeUnhiddenPlayer(enemy = monster) {
    if (isSafeRoom(player.x, player.y)) return false;
    return emergencyTimer > 0 || getLineOfSight(enemy.x, enemy.y, player.x, player.y);
}

function isOpenObjectSpot(x, y, distance = TS * 1.5) {
    if (generators.some(generator => Math.hypot(generator.x - x, generator.y - y) < distance)) return false;
    if (hidingSpots.some(spot => Math.hypot(spot.x - x, spot.y - y) < distance)) return false;
    if (fuses.some(fuse => Math.hypot(fuse.x - x, fuse.y - y) < distance)) return false;
    return true;
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
        return !isSafeRoom(x, y) && monsters.every(other => Math.hypot(other.x - x, other.y - y) > TS * 6);
    });
    const tile = candidates[Math.floor(Math.random() * Math.max(1, candidates.length))] || floors[0];
    const enemy = {
        name, x: tile.c * TS + TS / 2, y: tile.r * TS + TS / 2,
        r: 14, drawRadius: 14, speed: diffData.mSpd, baseSpeed: diffData.mSpd,
        color: '#800', textColor: 'red', allSeeing: false, isPhantom: false,
        isFrenzy: false, isReinforced: false, hasGloom: false, isResilient: false,
        hasScrambler: false, hasHexed: false, hasHallucinations: false,
        heatAlertTimer: 0, heatAlertX: 0, heatAlertY: 0, stunTimer: 0, bloodHuntTimer: 0, bloodHuntX: 0, bloodHuntY: 0, lastTargetC: -1, lastTargetR: -1, path: [], activeMutations: [], extra: true
    };
    if (name === 'MALAKAI') { enemy.baseSpeed += 0.45; enemy.speed = enemy.baseSpeed; enemy.color = '#50a'; enemy.textColor = '#d4f'; }
    if (name === 'JORDAN') { enemy.baseSpeed += 0.18; enemy.speed = enemy.baseSpeed; enemy.color = '#050'; enemy.textColor = '#0f0'; }
    if (name === 'AESON') { enemy.baseSpeed += 0.12; enemy.speed = enemy.baseSpeed; enemy.color = '#d43b18'; enemy.textColor = '#ff9a66'; }
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
    
    if (currentMapId === 'boilerworks') { COLS = 65; ROWS = 49; }
    else { COLS = 41; ROWS = 33; }
    if (currentMapId === 'boilerworks') generateBoilerworks();
    else { generateMaze(); generateSpecialRooms(); }
    
    const spawnRoom = currentMapId === 'boilerworks' ? rooms[0] : null;
    player.x = spawnRoom?.x || (MAZE_LEFT + 1.5) * TS; player.y = spawnRoom?.y || (MAZE_TOP + 1.5) * TS;
    player.baseSpeed = 4.3 * (1 + (upgShoe * 0.05));
    player.speed = player.baseSpeed;
    player.boostTimer = 0; player.stunTimer = 0; player.crouching = false; player.breathing = false; player.breathTimer = 0; player.breathCooldown = 0; player.heat = 0; player.inHeatZone = false; player.hidden = false; player.hideTimer = 0; player.hideCompromised = false;
    ambienceClock = 0;
    camera.targetZoom = 1.0; camera.zoom = 1.0;
    nearGen = null; nearValve = null; nearBoiler = false; flashAlpha = 0;
    boilerShutdown = false; boilerReadyShown = false; heatZones = []; heatEventCooldown = currentMapId === 'boilerworks' ? 360 : 0;
    
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
    if (currentMapId === 'boilerworks' && gameMode !== 'survival') {
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

    let startTile = floors.filter(tile => !isSafeRoom(tile.c * TS + TS / 2, tile.r * TS + TS / 2)).at(-1) || floors.at(-1);
    
    monster = { 
        name: monsterName,
        x: startTile.c * TS + TS / 2, y: startTile.r * TS + TS / 2, 
        r: 14, drawRadius: 14, 
        speed: diffData.mSpd, baseSpeed: diffData.mSpd,
        color: '#800', textColor: 'red',
        allSeeing: false, isPhantom: false, isFrenzy: false, isReinforced: false, hasGloom: false, isResilient: false, hasScrambler: false, hasHexed: false, hasHallucinations: false, stunTimer: 0, bloodHuntTimer: 0, bloodHuntX: 0, bloodHuntY: 0, lastTargetC: -1, lastTargetR: -1,
        path: [], activeMutations: []
    };
    monsters = [monster];

    empTimer = 0; empWarning = 0; empActive = 0;
    powerOutageTimer = 0; outageFlickerTimer = 0; powerOutageCooldown = Math.floor(Math.random() * 600) + 900;
    flickerTimer = 0; flickerCooldown = Math.floor(Math.random() * 600) + 600;
    emergencyTimer = 0; emergencyCooldown = Math.floor(Math.random() * 1200) + 1200;
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
        { name: 'Hallucinations', apply: (m) => m.hasHallucinations = true }
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
        } else if (roll < 0.50 && generators.filter(other => !other.isFalse).length > 1) {
            generator.isFalse = true;
        }
    }
    // Decoys never count toward the power objective.
    totalGens = generators.filter(generator => !generator.isFalse).length;
    const storageRoom = rooms.find(room => room.type === 'storage');
    if (storageRoom && Math.random() < 0.55 && generators.length > 0) {
        const roomGenerator = generators[Math.floor(Math.random() * generators.length)];
        roomGenerator.x = storageRoom.x;
        roomGenerator.y = storageRoom.y;
    }
    if (storageRoom && !generators.some(generator => generator.x === storageRoom.x && generator.y === storageRoom.y)) {
        hidingSpots.push({ x: storageRoom.x, y: storageRoom.y, occupied: false });
    }
    
    stats.encounters[monster.name] = (stats.encounters[monster.name] || 0) + 1;
    stats.favoriteMonster = Object.entries(stats.encounters).sort((a,b) => b[1] - a[1])[0]?.[0] || 'None';
    canvas.classList.remove('shake');
    state = 1; updateHUD();
}

function unlockCosmetic(id) {
    if (!cosmetics.unlocked.includes(id)) cosmetics.unlocked.push(id);
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
        if (runItemsUsed === 0) advanceDailyObjective('noItems');
        if (gameMode === 'campaign') {
            if (!campaignCleared.includes(currentMapId)) campaignCleared.push(currentMapId);
            const nextMap = Object.values(MAP_DEFINITIONS).find(mapDef => mapDef.campaignOrder === MAP_DEFINITIONS[currentMapId].campaignOrder + 1);
            if (nextMap && !unlockedMaps.includes(nextMap.id)) unlockedMaps.push(nextMap.id);
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

function updateHUD() {
    const shownGens = hallucinationHudTimer > 0 ? `${Math.max(0, activeGens + (ambienceClock % 2 ? 1 : -1))}/${totalGens}` : `${activeGens}/${totalGens}`;
    document.getElementById('genCount').innerText = monsters.some(enemy => enemy.hasScrambler) ? "?/?" : shownGens;
    const objective = document.getElementById('mapObjective');
    if (objective) {
        objective.textContent = currentMapId === 'boilerworks'
            ? `Cooling valves: ${coolingValves.filter(valve => valve.active).length}/${coolingValves.length || 3}${boilerReadyShown ? ' · FIND THE BOILER' : ''}`
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
    let title = monsters.length > 1 ? 'MULTIPLE MONSTERS' : (monster.name === 'JORDAN' && jordanState === 'mimic' ? '???' : monster.name);
    const titleColor = monsters.length > 1 ? '#ffb0b0' : monster.textColor;
    const modeText = gameMode === 'endless' ? `ROUND ${endlessRound}` : gameMode === 'survival' ? 'SURVIVAL' : 'NORMAL';
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
            if (map[r][c] === 1) return true;
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
            if (map[mapR][mapC] === 1) return false;
        } else return false;
    }
    return true;
}

function findPath(sc, sr, tc, tr) {
    // Fast breadth-first search. The old version copied a full path for every
    // queued cell, which became extremely expensive with multiple monsters.
    if (sc < 0 || sc >= COLS || sr < 0 || sr >= ROWS || tc < 0 || tc >= COLS || tr < 0 || tr >= ROWS) return [];
    if (map[tr][tc] === 1) return [];

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
            if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && map[nr][nc] === 0 && !visited[nr][nc]) {
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
    if (monsters.some(enemy => enemy.hasHallucinations) && state === 1 && Math.random() < 0.0025) {
        hallucinationHudTimer = 120;
        if (Math.random() < 0.3) showMsg('<span style="color:#77ffdd">POWER RESTORED</span>', 700);
        updateHUD();
    }

    if ((state === 1 || state === 3) && eventsEnabled) {
        if (powerOutageTimer > 0) {
            powerOutageTimer--;
            if (powerOutageTimer === 0) { powerOutageCooldown = gameMode === 'endless' ? Math.max(600, 1500 - endlessRound * 110) : 1500; showMsg('LIGHTS RESTORED', 800); }
        } else if (powerOutageCooldown > 0) powerOutageCooldown--;
        else { powerOutageTimer = 1080 + (gameMode === 'endless' ? (endlessRound - 1) * 90 : 0); outageFlickerTimer = 45; showMsg('<span style="color:#888">POWER OUTAGE</span>', 1000); playSound('emp'); }
        if (outageFlickerTimer > 0) outageFlickerTimer--;
        if (flickerTimer > 0) flickerTimer--;
        else if (flickerCooldown > 0) flickerCooldown--;
        else { flickerTimer = 90 + (gameMode === 'endless' ? (endlessRound - 1) * 12 : 0); flickerCooldown = gameMode === 'endless' ? Math.max(500, 1500 - endlessRound * 100) : 1500; playSound('tick'); }
        if (emergencyTimer > 0) emergencyTimer--;
        else if (emergencyCooldown > 0) emergencyCooldown--;
        else { emergencyTimer = 420 + (gameMode === 'endless' ? (endlessRound - 1) * 30 : 0); emergencyCooldown = gameMode === 'endless' ? Math.max(900, 2100 - endlessRound * 120) : 2100; showMsg('<span style="color:#f44">EMERGENCY LIGHTS</span>', 1200); playSound('alarm'); }
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
    } else if (!player.hidden) {
        const heatPenalty = currentMapId === 'boilerworks'
            ? (player.inHeatZone ? 0.48 : 1 - Math.min(0.28, player.heat / 1070))
            : 1;
        const normalSpeed = (player.crouching ? player.baseSpeed * 0.55 : player.baseSpeed) * heatPenalty;
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

    nearGen = null; nearFuse = null; nearHide = null; nearValve = null; nearBoiler = false;
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
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (state === 0 || state === 4) return;

    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x - canvas.width/2, -camera.y - canvas.height/2);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (map[r][c] === 1) {
                ctx.fillStyle = currentMapId === 'boilerworks' ? '#171a1d' : '#2d2216'; ctx.fillRect(c * TS, r * TS, TS, TS);
                ctx.strokeStyle = currentMapId === 'boilerworks' ? '#0b0d0f' : '#181109'; ctx.strokeRect(c * TS, r * TS, TS, TS);
            } else {
                ctx.fillStyle = currentMapId === 'boilerworks' ? '#4b4540' : '#8b7355'; ctx.fillRect(c * TS, r * TS, TS, TS);
                if (currentMapId === 'boilerworks' && (r + c) % 7 === 0) {
                    ctx.fillStyle = 'rgba(180,120,55,0.2)'; ctx.fillRect(c * TS + 5, r * TS + 7, TS - 10, 3);
                }
            }
        }
    }

    for (const room of rooms) {
        const roomColor = currentMapId === 'boilerworks'
            ? (room.type === 'boiler' ? 'rgba(255,80,20,0.3)' : room.type === 'maintenance' ? 'rgba(80,180,220,0.22)' : room.type === 'cooling' ? 'rgba(40,190,220,0.2)' : room.type === 'control' ? 'rgba(160,100,220,0.2)' : room.type === 'storage' ? 'rgba(180,180,180,0.16)' : 'rgba(160,100,50,0.18)')
            : (room.type === 'safe' ? 'rgba(40,110,255,0.28)' : room.type === 'maintenance' ? 'rgba(255,190,40,0.22)' : room.type === 'storage' ? 'rgba(180,180,180,0.16)' : 'rgba(80,80,80,0.14)');
        ctx.fillStyle = roomColor;
        ctx.fillRect((room.c - 1) * TS, (room.r - 1) * TS, TS * 3, TS * 3);
        ctx.strokeStyle = room.type === 'safe' ? '#5790ff' : currentMapId === 'boilerworks' && room.type === 'boiler' ? '#ff6622' : 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect((room.c - 1) * TS, (room.r - 1) * TS, TS * 3, TS * 3);
        ctx.fillStyle = room.type === 'safe' ? '#9fc0ff' : currentMapId === 'boilerworks' && room.type === 'boiler' ? '#ff9a66' : '#ddd';
        ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center';
        ctx.fillText(room.type.toUpperCase(), room.x, room.y - 24);
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
        for (let flame = 0; flame < 5; flame++) {
            const angle = ambienceClock * 0.02 + flame * 1.25;
            const fx = zone.x + Math.cos(angle) * (zone.radius * 0.65);
            const fy = zone.y + Math.sin(angle) * (zone.radius * 0.65);
            ctx.fillStyle = 'rgba(255,220,100,0.82)';
            ctx.beginPath(); ctx.arc(fx, fy, 5 + (flame % 2) * 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#ffe0a0'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
        ctx.fillText('BURNING', zone.x, zone.y - zone.radius - 7);
    }

    if (empWarning > 0) {
        let maxRad = 400;
        let currentRad = (1 - (empWarning / 60)) * maxRad;
        ctx.beginPath();
        ctx.arc(monster.x, monster.y, currentRad, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 0, ${empWarning / 60})`;
        ctx.lineWidth = 10;
        ctx.stroke();
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

    if (monster.hasHallucinations && state === 1 && !player.hidden) {
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
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(monster.x, monster.y + monster.drawRadius * 0.65, monster.drawRadius * 0.9, monster.drawRadius * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    if (monster.name === 'JORDAN' && jordanState === 'mimic' && state !== 3) {
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
        const playerColors = { blue:'#00f', crimson:'#d22', violet:'#a64dff', green:'#19c76b', amber:'#e7a21a' };
        if (cosmetics.trail !== 'none') {
            const trailColor = cosmetics.trail === 'spark' ? 'rgba(255,215,80,0.42)' : 'rgba(180,210,255,0.3)';
            ctx.fillStyle = trailColor;
            ctx.beginPath(); ctx.arc(player.x - player.speed * 2, player.y - player.speed * 2, cosmetics.trail === 'spark' ? 7 : 10, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath(); ctx.ellipse(player.x, player.y + player.r * 0.7, player.r * 0.9, player.r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = player.boostTimer > 0 ? '#0ff' : (player.stunTimer > 0 ? '#ff0' : (playerColors[cosmetics.color] || '#00f'));
        ctx.beginPath(); ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

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
    draw();
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

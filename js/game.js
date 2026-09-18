

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
const GAME_VERSION = '1.2.1';
const SAVE_SCHEMA_VERSION = 4;
const SAVE_KEY = 'br_save_v2';
const SAVE_BACKUP_KEY = 'br_save_backup_v2';

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
    const names = ['CALEB', 'MALAKAI', 'JORDAN'];
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
    return {
        tokens: boundedInt(source.tokens, 0, 999999, 0),
        upgShoe: boundedInt(source.upgShoe, 0, 3, 0),
        upgHack: boundedInt(source.upgHack, 0, 2, 0),
        upgQuick: boundedInt(source.upgQuick, 0, 3, 0),
        upgCoin: boundedInt(source.upgCoin, 0, 1, 0),
        invAdrenaline: boundedInt(source.invAdrenaline, 0, 9999, 0),
        invFlashbang: boundedInt(source.invFlashbang, 0, 9999, 0),
        invNoiseMaker: boundedInt(source.invNoiseMaker, 0, 9999, 0),
        invBattery: boundedInt(source.invBattery, 0, 9999, 0),
        invBreathFilter: boundedInt(source.invBreathFilter, 0, 9999, 0),
        cosmetics: normalizeCosmetics(source.cosmetics),
        stats: normalizeStats(source.stats)
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
        invNoiseMaker: safeStorageGet('br_noiseMaker')
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
let invBattery = loadedProgress.invBattery;
let invBreathFilter = loadedProgress.invBreathFilter;
let cosmetics = normalizeCosmetics(loadedProgress.cosmetics);
let stats = normalizeStats(loadedProgress.stats);

// Settings Data
let setFPS = localStorage.getItem('br_fps') === 'true';
let setCRT = localStorage.getItem('br_crt') === 'true';
let setVolM = localStorage.getItem('br_volM') || 100;
let setVolS = localStorage.getItem('br_volS') || 100;

function currentProgress() {
    return { tokens, upgShoe, upgHack, upgQuick, upgCoin, invAdrenaline, invFlashbang, invNoiseMaker, invBattery, invBreathFilter, cosmetics, stats };
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
    tokens = 0; upgShoe = 0; upgHack = 0; upgQuick = 0; upgCoin = 0; invAdrenaline = 0; invFlashbang = 0; invNoiseMaker = 0; invBattery = 0; invBreathFilter = 0;
    saveData();
    setSaveStatus('Progress reset; previous save kept as backup');
}

function updateMenuData() {
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
}

function showInstallHelp() { showMenu('installMenu'); }

function chooseMode(mode) {
    gameMode = mode;
    survivalConfig = null;
    endlessRound = 1;
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
    if (names.length === 0) { showMsg('SELECT AT LEAST ONE MONSTER', 1600); return; }
    gameMode = 'survival';
    endlessRound = 1;
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
    const carried = invAdrenaline + invFlashbang + invNoiseMaker + invBattery + invBreathFilter;
    if (carried >= 5) { setSaveStatus('Inventory full — carry at most 5 consumables', '#ffcc66'); return; }
    if (tokens >= cost) {
        tokens -= cost;
        if (type === 'adrenaline') invAdrenaline++;
        if (type === 'flashbang') invFlashbang++;
        if (type === 'noiseMaker') invNoiseMaker++;
        if (type === 'battery') invBattery++;
        if (type === 'breathFilter') invBreathFilter++;
        saveData();
    }
}

// Game Core Settings
const TS = 40;
// The maze sits inside a larger canvas grid. The spare border is used for real
// side rooms, so they are physically connected to the maze rather than painted on it.
const COLS = 41, ROWS = 33;
const MAZE_LEFT = 5, MAZE_TOP = 5, MAZE_COLS = 31, MAZE_ROWS = 23;
let state = 0; let currentDiff = 0; let rewardTokens = 0;
let gameMode = 'normal', endlessRound = 1, survivalConfig = null, eventsEnabled = true, safeRoomsReliable = true;

let map = [], floors = [], rooms = [], fuses = [], hidingSpots = [];
let nearFuse = null, nearHide = null;
let player = { x: 0, y: 0, r: 12, baseSpeed: 3.8, speed: 3.8, boostTimer: 0, stunTimer: 0, crouching: false, breathing: false, breathTimer: 0, breathCooldown: 0, hidden: false, hideTimer: 0, hideCompromised: false };
let monster = { name: '', x: 0, y: 0, r: 14, drawRadius: 14, speed: 2.2, baseSpeed: 2.2, color: '', textColor: '', activeMutations: [], isReinforced: false, hasGloom: false, isResilient: false, hasScrambler: false, hasHexed: false, stunTimer: 0, lastTargetC: -1, lastTargetR: -1 };
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
let noiseTarget = null, noiseTimer = 0;
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
        const filtered = invBreathFilter > 0;
        if (filtered) invBreathFilter--;
        player.breathTimer = filtered ? 480 : 300;
        player.breathing = true;
        if (filtered) { runItemsUsed++; stats.itemsUsed++; saveData(); }
        showMsg('<span style="color:#b8aaff">HOLDING BREATH</span>', 800);
    }
}

function useBattery() {
    if ((state !== 1 && state !== 3) || invBattery <= 0 || powerOutageTimer <= 0) return;
    invBattery--; runItemsUsed++; stats.itemsUsed++;
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
    if ((state !== 1 && state !== 3) || invNoiseMaker <= 0 || player.hidden) return;
    invNoiseMaker--;
    runItemsUsed++; stats.itemsUsed++;
    const options = floors.filter(tile => Math.hypot(tile.c * TS + TS / 2 - player.x, tile.r * TS + TS / 2 - player.y) > 240);
    const tile = options[Math.floor(Math.random() * Math.max(1, options.length))] || floors[0];
    noiseTarget = { x: tile.c * TS + TS / 2, y: tile.r * TS + TS / 2 };
    noiseTimer = 600;
    for (const enemy of monsters) enemy.path = findPath(Math.floor(enemy.x / TS), Math.floor(enemy.y / TS), tile.c, tile.r);
    saveData(); updateHUD(); playSound('tick');
    showMsg('<span style="color:#ff66cc">NOISE MAKER THROWN</span>', 900);
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
    playSound('success');
    showMsg('<span style="color:#0f0">GENERATOR ONLINE</span>', 900);
    state = 1;
    checkPhase();
    if (state === 1) for (const enemy of monsters) if (enemy.isFrenzy) enemy.speed += 0.15;
}

window.addEventListener('keydown', (e) => {
    let k = e.key.toLowerCase();
    if (state === 0 || state === 4) return;
    
    // Adrenaline
    if ((state === 1 || state === 3) && k === ' ' && invAdrenaline > 0 && player.boostTimer <= 0 && player.stunTimer <= 0) {
        invAdrenaline--;
        runItemsUsed++; stats.itemsUsed++;
        player.boostTimer = monsters.some(enemy => enemy.hasHexed) ? 120 : 240; 
        saveData(); updateHUD();
    }

    // Flashbang
    if ((state === 1 || state === 3) && k === 'f' && invFlashbang > 0 && monsters.some(enemy => enemy.stunTimer <= 0)) {
        invFlashbang--;
        runItemsUsed++; stats.itemsUsed++;
        for (const enemy of monsters) enemy.stunTimer = enemy.isResilient ? 120 : 240;
        flashAlpha = 1.0;
        playSound('emp');
        saveData(); updateHUD();
    }

    if ((state === 1 || state === 3) && k === 'shift') player.crouching = true;
    if ((state === 1 || state === 3) && k === 'b') activateBreath();
    if (state === 1 && k === 'h') toggleHide();
    if ((state === 1 || state === 3) && k === 'n') useNoiseMaker();
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
        stunTimer: 0, lastTargetC: -1, lastTargetR: -1, path: [], activeMutations: [], extra: true
    };
    if (name === 'MALAKAI') { enemy.baseSpeed += 0.45; enemy.speed = enemy.baseSpeed; enemy.color = '#50a'; enemy.textColor = '#d4f'; }
    if (name === 'JORDAN') { enemy.baseSpeed += 0.18; enemy.speed = enemy.baseSpeed; enemy.color = '#050'; enemy.textColor = '#0f0'; }
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
    document.querySelectorAll('.menu-panel').forEach(p => p.style.display = 'none');
    hud.style.display = 'block';
    
    generateMaze();
    generateSpecialRooms();
    
    player.x = (MAZE_LEFT + 1.5) * TS; player.y = (MAZE_TOP + 1.5) * TS;
    player.baseSpeed = 4.3 * (1 + (upgShoe * 0.05));
    player.speed = player.baseSpeed;
    player.boostTimer = 0; player.stunTimer = 0; player.crouching = false; player.breathing = false; player.breathTimer = 0; player.breathCooldown = 0; player.hidden = false; player.hideTimer = 0; player.hideCompromised = false;
    ambienceClock = 0;
    camera.targetZoom = 1.0; camera.zoom = 1.0;
    nearGen = null; flashAlpha = 0;
    
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
    if (diffLevel === 0) {
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
        allSeeing: false, isPhantom: false, isFrenzy: false, isReinforced: false, hasGloom: false, isResilient: false, hasScrambler: false, hasHexed: false, hasHallucinations: false, stunTimer: 0, lastTargetC: -1, lastTargetR: -1,
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
        state = 3; 
        for (const enemy of monsters) enemy.speed = Math.max(enemy.speed, 4.0 + (gameMode === 'endless' ? (endlessRound - 1) * 0.18 : 0));
        player.speed = player.baseSpeed + 1.0; 
        const targetText = monsters.length === 1 ? monster.name : 'THE MONSTERS';
        showMsg(`<span style="color:#0f0">POWER RESTORED</span><br>GO CATCH ${targetText}`, 3500);
        
        if (monster.isPhantom) {
            monster.isPhantom = false;
            let closestFloor = floors[0];
            let minDist = Infinity;
            for (let f of floors) {
                let d = Math.hypot(f.c*TS + TS/2 - monster.x, f.r*TS + TS/2 - monster.y);
                if (d < minDist) { minDist = d; closestFloor = f; }
            }
            monster.x = closestFloor.c*TS + TS/2;
            monster.y = closestFloor.r*TS + TS/2;
            monster.path = [];
        }

        canvas.classList.remove('shake');
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
    
    let invText = [];
    if (invAdrenaline > 0) invText.push(`Adrenaline: ${invAdrenaline} (SPACE)`);
    if (invFlashbang > 0) invText.push(`Flashbang: ${invFlashbang} (F)`);
    if (invNoiseMaker > 0) invText.push(`Noise: ${invNoiseMaker} (N)`);
    if (invBattery > 0) invText.push(`Battery: ${invBattery} (R)`);
    if (invBreathFilter > 0) invText.push(`Filter: ${invBreathFilter}`);
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
        if (enemy.stunTimer > 0) { enemy.stunTimer--; continue; }
        const protectedPlayer = player.hidden || isSafeRoom(player.x, player.y);
        const sawHide = player.hidden && player.hideCompromised;
        const tracksPlayer = !protectedPlayer && (emergencyTimer > 0 || enemy.allSeeing || monsterCanSeeUnhiddenPlayer(enemy));
        let targetC, targetR;
        if (sawHide) {
            targetC = Math.floor(player.x / TS); targetR = Math.floor(player.y / TS);
        } else if (state === 3) {
            const far = floors.reduce((best, tile) => Math.hypot(tile.c * TS - player.x, tile.r * TS - player.y) > Math.hypot(best.c * TS - player.x, best.r * TS - player.y) ? tile : best, floors[0]);
            targetC = far.c; targetR = far.r;
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
        const normalSpeed = player.crouching ? player.baseSpeed * 0.55 : player.baseSpeed;
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

    nearGen = null; nearFuse = null; nearHide = null;
    if (state === 1 && player.stunTimer <= 0) {
        for (let g of generators) {
            if (!g.active && Math.hypot(player.x - g.x, player.y - g.y) < player.r + g.r + 15) {
                nearGen = g; break;
            }
        }
        nearFuse = fuses.find(fuse => !fuse.collected && Math.hypot(player.x - fuse.x, player.y - fuse.y) < 25) || null;
        nearHide = hidingSpots.find(spot => Math.hypot(player.x - spot.x, player.y - spot.y) < 30) || null;
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
    if (monster.stunTimer > 0) {
        monster.stunTimer--;
    } else if (state === 1 || state === 3) {
        let canSeePlayer = !player.hidden && !player.breathing && !isSafeRoom(player.x, player.y) && monsterCanSeeUnhiddenPlayer();
        
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
            if (monster.isPhantom) {
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
                    if (noiseTarget && noiseTimer > 0) {
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
    if (state === 1 || state === 3) updateExtraMonsters();
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
                ctx.fillStyle = '#2d2216'; ctx.fillRect(c * TS, r * TS, TS, TS);
                ctx.strokeStyle = '#181109'; ctx.strokeRect(c * TS, r * TS, TS, TS);
            } else {
                ctx.fillStyle = '#8b7355'; ctx.fillRect(c * TS, r * TS, TS, TS);
            }
        }
    }

    for (const room of rooms) {
        const roomColor = room.type === 'safe' ? 'rgba(40,110,255,0.28)' : room.type === 'maintenance' ? 'rgba(255,190,40,0.22)' : room.type === 'storage' ? 'rgba(180,180,180,0.16)' : 'rgba(80,80,80,0.14)';
        ctx.fillStyle = roomColor;
        ctx.fillRect((room.c - 1) * TS, (room.r - 1) * TS, TS * 3, TS * 3);
        ctx.strokeStyle = room.type === 'safe' ? '#5790ff' : 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect((room.c - 1) * TS, (room.r - 1) * TS, TS * 3, TS * 3);
        ctx.fillStyle = room.type === 'safe' ? '#9fc0ff' : '#ddd';
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
        ctx.font = '18px Arial'; ctx.fillText("Press SPACE in the Green Zone", cx, cy + 140);
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
        content.innerHTML = `<button onclick="mobileKey(' '); closeMobileActionMenu()">ADRENALINE (${invAdrenaline})</button><button onclick="mobileKey('f'); closeMobileActionMenu()">FLASHBANG (${invFlashbang})</button><button onclick="mobileKey('n'); closeMobileActionMenu()">NOISE MAKER (${invNoiseMaker})</button><button onclick="mobileKey('r'); closeMobileActionMenu()">EMERGENCY BATTERY (${invBattery})</button>`;
    } else {
        title.textContent = 'GAME MENU';
        content.innerHTML = `<button onclick="toggleFullscreen(); closeMobileActionMenu()">FULLSCREEN</button><button onclick="closeMobileActionMenu(); showMenu('infoMenu')">INFO / CONTROLS</button><button onclick="closeMobileActionMenu(); showMenu('settingsMenu')">SETTINGS</button>`;
    }
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
    document.getElementById('touchMenu')?.addEventListener('pointerdown', event => { event.preventDefault(); openMobileActionMenu('menu'); });

    document.querySelectorAll('[data-puzzle-key]').forEach(button => {
        button.addEventListener('pointerdown', event => {
            event.preventDefault();
            triggerKey(button.dataset.puzzleKey);
        });
    });

    const puzzlePad = document.getElementById('touchPuzzle');
    function updatePuzzlePad() {
        if (puzzlePad) puzzlePad.style.display = (state === 2 || state === 6) ? 'grid' : 'none';
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

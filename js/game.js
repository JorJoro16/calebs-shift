

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const hatImages = { noahCap: new Image(), cowboyHat: new Image(), luffyHat: new Image(), krustyHat: new Image(), headlightHat: new Image() };
const maskImages = { idiotMask: new Image(), spongeMask: new Image(), jordanMask: new Image(), smileMask: new Image(), stopSignMask: new Image() };
const skinImages = {
    trollFace: new Image(), generator: new Image(), trainSkin: new Image(),
    bronzeSkin: new Image(), silverSkin: new Image(), goldSkin: new Image()
};
const bossImages = {
    caleb: new Image(), leftHand: new Image(), rightHand: new Image(), cal: new Image(), leb: new Image()
};
hatImages.noahCap.src = 'assets/noah-cap.png';
hatImages.cowboyHat.src = 'assets/cowboy-hat.png';
hatImages.luffyHat.src = 'assets/luffy-hat.png';
hatImages.krustyHat.src = 'assets/krusty-krab-hat.png';
maskImages.idiotMask.src = 'assets/idiot-mask.png';
maskImages.spongeMask.src = 'assets/spongebob-mask.png';
maskImages.jordanMask.src = 'assets/jordan-mask.png';
maskImages.smileMask.src = 'assets/smile-mask.png';
maskImages.stopSignMask.src = 'assets/stop-sign-mask.png';
hatImages.headlightHat.src = 'assets/headlight-hat.png';
skinImages.trollFace.src = 'assets/troll-face-skin.png';
skinImages.generator.src = 'assets/generator-skin.png';
skinImages.trainSkin.src = 'assets/train-skin.png';
skinImages.bronzeSkin.src = 'assets/bronze-skin.png';
skinImages.silverSkin.src = 'assets/silver-skin.png';
skinImages.goldSkin.src = 'assets/gold-skin.png';
bossImages.caleb.src = 'assets/caleb-boss.png';
bossImages.leftHand.src = 'assets/caleb-left-hand.png';
bossImages.rightHand.src = 'assets/caleb-right-hand.png';
bossImages.cal.src = 'assets/cal.png';
bossImages.leb.src = 'assets/leb.png';
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

function playNizarCrashSound() {
    if (!audioUnlocked || setVolM === 0 || setVolS === 0) return;
    try {
        const sound = nizarCrashAudio.cloneNode();
        sound.volume = Math.min(.28, (setVolM / 100) * (setVolS / 100) * .28);
        sound.play().catch(() => {});
    } catch (_) {}
}

// Versioned local progress with a backup copy and import/export support.
const GAME_VERSION = '2.18.3';
const SAVE_SCHEMA_VERSION = 10;
const COSMETIC_REWARD_VERSION = 2;
const SAVE_KEY = 'br_save_v2';
const SAVE_BACKUP_KEY = 'br_save_backup_v2';
const DEVELOPER_UNLOCK_CODE = '00CaLeB00ShI1ft';
const DEVELOPER_UNLOCK_KEY = 'cs_developer_studio_unlocked_v1';
const DEVELOPER_ROOMS_KEY = 'cs_developer_rooms_v1';

const MAP_DEFINITIONS = {
    level0: { id: 'level0', name: 'LEVEL 0 — THE MAZE', description: 'The original shifting maze.', campaignOrder: 0 },
    boilerworks: { id: 'boilerworks', name: 'LEVEL 3 — THE BOILERWORKS', description: 'Long industrial halls, hot machinery, and Aeson.', campaignOrder: 1 },
    hotel: { id: 'hotel', name: 'THE ENDLESS HOTEL', description: 'Carpeted wings, guest rooms, employees, and Bassam.', campaignOrder: 2 },
    crimson: { id: 'crimson', name: 'THE CRIMSON CONTAINMENT', description: 'Break the seal route, survive Rhys, and trap him.', campaignOrder: 3 },
    forest: { id: 'forest', name: 'THE BLACKWOOD FOREST', description: 'Dark trails, powered cabins, and Noah the Stalker.', campaignOrder: 4 },
    amine: { id: 'amine', name: 'THE PARTED GRID', description: 'A burning grid where closing your eyes reveals Amine.', campaignOrder: 5 },
    subway: { id: 'subway', name: 'THE LAST LINE', description: 'Restore the signal panels, then route a train into the moving hunter from Rail Control.', campaignOrder: 6 },
    lucas: { id: 'lucas', name: 'THE SHADOW GATE', description: 'Recover Caleb fragments, bring them to the sealed gate, and survive Lucas’s final blockade.', campaignOrder: 7 }
};

const LOADOUT_DEFINITIONS = {
    free: { name: 'FREE CARRY', description: 'Use any items you own.', items: null },
    chase: { name: 'CHASE KIT', description: 'Adrenaline, Flashbangs, and Bear Traps.', items: ['adrenaline', 'flashbang', 'bearTrap'] },
    utility: { name: 'UTILITY KIT', description: 'Signals, repairs, and map-specific gear.', items: ['noiseMaker', 'battery', 'breathFilter', 'signalScrambler', 'neutralizer', 'repairKit', 'flare'] }
};

const DAILY_OBJECTIVE_POOL = [
    { id: 'repair-3', label: 'Repair 3 generators', type: 'generators', target: 3, reward: 12 },
    { id: 'win-1', label: 'Complete 1 run', type: 'wins', target: 1, reward: 20 },
    { id: 'boilerworks-1', label: 'Play 1 Boilerworks run', type: 'boilerworks', target: 1, reward: 18 },
    { id: 'valves-3', label: 'Activate 3 cooling valves', type: 'cooling', target: 3, reward: 16 },
    { id: 'items-2', label: 'Use 2 consumable items', type: 'items', target: 2, reward: 10 },
    { id: 'catch-aeson', label: 'Catch Aeson', type: 'aeson', target: 1, reward: 25 },
    { id: 'no-items', label: 'Win without using items', type: 'noItems', target: 1, reward: 30 },
    { id: 'catch-noah', label: 'Catch Noah', type: 'noah', target: 1, reward: 28 },
    { id: 'forest-run', label: 'Complete a Forest run', type: 'forest', target: 1, reward: 20 },
    { id: 'find-loot', label: 'Find 2 field supplies', type: 'loot', target: 2, reward: 14 },
    { id: 'challenge-run', label: 'Clear 1 Challenge', type: 'challenge', target: 1, reward: 30 }
];

const ITEM_DEFINITIONS = {
    adrenaline:'Adrenaline', flashbang:'Flashbang', noiseMaker:'Noise Maker', bearTrap:'Bear Trap', battery:'Battery', breathFilter:'Breath Filter', signalScrambler:'Signal Scrambler', neutralizer:'Goop Neutralizer', repairKit:'Repair Kit', flare:'Emergency Flare'
};

function safeStorageGet(key) {
    try { return localStorage.getItem(key); } catch (error) { return null; }
}

function isMobileClient() {
    return Boolean(window.matchMedia?.('(pointer: coarse)').matches && Math.min(window.innerWidth, window.innerHeight) < 900);
}

function boundedInt(value, min, max, fallback = min) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(min, Math.min(max, Math.floor(number))) : fallback;
}

function normalizeCustomLoadout(value) {
    // v9 stored an array of names. Keep every old kit by converting each name
    // into one carried copy; v10 stores quantities by item id.
    if (Array.isArray(value)) return value.filter(id => ITEM_DEFINITIONS[id]).reduce((kit, id) => ({ ...kit, [id]: 1 }), {});
    if (!value || typeof value !== 'object') return {};
    const kit = {};
    for (const id of Object.keys(ITEM_DEFINITIONS)) {
        const amount = boundedInt(value[id], 0, 8, 0);
        if (amount) kit[id] = amount;
    }
    return kit;
}

function normalizeCosmetics(value) {
    const source = value && typeof value === 'object' ? value : {};
    const colors = ['blue', 'crimson', 'violet', 'green', 'amber', 'gold', 'sepia', 'white'];
    const trails = ['none', 'spark', 'ghost', 'ember', 'static', 'circle', 'afterimage'];
    const hats = ['none', 'noahCap', 'cowboyHat', 'luffyHat', 'krustyHat', 'headlightHat'];
    const masks = ['none', 'idiotMask', 'spongeMask', 'jordanMask', 'smileMask', 'stopSignMask'];
    const skins = ['default', 'trollFace', 'generator', 'trainSkin', 'bronzeSkin', 'silverSkin', 'goldSkin'];
    const allCosmetics = [...colors, ...trails, ...hats, ...masks, ...skins];
    const unlocked = Array.isArray(source.unlocked) ? source.unlocked.filter(id => allCosmetics.includes(id)) : [];
    const legacyMask = masks.includes(source.mask) ? source.mask : masks.includes(source.hat) ? source.hat : 'none';
    return {
        color: colors.includes(source.color) ? source.color : 'blue',
        trail: trails.includes(source.trail) ? source.trail : 'none',
        hat: hats.includes(source.hat) ? source.hat : 'none',
        mask: legacyMask,
        skin: skins.includes(source.skin) ? source.skin : 'default',
        unlocked: Array.from(new Set(['blue', 'none', 'default', ...unlocked]))
    };
}

function normalizeStats(value) {
    const source = value && typeof value === 'object' ? value : {};
    const names = ['CALEB', 'MALAKAI', 'JORDAN', 'AESON', 'BASSAM', 'RHYS', 'NOAH', 'AMINE', 'NIZAR', 'LUCAS'];
    const endlessMapBest = {};
    Object.keys(MAP_DEFINITIONS).forEach(mapId => endlessMapBest[mapId] = boundedInt(source.endlessMapBest?.[mapId], 0, 999999, 0));
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
        itemFreeWins: boundedInt(source.itemFreeWins, 0, 999999, 0),
        survivalRuns: boundedInt(source.survivalRuns, 0, 999999, 0),
        challengesCleared: boundedInt(source.challengesCleared, 0, 999999, 0),
        boilerworksHardStreak: boundedInt(source.boilerworksHardStreak, 0, 3, 0),
        favoriteMonster: favorite,
        encounters,
        endlessMapBest
    };
}

function normalizeProgress(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const source = raw.progress && typeof raw.progress === 'object' ? raw.progress : raw;
    if (raw.schemaVersion !== undefined && raw.schemaVersion > SAVE_SCHEMA_VERSION) return null;
    if (source.tokens === undefined && source.upgShoe === undefined) return null;
    const unlockedMaps = Array.isArray(source.unlockedMaps) ? source.unlockedMaps.filter(id => MAP_DEFINITIONS[id]) : ['level0'];
    if (unlockedMaps.includes('subway')) unlockedMaps.push('lucas');
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
        upgDash: boundedInt(source.upgDash, 0, 1, 0),
        invAdrenaline: boundedInt(source.invAdrenaline, 0, 9999, 0),
        invFlashbang: boundedInt(source.invFlashbang, 0, 9999, 0),
        invNoiseMaker: boundedInt(source.invNoiseMaker, 0, 9999, 0),
        invBearTrap: boundedInt(source.invBearTrap, 0, 9999, 0),
        invBattery: boundedInt(source.invBattery, 0, 9999, 0),
        invBreathFilter: boundedInt(source.invBreathFilter, 0, 9999, 0),
        invSignalScrambler: boundedInt(source.invSignalScrambler, 0, 9999, 0),
        invNeutralizer: boundedInt(source.invNeutralizer, 0, 9999, 0),
        invRepairKit: boundedInt(source.invRepairKit, 0, 9999, 0),
        invFlare: boundedInt(source.invFlare, 0, 9999, 0),
        cosmetics: normalizeCosmetics(source.cosmetics),
        stats: normalizeStats(source.stats),
        unlockedMaps: Array.from(new Set(['level0', ...unlockedMaps])),
        campaignCleared: Array.isArray(source.campaignCleared) ? source.campaignCleared.filter(id => MAP_DEFINITIONS[id]) : [],
        selectedLoadout: LOADOUT_DEFINITIONS[source.selectedLoadout] || /^custom[123]$/.test(source.selectedLoadout) ? source.selectedLoadout : 'free',
        customLoadouts: Array.isArray(source.customLoadouts) ? source.customLoadouts.slice(0, 3).map(normalizeCustomLoadout) : [{}, {}, {}],
        mapMastery: source.mapMastery && typeof source.mapMastery === 'object' ? source.mapMastery : {},
        mapIntel: Array.isArray(source.mapIntel) ? source.mapIntel.filter(id => MAP_DEFINITIONS[id]) : [],
        cosmeticRewardVersion: boundedInt(source.cosmeticRewardVersion, 0, COSMETIC_REWARD_VERSION, 0),
        daily: { date: String(dailySource.date || ''), objectives: dailyObjectives, bonusClaimed: Boolean(dailySource.bonusClaimed) }
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
        upgDash: safeStorageGet('br_dash'),
        invAdrenaline: safeStorageGet('br_adrenaline'),
        invFlashbang: safeStorageGet('br_flashbang'),
        invNoiseMaker: safeStorageGet('br_noiseMaker'),
        invBearTrap: safeStorageGet('br_bearTrap')
    }) || { tokens: 0, upgShoe: 0, upgHack: 0, upgQuick: 0, upgCoin: 0, upgDash: 0, invAdrenaline: 0, invFlashbang: 0, invNoiseMaker: 0, invBattery: 0, invBreathFilter: 0, cosmetics: { color: 'blue', trail: 'none', unlocked: ['blue', 'none'] }, stats: {} };
}

const loadedProgress = loadProgress();
let tokens = loadedProgress.tokens;
let upgShoe = loadedProgress.upgShoe;
let upgHack = loadedProgress.upgHack;
let upgQuick = loadedProgress.upgQuick;
let upgCoin = loadedProgress.upgCoin;
let upgDash = loadedProgress.upgDash || 0;
let invAdrenaline = loadedProgress.invAdrenaline;
let invFlashbang = loadedProgress.invFlashbang;
let invNoiseMaker = loadedProgress.invNoiseMaker;
let invBearTrap = loadedProgress.invBearTrap || 0;
let invBattery = loadedProgress.invBattery;
let invBreathFilter = loadedProgress.invBreathFilter;
let invSignalScrambler = loadedProgress.invSignalScrambler || 0;
let invNeutralizer = loadedProgress.invNeutralizer || 0;
let invRepairKit = loadedProgress.invRepairKit || 0;
let invFlare = loadedProgress.invFlare || 0;
let cosmetics = normalizeCosmetics(loadedProgress.cosmetics);
let stats = normalizeStats(loadedProgress.stats);
let unlockedMaps = loadedProgress.unlockedMaps || ['level0'];
let campaignCleared = loadedProgress.campaignCleared || [];
let selectedLoadout = loadedProgress.selectedLoadout || 'free';
let customLoadouts = loadedProgress.customLoadouts || [{}, {}, {}];
let runLoadoutRemaining = null;
let mapMastery = loadedProgress.mapMastery || {};
let mapIntel = loadedProgress.mapIntel || [];
let cosmeticRewardVersion = loadedProgress.cosmeticRewardVersion || 0;
let daily = loadedProgress.daily || { date: '', objectives: [], bonusClaimed: false };
if (stats.generators >= 1000 && !cosmetics.unlocked.includes('generator')) cosmetics.unlocked.push('generator');

// Settings Data
let setFPS = localStorage.getItem('br_fps') === 'true';
let setCRT = localStorage.getItem('br_crt') === 'true';
let setOptimization = localStorage.getItem('br_optimization') === 'true';
let setVolM = localStorage.getItem('br_volM') || 100;
let setVolS = localStorage.getItem('br_volS') || 100;

function currentProgress() {
    return { tokens, upgShoe, upgHack, upgQuick, upgCoin, upgDash, invAdrenaline, invFlashbang, invNoiseMaker, invBearTrap, invBattery, invBreathFilter, invSignalScrambler, invNeutralizer, invRepairKit, invFlare, cosmetics, stats, unlockedMaps, campaignCleared, selectedLoadout, customLoadouts, mapMastery, mapIntel, cosmeticRewardVersion, daily };
}

function syncEndlessCosmeticUnlocks() {
    const thresholds = [[3, 'bronzeSkin'], [6, 'silverSkin'], [9, 'goldSkin'], [9, 'smileMask']];
    let changed = false;
    for (const [round, id] of thresholds) {
        if (stats.bestEndless >= round && !cosmetics.unlocked.includes(id)) {
            cosmetics.unlocked.push(id);
            changed = true;
        }
    }
    return changed;
}

function enforceSubwayRewardSequence() {
    const before = cosmetics.unlocked.length;
    if (!cosmetics.unlocked.includes('stopSignMask')) {
        cosmetics.unlocked = cosmetics.unlocked.filter(id => !['headlightHat', 'trainSkin'].includes(id));
    } else if (!cosmetics.unlocked.includes('headlightHat')) {
        cosmetics.unlocked = cosmetics.unlocked.filter(id => id !== 'trainSkin');
    }
    return cosmetics.unlocked.length !== before;
}

function migrateSubwayCosmeticRewards() {
    let changed = false;
    if (cosmeticRewardVersion < COSMETIC_REWARD_VERSION) {
        // Bronze/Silver/Gold used to be the Subway rewards. They are now
        // Endless rewards, so the three new Subway cosmetics must be earned
        // again after this reward-line reset.
        const oldSubwayRewards = ['bronzeSkin', 'silverSkin', 'goldSkin', 'stopSignMask', 'headlightHat', 'trainSkin'];
        const before = cosmetics.unlocked.length;
        cosmetics.unlocked = cosmetics.unlocked.filter(id => !oldSubwayRewards.includes(id));
        changed = cosmetics.unlocked.length !== before;
        cosmeticRewardVersion = COSMETIC_REWARD_VERSION;
        changed = true;
    }
    changed = syncEndlessCosmeticUnlocks() || changed;
    changed = enforceSubwayRewardSequence() || changed;
    return changed;
}

if (migrateSubwayCosmeticRewards()) saveData();

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
        }), bonusClaimed: false
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
    notify(`TODAY'S SHIFT +${objective.reward} TOKENS`, 'unlock');
}

function claimDailyBonus() {
    ensureDailyObjectives();
    if (daily.bonusClaimed || !daily.objectives.every(objective => objective.claimed)) return;
    daily.bonusClaimed = true; tokens += 35; saveData(); renderDailyObjectives(); notify("TODAY'S SHIFT COMPLETE +35 TOKENS", 'unlock');
}

function itemAllowed(type) {
    if (/^custom[123]$/.test(selectedLoadout)) return (runLoadoutRemaining?.[type] ?? customLoadouts[Number(selectedLoadout.at(-1)) - 1]?.[type] ?? 0) > 0;
    const loadout = LOADOUT_DEFINITIONS[selectedLoadout] || LOADOUT_DEFINITIONS.free;
    return !loadout.items || loadout.items.includes(type);
}

function getOwnedItemCount(type) {
    const inventory = { adrenaline: invAdrenaline, flashbang: invFlashbang, noiseMaker: invNoiseMaker, bearTrap: invBearTrap, battery: invBattery, breathFilter: invBreathFilter, signalScrambler: invSignalScrambler, neutralizer: invNeutralizer, repairKit: invRepairKit, flare: invFlare };
    return inventory[type] || 0;
}

function consumeLoadoutItem(type) {
    if (runLoadoutRemaining?.[type] !== undefined) runLoadoutRemaining[type] = Math.max(0, runLoadoutRemaining[type] - 1);
}

function customKitSummary(kit) {
    const entries = Object.entries(kit).filter(([, amount]) => amount > 0);
    return entries.length ? entries.map(([id, amount]) => `${ITEM_DEFINITIONS[id]} ×${amount}`).join(', ') : 'Choose items and quantities (8 total).';
}

function renderDailyObjectives() {
    ensureDailyObjectives();
    const content = document.getElementById('dailyObjectivesContent');
    if (!content) return;
    content.innerHTML = daily.objectives.map((objective, index) => {
        const complete = objective.progress >= objective.target;
        const action = complete && !objective.claimed ? ` <button onclick="claimDailyObjective(${index})">CLAIM ${objective.reward} T</button>` : '';
        return `<div class="objective-row"><div><b>${objective.label}</b><br><span>${Math.min(objective.progress, objective.target)}/${objective.target}${objective.claimed ? ' · CLAIMED' : ''}</span></div>${action}</div>`;
    }).join('') + `<div class="objective-row"><div><b>SHIFT BONUS</b><br><span>Claim after all three tasks · 35 Tokens</span></div>${daily.objectives.every(objective => objective.claimed) && !daily.bonusClaimed ? '<button onclick="claimDailyBonus()">CLAIM 35 T</button>' : `<span>${daily.bonusClaimed ? 'CLAIMED' : 'LOCKED'}</span>`}</div>`;
}

function renderLoadouts() {
    const content = document.getElementById('loadoutsContent');
    if (!content) return;
    const presets = Object.entries(LOADOUT_DEFINITIONS).map(([id, loadout]) => `<button class="loadout-option" ${selectedLoadout === id ? 'style="border-color:#0f0;color:#0f0"' : ''} onclick="selectLoadout('${id}')"><b>${loadout.name}</b><br><span>${loadout.description}</span></button>`).join('');
    const custom = customLoadouts.map((kit, index) => { const total = Object.values(kit).reduce((sum, amount) => sum + amount, 0); return `<div class="loadout-editor"><button class="loadout-option" ${selectedLoadout === `custom${index + 1}` ? 'style="border-color:#0f0;color:#0f0"' : ''} onclick="selectLoadout('custom${index + 1}')"><b>CUSTOM KIT ${index + 1} · ${total}/8</b><br><span>${customKitSummary(kit)}</span></button><div class="loadout-picks">${Object.entries(ITEM_DEFINITIONS).map(([id, name]) => `<span class="loadout-quantity"><b>${name}</b><small>OWNED ${getOwnedItemCount(id)} · BRING ${kit[id] || 0}</small><button onclick="changeCustomLoadout(${index},'${id}',-1)">−</button><button ${total >= 8 || (kit[id] || 0) >= getOwnedItemCount(id) ? 'disabled' : ''} onclick="changeCustomLoadout(${index},'${id}',1)">+</button></span>`).join('')}</div></div>`; }).join('');
    content.innerHTML = `${presets}<h3>CUSTOM KITS</h3>${custom}`;
}

function changeCustomLoadout(index, item, amount) {
    const kit = customLoadouts[index] ||= {};
    const total = Object.values(kit).reduce((sum, value) => sum + value, 0);
    const next = Math.max(0, Math.min(getOwnedItemCount(item), (kit[item] || 0) + amount));
    if (amount > 0 && total >= 8) { notify('CUSTOM KITS HOLD EIGHT SUPPLIES', 'warning'); return; }
    if (next) kit[item] = next; else delete kit[item];
    saveData(); renderLoadouts(); renderRunSetup();
}

function mountSurvivalSetup() {
    const source = document.querySelector('#survivalMenu > div');
    const target = document.getElementById('runSetupOptions');
    if (!source || !target || source.dataset.mounted === 'true') return;
    source.dataset.mounted = 'true';
    source.id = 'embeddedSurvivalFields';
    target.insertBefore(source, target.firstChild);
}

function updateSurvivalSummary() {
    const summary = document.getElementById('survivalSummary');
    if (!summary) return;
    const selected = ['Caleb','Malakai','Jordan','Aeson','Bassam','Rhys','Noah','Amine','Nizar'].filter(name => document.getElementById(`survival${name}`)?.checked);
    const map = document.getElementById('survivalMap')?.selectedOptions?.[0]?.textContent || 'a map';
    const count = document.getElementById('survivalCount')?.value || '1';
    const difficulty = document.getElementById('survivalDiff')?.selectedOptions?.[0]?.textContent || 'Normal';
    summary.textContent = `${map} · ${difficulty} · ${count} active hunter${count === '1' ? '' : 's'} · Pool: ${selected.join(', ') || 'none'}`;
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
    updateSurvivalSummary();
    const heading = document.querySelector('#diffMenu h2');
    if (heading) heading.textContent = isSurvival ? 'RUN SETUP' : 'SELECT DIFFICULTY';
    const loadoutTarget = document.getElementById('runLoadoutOptions');
    if (loadoutTarget) {
        const presets = Object.entries(LOADOUT_DEFINITIONS).map(([id, loadout]) => `<button class="loadout-option" ${selectedLoadout === id ? 'style="border-color:#0f0;color:#0f0"' : ''} onclick="selectLoadout('${id}')"><b>${loadout.name}</b><br><span>${loadout.description}</span></button>`).join('');
        const customs = customLoadouts.map((kit, index) => `<button class="loadout-option" ${selectedLoadout === `custom${index + 1}` ? 'style="border-color:#0f0;color:#0f0"' : ''} onclick="selectLoadout('custom${index + 1}')"><b>CUSTOM KIT ${index + 1}</b><br><span>${customKitSummary(kit)}</span></button>`).join('');
        loadoutTarget.innerHTML = `${presets}<h3>CUSTOM KITS</h3>${customs}`;
    }
}

function renderRecords() {
    ensureDailyObjectives();
    const content = document.getElementById('recordsContent');
    if (!content) return;
    const fastest = stats.fastestWin ? `${(stats.fastestWin / 1000).toFixed(1)}s` : '—';
    content.innerHTML = `<details class="record-section" open><summary>RUN STATISTICS</summary><div>Games: <b>${stats.games}</b><br>Wins / Losses: <b>${stats.wins} / ${stats.losses}</b><br>Generators repaired: <b>${stats.generators}</b><br>Monsters caught: <b>${stats.caught}</b><br>Best Endless round: <b>${stats.bestEndless}</b><br>Survival runs: <b>${stats.survivalRuns}</b><br>Challenges cleared: <b>${stats.challengesCleared}</b><br>Fastest win: <b>${fastest}</b><br>Items used: <b>${stats.itemsUsed}</b><br>Favorite monster: <b>${stats.favoriteMonster}</b></div></details>`;
}

function selectLoadout(id) {
    if (!LOADOUT_DEFINITIONS[id] && !/^custom[123]$/.test(id)) return;
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
        localStorage.setItem('br_dash', upgDash);
        localStorage.setItem('br_adrenaline', invAdrenaline);
        localStorage.setItem('br_flashbang', invFlashbang);
        localStorage.setItem('br_noiseMaker', invNoiseMaker);
        localStorage.setItem('br_bearTrap', invBearTrap);
        localStorage.setItem('br_signalScrambler', invSignalScrambler);
        localStorage.setItem('br_neutralizer', invNeutralizer);
        localStorage.setItem('br_repairKit', invRepairKit);
        localStorage.setItem('br_flare', invFlare);
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
            upgDash = imported.upgDash || 0;
            invAdrenaline = imported.invAdrenaline;
            invFlashbang = imported.invFlashbang;
            invNoiseMaker = imported.invNoiseMaker;
            invBearTrap = imported.invBearTrap;
            invBattery = imported.invBattery;
            invBreathFilter = imported.invBreathFilter;
            invSignalScrambler = imported.invSignalScrambler;
            invNeutralizer = imported.invNeutralizer;
            invRepairKit = imported.invRepairKit;
            invFlare = imported.invFlare;
            cosmetics = normalizeCosmetics(imported.cosmetics);
            stats = normalizeStats(imported.stats);
            cosmeticRewardVersion = imported.cosmeticRewardVersion || 0;
            migrateSubwayCosmeticRewards();
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
    tokens = 0; upgShoe = 0; upgHack = 0; upgQuick = 0; upgCoin = 0; upgDash = 0; invAdrenaline = 0; invFlashbang = 0; invNoiseMaker = 0; invBearTrap = 0; invBattery = 0; invBreathFilter = 0; invSignalScrambler = 0; invNeutralizer = 0; invRepairKit = 0; invFlare = 0;
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
        const loadoutName = LOADOUT_DEFINITIONS[selectedLoadout]?.name || selectedLoadout.replace('custom', 'CUSTOM KIT ');
        status.innerHTML = `<span>${unlockedMaps.length}/${Object.keys(MAP_DEFINITIONS).length} MAPS</span><span>${dailyReady ? `${dailyReady} DAILY READY` : 'DAILY ACTIVE'}</span><span>${loadoutName}</span>`;
    }
    const dailyBadge = document.getElementById('dailyBadge');
    if (dailyBadge) dailyBadge.textContent = daily.objectives.every(objective => objective.claimed) ? '✓' : `${daily.objectives.filter(objective => objective.progress >= objective.target && !objective.claimed).length}/3`;
    
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
    const btnDash = document.getElementById('btnDash');
    if (btnDash) { btnDash.innerText = upgDash ? 'OWNED' : '300 T'; btnDash.disabled = Boolean(upgDash); btnDash.style.color = upgDash ? '#0f0' : ''; }
}

function renderStats() {
    const fastest = stats.fastestWin ? `${(stats.fastestWin / 1000).toFixed(1)}s` : '—';
    document.getElementById('statsContent').innerHTML = `Games: <b>${stats.games}</b><br>Wins / Losses: <b>${stats.wins} / ${stats.losses}</b><br>Generators repaired: <b>${stats.generators}</b><br>Monsters caught: <b>${stats.caught}</b><br>Times caught: <b>${stats.timesCaught}</b><br>Best Endless round: <b>${stats.bestEndless}</b><br>Fastest win: <b>${fastest}</b><br>Most generators in one run: <b>${stats.mostGenerators}</b><br>Items used: <b>${stats.itemsUsed}</b><br>Favorite monster: <b>${stats.favoriteMonster}</b>`;
}

let cosmeticTab = 'colors';
function selectCosmetic(type, value) {
    if (!['color','trail','hat','mask','skin'].includes(type) || !cosmetics.unlocked.includes(value)) return;
    cosmetics[type] = value;
    saveData(); renderCosmetics();
}

function setCosmeticTab(tab) { cosmeticTab = tab; renderCosmetics(); }

function cosmeticProgress(id) {
    const unlocked = cosmetics.unlocked.includes(id);
    if (unlocked) return 'UNLOCKED';
    if (id === 'luffyHat') return `${Math.min(stats.generators, 56)}/56 generators repaired`;
    if (id === 'generator') return `${Math.min(stats.generators, 1000)}/1000 generators completed`;
    if (id === 'trollFace') return 'Flashbang Noah within one second of his reveal';
    if (id === 'stopSignMask') return 'Find the torn ticket, deliver it before any signal panel, then clear Subway.';
    if (id === 'headlightHat') return 'Stop Sign Mask first: let three trains miss Nizar, then let the passenger train pass before catching him.';
    if (id === 'trainSkin') return 'Headlight first: as Nizar, collect the gold sphere before restoring any signal, then open Rail Control.';
    if (id === 'bronzeSkin') return `${Math.min(stats.bestEndless, 3)}/3 Endless rounds`;
    if (id === 'silverSkin') return `${Math.min(stats.bestEndless, 6)}/6 Endless rounds`;
    if (id === 'goldSkin') return `${Math.min(stats.bestEndless, 9)}/9 Endless rounds`;
    if (id === 'afterimage') return stats.fastestWin ? `Best: ${(stats.fastestWin / 1000).toFixed(1)}s · target under 60s` : '0/1 under-one-minute win';
    if (id === 'spongeMask') return `${Math.min(stats.boilerworksHardStreak, 3)}/3 Hard Boilerworks wins in a row`;
    if (id === 'smileMask') return `${Math.min(stats.bestEndless, 9)}/9 Endless rounds`;
    if (id === 'spark') return `${Math.min(stats.bestEndless, 3)}/3 Endless rounds`;
    if (id === 'ghost') return `${Math.min(stats.itemFreeWins, 1)}/1 item-free win`;
    if (id === 'amber') return stats.fastestWin ? `Best: ${(stats.fastestWin / 1000).toFixed(1)}s · target under 120s` : '0/1 under-two-minute win';
    return '0/1 completion';
}

function renderCosmetics() {
    const groups = {
        colors: { type:'color', items:[
            { id:'blue', label:'Default Blue', desc:'The original survivor color.', how:'Available from the start.', preview:'#00f' },
            { id:'crimson', label:'Crimson', desc:'A deep red finish.', how:'Win a Hard run.', preview:'#d22' },
            { id:'violet', label:'Violet', desc:'A hunter-purple finish.', how:'Catch Malakai.', preview:'#a64dff' },
            { id:'green', label:'Green', desc:'A mimic-green finish.', how:'Catch Jordan.', preview:'#19c76b' },
            { id:'amber', label:'Amber', desc:'A quick-escape gold.', how:'Win a run in under two minutes.', preview:'#e7a21a' },
            { id:'gold', label:'Containment Gold', desc:'A yellow Rhys-themed finish.', how:'Catch Rhys in Crimson Containment.', preview:'#e9cf38' },
            { id:'sepia', label:'Caleb Shift', desc:'Wear Caleb’s deep red color and unmistakable white eyes.', how:'Catch Caleb.', preview:'#800' },
            { id:'white', label:'Parted White', desc:'A stark white finish from the grid beyond sight.', how:'Catch Amine in The Parted Grid.', preview:'#f6f6f6' }
        ]},
        trails: { type:'trail', items:[
            { id:'none', label:'No Trail', desc:'No motion effect.', how:'Available from the start.', preview:'#888' },
            { id:'spark', label:'Spark Trail', desc:'A short fading line of sparks.', how:'Clear Endless round 3.', preview:'#ffd750' },
            { id:'ghost', label:'Ghost Trail', desc:'A soft spectral after-trail.', how:'Win without items.', preview:'#b4d7ff' },
            { id:'ember', label:'Ember Trail', desc:'A warm containment glow.', how:'Catch Rhys in Crimson Containment.', preview:'#ffb347' },
            { id:'static', label:'Static Trail', desc:'A broken signal after-trail.', how:'Catch Caleb.', preview:'#d8eef2' },
            { id:'circle', label:'Orbit Trail', desc:'Fading white circles follow each step.', how:'Catch Amine in The Parted Grid.', preview:'#fff' },
            { id:'afterimage', label:'Afterimage Trail', desc:'Blurred transparent copies follow you while moving.', how:'Win any level in under one minute.', preview:'#bde8ff' }
        ]},
        hats: { type:'hat', items:[
            { id:'none', label:'No Hat', desc:'No headwear equipped.', how:'Available from the start.', preview:'#888' },
            { id:'noahCap', label:'Noah’s Cap', desc:'The cap worn by the Stalker.', how:'Beat The Blackwood Forest.', preview:'#bbb', image:'noah-cap.png' },
            { id:'cowboyHat', label:'Cowboy Hat', desc:'For surviving on your own terms.', how:'Complete a Challenge with no items equipped.', preview:'#d7a94b', image:'cowboy-hat.png' },
            { id:'luffyHat', label:'Luffy’s Straw Hat', desc:'A famous hat with a very specific number attached.', how:'Repair 56 generators across your career.', preview:'#e5bd43', image:'luffy-hat.png' },
            { id:'krustyHat', label:'Krusty Krab Hat', desc:'A hotel uniform for a dangerous assignment.', how:'Complete the hotel after accidentally completing Bassam’s task, then survive his chase for the rest of the run.', preview:'#4aa8e8', image:'krusty-krab-hat.png' },
            { id:'headlightHat', label:'Headlight', desc:'A beam for finding the next platform in the dark.', how:'First earn the Stop Sign Mask. Then let three trains miss Nizar, let the passenger pass, and catch him.', preview:'#d8e8ff', image:'headlight-hat.png' }
        ]},
        masks: { type:'mask', items:[
            { id:'none', label:'No Mask', desc:'No face covering equipped.', how:'Available from the start.', preview:'#888' },
            { id:'idiotMask', label:'Idiot Mask', desc:'A smile that appears after too many mistakes.', how:'Fail the same generator task three times in one run.', preview:'#fff', image:'idiot-mask.png' },
            { id:'spongeMask', label:'SpongeBob Mask', desc:'A cheerful face for deeply uncheerful places.', how:'Complete Boilerworks three times in a row on Hard.', preview:'#f6d34a', image:'spongebob-mask.png' },
            { id:'jordanMask', label:'Jordan Mask', desc:'Jordan’s face, earned through his own color.', how:'Catch Jordan while Green is equipped.', preview:'#6cce77', image:'jordan-mask.png' },
            { id:'smileMask', label:'Smile Mask', desc:'A grin earned through endurance.', how:'Clear Endless Round 9.', preview:'#fff', image:'smile-mask.png' },
            { id:'stopSignMask', label:'Stop Sign Mask', desc:'A warning from the platform edge.', how:'Deliver the torn ticket before restoring any Subway signal, then clear the level.', preview:'#f33', image:'stop-sign-mask.png' }
        ]},
        skins: { type:'skin', items:[
            { id:'default', label:'Default Survivor', desc:'Your standard survivor body.', how:'Available from the start.', preview:'#00f' },
            { id:'trollFace', label:'Troll Face Skin', desc:'A deeply unhelpful face for a deeply hostile place.', how:'Flashbang Noah within one second of his reveal.', preview:'#fff', image:'troll-face-skin.png' },
            { id:'generator', label:'Generator Skin', desc:'Become the objective everyone is looking for.', how:'Complete 1,000 generators across your career.', preview:'#777', image:'generator-skin.png' },
            { id:'trainSkin', label:'Train Skin', desc:'A little engine for a very long last line.', how:'First earn the Headlight. Then, as Nizar, take the gold sphere before the signals and open Rail Control.', preview:'#9aa8b1', image:'train-skin.png' },
            { id:'bronzeSkin', label:'Bronze Skin', desc:'A worn metal finish from the early rounds.', how:'Clear Endless Round 3.', preview:'#bf7a32', image:'bronze-skin.png' },
            { id:'silverSkin', label:'Silver Skin', desc:'A polished finish for surviving the middle stretch.', how:'Clear Endless Round 6.', preview:'#d8e1ea', image:'silver-skin.png' },
            { id:'goldSkin', label:'Gold Skin', desc:'A final-round finish earned at the end of the line.', how:'Clear Endless Round 9.', preview:'#e5c34e', image:'gold-skin.png' }
        ]}
    };
    const content = document.getElementById('cosmeticsContent'); if (!content) return;
    const group = groups[cosmeticTab] || groups.colors;
    content.innerHTML = `<div class="cosmetic-book"><div class="cosmetic-grid">${group.items.map(item => { const unlocked = cosmetics.unlocked.includes(item.id); const equipped = cosmetics[group.type] === item.id; const preview = item.image ? `<img src="assets/${item.image}" alt="${item.label} preview">` : `<span style="color:${item.preview}; text-shadow:0 0 14px ${item.preview};">● ${item.label.toUpperCase()}</span>`; return `<div class="cosmetic-card"><div class="cosmetic-preview">${preview}</div><b>${item.label}</b><small>${item.desc}<br><span style="color:#d4c09a">How: ${item.how}</span><br><span class="cosmetic-progress">Progress: ${cosmeticProgress(item.id)}</span></small><button ${unlocked ? '' : 'disabled'} onclick="selectCosmetic('${group.type}','${item.id}')">${equipped ? 'EQUIPPED' : unlocked ? 'EQUIP' : 'LOCKED'}</button></div>`; }).join('')}</div></div>`;
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
        ['RHYS', 'The Contained', unlockedMaps.includes('crimson') ? 'Goop-spitting dash predator' : 'Unlock Crimson Containment'],
        ['NOAH', 'The Stalker', unlockedMaps.includes('forest') ? 'Invisible lightning hunter' : 'Unlock Blackwood Forest'],
        ['AMINE', 'The Parted', unlockedMaps.includes('amine') ? 'Focus-vision predator' : 'Unlock the Parted Grid'],
        ['NIZAR', 'The Controller', unlockedMaps.includes('subway') ? 'Route and rail hunter' : 'Unlock the Last Line']
    ];
    const mutationRows = ['Speed Demon','Phantom','Frenzy','Camouflage','Giant','Gloom','Reinforced','Lethargy','Resilient','Scrambler','Hexed','Hallucinations','All-Seeing','Locked In','Echo','False Objective','Watcher','Panic','Heavy Footfall','Afterimage'];
    content.innerHTML = `<b>MONSTERS</b>${monsterRows.map(row => `<div class="collection-row"><strong>${row[0]}</strong><span>${row[1]} · ${row[2]}</span></div>`).join('')}<br><b>MAPS</b>${Object.values(MAP_DEFINITIONS).map(mapDef => `<div class="collection-row"><strong>${mapDef.name}</strong><span>${unlockedMaps.includes(mapDef.id) ? 'UNLOCKED' : 'LOCKED'}</span></div>`).join('')}<br><b>MUTATIONS</b><div class="collection-tags">${mutationRows.map(name => `<span>${name}</span>`).join('')}</div>`;
}

// Developer Studio is intentionally stored outside the normal player save. It
// is an authoring workspace, not progression, so importing/exporting rooms can
// never overwrite tokens, inventory, cosmetics, or campaign progress.
const DEVELOPER_GRID_SIZE = 32;
const DEVELOPER_CANVAS_WIDTH = 960;
const DEVELOPER_CANVAS_HEIGHT = 600;
const developerCanvas = document.getElementById('developerCanvas');
const developerContext = developerCanvas?.getContext('2d');
let developerStudioOpen = false;
let developerRoomDialogAction = null;
let developerUnlockDialogOpen = false;
let developerChordArmed = false;
let developerUnlockedSession = false;
let developerRooms = loadDeveloperRooms();
const developerState = {
    room: null,
    selectedId: null,
    tool: 'select',
    dirty: false,
    pointer: null,
    preview: null,
    undo: [],
    redo: [],
    playtesting: false,
    testPlayer: null
};

function developerId(prefix = 'object') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function developerNumber(value, min, max, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
}

function developerColor(value, fallback) {
    return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? String(value) : fallback;
}

function developerText(value, max) {
    return String(value || '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, max);
}

function escapeDeveloperHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));
}

function normalizeDeveloperObject(raw, roomWidth, roomHeight) {
    if (!raw || typeof raw !== 'object') return null;
    const types = ['floor', 'wall', 'decoration', 'spawn', 'connection'];
    if (!types.includes(raw.type)) return null;
    const point = {
        id: developerText(raw.id, 60) || developerId('object'),
        type: raw.type,
        subtype: developerText(raw.subtype, 30),
        x: developerNumber(raw.x, 0, roomWidth, 0),
        y: developerNumber(raw.y, 0, roomHeight, 0),
        width: developerNumber(raw.width, 8, roomWidth, 32),
        height: developerNumber(raw.height, 8, roomHeight, 32),
        color: developerColor(raw.color, raw.type === 'wall' ? '#262625' : '#887d62')
    };
    if (raw.type === 'spawn') point.subtype = ['player','generator','nizar','monster','item','exit'].includes(point.subtype) ? point.subtype : 'player';
    if (raw.type === 'decoration') point.subtype = ['bench','locker','column','poster','lamp','crate','sign'].includes(point.subtype) ? point.subtype : 'crate';
    if (raw.type === 'connection') point.subtype = ['north','east','south','west'].includes(point.subtype) ? point.subtype : 'east';
    if (raw.type === 'floor' || raw.type === 'wall' || raw.type === 'decoration') {
        point.width = Math.min(point.width, roomWidth - point.x);
        point.height = Math.min(point.height, roomHeight - point.y);
    }
    return point;
}

function normalizeDeveloperRoom(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const source = raw.room && typeof raw.room === 'object' ? raw.room : raw;
    const width = developerNumber(source.width, 320, 2400, DEVELOPER_CANVAS_WIDTH);
    const height = developerNumber(source.height, 240, 1800, DEVELOPER_CANVAS_HEIGHT);
    const room = {
        format: 'calebs-shift-room',
        version: 1,
        id: developerText(source.id, 80) || developerId('room'),
        name: developerText(source.name, 80),
        description: developerText(source.description, 500),
        width,
        height,
        floorColor: developerColor(source.floorColor, '#5d594d'),
        wallColor: developerColor(source.wallColor, '#262625'),
        accentColor: developerColor(source.accentColor, '#d4c09a'),
        createdAt: source.createdAt || new Date().toISOString(),
        updatedAt: source.updatedAt || new Date().toISOString(),
        objects: []
    };
    room.objects = Array.isArray(source.objects)
        ? source.objects.map(object => normalizeDeveloperObject(object, width, height)).filter(Boolean)
        : [];
    return room;
}

function loadDeveloperRooms() {
    const raw = safeStorageGet(DEVELOPER_ROOMS_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        const rooms = Array.isArray(parsed) ? parsed : parsed?.rooms;
        return Array.isArray(rooms) ? rooms.map(normalizeDeveloperRoom).filter(Boolean) : [];
    } catch (_) { return []; }
}

function persistDeveloperRooms() {
    try { localStorage.setItem(DEVELOPER_ROOMS_KEY, JSON.stringify(developerRooms)); } catch (_) { /* The editor still works for export. */ }
}

function blankDeveloperRoom() {
    return normalizeDeveloperRoom({ id: developerId('room'), width:DEVELOPER_CANVAS_WIDTH, height:DEVELOPER_CANVAS_HEIGHT, objects:[] });
}

function cloneDeveloperRoom(room) {
    return normalizeDeveloperRoom(JSON.parse(JSON.stringify(room)));
}

function isDeveloperUnlocked() {
    // Developer access is deliberately session-only. Room files still persist,
    // but the unlock itself must be entered again after a fresh game load.
    return developerUnlockedSession;
}

function refreshDeveloperAccess() {
    const button = document.getElementById('developerStudioButton');
    const disableButton = document.getElementById('developerDisableButton');
    if (button) button.style.display = isDeveloperUnlocked() ? 'block' : 'none';
    if (disableButton) disableButton.style.display = isDeveloperUnlocked() ? 'block' : 'none';
}

function openDeveloperUnlock() {
    if (isDeveloperUnlocked()) { openDeveloperStudio(); return; }
    developerUnlockDialogOpen = true;
    const dialog = document.getElementById('developerUnlockDialog');
    const input = document.getElementById('developerCodeInput');
    const error = document.getElementById('developerUnlockError');
    if (dialog) dialog.style.display = 'flex';
    if (error) error.textContent = '';
    if (input) { input.value = ''; setTimeout(() => input.focus(), 0); }
}

function closeDeveloperUnlock() {
    developerUnlockDialogOpen = false;
    const dialog = document.getElementById('developerUnlockDialog');
    if (dialog) dialog.style.display = 'none';
}

function submitDeveloperUnlock() {
    const input = document.getElementById('developerCodeInput');
    const error = document.getElementById('developerUnlockError');
    if (input?.value === DEVELOPER_UNLOCK_CODE) {
        developerUnlockedSession = true;
        try { localStorage.removeItem(DEVELOPER_UNLOCK_KEY); sessionStorage.removeItem(DEVELOPER_UNLOCK_KEY); } catch (_) {}
        closeDeveloperUnlock();
        refreshDeveloperAccess();
        playSound('unlock');
        notify('DEVELOPER STUDIO UNLOCKED', 'unlock');
    } else if (error) {
        error.textContent = 'That code was not accepted.';
        input?.focus();
    }
}

function disableDeveloperAccess() {
    if (developerState.dirty && developerRoomHasContent() && !confirm('Disable developer mode without saving this room?')) return;
    developerUnlockedSession = false;
    developerStudioOpen = false;
    developerState.playtesting = false;
    developerUnlockDialogOpen = false;
    document.getElementById('developerStudio').style.display = 'none';
    document.getElementById('developerUnlockDialog').style.display = 'none';
    document.getElementById('developerRoomDialog').style.display = 'none';
    try { localStorage.removeItem(DEVELOPER_UNLOCK_KEY); sessionStorage.removeItem(DEVELOPER_UNLOCK_KEY); } catch (_) {}
    refreshDeveloperAccess();
    showMenu('mainMenu');
}

function developerRoomHasContent(room = developerState.room) {
    return Boolean(room && (room.name || room.description || room.objects.length));
}

function openDeveloperRoomDialog(action = null) {
    if (!developerState.room) return;
    developerRoomDialogAction = action;
    const dialog = document.getElementById('developerRoomDialog');
    const name = document.getElementById('developerRoomNameInput');
    const description = document.getElementById('developerRoomDescriptionInput');
    const error = document.getElementById('developerRoomError');
    const title = document.getElementById('developerRoomTitle');
    if (title) title.textContent = developerState.room.name ? 'EDIT ROOM DETAILS' : 'SAVE ROOM';
    if (name) name.value = developerState.room.name || '';
    if (description) description.value = developerState.room.description || '';
    if (error) error.textContent = '';
    if (dialog) dialog.style.display = 'flex';
    setTimeout(() => name?.focus(), 0);
}

function closeDeveloperRoomDialog() {
    developerRoomDialogAction = null;
    const dialog = document.getElementById('developerRoomDialog');
    if (dialog) dialog.style.display = 'none';
}

function submitDeveloperRoomDetails() {
    const nameInput = document.getElementById('developerRoomNameInput');
    const descriptionInput = document.getElementById('developerRoomDescriptionInput');
    const error = document.getElementById('developerRoomError');
    const name = developerText(nameInput?.value, 80);
    const description = developerText(descriptionInput?.value, 500);
    if (!name) { if (error) error.textContent = 'Give the room a name before saving.'; nameInput?.focus(); return; }
    if (!description) { if (error) error.textContent = 'Add a short description so the room is easy to understand later.'; descriptionInput?.focus(); return; }
    developerState.room.name = name;
    developerState.room.description = description;
    developerState.dirty = true;
    const action = developerRoomDialogAction;
    closeDeveloperRoomDialog();
    commitDeveloperRoom();
    if (typeof action === 'function') action();
}

function commitDeveloperRoom() {
    if (!developerState.room) return;
    developerState.room.updatedAt = new Date().toISOString();
    const index = developerRooms.findIndex(room => room.id === developerState.room.id);
    if (index >= 0) developerRooms[index] = cloneDeveloperRoom(developerState.room);
    else developerRooms.push(cloneDeveloperRoom(developerState.room));
    developerState.dirty = false;
    persistDeveloperRooms();
    renderDeveloperStudio();
}

function saveDeveloperRoom(afterSave = null) {
    if (!developerState.room) return;
    if (!developerState.room.name || !developerState.room.description) { openDeveloperRoomDialog(afterSave); return; }
    commitDeveloperRoom();
    if (typeof afterSave === 'function') afterSave();
}

function createBlankDeveloperRoom() {
    developerState.room = blankDeveloperRoom();
    developerState.selectedId = null;
    developerState.dirty = false;
    developerState.pointer = null;
    developerState.preview = null;
    developerState.undo = [];
    developerState.redo = [];
    developerState.playtesting = false;
    developerState.testPlayer = null;
    renderDeveloperStudio();
}

function newDeveloperRoom() {
    if (!developerStudioOpen) return;
    if (developerState.dirty && developerRoomHasContent()) {
        const saveFirst = confirm('Save the current room before creating a new one?');
        if (saveFirst) { saveDeveloperRoom(createBlankDeveloperRoom); return; }
    }
    createBlankDeveloperRoom();
}

function selectDeveloperRoom(id) {
    if (developerState.dirty && developerRoomHasContent() && !confirm('Discard unsaved changes and open another room?')) return;
    const room = developerRooms.find(entry => entry.id === id);
    if (!room) return;
    developerState.room = cloneDeveloperRoom(room);
    developerState.selectedId = null;
    developerState.dirty = false;
    developerState.pointer = null;
    developerState.preview = null;
    developerState.undo = [];
    developerState.redo = [];
    developerState.playtesting = false;
    renderDeveloperStudio();
}

function closeDeveloperStudio() {
    if (developerState.dirty && developerRoomHasContent() && !confirm('Exit without saving this room?')) return;
    developerStudioOpen = false;
    developerState.playtesting = false;
    document.getElementById('developerStudio').style.display = 'none';
    showMenu('mainMenu');
}

function openDeveloperStudio() {
    if (!isDeveloperUnlocked()) { openDeveloperUnlock(); return; }
    developerStudioOpen = true;
    document.querySelectorAll('.menu-panel').forEach(panel => panel.style.display = 'none');
    document.getElementById('developerStudio').style.display = 'flex';
    if (!developerState.room) {
        if (developerRooms.length) selectDeveloperRoom(developerRooms[0].id);
        else createBlankDeveloperRoom();
    } else renderDeveloperStudio();
    setTimeout(() => developerCanvas?.focus(), 0);
}

function showMenu(menuId) {
    const studio = document.getElementById('developerStudio');
    if (studio) studio.style.display = 'none';
    developerStudioOpen = false;
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
    if (menuId === 'infoMenu') setInfoTab(infoTab);
    if (menuId === 'diffMenu') renderRunSetup();
    if (menuId === 'mapMenu') renderMapMenu();
    refreshDeveloperAccess();
}

function developerSnapshot() {
    return developerState.room ? JSON.stringify(developerState.room) : null;
}

function developerPushUndo() {
    const snapshot = developerSnapshot();
    if (!snapshot) return;
    developerState.undo.push(snapshot);
    if (developerState.undo.length > 40) developerState.undo.shift();
    developerState.redo = [];
}

function markDeveloperDirty() {
    developerState.dirty = true;
    if (developerState.room) developerState.room.updatedAt = new Date().toISOString();
    renderDeveloperStudio();
}

function developerUndo() {
    if (!developerState.undo.length || !developerState.room) return;
    developerState.redo.push(developerSnapshot());
    developerState.room = normalizeDeveloperRoom(JSON.parse(developerState.undo.pop()));
    developerState.selectedId = null;
    developerState.dirty = true;
    renderDeveloperStudio();
}

function developerRedo() {
    if (!developerState.redo.length || !developerState.room) return;
    developerState.undo.push(developerSnapshot());
    developerState.room = normalizeDeveloperRoom(JSON.parse(developerState.redo.pop()));
    developerState.selectedId = null;
    developerState.dirty = true;
    renderDeveloperStudio();
}

function setDeveloperTool(tool) {
    if (!['select','floor','wall','decoration','spawn','connection','eraser'].includes(tool)) return;
    developerState.playtesting = false;
    developerState.tool = tool;
    developerState.pointer = null;
    developerState.preview = null;
    renderDeveloperStudio();
}

function renderDeveloperRoomList() {
    const list = document.getElementById('developerRoomList');
    if (!list) return;
    if (!developerRooms.length) {
        list.innerHTML = '<div class="developer-empty-rooms">No saved rooms yet.<br>Build one on the canvas, then press SAVE.</div>';
        return;
    }
    list.innerHTML = developerRooms.map(room => `<button class="developer-room-entry ${developerState.room?.id === room.id ? 'active' : ''}" data-developer-room-id="${escapeDeveloperHtml(room.id)}"><strong>${escapeDeveloperHtml(room.name || 'Untitled room')}</strong><small>${room.objects.length} objects${developerState.room?.id === room.id && developerState.dirty ? ' · unsaved' : ''}</small></button>`).join('');
    list.querySelectorAll('[data-developer-room-id]').forEach(button => button.addEventListener('click', () => selectDeveloperRoom(button.dataset.developerRoomId)));
}

function developerToolLabel() {
    if (developerState.playtesting) return 'PLAY TEST · WASD / ARROWS move the test player · ESC exits';
    const labels = {
        select:'SELECT · Click an object to inspect it.',
        floor:'FLOOR · Drag a rectangle to paint a floor area.',
        wall:'WALL · Drag a rectangle to add collision-ready wall geometry.',
        decoration:'DECOR · Click to place the selected decoration.',
        spawn:'SPAWN · Click to place the selected gameplay marker.',
        connection:'CONNECT · Click where another room can connect.',
        eraser:'ERASER · Click an object to remove it.'
    };
    return labels[developerState.tool] || labels.select;
}

function renderDeveloperStudio() {
    if (!developerState.room) return;
    const room = developerState.room;
    const summary = document.getElementById('developerRoomSummary');
    if (summary) summary.innerHTML = `<strong>${escapeDeveloperHtml(room.name || 'Untitled room')}</strong><br>${escapeDeveloperHtml(room.description || 'This room still needs a description.') }<br><span style="color:#81939a">${room.width} × ${room.height} · ${room.objects.length} objects</span>`;
    const floor = document.getElementById('developerFloorColor');
    const wall = document.getElementById('developerWallColor');
    const accent = document.getElementById('developerAccentColor');
    if (floor && floor.value !== room.floorColor) floor.value = room.floorColor;
    if (wall && wall.value !== room.wallColor) wall.value = room.wallColor;
    if (accent && accent.value !== room.accentColor) accent.value = room.accentColor;
    document.querySelectorAll('[data-dev-tool]').forEach(button => button.classList.toggle('active-dev-tool', button.dataset.devTool === developerState.tool));
    const decorationOption = document.getElementById('developerDecorationOption');
    const spawnOption = document.getElementById('developerSpawnOption');
    const connectionOption = document.getElementById('developerConnectionOption');
    if (decorationOption) decorationOption.style.display = developerState.tool === 'decoration' ? 'flex' : 'none';
    if (spawnOption) spawnOption.style.display = developerState.tool === 'spawn' ? 'flex' : 'none';
    if (connectionOption) connectionOption.style.display = developerState.tool === 'connection' ? 'flex' : 'none';
    const selection = room.objects.find(object => object.id === developerState.selectedId);
    const selectionSummary = document.getElementById('developerSelectionSummary');
    const deleteButton = document.getElementById('developerDeleteButton');
    if (selectionSummary) selectionSummary.innerHTML = selection ? `<strong>${escapeDeveloperHtml(selection.subtype || selection.type).toUpperCase()}</strong><br>${Math.round(selection.x)}, ${Math.round(selection.y)}${selection.width ? `<br>${Math.round(selection.width)} × ${Math.round(selection.height)}` : ''}` : 'Nothing selected.';
    if (deleteButton) deleteButton.disabled = !selection;
    const status = document.getElementById('developerToolStatus');
    const dirty = document.getElementById('developerDirtyStatus');
    if (status) status.textContent = developerToolLabel();
    if (dirty) { dirty.textContent = developerState.dirty ? 'UNSAVED' : 'SAVED'; dirty.style.color = developerState.dirty ? '#ffd36b' : '#8fffa1'; }
    const hint = document.getElementById('developerCanvasHint');
    if (hint) hint.classList.toggle('hidden', Boolean(room.objects.length || room.name));
    renderDeveloperCanvas();
    renderDeveloperRoomList();
}

let developerView = { scale:1, offsetX:0, offsetY:0 };

function developerCanvasPoint(event) {
    if (!developerCanvas || !developerState.room) return null;
    const rect = developerCanvas.getBoundingClientRect();
    const screenX = (event.clientX - rect.left) * developerCanvas.width / rect.width;
    const screenY = (event.clientY - rect.top) * developerCanvas.height / rect.height;
    return {
        x: developerNumber((screenX - developerView.offsetX) / developerView.scale, 0, developerState.room.width, 0),
        y: developerNumber((screenY - developerView.offsetY) / developerView.scale, 0, developerState.room.height, 0)
    };
}

function snapDeveloperPoint(point) {
    const room = developerState.room;
    const maxX = Math.max(0, (room?.width || DEVELOPER_CANVAS_WIDTH) - DEVELOPER_GRID_SIZE);
    const maxY = Math.max(0, (room?.height || DEVELOPER_CANVAS_HEIGHT) - DEVELOPER_GRID_SIZE);
    return { x: developerNumber(Math.round(point.x / DEVELOPER_GRID_SIZE) * DEVELOPER_GRID_SIZE, 0, maxX, 0), y: developerNumber(Math.round(point.y / DEVELOPER_GRID_SIZE) * DEVELOPER_GRID_SIZE, 0, maxY, 0) };
}

function developerDrawGrid(context, room) {
    context.strokeStyle = 'rgba(255,255,255,.08)';
    context.lineWidth = 1 / developerView.scale;
    context.beginPath();
    for (let x = 0; x <= room.width; x += DEVELOPER_GRID_SIZE) { context.moveTo(x, 0); context.lineTo(x, room.height); }
    for (let y = 0; y <= room.height; y += DEVELOPER_GRID_SIZE) { context.moveTo(0, y); context.lineTo(room.width, y); }
    context.stroke();
}

function developerDrawDecoration(context, object) {
    const left = object.x - object.width / 2, top = object.y - object.height / 2;
    context.fillStyle = object.color;
    context.strokeStyle = 'rgba(255,255,255,.5)';
    context.lineWidth = 1.5 / developerView.scale;
    if (object.subtype === 'poster' || object.subtype === 'sign') {
        context.fillRect(left, top, object.width, object.height);
        context.strokeRect(left, top, object.width, object.height);
        context.fillStyle = '#101416';
        context.fillRect(left + object.width * .22, top + object.height * .2, object.width * .56, Math.max(3, object.height * .08));
        context.fillRect(left + object.width * .22, top + object.height * .4, object.width * .4, Math.max(3, object.height * .08));
    } else if (object.subtype === 'lamp') {
        context.beginPath(); context.arc(object.x, object.y, Math.min(object.width, object.height) / 2, 0, Math.PI * 2); context.fill(); context.stroke();
        context.fillStyle = 'rgba(255,235,150,.2)'; context.beginPath(); context.arc(object.x, object.y, object.width * 1.8, 0, Math.PI * 2); context.fill();
    } else {
        context.fillRect(left, top, object.width, object.height); context.strokeRect(left, top, object.width, object.height);
        if (object.subtype === 'bench') { context.fillStyle = '#171a1a'; context.fillRect(left + 5, object.y - 2, object.width - 10, 4); }
        if (object.subtype === 'locker') { context.strokeStyle = '#b5c2c2'; context.beginPath(); context.moveTo(object.x, top + 4); context.lineTo(object.x, top + object.height - 4); context.stroke(); }
    }
}

function developerDrawObject(context, object, room) {
    context.save();
    if (object.type === 'floor' || object.type === 'wall') {
        context.fillStyle = object.type === 'wall' ? room.wallColor : room.floorColor;
        context.fillRect(object.x, object.y, object.width, object.height);
        context.strokeStyle = object.type === 'wall' ? 'rgba(0,0,0,.72)' : 'rgba(255,255,255,.12)';
        context.lineWidth = 2 / developerView.scale; context.strokeRect(object.x, object.y, object.width, object.height);
    } else if (object.type === 'decoration') {
        developerDrawDecoration(context, object);
    } else if (object.type === 'spawn') {
        const colors = { player:'#61d7ff', generator:'#8fffa1', nizar:'#bd9cff', monster:'#ff7979', item:'#ffd36b', exit:'#fff' };
        context.fillStyle = colors[object.subtype] || room.accentColor; context.strokeStyle = '#0b1012'; context.lineWidth = 3 / developerView.scale;
        context.beginPath(); context.arc(object.x, object.y, 12, 0, Math.PI * 2); context.fill(); context.stroke();
        context.fillStyle = '#0b1012'; context.font = `${Math.max(9, 10 / developerView.scale)}px Courier New`; context.textAlign = 'center'; context.fillText(object.subtype[0].toUpperCase(), object.x, object.y + 4);
    } else if (object.type === 'connection') {
        const s = 18;
        context.fillStyle = room.accentColor; context.strokeStyle = '#0b1012'; context.lineWidth = 2 / developerView.scale;
        context.beginPath();
        if (object.subtype === 'north') { context.moveTo(object.x, object.y - s); context.lineTo(object.x - s, object.y + s); context.lineTo(object.x + s, object.y + s); }
        if (object.subtype === 'south') { context.moveTo(object.x, object.y + s); context.lineTo(object.x - s, object.y - s); context.lineTo(object.x + s, object.y - s); }
        if (object.subtype === 'west') { context.moveTo(object.x - s, object.y); context.lineTo(object.x + s, object.y - s); context.lineTo(object.x + s, object.y + s); }
        if (object.subtype === 'east') { context.moveTo(object.x + s, object.y); context.lineTo(object.x - s, object.y - s); context.lineTo(object.x - s, object.y + s); }
        context.closePath(); context.fill(); context.stroke();
    }
    if (developerState.selectedId === object.id) {
        context.strokeStyle = '#ffd36b'; context.lineWidth = 3 / developerView.scale; context.setLineDash([7 / developerView.scale, 5 / developerView.scale]);
        if (object.type === 'spawn' || object.type === 'connection') { context.beginPath(); context.arc(object.x, object.y, 22, 0, Math.PI * 2); context.stroke(); }
        else if (object.type === 'decoration') context.strokeRect(object.x - object.width / 2 - 4, object.y - object.height / 2 - 4, object.width + 8, object.height + 8);
        else context.strokeRect(object.x - 4, object.y - 4, object.width + 8, object.height + 8);
    }
    context.restore();
}

function renderDeveloperCanvas() {
    if (!developerContext || !developerCanvas) return;
    const context = developerContext;
    context.clearRect(0, 0, developerCanvas.width, developerCanvas.height);
    if (!developerState.room) { context.fillStyle = '#070b0c'; context.fillRect(0, 0, developerCanvas.width, developerCanvas.height); return; }
    const room = developerState.room;
    developerView.scale = Math.min((developerCanvas.width - 28) / room.width, (developerCanvas.height - 28) / room.height);
    developerView.offsetX = (developerCanvas.width - room.width * developerView.scale) / 2;
    developerView.offsetY = (developerCanvas.height - room.height * developerView.scale) / 2;
    context.fillStyle = '#070b0c'; context.fillRect(0, 0, developerCanvas.width, developerCanvas.height);
    context.save(); context.translate(developerView.offsetX, developerView.offsetY); context.scale(developerView.scale, developerView.scale);
    context.fillStyle = room.floorColor; context.fillRect(0, 0, room.width, room.height);
    developerDrawGrid(context, room);
    room.objects.forEach(object => developerDrawObject(context, object, room));
    if (developerState.preview) {
        const preview = developerState.preview;
        context.save(); context.setLineDash([8 / developerView.scale, 5 / developerView.scale]); context.strokeStyle = room.accentColor; context.fillStyle = `${room.accentColor}33`; context.lineWidth = 2 / developerView.scale;
        context.fillRect(preview.x, preview.y, preview.width, preview.height); context.strokeRect(preview.x, preview.y, preview.width, preview.height); context.restore();
    }
    if (developerState.playtesting && developerState.testPlayer) {
        context.fillStyle = '#61d7ff'; context.strokeStyle = '#fff'; context.lineWidth = 3 / developerView.scale;
        context.beginPath(); context.arc(developerState.testPlayer.x, developerState.testPlayer.y, 11, 0, Math.PI * 2); context.fill(); context.stroke();
    }
    context.strokeStyle = room.accentColor; context.lineWidth = 3 / developerView.scale; context.strokeRect(0, 0, room.width, room.height);
    context.restore();
}

function developerObjectAt(point) {
    if (!developerState.room) return null;
    for (let index = developerState.room.objects.length - 1; index >= 0; index--) {
        const object = developerState.room.objects[index];
        if (object.type === 'spawn' || object.type === 'connection') {
            if (Math.hypot(point.x - object.x, point.y - object.y) <= 22) return object;
        } else {
            const left = object.type === 'decoration' ? object.x - object.width / 2 : object.x;
            const top = object.type === 'decoration' ? object.y - object.height / 2 : object.y;
            if (point.x >= left && point.x <= left + object.width && point.y >= top && point.y <= top + object.height) return object;
        }
    }
    return null;
}

function addDeveloperPointObject(point) {
    const room = developerState.room;
    if (!room) return;
    const snapped = snapDeveloperPoint(point);
    let object;
    if (developerState.tool === 'decoration') object = { id:developerId('decor'), type:'decoration', subtype:document.getElementById('developerDecorationType').value, x:snapped.x, y:snapped.y, width:32, height:32, color:room.accentColor };
    if (developerState.tool === 'spawn') object = { id:developerId('spawn'), type:'spawn', subtype:document.getElementById('developerSpawnType').value, x:snapped.x, y:snapped.y, width:0, height:0, color:room.accentColor };
    if (developerState.tool === 'connection') object = { id:developerId('connection'), type:'connection', subtype:document.getElementById('developerConnectionDirection').value, x:snapped.x, y:snapped.y, width:0, height:0, color:room.accentColor };
    if (!object) return;
    developerPushUndo(); room.objects.push(object); developerState.selectedId = object.id; markDeveloperDirty();
}

function developerPointerDown(event) {
    if (!developerStudioOpen || developerState.playtesting || !developerState.room) return;
    event.preventDefault(); developerCanvas.setPointerCapture?.(event.pointerId);
    const rawPoint = developerCanvasPoint(event); if (!rawPoint) return;
    const point = snapDeveloperPoint(rawPoint);
    if (developerState.tool === 'select') { developerState.selectedId = developerObjectAt(point)?.id || null; renderDeveloperStudio(); return; }
    if (developerState.tool === 'eraser') { const object = developerObjectAt(point); if (object) { developerPushUndo(); developerState.room.objects = developerState.room.objects.filter(entry => entry.id !== object.id); developerState.selectedId = null; markDeveloperDirty(); } return; }
    if (developerState.tool === 'floor' || developerState.tool === 'wall') { developerState.pointer = { start:point, current:point }; developerState.preview = { x:point.x, y:point.y, width:0, height:0 }; renderDeveloperCanvas(); return; }
    addDeveloperPointObject(point);
}

function developerPointerMove(event) {
    if (!developerState.pointer || !developerState.room) return;
    const rawPoint = developerCanvasPoint(event); if (!rawPoint) return;
    const point = snapDeveloperPoint(rawPoint);
    const left = Math.min(developerState.pointer.start.x, point.x), top = Math.min(developerState.pointer.start.y, point.y);
    developerState.pointer.current = point;
    developerState.preview = { x:left, y:top, width:Math.max(DEVELOPER_GRID_SIZE, Math.abs(point.x - developerState.pointer.start.x)), height:Math.max(DEVELOPER_GRID_SIZE, Math.abs(point.y - developerState.pointer.start.y)) };
    renderDeveloperCanvas();
}

function developerPointerUp(event) {
    if (!developerState.pointer || !developerState.room) return;
    const rawPoint = developerCanvasPoint(event); if (!rawPoint) return;
    const point = snapDeveloperPoint(rawPoint);
    const left = Math.min(developerState.pointer.start.x, point.x), top = Math.min(developerState.pointer.start.y, point.y);
    const width = Math.max(DEVELOPER_GRID_SIZE, Math.abs(point.x - developerState.pointer.start.x));
    const height = Math.max(DEVELOPER_GRID_SIZE, Math.abs(point.y - developerState.pointer.start.y));
    developerPushUndo();
    const type = developerState.tool;
    const color = type === 'wall' ? developerState.room.wallColor : developerState.room.floorColor;
    const object = { id:developerId(type), type, subtype:'', x:left, y:top, width, height, color };
    developerState.room.objects.push(object); developerState.selectedId = object.id; developerState.pointer = null; developerState.preview = null; markDeveloperDirty();
}

function deleteDeveloperSelection() {
    if (!developerState.room || !developerState.selectedId) return;
    developerPushUndo(); developerState.room.objects = developerState.room.objects.filter(object => object.id !== developerState.selectedId); developerState.selectedId = null; markDeveloperDirty();
}

function developerTestMove(dx, dy) {
    if (!developerState.testPlayer || !developerState.room) return;
    const radius = 10;
    const next = { x:developerState.testPlayer.x + dx, y:developerState.testPlayer.y + dy };
    if (next.x < radius || next.y < radius || next.x > developerState.room.width - radius || next.y > developerState.room.height - radius) return;
    const blocked = developerState.room.objects.some(object => object.type === 'wall' && next.x + radius > object.x && next.x - radius < object.x + object.width && next.y + radius > object.y && next.y - radius < object.y + object.height);
    if (!blocked) developerState.testPlayer = next;
    renderDeveloperCanvas();
}

function developerPlaytest() {
    if (!developerState.room) return;
    developerState.playtesting = !developerState.playtesting;
    if (developerState.playtesting) {
        const spawn = developerState.room.objects.find(object => object.type === 'spawn' && object.subtype === 'player');
        developerState.testPlayer = spawn ? { x:spawn.x, y:spawn.y } : { x:developerState.room.width / 2, y:developerState.room.height / 2 };
        developerState.tool = 'select';
    } else developerState.testPlayer = null;
    renderDeveloperStudio();
}

function developerFitCanvas() {
    renderDeveloperCanvas();
    notify('ROOM FIT TO CANVAS', 'info');
}

function downloadDeveloperJson(payload, fileName) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = fileName; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

function exportDeveloperRoom() {
    if (!developerState.room) return;
    if (!developerState.room.name || !developerState.room.description) { saveDeveloperRoom(() => exportDeveloperRoom()); return; }
    downloadDeveloperJson(developerState.room, `calebs-shift-room-${developerState.room.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'untitled'}.json`);
    notify('ROOM FILE EXPORTED', 'unlock');
}

function exportDeveloperRooms() {
    if (!developerRooms.length) { notify('SAVE A ROOM BEFORE EXPORTING', 'warning'); return; }
    downloadDeveloperJson({ format:'calebs-shift-room-collection', version:1, rooms:developerRooms }, 'calebs-shift-room-collection.json');
    notify('ROOM COLLECTION EXPORTED', 'unlock');
}

function importDeveloperRoom(event) {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsed = JSON.parse(reader.result);
            const sourceRooms = Array.isArray(parsed?.rooms) ? parsed.rooms : [parsed];
            const imported = sourceRooms.map(normalizeDeveloperRoom).filter(Boolean).map(room => ({ ...room, id:developerId('imported'), updatedAt:new Date().toISOString() }));
            if (!imported.length) throw new Error('No rooms');
            developerRooms.push(...imported); persistDeveloperRooms(); developerState.room = cloneDeveloperRoom(imported.at(-1)); developerState.selectedId = null; developerState.dirty = false; developerState.undo = []; developerState.redo = []; renderDeveloperStudio(); notify(`${imported.length} ROOM${imported.length === 1 ? '' : 'S'} IMPORTED`, 'unlock');
        } catch (_) { notify('THAT ROOM FILE IS INVALID', 'danger'); }
        event.target.value = '';
    };
    reader.readAsText(file);
}

function setupDeveloperStudio() {
    document.querySelectorAll('[data-dev-tool]').forEach(button => button.addEventListener('click', () => setDeveloperTool(button.dataset.devTool)));
    developerCanvas?.addEventListener('pointerdown', developerPointerDown);
    developerCanvas?.addEventListener('pointermove', developerPointerMove);
    developerCanvas?.addEventListener('pointerup', developerPointerUp);
    developerCanvas?.addEventListener('pointercancel', () => { developerState.pointer = null; developerState.preview = null; renderDeveloperCanvas(); });
    [['developerFloorColor','floorColor'],['developerWallColor','wallColor'],['developerAccentColor','accentColor']].forEach(([id, field]) => document.getElementById(id)?.addEventListener('change', event => { if (!developerState.room) return; developerPushUndo(); developerState.room[field] = event.target.value; markDeveloperDirty(); }));
    document.getElementById('developerCodeInput')?.addEventListener('keydown', event => { if (event.key === 'Enter') submitDeveloperUnlock(); if (event.key === 'Escape') closeDeveloperUnlock(); });
    document.getElementById('developerRoomDescriptionInput')?.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') submitDeveloperRoomDetails(); });
    refreshDeveloperAccess();
}

function showInstallHelp() { showMenu('installMenu'); }

let challengeBoard = [];
function getChallengeBoard() {
    const maps = unlockedMaps.length ? unlockedMaps : ['level0'];
    const templates = [
        { id:'blackout', title:'BLACKOUT CONTRACT', detail:'Safe rooms can fail and the grid needs an extra generator.', reward:48, diff:1 },
        { id:'pressure', title:'PRESSURE CONTRACT', detail:'Events recover faster; every repair makes a disturbance.', reward:55, diff:2 },
        { id:'lean', title:'LEAN SHIFT', detail:'Bring only the custom kit you select; field supplies are scarce.', reward:52, diff:1 },
        { id:'double', title:'TWO HUNTERS', detail:'Two monsters search together and share line-of-sight alerts.', reward:65, diff:2 },
        { id:'relay', title:'RELAY RUN', detail:'Every generator uses multiple repair stages.', reward:58, diff:2 },
        { id:'fog', title:'FOG ROLL', detail:'A rolling fog cuts visibility but reveals active generators.', reward:54, diff:1 }
    ];
    const shuffledTemplates = [...templates].sort(() => Math.random() - .5);
    return [0, 1, 2].map(index => ({ ...shuffledTemplates[index], mapId:maps[Math.floor(Math.random() * maps.length)] }));
}
function openChallengeMode() { gameMode = 'challenge'; challengeConfig = null; challengeBoard = getChallengeBoard(); showMenu('challengeMenu'); renderChallenges(); }
function renderChallenges() { const content = document.getElementById('challengeContent'); if (content) content.innerHTML = challengeBoard.map((challenge, index) => `<button class="loadout-option" onclick="startChallenge(${index})"><b>${challenge.title}</b><br><span>${MAP_DEFINITIONS[challenge.mapId].name} · ${challenge.detail}</span><br><span style="color:#ffe06b">REWARD: ${challenge.reward} TOKENS</span></button>`).join(''); }
function startChallenge(index) { const challenge = challengeBoard[index]; if (!challenge) return; gameMode = 'challenge'; challengeConfig = challenge; currentMapId = challenge.mapId; if (challenge.id === 'lean' && !Object.keys(customLoadouts[0] || {}).length) { notify('BUILD CUSTOM KIT 1 BEFORE STARTING LEAN SHIFT', 'warning'); return; } if (challenge.id === 'lean') selectedLoadout = 'custom1'; startGame(challenge.diff); }

function chooseMode(mode) {
    gameMode = mode;
    survivalConfig = null;
    challengeConfig = null;
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
            const highScore = gameMode === 'endless' ? `<br><span style="font-size:12px;color:#ffe06b">ROUND HIGH SCORE: ${stats.endlessMapBest?.[mapDef.id] || 0}</span>` : '';
            return `<button ${disabled ? 'disabled' : ''} onclick="selectMap('${mapDef.id}')"><b>${mapDef.name}</b><br><span style="font-size:12px;color:#aaa">${disabled ? 'Complete the previous campaign map first.' : mapDef.description}</span><br><span style="font-size:12px;color:${disabled ? '#777' : '#0f0'}">${label}</span>${highScore}</button>`;
    }).join('');
}

function selectMap(mapId) {
    if (!MAP_DEFINITIONS[mapId] || !unlockedMaps.includes(mapId)) return;
    if (gameMode === 'campaign' && MAP_DEFINITIONS[mapId].campaignOrder > campaignCleared.length) return;
    currentMapId = mapId;
    campaignStartAtBoss = false;
    if (gameMode === 'campaign' && mapId === 'lucas' && campaignCleared.includes('lucas')) {
        showMenu('lucasCampaignChoice');
        return;
    }
    if (gameMode === 'survival') {
        const survivalMap = document.getElementById('survivalMap');
        if (survivalMap) survivalMap.value = mapId;
    }
    showMenu('diffMenu');
}

function chooseLucasCampaignStart(startAtBoss) {
    if (gameMode !== 'campaign' || currentMapId !== 'lucas' || !campaignCleared.includes('lucas')) {
        showMenu('mapMenu');
        return;
    }
    campaignStartAtBoss = Boolean(startAtBoss);
    showMenu('diffMenu');
}

function startSelectedGame(diffLevel) {
    if (gameMode === 'survival') { startSurvival(); return; }
    const startAtBoss = campaignStartAtBoss;
    campaignStartAtBoss = false;
    startGame(diffLevel, startAtBoss);
}

function startSurvival() {
    const names = [];
    if (document.getElementById('survivalCaleb').checked) names.push('CALEB');
    if (document.getElementById('survivalMalakai').checked) names.push('MALAKAI');
    if (document.getElementById('survivalJordan').checked) names.push('JORDAN');
    if (document.getElementById('survivalAeson').checked) names.push('AESON');
    if (document.getElementById('survivalBassam')?.checked) names.push('BASSAM');
    if (document.getElementById('survivalRhys')?.checked) names.push('RHYS');
    if (document.getElementById('survivalNoah')?.checked) names.push('NOAH');
    if (document.getElementById('survivalAmine')?.checked) names.push('AMINE');
    if (document.getElementById('survivalNizar')?.checked) names.push('NIZAR');
    if (names.length === 0) { showMsg('SELECT AT LEAST ONE MONSTER', 1600); return; }
    gameMode = 'survival';
    endlessRound = 1;
    currentMapId = document.getElementById('survivalMap').value;
    if (!unlockedMaps.includes(currentMapId)) { showMsg('UNLOCK THIS MAP IN CAMPAIGN FIRST', 1400); return; }
    survivalConfig = {
        names,
        count: Math.max(1, Math.min(8, Number(document.getElementById('survivalCount').value) || 1)),
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

let infoTab = 'start', shopTab = 'upgrades';
function setInfoTab(tab) {
    infoTab = tab;
    document.querySelectorAll('[data-info-tab]').forEach(section => section.style.display = section.dataset.infoTab === tab ? '' : 'none');
    document.querySelectorAll('.info-tabs button').forEach(button => button.classList.toggle('active-tab', button.textContent.toLowerCase() === tab));
}
function setShopTab(tab) {
    shopTab = tab;
    document.querySelectorAll('#shopMenu .shop-item').forEach(item => {
        const text = item.textContent;
        const upgrade = /Running Shoes|Hacker Gloves|Quick Hands|Lucky Coin|Dash Module/.test(text);
        item.style.display = tab === 'maps' ? 'none' : ((tab === 'upgrades') === upgrade ? 'flex' : 'none');
    });
    renderMapIntelShop(tab);
    const carried = invAdrenaline + invFlashbang + invNoiseMaker + invBearTrap + invBattery + invBreathFilter + invSignalScrambler + invNeutralizer + invRepairKit + invFlare;
    const status = document.getElementById('shopCarryStatus'); if (status) status.textContent = `CARRIED SUPPLIES: ${carried}/8`;
    document.querySelectorAll('.shop-tabs button').forEach(button => button.classList.toggle('active-tab', button.textContent.toLowerCase() === tab));
}
function renderMapIntelShop(tab) {
    const content = document.getElementById('mapIntelShop'); if (!content) return;
    if (tab !== 'maps') { content.innerHTML = ''; return; }
    content.innerHTML = Object.values(MAP_DEFINITIONS).map((mapDef, index) => {
        const mastered = (mapMastery[mapDef.id] || []).filter(Boolean).length === 3;
        const owned = mapIntel.includes(mapDef.id), cost = 35 + index * 15;
        return `<div class="shop-item"><div><div>${mapDef.name} MAP INTEL</div><div class="shop-desc">${owned ? 'Press M / tap MAP during a run to view the full live layout.' : mastered ? 'All three difficulties cleared. Unlock the live map viewer.' : 'Clear Easy, Normal, and Hard on this map first.'}</div></div><button ${owned || !mastered ? 'disabled' : ''} onclick="buyMapIntel('${mapDef.id}',${cost})">${owned ? 'OWNED' : `${cost} T`}</button></div>`;
    }).join('');
}
function buyMapIntel(mapId, cost) { if (mapIntel.includes(mapId) || !(mapMastery[mapId] || []).every(Boolean) || tokens < cost) return; tokens -= cost; mapIntel.push(mapId); saveData(); setShopTab('maps'); }
function openShop() { showMenu('shopMenu'); setShopTab(shopTab); }

function buyUpgrade(type, baseCost) {
    if (type === 'dash' && upgDash) return;
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
        if (type === 'dash' && upgDash < 1) upgDash = 1;
        saveData();
    }
}
function buyConsumable(type, cost) {
    const carried = invAdrenaline + invFlashbang + invNoiseMaker + invBearTrap + invBattery + invBreathFilter + invSignalScrambler + invNeutralizer + invRepairKit + invFlare;
    if (carried >= 8) { setSaveStatus('Inventory full — carry at most 8 consumables', '#ffcc66'); return; }
    if (tokens >= cost) {
        tokens -= cost;
        if (type === 'adrenaline') invAdrenaline++;
        if (type === 'flashbang') invFlashbang++;
        if (type === 'noiseMaker') invNoiseMaker++;
        if (type === 'bearTrap') invBearTrap++;
        if (type === 'battery') invBattery++;
        if (type === 'breathFilter') invBreathFilter++;
        if (type === 'signalScrambler') invSignalScrambler++;
        if (type === 'neutralizer') invNeutralizer++;
        if (type === 'repairKit') invRepairKit++;
        if (type === 'flare') invFlare++;
        saveData();
        updateMenuData(); setShopTab(shopTab);
    }
}
function getInventoryCount(type) {
    return ({ adrenaline:invAdrenaline, flashbang:invFlashbang, noiseMaker:invNoiseMaker, bearTrap:invBearTrap, battery:invBattery, breathFilter:invBreathFilter, signalScrambler:invSignalScrambler, neutralizer:invNeutralizer, repairKit:invRepairKit, flare:invFlare })[type] || 0;
}
function discardConsumable(type) {
    if (!ITEM_DEFINITIONS[type] || getInventoryCount(type) <= 0) return;
    if (type === 'adrenaline') invAdrenaline--;
    if (type === 'flashbang') invFlashbang--;
    if (type === 'noiseMaker') invNoiseMaker--;
    if (type === 'bearTrap') invBearTrap--;
    if (type === 'battery') invBattery--;
    if (type === 'breathFilter') invBreathFilter--;
    if (type === 'signalScrambler') invSignalScrambler--;
    if (type === 'neutralizer') invNeutralizer--;
    if (type === 'repairKit') invRepairKit--;
    if (type === 'flare') invFlare--;
    saveData(); updateMenuData(); setShopTab(shopTab);
}

// Game Core Settings
const TS = 40;
// The maze sits inside a larger canvas grid. The spare border is used for real
// side rooms, so they are physically connected to the maze rather than painted on it.
let COLS = 41, ROWS = 33;
const MAZE_LEFT = 5, MAZE_TOP = 5, MAZE_COLS = 31, MAZE_ROWS = 23;
let state = 0; let currentDiff = 0; let rewardTokens = 0;
let gameMode = 'challenge', endlessRound = 1, survivalConfig = null, challengeConfig = null, eventsEnabled = true, safeRoomsReliable = true;
let currentMapId = 'level0';
let campaignStartAtBoss = false;

let map = [], floors = [], rooms = [], fuses = [], hidingSpots = [], coolingValves = [], employees = [];
let reservedObjectTiles = new Set(), hotelDoorTiles = [], hotelBlockedDoor = null, hotelCorridorSections = [];
let centralBoiler = null, boilerShutdown = false, boilerReadyShown = false;
let hotelElevator = null, hotelLockdownTimer = 0, hotelEventCooldown = 0, hotelLockdownActive = false;
let rhysSeal = null, rhysChest = null, rhysChestKey = null, rhysBreakWall = null, rhysTrap = null, rhysRoute = 'search', rhysSealCollected = false, rhysTrapArmed = false;
let forestCabins = [], forestBreakers = [], forestTrees = [], forestBeaconBattery = null, forestWatchtower = null, forestBeaconActive = false, forestFogTimer = 0, forestFogCooldown = 0, forestGuideTimer = 0, forestGuideCooldown = 1200, forestGuideMode = 'cabins', noahState = 'hidden', noahTimer = 0, noahPathTimer = 0, noahCharge = null, noahLightningCooldown = 0, noahLightningZones = [], noahLightningPending = [], noahLightningWarning = 0, noahLightningFlashes = 0, noahShockTimer = 0, noahAppearanceWindow = 0;
let amineHoles = [], amineFireZones = [], amineExitGate = null, amineFocus = false, amineVisibleTimer = 0, amineFlashCooldown = 0, amineTeleportCooldown = 0, amineTurret = null, amineBullets = [], amineBurnTimer = 0, amineRoad = null;
let subwayPanels = [], subwayTrains = [], subwayTrackRows = [], subwayTrackSegments = [], subwayTrap = null, subwayControl = null, subwayRouteReady = false, subwayTrapArmed = false, subwayTrainWarning = 0, subwayTrainTriggered = false, subwayDecor = [], subwaySigns = [], subwayCommitTimer = 0, subwayCommitTarget = null, subwayRouteMinX = 0, subwayRouteMaxX = 0, subwayTrainPaths = [], subwayControlPuzzle = null;
let subwayTornTicket = null, subwayGoldSphere = null, subwayBronzeEligible = true, subwayFareCutscene = null, subwayGoldPressure = null;
let lucasFragments = [], lucasLevers = [], lucasAltar = null, lucasGate = null, lucasShadow = null, lucasArrows = [], lucasShadowPools = [], lucasRouteLocks = [], lucasLockSpots = [], lucasHazards = [], lucasMonsterStart = null, lucasState = 'searching', lucasObjectiveStage = 'fragment1', lucasAbilityCooldown = 0, lucasPoolCooldown = 0, lucasTeleportFlash = null, lucasCharge = null, lucasPull = null, lucasCarryFragment = null, lucasFragmentPuzzle = null, lucasEndingAnimation = null, lucasGateEndTimer = 0, lucasShadowEvent = null, lucasShadowEventCooldown = 0, lucasShadowEventTriggered = false;
let calebBoss = null;
let routeBoard = null;
const nizarCrashAudio = new Audio('assets/WallCrashSoundEffect.mp3');
nizarCrashAudio.preload = 'auto';
let luckyBlocks = [];
let playerTrail = [], trailLastX = 0, trailLastY = 0;
let hotelEmployeesRequired = 3, hotelDialogueOpen = false, hotelTaskSerial = 0;
let nearFuse = null, nearHide = null, nearValve = null, nearBoiler = false, nearEmployee = null, nearElevator = false, nearHotelTask = null, nearRhysSeal = false, nearRhysKey = false, nearRhysChest = false, nearRhysTrap = false;
let nearSubwayPanel = null, nearSubwayControl = false, nearLucasFragment = null, nearLucasLever = null, nearLucasAltar = false;
let nizarClones = [], nizarCloneCooldown = 2400, nizarCrush = null, nizarCrushCooldown = 900;
let player = { x: 0, y: 0, r: 12, baseSpeed: 3.8, speed: 3.8, boostTimer: 0, dashTimer: 0, stunTimer: 0, crouching: false, breathing: false, breathTimer: 0, breathCooldown: 0, heat: 0, inHeatZone: false, hidden: false, hideTimer: 0, hideCompromised: false };
let lastMoveX = 1, lastMoveY = 0;
let monster = { name: '', x: 0, y: 0, r: 14, drawRadius: 14, speed: 2.2, baseSpeed: 2.2, color: '', textColor: '', activeMutations: [], isReinforced: false, hasGloom: false, isResilient: false, hasScrambler: false, hasHexed: false, hasHallucinations: false, hasLockedIn: false, hasEcho: false, hasFalseObjective: false, hasWatcher: false, hasPanic: false, hasHeavyFootfall: false, hasAfterimage: false, allSeeing: false, heatAlertTimer: 0, heatAlertX: 0, heatAlertY: 0, stunTimer: 0, lastTargetC: -1, lastTargetR: -1 };
let monsters = [];
let camera = { x: 0, y: 0, targetZoom: 1.0, zoom: 1.0 };
let nearGen = null; 

let generators = [], activeGens = 0, totalGens = 0;
let puzzleSequence = [], circuitSequence = [], circuitStage = 0, circuitRequired = 3, currentGen = null;
let lastSingleMutation = null; 

// AI & Item Variables
let jordanState = 'saboteur', mimicTimer = 0, stateTimer = 0, jordanSabotageCooldown = 0, bassamState = 'roaming', bassamRevealPending = false, bassamTrapTaskId = null, bassamFakeTask = null, bassamStaffDepartment = 'FRONT DESK', bassamFakeLine = '', bassamAmbushActive = false, bassamRelentlessChase = false, bassamLostTimer = 0, bassamAmbushCooldown = 0, bassamDecoys = [], bassamDecoyCooldown = 720;
let hotelTaskGame = null;
let empTimer = 0, empWarning = 0, empActive = 0, flashAlpha = 0, scramblerTimer = 0, repairAssist = 0, flareTimer = 0, dashCooldown = 0;
let powerOutageTimer = 0, powerOutageCooldown = 0, flickerTimer = 0, flickerCooldown = 0, emergencyTimer = 0, emergencyCooldown = 0, outageFlickerTimer = 0;
let noiseTarget = null, noiseTimer = 0, bearTraps = [], heatZones = [], heatEventCooldown = 0;
let goopZones = [], goopShots = [], rhysSpitCooldown = 0, rhysDashTimer = 0, rhysChargeWindup = 0, rhysDashCooldown = 0, rhysDashTarget = null, rhysEventCooldown = 900, rhysSweepTimer = 0, rhysSweepRadius = 0, rhysPressureZones = [];
let groundLoot = [];
let heatOverlay = null;
let ambienceClock = 0;
let runStartedAt = 0, runItemsUsed = 0, hallucinationHudTimer = 0;
let mobileMenuPaused = false;

// Skill Check Variables
let scNeedle = 0, scSpeed = 0, scZoneStart = 0, scZoneEnd = 0, scHits = 0, scRequired = 0, scDelay = 0;
let tuneNeedle = 0, tuneSpeed = 0, tuneZoneStart = 0, tuneZoneEnd = 0, tuneHits = 0, tuneRequired = 0, tuneMisses = 0;
let rapidTarget = null, rapidHits = 0, rapidRequired = 0, rapidTimer = 0, rapidLimit = 0, generatorFailureStreak = 0, generatorFailureTarget = null;
let simonSequence = [], simonInput = 0, simonShowIndex = 0, simonTimer = 0, simonPhase = 'show', simonRound = 1, simonFlashChoice = -1, simonFlashTimer = 0;

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
        if (filtered) { invBreathFilter--; consumeLoadoutItem('breathFilter'); }
        player.breathTimer = filtered ? 480 : 300;
        player.breathing = true;
        if (filtered) { runItemsUsed++; stats.itemsUsed++; advanceDailyObjective('items'); saveData(); }
        showMsg('<span style="color:#b8aaff">HOLDING BREATH</span>', 800);
    }
}

function useBattery() {
    if (!itemAllowed('battery') || (state !== 1 && state !== 3) || invBattery <= 0 || powerOutageTimer <= 0) return;
    invBattery--; consumeLoadoutItem('battery'); runItemsUsed++; stats.itemsUsed++;
    advanceDailyObjective('items');
    powerOutageTimer = 0; powerOutageCooldown = 1500;
    playSound('success'); saveData(); updateHUD();
    showMsg('<span style="color:#b8eaff">EMERGENCY BATTERY USED</span>', 900);
}

function useSignalScrambler() {
    if (!itemAllowed('signalScrambler') || (state !== 1 && state !== 3) || invSignalScrambler <= 0 || scramblerTimer > 0) return;
    invSignalScrambler--; consumeLoadoutItem('signalScrambler'); scramblerTimer = 480; runItemsUsed++; stats.itemsUsed++; advanceDailyObjective('items');
    for (const enemy of monsters) { enemy.bloodHuntTimer = 0; enemy.heatAlertTimer = 0; enemy.path = []; }
    noiseTarget = null; noiseTimer = 0; saveData(); updateHUD();
    showMsg('<span style="color:#8ff">SIGNAL SCRAMBLER ACTIVE</span>', 900);
}

function useNeutralizer() {
    if (!itemAllowed('neutralizer') || state !== 1 || !monsters.some(enemy => enemy.name === 'RHYS') || invNeutralizer <= 0) return;
    invNeutralizer--; consumeLoadoutItem('neutralizer'); runItemsUsed++; stats.itemsUsed++; advanceDailyObjective('items');
    goopZones = goopZones.filter(zone => Math.hypot(zone.x - player.x, zone.y - player.y) > 180);
    rhysPressureZones = rhysPressureZones.filter(zone => Math.hypot(zone.x - player.x, zone.y - player.y) > 180);
    saveData(); updateHUD(); showMsg('<span style="color:#dfff70">GOOP NEUTRALIZED</span>', 850);
}

function useRepairKit() {
    if (!itemAllowed('repairKit') || state !== 1 || invRepairKit <= 0 || repairAssist > 0) return;
    invRepairKit--; consumeLoadoutItem('repairKit'); repairAssist = 1; runItemsUsed++; stats.itemsUsed++; advanceDailyObjective('items');
    saveData(); updateHUD(); showMsg('<span style="color:#bff">REPAIR KIT ARMED · NEXT TASK EASIER</span>', 850);
}

function useFlare() {
    if (!itemAllowed('flare') || (state !== 1 && state !== 3) || invFlare <= 0 || flareTimer > 0) return;
    invFlare--; consumeLoadoutItem('flare'); flareTimer = 360; runItemsUsed++; stats.itemsUsed++; advanceDailyObjective('items');
    noiseTarget = { x:player.x, y:player.y }; noiseTimer = 180;
    saveData(); updateHUD(); showMsg('<span style="color:#ffbf70">EMERGENCY FLARE · THEY HEARD IT</span>', 900);
}

function useDash() {
    if (!upgDash || (state !== 1 && state !== 3) || player.hidden || player.stunTimer > 0 || dashCooldown > 0 || hotelDialogueOpen) return;
    let dx = (keys.d ? 1 : 0) - (keys.a ? 1 : 0), dy = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
    if (!dx && !dy) { dx = lastMoveX; dy = lastMoveY; }
    if (!dx && !dy) return;
    if (dx && dy) { dx *= .707; dy *= .707; }
    const dashDistance = 86, stepDistance = 6, steps = Math.ceil(dashDistance / stepDistance);
    let moved = 0;
    for (let step = 0; step < steps; step++) {
        const beforeX = player.x, beforeY = player.y;
        moveEntity(player, dx * stepDistance, dy * stepDistance);
        moved += Math.hypot(player.x - beforeX, player.y - beforeY);
        if (Math.hypot(player.x - beforeX, player.y - beforeY) < .2) break;
    }
    if (moved < 10) return;
    player.dashTimer = 18;
    dashCooldown = 300;
    noiseTarget = { x: player.x, y: player.y }; noiseTimer = 150;
    playSound('tick'); showMsg('<span style="color:#8ff">DASH · 5s COOLDOWN</span>', 500); updateHUD();
}

function carriedSupplyCount() { return runLoadoutRemaining ? Object.values(runLoadoutRemaining).reduce((sum, amount) => sum + amount, 0) : invAdrenaline + invFlashbang + invNoiseMaker + invBearTrap + invBattery + invBreathFilter + invSignalScrambler + invNeutralizer + invRepairKit + invFlare; }
function addSupply(type) {
    if (!ITEM_DEFINITIONS[type] || carriedSupplyCount() >= 8) return false;
    if (type === 'adrenaline') invAdrenaline++; else if (type === 'flashbang') invFlashbang++; else if (type === 'noiseMaker') invNoiseMaker++; else if (type === 'bearTrap') invBearTrap++; else if (type === 'battery') invBattery++; else if (type === 'breathFilter') invBreathFilter++; else if (type === 'signalScrambler') invSignalScrambler++; else if (type === 'neutralizer') invNeutralizer++; else if (type === 'repairKit') invRepairKit++; else if (type === 'flare') invFlare++;
    if (runLoadoutRemaining) runLoadoutRemaining[type] = (runLoadoutRemaining[type] || 0) + 1;
    return true;
}
function spawnGroundLoot() {
    groundLoot = [];
    const types = ['battery','noiseMaker','flashbang','repairKit','flare','bearTrap'];
    for (let index = 0; index < 2 + (Math.random() < .5 ? 1 : 0); index++) {
        const candidates = floors.filter(tile => {
            const x = tile.c * TS + TS / 2, y = tile.r * TS + TS / 2;
            return !isSafeRoom(x, y) && !isReservedObjectSpot(x, y, TS * 2) && !generators.some(generator => Math.hypot(generator.x - x, generator.y - y) < TS * 3) && !groundLoot.some(loot => Math.hypot(loot.x - x, loot.y - y) < TS * 5);
        });
        const tile = candidates[Math.floor(Math.random() * Math.max(1, candidates.length))];
        if (tile) groundLoot.push({ x:tile.c * TS + TS / 2, y:tile.r * TS + TS / 2, type:types[Math.floor(Math.random() * types.length)] });
    }
}

function spawnLuckyBlocks() {
    luckyBlocks = [];
    if (Math.random() > .28) return;
    const candidates = floors.filter(tile => isOpenObjectSpot(tile.c*TS+TS/2,tile.r*TS+TS/2,TS*4) && Math.hypot(tile.c*TS+TS/2-player.x,tile.r*TS+TS/2-player.y)>TS*8 && !amineHoles.some(h=>h.c===tile.c&&h.r===tile.r));
    const tile = candidates[Math.floor(Math.random()*candidates.length)]; if (tile) luckyBlocks.push({ x:tile.c*TS+TS/2,y:tile.r*TS+TS/2,opened:false });
}
function openLuckyBlock(block) {
    if (!block || block.opened) return; block.opened=true; noiseTarget={x:block.x,y:block.y}; noiseTimer=300;
    const roll=Math.random();
    if (roll<.42) { const types=Object.keys(ITEM_DEFINITIONS); const type=types[Math.floor(Math.random()*types.length)]; if (addSupply(type)) notify(`SHIFT CACHE · ${ITEM_DEFINITIONS[type].toUpperCase()}`, 'unlock'); else notify('SHIFT CACHE · INVENTORY FULL','warning'); }
    else if (roll<.67) { const gen=generators.find(g=>!g.active&&!g.isFalse); if (gen) { gen.active=true; gen.repairFlash=45; activeGens++; stats.generators++; if (stats.generators >= 1000) unlockCosmetic('generator'); notify('SHIFT CACHE · GENERATOR COMPLETED','unlock'); checkPhase(); } }
    else if (roll<.84) { const tile=floors.find(t=>!isRhysEarlyLockedTile(t)&&!amineHoles.some(h=>h.c===t.c&&h.r===t.r)&&!amineFireZones.some(z=>Math.hypot(z.x-(t.c*TS+TS/2),z.y-(t.r*TS+TS/2))<z.radius+20)&&isOpenObjectSpot(t.c*TS+TS/2,t.r*TS+TS/2,TS*4)); if (tile) { generators.push({x:tile.c*TS+TS/2,y:tile.r*TS+TS/2,r:12,active:false,type:'normal',isFalse:false,repairFlash:0,stage:0,requiredStages:3,requiredFuses:2,collectedFuses:0}); totalGens++; notify('SHIFT CACHE · NEW GENERATOR DETECTED','danger'); updateHUD(); } }
    else { player.boostTimer=Math.max(player.boostTimer,300); notify('SHIFT CACHE · SURGE BOOST','unlock'); }
}

function toggleHide() {
    if (state !== 1 || !nearHide || player.stunTimer > 0) return;
    if (!player.hidden) {
        // Hotel hiding spots are valid counterplay even with Bassam or a
        // multi-monster roster. Other maps retain the seen-entering warning.
        const wasSeenEntering = currentMapId === 'hotel' ? false : monsters.some(enemy => monsterCanSeeUnhiddenPlayer(enemy));
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
    invNoiseMaker--; consumeLoadoutItem('noiseMaker');
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
    if (scramblerTimer > 0) return;
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
    invBearTrap--; consumeLoadoutItem('bearTrap'); runItemsUsed++; stats.itemsUsed++; advanceDailyObjective('items');
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
    const length = Math.max(2, 3 + circuitStage - (repairAssist > 0 ? 1 : 0));
    for (let i = 0; i < length; i++) circuitSequence.push(options[Math.floor(Math.random() * options.length)]);
    updateHUD();
}

function beginTuningPuzzle() {
    state = 7;
    tuneNeedle = 0; tuneHits = 0; tuneMisses = 0;
    tuneRequired = currentDiff === 0 ? 1 : currentDiff === 1 ? 2 : 3;
    tuneSpeed = currentDiff === 0 ? .012 : currentDiff === 1 ? .019 : .027;
    const width = (currentDiff === 0 ? .28 : currentDiff === 1 ? .19 : .13) * (repairAssist > 0 ? 1.45 : 1);
    tuneZoneStart = .18 + Math.random() * (.64 - width); tuneZoneEnd = tuneZoneStart + width;
    scDelay = 45; updateHUD();
}

function spawnRapidTarget() {
    const horizontalMargin = 92, topMargin = 138, bottomMargin = 76;
    rapidTarget = { x:horizontalMargin + Math.random()*(canvas.width - horizontalMargin*2), y:topMargin + Math.random()*(canvas.height - topMargin - bottomMargin), r:62 + (repairAssist > 0 ? 10 : 0) };
    rapidTimer = rapidLimit;
}
function beginRapidPuzzle() {
    state = 9; rapidHits = 0; rapidRequired = [5,10,15][currentDiff]; rapidLimit = [190,150,120][currentDiff] + (repairAssist > 0 ? 35 : 0); spawnRapidTarget();
}
function beginSimonPuzzle() {
    state = 10; const length = 4;
    simonSequence = []; for(let i=0;i<length;i++){let next=Math.floor(Math.random()*4);while(i&&next===simonSequence[i-1])next=Math.floor(Math.random()*4);simonSequence.push(next);} simonRound = 1; simonInput = 0; simonShowIndex = 0; simonTimer = 38; simonPhase = 'show'; simonFlashChoice = -1; simonFlashTimer = 0;
}

function setLucasOverlay(visible) {
    hud.style.display = visible ? 'none' : 'block';
    document.getElementById('mapTaskHUD').style.display = visible ? 'none' : 'block';
    document.getElementById('hotelTaskHUD').style.display = 'none';
    document.getElementById('mapButton').style.display = visible ? 'none' : '';
    document.getElementById('amineRoadControls').style.display = 'none';
}

function beginLucasShadowEvent() {
    if (currentMapId !== 'lucas' || state !== 1 || lucasShadowEvent || lucasShadowEventTriggered || lucasObjectiveStage === 'gate') return;
    const width = canvas.width, height = canvas.height;
    const bounds = {
        left: Math.min(84, width * .14),
        right: Math.max(width - 84, width * .86),
        top: Math.min(108, height * .18),
        bottom: Math.max(height - 82, height * .82)
    };
    lucasShadowEventTriggered = true;
    lucasShadowEvent = {
        phase: 'survive',
        time: 0,
        duration: 1800,
        bounds,
        returnX: player.x,
        returnY: player.y,
        player: { x: width * .5, y: bounds.bottom - 54 },
        trail: [],
        trailLastX: width * .5,
        trailLastY: bounds.bottom - 54,
        pools: [
            { x: bounds.left + 24, y: bounds.top + 30, radius: 31 },
            { x: width * .5, y: bounds.top + 22, radius: 31 },
            { x: bounds.right - 24, y: bounds.top + 30, radius: 31 },
            { x: bounds.left + 20, y: (bounds.top + bounds.bottom) * .53, radius: 31 },
            { x: bounds.right - 20, y: (bounds.top + bounds.bottom) * .53, radius: 31 },
            { x: width * .5, y: bounds.bottom - 22, radius: 31 }
        ],
        bursts: [],
        burstTimer: 28,
        lucas: null,
        lucasTimer: 105,
        returnPool: null,
        flash: 32,
        hitFlash: 0,
        hitNotice: 0
    };
    player.stunTimer = 0;
    clearMovementKeys();
    state = 18;
    setLucasOverlay(true);
    playSound('emp');
    showMsg('<span style="color:#d9b4ff">THE SHADOW FOLDS AROUND YOU</span><br>SURVIVE THE OTHER SIDE', 2400);
}

function chooseLucasDimensionPool(event, minimumDistance = 145, excludedIndex = -1) {
    const available = event.pools.filter((pool, index) => index !== excludedIndex
        && Math.hypot(event.player.x - pool.x, event.player.y - pool.y) >= minimumDistance);
    return available[Math.floor(Math.random() * Math.max(1, available.length))] || event.pools.find((pool, index) => index !== excludedIndex) || event.pools[0];
}

function finishLucasShadowEvent() {
    const event = lucasShadowEvent;
    if (!event) return;
    player.x = event.returnX;
    player.y = event.returnY;
    player.stunTimer = 0;
    lucasShadowEvent = null;
    state = 1;
    clearMovementKeys();
    setLucasOverlay(false);
    updateHUD();
    playSound('unlock');
    showMsg('<span style="color:#d9b4ff">THE SHADOW DIMENSION RELEASES YOU</span>', 1400);
}

function updateLucasShadowDimension() {
    const event = lucasShadowEvent;
    if (!event) { state = 1; setLucasOverlay(false); return; }
    ambienceClock++;
    const bounds = event.bounds;
    if (event.flash > 0) event.flash--;
    if (event.hitFlash > 0) event.hitFlash--;
    if (event.hitNotice > 0) event.hitNotice--;
    if (player.stunTimer > 0) player.stunTimer--;

    if (player.stunTimer <= 0) {
        const moveX = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
        const moveY = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
        let dx = moveX, dy = moveY;
        if (dx && dy) { dx *= .707; dy *= .707; }
        event.player.x = Math.max(bounds.left + 18, Math.min(bounds.right - 18, event.player.x + dx * 4.35));
        event.player.y = Math.max(bounds.top + 18, Math.min(bounds.bottom - 18, event.player.y + dy * 4.35));
    }
    if (Math.hypot(event.player.x - event.trailLastX, event.player.y - event.trailLastY) > .25) {
        event.trail.push({ x:event.player.x, y:event.player.y });
        if (event.trail.length > 24) event.trail.shift();
        event.trailLastX = event.player.x;
        event.trailLastY = event.player.y;
    }

    if (event.phase === 'survive') {
        event.time++;

        event.burstTimer--;
        if (event.burstTimer <= 0) {
            const pool = event.pools[Math.floor(Math.random() * event.pools.length)];
            const burstCount = Math.random() < .24 ? 2 : 1;
            for (let index = 0; index < burstCount; index++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 3.25 + Math.random() * 1.35;
                event.bursts.push({ x:pool.x, y:pool.y, vx:Math.cos(angle) * speed, vy:Math.sin(angle) * speed, life:135, radius:8 + Math.random() * 3 });
            }
            event.burstTimer = 38 + Math.floor(Math.random() * 55);
        }
        for (const burst of event.bursts) {
            burst.x += burst.vx; burst.y += burst.vy; burst.life--;
            if (burst.x < bounds.left - 22 || burst.x > bounds.right + 22 || burst.y < bounds.top - 22 || burst.y > bounds.bottom + 22) burst.life = 0;
            if (player.stunTimer <= 0 && Math.hypot(event.player.x - burst.x, event.player.y - burst.y) < player.r + burst.radius) {
                player.stunTimer = 68;
                event.hitFlash = 13;
                event.hitNotice = 70;
                burst.life = 0;
                playSound('fail');
            }
        }
        event.bursts = event.bursts.filter(burst => burst.life > 0);

        event.lucasTimer--;
        if (!event.lucas && event.lucasTimer <= 0) {
            const pool = chooseLucasDimensionPool(event, 175);
            const poolIndex = event.pools.indexOf(pool);
            const angle = Math.atan2(event.player.y - pool.y, event.player.x - pool.x);
            event.lucas = { x:pool.x, y:pool.y, phase:'charge', life:54, poolIndex, targetPool:null, vx:Math.cos(angle) * 7.1, vy:Math.sin(angle) * 7.1 };
            playSound('alarm');
        }
        if (event.lucas) {
            const lucas = event.lucas;
            if (lucas.phase === 'charge') {
                lucas.x += lucas.vx; lucas.y += lucas.vy; lucas.life--;
                if (Math.hypot(event.player.x - lucas.x, event.player.y - lucas.y) < player.r + 22) {
                    event.hitFlash = 16;
                    playSound('fail');
                    lucasShadowEvent = null;
                    setLucasOverlay(false);
                    endGame(false, monster);
                    return;
                } else if (lucas.life <= 0) {
                    lucas.phase = 'retreat';
                    lucas.life = 34;
                    lucas.targetPool = chooseLucasDimensionPool(event, 160, lucas.poolIndex);
                }
            } else {
                const target = lucas.targetPool || chooseLucasDimensionPool(event, 150, lucas.poolIndex);
                const angle = Math.atan2(target.y - lucas.y, target.x - lucas.x);
                lucas.x += Math.cos(angle) * 6.2; lucas.y += Math.sin(angle) * 6.2; lucas.life--;
                if (lucas.life <= 0 || Math.hypot(target.x - lucas.x, target.y - lucas.y) < 18) {
                    event.lucas = null;
                    event.lucasTimer = 120 + Math.floor(Math.random() * 130);
                }
            }
        }

        if (event.time >= event.duration) {
            event.phase = 'returning';
            event.returnPool = chooseLucasDimensionPool(event, 160);
            event.bursts = [];
            event.lucas = null;
            playSound('unlock');
            showMsg('<span style="color:#d9b4ff">A FLICKERING SHADOW POOL HAS OPENED</span><br>FIND IT TO RETURN', 2600);
        }
    } else if (event.returnPool && Math.hypot(event.player.x - event.returnPool.x, event.player.y - event.returnPool.y) < event.returnPool.radius + player.r + 6) {
        finishLucasShadowEvent();
    }
}

function drawLucasShadowDimension() {
    const event = lucasShadowEvent;
    if (!event) return;
    const bounds = event.bounds;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const background = ctx.createRadialGradient(canvas.width * .5, canvas.height * .46, 10, canvas.width * .5, canvas.height * .46, Math.max(canvas.width, canvas.height) * .76);
    background.addColorStop(0, '#21113a'); background.addColorStop(.6, '#090611'); background.addColorStop(1, '#020205');
    ctx.fillStyle = background; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(13,7,25,.94)'; ctx.fillRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
    ctx.save();
    ctx.beginPath(); ctx.rect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top); ctx.clip();
    ctx.strokeStyle = 'rgba(176,119,231,.12)'; ctx.lineWidth = 1;
    for (let x = bounds.left; x <= bounds.right; x += 38) { ctx.beginPath(); ctx.moveTo(x, bounds.top); ctx.lineTo(x, bounds.bottom); ctx.stroke(); }
    for (let y = bounds.top; y <= bounds.bottom; y += 38) { ctx.beginPath(); ctx.moveTo(bounds.left, y); ctx.lineTo(bounds.right, y); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = '#9c64c7'; ctx.lineWidth = 4; ctx.strokeRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);

    const drawPool = (pool, exit = false) => {
        const pulse = 1 + Math.sin(ambienceClock * .11 + pool.x) * .1;
        ctx.save(); ctx.translate(pool.x, pool.y);
        ctx.fillStyle = exit ? 'rgba(219,170,255,.24)' : 'rgba(7,2,17,.9)';
        ctx.shadowColor = exit ? '#e3b7ff' : '#8e49bc'; ctx.shadowBlur = exit ? 24 : 13;
        ctx.beginPath(); ctx.ellipse(0, 0, pool.radius * pulse, pool.radius * .58 * pulse, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = exit ? '#f0ccff' : 'rgba(181,111,238,.78)'; ctx.lineWidth = exit ? 4 : 2; ctx.stroke();
        ctx.strokeStyle = exit ? 'rgba(255,240,255,.9)' : 'rgba(205,157,255,.42)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, pool.radius * (.43 + Math.sin(ambienceClock * .14) * .06), 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    };
    event.pools.forEach(pool => drawPool(pool));
    if (event.returnPool) drawPool(event.returnPool, true);

    for (const burst of event.bursts) {
        ctx.save(); ctx.translate(burst.x, burst.y); ctx.rotate(Math.atan2(burst.vy, burst.vx));
        ctx.fillStyle = '#b873e7'; ctx.shadowColor = '#d9a7ff'; ctx.shadowBlur = 15;
        ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(-7, -7); ctx.lineTo(-3, 0); ctx.lineTo(-7, 7); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    if (event.lucas) {
        const lucas = event.lucas;
        ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.ellipse(lucas.x + 5, lucas.y + 22, 25, 9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#21152e'; ctx.strokeStyle = '#d3a0ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(lucas.x, lucas.y, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lucas.x - 7, lucas.y - 3, 3, 0, Math.PI * 2); ctx.arc(lucas.x + 7, lucas.y - 3, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e1c3ff'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center'; ctx.fillText('LUCAS', lucas.x, lucas.y - 32);
    }
    const playerX = event.player.x, playerY = event.player.y;
    if (cosmetics.trail !== 'none' && event.trail.length > 1) {
        const trailColor = cosmetics.trail === 'spark' ? 'rgba(255,238,86,.82)' : cosmetics.trail === 'ember' ? 'rgba(255,70,24,.78)' : cosmetics.trail === 'static' ? 'rgba(185,245,255,.65)' : cosmetics.trail === 'circle' ? 'rgba(255,255,255,.78)' : 'rgba(180,210,255,.42)';
        ctx.save(); ctx.globalAlpha = .72; ctx.strokeStyle = trailColor; ctx.lineWidth = cosmetics.trail === 'ghost' ? 10 : cosmetics.trail === 'ember' ? 4 : 6; ctx.lineCap = cosmetics.trail === 'static' ? 'butt' : 'round';
        if (cosmetics.trail === 'static') ctx.setLineDash([8, 7]);
        ctx.beginPath(); event.trail.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.stroke(); ctx.setLineDash([]);
        ctx.restore();
    }
    ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.ellipse(playerX + 4, playerY + 17, 16, 7, 0, 0, Math.PI * 2); ctx.fill();
    const equippedSkin = skinImages[cosmetics.skin];
    if (cosmetics.skin !== 'default' && equippedSkin?.complete) {
        const skinSize = player.r * 3.35;
        ctx.globalAlpha = player.stunTimer > 0 ? .72 : 1;
        ctx.drawImage(equippedSkin, playerX - skinSize / 2, playerY - skinSize / 2, skinSize, skinSize);
        ctx.globalAlpha = 1;
    } else {
        ctx.fillStyle = player.stunTimer > 0 ? '#fff0a0' : (playerColors[cosmetics.color] || '#76d9ff'); ctx.beginPath(); ctx.arc(playerX, playerY, player.r + 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#102332'; ctx.beginPath(); ctx.arc(playerX - 4, playerY - 2, 2, 0, Math.PI * 2); ctx.arc(playerX + 4, playerY - 2, 2, 0, Math.PI * 2); ctx.fill();
    }
    const equippedMask = maskImages[cosmetics.mask];
    if (cosmetics.mask !== 'none' && equippedMask?.complete) ctx.drawImage(equippedMask, playerX - player.r * 2, playerY - player.r * 2.15, player.r * 4, player.r * 4);
    const equippedHat = hatImages[cosmetics.hat];
    if (cosmetics.hat !== 'none' && equippedHat?.complete) ctx.drawImage(equippedHat, playerX - player.r * 2, playerY - player.r * 2.15, player.r * 4, player.r * 4);
    if (player.stunTimer > 0) { ctx.strokeStyle = '#fff0a0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(playerX, playerY, 23 + Math.sin(ambienceClock * .3) * 3, 0, Math.PI * 2); ctx.stroke(); }

    ctx.textAlign = 'center'; ctx.fillStyle = '#ead5ff'; ctx.font = 'bold 22px Arial'; ctx.fillText('THE SHADOW DIMENSION', canvas.width / 2, 39);
    if (event.phase === 'survive') {
        ctx.fillStyle = '#c9b2dc'; ctx.font = '14px Arial'; ctx.fillText(`SURVIVE · ${Math.ceil((event.duration - event.time) / 60)}s`, canvas.width / 2, 64);
        ctx.fillStyle = 'rgba(225,195,255,.7)'; ctx.font = '12px Arial'; ctx.fillText('SHADOW BURSTS STUN · LUCAS WILL CHARGE FROM THE POOLS', canvas.width / 2, canvas.height - 34);
    } else {
        ctx.fillStyle = '#f0ccff'; ctx.font = 'bold 15px Arial'; ctx.fillText('ENTER THE FLICKERING POOL TO RETURN', canvas.width / 2, 64);
        if (event.returnPool) { ctx.fillStyle = '#e7c5ff'; ctx.font = 'bold 11px Arial'; ctx.fillText('RETURN', event.returnPool.x, event.returnPool.y - 43); }
    }
    if (event.hitNotice > 0) { ctx.fillStyle = '#ffe0a8'; ctx.font = 'bold 14px Arial'; ctx.fillText('STUNNED', canvas.width / 2, bounds.bottom + 34); }
    if (event.flash > 0) { ctx.fillStyle = `rgba(255,245,255,${Math.min(.72, event.flash / 32)})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
}

function beginLucasFragmentPuzzle(fragment) {
    if (!fragment || currentMapId !== 'lucas' || state !== 1) return;
    clearMovementKeys();
    lucasFragmentPuzzle = {
        fragment,
        time:0,
        maxTime:720,
        fragmentY:canvas.height - 168,
        bottomY:canvas.height - 168,
        topY:112,
        pointerY:canvas.height - 70,
        pointerActive:false,
        stable:0
    };
    state = 16;
    setLucasOverlay(true);
    playSound('unlock');
}

function recoverLucasFragment(fragment) {
    if (!fragment) return;
    fragment.collected = true;
    fragment.carried = fragment.id === 3;
    if (fragment.id === 1) {
        lucasObjectiveStage = 'levers';
        notify('THE FIRST FRAGMENT IS COLD · FIND THE THREE SHADOW RELAYS', 'unlock');
    } else if (fragment.id === 2) {
        const thirdFragment = lucasFragments.find(entry => entry.id === 3);
        if (thirdFragment) thirdFragment.available = true;
        lucasObjectiveStage = 'fragment3';
        notify('THE UNDERPASS OPENS · THE LAST FRAGMENT MUST BE CARRIED', 'unlock');
    } else if (fragment.id === 3) {
        lucasCarryFragment = fragment;
        lucasObjectiveStage = 'place';
        notify('THE FRAGMENT RESISTS · CARRY IT TO THE CALEB VESSEL', 'danger');
    }
    playSound('success');
    notify(`CALEB FRAGMENT ${lucasFragments.filter(entry => entry.collected).length}/${lucasFragments.length} RECOVERED`, 'unlock');
    updateHUD();
}

function finishLucasFragmentPuzzle(won) {
    if (!lucasFragmentPuzzle) return;
    const fragment = lucasFragmentPuzzle.fragment;
    lucasFragmentPuzzle = null;
    state = 1;
    setLucasOverlay(false);
    if (won) recoverLucasFragment(fragment);
    else {
        fragment.collected = false;
        fragment.carried = false;
        fragment.available = true;
        lucasAbilityCooldown = 90;
        notify('THE FRAGMENT SLIPS AWAY · TRY AGAIN', 'warning');
        updateHUD();
    }
}

function updateLucasFragmentPointer(clientX, clientY, active = true) {
    if (state !== 16 || !lucasFragmentPuzzle) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * canvas.width / rect.width;
    const y = (clientY - rect.top) * canvas.height / rect.height;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    lucasFragmentPuzzle.pointerY = Math.max(58, Math.min(canvas.height - 42, y));
    lucasFragmentPuzzle.pointerActive = active;
}

function releaseLucasFragmentPointer() {
    if (lucasFragmentPuzzle) lucasFragmentPuzzle.pointerActive = false;
}

function updateLucasFragmentPuzzle() {
    if (!lucasFragmentPuzzle) return;
    const puzzle = lucasFragmentPuzzle;
    puzzle.time++;
    if (puzzle.pointerActive && puzzle.pointerY > puzzle.fragmentY + 6) {
        puzzle.fragmentY += Math.min(2.35, .9 + (puzzle.pointerY - puzzle.fragmentY) / 70);
        puzzle.stable = puzzle.fragmentY >= puzzle.bottomY - 18 ? Math.min(300, puzzle.stable + 1.0) : Math.max(0, puzzle.stable - .25);
    } else {
        puzzle.fragmentY -= .88;
        puzzle.stable = Math.max(0, puzzle.stable - .55);
    }
    puzzle.fragmentY = Math.min(puzzle.bottomY, puzzle.fragmentY);
    if (puzzle.fragmentY <= puzzle.topY) { finishLucasFragmentPuzzle(false); return; }
    if (puzzle.stable >= 300) { finishLucasFragmentPuzzle(true); return; }
    if (puzzle.time >= puzzle.maxTime) finishLucasFragmentPuzzle(false);
}

function drawLucasFragmentPuzzle() {
    const puzzle = lucasFragmentPuzzle;
    if (!puzzle) return;
    const cx = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, '#08040e'); bg.addColorStop(.52, '#17102a'); bg.addColorStop(1, '#050308');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ead5ff'; ctx.font = 'bold 22px Arial'; ctx.fillText('CALEB FRAGMENT', cx, 42);
    ctx.fillStyle = '#bca4d4'; ctx.font = '14px Arial'; ctx.fillText('THE SHADOW IS PULLING IT UP', cx, 69);

    const laneTop = 94, laneBottom = canvas.height - 102;
    ctx.fillStyle = 'rgba(0,0,0,.48)'; ctx.fillRect(cx - 48, laneTop, 96, laneBottom - laneTop);
    ctx.strokeStyle = 'rgba(217,176,255,.35)'; ctx.lineWidth = 3; ctx.strokeRect(cx - 48, laneTop, 96, laneBottom - laneTop);
    ctx.strokeStyle = 'rgba(190,120,255,.7)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx, laneTop - 12); ctx.lineTo(cx, puzzle.fragmentY - 18); ctx.stroke();
    ctx.fillStyle = '#050208'; ctx.beginPath(); ctx.arc(cx, laneTop - 10, 24 + Math.sin(puzzle.time * .08) * 3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#9d5bd4'; ctx.lineWidth = 2; ctx.stroke();

    const pulse = 1 + Math.sin(puzzle.time * .13) * .08;
    ctx.save(); ctx.translate(cx, puzzle.fragmentY); ctx.rotate(.35);
    ctx.fillStyle = 'rgba(217,176,255,.22)'; ctx.beginPath(); ctx.arc(0, 0, 31 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d7b0ff'; ctx.beginPath(); ctx.moveTo(0, -17 * pulse); ctx.lineTo(14 * pulse, 11 * pulse); ctx.lineTo(-14 * pulse, 12 * pulse); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff1ff'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();

    if (puzzle.pointerActive) {
        ctx.strokeStyle = '#8fffd1'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, puzzle.pointerY, 19, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(143,255,209,.16)'; ctx.beginPath(); ctx.arc(cx, puzzle.pointerY, 28, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#8fffd1'; ctx.font = 'bold 16px Arial'; ctx.fillText('HOLD OR DRAG BELOW THE FRAGMENT', cx, canvas.height - 62);
    ctx.fillStyle = '#263c38'; ctx.fillRect(cx - 140, canvas.height - 35, 280, 12);
    ctx.fillStyle = '#8fffd1'; ctx.fillRect(cx - 140, canvas.height - 35, 280 * (puzzle.stable / 300), 12);
    ctx.strokeStyle = '#c9ffe9'; ctx.lineWidth = 1; ctx.strokeRect(cx - 140, canvas.height - 35, 280, 12);
    ctx.fillStyle = '#d9c7e9'; ctx.font = '12px Arial'; ctx.fillText(`PULL STABILITY · ${Math.round(puzzle.stable / 3)}%`, cx, canvas.height - 43);
}

function beginLucasEndingAnimation() {
    lucasEndingAnimation = { time:0, duration:180 };
    lucasState = 'dragging';
    lucasGate.open = true;
    state = 17;
    clearMovementKeys();
    setLucasOverlay(true);
    canvas.classList.add('shake');
    playSound('emp');
    showStoryLine('THE SHADOW TAKES LUCAS.', 3300);
}

function updateLucasEndingAnimation() {
    if (!lucasEndingAnimation) return;
    lucasEndingAnimation.time++;
    if (lucasEndingAnimation.time === 42 || lucasEndingAnimation.time === 112) playSound('tick');
    if (lucasEndingAnimation.time >= lucasEndingAnimation.duration) {
        canvas.classList.remove('shake');
        lucasEndingAnimation = null;
        beginCalebBossIntro();
    }
}

function drawLucasEndingAnimation() {
    const scene = lucasEndingAnimation;
    if (!scene) return;
    const t = scene.time;
    const progress = Math.min(1, t / scene.duration);
    const ease = progress * progress * (3 - 2 * progress);
    const gateX = canvas.width * .73, gateY = canvas.height * .52;
    const startX = canvas.width * .28, startY = canvas.height * .52;
    const lucasX = startX + (gateX - 72 - startX) * ease;
    const lucasY = startY + Math.sin(t * .18) * (12 * (1 - ease)) - ease * 7;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bg = ctx.createRadialGradient(gateX, gateY, 10, gateX, gateY, Math.max(canvas.width, canvas.height) * .85);
    bg.addColorStop(0, 'rgba(92,42,128,.25)'); bg.addColorStop(.5, '#09050f'); bg.addColorStop(1, '#020204');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ead5ff'; ctx.font = 'bold 22px Arial'; ctx.textAlign = 'center'; ctx.fillText('THE SHADOW GATE', canvas.width / 2, 45);
    ctx.fillStyle = '#ad94c7'; ctx.font = '14px Arial'; ctx.fillText('THE EXIT HAS CHOSEN ITS HUNTER', canvas.width / 2, 71);

    ctx.save(); ctx.translate(gateX, gateY);
    const gatePulse = 1 + Math.sin(t * .12) * .08;
    ctx.fillStyle = 'rgba(0,0,0,.96)'; ctx.beginPath(); ctx.ellipse(0, 0, 70 * gatePulse, 118 * gatePulse, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b76bea'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 0, 76 * gatePulse, 124 * gatePulse, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(237,202,255,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(-6, 0, 58 * gatePulse, 108 * gatePulse, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    const pullWidth = 5 + ease * 9;
    ctx.save(); ctx.shadowColor = '#d89bff'; ctx.shadowBlur = 20;
    ctx.strokeStyle = '#e2b4ff'; ctx.lineWidth = pullWidth; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(gateX - 55, gateY); ctx.bezierCurveTo(gateX - 180, gateY - 40, lucasX + 135, lucasY + 40, lucasX, lucasY); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,244,255,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gateX - 55, gateY); ctx.bezierCurveTo(gateX - 180, gateY + 24, lucasX + 135, lucasY - 32, lucasX, lucasY); ctx.stroke();
    ctx.restore();

    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(lucasX + 7, lucasY + 28, 30, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#211c32'; ctx.beginPath(); ctx.arc(lucasX, lucasY, 28, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c5a9ff'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lucasX - 9, lucasY - 4, 4, 0, Math.PI * 2); ctx.arc(lucasX + 9, lucasY - 4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d8c2ff'; ctx.font = 'bold 13px Arial'; ctx.fillText('LUCAS', lucasX, lucasY - 42);
    if (t > 125) { ctx.fillStyle = `rgba(255,255,255,${Math.min(.95, (t - 125) / 45)})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
}

function calebBossArena() {
    const width = canvas.width, height = canvas.height;
    return { left:Math.min(42, width * .075), right:Math.max(width - 42, width * .925), top:104, bottom:Math.max(height - 58, 300) };
}

function calebBossImage(image, x, y, width, height, angle = 0, alpha = 1) {
    if (!image?.complete || !image.naturalWidth) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.globalAlpha = alpha;
    ctx.drawImage(image, -width / 2, -height / 2, width, height);
    ctx.restore();
}

function getCalebEyePoints(boss = calebBoss) {
    if (!boss?.caleb) return [];
    const size = boss.caleb.size;
    return [
        { x:boss.caleb.x - size * .166, y:boss.caleb.y - size * .139 },
        { x:boss.caleb.x + size * .166, y:boss.caleb.y - size * .139 }
    ];
}

function getCalebHandPose(boss, side) {
    const body = boss.caleb;
    const direction = side === 'left' ? -1 : 1;
    const idleX = body.x + direction * (body.size * .86 + 16);
    const idleY = body.y + 62 + Math.sin(boss.time * .045 + (side === 'left' ? 0 : 1.6)) * 5;
    const pose = {
        x: idleX,
        y: idleY,
        angle: side === 'left' ? .055 : -.055
    };

    if (boss.sweep?.side === side) {
        const progress = Math.max(0, Math.min(1, 1 - boss.sweep.life / boss.sweep.duration));
        const eased = progress * progress * (3 - 2 * progress);
        const startX = side === 'left' ? boss.arena.left - 72 : boss.arena.right + 72;
        const endX = side === 'left' ? canvas.width / 2 - 48 : canvas.width / 2 + 48;
        pose.x = startX + (endX - startX) * eased;
        pose.y = boss.arena.top + (boss.arena.bottom - boss.arena.top) * .52 + Math.sin(progress * Math.PI) * 12;
        pose.angle = side === 'left' ? -.24 : .24;
    } else if (boss.slam?.side === side) {
        const progress = Math.max(0, Math.min(1, 1 - boss.slam.life / boss.slam.duration));
        const eased = 1 - Math.pow(1 - progress, 3);
        const targetX = boss.slam.x;
        const targetY = boss.slam.y - 76;
        pose.x = idleX + (targetX - idleX) * eased;
        pose.y = idleY + (targetY - idleY) * eased;
        pose.angle = side === 'left' ? -.12 : .12;
    }
    return pose;
}

function beginCalebBossIntro() {
    monster.name = 'CALEB';
    monster.color = '#85001b'; monster.textColor = '#ffb4c7'; monster.r = 28; monster.drawRadius = 28;
    calebBoss = { introTime:0, introDuration:190, arena:calebBossArena(), player:{ x:canvas.width / 2, y:canvas.height * .78 }, playerTrail:[], playerInvuln:0 };
    state = 19;
    clearMovementKeys();
    setLucasOverlay(true);
    canvas.classList.add('shake');
    playSound('emp');
    showStoryLine('THE GATE OPENS ONTO SOMETHING MUCH OLDER.', 3600);
}

function beginCalebBossFight() {
    const arena = calebBoss?.arena || calebBossArena();
    const bodySize = Math.min(258, canvas.width * .39);
    calebBoss = {
        mode:'caleb', stage:1, phase:'eyesOn', time:0, phaseTimer:0, arena,
        caleb:{ x:canvas.width / 2, y:arena.top + 8, size:bodySize },
        health:26, maxHealth:26, eyeHits:0,
        player:{ x:canvas.width / 2, y:arena.bottom - 72 }, playerTrail:[], trailLastX:canvas.width / 2, trailLastY:arena.bottom - 72, playerHealth:8, maxPlayerHealth:8, playerInvuln:0, playerHitFlash:0,
        switches:[
            { x:arena.left + 62, y:arena.top + 124, active:false, life:0, flash:0 },
            { x:arena.right - 62, y:arena.top + 124, active:false, life:0, flash:0 },
            { x:arena.left + 70, y:arena.bottom - 62, active:false, life:0, flash:0 },
            { x:arena.right - 70, y:arena.bottom - 62, active:false, life:0, flash:0 }
        ],
        orbs:[], shots:[], eyeRain:[], cores:[], schiminis:[], walls:[], holes:[], sweep:null, slam:null,
        orbTimer:82, sweepTimer:230, slamTimer:340, spreadTimer:260, rainTimer:64, schiminiTimer:240,
        holeTimer:300, wallTimer:360, pullTimer:420, fireballTimer:100, nestTimer:180, flash:0, messageTimer:0
    };
    state = 20;
    clearMovementKeys();
    canvas.classList.remove('shake');
    setLucasOverlay(true);
    playSound('alarm');
    showStoryLine('CALEB: THE BODY ABOVE THE WORLD.', 2600);
}

function beginCalebBossDefeat() {
    if (!calebBoss || calebBoss.mode !== 'caleb') return;
    calebBoss.mode = 'splitCutscene';
    calebBoss.defeatTime = 0;
    calebBoss.splitVisible = false;
    state = 21;
    clearMovementKeys();
    canvas.classList.add('shake');
    playSound('emp');
    showStoryLine('CALEB IS NOT ONE THING.', 2700);
}

function beginCalLebPhase() {
    const boss = calebBoss;
    if (!boss) return;
    boss.mode = 'split'; boss.stage = 3; boss.time = 0; boss.healthCal = 13; boss.maxHealthCal = 13; boss.healthLeb = 13; boss.maxHealthLeb = 13;
    boss.cal = { x:boss.arena.left + 128, y:boss.arena.top + 172, size:116, teleportTimer:220 };
    boss.leb = { x:boss.arena.right - 128, y:boss.arena.top + 172, size:116, eatTimer:280, targetNest:null };
    boss.switches.forEach(button => { button.active = false; button.life = 0; });
    boss.orbs = []; boss.shots = []; boss.eyeRain = []; boss.cores = []; boss.schiminis = []; boss.walls = []; boss.holes = []; boss.sweep = null; boss.slam = null;
    boss.nests = [
        { x:boss.arena.left + 110, y:boss.arena.bottom - 92, sealed:false, sealLife:0 },
        { x:canvas.width / 2, y:boss.arena.top + 235, sealed:false, sealLife:0 },
        { x:boss.arena.right - 110, y:boss.arena.bottom - 92, sealed:false, sealLife:0 }
    ];
    boss.playerHealth = Math.min(boss.maxPlayerHealth, boss.playerHealth + 2);
    boss.fireballTimer = 84; boss.spreadTimer = 128; boss.wallTimer = 270; boss.pullTimer = 390; boss.nestTimer = 170; boss.schiminiTimer = 90; boss.holeTimer = 170; boss.flash = 22;
    state = 20;
    canvas.classList.remove('shake');
    showStoryLine('CALEB BREAKS INTO CAL AND LEB.', 3000);
    playSound('emp');
}

function updateCalebBossIntro() {
    if (!calebBoss) return;
    calebBoss.introTime++;
    if (calebBoss.introTime >= calebBoss.introDuration) beginCalebBossFight();
}

function updateCalebBossDefeat() {
    if (!calebBoss) return;
    calebBoss.defeatTime++;
    if (calebBoss.defeatTime === 24 || calebBoss.defeatTime === 96) playSound('tick');
    if (calebBoss.defeatTime === 86) { calebBoss.splitVisible = true; playSound('alarm'); }
    if (calebBoss.defeatTime >= 172) beginCalLebPhase();
}

function damageCalebBossPlayer(amount, reason = 'HIT', instant = false) {
    const boss = calebBoss;
    if (!boss || state !== 20) return true;
    if (!instant && boss.playerInvuln > 0) return false;
    if (instant) boss.playerHealth = 0;
    else { boss.playerHealth = Math.max(0, boss.playerHealth - amount); boss.playerInvuln = 55; }
    boss.playerHitFlash = 15;
    playSound('fail');
    if (boss.playerHealth <= 0) {
        calebBoss = null;
        setLucasOverlay(false);
        endGame(false, monster);
        return true;
    }
    if (reason) showMsg(`<span style="color:#ffb6b6">${reason}</span><br>${boss.playerHealth}/${boss.maxPlayerHealth} HEALTH`, 700);
    return false;
}

function damageCalebBoss(amount, target = 'CALEB') {
    const boss = calebBoss;
    if (!boss) return;
    if (target === 'CAL') boss.healthCal = Math.max(0, boss.healthCal - amount);
    else if (target === 'LEB') boss.healthLeb = Math.max(0, boss.healthLeb - amount);
    else boss.health = Math.max(0, boss.health - amount);
    boss.flash = 10;
    playSound('success');
    if (target === 'CALEB' && boss.health <= 0) { beginCalebBossDefeat(); return; }
    if (target === 'CAL' && boss.healthCal <= 0) { boss.cal = null; showStoryLine('CAL COLLAPSES INTO THE FLOOR.', 1600); }
    if (target === 'LEB' && boss.healthLeb <= 0) { boss.leb = null; showStoryLine('LEB’S NESTS GO SILENT.', 1600); }
    if (boss.mode === 'split' && boss.healthCal <= 0 && boss.healthLeb <= 0) {
        calebBoss = null; setLucasOverlay(false); endGame(true, monster);
    }
}

function calebBossPlayerMove() {
    const boss = calebBoss;
    if (!boss || !boss.player) return;
    const bounds = boss.arena;
    if (boss.playerInvuln > 0) boss.playerInvuln--;
    if (boss.playerHitFlash > 0) boss.playerHitFlash--;
    if (boss.flash > 0) boss.flash--;
    const moveX = (keys.d ? 1 : 0) - (keys.a ? 1 : 0), moveY = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
    let dx = moveX, dy = moveY;
    if (dx && dy) { dx *= .707; dy *= .707; }
    let speed = 4.2;
    if (boss.pullTimerActive > 0 && boss.cal) {
        boss.pullTimerActive--;
        const pullAngle = Math.atan2(boss.cal.y - boss.player.y, boss.cal.x - boss.player.x);
        dx += Math.cos(pullAngle) * .72; dy += Math.sin(pullAngle) * .72;
    }
    const nextX = Math.max(bounds.left + 18, Math.min(bounds.right - 18, boss.player.x + dx * speed));
    const nextY = Math.max(bounds.top + 18, Math.min(bounds.bottom - 18, boss.player.y + dy * speed));
    boss.player.x = nextX; boss.player.y = nextY;
    if (Math.hypot(boss.player.x - boss.trailLastX, boss.player.y - boss.trailLastY) > .25) {
        boss.playerTrail.push({ x:boss.player.x, y:boss.player.y });
        if (boss.playerTrail.length > 24) boss.playerTrail.shift();
        boss.trailLastX = boss.player.x; boss.trailLastY = boss.player.y;
    }
    for (const wall of boss.walls) {
        if (boss.player.x > wall.x - 18 && boss.player.x < wall.x + wall.w + 18 && boss.player.y > wall.y - 18 && boss.player.y < wall.y + wall.h + 18) {
            const distances = [
                { side:'left', value:Math.abs(boss.player.x - (wall.x - 18)) }, { side:'right', value:Math.abs(boss.player.x - (wall.x + wall.w + 18)) },
                { side:'top', value:Math.abs(boss.player.y - (wall.y - 18)) }, { side:'bottom', value:Math.abs(boss.player.y - (wall.y + wall.h + 18)) }
            ].sort((a,b) => a.value - b.value);
            if (distances[0].side === 'left') boss.player.x = wall.x - 18;
            else if (distances[0].side === 'right') boss.player.x = wall.x + wall.w + 18;
            else if (distances[0].side === 'top') boss.player.y = wall.y - 18;
            else boss.player.y = wall.y + wall.h + 18;
        }
    }
    for (const hole of boss.holes) {
        if (hole.warning <= 0 && boss.player.x > hole.x && boss.player.x < hole.x + hole.w && boss.player.y > hole.y && boss.player.y < hole.y + hole.h) {
            damageCalebBossPlayer(0, 'THE FLOOR GIVES WAY', true); return;
        }
    }
}

function activateCalebBossSwitch(button) {
    if (!button || button.active || button.cooldown > 0) return false;
    button.active = true; button.life = 330; button.flash = 18;
    playSound('tick');
    showMsg('<span style="color:#9fffd0">RESONANCE SWITCH ARMED</span><br>BAIT THE ATTACK THROUGH IT', 900);
    return true;
}

function clickCalebBoss(clientX, clientY) {
    const boss = calebBoss;
    if (!boss || state !== 20) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * canvas.width / rect.width, y = (clientY - rect.top) * canvas.height / rect.height;
    const px = boss.player.x, py = boss.player.y;
    const near = (object, radius = 50) => object && Math.hypot(px - object.x, py - object.y) < radius && Math.hypot(x - object.x, y - object.y) < radius * 1.25;
    const button = boss.switches.find(entry => near(entry, 54));
    if (button && activateCalebBossSwitch(button)) return;
    if (boss.mode === 'caleb' && boss.phase === 'eyesOff') {
        const core = boss.cores.find(entry => !entry.sealed && near(entry, 42));
        if (core) { core.sealed = true; core.sealTimer = 55; playSound('unlock'); showMsg('<span style="color:#d8b4ff">EYE CORE SEALED</span>', 700); return; }
    }
    if (boss.mode === 'split' && boss.leb) {
        const nest = boss.nests.find(entry => !entry.sealed && near(entry, 48));
        if (nest) { nest.sealed = true; nest.sealLife = 360; playSound('unlock'); showMsg('<span style="color:#d8b4ff">NEST SEALED</span><br>LEB MUST NOT EAT IT', 900); }
    }
}

function interactCalebBossAtPlayer() {
    if (!calebBoss?.player) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = rect.left + calebBoss.player.x * rect.width / canvas.width;
    const clientY = rect.top + calebBoss.player.y * rect.height / canvas.height;
    clickCalebBoss(clientX, clientY);
}

function spawnCalebOrb(boss) {
    const eyes = getCalebEyePoints(boss);
    const eye = eyes[Math.floor(Math.random() * eyes.length)];
    const angle = Math.atan2(boss.player.y - eye.y, boss.player.x - eye.x);
    boss.orbs.push({ x:eye.x, y:eye.y, vx:Math.cos(angle) * 4.15, vy:Math.sin(angle) * 4.15, r:14, life:230, blast:0, reflected:false });
}

function updateCalebOrbs(boss) {
    const eyes = getCalebEyePoints(boss);
    for (let index = boss.orbs.length - 1; index >= 0; index--) {
        const orb = boss.orbs[index];
        if (orb.blast > 0) {
            orb.blast--;
            if (orb.blast === 0) {
                if (Math.hypot(boss.player.x - orb.x, boss.player.y - orb.y) < 66) damageCalebBossPlayer(1, 'DARK ORB IMPACT');
                boss.orbs.splice(index, 1);
            }
            continue;
        }
        if (!orb.reflected) {
            orb.x += orb.vx; orb.y += orb.vy; orb.life--;
            const switchHit = boss.switches.find(button => button.active && Math.hypot(orb.x - button.x, orb.y - button.y) < 22);
            if (switchHit) {
                switchHit.active = false; switchHit.cooldown = 70; orb.reflected = true;
                const angle = Math.atan2(boss.caleb.y - orb.y, boss.caleb.x - orb.x);
                orb.vx = Math.cos(angle) * 6.2; orb.vy = Math.sin(angle) * 6.2; orb.life = 180;
                playSound('unlock'); showMsg('<span style="color:#e6c5ff">ORB REFLECTED</span>', 600);
            } else if (Math.hypot(orb.x - boss.player.x, orb.y - boss.player.y) < orb.r + player.r + 3) orb.blast = 28;
            if (orb.life <= 0) orb.blast = 28;
        } else {
            orb.x += orb.vx; orb.y += orb.vy; orb.life--;
            if (Math.hypot(orb.x - boss.caleb.x, orb.y - boss.caleb.y) < boss.caleb.size * .28) {
                boss.orbs.splice(index, 1); boss.eyeHits++; damageCalebBoss(1.75);
                if (boss.eyeHits >= 4 && boss.phase === 'eyesOn') {
                    boss.phase = 'eyesOff'; boss.phaseTimer = 1800; boss.eyeHits = 0; boss.cores = []; boss.rainTimer = 38; boss.schiminiTimer = 150;
                    showStoryLine('CALEB’S EYES GO WHITE.', 1800); playSound('emp');
                }
            } else if (orb.life <= 0) boss.orbs.splice(index, 1);
        }
    }
}

function spawnCalebSpread(boss) {
    const side = Math.random() < .5 ? -1 : 1;
    const origin = { x:boss.caleb.x + side * boss.caleb.size * .66, y:boss.caleb.y + 52 };
    const angle = Math.atan2(boss.player.y - origin.y, boss.player.x - origin.x);
    for (let index = -2; index <= 2; index++) {
        const spread = angle + index * .15;
        boss.shots.push({ x:origin.x, y:origin.y, vx:Math.cos(spread) * 5.4, vy:Math.sin(spread) * 5.4, life:150, r:8, type:'caleb' });
    }
}

function spawnCalebEyeRain(boss) {
    boss.eyeRain.push({ x:boss.arena.left + 24 + Math.random() * (boss.arena.right - boss.arena.left - 48), y:boss.arena.top - 32, vy:3.1 + Math.random() * 1.1, r:15, life:260 });
}

function spawnCalebSchimini(boss, fromX = null, fromY = null) {
    boss.schiminis.push({ x:fromX ?? (boss.arena.left + 30 + Math.random() * (boss.arena.right - boss.arena.left - 60)), y:fromY ?? (boss.arena.top + 90 + Math.random() * (boss.arena.bottom - boss.arena.top - 120)), speed:1.55 + Math.random() * .55, life:480 });
}

function updateCalebProjectiles(boss) {
    for (let index = boss.shots.length - 1; index >= 0; index--) {
        const shot = boss.shots[index]; shot.x += shot.vx; shot.y += shot.vy; shot.life--;
        if (Math.hypot(shot.x - boss.player.x, shot.y - boss.player.y) < shot.r + player.r) { damageCalebBossPlayer(1, 'PROJECTILE HIT'); boss.shots.splice(index, 1); continue; }
        if (shot.life <= 0 || shot.x < boss.arena.left - 20 || shot.x > boss.arena.right + 20 || shot.y < boss.arena.top - 20 || shot.y > boss.arena.bottom + 20) boss.shots.splice(index, 1);
    }
    for (let index = boss.eyeRain.length - 1; index >= 0; index--) {
        const eye = boss.eyeRain[index]; eye.y += eye.vy; eye.life--;
        if (Math.hypot(eye.x - boss.player.x, eye.y - boss.player.y) < eye.r + player.r) { damageCalebBossPlayer(1, 'FALLING EYE'); boss.eyeRain.splice(index, 1); continue; }
        if (eye.y > boss.arena.bottom - 24 || eye.life <= 0) {
            if (Math.random() < .27 && boss.cores.length < 2) boss.cores.push({ x:eye.x, y:boss.arena.bottom - 30, sealed:false, sealTimer:0, life:480 });
            boss.eyeRain.splice(index, 1);
        }
    }
    for (let index = boss.schiminis.length - 1; index >= 0; index--) {
        const enemy = boss.schiminis[index];
        const angle = Math.atan2(boss.player.y - enemy.y, boss.player.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.speed; enemy.y += Math.sin(angle) * enemy.speed; enemy.life--;
        if (Math.hypot(enemy.x - boss.player.x, enemy.y - boss.player.y) < player.r + 13) { damageCalebBossPlayer(1, 'SCHIMINI HIT'); boss.schiminis.splice(index, 1); continue; }
        if (enemy.life <= 0) boss.schiminis.splice(index, 1);
    }
}

function updateCalebBossAttacks(boss) {
    boss.switches.forEach(button => { if (button.life > 0) button.life--; if (button.life <= 0) button.active = false; if (button.cooldown > 0) button.cooldown--; if (button.flash > 0) button.flash--; });
    if (boss.sweep) {
        boss.sweep.life--;
        if (!boss.sweep.hitResolved && boss.sweep.life <= boss.sweep.hitAt) {
            boss.sweep.hitResolved = true;
            const unsafe = boss.sweep.side === 'left' ? boss.player.x < canvas.width / 2 : boss.player.x > canvas.width / 2;
            if (unsafe) damageCalebBossPlayer(1, 'HAND SWEEP');
        }
        if (boss.sweep.life <= 0) boss.sweep = null;
    }
    if (boss.slam) {
        boss.slam.life--;
        if (!boss.slam.impactResolved && boss.slam.life <= boss.slam.impactAt) {
            boss.slam.impactResolved = true;
            if (Math.hypot(boss.player.x - boss.slam.x, boss.player.y - boss.slam.y) < boss.slam.radius) damageCalebBossPlayer(1, 'GROUND SLAM');
            if (boss.stage >= 2) boss.holes.push({ x:boss.slam.x - 42, y:boss.slam.y - 32, w:84, h:64, warning:0, life:330 });
        }
        if (boss.slam.life <= 0) boss.slam = null;
    }
    boss.holes.forEach(hole => { hole.warning--; hole.life--; }); boss.holes = boss.holes.filter(hole => hole.life > 0);
    boss.walls.forEach(wall => wall.life--); boss.walls = boss.walls.filter(wall => wall.life > 0);
    boss.spreadTimer--; boss.sweepTimer--; boss.slamTimer--;
    if (boss.spreadTimer <= 0) { spawnCalebSpread(boss); boss.spreadTimer = boss.stage >= 2 ? 205 : 285; }
    if (!boss.sweep && boss.sweepTimer <= 0) { boss.sweep = { side:Math.random() < .5 ? 'left' : 'right', duration:120, life:120, hitAt:18, hitResolved:false }; boss.sweepTimer = boss.stage >= 2 ? 330 : 460; playSound('alarm'); }
    if (!boss.slam && boss.slamTimer <= 0) { boss.slam = { x:boss.player.x, y:boss.player.y, radius:112, side:Math.random() < .5 ? 'left' : 'right', duration:108, life:108, impactAt:1, impactResolved:false }; boss.slamTimer = boss.stage >= 2 ? 350 : 520; playSound('alarm'); }
    if (boss.stage >= 2) {
        boss.holeTimer--; boss.wallTimer--;
        if (boss.holeTimer <= 0 && boss.holes.length < 3) { boss.holes.push({ x:boss.arena.left + 45 + Math.random() * (boss.arena.right - boss.arena.left - 135), y:boss.arena.top + 130 + Math.random() * (boss.arena.bottom - boss.arena.top - 190), w:68, h:54, warning:65, life:300 }); boss.holeTimer = 260; }
        if (boss.wallTimer <= 0) { boss.walls.push({ x:boss.arena.left + 100 + Math.random() * (boss.arena.right - boss.arena.left - 230), y:boss.arena.top + 125 + Math.random() * (boss.arena.bottom - boss.arena.top - 230), w:Math.random() < .5 ? 18 : 116, h:Math.random() < .5 ? 116 : 18, life:230 }); boss.wallTimer = 320; }
    }
}

function updateCalebBossPhase(boss) {
    if (boss.phase === 'eyesOn') {
        boss.orbTimer--; if (boss.orbTimer <= 0) { spawnCalebOrb(boss); boss.orbTimer = boss.stage >= 2 ? 88 : 118; }
    } else {
        boss.phaseTimer--; boss.rainTimer--;
        if (boss.rainTimer <= 0) { spawnCalebEyeRain(boss); boss.rainTimer = boss.stage >= 2 ? 58 : 78; }
        for (let index = boss.cores.length - 1; index >= 0; index--) {
            const core = boss.cores[index]; core.life--;
            if (core.sealed) { core.sealTimer--; if (core.sealTimer <= 0) { damageCalebBoss(2.2); boss.cores.splice(index, 1); } }
            else if (core.life <= 0) boss.cores.splice(index, 1);
        }
        if (boss.phaseTimer <= 0) {
            boss.phase = 'eyesOn'; boss.eyeHits = 0; boss.orbTimer = 70; boss.stage = Math.max(boss.stage, boss.health <= boss.maxHealth * .58 ? 2 : 1);
            showStoryLine(boss.stage >= 2 ? 'THE ARENA STARTS TO FALL AWAY.' : 'CALEB’S EYES REFORM.', 1700); playSound('unlock');
        }
    }
}

function updateCalebBossMain() {
    const boss = calebBoss;
    if (!boss) return;
    boss.time++;
    calebBossPlayerMove();
    if (state !== 20) return;
    if (boss.mode === 'caleb') {
        updateCalebBossPhase(boss); updateCalebBossAttacks(boss); updateCalebOrbs(boss); updateCalebProjectiles(boss);
        if (boss.stage === 1 && boss.health <= boss.maxHealth * .56) boss.stage = 2;
    } else if (boss.mode === 'split') updateCalLebMain(boss);
}

function spawnCalFireball(boss, spiral = false) {
    if (!boss.cal) return;
    const angle = Math.atan2(boss.player.y - boss.cal.y, boss.player.x - boss.cal.x);
    const count = spiral ? 9 : 1;
    for (let index = 0; index < count; index++) {
        const spread = spiral ? index * Math.PI * 2 / count + boss.time * .035 : angle;
        const speed = spiral ? 3.4 : 4.8;
        boss.orbs.push({ x:boss.cal.x, y:boss.cal.y, vx:Math.cos(spread) * speed, vy:Math.sin(spread) * speed, r:10, life:180, blast:0, reflected:false, type:'cal' });
    }
}

function spawnLebSpread(boss) {
    if (!boss.leb) return;
    const angle = Math.atan2(boss.player.y - boss.leb.y, boss.player.x - boss.leb.x);
    for (let index = -2; index <= 2; index++) { const spread = angle + index * .16; boss.shots.push({ x:boss.leb.x, y:boss.leb.y, vx:Math.cos(spread) * 4.6, vy:Math.sin(spread) * 4.6, life:170, r:8, type:'leb' }); }
}

function updateCalLebMain(boss) {
    boss.switches.forEach(button => { if (button.life > 0) button.life--; if (button.life <= 0) button.active = false; if (button.cooldown > 0) button.cooldown--; if (button.flash > 0) button.flash--; });
    boss.fireballTimer--; boss.spreadTimer--; boss.wallTimer--; boss.pullTimer--; boss.nestTimer--; boss.schiminiTimer--; boss.holeTimer--;
    if (boss.fireballTimer <= 0) { spawnCalFireball(boss, boss.time % 3 === 0); boss.fireballTimer = 105; }
    if (boss.spreadTimer <= 0) { spawnLebSpread(boss); boss.spreadTimer = 175; }
    if (boss.wallTimer <= 0 && boss.cal) { boss.walls.push({ x:boss.arena.left + 95 + Math.random() * (boss.arena.right - boss.arena.left - 220), y:boss.arena.top + 125 + Math.random() * (boss.arena.bottom - boss.arena.top - 210), w:Math.random() < .5 ? 20 : 112, h:Math.random() < .5 ? 112 : 20, life:240 }); boss.wallTimer = 300; }
    if (boss.pullTimer <= 0 && boss.cal) { boss.pullTimerActive = 82; boss.pullTimer = 410; playSound('alarm'); }
    if (boss.schiminiTimer <= 0 && boss.leb) { spawnCalebSchimini(boss, boss.leb.x, boss.leb.y); boss.schiminiTimer = 145; }
    if (boss.nestTimer <= 0 && boss.leb) {
        const nest = boss.nests.find(entry => Math.hypot(entry.x - boss.leb.x, entry.y - boss.leb.y) < 230);
        if (nest) boss.leb.targetNest = nest;
        boss.nestTimer = 260;
    }
    if (boss.cal) {
        boss.cal.teleportTimer--;
        if (boss.cal.teleportTimer <= 0) { boss.cal.x = boss.arena.left + 90 + Math.random() * (boss.arena.right - boss.arena.left - 180); boss.cal.y = boss.arena.top + 120 + Math.random() * (boss.arena.bottom - boss.arena.top - 190); boss.cal.teleportTimer = 230; boss.flash = 16; playSound('tick'); }
    }
    if (boss.leb && boss.leb.targetNest) {
        const nest = boss.leb.targetNest, angle = Math.atan2(nest.y - boss.leb.y, nest.x - boss.leb.x);
        boss.leb.x += Math.cos(angle) * 1.8; boss.leb.y += Math.sin(angle) * 1.8;
        if (Math.hypot(nest.x - boss.leb.x, nest.y - boss.leb.y) < 24) {
            if (nest.sealed) damageCalebBoss(2.4, 'LEB'); else boss.healthLeb = Math.min(boss.maxHealthLeb, boss.healthLeb + 1.5);
            boss.nests = boss.nests.filter(entry => entry !== nest); boss.leb.targetNest = null; boss.flash = 14;
        }
    } else if (boss.leb) {
        const angle = Math.atan2(boss.leb.y - boss.player.y, boss.leb.x - boss.player.x);
        boss.leb.x = Math.max(boss.arena.left + 58, Math.min(boss.arena.right - 58, boss.leb.x + Math.cos(angle) * 1.05));
        boss.leb.y = Math.max(boss.arena.top + 100, Math.min(boss.arena.bottom - 54, boss.leb.y + Math.sin(angle) * 1.05));
    }
    if (boss.nests.length < 3 && boss.time % 300 === 0) boss.nests.push({ x:boss.arena.left + 90 + Math.random() * (boss.arena.right - boss.arena.left - 180), y:boss.arena.top + 150 + Math.random() * (boss.arena.bottom - boss.arena.top - 220), sealed:false, sealLife:0 });
    boss.nests.forEach(nest => { if (nest.sealLife > 0) { nest.sealLife--; if (nest.sealLife <= 0) nest.sealed = false; } });
    for (let index = boss.orbs.length - 1; index >= 0; index--) {
        const orb = boss.orbs[index]; orb.x += orb.vx; orb.y += orb.vy; orb.life--;
        const button = boss.switches.find(entry => entry.active && Math.hypot(orb.x - entry.x, orb.y - entry.y) < 22);
        if (!orb.reflected && button) { button.active = false; button.cooldown = 70; orb.reflected = true; const angle = boss.cal ? Math.atan2(boss.cal.y - orb.y, boss.cal.x - orb.x) : 0; orb.vx = Math.cos(angle) * 6.2; orb.vy = Math.sin(angle) * 6.2; orb.life = 160; playSound('unlock'); }
        else if (!orb.reflected && Math.hypot(orb.x - boss.player.x, orb.y - boss.player.y) < orb.r + player.r) { damageCalebBossPlayer(1, 'FIREBALL HIT'); boss.orbs.splice(index, 1); continue; }
        else if (orb.reflected && boss.cal && Math.hypot(orb.x - boss.cal.x, orb.y - boss.cal.y) < 58) { boss.orbs.splice(index, 1); damageCalebBoss(2.2, 'CAL'); continue; }
        if (orb.life <= 0 || orb.x < boss.arena.left - 30 || orb.x > boss.arena.right + 30 || orb.y < boss.arena.top - 30 || orb.y > boss.arena.bottom + 30) boss.orbs.splice(index, 1);
    }
    updateCalebProjectiles(boss);
    boss.walls.forEach(wall => wall.life--); boss.walls = boss.walls.filter(wall => wall.life > 0);
    boss.holes.forEach(hole => hole.life--); boss.holes = boss.holes.filter(hole => hole.life > 0);
    if (boss.holeTimer <= 0 && boss.holes.length < 2) { boss.holes.push({ x:boss.arena.left + 70 + Math.random() * (boss.arena.right - boss.arena.left - 190), y:boss.arena.top + 140 + Math.random() * (boss.arena.bottom - boss.arena.top - 200), w:74, h:58, warning:55, life:280 }); boss.holeTimer = 300; }
}
function drawBossBar(x, y, width, height, value, max, color, label) {
    ctx.fillStyle = 'rgba(0,0,0,.72)'; ctx.fillRect(x, y, width, height);
    ctx.fillStyle = color; ctx.fillRect(x + 2, y + 2, Math.max(0, (width - 4) * Math.max(0, value / max)), height - 4);
    ctx.strokeStyle = 'rgba(255,255,255,.72)'; ctx.lineWidth = 1; ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center'; ctx.fillText(`${label} · ${Math.ceil(Math.max(0, value))}/${max}`, x + width / 2, y - 5);
}

function drawCalebBossPlayer(boss) {
    const x = boss.player.x, y = boss.player.y;
    if (cosmetics.trail !== 'none' && boss.playerTrail?.length > 1) {
        const trailColor = cosmetics.trail === 'spark' ? 'rgba(255,238,86,.82)' : cosmetics.trail === 'ember' ? 'rgba(255,70,24,.78)' : cosmetics.trail === 'static' ? 'rgba(185,245,255,.65)' : cosmetics.trail === 'circle' ? 'rgba(255,255,255,.78)' : 'rgba(180,210,255,.42)';
        ctx.save(); ctx.globalAlpha = .7; ctx.strokeStyle = trailColor; ctx.lineWidth = cosmetics.trail === 'ghost' ? 10 : cosmetics.trail === 'ember' ? 4 : 6; ctx.lineCap = cosmetics.trail === 'static' ? 'butt' : 'round';
        if (cosmetics.trail === 'static') ctx.setLineDash([8, 7]); ctx.beginPath(); boss.playerTrail.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    }
    ctx.fillStyle = 'rgba(0,0,0,.42)'; ctx.beginPath(); ctx.ellipse(x + 3, y + 16, 16, 7, 0, 0, Math.PI * 2); ctx.fill();
    const skin = skinImages[cosmetics.skin];
    if (cosmetics.skin !== 'default' && skin?.complete && skin.naturalWidth) {
        const size = player.r * 3.35; ctx.globalAlpha = boss.playerInvuln > 0 && boss.playerInvuln % 6 < 3 ? .35 : 1; ctx.drawImage(skin, x - size / 2, y - size / 2, size, size); ctx.globalAlpha = 1;
    } else {
        ctx.fillStyle = boss.playerInvuln > 0 ? '#fff0a0' : (playerColors[cosmetics.color] || '#76d9ff'); ctx.beginPath(); ctx.arc(x, y, player.r + 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#102332'; ctx.beginPath(); ctx.arc(x - 4, y - 2, 2, 0, Math.PI * 2); ctx.arc(x + 4, y - 2, 2, 0, Math.PI * 2); ctx.fill();
    }
    const mask = maskImages[cosmetics.mask], hat = hatImages[cosmetics.hat];
    if (cosmetics.mask !== 'none' && mask?.complete && mask.naturalWidth) ctx.drawImage(mask, x - player.r * 2, y - player.r * 2.15, player.r * 4, player.r * 4);
    if (cosmetics.hat !== 'none' && hat?.complete && hat.naturalWidth) ctx.drawImage(hat, x - player.r * 2, y - player.r * 2.15, player.r * 4, player.r * 4);
}

function drawCalebBossIntro() {
    const scene = calebBoss; if (!scene) return;
    const t = scene.introTime, progress = Math.min(1, t / scene.introDuration), cx = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createRadialGradient(cx, canvas.height * .55, 10, cx, canvas.height * .55, Math.max(canvas.width, canvas.height) * .75);
    gradient.addColorStop(0, 'rgba(109,0,30,.45)'); gradient.addColorStop(.56, '#0d0209'); gradient.addColorStop(1, '#020103');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffcad6'; ctx.font = 'bold 23px Arial'; ctx.textAlign = 'center'; ctx.fillText('THE OTHER SIDE OF THE GATE', cx, 54);
    ctx.fillStyle = '#b98595'; ctx.font = '14px Arial'; ctx.fillText('THE FRAGMENTS WERE NEVER A KEY', cx, 80);
    const gateY = canvas.height * .42;
    ctx.fillStyle = 'rgba(0,0,0,.94)'; ctx.beginPath(); ctx.ellipse(cx, gateY, 84 + Math.sin(t * .08) * 5, 142 + Math.sin(t * .08) * 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c36688'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(cx, gateY, 90, 148, 0, 0, Math.PI * 2); ctx.stroke();
    scene.player.x = cx; scene.player.y = canvas.height * .79 - Math.min(1, Math.max(0, (t - 8) / 86)) * (canvas.height * .37);
    drawCalebBossPlayer(scene);
    const size = Math.min(310, canvas.width * .5), y = gateY - 24 - progress * 32;
    calebBossImage(bossImages.caleb, cx, y, size, size, Math.sin(t * .025) * .015, Math.min(1, Math.max(0, (progress - .34) * 2.3)));
    if (progress > .35) { ctx.strokeStyle = `rgba(255,30,75,${(progress - .35) * 1.35})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - size * .18, y - size * .14); ctx.lineTo(cx + size * .18, y - size * .14); ctx.stroke(); }
    if (t > 125) { ctx.fillStyle = `rgba(255,255,255,${Math.min(.75, (t - 125) / 80)})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
}

function drawCalebBossDefeat() {
    const boss = calebBoss; if (!boss) return;
    const t = boss.defeatTime, cx = canvas.width / 2, cy = boss.caleb.y, size = boss.caleb.size;
    ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#070106'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const shake = Math.sin(t * 1.7) * Math.min(9, t / 10); ctx.save(); ctx.translate(shake, Math.cos(t * 1.31) * Math.min(7, t / 12));
    const separation = Math.max(0, (t - 84) * 1.8);
    if (!boss.splitVisible) calebBossImage(bossImages.caleb, cx, cy + 45, size, size);
    else { calebBossImage(bossImages.cal, cx - separation, cy + 50, 118, 258, -.06); calebBossImage(bossImages.leb, cx + separation, cy + 50, 118, 258, .06); }
    ctx.strokeStyle = '#fff1f5'; ctx.shadowColor = '#ff315b'; ctx.shadowBlur = 18; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, cy - size * .42); ctx.lineTo(cx + Math.sin(t * .3) * 8, cy + size * .42); ctx.stroke(); ctx.restore();
    ctx.fillStyle = '#ffd6df'; ctx.font = 'bold 23px Arial'; ctx.textAlign = 'center'; ctx.fillText(boss.splitVisible ? 'TWO HALVES REMAIN' : 'CALEB IS SPLITTING', cx, 52);
    if (t > 115) { ctx.fillStyle = `rgba(255,255,255,${Math.min(.9, (t - 115) / 50)})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
}

function drawCalebBossEncounter() {
    const boss = calebBoss; if (!boss) return;
    const arena = boss.arena, width = canvas.width, height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    const background = ctx.createRadialGradient(width * .5, height * .48, 20, width * .5, height * .48, Math.max(width, height) * .76);
    background.addColorStop(0, boss.mode === 'split' ? '#321424' : '#27101b'); background.addColorStop(.62, '#0b050b'); background.addColorStop(1, '#020103');
    ctx.fillStyle = background; ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = boss.mode === 'split' ? 'rgba(53,19,30,.94)' : 'rgba(24,10,20,.94)'; ctx.fillRect(arena.left, arena.top, arena.right - arena.left, arena.bottom - arena.top);
    ctx.save(); ctx.beginPath(); ctx.rect(arena.left, arena.top, arena.right - arena.left, arena.bottom - arena.top); ctx.clip();
    ctx.strokeStyle = 'rgba(255,116,143,.11)'; ctx.lineWidth = 1;
    for (let x = arena.left; x < arena.right; x += 42) { ctx.beginPath(); ctx.moveTo(x, arena.top); ctx.lineTo(x, arena.bottom); ctx.stroke(); }
    for (let y = arena.top; y < arena.bottom; y += 42) { ctx.beginPath(); ctx.moveTo(arena.left, y); ctx.lineTo(arena.right, y); ctx.stroke(); }
    ctx.restore(); ctx.strokeStyle = '#a43351'; ctx.lineWidth = 4; ctx.strokeRect(arena.left, arena.top, arena.right - arena.left, arena.bottom - arena.top);
    for (const hole of boss.holes || []) { ctx.fillStyle = hole.warning > 0 ? `rgba(255,190,70,${.15 + Math.sin(boss.time * .25) * .06})` : '#010103'; ctx.fillRect(hole.x, hole.y, hole.w, hole.h); ctx.strokeStyle = hole.warning > 0 ? '#ffd45c' : '#8c243b'; ctx.lineWidth = 3; if (hole.warning > 0) ctx.setLineDash([8, 6]); ctx.strokeRect(hole.x, hole.y, hole.w, hole.h); ctx.setLineDash([]); }
    for (const wall of boss.walls || []) { ctx.fillStyle = 'rgba(111,18,38,.92)'; ctx.fillRect(wall.x, wall.y, wall.w, wall.h); ctx.strokeStyle = '#e65c75'; ctx.lineWidth = 2; ctx.strokeRect(wall.x, wall.y, wall.w, wall.h); }
    if (boss.sweep) {
        const left = boss.sweep.side === 'left';
        const progress = Math.max(0, Math.min(1, 1 - boss.sweep.life / boss.sweep.duration));
        const dangerAlpha = boss.sweep.life <= boss.sweep.hitAt + 18 ? .62 : .16 + progress * .12;
        ctx.fillStyle = `rgba(255,40,74,${dangerAlpha})`;
        ctx.fillRect(left ? arena.left : width / 2, arena.top, (arena.right - arena.left) / 2, arena.bottom - arena.top);
        ctx.strokeStyle = `rgba(255,150,170,${.45 + progress * .4})`; ctx.lineWidth = 2; ctx.setLineDash([12, 9]);
        ctx.strokeRect(left ? arena.left + 4 : width / 2 + 4, arena.top + 4, (arena.right - arena.left) / 2 - 8, arena.bottom - arena.top - 8); ctx.setLineDash([]);
        ctx.fillStyle = '#ffd2da'; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'center'; ctx.fillText('HAND SWEEP — MOVE TO THE OTHER SIDE', width / 2, arena.top + 24);
    }
    if (boss.slam) {
        const progress = Math.max(0, Math.min(1, 1 - boss.slam.life / boss.slam.duration));
        const warning = boss.slam.life > boss.slam.impactAt;
        const radius = boss.slam.radius * (.72 + progress * .28);
        ctx.strokeStyle = warning ? `rgba(255,210,110,${.42 + Math.sin(boss.time * .18) * .12})` : 'rgba(255,90,110,.92)';
        ctx.lineWidth = warning ? 4 : 7; ctx.setLineDash(warning ? [10, 7] : []);
        ctx.beginPath(); ctx.arc(boss.slam.x, boss.slam.y, radius, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = warning ? '#ffe0a6' : '#ffb6c3'; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'center';
        ctx.fillText(warning ? 'HAND SLAM — GET OUT' : 'IMPACT', boss.slam.x, boss.slam.y - radius - 12);
    }
    for (const button of boss.switches || []) { ctx.fillStyle = button.active ? '#91ffd0' : '#5a2034'; ctx.shadowColor = button.active ? '#89ffd0' : '#e36b86'; ctx.shadowBlur = button.active ? 18 : 4; ctx.fillRect(button.x - 14, button.y - 14, 28, 28); ctx.shadowBlur = 0; ctx.strokeStyle = button.active ? '#eafff6' : '#e97891'; ctx.lineWidth = 2; ctx.strokeRect(button.x - 14, button.y - 14, 28, 28); ctx.fillStyle = '#240914'; ctx.fillRect(button.x - 5, button.y - 5, 10, 10); if (Math.hypot(boss.player.x - button.x, boss.player.y - button.y) < 60 && !button.active) { ctx.fillStyle = '#fff1f4'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; ctx.fillText('[TAP / E] ARM SWITCH', button.x, button.y - 22); } }
    for (const core of boss.cores || []) { ctx.fillStyle = core.sealed ? '#caa4ff' : '#f5f1ff'; ctx.shadowColor = '#d0a0ff'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(core.x, core.y, 13 + Math.sin(boss.time * .12) * 2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#28132f'; ctx.beginPath(); ctx.arc(core.x, core.y, 5, 0, Math.PI * 2); ctx.fill(); if (Math.hypot(boss.player.x - core.x, boss.player.y - core.y) < 48 && !core.sealed) { ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; ctx.fillText('[TAP / E] SEAL CORE', core.x, core.y - 22); } }
    for (const nest of boss.nests || []) { ctx.fillStyle = nest.sealed ? '#d79cff' : '#6d1d3e'; ctx.shadowColor = nest.sealed ? '#ddaaff' : '#d4476c'; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(nest.x, nest.y, 21 + Math.sin(boss.time * .08 + nest.x) * 3, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = '#ff9cb4'; ctx.lineWidth = 2; ctx.stroke(); if (Math.hypot(boss.player.x - nest.x, boss.player.y - nest.y) < 54 && !nest.sealed) { ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; ctx.fillText('[TAP / E] SEAL NEST', nest.x, nest.y - 29); } }
    for (const orb of boss.orbs || []) { ctx.fillStyle = orb.reflected ? '#c69bff' : '#09020c'; ctx.shadowColor = orb.reflected ? '#ead5ff' : '#b63767'; ctx.shadowBlur = 15; ctx.beginPath(); ctx.arc(orb.x, orb.y, orb.r + (orb.blast ? (28 - orb.blast) * .8 : 0), 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; if (orb.blast) { ctx.strokeStyle = '#ff95a9'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(orb.x, orb.y, 24 + (28 - orb.blast), 0, Math.PI * 2); ctx.stroke(); } }
    for (const shot of boss.shots || []) { ctx.fillStyle = shot.type === 'leb' ? '#ff8b9c' : '#ffa94f'; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(shot.x, shot.y, shot.r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; }
    for (const eye of boss.eyeRain || []) { ctx.fillStyle = '#f5efff'; ctx.strokeStyle = '#9d4d83'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(eye.x, eye.y, eye.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#210916'; ctx.beginPath(); ctx.arc(eye.x, eye.y, 5, 0, Math.PI * 2); ctx.fill(); }
    for (const enemy of boss.schiminis || []) { ctx.fillStyle = '#71213e'; ctx.beginPath(); ctx.arc(enemy.x, enemy.y, 13, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(enemy.x - 4, enemy.y - 2, 2, 0, Math.PI * 2); ctx.arc(enemy.x + 4, enemy.y - 2, 2, 0, Math.PI * 2); ctx.fill(); }
    if (boss.mode === 'caleb') {
        const eyes = getCalebEyePoints(boss), body = boss.caleb, activeHand = boss.sweep?.side || boss.slam?.side;
        if (activeHand !== 'left') { const hand = getCalebHandPose(boss, 'left'); calebBossImage(bossImages.leftHand, hand.x, hand.y, 132, 132, hand.angle); }
        if (activeHand !== 'right') { const hand = getCalebHandPose(boss, 'right'); calebBossImage(bossImages.rightHand, hand.x, hand.y, 132, 132, hand.angle); }
        calebBossImage(bossImages.caleb, body.x, body.y, body.size, body.size, Math.sin(boss.time * .03) * .012, boss.flash > 0 ? .62 : 1);
        if (activeHand) { const hand = getCalebHandPose(boss, activeHand); calebBossImage(activeHand === 'left' ? bossImages.leftHand : bossImages.rightHand, hand.x, hand.y, 142, 142, hand.angle); }
        if (boss.phase === 'eyesOn') eyes.forEach(eye => { ctx.fillStyle = 'rgba(7,0,9,.96)'; ctx.shadowColor = '#ff436e'; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(eye.x, eye.y, body.size * .092, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = '#ff99aa'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(eye.x, eye.y, body.size * .115, 0, Math.PI * 2); ctx.stroke(); }); else eyes.forEach(eye => { ctx.strokeStyle = '#fff7fb'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(eye.x, eye.y, body.size * .09, 0, Math.PI * 2); ctx.stroke(); });
    }
    else if (boss.mode === 'split') { if (boss.cal) calebBossImage(bossImages.cal, boss.cal.x, boss.cal.y, boss.cal.size, boss.cal.size * 2.18, Math.sin(boss.time * .06) * .03); if (boss.leb) calebBossImage(bossImages.leb, boss.leb.x, boss.leb.y, boss.leb.size, boss.leb.size * 2.18, -Math.sin(boss.time * .055) * .03); }
    drawCalebBossPlayer(boss);
    ctx.fillStyle = '#ffe1e8'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center'; ctx.fillText(boss.mode === 'split' ? 'THE BROKEN BODY' : 'CALEB', width / 2, 32);
    if (boss.mode === 'split') { drawBossBar(28, 48, Math.min(260, width * .32), 15, boss.healthCal, boss.maxHealthCal, '#cf4d73', 'CAL'); drawBossBar(width - 28 - Math.min(260, width * .32), 48, Math.min(260, width * .32), 15, boss.healthLeb, boss.maxHealthLeb, '#9c64cf', 'LEB'); }
    else { drawBossBar(width * .2, 48, width * .6, 17, boss.health, boss.maxHealth, '#bd3157', boss.stage >= 2 ? 'CALEB · COLLAPSING ARENA' : boss.phase === 'eyesOff' ? 'CALEB · EYES DISABLED' : 'CALEB'); }
    drawBossBar(width * .25, height - 30, width * .5, 12, boss.playerHealth, boss.maxPlayerHealth, '#64d6ff', 'PLAYER HEALTH');
    ctx.fillStyle = '#eacbd4'; ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.fillText(boss.mode === 'split' ? 'ARM SWITCHES TO REFLECT CAL’S FIRE · SEAL LEB’S NESTS BEFORE HE EATS THEM' : boss.phase === 'eyesOff' ? 'RARE EYE CORES CAN BE SEALED · SURVIVE UNTIL CALEB’S EYES RETURN' : 'ARM A SWITCH, THEN BAIT CALEB’S DARK ORB THROUGH IT', width / 2, height - 48);
    if (boss.playerHitFlash > 0) { ctx.fillStyle = `rgba(255,255,255,${boss.playerHitFlash / 30})`; ctx.fillRect(0, 0, width, height); }
}

function failGeneratorTask(label) {
    if (generatorFailureTarget !== currentGen) { generatorFailureTarget = currentGen; generatorFailureStreak = 0; }
    generatorFailureStreak++;
    if (generatorFailureStreak >= 3) unlockCosmetic('idiotMask');
    triggerBloodHunt(); state = 1; player.stunTimer = 120; clearMovementKeys(); playSound('fail'); notify(`${label} FAILED · STUNNED`, 'danger');
}
function launchCurrentGeneratorTask() {
    if (currentGen.type === 'multi') { beginCircuitPuzzle(); return; }
    if (currentGen.type === 'tune') { beginTuningPuzzle(); return; }
    if (currentGen.type === 'rapid') { beginRapidPuzzle(); return; }
    if (currentGen.type === 'simon') { beginSimonPuzzle(); return; }
    const roll = Math.random(), isSkillCheck = (currentDiff === 0 && roll < .2) || (currentDiff === 1 && roll < .5) || (currentDiff === 2 && roll < .8);
    if (isSkillCheck) {
        state = 5; scNeedle = 0; scHits = 0; scRequired = Math.max(1, 3-upgHack+(monsters.some(enemy=>enemy.isReinforced)?1:0)); scSpeed = [0.0195,0.0325,0.0455][currentDiff]*(1-upgQuick*.10);
        let width = [Math.PI/2,Math.PI/3,Math.PI/5][currentDiff]; if (repairAssist>0) width=Math.min(Math.PI*.78,width*1.7); scZoneStart=Math.random()*(Math.PI*2-width); scZoneEnd=scZoneStart+width; scDelay=60;
    } else { state=2; const opts=['w','a','s','d'], length=Math.max(1,3-upgHack+(monsters.some(enemy=>enemy.isReinforced)?1:0)); puzzleSequence=Array.from({length},()=>opts[Math.floor(Math.random()*4)]); }
    updateHUD();
}

function boilerObjectiveComplete() {
    return currentMapId !== 'boilerworks' || (activeGens >= totalGens && coolingValves.length === 3 && coolingValves.every(valve => valve.active));
}

function crimsonObjectiveComplete() {
    const rhysActive = monsters.some(enemy => enemy.name === 'RHYS');
    return currentMapId !== 'crimson' || !rhysActive || (activeGens >= totalGens && rhysSealCollected && rhysTrapArmed);
}

function beginFinalChase() {
    state = 3;
    if (monster.name === 'NOAH') { monster.invisible = false; noahState = 'hunt'; notify('THE BEACON EXPOSES NOAH · CATCH HIM', 'unlock'); }
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
    if (currentGen?.isSubway) {
        completeSubwayPanel(currentGen);
        return;
    }
    if (currentGen.type === 'multi' && currentGen.stage < currentGen.requiredStages - 1) {
        currentGen.stage++;
        playSound('success');
        showMsg(`<span style="color:#ffcc00">CIRCUIT STAGE ${currentGen.stage + 1}/${currentGen.requiredStages}</span>`, 850);
        beginCircuitPuzzle();
        return;
    }
    currentGen.active = true;
    generatorFailureStreak = 0; generatorFailureTarget = null;
    repairAssist = 0;
    currentGen.repairFlash = 45;
    noiseTarget = { x: currentGen.x, y: currentGen.y };
    noiseTimer = 300;
    activeGens++;
    stats.generators++;
    if (stats.generators >= 1000) unlockCosmetic('generator');
    if (stats.generators >= 56) { unlockCosmetic('luffyHat'); saveData(); }
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
    if (developerUnlockDialogOpen || document.getElementById('developerRoomDialog')?.style.display === 'flex') return;
    if (developerStudioOpen) {
        if (['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName)) return;
        if (developerState.playtesting) {
            if (k === 'escape') { developerPlaytest(); return; }
            const movement = { w:[0,-8], arrowup:[0,-8], s:[0,8], arrowdown:[0,8], a:[-8,0], arrowleft:[-8,0], d:[8,0], arrowright:[8,0] }[k];
            if (movement) { e.preventDefault(); developerTestMove(movement[0], movement[1]); }
            return;
        }
        if (k === 'delete' || k === 'backspace') { e.preventDefault(); deleteDeveloperSelection(); return; }
        if (k === 'escape') { if (developerState.pointer) { developerState.pointer = null; developerState.preview = null; renderDeveloperCanvas(); } else setDeveloperTool('select'); return; }
        return;
    }
    if (state === 0 && !developerUnlockDialogOpen) {
        if (e.shiftKey && k === 'o') {
            developerChordArmed = true;
            window.clearTimeout(window.__developerChordTimeout);
            window.__developerChordTimeout = window.setTimeout(() => { developerChordArmed = false; }, 1200);
            return;
        }
        if (developerChordArmed && k === 'p') {
            developerChordArmed = false;
            window.clearTimeout(window.__developerChordTimeout);
            e.preventDefault();
            openDeveloperUnlock();
            return;
        }
    }
    if (state === 11) {
        if (k === ' ' || k === 'enter') { e.preventDefault(); fireAmineRoadWeapon(amineRoad?.aimX); return; }
        if (k === 'arrowleft') k = 'a';
        if (k === 'arrowright') k = 'd';
        if (k === 'arrowup') k = 'w';
        if (k === 'arrowdown') k = 's';
        if (k in keys) { keys[k] = true; e.preventDefault(); }
        return;
    }
    if (state === 18) {
        if (k === 'arrowleft') k = 'a';
        if (k === 'arrowright') k = 'd';
        if (k === 'arrowup') k = 'w';
        if (k === 'arrowdown') k = 's';
        if (k in keys) { keys[k] = true; e.preventDefault(); }
        return;
    }
    if (state === 20) {
        if (k === 'arrowleft') k = 'a';
        if (k === 'arrowright') k = 'd';
        if (k === 'arrowup') k = 'w';
        if (k === 'arrowdown') k = 's';
        if (k === 'e' || k === ' ') { e.preventDefault(); interactCalebBossAtPlayer(); return; }
        if (k in keys) { keys[k] = true; e.preventDefault(); }
        return;
    }
    if (state === 19 || state === 21) return;
    if (state === 14) {
        if (k === 'escape') { e.preventDefault(); exitSubwayControlPuzzle(); }
        return;
    }
    if (k==='v' && monsters.some(enemy => enemy.name === 'AMINE') && state===1) { amineFocus=true; return; }
    if (k === 'm' && state === 1) { toggleMapOverlay(); return; }
    if (hotelDialogueOpen) {
        if (k === 'escape' || k === 'e') closeHotelDialogue();
        return;
    }
    if (state === 0 || state === 4) return;
    
    // Adrenaline
    if (itemAllowed('adrenaline') && (state === 1 || state === 3) && k === ' ' && invAdrenaline > 0 && player.boostTimer <= 0 && player.stunTimer <= 0) {
        invAdrenaline--; consumeLoadoutItem('adrenaline');
        runItemsUsed++; stats.itemsUsed++; advanceDailyObjective('items');
        player.boostTimer = monsters.some(enemy => enemy.hasHexed) ? 120 : 240; 
        saveData(); updateHUD();
    }

    // Flashbang
    if (itemAllowed('flashbang') && (state === 1 || state === 3) && k === 'f' && invFlashbang > 0 && monsters.some(enemy => enemy.stunTimer <= 0)) {
        const caughtNoahAtReveal = noahAppearanceWindow > 0 && monsters.some(enemy => enemy.name === 'NOAH' && !enemy.invisible && Math.hypot(player.x - enemy.x, player.y - enemy.y) < 180);
        invFlashbang--; consumeLoadoutItem('flashbang');
        runItemsUsed++; stats.itemsUsed++; advanceDailyObjective('items');
        for (const enemy of monsters) enemy.stunTimer = enemy.isResilient ? 120 : 240;
        for (const enemy of monsters.filter(enemy => enemy.name === 'NOAH')) {
            const far = floors.filter(tile => Math.hypot(tile.c * TS + TS / 2 - player.x, tile.r * TS + TS / 2 - player.y) > TS * 12 && !isSafeRoom(tile.c * TS + TS / 2, tile.r * TS + TS / 2));
            const tile = far[Math.floor(Math.random() * Math.max(1, far.length))] || floors.at(-1);
            enemy.x = tile.c * TS + TS / 2; enemy.y = tile.r * TS + TS / 2; enemy.path = []; noahState = 'hidden'; noahTimer = 0;
        }
        if (caughtNoahAtReveal) unlockCosmetic('trollFace');
        noahAppearanceWindow = 0;
        flashAlpha = 1.0;
        playSound('emp');
        saveData(); updateHUD();
    }

    if ((state === 1 || state === 3) && k === 'shift') { e.preventDefault(); useDash(); return; }
    if ((state === 1 || state === 3) && k === 'b') activateBreath();
    if (state === 1 && k === 'h') toggleHide();
    if ((state === 1 || state === 3) && k === 'n') useNoiseMaker();
    if ((state === 1 || state === 3) && k === 't') placeBearTrap();
    if ((state === 1 || state === 3) && k === 'r') useBattery();
    if ((state === 1 || state === 3) && k === 'x') useSignalScrambler();
    if (state === 1 && k === 'g') useNeutralizer();
    if (state === 1 && k === 'k') useRepairKit();
    if ((state === 1 || state === 3) && k === 'l') useFlare();

    // Generator Interaction
    if (state === 1 && k === 'e' && player.stunTimer <= 0) {
        const lucky = luckyBlocks.find(block => !block.opened && Math.hypot(player.x-block.x,player.y-block.y)<36);
        if (lucky) { openLuckyBlock(lucky); return; }
        if (currentMapId === 'lucas') {
            if (nearLucasLever) {
                nearLucasLever.active = true;
                playSound('success');
                const activeLevers = lucasLevers.filter(lever => lever.active).length;
                if (lucasLevers.length && lucasLevers.every(lever => lever.active)) {
                    const secondFragment = lucasFragments.find(fragment => fragment.id === 2);
                    if (secondFragment) secondFragment.available = true;
                    lucasObjectiveStage = 'fragment2';
                    notify('THE RELAYS CLICK · THE SERVICE FRAGMENT IS RELEASED', 'unlock');
                } else notify(`SHADOW RELAY ${activeLevers}/${lucasLevers.length} RESTORED`, 'unlock');
                updateHUD();
                return;
            }
            if (nearLucasFragment) {
                beginLucasFragmentPuzzle(nearLucasFragment);
                return;
            }
            if (nearLucasAltar) {
                if (!lucasFragments.length || !lucasFragments.every(fragment => fragment.collected)) {
                    notify('THE CALEB VESSEL NEEDS ALL THREE FRAGMENTS', 'warning');
                    return;
                }
                if (!lucasCarryFragment || lucasCarryFragment.id !== 3) {
                    notify('THE LAST FRAGMENT MUST BE CARRIED HERE BY HAND', 'warning');
                    return;
                }
                if (!lucasAltar.placed) {
                    lucasCarryFragment.carried = false;
                    lucasCarryFragment = null;
                    lucasAltar.placed = true;
                    lucasObjectiveStage = 'gate';
                    lucasState = 'runningToGate';
                    lucasGate.open = false;
                    monster.path = [];
                    notify('THE FRAGMENTS HUM · LUCAS RUNS FOR THE GATE', 'danger');
                    playSound('alarm');
                    updateHUD();
                }
                return;
            }
        }
        if (currentMapId === 'amine' && activeGens >= totalGens && amineExitGate && Math.hypot(player.x-amineExitGate.x,player.y-amineExitGate.y)<44) { beginAmineFinalChase(); return; }
        if (currentMapId === 'subway' && subwayTornTicket && !subwayTornTicket.collected && Math.hypot(player.x - subwayTornTicket.x, player.y - subwayTornTicket.y) < 34) {
            subwayTornTicket.collected = true;
            notify('TORN TICKET RECOVERED · BRING IT TO RAIL CONTROL', 'unlock');
            updateHUD();
            return;
        }
        if (currentMapId === 'subway' && subwayGoldSphere && !subwayGoldSphere.collected && Math.hypot(player.x - subwayGoldSphere.x, player.y - subwayGoldSphere.y) < 34) {
            subwayGoldSphere.collected = true;
            subwayGoldSphere.eligible = activeGens === 0;
            if (subwayGoldSphere.eligible) activateSubwayGoldPressure();
            else notify('GOLD FARE SPHERE RECOVERED · THE FARE WAS LATE', 'warning');
            updateHUD();
            return;
        }
        if (currentMapId === 'subway' && nearSubwayControl && subwayTornTicket?.collected && !subwayTornTicket.delivered) {
            subwayTornTicket.delivered = true;
            notify(subwayBronzeEligible ? 'TORN TICKET ACCEPTED · SIGNAL ROUTE OPEN' : 'TORN TICKET ACCEPTED · THE FIRST SIGNAL WAS ALREADY RESTORED', subwayBronzeEligible ? 'unlock' : 'warning');
            updateHUD();
            return;
        }
        if (currentMapId === 'subway' && nearSubwayControl) { beginSubwayControlPuzzle(); return; }
        if (currentMapId === 'subway' && nearSubwayPanel) {
            beginRouteBoard(nearSubwayPanel);
            return;
        }
        const lootIndex = groundLoot.findIndex(loot => Math.hypot(player.x - loot.x, player.y - loot.y) < 34);
        if (lootIndex >= 0) {
            if (!addSupply(groundLoot[lootIndex].type)) { notify('INVENTORY FULL · 8/8 SUPPLIES', 'warning'); return; }
            const loot = groundLoot.splice(lootIndex, 1)[0]; advanceDailyObjective('loot'); notify(`${ITEM_DEFINITIONS[loot.type].toUpperCase()} FOUND`, 'unlock'); saveData(); updateHUD(); return;
        }
        const forestBreaker = forestBreakers.find(breaker => !breaker.active && Math.hypot(player.x - breaker.x, player.y - breaker.y) < 38);
        if (forestBreaker) { forestBreaker.active = true; forestBreaker.cabin.lit = true; notify('CABIN BREAKER RESTORED · LIGHT IS SAFE', 'unlock'); updateHUD(); checkPhase(); return; }
        if (currentMapId === 'forest' && forestBeaconBattery && !forestBeaconBattery.collected && forestBreakers.every(breaker => breaker.active) && Math.hypot(player.x - forestBeaconBattery.x, player.y - forestBeaconBattery.y) < 38) {
            forestBeaconBattery.collected = true; notify('RANGER BEACON BATTERY RECOVERED', 'unlock'); updateHUD(); checkPhase(); return;
        }
        if (currentMapId === 'forest' && forestWatchtower && forestBeaconBattery?.collected && activeGens >= totalGens && !forestBeaconActive && Math.hypot(player.x - forestWatchtower.x, player.y - forestWatchtower.y) < 46) {
            forestBeaconActive = true; notify('RANGER BEACON ONLINE · NOAH IS EXPOSED', 'unlock'); beginFinalChase(); return;
        }
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
            const crimsonGeneratorsReady = activeGens >= totalGens;
            if (nearRhysKey && rhysChestKey && !rhysChestKey.collected) {
                if (!crimsonGeneratorsReady) { showMsg('RESTORE ALL GENERATORS FIRST', 950); return; }
                rhysChestKey.collected = true; notify('CHEST KEY FOUND', 'unlock'); updateHUD(); return;
            }
            if (nearRhysChest && rhysChest && rhysChestKey?.collected && !rhysChest.opened) {
                if (!crimsonGeneratorsReady) { showMsg('RESTORE ALL GENERATORS FIRST', 950); return; }
                rhysChest.opened = true; rhysSeal.accessible = true; notify('CRIMSON CHEST OPENED', 'unlock'); updateHUD(); return;
            }
            if (nearRhysSeal && rhysSeal?.accessible && !rhysSeal.collected) {
                if (!crimsonGeneratorsReady) { showMsg('RESTORE ALL GENERATORS FIRST', 950); return; }
                rhysSeal.collected = true; rhysSealCollected = true; notify('CRIMSON SEAL RECOVERED', 'unlock'); updateHUD(); return;
            }
            if (nearRhysTrap && rhysSealCollected) {
                if (!crimsonGeneratorsReady) { showMsg('RESTORE ALL GENERATORS FIRST', 950); return; }
                rhysTrapArmed = true; notify('CONTAINMENT TRAP ARMED · LURE RHYS INSIDE', 'warning'); updateHUD(); return;
            }
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
        launchCurrentGeneratorTask();
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
                if (repairAssist > 0) nextZoneWidth = Math.min(Math.PI * 0.78, nextZoneWidth * 1.7);
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
    if (state === 7 && k === ' ' && scDelay <= 0) {
        if (tuneNeedle >= tuneZoneStart && tuneNeedle <= tuneZoneEnd) {
            tuneHits++; tuneMisses = 0; playSound('success');
            if (tuneHits >= tuneRequired) finishGeneratorInteraction();
            else { const width = tuneZoneEnd - tuneZoneStart; tuneZoneStart = .12 + Math.random() * (.76 - width); tuneZoneEnd = tuneZoneStart + width; tuneNeedle = 0; }
        } else {
            tuneMisses++;
            if (tuneMisses >= 3) failGeneratorTask('FREQUENCY TUNE');
            else { tuneNeedle = 0; scDelay = 24; playSound('fail'); notify(`FREQUENCY MISS ${tuneMisses}/3`, 'warning'); }
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
    if (state === 11 || state === 18 || state === 20) {
        if (k === 'arrowleft') k = 'a';
        if (k === 'arrowright') k = 'd';
        if (k === 'arrowup') k = 'w';
        if (k === 'arrowdown') k = 's';
    }
    if(k==='v') amineFocus=false;
    if (k in keys) {
        keys[k] = false;
    }
    if (k === 'b') player.breathing = false;
});

function handleCanvasPress(clientX, clientY) {
    const rect=canvas.getBoundingClientRect(), x=(clientX-rect.left)*canvas.width/rect.width, y=(clientY-rect.top)*canvas.height/rect.height;
    if (state === 16) { updateLucasFragmentPointer(clientX, clientY, true); return; }
    if (state === 20) { clickCalebBoss(clientX, clientY); return; }
    if (state === 14) {
        if (x < 132 && y > canvas.height - 92) { exitSubwayControlPuzzle(); return; }
        clickSubwayControlSwitch(x, y); return;
    }
    if (state === 13 && routeBoard) {
        const layout = getRouteBoardLayout();
        const col = Math.floor((x - layout.left) / (layout.tileSize + layout.gap)), row = Math.floor((y - layout.top) / (layout.tileSize + layout.gap));
        if (col >= 0 && col < routeBoard.size && row >= 0 && row < routeBoard.size) {
            const localX = x - layout.left - col * (layout.tileSize + layout.gap), localY = y - layout.top - row * (layout.tileSize + layout.gap);
            if (localX <= layout.tileSize && localY <= layout.tileSize) rotateRouteBoardTile(row * routeBoard.size + col);
        }
        return;
    }
    if(state===9){if(rapidTarget&&Math.hypot(x-rapidTarget.x,y-rapidTarget.y)<=rapidTarget.r){rapidHits++;playSound('tick');if(rapidHits>=rapidRequired)finishGeneratorInteraction();else spawnRapidTarget();}return;}
    if(state===10&&simonPhase==='input'){const size=100,gap=14,left=canvas.width/2-size-gap/2,top=canvas.height/2-size-gap/2;const boxes=[[left,top],[left+size+gap,top],[left,top+size+gap],[left+size+gap,top+size+gap]];const choice=boxes.findIndex(([bx,by])=>x>=bx&&x<=bx+size&&y>=by&&y<=by+size);if(choice<0)return;simonFlashChoice=choice;simonFlashTimer=14;if(choice!==simonSequence[simonInput]){failGeneratorTask('COLOR MEMORY');return;}simonInput++;playSound('tick');if(simonInput>=simonRound){if(simonRound>=simonSequence.length)finishGeneratorInteraction();else{simonRound++;simonInput=0;simonShowIndex=0;simonTimer=38;simonPhase='show';}}return;}
    if (state === 11 && amineRoad) { fireAmineRoadWeapon(x); }
}
canvas.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') return;
    handleCanvasPress(event.clientX, event.clientY);
});
canvas.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || state !== 16) return;
    updateLucasFragmentPointer(event.clientX, event.clientY, true);
});
canvas.addEventListener('pointerup', event => {
    if (event.pointerType !== 'touch') releaseLucasFragmentPointer();
});
canvas.addEventListener('pointercancel', event => {
    if (event.pointerType !== 'touch') releaseLucasFragmentPointer();
});
canvas.addEventListener('touchstart', event => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    event.preventDefault();
    handleCanvasPress(touch.clientX, touch.clientY);
}, { passive:false });
canvas.addEventListener('touchmove', event => {
    if (state !== 16) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    event.preventDefault();
    updateLucasFragmentPointer(touch.clientX, touch.clientY, true);
}, { passive:false });
canvas.addEventListener('touchend', event => {
    if (state === 16) { event.preventDefault(); releaseLucasFragmentPointer(); }
}, { passive:false });
canvas.addEventListener('touchcancel', event => {
    if (state === 16) { event.preventDefault(); releaseLucasFragmentPointer(); }
}, { passive:false });

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
    // Add deliberate loops between nearby wings. The main tree still leaves a
    // few short dead ends, but important rooms gain alternate routes.
    for (let i = 0; i < 7; i++) {
        for (let attempt = 0; attempt < 24; attempt++) {
            const a = rooms[Math.floor(Math.random() * rooms.length)], b = rooms[Math.floor(Math.random() * rooms.length)];
            const distance = Math.abs(a.c - b.c) + Math.abs(a.r - b.r);
            if (a !== b && distance >= 12 && distance < 48) { connectHotelRooms(a, b); break; }
        }
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
    rhysRoute = ['search','break','chest'][Math.floor(Math.random() * 3)];
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
    for (let i = 0; i < 3; i++) {
        const maxStart = rhysRoute === 'break' ? 6 : nodes.length - 2;
        const a = nodes[Math.floor(Math.random() * maxStart)], b = nodes[Math.min(nodes.length - 1, nodes.indexOf(a) + 2)];
        if (a && b) carveBoilerCorridor(a, b);
    }
    rebuildFloors();
    const intake = rooms[0], vault = rooms.find(room => room.type === 'vault'), trapRoom = rooms.find(room => room.type === 'trap');
    rhysSeal = { x: vault.x, y: vault.y, collected:false, accessible: rhysRoute !== 'break' };
    rhysChest = rhysRoute === 'chest' ? { x: vault.x, y: vault.y, opened:false } : null;
    const keyRoom = rooms.find(room => room.type === 'security') || intake;
    rhysChestKey = rhysRoute === 'chest' ? { x:keyRoom.x, y:keyRoom.y, collected:false } : null;
    if (rhysRoute === 'break') {
        const left = vault.c - Math.floor(vault.width / 2), right = vault.c + Math.floor(vault.width / 2);
        const top = vault.r - Math.floor(vault.height / 2), bottom = vault.r + Math.floor(vault.height / 2);
        const cells = [];
        for (let c = left; c <= right; c++) { cells.push({ c, r:top }, { c, r:bottom }); }
        for (let r = top + 1; r < bottom; r++) { cells.push({ c:left, r }, { c:right, r }); }
        rhysBreakWall = { c:left, r:vault.r, x:left * TS + TS / 2, y:vault.y, cells, broken:false, r:18, baitX:(left - 2) * TS + TS / 2, baitY:vault.y };
    } else rhysBreakWall = null;
    rhysTrap = trapRoom ? { x:trapRoom.x, y:trapRoom.y, room:trapRoom } : null;
    [rhysSeal, rhysChest, rhysChestKey, rhysBreakWall, rhysTrap].filter(Boolean).forEach(object => reserveObjectTile(Math.floor(object.x / TS), Math.floor(object.y / TS), 1));
    if (intake) hidingSpots.push({ x:intake.x, y:intake.y, occupied:false });
}

function generateForest() {
    map = Array.from({length: ROWS}, (_, row) => Array.from({length: COLS}, (_, col) => row === 0 || col === 0 || row === ROWS - 1 || col === COLS - 1 ? 1 : 0));
    rooms = []; hidingSpots = []; coolingValves = []; fuses = []; employees = []; reservedObjectTiles = new Set(); forestCabins = []; forestBreakers = []; forestTrees = [];
    const used = [];
    for (let index = 0; index < 8; index++) {
        let c = 8, r = 8, tries = 0;
        do { c = 8 + Math.floor(Math.random() * (COLS - 16)); r = 8 + Math.floor(Math.random() * (ROWS - 16)); tries++; } while (tries < 80 && used.some(other => Math.hypot(other.c - c, other.r - r) < 16));
        used.push({ c, r });
        const lit = index < 3, breaker = !lit && forestBreakers.length < 2;
        const cabin = { type: lit ? 'safe' : 'cabin', c, r, width:7, height:5, x:c * TS + TS / 2, y:r * TS + TS / 2, lit, breaker };
        const left = c - 3, right = c + 3, top = r - 2, bottom = r + 2, doorC = c;
        for (let rr = top; rr <= bottom; rr++) for (let cc = left; cc <= right; cc++) {
            if (rr === top || rr === bottom || cc === left || cc === right) map[rr][cc] = 1;
        }
        map[bottom][doorC] = 0;
        rooms.push(cabin); forestCabins.push(cabin); reserveObjectTile(c, r, 2);
        if (breaker) forestBreakers.push({ x:cabin.x, y:cabin.y, active:false, cabin });
    }
    for (let index = 0; index < 190; index++) {
        const c = 2 + Math.floor(Math.random() * (COLS - 4)), r = 2 + Math.floor(Math.random() * (ROWS - 4));
        if (!used.some(cabin => Math.abs(cabin.c - c) < 5 && Math.abs(cabin.r - r) < 5) && !forestCabins.some(cabin => cabin.c === c && cabin.r + 2 === r)) { map[r][c] = 1; forestTrees.push({ x:c * TS + TS / 2, y:r * TS + TS / 2, radius:16 + Math.floor(Math.random() * 8) }); }
    }
    rebuildFloors();
}

function generateLucasArea() {
    map = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
    rooms = []; hidingSpots = []; coolingValves = []; fuses = []; employees = [];
    reservedObjectTiles = new Set(); hotelDoorTiles = [];
    lucasFragments = []; lucasLevers = []; lucasAltar = null; lucasGate = null; lucasShadow = null; lucasArrows = [];
    lucasShadowPools = []; lucasRouteLocks = []; lucasLockSpots = []; lucasHazards = []; lucasObjectiveStage = 'fragment1'; lucasCarryFragment = null;
    const nodes = [
        { type:'entry', c:10, r:39, width:11, height:9 },
        { type:'archive', c:27, r:15, width:15, height:11 },
        { type:'service', c:48, r:62, width:15, height:11 },
        { type:'underpass', c:67, r:17, width:15, height:11 },
        { type:'yard', c:85, r:49, width:17, height:13 },
        { type:'vessel', c:101, r:35, width:13, height:9 },
        { type:'gate', c:116, r:37, width:11, height:17 }
    ];
    for (const node of nodes) {
        carveBoilerRect(node.c, node.r, node.width, node.height);
        node.x = node.c * TS + TS / 2;
        node.y = node.r * TS + TS / 2;
        rooms.push(node);
    }
    for (let index = 1; index < nodes.length; index++) carveBoilerCorridor(nodes[index - 1], nodes[index]);
    carveBoilerCorridor(nodes[0], nodes[2]);
    carveBoilerCorridor(nodes[1], nodes[3]);
    carveBoilerCorridor(nodes[2], nodes[4]);
    carveBoilerCorridor(nodes[3], nodes[5]);
    carveBoilerCorridor(nodes[4], nodes[6]);
    const gateRoom = nodes[6], gateCell = gateRoom.c + Math.floor(gateRoom.width / 2) + 1;
    map[gateRoom.r][gateCell] = 0;
    map[gateRoom.r - 1][gateCell] = 0;
    map[gateRoom.r + 1][gateCell] = 0;
    rebuildFloors();

    const fragmentRooms = [nodes[1], nodes[2], nodes[4]];
    lucasFragments = fragmentRooms.map((room, index) => {
        const offsetX = index === 1 ? -TS * 2 : index === 2 ? TS * 2 : 0;
        const offsetY = index === 0 ? TS * 2 : index === 1 ? -TS * 2 : 0;
        const fragment = { id:index + 1, x:room.x + offsetX, y:room.y + offsetY, homeX:room.x + offsetX, homeY:room.y + offsetY, collected:false, available:index === 0, carried:false };
        reserveObjectTile(Math.floor(fragment.x / TS), Math.floor(fragment.y / TS), 1);
        return fragment;
    });
    lucasLevers = [
        { id:1, x:(nodes[2].c - 4) * TS + TS / 2, y:(nodes[2].r - 3) * TS + TS / 2, active:false },
        { id:2, x:(nodes[2].c + 4) * TS + TS / 2, y:(nodes[2].r + 3) * TS + TS / 2, active:false },
        { id:3, x:nodes[2].x, y:(nodes[2].r - 4) * TS + TS / 2, active:false }
    ];
    for (const lever of lucasLevers) reserveObjectTile(Math.floor(lever.x / TS), Math.floor(lever.y / TS), 1);
    lucasAltar = { x:nodes[5].x, y:nodes[5].y, placed:false };
    lucasGate = { x:gateCell * TS + TS / 2, y:gateRoom.y, blockX:(gateCell - 2) * TS + TS / 2, blockY:gateRoom.y, open:false };
    lucasShadow = { x:lucasGate.x + TS * .65, y:lucasGate.y, radius:48 };
    lucasMonsterStart = { x:nodes[3].x, y:nodes[3].y };
    reserveObjectTile(Math.floor(lucasAltar.x / TS), Math.floor(lucasAltar.y / TS), 2);
    reserveObjectTile(Math.floor(lucasGate.x / TS), Math.floor(lucasGate.y / TS), 2);

    lucasShadowPools = [
        { x:nodes[0].x, y:nodes[0].y, radius:34 },
        { x:nodes[1].x - TS * 3, y:nodes[1].y + TS * 2, radius:30 },
        { x:nodes[2].x + TS * 3, y:nodes[2].y - TS * 2, radius:34 },
        { x:nodes[3].x - TS * 3, y:nodes[3].y, radius:32 },
        { x:nodes[4].x + TS * 3, y:nodes[4].y - TS * 2, radius:36 },
        { x:nodes[5].x - TS * 3, y:nodes[5].y, radius:30 }
    ];
    const candidateLockSpots = [
        { c:18, r:39 }, { c:37, r:38 }, { c:57, r:39 }, { c:76, r:34 },
        { c:93, r:42 }, { c:110, r:35 }, { c:60, r:17 }
    ];
    lucasLockSpots = candidateLockSpots.filter(spot => map[spot.r]?.[spot.c] === 0);

    const arrowPoints = [
        { x:17 * TS + TS / 2, y:29 * TS + TS / 2, angle:-.8 },
        { x:20 * TS + TS / 2, y:43 * TS + TS / 2, angle:.8 },
        { x:37 * TS + TS / 2, y:29 * TS + TS / 2, angle:.2 },
        { x:55 * TS + TS / 2, y:36 * TS + TS / 2, angle:-.55 },
        { x:74 * TS + TS / 2, y:29 * TS + TS / 2, angle:.6 },
        { x:94 * TS + TS / 2, y:36 * TS + TS / 2, angle:-.35 },
        { x:108 * TS + TS / 2, y:47 * TS + TS / 2, angle:.45 }
    ];
    lucasArrows = arrowPoints
        .filter(point => map[Math.floor(point.y / TS)]?.[Math.floor(point.x / TS)] === 0)
        .map((point, index) => ({ ...point, misleading:index % 2 === 1 }));
}

// This is the normalized walkable shape from the user's PillarRoom editor
// export. The JSON is treated as level data; its text fields are never
// executed. Repeating this footprint creates a readable authored structure
// while the Parted Grid still gets a different hazard/objective roll each run.
const PARTED_GRID_ROOM_TEMPLATE = {
    width: 7,
    height: 7,
    floors: [[0,2],[0,3],[0,4],[1,1],[1,2],[1,3],[1,4],[1,5],[2,0],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6],[3,0],[3,1],[3,2],[3,3],[3,4],[3,5],[3,6],[4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6],[5,1],[5,2],[5,3],[5,4],[5,5],[6,2],[6,3],[6,4]],
    walls: [[0,0],[0,1],[0,5],[0,6],[1,0],[1,6],[5,0],[5,6],[6,0],[6,1],[6,5],[6,6]],
    connections: { north:[4,0], east:[7,3], south:[4,7], west:[0,3] }
};

function generateAmineGrid() {
    map = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
    rooms = []; hidingSpots = []; coolingValves = []; fuses = []; employees = []; reservedObjectTiles = new Set(); amineHoles = []; amineFireZones = [];
    const originColumns = [3, 12, 21, 30, 39, 48];
    const originRows = [3, 12, 21, 30];
    const carveTemplateCell = (originC, originR, localC, localR) => {
        const c = originC + localC, r = originR + localR;
        if (map[r]?.[c] !== undefined) map[r][c] = 0;
    };
    const carveThreeWayEntrance = (c, r, horizontal) => {
        if (horizontal) {
            for (const offset of [-1, 0, 1]) if (map[r + offset]?.[c] !== undefined) map[r + offset][c] = 0;
        } else {
            for (const offset of [-1, 0, 1]) if (map[r]?.[c + offset] !== undefined) map[r][c + offset] = 0;
        }
    };
    const stampRoom = (originC, originR) => {
        for (const [c, r] of PARTED_GRID_ROOM_TEMPLATE.floors) carveTemplateCell(originC, originR, c, r);
        // Walls remain solid in the base map, but keeping them explicit here
        // makes the template easy to expand if the room gains special props.
        for (const [c, r] of PARTED_GRID_ROOM_TEMPLATE.walls) {
            const worldC = originC + c, worldR = originR + r;
            if (map[worldR]?.[worldC] !== undefined && map[worldR][worldC] !== 0) map[worldR][worldC] = 1;
        }
    };
    for (const r of originRows) for (const c of originColumns) stampRoom(c, r);
    // Join the authored rooms through their exported cardinal connection
    // points. These corridors are the only extra walkable cells, so every
    // generated room remains reachable without returning to an open field.
    for (let row = 0; row < originRows.length; row++) {
        for (let column = 0; column < originColumns.length; column++) {
            const originC = originColumns[column], originR = originRows[row];
            if (column < originColumns.length - 1) {
                const y = originR + PARTED_GRID_ROOM_TEMPLATE.connections.east[1];
                for (let c = originC + 7; c <= originColumns[column + 1]; c++) if (map[y]?.[c] !== undefined) map[y][c] = 0;
                carveThreeWayEntrance(originC + 7, y, true);
                carveThreeWayEntrance(originColumns[column + 1] - 1, y, true);
            }
            if (row < originRows.length - 1) {
                const x = originC + PARTED_GRID_ROOM_TEMPLATE.connections.south[0];
                for (let r = originR + 7; r <= originRows[row + 1]; r++) if (map[r]?.[x] !== undefined) map[r][x] = 0;
                carveThreeWayEntrance(x, originR + 7, false);
                carveThreeWayEntrance(x, originRows[row + 1] - 1, false);
            }
        }
    }
    rebuildFloors();
    // Preserve the old random Parted Grid hazards, but only place them on the
    // authored floor/corridor cells and keep the opening room safe enough to
    // understand on spawn.
    for (let i = 0; i < 16; i++) {
        const candidates = floors.filter(tile => tile.c > 8 && tile.r > 2 && !amineFireZones.some(zone => Math.hypot(zone.x - (tile.c * TS + TS / 2), zone.y - (tile.r * TS + TS / 2)) < zone.radius + 20));
        const tile = candidates[Math.floor(Math.random() * Math.max(1, candidates.length))];
        if (tile) amineFireZones.push({ x:tile.c * TS + TS / 2, y:tile.r * TS + TS / 2, radius:52 + Math.floor(Math.random() * 32) });
    }
    for (let i = 0; i < 50; i++) {
        const candidates = floors.filter(tile => tile.c > 8 && tile.r > 2 && !amineHoles.some(hole => Math.hypot(hole.c - tile.c, hole.r - tile.r) < 2) && !amineFireZones.some(zone => Math.hypot(zone.x - (tile.c * TS + TS / 2), zone.y - (tile.r * TS + TS / 2)) < 20));
        const tile = candidates[Math.floor(Math.random() * Math.max(1, candidates.length))];
        if (tile) amineHoles.push({ c:tile.c, r:tile.r, x:tile.c * TS + TS / 2, y:tile.r * TS + TS / 2, radius:9 });
    }
    const exitCandidates = floors.filter(tile => tile.c > COLS - 12 && !amineHoles.some(hole => Math.hypot(hole.c - tile.c, hole.r - tile.r) < 3));
    const exitTile = exitCandidates.sort((a, b) => b.r - a.r)[Math.floor(exitCandidates.length * .55)] || exitCandidates.at(-1) || floors.at(-1);
    amineExitGate = exitTile ? { x:exitTile.c * TS + TS / 2, y:exitTile.r * TS + TS / 2 } : null;
    if (amineExitGate) reserveObjectTile(Math.floor(amineExitGate.x / TS), Math.floor(amineExitGate.y / TS), 2);
}

function generateSubway() {
    map = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
    rooms = []; hidingSpots = []; coolingValves = []; fuses = []; employees = []; reservedObjectTiles = new Set();
    subwayPanels = []; subwayTrains = []; subwayTrackRows = []; subwayTrackSegments = []; subwayDecor = []; subwaySigns = []; subwayTrainPaths = []; routeBoard = null; subwayControlPuzzle = null;
    subwayTornTicket = null; subwayGoldSphere = null; subwayBronzeEligible = true; subwayFareCutscene = null; subwayGoldPressure = null;
    subwayTrap = null; subwayControl = null; subwayRouteReady = false; subwayTrapArmed = false; subwayTrainWarning = 0; subwayTrainTriggered = false; subwayCommitTimer = 0; subwayCommitTarget = null;
    const stations = [];
    const decorFootprints = [];
    const decorSizes = { bench:[68,30], poster:[40,54], machine:[32,54], column:[32,58], booth:[68,58], crate:[30,26], turnstile:[32,32], luggage:[30,24], control:[60,54] };
    const addDecor = (kind, x, y, extra = {}) => {
        const [width, height] = decorSizes[kind] || [30,30];
        const footprint = { left:x-width/2, right:x+width/2, top:y-height/2, bottom:y+height/2 };
        // Decorations are cosmetic; skip one rather than ever stacking it over a
        // booth, another prop, panel, or control room interaction.
        if (decorFootprints.some(other => footprint.left < other.right + 6 && footprint.right > other.left - 6 && footprint.top < other.bottom + 6 && footprint.bottom > other.top - 6)) return false;
        decorFootprints.push(footprint); subwayDecor.push({ kind, x, y, ...extra }); return true;
    };
    const carveRoom = (type, c, r, width, height) => {
        const room = { type, c, r, width, height, x: c * TS + TS / 2, y: r * TS + TS / 2 };
        carveBoilerRect(c, r, width, height); rooms.push(room); return room;
    };
    const addTrack = (x1, y1, x2, y2, active = true) => {
        subwayTrackSegments.push({ x1, y1, x2, y2, active });
        const dx = Math.sign(x2 - x1), dy = Math.sign(y2 - y1), steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
        for (let step = 0; step <= steps; step++) for (const side of [-1, 0, 1]) {
            const c = x1 + dx * step + (dy ? side : 0), r = y1 + dy * step + (dx ? side : 0);
            if (map[r]?.[c] !== undefined) map[r][c] = 0;
        }
    };
    // Four stations create a readable journey with alternating platform levels,
    // a real transfer bend, and enough breathing room for side rooms and panels.
    // A smaller three-station seed still exists for variety, but it uses the same
    // left-to-right spine instead of creating an isolated diagonal shortcut.
    const stationCount = Math.random() < .28 ? 3 : 4;
    const stationColumns = stationCount === 4
        ? [16 + Math.floor(Math.random() * 4), 40 + Math.floor(Math.random() * 5), 67 + Math.floor(Math.random() * 5), 96 + Math.floor(Math.random() * 5)]
        : [16 + Math.floor(Math.random() * 4), 55 + Math.floor(Math.random() * 6), 96 + Math.floor(Math.random() * 5)];
    const upperR = 18 + Math.floor(Math.random() * 7), lowerR = 45 + Math.floor(Math.random() * 7);
    const routePattern = Math.random() < .5
        ? [upperR, lowerR, upperR, lowerR]
        : [lowerR, upperR, lowerR, upperR];
    const stationPoints = stationColumns.map((c, index) => ({ c, r:routePattern[index] }));
    stationPoints.forEach((point, index) => {
        const station = carveRoom(`platform_${index + 1}`, point.c, point.r, 19, 17);
        station.index = index + 1; stations.push(station);
        // One platform, one usable rail.  It always feeds into the next tunnel;
        // there are no cosmetic sidings that look playable but lead nowhere.
        addTrack(point.c - 9, point.r - 5, point.c + 9, point.r - 5, true);
        subwaySigns.push({ x:station.x, y:station.y - 150, text:`PLATFORM ${index + 1} · ${index === stationCount - 1 ? 'LAST LINE' : 'TRANSFER'}` });
        addDecor('bench', station.x - 190, station.y); addDecor('bench', station.x + 190, station.y + 105);
        addDecor('poster', station.x + 60, station.y + 105); addDecor('machine', station.x + 250, station.y + 85);
        const direction = index % 2 ? -1 : 1;
        const booth = carveRoom('ticket_booth', point.c + direction * 13, point.r - 12, 6, 5);
        booth.station = station; carveBoilerCorridor(booth, station); addDecor('booth', booth.x, booth.y);
        if (Math.random() < .8) {
            const service = carveRoom('service_room', point.c - direction * 14, point.r + 12, 7, 5);
            service.station = station; carveBoilerCorridor(service, station); addDecor('crate', service.x + 42, service.y + 18); hidingSpots.push({ x:service.x - 42, y:service.y, occupied:false });
        }
    });
    // The single rail follows every station and turn. Two train instances travel
    // it in opposite directions, rather than using dead-end platform sidings.
    const routeA = [];
    for (let index = 0; index < stations.length - 1; index++) {
        const from = stations[index], to = stations[index + 1];
        const fromY = from.r - 5, toY = to.r - 5;
        const exitX = from.c + 9, entryX = to.c - 9;
        // Keep the second bend clear of the transfer station's booth instead of
        // sending the rail straight through a room decoration.
        const turnX = Math.round((from.c + to.c) / 2);
        const a = [{x:exitX,y:fromY},{x:turnX,y:fromY},{x:turnX,y:toY},{x:entryX,y:toY}];
        for (let point = 0; point < a.length - 1; point++) addTrack(a[point].x, a[point].y, a[point + 1].x, a[point + 1].y, true);
        if (!routeA.length) routeA.push(...a); else routeA.push(...a.slice(1));
        rooms.push({ type:'two_track_tunnel', c:turnX, r:Math.round((fromY + toY) / 2), width:Math.max(5, Math.abs(exitX-entryX)), height:Math.max(5, Math.abs(fromY-toY)), x:turnX*TS+TS/2, y:Math.round((fromY+toY)/2)*TS+TS/2, subwayTunnel:true });
    }
    subwayTrainPaths = [routeA];
    const entryHall = carveRoom('ticket_hall', stations[0].c - 13, stations[0].r, 7, 8);
    carveBoilerCorridor(entryHall, stations[0]);
    const finalStation = stations.at(-1);
    subwayRouteMinX = Math.min(...routeA.map(point => point.x)) * TS; subwayRouteMaxX = Math.max(...routeA.map(point => point.x)) * TS;
    const control = carveRoom('control_room', finalStation.c + 14, finalStation.r + 13, 7, 6);
    carveBoilerCorridor(control, finalStation);
    rebuildFloors();

    subwayControl = { x: control.x, y: control.y };
    const trapRow = finalStation.r - 5;
    subwayTrap = { x: finalStation.x, y: trapRow * TS + TS / 2, row:trapRow, escapeTop:{x:finalStation.x + 110,y:(trapRow - 3)*TS + TS/2}, escapeBottom:{x:finalStation.x + 110,y:(trapRow + 3)*TS + TS/2} };
    const panelSlots = [...rooms.filter(room => ['ticket_booth','service_room'].includes(room.type)), ...stations, entryHall].sort(() => Math.random() - .5);
    const panelCount = Math.min(panelSlots.length, 2 + currentDiff + (Math.random() < .5 ? 1 : 0));
    const panelNames = ['RESTORE PLATFORM SIGNS','ALIGN THE TRACK SWITCH','CLEAR THE SIGNAL RELAY','VERIFY DEPARTURE BOARD','RESET TUNNEL CIRCUIT'];
    subwayPanels = panelSlots.slice(0, panelCount).map((room, index) => ({ x:room.x, y:room.y, room, label:panelNames[index], active:false, r:15, isSubway:true, type:'subway', stage:0, requiredStages:1 }));
    addDecor('turnstile', entryHall.x + 38, entryHall.y - 55); addDecor('turnstile', entryHall.x + 82, entryHall.y - 55);
    addDecor('luggage', entryHall.x - 46, entryHall.y + 60); addDecor('control', control.x, control.y);
    const firstRailPoint = routeA[0], lastRailPoint = routeA.at(-1);
    subwayTrains.push(
        { path:routeA, point:0, direction:1, x:firstRailPoint.x*TS+TS/2, y:firstRailPoint.y*TS+TS/2, speed:2.7+Math.random()*.5, length:TS*4.3, active:true, cooldown:0, trapTrain:false, axis:'x' },
        { path:routeA, point:routeA.length-1, direction:-1, x:lastRailPoint.x*TS+TS/2, y:lastRailPoint.y*TS+TS/2, speed:2.7+Math.random()*.5, length:TS*4.3, active:true, cooldown:0, trapTrain:false, axis:'x' }
    );
    reserveObjectTile(Math.floor(subwayControl.x / TS), Math.floor(subwayControl.y / TS), 1);
    subwayPanels.forEach(panel => reserveObjectTile(Math.floor(panel.x / TS), Math.floor(panel.y / TS), 1));
}

function subwayObjectiveComplete() { return currentMapId === 'subway' && subwayPanels.length > 0 && subwayPanels.every(panel => panel.active); }

function pickSubwaySecretTile(excluded = []) {
    if (currentMapId !== 'subway') return null;
    const candidates = floors.filter(tile => {
        const x = tile.c * TS + TS / 2, y = tile.r * TS + TS / 2;
        return !getRoomAt(x, y)
            && !isReservedObjectSpot(x, y, TS * 2)
            && isOpenObjectSpot(x, y, TS * 1.5)
            && Math.hypot(player.x - x, player.y - y) > TS * 5
            && !excluded.some(point => point && Math.hypot(point.x - x, point.y - y) < TS * 2);
    });
    const fallback = floors.filter(tile => {
        const x = tile.c * TS + TS / 2, y = tile.r * TS + TS / 2;
        return !getRoomAt(x, y) && !isReservedObjectSpot(x, y, TS)
            && !generators.some(generator => Math.hypot(generator.x - x, generator.y - y) < TS)
            && !fuses.some(fuse => Math.hypot(fuse.x - x, fuse.y - y) < TS)
            && Math.hypot(player.x - x, player.y - y) > TS * 3
            && !excluded.some(point => point && Math.hypot(point.x - x, point.y - y) < TS * 2);
    });
    const pool = candidates.length ? candidates : fallback;
    return pool[Math.floor(Math.random() * Math.max(1, pool.length))] || null;
}

function spawnSubwaySecrets(hasNizar) {
    subwayTornTicket = null;
    subwayGoldSphere = null;
    subwayBronzeEligible = true;
    if (currentMapId !== 'subway') return;
    const hasStopSignMask = cosmetics.unlocked.includes('stopSignMask');
    const hasHeadlightHat = cosmetics.unlocked.includes('headlightHat');
    if (!hasStopSignMask) {
        const ticketTile = pickSubwaySecretTile();
        if (ticketTile) subwayTornTicket = { x:ticketTile.c * TS + TS / 2, y:ticketTile.r * TS + TS / 2, collected:false, delivered:false };
    }
    // The Gold Fare route stays available after Train Skin is earned, but only
    // after the two earlier Subway rewards have been completed.
    if (hasNizar && hasStopSignMask && hasHeadlightHat) {
        const sphereTile = pickSubwaySecretTile(subwayTornTicket ? [subwayTornTicket] : []);
        if (sphereTile) subwayGoldSphere = { x:sphereTile.c * TS + TS / 2, y:sphereTile.r * TS + TS / 2, collected:false, eligible:false };
    }
}

function isSubwayGoldLitArea(x, y) {
    if (currentMapId !== 'subway') return false;
    const room = getRoomAt(x, y);
    return Boolean(room && (room.type.startsWith('platform_') || ['ticket_hall', 'control_room'].includes(room.type)));
}

function subwayGoldPathStillOpen(cells) {
    if (!subwayGoldPressure) return true;
    const previous = subwayGoldPressure.lockedDoorCells;
    subwayGoldPressure.lockedDoorCells = cells;
    const fromC = Math.floor(player.x / TS), fromR = Math.floor(player.y / TS);
    const targets = [...subwayPanels.filter(panel => !panel.active), subwayControl].filter(Boolean);
    const open = targets.every(target => {
        const targetC = Math.floor(target.x / TS), targetR = Math.floor(target.y / TS);
        return (fromC === targetC && fromR === targetR) || findPath(fromC, fromR, targetC, targetR).length > 0;
    });
    subwayGoldPressure.lockedDoorCells = previous;
    return open;
}

function chooseSubwayGoldDoors() {
    if (!subwayGoldPressure) return [];
    const candidates = floors.filter(tile => {
        const x = tile.c * TS + TS / 2, y = tile.r * TS + TS / 2;
        const neighbors = [[1,0],[-1,0],[0,1],[0,-1]].filter(([dc, dr]) => map[tile.r + dr]?.[tile.c + dc] === 0).length;
        return neighbors === 2
            && !getRoomAt(x, y)
            && !isReservedObjectSpot(x, y, TS)
            && Math.hypot(player.x - x, player.y - y) > TS * 2
            && Math.hypot(subwayControl.x - x, subwayControl.y - y) > TS * 2
            && !subwayPanels.some(panel => Math.hypot(panel.x - x, panel.y - y) < TS * 2);
    }).sort(() => Math.random() - .5);
    const selected = [];
    for (const candidate of candidates) {
        const next = [...selected, { c:candidate.c, r:candidate.r }];
        if (subwayGoldPathStillOpen(next)) selected.push(next.at(-1));
        if (selected.length >= 3) break;
    }
    return selected;
}

function failSubwayGoldRoute(reason) {
    if (!subwayGoldPressure || subwayGoldPressure.failed) return;
    subwayGoldPressure.failed = true;
    subwayGoldPressure.active = false;
    subwayGoldPressure.signalPanel = null;
    subwayGoldPressure.signalPanels = [];
    subwayGoldPressure.signalTimerPaused = false;
    subwayGoldPressure.lockedDoorCells = [];
    if (subwayGoldSphere) subwayGoldSphere.eligible = false;
    subwayTrains.forEach(train => { train.goldPassTimer = 0; });
    notify(`GOLD FARE LOST · ${reason}`, 'danger');
    updateHUD();
}

function activateSubwayGoldPressure() {
    subwayGoldPressure = {
        active:true, failed:false, timeLeft:10800, sphereCharge:100,
        detectableTimer:300, detectableCooldown:1500,
        signalCooldown:2700, signalRollTimer:60, signalPanel:null, signalPanels:[], signalTimer:0, signalTimerPaused:false,
        doorCooldown:300, doorTimer:0, lockedDoorCells:[],
        trainCooldown:420
    };
    subwayTrains.forEach(train => { train.goldPassTimer = 0; });
    notify('GOLD FARE ACCEPTED · THE STATION HAS NOTICED YOU', 'danger');
    updateHUD();
}

function updateSubwayGoldPressure() {
    const pressure = subwayGoldPressure;
    if (!pressure?.active || currentMapId !== 'subway' || ![1, 13].includes(state)) return;
    pressure.timeLeft--;
    if (pressure.timeLeft <= 0) { failSubwayGoldRoute('FARE VALIDATION EXPIRED'); return; }

    if (pressure.detectableTimer > 0) pressure.detectableTimer--;
    else if (pressure.detectableCooldown > 0) pressure.detectableCooldown--;
    else {
        pressure.detectableTimer = 300;
        pressure.detectableCooldown = 1500;
        notify('THE SPHERE IS BROADCASTING YOUR POSITION · 5 SECONDS', 'danger');
        playSound('alarm');
    }

    if (isSubwayGoldLitArea(player.x, player.y)) pressure.sphereCharge = Math.min(100, pressure.sphereCharge + .10);
    else pressure.sphereCharge -= .028;
    if (pressure.sphereCharge <= 0) { failSubwayGoldRoute('THE FARE LIGHT WENT OUT'); return; }

    const flickeringPanels = pressure.signalPanels?.length ? pressure.signalPanels : (pressure.signalPanel ? [pressure.signalPanel] : []);
    if (flickeringPanels.length) {
        const reachedFlickeringPanel = flickeringPanels.some(panel => Math.hypot(player.x - panel.x, player.y - panel.y) < 72);
        if (reachedFlickeringPanel && !pressure.signalTimerPaused) {
            pressure.signalTimerPaused = true;
            notify('SIGNAL AREA REACHED · FLICKER TIMER PAUSED', 'unlock');
        }
        if (!pressure.signalTimerPaused) pressure.signalTimer--;
        if (pressure.signalTimer <= 0) {
            flickeringPanels.forEach(panel => { panel.active = false; });
            activeGens = subwayPanels.filter(panel => panel.active).length;
            pressure.signalPanel = null;
            pressure.signalPanels = [];
            pressure.signalTimer = 0;
            pressure.signalTimerPaused = false;
            notify(`${flickeringPanels.length > 1 ? 'SIGNALS' : 'SIGNAL'} LOST · RETURN TO THE FLICKERING PANEL`, 'danger');
            updateHUD();
        }
    } else if (pressure.signalCooldown > 0) pressure.signalCooldown--;
    else {
        const activePanels = subwayPanels.filter(panel => panel.active);
        if (activePanels.length && pressure.signalRollTimer > 0) pressure.signalRollTimer--;
        if (activePanels.length && pressure.signalRollTimer <= 0) {
            pressure.signalRollTimer = 60;
            if (Math.random() < .2) {
                const first = activePanels[Math.floor(Math.random() * activePanels.length)];
                const selected = [first];
                if (activePanels.length > 1 && Math.random() < .22) {
                    const alternatives = activePanels.filter(panel => panel !== first);
                    selected.push(alternatives[Math.floor(Math.random() * alternatives.length)]);
                }
                pressure.signalPanels = selected;
                pressure.signalPanel = selected[0];
                pressure.signalTimer = 1800;
                pressure.signalTimerPaused = false;
                pressure.signalCooldown = 2700 + Math.floor(Math.random() * 1800);
                notify(`${selected.length > 1 ? 'TWO SIGNALS' : pressure.signalPanel.label} IS FLICKERING · 30 SECONDS`, 'warning');
                playSound('tick');
            }
        } else if (!activePanels.length) {
            pressure.signalCooldown = 120;
            pressure.signalRollTimer = 60;
        }
    }

    if (pressure.doorTimer > 0) {
        pressure.doorTimer--;
        if (pressure.doorTimer <= 0) {
            pressure.lockedDoorCells = [];
            notify('STATION DOORS RELEASED', 'info');
        }
    } else if (pressure.doorCooldown > 0) pressure.doorCooldown--;
    else {
        pressure.lockedDoorCells = chooseSubwayGoldDoors();
        pressure.doorTimer = pressure.lockedDoorCells.length ? 420 : 30;
        pressure.doorCooldown = 900;
        if (pressure.lockedDoorCells.length) { notify(`${pressure.lockedDoorCells.length} STATION DOORS LOCKED · FIND ANOTHER ROUTE`, 'warning'); playSound('alarm'); }
    }

    if (pressure.trainCooldown > 0) pressure.trainCooldown--;
    else {
        const train = subwayTrains[Math.floor(Math.random() * Math.max(1, subwayTrains.length))];
        if (train) { train.goldPassTimer = 240; notify('TRAIN CROSSING · STEP OFF THE RAIL', 'danger'); playSound('alarm'); }
        pressure.trainCooldown = 960;
    }
    subwayTrains.forEach(train => { if (train.goldPassTimer > 0) train.goldPassTimer--; });
    if (ambienceClock % 15 === 0) updateHUD();
}

function subwayGoldStatusText() {
    const pressure = subwayGoldPressure;
    if (!pressure?.active) return '';
    const timer = `${Math.floor(pressure.timeLeft / 3600)}:${String(Math.floor(pressure.timeLeft / 60) % 60).padStart(2, '0')}`;
    const charge = `${Math.ceil(pressure.sphereCharge)}%`;
    if (pressure.signalPanel) return `GOLD FARE ${timer} · SIGNALS ${activeGens}/${totalGens} · SPHERE ${charge} · RE-STABILIZE ${pressure.signalPanels?.length > 1 ? `${pressure.signalPanels.length} SIGNALS` : pressure.signalPanel.label} (${pressure.signalTimerPaused ? 'TIMER PAUSED' : `${Math.ceil(pressure.signalTimer / 60)}s`})`;
    if (pressure.detectableTimer > 0) return `GOLD FARE ${timer} · SIGNALS ${activeGens}/${totalGens} · SPHERE ${charge} · NIZAR HAS YOUR SIGNAL (${Math.ceil(pressure.detectableTimer / 60)}s)`;
    return `GOLD FARE ${timer} · SIGNALS ${activeGens}/${totalGens} · SPHERE ${charge} · STAY IN LIT STATIONS TO RECHARGE`;
}

function completeSubwayPanel(panel) {
    if (!panel) return;
    if (panel.active && subwayGoldPressure?.signalPanels?.includes(panel)) {
        subwayGoldPressure.signalPanels = subwayGoldPressure.signalPanels.filter(entry => entry !== panel);
        subwayGoldPressure.signalPanel = subwayGoldPressure.signalPanels[0] || null;
        subwayGoldPressure.signalTimer = subwayGoldPressure.signalPanel ? 1800 : 0;
        subwayGoldPressure.signalTimerPaused = false;
        playSound('success');
        notify(`${panel.label} RE-STABILIZED`, 'unlock');
        updateHUD();
        return;
    }
    if (panel.active) return;
    if (currentMapId === 'subway' && subwayTornTicket && !subwayTornTicket.delivered) subwayBronzeEligible = false;
    panel.active = true; activeGens = subwayPanels.filter(item => item.active).length;
    currentGen = null; generatorFailureStreak = 0; generatorFailureTarget = null; repairAssist = 0; state = 1;
    playSound('success'); notify(`${panel.label} · ONLINE`, 'unlock');
    if (subwayObjectiveComplete()) notify('ALL SIGNALS ONLINE · FIND RAIL CONTROL', 'unlock');
    updateHUD();
}

function beginRouteBoard(panel) {
    const size = currentDiff === 0 ? 2 : 3;
    const solution = size === 2
        ? [{ kind:'corner', rotation:2 }, { kind:'corner', rotation:1 }, { kind:'corner', rotation:0 }, { kind:'corner', rotation:3 }]
        : [
            { kind:'straight', rotation:0 }, { kind:'straight', rotation:0 }, { kind:'corner', rotation:2 },
            { kind:'corner', rotation:1 }, { kind:'straight', rotation:0 }, { kind:'corner', rotation:3 },
            { kind:'corner', rotation:0 }, { kind:'straight', rotation:0 }, { kind:'straight', rotation:0 }
        ];
    const tiles = solution.map((tile, index) => ({ ...tile, current:(tile.rotation + 1 + Math.floor(Math.random() * 3)) % (tile.kind === 'straight' ? 2 : 4), index }));
    // Avoid a board that happens to start solved.
    if (tiles.every((tile, index) => tile.current === solution[index].rotation)) tiles[0].current = (tiles[0].current + 1) % (tiles[0].kind === 'straight' ? 2 : 4);
    routeBoard = { panel, size, solution, tiles };
    state = 13; clearMovementKeys();
}

function rotateRouteBoardTile(index) {
    if (!routeBoard || !routeBoard.tiles[index]) return;
    const tile = routeBoard.tiles[index];
    tile.current = (tile.current + 1) % (tile.kind === 'straight' ? 2 : 4);
    playSound('tick');
    if (routeBoard.tiles.every((entry, tileIndex) => entry.current === routeBoard.solution[tileIndex].rotation)) {
        const panel = routeBoard.panel;
        routeBoard = null;
        completeSubwayPanel(panel);
    }
}

function getRouteBoardLayout() {
    if (!routeBoard) return null;
    const tileSize = routeBoard.size === 2 ? 116 : 86;
    const gap = 10, width = routeBoard.size * tileSize + (routeBoard.size - 1) * gap;
    return { tileSize, gap, left:canvas.width / 2 - width / 2, top:canvas.height / 2 - width / 2 + 18 };
}

function armSubwayTrap() {
    beginSubwayControlPuzzle();
}

function getSubwayControlBoardLayout() {
    if (!subwayControlPuzzle) return null;
    const left = 76, right = canvas.width - 76, top = 154, bottom = canvas.height - 112;
    return {
        left, right, top, bottom,
        colGap: (right - left) / (subwayControlPuzzle.cols - 1),
        laneGap: (bottom - top) / (subwayControlPuzzle.lanes - 1)
    };
}

function beginSubwayControlPuzzle() {
    if (!subwayObjectiveComplete()) { notify('RESTORE ALL SIGNAL PANELS FIRST', 'warning'); return; }
    if (!subwayControl || subwayControlPuzzle) return;
    if (subwayGoldPressure?.signalPanels?.length || subwayGoldPressure?.signalPanel) { notify('THE FLICKERING SIGNAL MUST BE RE-STABILIZED FIRST', 'warning'); return; }
    if (monster.name === 'NIZAR' && subwayGoldSphere?.collected && subwayGoldSphere.eligible) {
        if (!cosmetics.unlocked.includes('stopSignMask')) { notify('THE STOP SIGN MASK MUST COME FIRST', 'warning'); return; }
        if (!cosmetics.unlocked.includes('headlightHat')) { notify('THE HEADLIGHT MUST COME SECOND', 'warning'); return; }
        beginSubwayFareCutscene();
        return;
    }
    clearMovementKeys();
    routeBoard = null;
    const lanes = 6, cols = 12;
    const switches = [];
    for (let col = 1; col < cols - 1; col++) {
        switches.push({ col, lowLane: Math.floor(Math.random() * (lanes - 1)), open: false, pulse: 0 });
    }
    subwayControlPuzzle = {
        lanes, cols, timer: 7200, switches, ended: false,
        silverEligible: monster.name === 'NIZAR' && cosmetics.unlocked.includes('stopSignMask'), missedTrains: 0, passengerPending: false, passengerSeen: false,
        target: { lane: 2 + Math.floor(Math.random() * 2), progress: 5.5, direction: Math.random() < .5 ? -1 : 1, speed: .016, changeTimer: 48, collisionGrace: 180 },
        trains: [
            { lane: 0, progress: -0.2, speed: .021, color: '#f2c14e', usedSwitches: new Set(), passenger:false },
            { lane: 2, progress: -1.25, speed: .024, color: '#7ed6ff', usedSwitches: new Set(), passenger:false },
            { lane: 4, progress: -2.3, speed: .019, color: '#f28a8a', usedSwitches: new Set(), passenger:false },
            { lane: 1, progress: -3.1, speed: .022, color: '#bba2ff', usedSwitches: new Set(), passenger:false },
            { lane: 5, progress: -4.0, speed: .026, color: '#8de0a1', usedSwitches: new Set(), passenger:false }
        ]
    };
    state = 14;
    hud.style.display = 'none';
    document.getElementById('mapTaskHUD').style.display = 'none';
    document.getElementById('hotelTaskHUD').style.display = 'none';
    document.getElementById('mapButton').style.display = 'none';
    document.getElementById('amineRoadControls').style.display = 'none';
    notify('RAIL CONTROL ONLINE · ROUTE A TRAIN INTO THE HUNTER', 'unlock');
}

function exitSubwayControlPuzzle() {
    subwayControlPuzzle = null;
    clearMovementKeys();
    state = 1;
    hud.style.display = 'block';
    document.getElementById('mapTaskHUD').style.display = 'block';
    updateHUD();
}

function finishSubwayControlPuzzle(won) {
    if (!subwayControlPuzzle || subwayControlPuzzle.ended) return;
    const puzzle = subwayControlPuzzle;
    puzzle.ended = true;
    const earnedStopSignMask = won && subwayBronzeEligible && subwayTornTicket?.delivered;
    const earnedHeadlightHat = won && cosmetics.unlocked.includes('stopSignMask') && puzzle.silverEligible && puzzle.passengerSeen;
    subwayControlPuzzle = null;
    state = 8;
    clearMovementKeys();
    if (earnedStopSignMask) unlockCosmetic('stopSignMask');
    if (earnedHeadlightHat) unlockCosmetic('headlightHat');
    const rewardText = [earnedStopSignMask ? 'STOP SIGN MASK UNLOCKED.' : '', earnedHeadlightHat ? 'HEADLIGHT UNLOCKED.' : ''].filter(Boolean).join(' ');
    showStoryLine(`${won ? 'THE SIGNALS TURN AGAINST NIZAR.' : 'THE LAST LINE LEAVES YOU BEHIND.'}${rewardText ? ` ${rewardText}` : ''}`, won ? 2200 : 1100);
    setTimeout(() => { if (state === 8) endGame(won, monster); }, won ? 1500 : 1100);
}

function beginSubwayFareCutscene() {
    clearMovementKeys();
    subwayFareCutscene = { time:0, duration:540, ended:false };
    state = 15;
    hud.style.display = 'none';
    document.getElementById('mapTaskHUD').style.display = 'none';
    document.getElementById('hotelTaskHUD').style.display = 'none';
    document.getElementById('mapButton').style.display = 'none';
    document.getElementById('amineRoadControls').style.display = 'none';
    playSound('unlock');
}

function finishSubwayFareCutscene() {
    if (!subwayFareCutscene || subwayFareCutscene.ended) return;
    subwayFareCutscene.ended = true;
    subwayFareCutscene = null;
    unlockCosmetic('trainSkin');
    state = 8;
    showStoryLine('THANK YOU FOR RIDING THE LAST LINE.', 2200);
    setTimeout(() => { if (state === 8) endGame(true, monster); }, 2200);
}

function updateSubwayFareCutscene() {
    if (!subwayFareCutscene) return;
    subwayFareCutscene.time++;
    if (subwayFareCutscene.time === 108 || subwayFareCutscene.time === 300) playSound('tick');
    if (subwayFareCutscene.time === 390) playSound('success');
    if (subwayFareCutscene.time >= subwayFareCutscene.duration) finishSubwayFareCutscene();
}

function dodgeSubwayHeadlightTrain(puzzle, train) {
    const target = puzzle.target;
    const options = [target.lane - 1, target.lane + 1].filter(lane => lane >= 0 && lane < puzzle.lanes);
    const safeOptions = options.filter(lane => !puzzle.trains.some(other => other !== train && Math.abs(other.progress - target.progress) < .55 && other.lane === lane));
    const nextLane = safeOptions[Math.floor(Math.random() * Math.max(1, safeOptions.length))]
        ?? options[Math.floor(Math.random() * Math.max(1, options.length))];
    if (nextLane !== undefined) target.lane = nextLane;
    target.changeTimer = 58 + Math.floor(Math.random() * 42);
    target.collisionGrace = 90;
    if (train.passenger) {
        puzzle.passengerSeen = true;
        puzzle.passengerPending = false;
        notify('PASSENGER TRAIN PASSED · NIZAR DODGED IT ALIVE', 'unlock');
        return;
    }
    puzzle.missedTrains = Math.min(3, puzzle.missedTrains + 1);
    if (puzzle.missedTrains >= 3) puzzle.passengerPending = true;
    notify(`NIZAR DODGED THE TRAIN · ${puzzle.missedTrains}/3 MISSED`, 'warning');
}

function updateSubwayControlPuzzle() {
    const puzzle = subwayControlPuzzle;
    if (!puzzle || puzzle.ended) return;
    puzzle.timer--;
    if (puzzle.timer <= 0) { finishSubwayControlPuzzle(false); return; }

    const target = puzzle.target;
    target.progress += target.speed * target.direction;
    if (target.progress < .55) { target.progress = .55; target.direction = 1; }
    if (target.progress > puzzle.cols - 1.55) { target.progress = puzzle.cols - 1.55; target.direction = -1; }
    if (target.collisionGrace > 0) target.collisionGrace--;
    target.changeTimer--;
    if (target.changeTimer <= 0) {
        const options = [target.lane - 1, target.lane + 1].filter(lane => lane >= 0 && lane < puzzle.lanes);
        const closeTrainLanes = puzzle.trains
            .filter(train => Math.abs(train.progress - target.progress) < .34)
            .map(train => train.lane);
        const safeOptions = options.filter(lane => !puzzle.trains.some(train => train.lane === lane && train.progress > target.progress - .18 && train.progress < target.progress + 1.15));
        // Nizar reads the rail traffic and usually steps into a clear lane. A
        // close train can still bait a bad dodge occasionally, which is the
        // intended tell for a successful interception.
        if (options.length && closeTrainLanes.length && Math.random() < .16) {
            target.lane = options.find(lane => closeTrainLanes.includes(lane)) ?? options[Math.floor(Math.random() * options.length)];
        } else if (safeOptions.length && Math.random() < .88) {
            target.lane = safeOptions[Math.floor(Math.random() * safeOptions.length)];
        } else if (options.length) {
            target.lane = options[Math.floor(Math.random() * options.length)];
        }
        target.changeTimer = 42 + Math.floor(Math.random() * 58);
    }

    for (const train of puzzle.trains) {
        const previousProgress = train.progress;
        train.progress += train.speed;
        if (train.progress > puzzle.cols + .35) {
            train.progress = -.8 - Math.random() * 1.3;
            train.lane = Math.floor(Math.random() * puzzle.lanes);
            train.usedSwitches.clear();
            if (puzzle.passengerPending) {
                train.passenger = true;
                train.lane = (target.lane + 1) % puzzle.lanes;
                puzzle.passengerPending = false;
            } else train.passenger = false;
        }
        for (let index = 0; index < puzzle.switches.length; index++) {
            const entry = puzzle.switches[index];
            if (!entry.open || train.usedSwitches.has(index)) continue;
            if (train.progress >= entry.col - .02 && train.progress <= entry.col + train.speed * 1.6) {
                if (train.lane === entry.lowLane) train.lane++;
                else if (train.lane === entry.lowLane + 1) train.lane--;
                train.usedSwitches.add(index);
            }
        }
        const crossedTarget = previousProgress < target.progress && train.progress >= target.progress;
        if (crossedTarget && train.lane !== target.lane && puzzle.silverEligible && !puzzle.passengerSeen && !train.passenger) {
            puzzle.missedTrains = Math.min(3, puzzle.missedTrains + 1);
            if (puzzle.missedTrains >= 3) puzzle.passengerPending = true;
        }
        if (crossedTarget && train.passenger && train.lane !== target.lane && puzzle.silverEligible) {
            puzzle.passengerSeen = true;
            puzzle.passengerPending = false;
            notify('PASSENGER TRAIN PASSED · NIZAR IS STILL ALIVE', 'unlock');
        }
        if (target.collisionGrace <= 0 && train.lane === target.lane && Math.abs(train.progress - target.progress) < .20 && puzzle.silverEligible && !puzzle.passengerSeen) {
            // During the Headlight challenge, Nizar dodges any train that
            // reaches his lane. The player still earns a miss, but a random
            // collision cannot end the challenge before the passenger train.
            dodgeSubwayHeadlightTrain(puzzle, train);
            continue;
        }
        if (target.collisionGrace <= 0 && train.lane === target.lane && Math.abs(train.progress - target.progress) < .20) {
            finishSubwayControlPuzzle(true);
            return;
        }
    }
}

function clickSubwayControlSwitch(x, y) {
    const puzzle = subwayControlPuzzle, layout = getSubwayControlBoardLayout();
    if (!puzzle || !layout) return;
    for (const entry of puzzle.switches) {
        const sx = layout.left + entry.col * layout.colGap;
        const sy = layout.top + (entry.lowLane + .5) * layout.laneGap;
        if (Math.hypot(x - sx, y - sy) < 44) {
            entry.open = !entry.open;
            entry.pulse = 18;
            playSound('tick');
            return;
        }
    }
}

function drawSubwayControlPuzzle() {
    const puzzle = subwayControlPuzzle, layout = getSubwayControlBoardLayout();
    if (!puzzle || !layout) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#090d12'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#dceeff'; ctx.font = 'bold 22px Arial'; ctx.textAlign = 'center';
    ctx.fillText('LAST LINE · RAIL CONTROL', canvas.width / 2, 38);
    ctx.fillStyle = '#9fb3c2'; ctx.font = '13px Arial';
    ctx.fillText('Click a switch to open or close it. Route any train into the moving hunter.', canvas.width / 2, 62);
    ctx.fillText('ESC or EXIT returns to the station · trains can only change lanes at open switches', canvas.width / 2, 84);
    const seconds = Math.ceil(puzzle.timer / 60);
    ctx.fillStyle = seconds <= 20 ? '#ff7777' : '#f0d58a'; ctx.font = 'bold 18px Arial';
    ctx.fillText(`TIME ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`, canvas.width / 2, 116);

    ctx.strokeStyle = '#263743'; ctx.lineWidth = 8;
    for (let lane = 0; lane < puzzle.lanes; lane++) {
        const y = layout.top + lane * layout.laneGap;
        ctx.beginPath(); ctx.moveTo(layout.left, y); ctx.lineTo(layout.right, y); ctx.stroke();
        ctx.strokeStyle = '#71818b'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(layout.left, y - 9); ctx.lineTo(layout.right, y - 9); ctx.moveTo(layout.left, y + 9); ctx.lineTo(layout.right, y + 9); ctx.stroke();
        ctx.strokeStyle = '#263743'; ctx.lineWidth = 8;
    }
    for (const entry of puzzle.switches) {
        const sx = layout.left + entry.col * layout.colGap;
        const lowY = layout.top + entry.lowLane * layout.laneGap, highY = lowY + layout.laneGap;
        ctx.strokeStyle = entry.open ? '#48e59a' : '#7f4d57'; ctx.lineWidth = entry.open ? 7 : 4;
        ctx.beginPath(); ctx.moveTo(sx, lowY); ctx.lineTo(sx, highY); ctx.stroke();
        ctx.fillStyle = entry.open ? '#9dffca' : '#dc8690'; ctx.beginPath(); ctx.arc(sx, (lowY + highY) / 2, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#142029'; ctx.font = 'bold 12px Arial'; ctx.fillText(entry.open ? '↕' : '×', sx, (lowY + highY) / 2 + 4);
    }
    for (const train of puzzle.trains) {
        const x = layout.left + train.progress * layout.colGap, y = layout.top + train.lane * layout.laneGap;
        if (x < layout.left - 50 || x > layout.right + 50) continue;
        ctx.fillStyle = train.passenger ? '#f7e6a1' : train.color; ctx.fillRect(x - 22, y - 14, 44, 28);
        if (train.passenger) { ctx.strokeStyle = '#fff5bd'; ctx.lineWidth = 3; ctx.strokeRect(x - 25, y - 17, 50, 34); }
        ctx.fillStyle = '#142029'; ctx.fillRect(x - 13, y - 8, 9, 10); ctx.fillRect(x + 4, y - 8, 9, 10);
        ctx.fillStyle = train.passenger ? '#fff1a8' : '#fff'; ctx.font = 'bold 9px Arial'; ctx.fillText(train.passenger ? 'PASSENGER' : 'TRAIN', x, y + 27);
    }
    const targetX = layout.left + puzzle.target.progress * layout.colGap, targetY = layout.top + puzzle.target.lane * layout.laneGap;
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.ellipse(targetX + 4, targetY + 18, 17, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#537b99'; ctx.beginPath(); ctx.arc(targetX, targetY, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d8f1ff'; ctx.beginPath(); ctx.arc(targetX - 5, targetY - 2, 2, 0, Math.PI * 2); ctx.arc(targetX + 5, targetY - 2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d8f1ff'; ctx.font = 'bold 11px Arial'; ctx.fillText(`${monster.name} · MOVING TARGET`, targetX, targetY - 25);
    ctx.fillStyle = 'rgba(19,35,44,.96)'; ctx.fillRect(18, canvas.height - 78, 100, 46); ctx.strokeStyle = '#7f9eaa'; ctx.lineWidth = 2; ctx.strokeRect(18, canvas.height - 78, 100, 46);
    ctx.fillStyle = '#dceeff'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'; ctx.fillText('EXIT', 68, canvas.height - 50);
    ctx.textAlign = 'left'; ctx.fillStyle = '#9fb3c2'; ctx.font = '12px Arial'; ctx.fillText('OPEN SWITCHES', 20, canvas.height - 22);
    ctx.fillStyle = '#48e59a'; ctx.fillText(`${puzzle.switches.filter(entry => entry.open).length}/${puzzle.switches.length}`, 20, canvas.height - 25);
    if (puzzle.silverEligible) {
        ctx.textAlign = 'right'; ctx.fillStyle = '#dbe7f0';
        ctx.fillText(`MISSED TRAINS ${puzzle.missedTrains}/3`, canvas.width - 20, canvas.height - 48);
        ctx.fillStyle = puzzle.passengerSeen ? '#ffe99b' : '#9fb3c2';
        ctx.fillText(`PASSENGER: ${puzzle.passengerSeen ? 'PASSED' : puzzle.passengerPending ? 'NEXT TRAIN' : 'WAITING'}`, canvas.width - 20, canvas.height - 25);
    }
}

function drawSubwayFareCutscene() {
    const scene = subwayFareCutscene;
    if (!scene) return;
    const t = scene.time;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#070b10'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createRadialGradient(canvas.width / 2, 290, 20, canvas.width / 2, 290, 470);
    gradient.addColorStop(0, 'rgba(198,155,63,.16)'); gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f1d38a'; ctx.font = 'bold 25px Arial'; ctx.fillText('THE FARE HAS BEEN PAID', canvas.width / 2, 48);
    ctx.fillStyle = '#aab9c4'; ctx.font = '13px Arial';
    ctx.fillText(t < 180 ? 'RAIL CONTROL · FINAL ROUTE' : t < 390 ? 'THE LAST LINE IS STILL RUNNING' : 'PLATFORM 0 · ONE PASSENGER REMAINS', canvas.width / 2, 73);

    const left = 80, right = canvas.width - 80, top = 150, laneGap = 48;
    ctx.strokeStyle = '#293a44'; ctx.lineWidth = 8;
    for (let lane = 0; lane < 6; lane++) {
        const y = top + lane * laneGap;
        ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
        ctx.strokeStyle = '#826d4b'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(left, y - 8); ctx.lineTo(right, y - 8); ctx.moveTo(left, y + 8); ctx.lineTo(right, y + 8); ctx.stroke();
        ctx.strokeStyle = '#293a44'; ctx.lineWidth = 8;
    }
    const targetLane = 2 + Math.sin(t / 37) * 1.2;
    const nizarX = 450 + Math.sin(t / 29) * 120, nizarY = top + targetLane * laneGap;
    const drawCutsceneTrain = (x, lane, passenger = false, alpha = 1) => {
        const y = top + lane * laneGap;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = passenger ? '#d8b84e' : '#596772'; ctx.fillRect(x - 34, y - 16, 68, 32);
        ctx.fillStyle = '#151d22'; ctx.fillRect(x - 24, y - 10, 13, 11); ctx.fillRect(x - 4, y - 10, 13, 11); ctx.fillRect(x + 16, y - 10, 10, 11);
        if (passenger) { ctx.strokeStyle = '#fff0a4'; ctx.lineWidth = 2; ctx.strokeRect(x - 38, y - 20, 76, 40); }
        ctx.globalAlpha = 1;
    };
    if (t >= 115 && t < 410) {
        const trainPhase = (t - 115) / 295;
        for (let i = 0; i < 3; i++) drawCutsceneTrain(left + trainPhase * (right - left) - i * 250, (i * 2 + 1) % 6, false, Math.min(1, trainPhase * 2));
    }
    if (t >= 300) drawCutsceneTrain(left + Math.min(1, (t - 300) / 170) * (right - left), 3, true, 1);
    if (t < 440 || t > 510) {
        ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.beginPath(); ctx.ellipse(nizarX + 4, nizarY + 19, 19, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#5c85a0'; ctx.beginPath(); ctx.arc(nizarX, nizarY, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#d9f2ff'; ctx.beginPath(); ctx.arc(nizarX - 5, nizarY - 2, 2, 0, Math.PI * 2); ctx.arc(nizarX + 5, nizarY - 2, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#cfe9f7'; ctx.font = 'bold 11px Arial'; ctx.fillText('NIZAR', nizarX, nizarY - 26);
    }
    if (t >= 405) {
        const pull = Math.min(1, (t - 405) / 105), sphereX = nizarX - 110 * pull;
        ctx.fillStyle = `rgba(255,220,90,${.18 + pull * .25})`; ctx.beginPath(); ctx.arc(sphereX, nizarY, 24 + pull * 18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#edc94c'; ctx.beginPath(); ctx.arc(sphereX, nizarY, 9 + pull * 3, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,233,137,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sphereX + 14, nizarY); ctx.lineTo(nizarX - 19, nizarY); ctx.stroke();
    }
    if (t >= 470) {
        ctx.fillStyle = 'rgba(255,239,164,.85)'; ctx.beginPath(); ctx.arc(canvas.width / 2, 500, Math.min(34, (t - 470) / 2), 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff4bd'; ctx.font = 'bold 16px Arial'; ctx.fillText(t < 525 ? 'THE TRAIN STOPS.' : 'THANK YOU FOR RIDING THE LAST LINE.', canvas.width / 2, 560);
    } else if (t >= 180) {
        ctx.fillStyle = '#d8e7ee'; ctx.font = '14px Arial'; ctx.fillText('Three trains pass. The fourth carries a passenger who can see the hunter.', canvas.width / 2, 560);
    } else {
        ctx.fillStyle = '#aab9c4'; ctx.font = '14px Arial'; ctx.fillText('The control board shows one route that was never meant for Nizar.', canvas.width / 2, 560);
    }
    ctx.textAlign = 'left';
}

function updateSubwayTrains() {
    if (currentMapId !== 'subway' || !(state === 1 || state === 3)) return;
    for (const train of subwayTrains) {
        if (!train.active || !train.path?.length) continue;
        const nextIndex = train.point + train.direction;
        if (!train.path[nextIndex]) { train.direction *= -1; continue; }
        const target = { x:train.path[nextIndex].x * TS + TS / 2, y:train.path[nextIndex].y * TS + TS / 2 };
        const dx = target.x - train.x, dy = target.y - train.y, distance = Math.hypot(dx, dy);
        train.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
        const movementSpeed = train.speed * (train.goldPassTimer > 0 ? 1.75 : subwayGoldPressure?.active ? 1.12 : 1);
        if (distance <= movementSpeed) { train.x = target.x; train.y = target.y; train.point = nextIndex; }
        else { train.x += dx / distance * movementSpeed; train.y += dy / distance * movementSpeed; }
        const hit = entity => train.axis === 'x'
            ? Math.abs(entity.y - train.y) < 24 && Math.abs(entity.x - train.x) < train.length / 2
            : Math.abs(entity.x - train.x) < 24 && Math.abs(entity.y - train.y) < train.length / 2;
        if (hit(player)) { endGame(false, monster); return; }
        // No marked kill zone: the hunter must actually be chasing close behind
        // when it crosses an oncoming train.
        const baitedHunter = enemy => subwayTrapArmed && enemy === monster
            && Math.hypot(enemy.x - player.x, enemy.y - player.y) < 275
            && getLineOfSight(enemy.x, enemy.y, player.x, player.y);
        if (!train.trapTrain && !baitedHunter(monster)) continue;
        for (const enemy of monsters) {
            if (!hit(enemy)) continue;
            if ((train.trapTrain || baitedHunter(enemy)) && subwayTrapArmed && enemy === monster) {
                subwayTrainTriggered = true; state = 8; enemy.stunTimer = 999; showStoryLine('THE LAST LINE DOES NOT STOP.', 2200);
                setTimeout(() => { if (state === 8) endGame(true, enemy); }, 2200);
                return;
            }
        }
    }
}

function setupForestBeacon() {
    if (currentMapId !== 'forest') return;
    const darkCabin = forestBreakers[0]?.cabin || forestCabins.find(cabin => !cabin.lit) || forestCabins[0];
    forestBeaconBattery = darkCabin ? { x: darkCabin.x, y: darkCabin.y + TS * .45, collected:false } : null;
    const candidates = floors.filter(tile => Math.hypot(tile.c * TS + TS / 2 - player.x, tile.r * TS + TS / 2 - player.y) > TS * 16 && !getRoomAt(tile.c * TS + TS / 2, tile.r * TS + TS / 2) && isOpenObjectSpot(tile.c * TS + TS / 2, tile.r * TS + TS / 2, TS * 4));
    const tile = candidates[Math.floor(Math.random() * Math.max(1, candidates.length))] || floors.at(-1);
    forestWatchtower = tile ? { x: tile.c * TS + TS / 2, y: tile.r * TS + TS / 2 } : null;
    if (forestWatchtower) reserveObjectTile(Math.floor(forestWatchtower.x / TS), Math.floor(forestWatchtower.y / TS), 2);
}

function updateForestGuidance() {
    if (currentMapId !== 'forest' || state !== 1) return;
    const cabinsNeedingLight = forestBreakers.filter(breaker => !breaker.active);
    const nextMode = cabinsNeedingLight.length ? 'cabins' : 'watchtower';
    if (forestGuideMode !== nextMode) {
        forestGuideMode = nextMode;
        forestGuideTimer = 0;
        forestGuideCooldown = nextMode === 'cabins' ? 1200 : 600;
    }
    if (forestGuideTimer > 0) { forestGuideTimer--; return; }
    if (forestGuideCooldown > 0) { forestGuideCooldown--; return; }
    forestGuideTimer = nextMode === 'cabins' ? 300 : 180;
    forestGuideCooldown = nextMode === 'cabins' ? 900 : 420;
    notify(nextMode === 'cabins' ? 'CABIN LIGHTS MARKED' : 'WATCHTOWER MARKED', 'info', 900);
}

function forestObjectiveComplete() { return currentMapId !== 'forest' || (activeGens >= totalGens && forestBreakers.every(breaker => breaker.active) && forestBeaconActive); }

function updateNoah() {
    if (monster.name !== 'NOAH' || state !== 1) return false;
    if (noahTimer > 0) noahTimer--; if (noahPathTimer > 0) noahPathTimer--; if (noahLightningCooldown > 0) noahLightningCooldown--;
    if (noahLightningWarning > 0) {
        noahLightningWarning--;
        if (noahLightningWarning <= 0) {
            noahLightningZones.push(...noahLightningPending);
            noahLightningPending = [];
            noahLightningFlashes = 3;
            notify('LIGHTNING STRIKES THE TREES', 'danger');
        }
    }
    const lit = isSafeRoom(player.x, player.y) || flareTimer > 0;
    const moveX = (keys.d ? 1 : 0) - (keys.a ? 1 : 0), moveY = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
    const leadX = player.x + moveX * TS * 4, leadY = player.y + moveY * TS * 4;
    const leadC = Math.max(1, Math.min(COLS - 2, Math.floor(leadX / TS))), leadR = Math.max(1, Math.min(ROWS - 2, Math.floor(leadY / TS)));
    const pursue = map[leadR]?.[leadC] === 0 ? { x:leadC * TS + TS / 2, y:leadR * TS + TS / 2 } : player;
    if (noahState === 'hidden') {
        monster.invisible = true;
        const target = !isSafeRoom(player.x, player.y) && Math.hypot(player.x - monster.x, player.y - monster.y) < 680 ? pursue : (noiseTarget && noiseTimer > 0 && !isSafeRoom(player.x, player.y) ? noiseTarget : null);
        if (target && (noahPathTimer <= 0 || !monster.path.length)) { monster.path = findPath(Math.floor(monster.x / TS), Math.floor(monster.y / TS), Math.floor(target.x / TS), Math.floor(target.y / TS)); noahPathTimer = 18; }
        else if (!monster.path.length) { const tile = pickMonsterWanderTile(monster); monster.path = findPath(Math.floor(monster.x / TS), Math.floor(monster.y / TS), tile.c, tile.r); }
        const oldX = monster.x, oldY = monster.y; moveMonsterAlongPath(getMonsterSpeed(monster) * 1.18, monster);
        if (isSafeRoom(monster.x, monster.y)) { monster.x = oldX; monster.y = oldY; monster.path = []; }
        if (!lit && !player.hidden && Math.hypot(player.x-monster.x, player.y-monster.y) < 92) { noahState = 'reveal'; noahTimer = 60; noahAppearanceWindow = 60; monster.invisible = false; notify('NOAH REVEALS HIMSELF', 'danger'); }
    } else if (noahState === 'reveal') { monster.invisible = false; if (noahTimer <= 0) { noahState = 'burst'; noahTimer = 34; const intercept = { x: player.x + moveX * TS * 4, y: player.y + moveY * TS * 4 }; const angle = Math.atan2(intercept.y - monster.y, intercept.x - monster.x); noahCharge = { angle, x:intercept.x, y:intercept.y }; } }
    else {
        const oldX = monster.x, oldY = monster.y;
        if (noahState === 'burst' && noahCharge) {
            // A burst is a committed intercept line, not a path recalculated on the
            // player's current tile every frame. This stops vertical kiting.
            moveEntity(monster, Math.cos(noahCharge.angle) * getMonsterSpeed(monster) * 1.32, Math.sin(noahCharge.angle) * getMonsterSpeed(monster) * 1.32);
            if (Math.hypot(monster.x - oldX, monster.y - oldY) < .4) noahTimer = 0;
        } else {
            if (noahPathTimer <= 0 || !monster.path.length) { monster.path = findPath(Math.floor(monster.x / TS), Math.floor(monster.y / TS), Math.floor(pursue.x / TS), Math.floor(pursue.y / TS)); noahPathTimer = 12; }
            moveMonsterAlongPath(getMonsterSpeed(monster) * 1.13, monster);
        }
        if (isSafeRoom(monster.x, monster.y)) { monster.x = oldX; monster.y = oldY; monster.path = []; noahState = 'hidden'; noahTimer = 0; monster.invisible = true; }
        if (noahState === 'burst' && noahTimer <= 0) { noahState = 'hunt'; noahTimer = 480; noahCharge = null; monster.path = []; }
        if (noahState === 'hunt' && (noahTimer <= 0 || lit || player.hidden)) { noahState = 'hidden'; noahTimer = 0; monster.path = []; }
        if (!lit && !player.hidden && Math.hypot(player.x-monster.x, player.y-monster.y) < player.r + monster.r) endGame(false, monster);
    }
    if (!lit && !player.hidden && noahLightningCooldown <= 0 && noahLightningWarning <= 0 && Math.hypot(player.x-monster.x, player.y-monster.y) < 360) {
        noahLightningCooldown = 720;
        noahLightningPending = [];
        for (let i = 0; i < 3; i++) { let x = player.x, y = player.y, tries = 0; do { const angle = Math.random() * Math.PI * 2, distance = 38 + Math.random() * 72; x = player.x + Math.cos(angle)*distance; y = player.y + Math.sin(angle)*distance; tries++; } while (tries < 12 && checkWall({ x, y, r:8 })); noahLightningPending.push({ x, y, radius:30, life:300 }); }
        noahLightningWarning = 60;
        notify('LIGHTNING IN 1 SECOND · MOVE', 'warning');
    }
    return true;
}

function beginNizarCrush(nizarEnemy = monsters.find(enemy => enemy.name === 'NIZAR')) {
    if (!nizarEnemy || state !== 1 || nizarCrush) return;
    const y = player.y;
    nizarCrush = {
        left: { x:player.x - 245, y, width:70, height:154 },
        right: { x:player.x + 245, y, width:70, height:154 },
        speed:6.1, warning:48, impact:false
    };
    nizarCrushCooldown = 1200;
    notify('NIZAR DISTORTED THE SPACE AROUND YOU · MOVE', 'warning');
}

function spawnNizarClones(nizarEnemy = monsters.find(enemy => enemy.name === 'NIZAR')) {
    if (!nizarEnemy || state !== 1 || nizarClones.length) return;
    const candidates = floors.filter(tile => {
        const x = tile.c * TS + TS / 2, y = tile.r * TS + TS / 2;
        return Math.hypot(x - player.x, y - player.y) > 260 && Math.hypot(x - nizarEnemy.x, y - nizarEnemy.y) > 90;
    }).sort(() => Math.random() - .5);
    for (let index = 0; index < 2; index++) {
        const tile = candidates[index] || floors[(index * 37) % Math.max(1, floors.length)];
        if (!tile) continue;
        nizarClones.push({ x:tile.c * TS + TS / 2, y:tile.r * TS + TS / 2, r:13, drawRadius:14, speed:Math.max(2.25, nizarEnemy.speed * .82), path:[], lastTargetC:-1, lastTargetR:-1, life:1800 });
    }
    nizarCloneCooldown = 2400;
    if (nizarClones.length) notify('SIGNAL SPLIT · TWO NIZARS DETECTED', 'danger');
}

function updateNizarClones() {
    if (nizarCloneCooldown > 0) nizarCloneCooldown--;
    if (nizarCloneCooldown <= 0 && !nizarClones.length) spawnNizarClones();
    const survivors = [];
    for (const clone of nizarClones) {
        clone.life--;
        if (clone.life <= 0) continue;
        const targetC = Math.floor(player.x / TS), targetR = Math.floor(player.y / TS);
        if (clone.lastTargetC !== targetC || clone.lastTargetR !== targetR || clone.path.length === 0) {
            clone.path = findPath(Math.floor(clone.x / TS), Math.floor(clone.y / TS), targetC, targetR);
            clone.lastTargetC = targetC; clone.lastTargetR = targetR;
        }
        if (clone.path.length) {
            const next = clone.path[0], tx = next.c * TS + TS / 2, ty = next.r * TS + TS / 2;
            if (Math.hypot(tx - clone.x, ty - clone.y) <= clone.speed) { clone.x = tx; clone.y = ty; clone.path.shift(); }
            else moveEntity(clone, Math.cos(Math.atan2(ty - clone.y, tx - clone.x)) * clone.speed, Math.sin(Math.atan2(ty - clone.y, tx - clone.x)) * clone.speed);
        }
        if (Math.hypot(player.x - clone.x, player.y - clone.y) < player.r + clone.r + 4) continue;
        survivors.push(clone);
    }
    nizarClones = survivors;
}

function updateNizarCrush() {
    if (!nizarCrush) return;
    if (nizarCrush.warning > 0) { nizarCrush.warning--; return; }
    const crush = nizarCrush;
    crush.left.x += crush.speed;
    crush.right.x -= crush.speed;
    const insideHeight = Math.abs(player.y - crush.left.y) < crush.left.height / 2 + player.r;
    if (insideHeight && !player.hidden) {
        const leftOuter = crush.left.x - crush.left.width / 2, leftInner = crush.left.x + crush.left.width / 2;
        const rightInner = crush.right.x - crush.right.width / 2, rightOuter = crush.right.x + crush.right.width / 2;
        // The frames are solid while moving. If one reaches the player's
        // circle, it carries the player inward instead of allowing a walk
        // straight through the hazard.
        if (player.x > leftOuter - player.r && player.x < leftInner + player.r && player.x < rightInner) {
            player.x = leftInner + player.r + 2;
        }
        if (player.x < rightOuter + player.r && player.x > rightInner - player.r && player.x > leftInner) {
            player.x = rightInner - player.r - 2;
        }
    }
    const leftEdge = crush.left.x + crush.left.width / 2;
    const rightEdge = crush.right.x - crush.right.width / 2;
    if (leftEdge < rightEdge) return;
    const betweenFrames = player.x > crush.left.x - crush.left.width / 2 && player.x < crush.right.x + crush.right.width / 2;
    playNizarCrashSound();
    crush.impact = true;
    nizarCrush = null;
    nizarCrushCooldown = 900;
    if (insideHeight && betweenFrames) { endGame(false, monsters.find(enemy => enemy.name === 'NIZAR') || monster); return; }
    showMsg('THE CLOSING FRAMES COLLIDE', 650);
}

function updateNizarAbilities() {
    const nizarEnemy = monsters.find(enemy => enemy.name === 'NIZAR');
    if (!nizarEnemy || state !== 1) { nizarClones = []; nizarCrush = null; return; }
    if (nizarCrushCooldown > 0) nizarCrushCooldown--;
    if (!nizarCrush && nizarCrushCooldown <= 0 && Math.random() < .00125) beginNizarCrush(nizarEnemy);
    updateNizarCrush();
    if (nizarCloneCooldown <= 0 && !nizarClones.length) spawnNizarClones(nizarEnemy);
    updateNizarClones();
}

function drawNizarAbilities() {
    if (!monsters.some(enemy => enemy.name === 'NIZAR') || state !== 1) return;
    for (const clone of nizarClones) {
        ctx.fillStyle = 'rgba(74,126,155,.82)';
        ctx.beginPath(); ctx.arc(clone.x, clone.y, clone.drawRadius, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#b9e9ff';
        ctx.beginPath(); ctx.arc(clone.x - clone.drawRadius * .3, clone.y - 2, 2, 0, Math.PI * 2); ctx.arc(clone.x + clone.drawRadius * .3, clone.y - 2, 2, 0, Math.PI * 2); ctx.fill();
    }
    if (nizarCrush) {
        const pulse = nizarCrush.warning > 0 ? .38 + Math.sin(ambienceClock * .5) * .12 : .72;
        for (const block of [nizarCrush.left, nizarCrush.right]) {
            ctx.fillStyle = `rgba(104,177,211,${pulse})`;
            ctx.fillRect(block.x - block.width / 2, block.y - block.height / 2, block.width, block.height);
            ctx.strokeStyle = '#c7f3ff'; ctx.lineWidth = 3; ctx.strokeRect(block.x - block.width / 2, block.y - block.height / 2, block.width, block.height);
            ctx.strokeStyle = 'rgba(15,40,52,.8)'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(block.x - 18, block.y - 28); ctx.lineTo(block.x + 18, block.y + 28); ctx.moveTo(block.x + 18, block.y - 28); ctx.lineTo(block.x - 18, block.y + 28); ctx.stroke();
        }
        if (nizarCrush.warning > 0) { ctx.fillStyle = '#d6f7ff'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center'; ctx.fillText('MOVE OUT OF THE CLOSING FRAMES', player.x, player.y - 104); }
    }
}

function updateAmine() {
    if (monster.name !== 'AMINE' || state !== 1) return false;
    if (amineVisibleTimer>0) amineVisibleTimer--; if (amineFlashCooldown>0) amineFlashCooldown--; if (amineTeleportCooldown>0) amineTeleportCooldown--;
    if (amineFlashCooldown<=0) { amineVisibleTimer=50; amineFlashCooldown=150+Math.floor(Math.random()*180); }
    const dist=Math.hypot(player.x-monster.x,player.y-monster.y);
    const teleportChance = currentMapId === 'amine' ? 1 : .28;
    if (amineTeleportCooldown<=0 && !isSafeRoom(player.x, player.y) && dist>160 && dist<520 && Math.random() < teleportChance) {
        const mx=(keys.d?1:0)-(keys.a?1:0), my=(keys.s?1:0)-(keys.w?1:0), angle=(mx||my)?Math.atan2(my,mx):Math.atan2(player.y-monster.y,player.x-monster.x);
        const candidates=floors.filter(t=>Math.hypot(t.c*TS+TS/2-(player.x-Math.cos(angle)*TS*4),t.r*TS+TS/2-(player.y-Math.sin(angle)*TS*4))<TS*3&&!amineHoles.some(h=>h.c===t.c&&h.r===t.r));
        const tile=candidates[Math.floor(Math.random()*Math.max(1,candidates.length))]; if(tile){monster.x=tile.c*TS+TS/2;monster.y=tile.r*TS+TS/2;monster.path=[];flashAlpha=.9;amineVisibleTimer=90;} amineTeleportCooldown=[420,540,720][currentDiff];
    }
    const tc=Math.floor(player.x/TS),tr=Math.floor(player.y/TS);
    if (!isSafeRoom(player.x, player.y) && dist < 430) { if(!monster.path.length||monster.lastTargetC!==tc||monster.lastTargetR!==tr){monster.path=findPath(Math.floor(monster.x/TS),Math.floor(monster.y/TS),tc,tr);monster.lastTargetC=tc;monster.lastTargetR=tr;} }
    else if (!monster.path.length) { const tile=pickMonsterWanderTile(monster); monster.path=findPath(Math.floor(monster.x/TS),Math.floor(monster.y/TS),tile.c,tile.r); }
    moveMonsterAlongPath(getMonsterSpeed(monster)*.90,monster);
    if (!player.hidden && Math.hypot(player.x-monster.x,player.y-monster.y)<player.r+monster.r+3) { state=8; amineVisibleTimer=120; showStoryLine('“May death do us part.”',1500); setTimeout(()=>{if(state===8)endGame(false,monster);},1500); }
    return true;
}

function beginAmineRoadChase() {
    state = 11;
    amineFocus = false;
    monster.invisible = false;
    hud.style.display = 'none';
    document.getElementById('mapTaskHUD').style.display = 'none';
    document.getElementById('hotelTaskHUD').style.display = 'none';
    document.getElementById('mapButton').style.display = 'none';
    amineBullets = [];
    amineTurret = null;
    amineRoad = {
        left: 96, right: 704, top: 64, bottom: 560,
        player: { x:400, y:486, width:82, height:48, health:3 },
        target: { x:400, y:150, width:38, height:58, health:4, vx:0, vy:0, changeTimer:18, invisibleTimer:0, visibleFlash:0 },
        roadblocks: [],
        aimX:400,
        scroll:0,
        spawnTimer:36,
        cooldown:0,
        jamTimer:0,
        shotStreak:0,
        quietTimer:0,
        distance:0,
        hitFlash:0,
        roadShake:0,
        finished:false
    };
    notify('EXIT GATE · VEHICLE PURSUIT INITIATED', 'unlock');
    showMsg('STEER WITH A / D · AIM AND FIRE WITH CLICK OR SPACE', 1900);
}

function beginAmineFinalChase() {
    beginAmineRoadChase();
}

function amineRoadRect(entity) {
    return { left:entity.x - entity.width / 2, right:entity.x + entity.width / 2, top:entity.y - entity.height / 2, bottom:entity.y + entity.height / 2 };
}

function amineRoadRectHit(a, b) {
    const first = amineRoadRect(a), second = amineRoadRect(b);
    return first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;
}

function spawnAmineRoadblock() {
    if (!amineRoad || amineRoad.roadblocks.length >= 7) return;
    const width = 56 + Math.floor(Math.random() * 42);
    const x = amineRoad.left + 30 + Math.random() * (amineRoad.right - amineRoad.left - 60);
    amineRoad.roadblocks.push({ x, y:-52, width, height:30, speed:4.7 + currentDiff * .45 + Math.random() * 1.7, tilt:(Math.random() - .5) * .16, type:Math.random() < .5 ? 'barrier' : 'wreck' });
}

function fireAmineRoadWeapon(targetX = amineRoad?.aimX || amineRoad?.player.x) {
    if (state !== 11 || !amineRoad || amineRoad.finished) return;
    if (amineRoad.jamTimer > 0) { notify('TURRET JAMMED · WAIT FOR THE COOLING CYCLE', 'warning'); return; }
    if (amineRoad.cooldown > 0) return;
    const playerCar = amineRoad.player;
    const requestedAim = Number(targetX);
    const aim = Number.isFinite(requestedAim) ? Math.max(amineRoad.left, Math.min(amineRoad.right, requestedAim)) : playerCar.x;
    const angle = Math.atan2(amineRoad.target.y - (playerCar.y - 28), aim - playerCar.x);
    amineBullets.push({ x:playerCar.x, y:playerCar.y - 28, vx:Math.cos(angle) * 10.5, vy:Math.sin(angle) * 10.5, life:90, radius:4 });
    amineRoad.aimX = aim;
    amineRoad.cooldown = 8;
    amineRoad.quietTimer = 0;
    amineRoad.shotStreak++;
    playSound('tick');
    if (amineRoad.shotStreak >= 8) {
        amineRoad.jamTimer = 150;
        amineRoad.shotStreak = 0;
        playSound('fail');
        notify('TURRET JAMMED · REPETITIVE FIRE OVERHEATED IT', 'danger');
    }
}

function updateAmineRoadChase() {
    if (state !== 11 || !amineRoad || amineRoad.finished) return;
    const road = amineRoad;
    if (road.cooldown > 0) road.cooldown--;
    if (road.jamTimer > 0) road.jamTimer--;
    road.quietTimer++;
    if (road.quietTimer > 100) road.shotStreak = 0;
    if (road.hitFlash > 0) road.hitFlash--;
    if (road.roadShake > 0) road.roadShake--;

    const moveX = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
    const moveY = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
    road.player.x = Math.max(road.left + road.player.width / 2, Math.min(road.right - road.player.width / 2, road.player.x + moveX * 6.4));
    road.player.y = Math.max(road.top + 230, Math.min(road.bottom - road.player.height / 2, road.player.y + moveY * 4.1));
    road.scroll = (road.scroll + 5.2 + currentDiff * .55) % 96;
    road.distance += 1;

    const target = road.target;
    target.changeTimer--;
    if (target.changeTimer <= 0) {
        target.changeTimer = 16 + Math.floor(Math.random() * 46);
        target.vx = (Math.random() - .5) * (3.5 + currentDiff * .8);
        target.vy = (Math.random() - .5) * 1.8;
        if (target.invisibleTimer <= 0 && Math.random() < .24) {
            target.invisibleTimer = 42 + Math.floor(Math.random() * 85);
            notify('AMINE DISAPPEARED INTO THE ROAD NOISE', 'warning');
        }
    }
    if (target.invisibleTimer > 0) target.invisibleTimer--;
    target.x += target.vx; target.y += target.vy;
    if (target.x < road.left + target.width / 2 || target.x > road.right - target.width / 2) { target.vx *= -1; target.x = Math.max(road.left + target.width / 2, Math.min(road.right - target.width / 2, target.x)); }
    target.y = Math.max(96, Math.min(245, target.y));
    target.visibleFlash = target.invisibleTimer <= 0 ? 0 : (target.invisibleTimer % 12 < 4 ? 1 : 0);
    monster.invisible = target.invisibleTimer > 0;

    road.spawnTimer--;
    if (road.spawnTimer <= 0) { spawnAmineRoadblock(); road.spawnTimer = 34 + Math.floor(Math.random() * 48) - currentDiff * 4; }
    for (const block of road.roadblocks) block.y += block.speed;
    for (const block of road.roadblocks) {
        if (amineRoadRectHit(road.player, block)) {
            block.y = road.bottom + 80;
            road.player.health--;
            road.hitFlash = 20; road.roadShake = 22;
            playSound('fail');
            notify(`ROADBLOCK HIT · VEHICLE ${Math.max(0, road.player.health)}/3`, 'danger');
            if (road.player.health <= 0) { road.finished = true; endGame(false, monster); return; }
        }
    }
    road.roadblocks = road.roadblocks.filter(block => block.y < road.bottom + 100);

    for (const bullet of amineBullets) {
        bullet.x += bullet.vx; bullet.y += bullet.vy; bullet.life--;
        const bulletBox = { x:bullet.x, y:bullet.y, width:bullet.radius * 2, height:bullet.radius * 2 };
        const block = road.roadblocks.find(candidate => amineRoadRectHit(bulletBox, candidate));
        if (block) { bullet.life = 0; block.y = road.bottom + 100; playSound('fail'); continue; }
        const targetBox = { x:target.x, y:target.y, width:target.width, height:target.height };
        if (target.invisibleTimer <= 0 && amineRoadRectHit(bulletBox, targetBox)) {
            bullet.life = 0; target.health--; road.hitFlash = 18; notify(`AMINE HIT · ${target.health} SHOT${target.health === 1 ? '' : 'S'} REMAIN`, 'unlock');
            if (target.health <= 0) { road.finished = true; showStoryLine('THE ROAD FINALLY REMEMBERS HIM.', 900); setTimeout(() => endGame(true, monster), 900); return; }
        }
    }
    amineBullets = amineBullets.filter(bullet => bullet.life > 0 && bullet.y > -40 && bullet.y < canvas.height + 40 && bullet.x > -40 && bullet.x < canvas.width + 40);
}

function drawAmineRoadChase() {
    if (!amineRoad) return;
    const road = amineRoad, target = road.target;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#11181c'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    if (road.roadShake > 0) ctx.translate((Math.random() - .5) * 8, (Math.random() - .5) * 5);
    ctx.fillStyle = '#20282d'; ctx.fillRect(road.left - 28, 0, road.right - road.left + 56, canvas.height);
    ctx.fillStyle = '#43484a'; ctx.fillRect(road.left, 0, road.right - road.left, canvas.height);
    ctx.fillStyle = '#2b3032'; ctx.fillRect(road.left + 8, 0, 8, canvas.height); ctx.fillRect(road.right - 16, 0, 8, canvas.height);
    ctx.strokeStyle = '#d1b86b'; ctx.lineWidth = 3; ctx.setLineDash([42, 54]); ctx.lineDashOffset = road.scroll;
    for (const laneX of [road.left + 122, road.left + 244, road.left + 366, road.left + 488]) { ctx.beginPath(); ctx.moveTo(laneX, 0); ctx.lineTo(laneX, canvas.height); ctx.stroke(); }
    ctx.setLineDash([]);
    for (const block of road.roadblocks) {
        ctx.save(); ctx.translate(block.x, block.y); ctx.rotate(block.tilt);
        if (block.type === 'barrier') { ctx.fillStyle = '#d4d0bd'; ctx.fillRect(-block.width / 2, -block.height / 2, block.width, block.height); ctx.fillStyle = '#a52525'; for (let x = -block.width / 2; x < block.width / 2; x += 22) ctx.fillRect(x, -block.height / 2, 11, block.height); ctx.fillStyle = '#202426'; ctx.fillRect(-block.width / 2, block.height / 2 - 4, block.width, 8); }
        else { ctx.fillStyle = '#25282b'; ctx.fillRect(-block.width / 2, -block.height / 2, block.width, block.height); ctx.fillStyle = '#9f3f2d'; ctx.fillRect(-block.width / 2 + 8, -block.height / 2 + 5, block.width - 16, 7); ctx.fillStyle = '#121516'; ctx.beginPath(); ctx.arc(-block.width * .28, block.height / 2, 8, 0, Math.PI * 2); ctx.arc(block.width * .28, block.height / 2, 8, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
    }
    for (const bullet of amineBullets) { ctx.fillStyle = '#ffe28c'; ctx.shadowColor = '#ffbe4d'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; }
    if (target.invisibleTimer <= 0 || target.visibleFlash) {
        ctx.save(); ctx.translate(target.x, target.y); ctx.fillStyle = target.invisibleTimer > 0 ? 'rgba(205,230,255,.24)' : '#f5f5f5'; ctx.fillRect(-target.width / 2, -target.height / 2, target.width, target.height); ctx.fillStyle = '#0c0c0c'; ctx.fillRect(-target.width / 2 + 7, -target.height / 2 + 8, target.width - 14, 22); ctx.fillStyle = '#ff6c91'; ctx.beginPath(); ctx.arc(-8, -8, 4, 0, Math.PI * 2); ctx.arc(8, -8, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    const car = road.player;
    ctx.save(); ctx.translate(car.x, car.y);
    ctx.fillStyle = road.hitFlash > 0 ? '#ff6a5b' : '#4ba8c4'; ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height); ctx.fillStyle = '#18282e'; ctx.fillRect(-car.width / 2 + 12, -car.height / 2 + 7, car.width - 24, 18); ctx.fillStyle = '#101416'; ctx.fillRect(-car.width / 2 - 5, -car.height / 2 + 7, 8, 13); ctx.fillRect(car.width / 2 - 3, -car.height / 2 + 7, 8, 13); ctx.fillStyle = '#303d42'; ctx.fillRect(-car.width / 2 + 8, car.height / 2 - 2, car.width - 16, 7); ctx.fillStyle = '#d4c09a'; ctx.fillRect(-5, -car.height / 2 - 17, 10, 19); ctx.fillStyle = '#1c262a'; ctx.fillRect(-3, -car.height / 2 - 22, 6, 12); ctx.restore();
    ctx.restore();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 17px Arial'; ctx.textAlign = 'left'; ctx.fillText('AMINE ROAD PURSUIT', 20, 30); ctx.font = '13px Arial'; ctx.fillStyle = '#d9e8eb'; ctx.fillText(`VEHICLE ${road.player.health}/3`, 20, 52); ctx.fillText(`AMINE TARGET ${target.health}/4`, 20, 70); ctx.textAlign = 'right'; ctx.fillStyle = road.jamTimer > 0 ? '#ff7979' : road.shotStreak >= 6 ? '#ffd36b' : '#b9d6df'; ctx.fillText(road.jamTimer > 0 ? `TURRET JAMMED · ${Math.ceil(road.jamTimer / 60)}s` : `TURRET ${road.shotStreak}/8`, canvas.width - 20, 30); ctx.fillStyle = '#b9d6df'; ctx.fillText('A/D STEER · CLICK OR SPACE FIRE', canvas.width - 20, 52);
    if (target.invisibleTimer > 0) { ctx.textAlign = 'center'; ctx.fillStyle = '#c9e5ff'; ctx.font = 'bold 14px Arial'; ctx.fillText('AMINE IS INVISIBLE', canvas.width / 2, 34); }
}

function updateForestEvent() {
    if (currentMapId !== 'forest' || state !== 1 || !eventsEnabled) return;
    if (forestFogTimer > 0) { forestFogTimer--; return; }
    if (forestFogCooldown > 0) { forestFogCooldown--; return; }
    forestFogTimer = 420; forestFogCooldown = 1260 + Math.floor(Math.random() * 480);
    notify('FOG ROLL · STAY CLOSE TO LIGHT', 'warning');
}

function isInHeatZone(x, y) {
    return heatZones.some(zone => zone.life > 0 && Math.hypot(zone.x - x, zone.y - y) < zone.radius);
}

function updateAesonEvents() {
    if (!monsters.some(enemy => enemy.name === 'AESON') || state !== 1 || !eventsEnabled) return;
    if (heatEventCooldown > 0) { heatEventCooldown--; return; }
    const options = floors.filter(tile => Math.hypot(tile.c * TS + TS / 2 - player.x, tile.r * TS + TS / 2 - player.y) > 180);
    const tile = options[Math.floor(Math.random() * Math.max(1, options.length))] || floors[0];
    heatZones.push({ x: tile.c * TS + TS / 2, y: tile.r * TS + TS / 2, radius: 58, life: 720 });
    heatEventCooldown = 720;
    playSound('alarm');
    showMsg('<span style="color:#ff6b2b">AESON IGNITED A SECTION</span>', 950);
}

function isDynamicBlockedCell(c, r) {
    return (currentMapId === 'hotel' && hotelLockdownActive && hotelBlockedDoor?.cells?.some(cell => cell.c === c && cell.r === r))
        || (currentMapId === 'crimson' && rhysBreakWall && !rhysBreakWall.broken && rhysBreakWall.cells?.some(cell => cell.c === c && cell.r === r))
        || (currentMapId === 'subway' && subwayGoldPressure?.active && subwayGoldPressure.lockedDoorCells?.some(cell => cell.c === c && cell.r === r))
        || (currentMapId === 'lucas' && lucasRouteLocks.some(lock => lock.life > 0 && lock.cells?.some(cell => cell.c === c && cell.r === r)));
}

function isRhysEarlyLockedTile(tile) {
    return currentMapId === 'crimson' && rhysRoute === 'break' && rhysBreakWall && !rhysBreakWall.broken && tile.c >= rhysBreakWall.c;
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
    if (!monsters.some(enemy => enemy.name === 'RHYS') || state !== 1 || !eventsEnabled) return;
    if (rhysSweepTimer > 0) { rhysSweepTimer--; rhysSweepRadius += 16; }
    if (rhysEventCooldown > 0) { rhysEventCooldown--; return; }
    rhysEventCooldown = 1200 + Math.floor(Math.random() * 900);
    const event = Math.floor(Math.random() * 4);
    if (event === 0) { notify('CONTAINMENT ALARM · RHYS INVESTIGATING', 'danger'); noiseTarget = { x:player.x, y:player.y }; noiseTimer = 240; }
    else if (event === 1) { const tile = floors[Math.floor(Math.random() * floors.length)]; if (tile) rhysPressureZones.push({ x:tile.c*TS+TS/2, y:tile.r*TS+TS/2, life:420, radius:52 }); notify('PRESSURE RELEASE · AVOID THE HISS', 'warning'); }
    else if (event === 2) { rhysSweepTimer = 150; rhysSweepRadius = 0; emergencyTimer = Math.max(emergencyTimer, 150); notify('EMERGENCY LIGHT SWEEP', 'warning'); }
    else if (!rhysSealCollected) { const resonance = rhysSeal || monsters.find(enemy => enemy.name === 'RHYS') || player; notify('RESONANCE · RHYS HEARD YOU', 'warning'); noiseTarget = { x:resonance.x, y:resonance.y }; noiseTimer = 300; }
}

function updateRhysHazards() {
    for (const shot of goopShots) {
        shot.x += shot.vx; shot.y += shot.vy; shot.life--;
        if (shot.life <= 0 || checkWall({ x:shot.x, y:shot.y, r:4 })) {
            goopZones.push({ x:shot.x, y:shot.y, life:540, radius:42 });
            shot.life = 0;
        }
    }
    goopShots = goopShots.filter(shot => shot.life > 0);
    for (const zone of goopZones) zone.life--;
    goopZones = goopZones.filter(zone => zone.life > 0);
    for (const zone of rhysPressureZones) zone.life--;
    rhysPressureZones = rhysPressureZones.filter(zone => zone.life > 0);
}

function updateRhysCombat(canSeePlayer) {
    if (monster.name !== 'RHYS' || state !== 1) return false;
    if (rhysSpitCooldown > 0) rhysSpitCooldown--;
    if (rhysDashCooldown > 0) rhysDashCooldown--;
    if (rhysChargeWindup > 0) {
        rhysChargeWindup--;
        if (rhysChargeWindup <= 0) { rhysDashTimer = 150; notify('RHYS CHARGES', 'danger'); }
        return true;
    }
    if (rhysDashTimer > 0) {
        rhysDashTimer--; const beforeX = monster.x, beforeY = monster.y; moveEntity(monster, Math.cos(rhysDashTarget.angle) * 7.8, Math.sin(rhysDashTarget.angle) * 7.8);
        if (rhysBreakWall && !rhysBreakWall.broken && Math.hypot(monster.x-rhysBreakWall.x, monster.y-rhysBreakWall.y) < TS * 1.15) { rhysBreakWall.broken = true; rhysSeal.accessible = true; monster.stunTimer = 180; notify('RHYS BROKE THE WALL · HE IS STUNNED', 'unlock'); updateHUD(); }
        if ((Math.hypot(monster.x - beforeX, monster.y - beforeY) < 1 || rhysDashTimer <= 0) && monster.stunTimer <= 0) { rhysDashTimer = 0; monster.stunTimer = 105; }
        return true;
    }
    const dist = Math.hypot(player.x-monster.x, player.y-monster.y);
    const playerAtCrackedWall = rhysBreakWall && !rhysBreakWall.broken && Math.hypot(player.x-rhysBreakWall.x, player.y-rhysBreakWall.y) < 105;
    const rhysNearCrackedWall = rhysBreakWall && !rhysBreakWall.broken && Math.hypot(monster.x-rhysBreakWall.x, monster.y-rhysBreakWall.y) < 235;
    if (playerAtCrackedWall && rhysNearCrackedWall) {
        rhysDashTarget = { angle:Math.atan2(rhysBreakWall.y-monster.y, rhysBreakWall.x-monster.x), wall:true };
        rhysChargeWindup = 48; rhysDashCooldown = 480;
        notify('RHYS BRACES TO SMASH THE WALL', 'danger');
        return true;
    }
    if (rhysSpitCooldown <= 0 && (canSeePlayer ? dist < 250 : Math.random() < 0.004)) {
        const targetX = canSeePlayer ? player.x : monster.x + (Math.random()-.5)*180, targetY = canSeePlayer ? player.y : monster.y + (Math.random()-.5)*180;
        const angle = Math.atan2(targetY-monster.y,targetX-monster.x); goopShots.push({ x:monster.x, y:monster.y, vx:Math.cos(angle)*4.4, vy:Math.sin(angle)*4.4, life:Math.max(18,Math.min(58,dist/4)) }); rhysSpitCooldown = canSeePlayer ? 210 : 330;
    }
    if (canSeePlayer && rhysDashCooldown <= 0 && dist > 100 && dist < 420 && Math.random() < 0.020) { rhysDashTarget = { angle:Math.atan2(player.y-monster.y,player.x-monster.x) }; rhysChargeWindup = 28; rhysDashCooldown = 300; notify('RHYS IS BRACING', 'danger'); return true; }
    return false;
}

function updateHeat() {
    heatOverlay ||= document.getElementById('heatOverlay');
    const hot = isInHeatZone(player.x, player.y);
    if (hot && !player.inHeatZone && scramblerTimer <= 0) {
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

function isProtectedRoom(x, y) {
    const room = getRoomAt(x, y);
    return room?.type === 'safe' || (currentMapId === 'forest' && room?.type === 'cabin' && room.lit);
}

function isSafeRoom(x, y) {
    if (!isProtectedRoom(x, y)) return false;
    // Level 0 safe rooms and powered Forest cabins are always dependable.
    // Other map-specific safe-room reliability modifiers can still apply.
    if (currentMapId === 'level0' || currentMapId === 'forest') return true;
    return safeRoomsReliable;
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
        task.status = 'failed'; bassamTrapTaskId = task.id; bassamRevealPending = true; bassamRelentlessChase = true; bassamState = 'revealed'; bassamAmbushActive = false; bassamFakeTask = null; monster.path = [];
        closeHotelDialogue(); renderHotelTasks(); notify('THE ASSIGNMENT WAS A LIE', 'danger');
        showMsg('<span style="color:#ff5555">BASSAM IS HUNTING YOU FOR THE REST OF THE SHIFT</span>', 1600); return true;
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

function spawnBassamDecoy() {
    const candidates = floors.filter(tile => {
        const x = tile.c * TS + TS / 2, y = tile.r * TS + TS / 2;
        return !isSafeRoom(x, y) && Math.hypot(x - player.x, y - player.y) > 280;
    });
    const tile = candidates[Math.floor(Math.random() * Math.max(1, candidates.length))] || floors.at(-1);
    if (!tile) return;
    bassamDecoys.push({ x:tile.c * TS + TS / 2, y:tile.r * TS + TS / 2, r:11, life:900, speed:2.35, path:[], lastTargetC:-1, lastTargetR:-1, department:['MAINTENANCE','HOUSEKEEPING','SECURITY'][Math.floor(Math.random() * 3)] });
    notify('BASSAM SENT A FALSE EMPLOYEE', 'danger');
}

function updateBassamOutsideMap() {
    if (currentMapId === 'hotel' || state !== 1 || !eventsEnabled || !monsters.some(enemy => enemy.name === 'BASSAM')) {
        bassamDecoys = [];
        return;
    }
    if (bassamDecoyCooldown > 0) bassamDecoyCooldown--;
    else { spawnBassamDecoy(); bassamDecoyCooldown = 600 + Math.floor(Math.random() * 601); }
    const survivors = [];
    for (const decoy of bassamDecoys) {
        decoy.life--;
        if (decoy.life <= 0) continue;
        const targetC = Math.floor(player.x / TS), targetR = Math.floor(player.y / TS);
        if (decoy.lastTargetC !== targetC || decoy.lastTargetR !== targetR || !decoy.path.length) {
            decoy.path = findPath(Math.floor(decoy.x / TS), Math.floor(decoy.y / TS), targetC, targetR);
            decoy.lastTargetC = targetC; decoy.lastTargetR = targetR;
        }
        moveMonsterAlongPath(decoy.speed, decoy);
        if (!player.hidden && player.dashTimer <= 0 && Math.hypot(player.x - decoy.x, player.y - decoy.y) < player.r + decoy.r + 2) {
            player.stunTimer = Math.max(player.stunTimer, 105);
            triggerBloodHunt();
            notify('FALSE EMPLOYEE · STUNNED', 'warning');
            continue;
        }
        survivors.push(decoy);
    }
    bassamDecoys = survivors;
}

function updateExtraAmineAbility(enemy) {
    enemy.abilityVisibleTimer ??= 0; enemy.abilityFlashCooldown ??= 90; enemy.abilityTeleportCooldown ??= 240;
    if (enemy.abilityVisibleTimer > 0) enemy.abilityVisibleTimer--;
    if (enemy.abilityFlashCooldown > 0) enemy.abilityFlashCooldown--;
    if (enemy.abilityTeleportCooldown > 0) enemy.abilityTeleportCooldown--;
    if (enemy.abilityFlashCooldown <= 0) { enemy.abilityVisibleTimer = 50; enemy.abilityFlashCooldown = 150 + Math.floor(Math.random() * 180); }
    enemy.invisible = enemy.abilityVisibleTimer <= 0;
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    const teleportChance = currentMapId === 'amine' ? 1 : .28;
    if (enemy.abilityTeleportCooldown <= 0 && !isSafeRoom(player.x, player.y) && dist > 160 && dist < 520 && Math.random() < teleportChance) {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        const candidates = floors.filter(tile => Math.hypot(tile.c * TS + TS / 2 - (player.x - Math.cos(angle) * TS * 4), tile.r * TS + TS / 2 - (player.y - Math.sin(angle) * TS * 4)) < TS * 3 && !amineHoles.some(hole => hole.c === tile.c && hole.r === tile.r));
        const tile = candidates[Math.floor(Math.random() * Math.max(1, candidates.length))];
        if (tile) { enemy.x = tile.c * TS + TS / 2; enemy.y = tile.r * TS + TS / 2; enemy.path = []; enemy.abilityVisibleTimer = 90; flashAlpha = .72; }
        enemy.abilityTeleportCooldown = [420, 540, 720][currentDiff];
    }
}

function updateExtraNoahAbility(enemy) {
    enemy.abilityNoahRevealTimer ??= 0; enemy.abilityNoahCooldown ??= 360;
    if (enemy.abilityNoahRevealTimer > 0) enemy.abilityNoahRevealTimer--;
    if (enemy.abilityNoahCooldown > 0) enemy.abilityNoahCooldown--;
    enemy.invisible = enemy.abilityNoahRevealTimer <= 0;
    if (!player.hidden && !isSafeRoom(player.x, player.y) && Math.hypot(player.x - enemy.x, player.y - enemy.y) < 105) {
        if (enemy.abilityNoahRevealTimer <= 0) noahAppearanceWindow = 60;
        enemy.abilityNoahRevealTimer = 60; enemy.invisible = false;
    }
    if (!player.hidden && !isSafeRoom(player.x, player.y) && enemy.abilityNoahCooldown <= 0 && Math.hypot(player.x - enemy.x, player.y - enemy.y) < 380) {
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2, distance = 42 + Math.random() * 80;
            noahLightningZones.push({ x:player.x + Math.cos(angle) * distance, y:player.y + Math.sin(angle) * distance, radius:30, life:300 });
        }
        enemy.abilityNoahCooldown = 720;
        noahLightningFlashes = 3;
        notify('NOAH CALLED LIGHTNING', 'warning');
    }
}

function updateExtraRhysAbility(enemy) {
    enemy.abilityRhysSpitCooldown ??= 180; enemy.abilityRhysDashCooldown ??= 300; enemy.abilityRhysDashTimer ??= 0; enemy.abilityRhysWindup ??= 0; enemy.abilityRhysAngle ??= 0;
    if (enemy.abilityRhysSpitCooldown > 0) enemy.abilityRhysSpitCooldown--;
    if (enemy.abilityRhysDashCooldown > 0) enemy.abilityRhysDashCooldown--;
    if (enemy.abilityRhysWindup > 0) {
        enemy.abilityRhysWindup--;
        if (enemy.abilityRhysWindup <= 0) { enemy.abilityRhysDashTimer = 150; notify('RHYS CHARGES', 'danger'); }
        return true;
    }
    if (enemy.abilityRhysDashTimer > 0) {
        enemy.abilityRhysDashTimer--;
        const beforeX = enemy.x, beforeY = enemy.y;
        moveEntity(enemy, Math.cos(enemy.abilityRhysAngle) * 7.4, Math.sin(enemy.abilityRhysAngle) * 7.4);
        if (Math.hypot(enemy.x - beforeX, enemy.y - beforeY) < 1 || enemy.abilityRhysDashTimer <= 0) { enemy.abilityRhysDashTimer = 0; enemy.stunTimer = 90; }
        return true;
    }
    const canSee = !player.hidden && !player.breathing && !isSafeRoom(player.x, player.y) && monsterCanSeeUnhiddenPlayer(enemy);
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (enemy.abilityRhysSpitCooldown <= 0 && (canSee ? dist < 250 : Math.random() < .003)) {
        const targetX = canSee ? player.x : enemy.x + (Math.random() - .5) * 180, targetY = canSee ? player.y : enemy.y + (Math.random() - .5) * 180;
        const angle = Math.atan2(targetY - enemy.y, targetX - enemy.x);
        goopShots.push({ x:enemy.x, y:enemy.y, vx:Math.cos(angle) * 4.4, vy:Math.sin(angle) * 4.4, life:Math.max(18, Math.min(58, dist / 4)) });
        enemy.abilityRhysSpitCooldown = canSee ? 210 : 330;
    }
    if (canSee && enemy.abilityRhysDashCooldown <= 0 && dist > 100 && dist < 420 && Math.random() < .016) {
        enemy.abilityRhysAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.abilityRhysWindup = 28; enemy.abilityRhysDashCooldown = 300;
        notify('RHYS IS BRACING', 'danger');
        return true;
    }
    return false;
}

function updateExtraMonsterAbilities(enemy) {
    if (state !== 1) return false;
    if (enemy.name === 'AMINE') updateExtraAmineAbility(enemy);
    if (enemy.name === 'NOAH') updateExtraNoahAbility(enemy);
    if (enemy.name === 'RHYS') return updateExtraRhysAbility(enemy);
    return false;
}

function modeMonsterCount() {
    if (gameMode === 'survival') return Math.max(1, Math.min(8, survivalConfig?.count || 1));
    if (gameMode === 'challenge' && challengeConfig?.id === 'double') return 2;
    if (gameMode === 'endless') return Math.min(4, 1 + Math.floor((endlessRound - 1) / 3));
    if ((gameMode === 'challenge' || gameMode === 'campaign') && currentMapId === 'boilerworks' && Math.random() < 0.06) return 2;
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
    if (name === 'NOAH') { enemy.baseSpeed += 0.10; enemy.speed = enemy.baseSpeed; enemy.color = '#18242a'; enemy.textColor = '#9ad7dd'; }
    if (name === 'AMINE') { enemy.baseSpeed += 0.18; enemy.speed = enemy.baseSpeed; enemy.color = '#e8e8e8'; enemy.textColor = '#fff'; }
    if (name === 'NIZAR') { enemy.baseSpeed += 0.14; enemy.speed = enemy.baseSpeed; enemy.color = '#37546a'; enemy.textColor = '#9cd6ff'; }
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

function startGame(diffLevel, startAtBoss = false) {
    initAudio();
    currentDiff = diffLevel;
    runStartedAt = performance.now(); runItemsUsed = 0;
    stats.games++;
    if (gameMode === 'survival') stats.survivalRuns++;
    if (currentMapId === 'boilerworks') advanceDailyObjective('boilerworks');
    document.querySelectorAll('.menu-panel').forEach(p => p.style.display = 'none');
    hud.style.display = 'block';
    document.getElementById('mapTaskHUD').style.display = 'block';
    document.getElementById('mapTaskHUD').style.top = currentMapId === 'hotel' ? '170px' : '';
    hud.classList.toggle('rhys-objective-hud', currentMapId === 'crimson');
    
    if (currentMapId === 'boilerworks') { COLS = 65; ROWS = 49; }
    else if (currentMapId === 'hotel') { COLS = 91; ROWS = 69; }
    else if (currentMapId === 'crimson' || currentMapId === 'forest') { COLS = 93; ROWS = 65; }
    else if (currentMapId === 'amine') { COLS = 61; ROWS = 45; }
    else if (currentMapId === 'subway') { COLS = 122; ROWS = 72; }
    else if (currentMapId === 'lucas') { COLS = 125; ROWS = 79; }
    else { COLS = 41; ROWS = 33; }
    hotelTaskSerial = 0;
    if (currentMapId === 'boilerworks') generateBoilerworks();
    else if (currentMapId === 'hotel') generateHotel();
    else if (currentMapId === 'crimson') generateCrimsonContainment();
    else if (currentMapId === 'forest') generateForest();
    else if (currentMapId === 'amine') generateAmineGrid();
    else if (currentMapId === 'subway') generateSubway();
    else if (currentMapId === 'lucas') generateLucasArea();
    else { generateMaze(); generateSpecialRooms(); }
    if (currentMapId !== 'hotel') hotelElevator = null;
    if (currentMapId !== 'boilerworks') { centralBoiler = null; coolingValves = []; }
    
    const spawnRoom = (currentMapId === 'boilerworks' || currentMapId === 'hotel' || currentMapId === 'crimson' || currentMapId === 'forest' || currentMapId === 'subway' || currentMapId === 'lucas') ? rooms[0] : null;
    player.x = spawnRoom?.x || (MAZE_LEFT + 1.5) * TS; player.y = spawnRoom?.y || (MAZE_TOP + 1.5) * TS;
    if(currentMapId==='amine'){const safeStart=floors.find(t=>t.c<9&&t.r<9&&!amineHoles.some(h=>h.c===t.c&&h.r===t.r)&&!amineFireZones.some(z=>Math.hypot(z.x-(t.c*TS+TS/2),z.y-(t.r*TS+TS/2))<z.radius+30))||floors[0];player.x=safeStart.c*TS+TS/2;player.y=safeStart.r*TS+TS/2;}
    player.baseSpeed = 3.85 * (1 + (upgShoe * 0.05));
    player.speed = player.baseSpeed;
    runLoadoutRemaining = null;
    if (/^custom[123]$/.test(selectedLoadout)) {
        const kit = customLoadouts[Number(selectedLoadout.at(-1)) - 1] || {};
        runLoadoutRemaining = Object.fromEntries(Object.entries(kit).map(([id, amount]) => [id, Math.min(amount, getOwnedItemCount(id))]));
    }
    playerTrail = []; trailLastX = player.x; trailLastY = player.y;
    player.boostTimer = 0; player.dashTimer = 0; player.stunTimer = 0; player.crouching = false; player.breathing = false; player.breathTimer = 0; player.breathCooldown = 0; player.heat = 0; player.inHeatZone = false; player.hidden = false; player.hideTimer = 0; player.hideCompromised = false; dashCooldown = 0;
    ambienceClock = 0;
    camera.targetZoom = 1.0; camera.zoom = 1.0;
    nearGen = null; nearValve = null; nearBoiler = false; flashAlpha = 0;
    boilerShutdown = false; boilerReadyShown = false; heatZones = []; heatEventCooldown = 360;
    rhysSealCollected = false; rhysTrapArmed = false; goopZones = []; goopShots = []; rhysSpitCooldown = 180; rhysDashTimer = 0; rhysChargeWindup = 0; rhysDashCooldown = 360; rhysEventCooldown = 900; rhysSweepTimer = 0; rhysSweepRadius = 0; rhysPressureZones = [];
    forestBeaconBattery = null; forestWatchtower = null; forestBeaconActive = false; forestFogTimer = 0; forestFogCooldown = currentMapId === 'forest' ? 720 : 0; forestGuideTimer = 0; forestGuideCooldown = currentMapId === 'forest' ? 1200 : 0; forestGuideMode = 'cabins'; noahCharge = null; noahLightningCooldown = 360; noahLightningZones = []; noahLightningPending = []; noahLightningWarning = 0; noahLightningFlashes = 0; noahShockTimer = 0; noahAppearanceWindow = 0;
    amineFocus = false; amineVisibleTimer = 0; amineFlashCooldown = 90; amineTeleportCooldown = 240; amineTurret = null; amineBullets = []; amineBurnTimer = 0; amineRoad = null; nizarClones = []; nizarCloneCooldown = 2400; nizarCrush = null; nizarCrushCooldown = 900; subwayControlPuzzle = null; subwayFareCutscene = null; subwayGoldPressure = null; subwayTornTicket = null; subwayGoldSphere = null; subwayBronzeEligible = true; lucasState = 'searching'; lucasObjectiveStage = 'fragment1'; lucasAbilityCooldown = 300; lucasPoolCooldown = 0; lucasTeleportFlash = null; lucasCharge = null; lucasPull = null; lucasCarryFragment = null; lucasFragmentPuzzle = null; lucasEndingAnimation = null; lucasRouteLocks = []; lucasHazards = []; lucasGateEndTimer = 0; lucasShadowEvent = null; lucasShadowEventCooldown = 900 + Math.floor(Math.random() * 1201); lucasShadowEventTriggered = false; calebBoss = null; luckyBlocks = [];
    hotelLockdownTimer = 0; hotelEventCooldown = currentMapId === 'hotel' ? 480 : 0; hotelLockdownActive = false; hotelBlockedDoor = null;
    bassamState = 'roaming'; bassamRevealPending = false; bassamTrapTaskId = null; bassamFakeTask = null; bassamFakeLine = ''; bassamAmbushActive = false; bassamRelentlessChase = false; bassamLostTimer = 0; bassamAmbushCooldown = 900; bassamDecoys = []; bassamDecoyCooldown = 600 + Math.floor(Math.random() * 601); hotelTaskGame = null; bassamStaffDepartment = ['FRONT DESK','MAINTENANCE','HOUSEKEEPING','KITCHEN'][Math.floor(Math.random() * 4)]; closeHotelDialogue();
    document.getElementById('hotelTaskHUD').style.display = currentMapId === 'hotel' ? 'block' : 'none';
    
    const roundScale = gameMode === 'endless' ? endlessRound - 1 : 0;
    eventsEnabled = currentMapId !== 'lucas' && (gameMode !== 'survival' || survivalConfig?.events !== false);
    safeRoomsReliable = gameMode !== 'endless' || Math.random() < Math.max(0.35, 1 - roundScale * 0.14);
    let diffData = [
        { t: 10, gMin: 3, gMax: 4, mMin: 0, mMax: 1, mSpd: 2.65 },
        { t: 25, gMin: 4, gMax: 5, mMin: 1, mMax: 2, mSpd: 3.18 },
        { t: 40, gMin: 5, gMax: 6, mMin: 2, mMax: 3, mSpd: 3.65 }
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
    if (gameMode === 'challenge' && challengeConfig) {
        if (challengeConfig.id === 'blackout') { diffData.gMin++; diffData.gMax++; safeRoomsReliable = false; }
        if (challengeConfig.id === 'double') survivalConfig = { names:['CALEB','MALAKAI'], count:2, generators:diffData.gMax, mutations:0, events:true };
        if (challengeConfig.id === 'relay') { diffData.gMin++; diffData.gMax++; }
        if (challengeConfig.id === 'pressure') { diffData.mSpd += .18; }
    }
    
    rewardTokens = diffData.t + (gameMode === 'endless' ? roundScale * 8 : gameMode === 'survival' ? (survivalConfig?.count || 1) * 5 : gameMode === 'challenge' ? (challengeConfig?.reward || 0) : 0);

    let rand = Math.random();
    let monsterName = 'CALEB';
    if (currentMapId === 'lucas') {
        monsterName = 'LUCAS';
    } else if (currentMapId === 'crimson' && gameMode !== 'survival') {
        monsterName = 'RHYS';
    } else if (currentMapId === 'hotel' && gameMode !== 'survival') {
        monsterName = 'BASSAM';
    } else if (currentMapId === 'forest' && gameMode !== 'survival') {
        monsterName = 'NOAH';
    } else if (currentMapId === 'amine' && gameMode !== 'survival') {
        monsterName = 'AMINE';
    } else if (currentMapId === 'subway' && gameMode !== 'survival') {
        // Nizar owns the Last Line, but the other hunters can still appear for
        // variety. Keep him as the clear statistical favorite on this map.
        if (rand < .58) monsterName = 'NIZAR';
        else if (rand < .74) monsterName = 'CALEB';
        else if (rand < .88) monsterName = 'MALAKAI';
        else monsterName = 'AESON';
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
    // Jordan's generator-mimic loop does not belong in a no-generator rail map.
    if (currentMapId === 'subway' && monsterName === 'JORDAN') monsterName = 'NIZAR';

    const monsterTiles = floors.filter(tile => {
        const x = tile.c * TS + TS / 2, y = tile.r * TS + TS / 2;
        return !isSafeRoom(x, y) && !isReservedObjectSpot(x, y, TS * 2) && !isRhysEarlyLockedTile(tile) && (currentMapId === 'level0' || !getRoomAt(x, y)) && Math.hypot(player.x - x, player.y - y) > TS * 8;
    });
    let startTile = monsterTiles.at(-1) || floors.at(-1);
    if (currentMapId === 'lucas' && lucasMonsterStart) startTile = { c:Math.floor(lucasMonsterStart.x / TS), r:Math.floor(lucasMonsterStart.y / TS) };
    
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
    scramblerTimer = 0; repairAssist = 0; flareTimer = 0;
    powerOutageTimer = 0; outageFlickerTimer = 0; powerOutageCooldown = Math.floor(Math.random() * 600) + 900;
    flickerTimer = 0; flickerCooldown = Math.floor(Math.random() * 600) + 600;
    emergencyTimer = 0; emergencyCooldown = currentMapId === 'crimson' ? 999999 : Math.floor(Math.random() * 1200) + 1200;
    noiseTarget = null; noiseTimer = 0;
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
    } else if (monsterName === 'NOAH') {
        monster.baseSpeed += 0.10; monster.speed = monster.baseSpeed;
        monster.color = '#18242a'; monster.textColor = '#9ad7dd'; noahState = 'hidden'; noahTimer = 0; noahPathTimer = 0;
    } else if (monsterName === 'AMINE') {
        monster.baseSpeed += 0.18; monster.speed = monster.baseSpeed; monster.color = '#e8e8e8'; monster.textColor = '#fff'; monster.invisible = true;
    } else if (monsterName === 'NIZAR') {
        monster.baseSpeed += 0.14; monster.speed = monster.baseSpeed; monster.color = '#37546a'; monster.textColor = '#9cd6ff';
    } else if (monsterName === 'LUCAS') {
        monster.baseSpeed += 0.08; monster.speed = monster.baseSpeed; monster.color = '#211c32'; monster.textColor = '#c5a9ff';
    } else if (monsterName === 'CALEB') {
        empTimer = Math.floor(Math.random() * 600) + 600; 
    }

    let numMutations = currentMapId === 'lucas' ? 0 : Math.floor(Math.random() * (diffData.mMax - diffData.mMin + 1)) + diffData.mMin;
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

    const requestedCount = currentMapId === 'lucas' ? 1 : modeMonsterCount();
    const survivalNames = survivalConfig?.names || [];
    for (let i = 1; i < requestedCount; i++) {
        let name = gameMode === 'survival'
            ? survivalNames[i % survivalNames.length]
            : currentMapId === 'boilerworks'
                ? ['JORDAN', 'CALEB', 'MALAKAI'][(endlessRound + i - 1) % 3]
                : ['CALEB', 'MALAKAI', 'JORDAN'][(endlessRound + i - 1) % 3];
        if (currentMapId === 'subway' && name === 'JORDAN') name = ['NIZAR', 'CALEB', 'MALAKAI', 'AESON'][i % 4];
        monsters.push(createExtraMonster(name, diffData, i));
    }
    
    if (currentMapId === 'subway') {
        // These are signal panels, not generators. Keeping the shared counter
        // lets existing HUD/save/stat systems remain stable without presenting
        // generator gameplay on this map.
        generators = subwayPanels;
        totalGens = subwayPanels.length;
        activeGens = 0;
    } else if (currentMapId === 'lucas') {
        generators = []; totalGens = 0; activeGens = 0; fuses = [];
    } else {
    totalGens = Math.floor(Math.random() * (diffData.gMax - diffData.gMin + 1)) + diffData.gMin;
    if (currentMapId === 'hotel') totalGens = Math.max(4, Math.min(7, totalGens + 1));
    if (currentMapId === 'crimson') totalGens = Math.max(5, Math.min(7, totalGens + 1));
    if (currentMapId === 'forest') totalGens = Math.max(4, Math.min(6, totalGens));
    if (currentMapId === 'amine') totalGens = Math.max(5, Math.min(7, totalGens));
    activeGens = 0; generators = [];
    
    let genPool = floors.filter(tile => !getRoomAt(tile.c * TS + TS / 2, tile.r * TS + TS / 2) && !(currentMapId === 'crimson' && rhysRoute === 'break' && tile.c >= rhysBreakWall.c) && !isDynamicBlockedCell(tile.c, tile.r) && !amineHoles.some(h=>h.c===tile.c&&h.r===tile.r) && !amineFireZones.some(z=>Math.hypot(z.x-(tile.c*TS+TS/2),z.y-(tile.r*TS+TS/2))<z.radius+20)).sort(() => Math.random() - 0.5);
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
            if (!isRhysEarlyLockedTile(tile) && isOpenObjectSpot(tx, ty, TS)) generators.push({ x: tx, y: ty, r: 12, active: false, type: 'normal', isFalse: false, repairFlash: 0, stage: 0, requiredStages: 3, requiredFuses: 2, collectedFuses: 0 });
        }
    }

    let fuseGeneratorAssigned = false;
    let multiGeneratorAssigned = false;
    let tuneGeneratorAssigned = false;
    let rapidGeneratorAssigned = false, simonGeneratorAssigned = false;
    for (const generator of generators) {
        const roll = Math.random();
        if (!fuseGeneratorAssigned && roll < 0.12) {
            generator.type = 'fuse';
            fuseGeneratorAssigned = true;
            const fuseTiles = floors
                .filter(tile => !getRoomAt(tile.c * TS + TS / 2, tile.r * TS + TS / 2))
                .filter(tile => !amineHoles.some(hole => hole.c === tile.c && hole.r === tile.r))
                .filter(tile => isOpenObjectSpot(tile.c * TS + TS / 2, tile.r * TS + TS / 2, TS * 2) && !checkWall({ x:tile.c * TS + TS / 2, y:tile.r * TS + TS / 2, r:6 }))
                .sort(() => Math.random() - 0.5)
                .slice(0, generator.requiredFuses);
            for (const tile of fuseTiles) fuses.push({ x: tile.c * TS + TS / 2, y: tile.r * TS + TS / 2, collected: false });
        } else if (!multiGeneratorAssigned && roll < 0.30) {
            generator.type = 'multi';
            multiGeneratorAssigned = true;
        } else if (!tuneGeneratorAssigned && roll < (currentDiff === 0 ? .42 : currentDiff === 1 ? .58 : .74)) {
            generator.type = 'tune';
            tuneGeneratorAssigned = true;
        } else if (!rapidGeneratorAssigned && !isMobileClient() && roll < .82) {
            generator.type = 'rapid'; rapidGeneratorAssigned = true;
        } else if (!simonGeneratorAssigned) {
            generator.type = 'simon'; simonGeneratorAssigned = true;
        } else if (roll < 0.50 && generators.filter(other => !other.isFalse).length > 1 && generators.filter(other => other.isFalse).length < 1) {
            generator.isFalse = true;
        }
    }
    if (gameMode === 'challenge' && challengeConfig?.id === 'relay') {
        generators.filter(generator => !generator.isFalse).forEach(generator => { generator.type = 'multi'; generator.requiredStages = 2 + currentDiff; });
    }
    // Decoys never count toward the power objective.
    totalGens = generators.filter(generator => !generator.isFalse).length;
    }
    setupForestBeacon();
    spawnGroundLoot();
    if (currentMapId !== 'lucas') spawnLuckyBlocks();
    const storageRoom = rooms.find(room => room.type === 'storage');
    if (storageRoom && !generators.some(generator => generator.x === storageRoom.x && generator.y === storageRoom.y)) {
        hidingSpots.push({ x: storageRoom.x, y: storageRoom.y, occupied: false });
    }
    spawnSubwaySecrets(monster.name === 'NIZAR');
    
    stats.encounters[monster.name] = (stats.encounters[monster.name] || 0) + 1;
    stats.favoriteMonster = Object.entries(stats.encounters).sort((a,b) => b[1] - a[1])[0]?.[0] || 'None';
    canvas.classList.remove('shake');
    state = 1; updateHUD(); renderHotelTasks();
    if (startAtBoss && currentMapId === 'lucas') {
        beginCalebBossIntro();
        return;
    }
    if (monsterName === 'RHYS' && currentMapId === 'crimson') showStoryLine('“Dread it, run from it, destiny arrives all at the same time.”', 4600);
}

function unlockCosmetic(id) {
    if (!cosmetics.unlocked.includes(id)) {
        cosmetics.unlocked.push(id);
        notify(`UNLOCKED: ${id.toUpperCase()}`, 'unlock');
        saveData();
    }
}

function endGame(isWin, sourceMonster = monster) {
    if (state === 4 || (gameMode === 'endless' && state === 0)) return;
    if (isWin && !crimsonObjectiveComplete()) {
        showMsg('RESTORE ALL GENERATORS, RECOVER THE SEAL, AND ARM THE TRAP', 1400);
        return;
    }
    if (isWin && currentMapId === 'forest') advanceDailyObjective('forest');
    if (isWin && currentMapId === 'boilerworks' && currentDiff === 2) stats.boilerworksHardStreak = Math.min(3, stats.boilerworksHardStreak + 1);
    else if (!isWin || currentMapId !== 'boilerworks') stats.boilerworksHardStreak = 0;
    if (stats.boilerworksHardStreak >= 3) unlockCosmetic('spongeMask');
    if (isWin && gameMode === 'endless') {
        const endlessMultiplier = 1 + Math.min(1.5, Math.max(0, endlessRound - 1) * 0.15);
        const earned = Math.floor(rewardTokens * (upgCoin > 0 ? 1.5 : 1) * endlessMultiplier);
        tokens += earned;
        stats.wins++; stats.caught++; stats.bestEndless = Math.max(stats.bestEndless, endlessRound);
        stats.endlessMapBest[currentMapId] = Math.max(stats.endlessMapBest[currentMapId] || 0, endlessRound);
        if (runItemsUsed === 0) stats.itemFreeWins++;
        if (endlessRound >= 3) unlockCosmetic('bronzeSkin');
        if (endlessRound >= 6) unlockCosmetic('silverSkin');
        if (endlessRound >= 9) unlockCosmetic('goldSkin');
        if (endlessRound >= 3) unlockCosmetic('spark');
        if (endlessRound >= 9) unlockCosmetic('smileMask');
        if (sourceMonster.name === 'BASSAM' && currentMapId === 'hotel' && bassamRelentlessChase) unlockCosmetic('krustyHat');
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
    document.getElementById('mapTaskHUD').style.display = 'none';
    document.getElementById('mapTaskHUD').style.top = '';
    hud.classList.remove('rhys-objective-hud');
    document.getElementById('mapTaskHUD').style.display = 'none';
    closeHotelDialogue(); document.getElementById('hotelTaskHUD').style.display = 'none';
    document.getElementById('endMenu').style.display = 'flex';
    amineFocus=false;
    document.getElementById('endTitle').innerText = isWin ? "YOU WIN!" : "CAUGHT!";
    document.getElementById('endTitle').style.color = isWin ? "#0f0" : "#f00";
    
    if (isWin) {
        const endlessMultiplier = gameMode === 'endless' ? 1 + Math.min(1.5, Math.max(0, endlessRound - 1) * 0.15) : 1;
        let earned = Math.floor(rewardTokens * (upgCoin > 0 ? 1.5 : 1) * endlessMultiplier);
        tokens += earned;
        stats.wins++; stats.caught++;
        if (runItemsUsed === 0) stats.itemFreeWins++;
        stats.mostGenerators = Math.max(stats.mostGenerators, totalGens);
        const elapsed = performance.now() - runStartedAt;
        if (!stats.fastestWin || elapsed < stats.fastestWin) stats.fastestWin = elapsed;
        if (elapsed < 120000) unlockCosmetic('amber');
        if (elapsed < 60000) unlockCosmetic('afterimage');
        if (currentDiff === 2) unlockCosmetic('crimson');
        if (sourceMonster.name === 'MALAKAI') unlockCosmetic('violet');
        if (sourceMonster.name === 'JORDAN') { unlockCosmetic('green'); if (cosmetics.color === 'green') unlockCosmetic('jordanMask'); }
        if (runItemsUsed === 0) unlockCosmetic('ghost');
        advanceDailyObjective('wins');
        if (sourceMonster.name === 'AESON') advanceDailyObjective('aeson');
        if (sourceMonster.name === 'RHYS') { unlockCosmetic('gold'); unlockCosmetic('ember'); }
        if (sourceMonster.name === 'AMINE') { unlockCosmetic('white'); unlockCosmetic('circle'); }
        if (sourceMonster.name === 'NOAH') { advanceDailyObjective('noah'); if (currentMapId === 'forest') unlockCosmetic('noahCap'); }
        if (sourceMonster.name === 'CALEB') { unlockCosmetic('sepia'); unlockCosmetic('static'); }
        if (sourceMonster.name === 'BASSAM' && currentMapId === 'hotel' && bassamRelentlessChase) unlockCosmetic('krustyHat');
        if (gameMode === 'challenge') { stats.challengesCleared++; advanceDailyObjective('challenge'); if (runItemsUsed === 0) unlockCosmetic('cowboyHat'); }
        if (!mapMastery[currentMapId]) mapMastery[currentMapId] = [false, false, false];
        mapMastery[currentMapId][currentDiff] = true;
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
        const progressLabel = currentMapId === 'subway' ? `${activeGens}/${totalGens} signal panels` : currentMapId === 'lucas' && sourceMonster.name === 'CALEB' ? 'CALEB, CAL, AND LEB DEFEATED' : currentMapId === 'lucas' ? `${lucasFragments.filter(fragment => fragment.collected).length}/${lucasFragments.length || 3} Caleb fragments` : `${activeGens}/${totalGens} generators`;
        const victoryText = currentMapId === 'lucas' && sourceMonster.name === 'CALEB' ? 'THE BROKEN BODY HAS BEEN DEFEATED.' : currentMapId === 'lucas' ? 'THE SHADOW DRAGGED LUCAS INTO THE GATE.' : `You caught ${sourceMonster.name}.`;
        document.getElementById('endDesc').innerHTML = `${victoryText}<br>${(elapsed / 1000).toFixed(1)}s · ${progressLabel} · ${runItemsUsed} items used<br>+${earned} Tokens${gameMode === 'endless' ? ` · x${endlessMultiplier.toFixed(2)} Endless` : ''}`;
    } else {
        stats.losses++; stats.timesCaught++;
        saveData();
        playSound('fail');
        const endlessResult = gameMode === 'endless' ? `<br>Endless Round ${endlessRound} · ${endlessRound === 1 ? 'No tokens earned.' : 'Tokens from cleared rounds were banked.'}` : '';
        document.getElementById('endDesc').innerHTML = `${sourceMonster.name} tore you apart.${endlessResult}`;
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
    if (currentMapId === 'lucas') return;
    if (activeGens >= totalGens) {
        if (currentMapId === 'subway') {
            notify('SIGNALS RESTORED · FIND THE RAIL CONTROL ROOM', 'unlock');
            return;
        }
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
            if (monster.name !== 'BASSAM') { beginFinalChase(); return; }
            if (reportedHotelEmployees().length < hotelEmployeesRequired) showMsg(`<span style="color:#d4c09a">GENERATORS ONLINE</span><br>REPORT ${hotelEmployeesRequired - reportedHotelEmployees().length} EMPLOYEE(S)`, 1300);
            else if (evacuatedHotelEmployees().length < hotelEmployeesRequired) { notify('THE ELEVATOR IS READY FOR STAFF', 'unlock'); showMsg(`<span style="color:#d4c09a">ELEVATOR POWERED</span><br>EVACUATE ${hotelEmployeesRequired - evacuatedHotelEmployees().length} EMPLOYEE(S)`, 1500); }
            else beginFinalChase();
            return;
        }
        if (currentMapId === 'crimson') {
            if (monster.name !== 'RHYS') { beginFinalChase(); return; }
            showMsg('<span style="color:#ffe878">GENERATORS ONLINE</span><br>LOCATE THE CRIMSON SEAL', 1400); return;
        }
        if (currentMapId === 'forest') {
            if (!forestBreakers.every(breaker => breaker.active)) { notify(`RESTORE ${forestBreakers.filter(breaker => !breaker.active).length} DARK CABIN BREAKER(S)`, 'warning'); return; }
            if (!forestBeaconBattery?.collected) { notify('RECOVER THE RANGER BEACON BATTERY', 'warning'); return; }
            if (!forestBeaconActive) { notify('INSTALL THE BATTERY AT THE WATCHTOWER', 'warning'); return; }
            beginFinalChase(); return;
        }
        if(currentMapId==='amine'){notify('POWER RESTORED · FIND THE EXIT GATE','unlock');return;}
        beginFinalChase();
    }
}

function showMsg(text, time = 0) {
    // Routine gameplay information uses the unobtrusive notification stack.
    // Generator puzzles and end screens use their own dedicated UI instead.
    const plain = String(text).replace(/<br\s*\/?>/gi, ' · ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    notify(plain, /CAUGHT|FAILED|NOT A GENERATOR|FOUND YOU|BRACING|CHARGES|OUTAGE|LOCKDOWN/i.test(plain) ? 'danger' : /ONLINE|RESTORED|READY|COMPLETE|UNLOCKED/i.test(plain) ? 'unlock' : 'info', time || 1800);
}
function showStoryLine(text, duration = 2600) {
    const line = document.getElementById('storyLine');
    if (!line) return;
    line.textContent = text; line.style.display = 'block';
    clearTimeout(showStoryLine.timer);
    showStoryLine.timer = setTimeout(() => { line.style.display = 'none'; }, duration);
}
function hideMsg() { msgBox.style.display = 'none'; msgBox.classList.remove('top-alert'); }

function notify(text, tone = 'info', duration = 2600) {
    // The compact mobile HUD already carries the objective state; the desktop
    // notification stack otherwise covers the whole play area on phones.
    if (isMobileClient()) return;
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

function toggleHUDCollapsed() {
    hud.classList.toggle('collapsed');
    document.getElementById('hudCollapse').textContent = hud.classList.contains('collapsed') ? '›' : '‹';
}
function toggleMapOverlay() {
    if (!mapIntel.includes(currentMapId)) { notify('BUY THIS MAP\'S INTEL AFTER CLEARING ALL THREE DIFFICULTIES', 'warning'); return; }
    const overlay = document.getElementById('mapOverlay'); const opening = overlay.style.display === 'none'; overlay.style.display = opening ? 'flex' : 'none';
    if (!opening) return;
    const mapCtx = document.getElementById('mapCanvas').getContext('2d'), scale = Math.min(640 / COLS, 440 / ROWS);
    mapCtx.fillStyle = '#060706'; mapCtx.fillRect(0, 0, 640, 440);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (map[r][c] === 0) { mapCtx.fillStyle = '#777'; mapCtx.fillRect(c * scale, r * scale, Math.ceil(scale), Math.ceil(scale)); }
    const zoneColors = { lobby:'#d9b36c', guest:'#ae80bd', laundry:'#64c7db', conference:'#d9a857', kitchen:'#da7551', service:'#67ad82', office:'#9982c4', elevator:'#eee', storage:'#aaa', boiler:'#ff682d', cooling:'#5bd7ee', maintenance:'#e0c558', containment:'#e74343', vault:'#c95a8c', trap:'#f0c96b' };
    rooms.forEach(room => { const width = room.width || 3, height = room.height || 3, x = (room.c - Math.floor(width / 2)) * scale, y = (room.r - Math.floor(height / 2)) * scale; mapCtx.fillStyle = `${zoneColors[room.type] || '#8aa'}88`; mapCtx.fillRect(x, y, width * scale, height * scale); if (currentMapId === 'hotel' && scale > 5) { mapCtx.fillStyle='#fff'; mapCtx.font='8px Arial'; mapCtx.textAlign='center'; mapCtx.fillText(room.type.toUpperCase(), (room.c + .5) * scale, room.r * scale); } });
    if (currentMapId === 'amine') {
        amineFireZones.forEach(zone => { mapCtx.fillStyle = '#ff671f99'; mapCtx.beginPath(); mapCtx.arc(zone.x / TS * scale, zone.y / TS * scale, zone.radius / TS * scale, 0, Math.PI * 2); mapCtx.fill(); });
        amineHoles.forEach(hole => { mapCtx.fillStyle = '#000'; mapCtx.fillRect(hole.c * scale, hole.r * scale, Math.ceil(scale), Math.ceil(scale)); });
        if (amineExitGate) { mapCtx.fillStyle = activeGens >= totalGens ? '#7dffdc' : '#566a65'; mapCtx.fillRect(amineExitGate.x / TS * scale - 3, amineExitGate.y / TS * scale - 5, 6, 10); }
    }
    if (currentMapId === 'subway') {
        subwayTrackSegments.forEach(segment => { mapCtx.strokeStyle = segment.active ? '#c4a767' : '#7a6846'; mapCtx.lineWidth = Math.max(2, scale); mapCtx.beginPath(); mapCtx.moveTo((segment.x1+.5)*scale,(segment.y1+.5)*scale); mapCtx.lineTo((segment.x2+.5)*scale,(segment.y2+.5)*scale); mapCtx.stroke(); });
        subwayPanels.forEach(panel => { mapCtx.fillStyle = panel.active ? '#4f4' : '#e3b44d'; mapCtx.fillRect(panel.x / TS * scale - 2, panel.y / TS * scale - 2, 4, 4); });
        if (subwayControl) { mapCtx.fillStyle = subwayTrapArmed ? '#f55' : '#7ec8e3'; mapCtx.fillRect(subwayControl.x / TS * scale - 3, subwayControl.y / TS * scale - 3, 6, 6); }
    }
    generators.forEach(generator => { mapCtx.fillStyle = generator.active ? '#4f4' : '#fc5'; mapCtx.fillRect(generator.x / TS * scale - 2, generator.y / TS * scale - 2, 4, 4); });
    mapCtx.fillStyle = '#4cf'; mapCtx.beginPath(); mapCtx.arc(player.x / TS * scale, player.y / TS * scale, 4, 0, Math.PI * 2); mapCtx.fill();
}

function drawHotelTaskArrows() {
    if (currentMapId !== 'hotel' || state !== 1) return;
    const tasks = [...employees.map(employee => ({ employee, task:employee.task })), ...(bassamFakeTask ? [{ employee:null, task:bassamFakeTask }] : [])].filter(entry => entry.task && ['accepted','readyToReport'].includes(entry.task.status));
    tasks.slice(0, 2).forEach(({ employee, task }, index) => {
        const target = task.status === 'readyToReport' && employee ? employee : task;
        const sx = (target.x - camera.x) * camera.zoom, sy = (target.y - camera.y) * camera.zoom;
        if (sx > 36 && sx < canvas.width - 36 && sy > 36 && sy < canvas.height - 36) return;
        const angle = Math.atan2(sy - canvas.height / 2, sx - canvas.width / 2), radius = Math.min(canvas.width, canvas.height) * .40 - index * 24;
        const x = canvas.width / 2 + Math.cos(angle) * radius, y = canvas.height / 2 + Math.sin(angle) * radius;
        ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.fillStyle = task.fake ? '#ff8b8b' : '#eadbbd'; ctx.beginPath(); ctx.moveTo(13,0); ctx.lineTo(-9,-8); ctx.lineTo(-9,8); ctx.closePath(); ctx.fill(); ctx.restore();
    });
}

function drawForestGuidanceArrows() {
    if (currentMapId !== 'forest' || state !== 1 || forestGuideTimer <= 0) return;
    const targets = forestGuideMode === 'cabins'
        ? forestBreakers.filter(breaker => !breaker.active).map((breaker, index) => ({ x:breaker.cabin.x, y:breaker.cabin.y, label:`CABIN ${index + 1}` }))
        : forestWatchtower ? [{ x:forestWatchtower.x, y:forestWatchtower.y, label:'WATCHTOWER' }] : [];
    const worldToScreen = (x, y) => [(x - camera.x) * camera.zoom, (y - camera.y) * camera.zoom];
    const centerX = canvas.width / 2, centerY = canvas.height / 2;
    targets.forEach((target, index) => {
        let [sx, sy] = worldToScreen(target.x, target.y);
        const onScreen = sx > 34 && sx < canvas.width - 34 && sy > 34 && sy < canvas.height - 34;
        const angle = Math.atan2(sy - centerY, sx - centerX);
        if (!onScreen) {
            const radius = Math.min(canvas.width, canvas.height) * .40 - index * 22;
            sx = centerX + Math.cos(angle) * radius;
            sy = centerY + Math.sin(angle) * radius;
        } else {
            sy -= 22;
        }
        sx = Math.max(32, Math.min(canvas.width - 32, sx));
        sy = Math.max(30, Math.min(canvas.height - 30, sy));
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(angle);
        ctx.fillStyle = forestGuideMode === 'cabins' ? '#ffe36b' : '#9fffc0';
        ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-10, -10); ctx.lineTo(-10, 10); ctx.closePath(); ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#fff4bd'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; ctx.fillText(target.label, sx, sy + 23);
    });
}

function drawSubwayGoldGuidanceArrow() {
    const target = subwayGoldPressure?.signalPanel;
    if (currentMapId !== 'subway' || state !== 1 || !subwayGoldPressure?.active || !target) return;
    const sx = canvas.width / 2 + (target.x - camera.x - canvas.width / 2) * camera.zoom;
    const sy = canvas.height / 2 + (target.y - camera.y - canvas.height / 2) * camera.zoom;
    const centerX = canvas.width / 2, centerY = canvas.height / 2;
    const angle = Math.atan2(sy - centerY, sx - centerX);
    const onScreen = sx > 38 && sx < canvas.width - 38 && sy > 38 && sy < canvas.height - 38;
    const radius = Math.min(canvas.width, canvas.height) * .40;
    const x = onScreen ? sx : centerX + Math.cos(angle) * radius;
    const y = onScreen ? Math.max(36, sy - 30) : centerY + Math.sin(angle) * radius;
    ctx.save(); ctx.translate(x, y); ctx.rotate(onScreen ? 0 : angle);
    ctx.fillStyle = '#ffe36b'; ctx.shadowColor = '#ffb52e'; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.moveTo(17, 0); ctx.lineTo(-10, -10); ctx.lineTo(-10, 10); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#fff2ae'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; ctx.fillText(`FLICKERING SIGNAL · ${subwayGoldPressure.signalTimerPaused ? 'TIMER PAUSED' : `${Math.ceil(subwayGoldPressure.signalTimer / 60)}s`}`, x, y + 24);
}

function updateHUD() {
    const shownGens = hallucinationHudTimer > 0 ? `${Math.max(0, activeGens + (ambienceClock % 2 ? 1 : -1))}/${totalGens}` : `${activeGens}/${totalGens}`;
    const lucasFragmentCount = lucasFragments.filter(fragment => fragment.collected).length;
    if (currentMapId === 'lucas') document.getElementById('genCount').innerText = `Fragments: ${lucasFragmentCount}/${lucasFragments.length || 3}`;
    document.getElementById('genCount').innerText = currentMapId === 'subway' ? `Signals: ${activeGens}/${totalGens}` : (monsters.some(enemy => enemy.hasScrambler) ? "?/?" : shownGens);
    const objective = document.getElementById('mapObjective');
    if (currentMapId === 'lucas') document.getElementById('genCount').innerText = `Fragments: ${lucasFragmentCount}/${lucasFragments.length || 3}`;
    if (objective) {
        const objectiveGens = monsters.some(enemy => enemy.hasScrambler) ? '?/?' : `${activeGens}/${totalGens}`;
        const falseObjective = monster.hasFalseObjective && Math.floor(ambienceClock / 180) % 2 === 1;
        objective.textContent = falseObjective
            ? 'Objective signal corrupted · CHECK THE LANDMARKS'
            : currentMapId === 'subway'
                ? (subwayGoldStatusText() || `Last Line: ${activeGens}/${totalGens} signal panels · ${!subwayObjectiveComplete() ? 'RESTORE THE ROUTE' : 'USE RAIL CONTROL TO INTERCEPT THE HUNTER'}`)
            : currentMapId === 'boilerworks'
                ? `Cooling valves: ${coolingValves.filter(valve => valve.active).length}/${coolingValves.length || 3}${boilerReadyShown ? ' · FIND THE BOILER' : ''}`
                : currentMapId === 'hotel'
                    ? `Hotel: ${objectiveGens} generators · Staff ${evacuatedHotelEmployees().length}/${hotelEmployeesRequired} evacuated${hotelObjectiveComplete() ? ' · CATCH BASSAM' : ''}`
                    : currentMapId === 'crimson'
                        ? `Containment: ${objectiveGens} generators · ${monster.name !== 'RHYS' ? (activeGens >= totalGens ? `CATCH ${monster.name}` : 'Restore facility power') : activeGens < totalGens ? 'Restore facility power' : !rhysSealCollected ? rhysRoute === 'break' && !rhysBreakWall?.broken ? 'Bait Rhys into the cracked wall' : rhysRoute === 'chest' && !rhysChestKey?.collected ? 'Find the chest key' : rhysRoute === 'chest' && !rhysChest?.opened ? 'Open the Crimson Chest' : 'Recover the Crimson Seal' : !rhysTrapArmed ? 'Arm the containment trap' : 'Lure Rhys into containment'}`
                    : currentMapId === 'forest'
                        ? `Forest: ${objectiveGens} generators · ${forestBreakers.filter(breaker => breaker.active).length}/${forestBreakers.length} cabin breakers${forestObjectiveComplete() ? ` · CATCH ${monster.name}` : activeGens < totalGens ? ' · REPAIR GENERATORS FIRST' : !forestBreakers.every(breaker => breaker.active) ? ' · RESTORE DARK CABINS' : !forestBeaconBattery?.collected ? ' · RECOVER RANGER BATTERY' : ' · INSTALL AT WATCHTOWER'}`
            : currentMapId === 'amine'
                        ? `Parted Grid: ${objectiveGens} generators · ${activeGens>=totalGens?'FIND EXIT GATE':'RESTORE POWER'} · HOLD V / FOCUS TO SEE AMINE`
                    : 'Find and repair every generator';
        if (currentMapId === 'lucas') {
            const leverCount = lucasLevers.filter(lever => lever.active).length;
            objective.textContent = lucasState === 'runningToGate' || lucasState === 'blocking' || lucasState === 'dragging'
                ? 'Shadow Gate: LUCAS IS BLOCKING THE EXIT'
                : lucasObjectiveStage === 'fragment1'
                    ? 'Shadow Gate: FIND THE FIRST CALEB FRAGMENT'
                    : lucasObjectiveStage === 'levers'
                        ? `Shadow Gate: ACTIVATE SHADOW RELAYS · ${leverCount}/${lucasLevers.length}`
                        : lucasObjectiveStage === 'fragment2'
                            ? 'Shadow Gate: RECOVER THE RELEASED SERVICE FRAGMENT'
                            : lucasObjectiveStage === 'fragment3'
                                ? 'Shadow Gate: FIND THE UNDERPASS FRAGMENT'
                                : lucasObjectiveStage === 'place'
                                    ? 'Shadow Gate: CARRY THE LAST FRAGMENT TO THE CALEB VESSEL'
                                    : 'Shadow Gate: REACH THE SEALED EXIT';
        }
    }
    
    let invText = [];
    const carriedCount = runLoadoutRemaining ? Object.values(runLoadoutRemaining).reduce((sum, amount) => sum + amount, 0) : invAdrenaline + invFlashbang + invNoiseMaker + invBearTrap + invBattery + invBreathFilter + invSignalScrambler + invNeutralizer + invRepairKit + invFlare;
    invText.push(`SUPPLIES: ${carriedCount}/8`);
    if (itemAllowed('adrenaline') && invAdrenaline > 0) invText.push(`Adrenaline: ${invAdrenaline} (SPACE)`);
    if (itemAllowed('flashbang') && invFlashbang > 0) invText.push(`Flashbang: ${invFlashbang} (F)`);
    if (itemAllowed('noiseMaker') && invNoiseMaker > 0) invText.push(`Noise: ${invNoiseMaker} (N)`);
    if (itemAllowed('bearTrap') && invBearTrap > 0) invText.push(`Trap: ${invBearTrap} (T)`);
    if (itemAllowed('battery') && invBattery > 0) invText.push(`Battery: ${invBattery} (R)`);
    if (itemAllowed('breathFilter') && invBreathFilter > 0) invText.push(`Filter: ${invBreathFilter}`);
    if (itemAllowed('signalScrambler') && invSignalScrambler > 0) invText.push(`Scrambler: ${invSignalScrambler} (X)${scramblerTimer > 0 ? ' ACTIVE' : ''}`);
    if (itemAllowed('neutralizer') && invNeutralizer > 0) invText.push(`Neutralizer: ${invNeutralizer} (G)`);
    if (itemAllowed('repairKit') && invRepairKit > 0) invText.push(`Repair Kit: ${invRepairKit} (K)${repairAssist ? ' READY' : ''}`);
    if (itemAllowed('flare') && invFlare > 0) invText.push(`Flare: ${invFlare} (L)${flareTimer > 0 ? ' LIT' : ''}`);
    if (player.heat > 0) invText.push(`HEAT: ${Math.round(player.heat / 3)}/100`);
    if (player.crouching) invText.push('CROUCHING');
    if (player.breathing) invText.push(`BREATH: ${Math.ceil(player.breathTimer / 60)}s`);
    if (fuses.some(fuse => !fuse.collected)) invText.push(`Fuses: ${fuses.filter(fuse => !fuse.collected).length}`);
    if (currentMapId === 'subway' && subwayTornTicket?.collected && !subwayTornTicket.delivered) invText.push('TORN TICKET: CARRY TO CONTROL');
    if (currentMapId === 'subway' && subwayGoldSphere?.collected) invText.push('GOLD FARE SPHERE: RECOVERED');
    if (currentMapId === 'lucas' && lucasFragmentCount > 0) invText.push(`CALEB FRAGMENTS: ${lucasFragmentCount}/${lucasFragments.length || 3}`);
    if (currentMapId === 'lucas' && lucasCarryFragment) invText.push('CARRYING LAST FRAGMENT · MOVEMENT SLOWED');
    if (player.hidden) invText.push(`HIDDEN: ${Math.ceil(player.hideTimer / 60)}s`);
    if (upgDash) invText.push(`Dash: ${dashCooldown > 0 ? `${Math.ceil(dashCooldown / 60)}s` : 'READY'} (LEFT SHIFT)`);
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

function resolveNizarFrameCollision(ent, previousX = ent.x) {
    if (ent !== player || !nizarCrush || state !== 1 || player.hidden) return;
    const blocks = [nizarCrush.left, nizarCrush.right];
    for (const block of blocks) {
        if (Math.abs(player.y - block.y) >= block.height / 2 + player.r) continue;
        const left = block.x - block.width / 2, right = block.x + block.width / 2;
        if (player.x + player.r <= left || player.x - player.r >= right) continue;
        if (previousX <= left) player.x = left - player.r - 2;
        else if (previousX >= right) player.x = right + player.r + 2;
        else player.x = Math.abs(player.x - left) < Math.abs(right - player.x) ? left - player.r - 2 : right + player.r + 2;
    }
}

function moveEntity(ent, dx, dy) {
    const previousX = ent.x;
    ent.x += dx; if (checkWall(ent)) ent.x -= dx;
    resolveNizarFrameCollision(ent, previousX);
    ent.y += dy; if (checkWall(ent)) ent.y -= dy;
    resolveNizarFrameCollision(ent, ent.x);
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

function pickMonsterWanderTile(enemy = monster) {
    const protectedPlayer = isSafeRoom(player.x, player.y);
    const candidates = floors.filter(tile => {
        const x = tile.c * TS + TS / 2, y = tile.r * TS + TS / 2;
        if (isProtectedRoom(x, y)) return false;
        if (protectedPlayer && Math.hypot(player.x - x, player.y - y) < TS * 5) return false;
        return monsters.every(other => other === enemy || Math.hypot(other.x - x, other.y - y) > TS * 2);
    });
    const fallback = floors.filter(tile => !isProtectedRoom(tile.c * TS + TS / 2, tile.r * TS + TS / 2));
    return (candidates.length ? candidates : fallback)[Math.floor(Math.random() * Math.max(1, candidates.length ? candidates.length : fallback.length))] || floors[0];
}

function clearProtectedPlayerTarget(enemy) {
    if (!isSafeRoom(player.x, player.y)) return;
    const playerC = Math.floor(player.x / TS), playerR = Math.floor(player.y / TS);
    const pathEnd = enemy.path.at(-1);
    if ((enemy.lastTargetC === playerC && enemy.lastTargetR === playerR) || (pathEnd?.c === playerC && pathEnd?.r === playerR)) {
        enemy.path = [];
        enemy.lastTargetC = -1;
        enemy.lastTargetR = -1;
    }
}

function moveMonsterAwayFromCrowd(spd, enemy) {
    const nearby = monsters
        .filter(other => other !== enemy)
        .map(other => ({ other, distance: Math.hypot(enemy.x - other.x, enemy.y - other.y) }))
        .filter(entry => entry.distance < 54)
        .sort((a, b) => a.distance - b.distance)[0];
    if (!nearby) return false;
    const distance = nearby.distance;
    const angle = distance > .01
        ? Math.atan2(enemy.y - nearby.other.y, enemy.x - nearby.other.x)
        : (monsters.indexOf(enemy) % 2 ? Math.PI / 2 : -Math.PI / 2);
    const directions = [angle, angle + Math.PI / 2, angle - Math.PI / 2];
    for (const direction of directions) {
        const oldX = enemy.x, oldY = enemy.y;
        moveEntity(enemy, Math.cos(direction) * Math.min(spd, 2.4), Math.sin(direction) * Math.min(spd, 2.4));
        if (isProtectedRoom(enemy.x, enemy.y) || Math.hypot(enemy.x - oldX, enemy.y - oldY) < .2) {
            enemy.x = oldX; enemy.y = oldY;
            continue;
        }
        enemy.path = [];
        enemy.lastTargetC = -1;
        enemy.lastTargetR = -1;
        return true;
    }
    enemy.path = [];
    enemy.lastTargetC = -1;
    enemy.lastTargetR = -1;
    return false;
}

function moveMonsterAlongPath(spd, enemy = monster) {
    if (moveMonsterAwayFromCrowd(spd, enemy)) return;
    if (enemy.path.length > 0) {
        const oldX = enemy.x, oldY = enemy.y;
        let target = enemy.path[0], tx = target.c * TS + TS/2, ty = target.r * TS + TS/2;
        if (Math.hypot(tx - enemy.x, ty - enemy.y) < spd) {
            enemy.x = tx; enemy.y = ty; enemy.path.shift();
        } else {
            let ang = Math.atan2(ty - enemy.y, tx - enemy.x);
            moveEntity(enemy, Math.cos(ang) * spd, Math.sin(ang) * spd);
        }
        if (monsters.includes(enemy) && isProtectedRoom(enemy.x, enemy.y)) {
            enemy.x = oldX; enemy.y = oldY; enemy.path = [];
        }
    }
}

function getMonsterSpeed(enemy = monster) {
    return enemy.speed * (player.crouching ? 0.55 : 1);
}

function dropLucasCarryFragment() {
    if (!lucasCarryFragment) return;
    lucasCarryFragment.collected = false;
    lucasCarryFragment.carried = false;
    lucasCarryFragment.available = true;
    lucasCarryFragment.x = player.x;
    lucasCarryFragment.y = player.y;
    lucasCarryFragment = null;
    lucasObjectiveStage = 'fragment3';
    notify('LUCAS KNOCKS THE FRAGMENT LOOSE · RECOVER IT AGAIN', 'warning');
    updateHUD();
}

function activateLucasRouteLock() {
    const choices = lucasLockSpots.filter(spot => {
        const x = spot.c * TS + TS / 2, y = spot.r * TS + TS / 2;
        return Math.hypot(player.x - x, player.y - y) > TS * 5 && Math.hypot(monster.x - x, monster.y - y) > TS * 2 && !isReservedObjectSpot(x, y, TS * 1.5);
    });
    const spot = choices[Math.floor(Math.random() * Math.max(1, choices.length))];
    if (!spot) return false;
    lucasRouteLocks.push({ life:300, cells:[{ c:spot.c, r:spot.r }] });
    notify('LUCAS SEALS A ROUTE · FIND ANOTHER WAY', 'danger');
    return true;
}

function spawnLucasArrowBarrage() {
    const angle = Math.atan2(player.y - monster.y, player.x - monster.x);
    for (let index = -2; index <= 2; index++) {
        const spread = angle + index * .16;
        lucasHazards.push({ type:'arrow', x:monster.x, y:monster.y, vx:Math.cos(spread) * 5.1, vy:Math.sin(spread) * 5.1, life:115, r:7, radius:9 });
    }
    notify('LUCAS OPENS A SHADOW LANE', 'danger');
}

function teleportLucasToPlayerShadow() {
    // Give the player a real opening before Lucas can use the shadow shortcut.
    // This also prevents a shadow pool in the starting area from feeling like
    // an immediate ambush.
    if (currentMapId !== 'lucas' || !monster || player.hidden || ambienceClock < 600) return false;
    const minDistance = TS * 6;
    const maxDistance = TS * 13;
    const playerRoom = getRoomAt(player.x, player.y);
    const isValidTile = (tile, requireDifferentRoom) => {
        const x = tile.c * TS + TS / 2, y = tile.r * TS + TS / 2;
        const distance = Math.hypot(player.x - x, player.y - y);
        const targetRoom = getRoomAt(x, y);
        const differentRoom = playerRoom ? targetRoom && targetRoom !== playerRoom : targetRoom;
        return distance >= minDistance && distance <= maxDistance
            && (!requireDifferentRoom || differentRoom)
            && !isSafeRoom(x, y) && !isReservedObjectSpot(x, y, TS * 1.25) && !isDynamicBlockedCell(tile.c, tile.r);
    };
    // Prefer a genuinely different room. The fallback still keeps the larger
    // distance when the player is in a corridor or the map has a tight layout.
    const choices = floors.filter(tile => isValidTile(tile, true));
    const fallbackChoices = choices.length ? choices : floors.filter(tile => isValidTile(tile, false));
    const tile = fallbackChoices[Math.floor(Math.random() * Math.max(1, fallbackChoices.length))];
    if (!tile) return false;
    monster.x = tile.c * TS + TS / 2;
    monster.y = tile.r * TS + TS / 2;
    monster.path = [];
    monster.lastTargetC = -1;
    monster.lastTargetR = -1;
    lucasTeleportFlash = { x:monster.x, y:monster.y, life:54 };
    lucasPoolCooldown = 240;
    monster.stunTimer = Math.max(monster.stunTimer || 0, 18);
    notify('LUCAS EMERGES FROM A DISTANT SHADOW', 'danger');
    return true;
}

function updateLucasHazards() {
    if (currentMapId !== 'lucas' || state !== 1) return;
    if (lucasTeleportFlash?.life > 0) lucasTeleportFlash.life--;
    if (lucasTeleportFlash && lucasTeleportFlash.life <= 0) lucasTeleportFlash = null;
    for (const lock of lucasRouteLocks) lock.life--;
    lucasRouteLocks = lucasRouteLocks.filter(lock => lock.life > 0);
    for (const hazard of lucasHazards) {
        hazard.life--;
        const oldX = hazard.x, oldY = hazard.y;
        moveEntity(hazard, hazard.vx, hazard.vy);
        if (Math.hypot(hazard.x - oldX, hazard.y - oldY) < .2) hazard.life = 0;
        if (!player.hidden && Math.hypot(player.x - hazard.x, player.y - hazard.y) < player.r + hazard.radius) {
            player.stunTimer = Math.max(player.stunTimer, 42);
            if (lucasCarryFragment) dropLucasCarryFragment();
            hazard.life = 0;
        }
    }
    lucasHazards = lucasHazards.filter(hazard => hazard.life > 0);
    if (lucasPull) {
        lucasPull.life--;
        if (!player.hidden && lucasPull.life > 0) {
            const angle = Math.atan2(monster.y - player.y, monster.x - player.x);
            moveEntity(player, Math.cos(angle) * 2.7, Math.sin(angle) * 2.7);
        }
        if (lucasPull.life <= 0) lucasPull = null;
    }
}

function updateLucasMonster() {
    if (currentMapId !== 'lucas' || !monster || monster.name !== 'LUCAS') return false;
    if (lucasState === 'dragging') return true;
    const canSeePlayer = !player.hidden && getLineOfSight(monster.x, monster.y, player.x, player.y);
    if (lucasState === 'runningToGate') {
        const targetC = Math.floor(lucasGate.blockX / TS), targetR = Math.floor(lucasGate.blockY / TS);
        if (monster.lastTargetC !== targetC || monster.lastTargetR !== targetR || monster.path.length === 0) {
            monster.path = findPath(Math.floor(monster.x / TS), Math.floor(monster.y / TS), targetC, targetR);
            monster.lastTargetC = targetC; monster.lastTargetR = targetR;
        }
        moveMonsterAlongPath(getMonsterSpeed(monster) * 1.18, monster);
        if (Math.hypot(monster.x - lucasGate.blockX, monster.y - lucasGate.blockY) < 24) {
            monster.x = lucasGate.blockX; monster.y = lucasGate.blockY; monster.path = [];
            lucasState = 'blocking';
            notify('LUCAS REACHES THE GATE · STEP INTO HIS SIGHT', 'danger');
            updateHUD();
        }
        return true;
    }
    if (lucasState === 'blocking') {
        monster.x = lucasGate.blockX; monster.y = lucasGate.blockY;
        if (canSeePlayer && Math.hypot(player.x - monster.x, player.y - monster.y) < 620) {
            beginLucasEndingAnimation();
        }
        return true;
    }
    if (lucasPoolCooldown > 0) lucasPoolCooldown--;
    if (lucasAbilityCooldown > 0) lucasAbilityCooldown--;
    if (lucasCharge) {
        lucasCharge.life--;
        const oldX = monster.x, oldY = monster.y;
        moveEntity(monster, lucasCharge.vx, lucasCharge.vy);
        if (Math.hypot(monster.x - player.x, monster.y - player.y) < player.r + monster.r + 4 && !player.hidden) {
            endGame(false, monster); return true;
        }
        if (lucasCharge.life <= 0 || Math.hypot(monster.x - oldX, monster.y - oldY) < .2) {
            lucasCharge = null; monster.stunTimer = 42; monster.path = [];
            notify('LUCAS MISSES · THE SHADOW RECOILS', 'unlock');
        }
        return true;
    }
    const distance = Math.hypot(player.x - monster.x, player.y - monster.y);
    const playerPool = lucasShadowPools.find(pool => Math.hypot(player.x - pool.x, player.y - pool.y) < pool.radius);
    if (ambienceClock >= 600 && lucasPoolCooldown <= 0 && distance > 180 && (playerPool || (lucasObjectiveStage !== 'fragment1' && ambienceClock % 360 === 0))) {
        if (!teleportLucasToPlayerShadow() && playerPool) {
            const playerRoom = getRoomAt(player.x, player.y);
            const destinations = lucasShadowPools.filter(pool => {
                const poolDistance = Math.hypot(player.x - pool.x, player.y - pool.y);
                const poolRoom = getRoomAt(pool.x, pool.y);
                return pool !== playerPool && poolDistance >= TS * 6
                    && (!playerRoom || (poolRoom && poolRoom !== playerRoom));
            });
            const destination = destinations[Math.floor(Math.random() * Math.max(1, destinations.length))];
            if (destination) {
                monster.x = destination.x; monster.y = destination.y; monster.path = [];
                lucasTeleportFlash = { x:monster.x, y:monster.y, life:54 };
                lucasPoolCooldown = 240;
                notify('LUCAS STEPS OUT OF A SHADOW POOL', 'danger');
            }
        }
    }
    if (canSeePlayer && lucasAbilityCooldown <= 0 && distance > 130 && distance < 650 && Math.random() < .032) {
        const roll = Math.random();
        if (lucasObjectiveStage !== 'fragment1' && roll < .28 && activateLucasRouteLock()) {
            lucasAbilityCooldown = 360;
            return true;
        }
        if (roll < .62) {
            spawnLucasArrowBarrage();
            lucasAbilityCooldown = 330;
            return true;
        }
        if (roll < .80 && distance > 220) {
            lucasPull = { life:24 };
            lucasAbilityCooldown = 420;
            notify('THE SHADOW PULLS TOWARD LUCAS', 'danger');
            return true;
        }
        if (lucasObjectiveStage !== 'fragment1' && distance > 180) {
            const angle = Math.atan2(player.y - monster.y, player.x - monster.x);
            lucasCharge = { vx:Math.cos(angle) * 6.7, vy:Math.sin(angle) * 6.7, life:42 };
            lucasAbilityCooldown = 480;
            notify('LUCAS CUTS ACROSS THE SERVICEWAY', 'danger');
            return true;
        }
    }
    if (canSeePlayer) {
        const targetC = Math.floor(player.x / TS), targetR = Math.floor(player.y / TS);
        if (monster.lastTargetC !== targetC || monster.lastTargetR !== targetR || monster.path.length === 0) {
            monster.path = findPath(Math.floor(monster.x / TS), Math.floor(monster.y / TS), targetC, targetR);
            monster.lastTargetC = targetC; monster.lastTargetR = targetR;
        }
        moveMonsterAlongPath(getMonsterSpeed(monster), monster);
    } else if (monster.path.length === 0) {
        const tile = pickMonsterWanderTile(monster);
        monster.path = findPath(Math.floor(monster.x / TS), Math.floor(monster.y / TS), tile.c, tile.r);
    } else moveMonsterAlongPath(getMonsterSpeed(monster), monster);
    if (!player.hidden && Math.hypot(player.x - monster.x, player.y - monster.y) < player.r + monster.r - 2) endGame(false, monster);
    return true;
}

function updateExtraMonsters() {
    for (const enemy of monsters.slice(1)) {
        clearProtectedPlayerTarget(enemy);
        triggerBearTrap(enemy);
        if (enemy.stunTimer > 0) { enemy.stunTimer--; continue; }
        const specialMovement = updateExtraMonsterAbilities(enemy);
        const protectedPlayer = player.hidden || player.dashTimer > 0 || isSafeRoom(player.x, player.y);
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
            const tile = pickMonsterWanderTile(enemy);
            targetC = tile.c; targetR = tile.r;
        }
        if (!specialMovement && targetC !== undefined && (enemy.lastTargetC !== targetC || enemy.lastTargetR !== targetR || enemy.path.length === 0)) {
            enemy.path = findPath(Math.floor(enemy.x / TS), Math.floor(enemy.y / TS), targetC, targetR);
            enemy.lastTargetC = targetC; enemy.lastTargetR = targetR;
        }
        if (!specialMovement) moveMonsterAlongPath(getMonsterSpeed(enemy), enemy);
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
            if (distance < 38) {
                const angle = distance > .01 ? Math.atan2(dy, dx) : (i % 2 ? Math.PI / 2 : -Math.PI / 2);
                const push = Math.min(4, (38 - distance) * 0.55);
                const aX = a.x, aY = a.y, bX = b.x, bY = b.y;
                moveEntity(a, -Math.cos(angle) * push, -Math.sin(angle) * push);
                moveEntity(b, Math.cos(angle) * push, Math.sin(angle) * push);
                if (isProtectedRoom(a.x, a.y)) { a.x = aX; a.y = aY; }
                if (isProtectedRoom(b.x, b.y)) { b.x = bX; b.y = bY; }
                if (Math.hypot(b.x - a.x, b.y - a.y) < 30) {
                    a.path = []; b.path = [];
                    a.lastTargetC = a.lastTargetR = b.lastTargetC = b.lastTargetR = -1;
                }
            }
        }
    }
}

function update() {
    if (mobileMenuPaused || hotelDialogueOpen) return;
    if (state === 16) { updateLucasFragmentPuzzle(); return; }
    if (state === 17) { updateLucasEndingAnimation(); return; }
    if (state === 18) { updateLucasShadowDimension(); return; }
    if (state === 19) { updateCalebBossIntro(); return; }
    if (state === 20) { updateCalebBossMain(); return; }
    if (state === 21) { updateCalebBossDefeat(); return; }
    if (state === 14) { updateSubwayControlPuzzle(); return; }
    if (state === 15) { updateSubwayFareCutscene(); return; }
    if (![1,3,5,6,7,9,10,11,13].includes(state)) return;

    if (flashAlpha > 0) flashAlpha -= 0.02;
    ambienceClock++;
    if (currentMapId === 'lucas' && state === 1 && lucasShadowEventCooldown > 0) lucasShadowEventCooldown--;
    if (currentMapId === 'lucas' && state === 1 && !lucasShadowEventTriggered && lucasShadowEventCooldown <= 0 && lucasObjectiveStage !== 'gate') {
        beginLucasShadowEvent();
        return;
    }
    if (noahAppearanceWindow > 0) noahAppearanceWindow--;
    if (scramblerTimer > 0) scramblerTimer--;
    if (flareTimer > 0) flareTimer--;
    if (dashCooldown > 0) dashCooldown--;
    if (player.dashTimer > 0) player.dashTimer--;
    if (jordanSabotageCooldown > 0) jordanSabotageCooldown--;
    if (state===9) { rapidTimer--; if(rapidTimer<=0) failGeneratorTask('RESPONSE ARRAY'); }
    if (state===10 && simonFlashTimer > 0) simonFlashTimer--;
    if (state===10 && simonPhase==='show') { simonTimer--; if(simonTimer<=0){simonShowIndex++;if(simonShowIndex>=simonRound){simonPhase='input';simonInput=0;}else simonTimer=38;} }
    if (state===11) { updateAmineRoadChase(); return; }

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
    const inAmineFire=currentMapId==='amine'&&amineFireZones.some(zone=>Math.hypot(player.x-zone.x,player.y-zone.y)<zone.radius); amineBurnTimer=inAmineFire?18:Math.max(0,amineBurnTimer-1);
    if(currentMapId==='amine'&&amineHoles.some(hole=>Math.hypot(player.x-hole.x,player.y-hole.y)<hole.radius+player.r*.4)){endGame(false,monster);return;}
    // The open Amine gate is a physical exit: walking into it is enough to
    // start the exposed final sequence. E remains supported as a fallback.
    if (currentMapId === 'amine' && state === 1 && activeGens >= totalGens && amineExitGate && Math.hypot(player.x - amineExitGate.x, player.y - amineExitGate.y) < 62) {
        beginAmineFinalChase();
    }
    if(amineBurnTimer>0){heatOverlay||=document.getElementById('heatOverlay');if(heatOverlay){heatOverlay.style.opacity='.72';heatOverlay.style.backdropFilter=setOptimization?'blur(2px)':'blur(7px)';}}
    for (const zone of noahLightningZones) zone.life--;
    noahLightningZones = noahLightningZones.filter(zone => zone.life > 0);
    if (noahLightningZones.some(zone => Math.hypot(player.x - zone.x, player.y - zone.y) < zone.radius)) noahShockTimer = 18;
    else if (noahShockTimer > 0) noahShockTimer--;
    if (noahLightningFlashes > 0 && ambienceClock % 12 === 0) { flashAlpha = .72; noahLightningFlashes--; }
    if (noahShockTimer > 0) { heatOverlay ||= document.getElementById('heatOverlay'); if (heatOverlay) { heatOverlay.style.opacity = '.48'; heatOverlay.style.backdropFilter = setOptimization ? 'blur(1px)' : 'blur(4px)'; } }
    updateRhysHazards();
    updateLucasHazards();
    updateAesonEvents();
    updateRhysEvents();
    updateForestEvent();
    updateForestGuidance();
    updateHotelEvents();
    updateHotelEmployees();
    updateBassamOutsideMap();
    if (monsters.some(enemy => enemy.hasHallucinations) && state === 1 && Math.random() < 0.0025) {
        hallucinationHudTimer = 120;
        if (Math.random() < 0.3) showMsg('<span style="color:#77ffdd">POWER RESTORED</span>', 700);
        updateHUD();
    }
    if (monsters.some(enemy => enemy.hasFalseObjective) && ambienceClock % 60 === 0) updateHUD();

    if ((state === 1 || state === 3) && eventsEnabled) {
        if (!['crimson','forest','amine'].includes(currentMapId) && powerOutageTimer > 0) {
            powerOutageTimer--;
            if (powerOutageTimer === 0) { powerOutageCooldown = gameMode === 'endless' ? Math.max(600, 1500 - endlessRound * 110) : 1500; showMsg('LIGHTS RESTORED', 800); }
        } else if (!['crimson','forest','amine'].includes(currentMapId) && powerOutageCooldown > 0) powerOutageCooldown--;
        else if (!['crimson','forest','amine'].includes(currentMapId)) { powerOutageTimer = 1080 + (gameMode === 'endless' ? (endlessRound - 1) * 90 : 0); outageFlickerTimer = 45; showMsg('<span style="color:#888">POWER OUTAGE</span>', 1000); playSound('emp'); }
        if (outageFlickerTimer > 0) outageFlickerTimer--;
        if (flickerTimer > 0) flickerTimer--;
        else if (flickerCooldown > 0) flickerCooldown--;
        else { flickerTimer = 90 + (gameMode === 'endless' ? (endlessRound - 1) * 12 : 0); flickerCooldown = gameMode === 'endless' ? Math.max(500, 1500 - endlessRound * 100) : 1500; playSound('tick'); }
        if (emergencyTimer > 0) emergencyTimer--;
        else if (!['crimson','forest','amine'].includes(currentMapId) && emergencyCooldown > 0) emergencyCooldown--;
        else if (!['crimson','forest','amine'].includes(currentMapId)) { emergencyTimer = 420 + (gameMode === 'endless' ? (endlessRound - 1) * 30 : 0); emergencyCooldown = gameMode === 'endless' ? Math.max(900, 2100 - endlessRound * 120) : 2100; showMsg('<span style="color:#f44">EMERGENCY LIGHTS</span>', 1200); playSound('alarm'); }
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

    updateSubwayGoldPressure();
    updateSubwayTrains();
    if (state === 4 || state === 8) return;

    if (state === 1) updateNizarAbilities();

    if (player.stunTimer > 0) {
        player.stunTimer--;
    } else if (!player.hidden && !hotelDialogueOpen) {
        const heatPenalty = player.inHeatZone ? 0.48 : 1 - Math.min(0.28, player.heat / 1070);
        const rhysSlow = [...goopZones, ...rhysPressureZones].some(zone => Math.hypot(player.x - zone.x, player.y - zone.y) < zone.radius);
        const lucasCarrySlow = currentMapId === 'lucas' && lucasCarryFragment ? .76 : 1;
        const lucasPoolSlow = currentMapId === 'lucas' && lucasShadowPools.some(pool => Math.hypot(player.x - pool.x, player.y - pool.y) < pool.radius) ? .62 : 1;
        const normalSpeed = (player.crouching ? player.baseSpeed * 0.55 : player.baseSpeed) * heatPenalty * (rhysSlow ? 0.62 : 1) * (noahShockTimer > 0 ? .42 : 1) * (amineBurnTimer>0?.38:1) * lucasCarrySlow * lucasPoolSlow;
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
        if (dx !== 0 || dy !== 0) { const length = Math.hypot(dx, dy); lastMoveX = dx / length; lastMoveY = dy / length; }
        if (dx !== 0 || dy !== 0) moveEntity(player, dx, dy);
    }
    if ((state === 1 || state === 3) && !player.hidden) {
        const playerMoving = keys.w || keys.a || keys.s || keys.d || Math.hypot(player.x - trailLastX, player.y - trailLastY) > .25;
        if (playerMoving && ambienceClock % 2 === 0) {
            playerTrail.push({ x: player.x, y: player.y });
            if (playerTrail.length > 24) playerTrail.shift();
        }
        trailLastX = player.x; trailLastY = player.y;
    }

    nearGen = null; nearFuse = null; nearHide = null; nearValve = null; nearBoiler = false; nearEmployee = null; nearElevator = false; nearHotelTask = null; nearRhysSeal = false; nearRhysKey = false; nearRhysChest = false; nearRhysTrap = false; nearSubwayPanel = null; nearSubwayControl = false; nearLucasFragment = null; nearLucasLever = null; nearLucasAltar = false;
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
        if (currentMapId === 'subway') {
            const flickeringPanel = subwayGoldPressure?.signalPanels?.find(panel => Math.hypot(player.x - panel.x, player.y - panel.y) < 38) || null;
            nearSubwayPanel = flickeringPanel || subwayPanels.find(panel => !panel.active && Math.hypot(player.x - panel.x, player.y - panel.y) < 38) || null;
            nearSubwayControl = Boolean(subwayControl && Math.hypot(player.x - subwayControl.x, player.y - subwayControl.y) < 46);
        }
        if (currentMapId === 'lucas') {
            nearLucasLever = lucasLevers.find(lever => !lever.active && Math.hypot(player.x - lever.x, player.y - lever.y) < 36) || null;
            nearLucasFragment = lucasFragments.find(fragment => fragment.available !== false && !fragment.collected && Math.hypot(player.x - fragment.x, player.y - fragment.y) < 36) || null;
            nearLucasAltar = Boolean(lucasAltar && Math.hypot(player.x - lucasAltar.x, player.y - lucasAltar.y) < 52);
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
    if (state === 7) {
        if (scDelay > 0) scDelay--;
        else { tuneNeedle += tuneSpeed; if (tuneNeedle > 1) tuneNeedle -= 1; }
    }

    // --- MONSTER AI ---
    // A hiding spot or safe room breaks detection, but never pauses the monster.
    triggerBearTrap(monster);
    if (monster.stunTimer > 0) {
        monster.stunTimer--;
    } else if (state === 1 || state === 3) {
        clearProtectedPlayerTarget(monster);
        const goldFareDetectable = currentMapId === 'subway' && monster.name === 'NIZAR' && subwayGoldPressure?.active && subwayGoldPressure.detectableTimer > 0;
        let canSeePlayer = !player.hidden && !player.breathing && (goldFareDetectable || (!isSafeRoom(player.x, player.y) && (monsterCanSeeUnhiddenPlayer() || (monster.name === 'AESON' && player.heat > 120))));
        let tracksBlood = !player.hidden && !isSafeRoom(player.x, player.y) && monster.name === 'MALAKAI' && monster.bloodHuntTimer > 0;
        let tracksHeat = !player.hidden && !isSafeRoom(player.x, player.y) && monster.name === 'AESON' && monster.heatAlertTimer > 0;
        
        if (currentMapId === 'lucas' && updateLucasMonster()) {
            // Lucas owns the pre-boss route and gate sequence.
        } else if (state === 1 && currentMapId === 'subway' && subwayCommitTimer > 0 && subwayCommitTarget) {
            subwayCommitTimer--;
            const targetC = Math.floor(subwayCommitTarget.x / TS), targetR = Math.floor(subwayCommitTarget.y / TS);
            if (monster.lastTargetC !== targetC || monster.lastTargetR !== targetR || monster.path.length === 0) {
                monster.path = findPath(Math.floor(monster.x / TS), Math.floor(monster.y / TS), targetC, targetR);
                monster.lastTargetC = targetC; monster.lastTargetR = targetR;
            }
            moveMonsterAlongPath(getMonsterSpeed(monster) * 1.18);
            if (subwayCommitTimer <= 0 && !subwayTrainTriggered) { subwayCommitTarget = null; monster.path = []; }
        } else if (state === 1 && monster.name === 'AMINE' && updateAmine()) {
            // Amine owns visibility, teleporting, and pursuit.
        } else if (state === 1 && monster.name === 'NOAH' && updateNoah()) {
            // Noah owns his full stalk/reveal/chase lifecycle.
        } else if (state === 1 && player.hidden && player.hideCompromised) {
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
                if (monster.path.length === 0) { const tile = pickMonsterWanderTile(monster); monster.path = findPath(Math.floor(monster.x / TS), Math.floor(monster.y / TS), tile.c, tile.r); }
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
        } else if (state === 1 && monster.name === 'RHYS') {
            const dashing = updateRhysCombat(canSeePlayer);
            if (!dashing) {
                const baitingWall = rhysBreakWall && !rhysBreakWall.broken && Math.hypot(player.x - rhysBreakWall.x, player.y - rhysBreakWall.y) < 170;
                const target = baitingWall ? { x:rhysBreakWall.baitX, y:rhysBreakWall.baitY } : (canSeePlayer ? player : (noiseTarget && noiseTimer > 0 ? noiseTarget : null));
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
            if (rhysTrapArmed && crimsonObjectiveComplete() && rhysTrap && Math.hypot(monster.x - rhysTrap.x, monster.y - rhysTrap.y) < 26) {
                state = 8; monster.stunTimer = 180; showStoryLine('“I like it in here…”', 2200);
                setTimeout(() => { if (state === 8) endGame(true, monster); }, 2200);
            }
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
                const oldX = monster.x, oldY = monster.y;
                let ang = Math.atan2(player.y - monster.y, player.x - monster.x);
                const phantomSpeed = getMonsterSpeed();
                monster.x += Math.cos(ang) * phantomSpeed;
                monster.y += Math.sin(ang) * phantomSpeed;
                if (isProtectedRoom(monster.x, monster.y)) { monster.x = oldX; monster.y = oldY; }
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
                        const wanderTile = pickMonsterWanderTile(monster);
                        let targetC = tracksPlayer ? Math.floor(player.x/TS) : wanderTile.c;
                        let targetR = tracksPlayer ? Math.floor(player.y/TS) : wanderTile.r;
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
            if (monster.path.length === 0 || (canSeePlayer && monster.name !== 'NOAH')) {
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
    if (state === 11 && amineRoad) { drawAmineRoadChase(); return; }
    if (state === 16 && lucasFragmentPuzzle) { drawLucasFragmentPuzzle(); return; }
    if (state === 17 && lucasEndingAnimation) { drawLucasEndingAnimation(); return; }
    if (state === 18 && lucasShadowEvent) { drawLucasShadowDimension(); return; }
    if (state === 19 && calebBoss) { drawCalebBossIntro(); return; }
    if (state === 20 && calebBoss) { drawCalebBossEncounter(); return; }
    if (state === 21 && calebBoss) { drawCalebBossDefeat(); return; }
    if (state === 14 && subwayControlPuzzle) { drawSubwayControlPuzzle(); return; }
    if (state === 15 && subwayFareCutscene) { drawSubwayFareCutscene(); return; }
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
                ctx.fillStyle = currentMapId === 'boilerworks' ? '#171a1d' : currentMapId === 'hotel' ? '#211a20' : currentMapId === 'crimson' ? '#241012' : currentMapId === 'forest' ? '#17351c' : currentMapId === 'amine' ? '#252525' : currentMapId === 'subway' ? '#15191d' : currentMapId === 'lucas' ? '#171326' : '#2d2216'; ctx.fillRect(c * TS, r * TS, TS, TS);
                if (!setOptimization) { ctx.strokeStyle = currentMapId === 'boilerworks' ? '#0b0d0f' : currentMapId === 'hotel' ? '#0e0a10' : currentMapId === 'crimson' ? '#100506' : currentMapId === 'lucas' ? '#080610' : '#181109'; ctx.strokeRect(c * TS, r * TS, TS, TS); }
            } else {
                ctx.fillStyle = currentMapId === 'boilerworks' ? '#4b4540' : currentMapId === 'hotel' ? ((r + c) % 2 ? '#5b4850' : '#65505a') : currentMapId === 'crimson' ? ((r + c) % 2 ? '#6f2429' : '#7d2b30') : currentMapId === 'forest' ? ((r + c) % 2 ? '#326d36' : '#39793d') : currentMapId === 'amine' ? '#555555' : currentMapId === 'subway' ? ((r + c) % 2 ? '#31383d' : '#3a4247') : currentMapId === 'lucas' ? ((r + c) % 2 ? '#3d3156' : '#493968') : '#8b7355'; ctx.fillRect(c * TS, r * TS, TS, TS);
                if (!setOptimization && currentMapId === 'boilerworks' && (r + c) % 7 === 0) {
                    ctx.fillStyle = 'rgba(180,120,55,0.2)'; ctx.fillRect(c * TS + 5, r * TS + 7, TS - 10, 3);
                }
                if (!setOptimization && currentMapId === 'hotel' && r % 3 === 0) { ctx.fillStyle = 'rgba(220,190,180,0.08)'; ctx.fillRect(c * TS + 4, r * TS + 18, TS - 8, 2); }
            }
        }
    }

    for (const room of rooms) {
        if (currentMapId === 'subway' && room.subwayTunnel) continue;
        const roomColor = currentMapId === 'boilerworks'
            ? (room.type === 'boiler' ? 'rgba(255,80,20,0.3)' : room.type === 'maintenance' ? 'rgba(80,180,220,0.22)' : room.type === 'cooling' ? 'rgba(40,190,220,0.2)' : room.type === 'control' ? 'rgba(160,100,220,0.2)' : room.type === 'storage' ? 'rgba(180,180,180,0.16)' : 'rgba(160,100,50,0.18)')
            : currentMapId === 'hotel'
                ? ({ lobby:'rgba(190,150,90,0.34)', guest:'rgba(125,90,125,0.24)', laundry:'rgba(80,180,210,0.24)', conference:'rgba(180,140,60,0.25)', kitchen:'rgba(200,100,60,0.24)', service:'rgba(80,150,105,0.24)', office:'rgba(120,100,180,0.24)', elevator:'rgba(210,210,220,0.3)', storage:'rgba(140,140,140,0.2)' }[room.type] || 'rgba(90,70,90,0.22)')
                : currentMapId === 'crimson'
                    ? ({ intake:'rgba(180,80,55,.24)', archive:'rgba(140,35,48,.28)', medical:'rgba(170,95,95,.25)', storage:'rgba(110,80,65,.27)', processing:'rgba(215,145,48,.22)', security:'rgba(90,110,145,.26)', maintenance:'rgba(150,130,55,.25)', containment:'rgba(205,55,45,.31)', vault:'rgba(150,35,65,.32)', service:'rgba(105,65,70,.24)', trap:'rgba(240,200,70,.24)' }[room.type] || 'rgba(120,35,45,.22)')
                : currentMapId === 'forest' ? (room.lit ? 'rgba(255,220,100,.28)' : 'rgba(42,28,20,.6)')
                : currentMapId === 'subway' ? (room.type.startsWith('platform_') ? 'rgba(81,94,102,.78)' : room.type === 'ticket_hall' ? 'rgba(91,79,62,.68)' : 'rgba(56,67,74,.76)')
                : currentMapId === 'lucas' ? ({ entry:'rgba(80,55,105,.34)', archive:'rgba(155,115,205,.24)', service:'rgba(80,120,150,.24)', underpass:'rgba(30,20,48,.55)', yard:'rgba(142,91,65,.34)', vessel:'rgba(116,70,158,.36)', gate:'rgba(18,7,29,.72)' }[room.type] || 'rgba(80,55,105,.24)')
                : (room.type === 'safe' ? 'rgba(40,110,255,0.28)' : room.type === 'maintenance' ? 'rgba(255,190,40,0.22)' : room.type === 'storage' ? 'rgba(180,180,180,0.16)' : 'rgba(80,80,80,0.14)');
        ctx.fillStyle = roomColor;
        const roomWidth = room.width || 3, roomHeight = room.height || 3;
        ctx.fillRect((room.c - Math.floor(roomWidth / 2)) * TS, (room.r - Math.floor(roomHeight / 2)) * TS, TS * roomWidth, TS * roomHeight);
        ctx.strokeStyle = room.type === 'safe' ? '#5790ff' : currentMapId === 'boilerworks' && room.type === 'boiler' ? '#ff6622' : currentMapId === 'hotel' && room.type === 'elevator' ? '#e7e7ff' : 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect((room.c - Math.floor(roomWidth / 2)) * TS, (room.r - Math.floor(roomHeight / 2)) * TS, TS * roomWidth, TS * roomHeight);
        ctx.fillStyle = room.type === 'safe' ? '#fff0a0' : currentMapId === 'boilerworks' && room.type === 'boiler' ? '#ff9a66' : currentMapId === 'hotel' ? '#f1d9c4' : currentMapId === 'crimson' ? '#ffd0ad' : currentMapId === 'lucas' ? '#d5baff' : '#ddd';
        ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center';
        if (currentMapId !== 'subway') ctx.fillText(room.type.toUpperCase(), room.x, room.y - 24);
    }

    if (currentMapId === 'lucas') {
        for (const pool of lucasShadowPools) {
            const pulse = 1 + Math.sin(ambienceClock * .055 + pool.x) * .12;
            ctx.fillStyle = 'rgba(9,2,22,.62)'; ctx.beginPath(); ctx.ellipse(pool.x, pool.y, pool.radius * pulse, pool.radius * .58, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(183,112,255,.55)'; ctx.lineWidth = 2; ctx.stroke();
            ctx.fillStyle = 'rgba(212,165,255,.45)'; ctx.beginPath(); ctx.arc(pool.x, pool.y, 5 + Math.sin(ambienceClock * .08 + pool.y) * 2, 0, Math.PI * 2); ctx.fill();
        }
        for (const lock of lucasRouteLocks) {
            for (const cell of lock.cells || []) {
                const x = cell.c * TS, y = cell.r * TS;
                ctx.fillStyle = 'rgba(20,5,35,.9)'; ctx.fillRect(x - 3, y - 3, TS + 6, TS + 6);
                ctx.strokeStyle = '#c084ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 7, y + 7); ctx.lineTo(x + TS - 7, y + TS - 7); ctx.moveTo(x + TS - 7, y + 7); ctx.lineTo(x + 7, y + TS - 7); ctx.stroke();
            }
        }
        for (const hazard of lucasHazards) {
            ctx.save(); ctx.translate(hazard.x, hazard.y); ctx.rotate(Math.atan2(hazard.vy, hazard.vx));
            ctx.fillStyle = 'rgba(209,157,255,.9)'; ctx.shadowColor = '#bd75ff'; ctx.shadowBlur = 12;
            ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(-9, -5); ctx.lineTo(-5, 0); ctx.lineTo(-9, 5); ctx.closePath(); ctx.fill(); ctx.restore();
        }
        if (lucasTeleportFlash) {
            const flashProgress = 1 - lucasTeleportFlash.life / 54;
            ctx.strokeStyle = `rgba(221,174,255,${Math.max(0, 1 - flashProgress)})`; ctx.lineWidth = 5;
            ctx.beginPath(); ctx.arc(lucasTeleportFlash.x, lucasTeleportFlash.y, 18 + flashProgress * 44, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeStyle = `rgba(255,240,255,${Math.max(0, .7 - flashProgress)})`; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(lucasTeleportFlash.x, lucasTeleportFlash.y, 8 + flashProgress * 26, 0, Math.PI * 2); ctx.stroke();
        }
        for (const lever of lucasLevers) {
            ctx.fillStyle = lever.active ? '#a7ffcc' : '#7a4e9e'; ctx.fillRect(lever.x - 10, lever.y - 14, 20, 28);
            ctx.strokeStyle = lever.active ? '#e4ffef' : '#1c0d28'; ctx.lineWidth = 2; ctx.strokeRect(lever.x - 10, lever.y - 14, 20, 28);
            ctx.fillStyle = lever.active ? '#2d9860' : '#e2b4ff'; ctx.fillRect(lever.x - 3, lever.y - 9, 6, 18);
            if (nearLucasLever === lever && state === 1) { ctx.fillStyle='#fff1ff'; ctx.font='bold 10px Arial'; ctx.textAlign='center'; ctx.fillText('[E] FLIP SHADOW RELAY', lever.x, lever.y - 21); }
        }
        for (const arrow of lucasArrows) {
            ctx.save(); ctx.translate(arrow.x, arrow.y); ctx.rotate(arrow.angle + Math.sin(ambienceClock * .025 + arrow.x) * .025);
            ctx.fillStyle = arrow.misleading ? 'rgba(255,94,177,.75)' : 'rgba(202,166,255,.82)';
            ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-11, -10); ctx.lineTo(-7, 0); ctx.lineTo(-11, 10); ctx.closePath(); ctx.fill();
            ctx.restore();
        }
        for (const fragment of lucasFragments) {
            if (fragment.collected || fragment.available === false) continue;
            const pulse = 1 + Math.sin(ambienceClock * .08 + fragment.id) * .12;
            ctx.save(); ctx.translate(fragment.x, fragment.y); ctx.rotate(.35);
            ctx.fillStyle = 'rgba(216,174,255,.18)'; ctx.beginPath(); ctx.arc(0, 0, 25 * pulse, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#d7b0ff'; ctx.beginPath(); ctx.moveTo(0, -13 * pulse); ctx.lineTo(10 * pulse, 8 * pulse); ctx.lineTo(-11 * pulse, 9 * pulse); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#fff1ff'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
            if (nearLucasFragment === fragment && state === 1) { ctx.fillStyle='#fff1ff'; ctx.font='bold 10px Arial'; ctx.textAlign='center'; ctx.fillText(fragment.id === 3 ? '[E] TAKE & CARRY FRAGMENT' : '[E] RECOVER CALEB FRAGMENT', fragment.x, fragment.y - 24); }
        }
        if (lucasCarryFragment) {
            const pulse = 1 + Math.sin(ambienceClock * .12) * .08;
            ctx.strokeStyle = '#f0d4ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(player.x, player.y - 24, 12 * pulse, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = '#d7b0ff'; ctx.beginPath(); ctx.moveTo(player.x, player.y - 37 * pulse); ctx.lineTo(player.x + 9 * pulse, player.y - 20 * pulse); ctx.lineTo(player.x - 9 * pulse, player.y - 20 * pulse); ctx.closePath(); ctx.fill();
        }
        if (lucasAltar) {
            ctx.fillStyle = lucasAltar.placed ? 'rgba(205,158,255,.42)' : 'rgba(76,41,102,.7)';
            ctx.fillRect(lucasAltar.x - 30, lucasAltar.y - 24, 60, 48);
            ctx.strokeStyle = lucasAltar.placed ? '#f0d9ff' : '#a77bd1'; ctx.lineWidth = 3; ctx.strokeRect(lucasAltar.x - 30, lucasAltar.y - 24, 60, 48);
            ctx.fillStyle = '#f0d9ff'; ctx.font='bold 9px Arial'; ctx.textAlign='center'; ctx.fillText(lucasAltar.placed ? 'FRAGMENTS PLACED' : 'CALEB VESSEL', lucasAltar.x, lucasAltar.y + 4);
            if (nearLucasAltar && state === 1 && !lucasAltar.placed) ctx.fillText(lucasCarryFragment ? '[E] PLACE LAST FRAGMENT' : 'LAST FRAGMENT REQUIRED', lucasAltar.x, lucasAltar.y - 34);
            if (lucasAltar.placed) for (let index = 0; index < 3; index++) { const angle = ambienceClock * .02 + index * Math.PI * 2 / 3; ctx.fillStyle='#edcbff'; ctx.beginPath(); ctx.arc(lucasAltar.x + Math.cos(angle) * 18, lucasAltar.y + Math.sin(angle) * 13, 5, 0, Math.PI * 2); ctx.fill(); }
        }
        if (lucasGate && lucasShadow) {
            const shadowPulse = 1 + Math.sin(ambienceClock * .06) * .08;
            const shadowGradient = ctx.createRadialGradient(lucasShadow.x, lucasShadow.y, 4, lucasShadow.x, lucasShadow.y, lucasShadow.radius * shadowPulse);
            shadowGradient.addColorStop(0, 'rgba(0,0,0,.98)'); shadowGradient.addColorStop(1, 'rgba(11,3,18,0)');
            ctx.fillStyle = shadowGradient; ctx.beginPath(); ctx.ellipse(lucasShadow.x, lucasShadow.y, lucasShadow.radius * shadowPulse, lucasShadow.radius * .62, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = lucasGate.open ? 'rgba(196,148,255,.35)' : '#1b1027'; ctx.fillRect(lucasGate.x - 8, lucasGate.y - 54, 16, 108);
            ctx.strokeStyle = lucasGate.open ? '#dcb8ff' : '#6f4b89'; ctx.lineWidth = 3; ctx.strokeRect(lucasGate.x - 12, lucasGate.y - 58, 24, 116);
            ctx.fillStyle = '#ead7ff'; ctx.font='bold 10px Arial'; ctx.textAlign='center'; ctx.fillText(lucasGate.open ? 'OPEN' : 'SHADOW GATE', lucasGate.x, lucasGate.y - 70);
        }
    }

    if (currentMapId === 'forest') {
        for (const tree of forestTrees) { ctx.fillStyle = '#1a4523'; ctx.beginPath(); ctx.arc(tree.x, tree.y, tree.radius, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#0b2511'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = 'rgba(110,180,84,.26)'; ctx.beginPath(); ctx.arc(tree.x - tree.radius * .25, tree.y - tree.radius * .3, tree.radius * .48, 0, Math.PI * 2); ctx.fill(); }
    }
    if (currentMapId === 'subway') {
        for (const segment of subwayTrackSegments) {
            const x1 = segment.x1 * TS + TS / 2, y1 = segment.y1 * TS + TS / 2, x2 = segment.x2 * TS + TS / 2, y2 = segment.y2 * TS + TS / 2;
            const vertical = Math.abs(y2-y1) > Math.abs(x2-x1), offset = 10;
            ctx.strokeStyle = '#080a0b'; ctx.lineWidth = 5; ctx.beginPath();
            if (vertical) { ctx.moveTo(x1-offset,y1);ctx.lineTo(x2-offset,y2);ctx.moveTo(x1+offset,y1);ctx.lineTo(x2+offset,y2); }
            else { ctx.moveTo(x1,y1-offset);ctx.lineTo(x2,y2-offset);ctx.moveTo(x1,y1+offset);ctx.lineTo(x2,y2+offset); } ctx.stroke();
            ctx.strokeStyle = segment.active ? '#c4a767' : '#7a6846';ctx.lineWidth=3;
            const length=Math.hypot(x2-x1,y2-y1), steps=Math.floor(length/18);
            for(let i=0;i<=steps;i++){const t=i*18/length,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;ctx.beginPath();if(vertical){ctx.moveTo(x-16,y);ctx.lineTo(x+16,y);}else{ctx.moveTo(x,y-16);ctx.lineTo(x,y+16);}ctx.stroke();}
        }
        for (const item of subwayDecor) {
            ctx.save(); ctx.translate(item.x, item.y);
            if (item.kind === 'bench') { ctx.fillStyle='#684d36'; ctx.fillRect(-34,-8,68,16); ctx.fillStyle='#222'; ctx.fillRect(-28,8,5,13); ctx.fillRect(23,8,5,13); }
            else if (item.kind === 'machine') { ctx.fillStyle='#273b48'; ctx.fillRect(-14,-26,28,52); ctx.fillStyle='#7fe7ff'; ctx.fillRect(-8,-18,16,16); }
            else if (item.kind === 'turnstile') { ctx.strokeStyle='#aebac0'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(-13,0);ctx.lineTo(13,0);ctx.moveTo(0,-13);ctx.lineTo(0,13);ctx.stroke(); }
            else if (item.kind === 'poster') { ctx.fillStyle='#c9b178';ctx.fillRect(-18,-25,36,50);ctx.fillStyle='#5b2631';ctx.fillRect(-12,-18,24,30); }
            else if (item.kind === 'barrier') { ctx.strokeStyle='#ffc94d';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-18,-14);ctx.lineTo(18,14);ctx.moveTo(-18,14);ctx.lineTo(18,-14);ctx.stroke(); }
            else if (item.kind === 'column') { ctx.fillStyle='#657078';ctx.fillRect(-11,-26,22,52);ctx.fillStyle='#9aa5aa';ctx.fillRect(-15,-30,30,6); }
            else if (item.kind === 'booth') { ctx.fillStyle='#5c4b38';ctx.fillRect(-32,-27,64,54);ctx.fillStyle='#1c2d35';ctx.fillRect(-24,-19,48,22);ctx.fillStyle='#ead39e';ctx.fillRect(-12,9,24,4); }
            else if (item.kind === 'control') { ctx.fillStyle='#2b4c59';ctx.fillRect(-28,-25,56,50);ctx.fillStyle='#8be6ff';ctx.fillRect(-19,-16,38,15);ctx.fillStyle='#e7bc4a';ctx.beginPath();ctx.arc(0,11,6,0,Math.PI*2);ctx.fill(); }
            else { ctx.fillStyle=item.kind==='luggage'?'#714832':'#4f4b45';ctx.fillRect(-13,-10,26,20); }
            ctx.restore();
        }
        for (const sign of subwaySigns) { ctx.fillStyle='#111b23';ctx.fillRect(sign.x-82,sign.y-12,164,24);ctx.strokeStyle='#c7d5df';ctx.lineWidth=1;ctx.strokeRect(sign.x-82,sign.y-12,164,24);ctx.fillStyle='#e7f1f7';ctx.font='bold 10px Arial';ctx.textAlign='center';ctx.fillText(sign.text,sign.x,sign.y+4); }
        for (const panel of subwayPanels) { const flickering = subwayGoldPressure?.signalPanels?.includes(panel) || subwayGoldPressure?.signalPanel === panel; ctx.fillStyle=flickering && ambienceClock % 8 < 4 ? '#fff0a2' : panel.active?'#46d876':'#d7a943';ctx.fillRect(panel.x-13,panel.y-19,26,38);ctx.fillStyle='#091018';ctx.fillRect(panel.x-8,panel.y-13,16,11);if (flickering) {ctx.strokeStyle='#ffe36b';ctx.lineWidth=3;ctx.strokeRect(panel.x-18,panel.y-24,36,48);}if (nearSubwayPanel === panel && state===1) {ctx.fillStyle='#fff';ctx.font='bold 10px Arial';ctx.fillText('[E] '+(flickering?'RE-STABILIZE':panel.label),panel.x,panel.y-30);} }
        if (subwayControl) { ctx.fillStyle=subwayObjectiveComplete()?'#52ec79':'#7ea7c1';ctx.fillRect(subwayControl.x-21,subwayControl.y-18,42,36);ctx.fillStyle='#101820';ctx.fillRect(subwayControl.x-15,subwayControl.y-12,30,13);if(nearSubwayControl&&state===1){ctx.fillStyle='#fff';ctx.font='bold 10px Arial';ctx.fillText('[E] '+(subwayObjectiveComplete()?'OPEN RAIL CONTROL':'SIGNALS REQUIRED'),subwayControl.x,subwayControl.y-29);} }
        for (const train of subwayTrains.filter(train=>train.active)) { ctx.save();ctx.translate(train.x,train.y);if(train.axis==='y')ctx.rotate(Math.PI/2);ctx.fillStyle=train.trapTrain?'#9d2222':'#45515a';ctx.fillRect(-train.length/2,-26,train.length,52);ctx.fillStyle='#111';for(let x=-train.length/2+14;x<train.length/2-6;x+=28)ctx.fillRect(x,-15,17,19);ctx.fillStyle='#e7d6a1';ctx.fillRect(train.direction>0?train.length/2-6:-train.length/2,-12,6,24);ctx.restore(); }
        if (subwayTornTicket && !subwayTornTicket.collected) {
            ctx.save(); ctx.translate(subwayTornTicket.x, subwayTornTicket.y); ctx.rotate(-.12);
            ctx.fillStyle = '#e4d1a1'; ctx.fillRect(-15, -9, 30, 18); ctx.fillStyle = '#6b4b36'; ctx.fillRect(-10, -4, 20, 2); ctx.fillRect(-8, 1, 13, 2);
            ctx.strokeStyle = '#fff1bd'; ctx.lineWidth = 2; ctx.strokeRect(-15, -9, 30, 18); ctx.restore();
            if (Math.hypot(player.x - subwayTornTicket.x, player.y - subwayTornTicket.y) < 50) { ctx.fillStyle='#fff3c4'; ctx.font='bold 10px Arial'; ctx.textAlign='center'; ctx.fillText('[E] TAKE TORN TICKET', subwayTornTicket.x, subwayTornTicket.y - 20); }
        }
        if (subwayGoldSphere && !subwayGoldSphere.collected) {
            const pulse = 1 + Math.sin(ambienceClock / 8) * .12;
            ctx.save(); ctx.translate(subwayGoldSphere.x, subwayGoldSphere.y); ctx.fillStyle='rgba(255,214,71,.18)'; ctx.beginPath(); ctx.arc(0,0,26*pulse,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#e5c34e'; ctx.beginPath(); ctx.arc(0,0,11*pulse,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#fff0a2'; ctx.lineWidth=2; ctx.stroke(); ctx.restore();
            if (Math.hypot(player.x - subwayGoldSphere.x, player.y - subwayGoldSphere.y) < 50) { ctx.fillStyle='#fff3ad'; ctx.font='bold 10px Arial'; ctx.textAlign='center'; ctx.fillText('[E] TAKE GOLD FARE SPHERE', subwayGoldSphere.x, subwayGoldSphere.y - 22); }
        }
        if (subwayGoldPressure?.lockedDoorCells?.length) {
            for (const door of subwayGoldPressure.lockedDoorCells) { const dx=door.c*TS+TS/2,dy=door.r*TS+TS/2;ctx.fillStyle='rgba(174,48,42,.88)';ctx.fillRect(dx-7,dy-20,14,40);ctx.strokeStyle='#ffd36b';ctx.lineWidth=2;ctx.strokeRect(dx-10,dy-23,20,46);ctx.fillStyle='#fff0a2';ctx.font='bold 8px Arial';ctx.textAlign='center';ctx.fillText('LOCKED',dx,dy-28); }
        }
    }
    if(currentMapId==='amine'){
        for(const zone of amineFireZones){ctx.fillStyle='rgba(255,70,10,.3)';ctx.beginPath();ctx.arc(zone.x,zone.y,zone.radius,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ff6b20';ctx.stroke();}
        for(const hole of amineHoles){ctx.fillStyle='#020202';ctx.beginPath();ctx.arc(hole.x,hole.y,hole.radius+6,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#6a5144';ctx.lineWidth=3;ctx.stroke();}
        if(amineExitGate&&activeGens>=totalGens){ctx.fillStyle='#ddd';ctx.fillRect(amineExitGate.x-16,amineExitGate.y-24,32,48);ctx.fillStyle='#111';ctx.fillRect(amineExitGate.x-10,amineExitGate.y-18,20,42);if(Math.hypot(player.x-amineExitGate.x,player.y-amineExitGate.y)<44){ctx.fillStyle='#fff';ctx.font='bold 11px Arial';ctx.fillText('[E] EXIT GATE',amineExitGate.x,amineExitGate.y-32);}}
    }
    for(const block of luckyBlocks.filter(block=>!block.opened)){ctx.fillStyle='#ffd83d';ctx.fillRect(block.x-12,block.y-12,24,24);ctx.fillStyle='#3a2900';ctx.font='bold 17px Arial';ctx.textAlign='center';ctx.fillText('?',block.x,block.y+6);if(Math.hypot(player.x-block.x,player.y-block.y)<36){ctx.fillStyle='#fff';ctx.font='bold 10px Arial';ctx.fillText('[E] SHIFT CACHE',block.x,block.y-20);}}

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

    for (const decoy of bassamDecoys) {
        ctx.fillStyle = '#8a8274'; ctx.fillRect(decoy.x - 9, decoy.y - 14, 18, 28);
        ctx.fillStyle = '#c9b89d'; ctx.beginPath(); ctx.arc(decoy.x, decoy.y - 19, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#252525'; ctx.fillRect(decoy.x - 4, decoy.y - 6, 8, 6);
        ctx.fillStyle = '#ffd9a1'; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'center'; ctx.fillText(decoy.department, decoy.x, decoy.y - 30);
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

    if (currentMapId === 'forest') {
        for (const cabin of forestCabins) {
            ctx.fillStyle = cabin.lit ? 'rgba(255,220,110,.14)' : 'rgba(8,10,12,.22)';
            ctx.fillRect((cabin.c - Math.floor(cabin.width / 2)) * TS, (cabin.r - Math.floor(cabin.height / 2)) * TS, cabin.width * TS, cabin.height * TS);
            ctx.fillStyle = cabin.lit ? '#fff0aa' : '#637078'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; ctx.fillText(cabin.lit ? 'LIT CABIN' : 'DARK CABIN', cabin.x, cabin.y - 24);
        }
        for (const breaker of forestBreakers) { ctx.fillStyle = breaker.active ? '#65ff8b' : '#e6ae4b'; ctx.fillRect(breaker.x - 9, breaker.y - 9, 18, 18); ctx.strokeStyle = '#111'; ctx.strokeRect(breaker.x - 9, breaker.y - 9, 18, 18); if (!breaker.active && Math.hypot(player.x-breaker.x, player.y-breaker.y) < 38) { ctx.fillStyle='#fff'; ctx.fillText('[E] RESTORE BREAKER', breaker.x, breaker.y-17); } }
        if (forestBeaconBattery && !forestBeaconBattery.collected) { ctx.fillStyle = '#b8d8ea'; ctx.fillRect(forestBeaconBattery.x-8, forestBeaconBattery.y-6, 16, 12); ctx.fillStyle='#16242c'; ctx.fillRect(forestBeaconBattery.x-3, forestBeaconBattery.y-3, 6, 6); if (forestBreakers.every(breaker => breaker.active) && Math.hypot(player.x-forestBeaconBattery.x, player.y-forestBeaconBattery.y)<38) { ctx.fillStyle='#fff'; ctx.fillText('[E] RANGER BATTERY', forestBeaconBattery.x, forestBeaconBattery.y-18); } }
        if (forestWatchtower) { ctx.strokeStyle = forestBeaconActive ? '#8fffb0' : '#8d7958'; ctx.lineWidth=4; ctx.strokeRect(forestWatchtower.x-16, forestWatchtower.y-16, 32, 32); ctx.fillStyle=forestBeaconActive ? '#9fffc0' : '#c5b185'; ctx.fillText(forestBeaconActive ? 'BEACON ONLINE' : 'WATCHTOWER', forestWatchtower.x, forestWatchtower.y-24); if (forestBeaconBattery?.collected && activeGens >= totalGens && !forestBeaconActive && Math.hypot(player.x-forestWatchtower.x,player.y-forestWatchtower.y)<46) { ctx.fillStyle='#fff'; ctx.fillText('[E] INSTALL BEACON', forestWatchtower.x, forestWatchtower.y+28); } }
    }
    for (const zone of noahLightningPending) { const pulse = 2 + Math.sin(ambienceClock * .25) * 2; ctx.strokeStyle = 'rgba(255,235,90,.95)'; ctx.lineWidth = 4; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.arc(zone.x, zone.y, zone.radius + pulse, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
    for (const zone of noahLightningZones) { const alpha = Math.min(.7, zone.life / 80); ctx.strokeStyle = `rgba(180,225,255,${alpha})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = `rgba(120,180,255,${alpha * .18})`; ctx.beginPath(); ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2); ctx.fill(); }
    if (currentMapId === 'crimson') {
        if (rhysBreakWall && !rhysBreakWall.broken) {
            for (const cell of rhysBreakWall.cells) {
                const x = cell.c * TS, y = cell.r * TS;
                ctx.fillStyle = '#4b1215'; ctx.fillRect(x, y, TS, TS);
                ctx.strokeStyle = '#f0c55e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 8, y + 7); ctx.lineTo(x + 30, y + 33); ctx.moveTo(x + 31, y + 8); ctx.lineTo(x + 10, y + 32); ctx.stroke();
            }
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

    for (const loot of groundLoot) {
        ctx.fillStyle = '#86d8ff'; ctx.beginPath(); ctx.arc(loot.x, loot.y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#e6fbff'; ctx.lineWidth = 2; ctx.stroke();
        if (Math.hypot(player.x - loot.x, player.y - loot.y) < 34) { ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; ctx.fillText(`[E] ${ITEM_DEFINITIONS[loot.type].toUpperCase()}`, loot.x, loot.y - 15); }
    }
    for (let g of generators) {
        if (g.isSubway) continue;
        if (g.active || g.repairFlash > 0) {
            const glow = g.repairFlash > 0 ? 0.35 + (g.repairFlash / 45) * 0.35 : 0.16;
            const glowRadius = g.repairFlash > 0 ? 34 : 24;
            const gradient = ctx.createRadialGradient(g.x, g.y, 4, g.x, g.y, glowRadius);
            gradient.addColorStop(0, `rgba(0,255,80,${glow})`);
            gradient.addColorStop(1, 'rgba(0,255,80,0)');
            ctx.fillStyle = gradient;
            ctx.beginPath(); ctx.arc(g.x, g.y, glowRadius, 0, Math.PI * 2); ctx.fill();
        }
        const generatorColor = g.active ? '#0f0' : g.isFalse ? '#9a8060' : g.type === 'fuse' ? '#ffcc00' : g.type === 'multi' ? '#ff8c3a' : g.type === 'tune' ? '#64c7ff' : g.type === 'rapid' ? '#ff63c8' : g.type === 'simon' ? '#a98cff' : '#888';
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
        } else if (!g.active && g.type === 'tune') {
            ctx.fillStyle = '#9de4ff'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center';
            ctx.fillText('TUNE SIGNAL', g.x, g.y + 24);
        } else if (!g.active && g.type === 'rapid') { ctx.fillStyle='#ff9cdd';ctx.font='bold 9px Arial';ctx.fillText('RESPONSE ARRAY',g.x,g.y+24); }
        else if (!g.active && g.type === 'simon') { ctx.fillStyle='#cab8ff';ctx.font='bold 9px Arial';ctx.fillText('COLOR MEMORY',g.x,g.y+24); }
        
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
    const amineVisible = monster.name==='AMINE' && (amineFocus || amineVisibleTimer>0 || state===11 || state===8);
    if (!setOptimization && monster.hasAfterimage && state === 1 && monster.path.length > 0) {
        const previous = monster.path[0];
        const ax = previous.c * TS + TS / 2, ay = previous.r * TS + TS / 2;
        ctx.fillStyle = 'rgba(255,255,255,0.13)';
        ctx.beginPath(); ctx.arc(ax, ay, monster.drawRadius * 0.8, 0, Math.PI * 2); ctx.fill();
    }
    if (!(monster.invisible && state === 1 && !amineVisible) && !(monster.name === 'BASSAM' && bassamState === 'disguised' && state !== 3)) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath(); ctx.ellipse(monster.x, monster.y + monster.drawRadius * 0.65, monster.drawRadius * 0.9, monster.drawRadius * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (monster.invisible && state === 1 && !amineVisible) {
        // Noah is deliberately absent during Hidden Stalk; audio hooks are reserved for later assets.
    } else if (monster.name === 'BASSAM' && bassamState === 'disguised' && state !== 3) {
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
        const enemyAmineVisible = enemy.name === 'AMINE' && (amineFocus || enemy.abilityVisibleTimer > 0 || state === 8);
        if (enemy.invisible && state === 1 && !enemyAmineVisible) continue;
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

    drawNizarAbilities();

    if (!player.hidden) {
        const playerColors = { blue:'#00f', crimson:'#d22', violet:'#a64dff', green:'#19c76b', amber:'#e7a21a', gold:'#e9ca35', sepia:'#800', white:'#f6f6f6' };
        if (cosmetics.trail === 'afterimage') {
            ctx.save();
            ctx.filter = 'blur(2px)';
            for (let index = 0; index < playerTrail.length; index += 2) {
                const point = playerTrail[index];
                const alpha = Math.max(.035, (index / playerTrail.length) * .24);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = playerColors[cosmetics.color] || '#bde8ff';
                ctx.beginPath(); ctx.arc(point.x, point.y, player.r * (0.78 + index / Math.max(1, playerTrail.length) * .18), 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore(); ctx.globalAlpha = 1;
        }
        if (cosmetics.trail !== 'none' && cosmetics.trail !== 'afterimage') {
            const trailColor = cosmetics.trail === 'spark' ? 'rgba(255,238,86,.82)' : cosmetics.trail === 'ember' ? 'rgba(255,70,24,.78)' : cosmetics.trail === 'static' ? 'rgba(185,245,255,.65)' : cosmetics.trail === 'circle' ? 'rgba(255,255,255,.78)' : 'rgba(180,210,255,.42)';
            ctx.strokeStyle = trailColor; ctx.lineWidth = cosmetics.trail === 'ghost' ? 10 : cosmetics.trail === 'ember' ? 4 : 6; ctx.lineCap = cosmetics.trail === 'static' ? 'butt' : 'round'; if (cosmetics.trail === 'static') ctx.setLineDash([8, 7]); ctx.beginPath();
            playerTrail.forEach((point, index) => { if (index === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y); }); ctx.stroke();
            ctx.setLineDash([]); const spacing = cosmetics.trail === 'spark' ? 2 : cosmetics.trail === 'ember' ? 4 : cosmetics.trail === 'circle' ? 6 : 5;
            for (let index = 0; index < playerTrail.length; index += spacing) { const point = playerTrail[index]; ctx.globalAlpha = Math.max(.1, index / playerTrail.length); ctx.fillStyle = trailColor; ctx.beginPath(); if (cosmetics.trail === 'ember') ctx.rect(point.x - 2, point.y - 2, 4, 4); else if (cosmetics.trail === 'circle') { ctx.strokeStyle = trailColor; ctx.lineWidth = 2; ctx.arc(point.x, point.y, 4 + (index % 3), 0, Math.PI * 2); ctx.stroke(); } else ctx.arc(point.x, point.y, cosmetics.trail === 'ghost' ? 5 : cosmetics.trail === 'spark' ? 2 : 3, 0, Math.PI * 2); if (cosmetics.trail !== 'circle') ctx.fill(); } ctx.globalAlpha = 1;
        }
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath(); ctx.ellipse(player.x, player.y + player.r * 0.7, player.r * 0.9, player.r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
        const equippedSkin = skinImages[cosmetics.skin];
        if (cosmetics.skin !== 'default' && equippedSkin?.complete) {
            const skinSize = player.r * 3.35;
            ctx.globalAlpha = player.stunTimer > 0 ? .72 : 1;
            ctx.drawImage(equippedSkin, player.x - skinSize / 2, player.y - skinSize / 2, skinSize, skinSize);
            ctx.globalAlpha = 1;
        } else {
            ctx.fillStyle = player.boostTimer > 0 ? '#0ff' : (player.stunTimer > 0 ? '#ff0' : (playerColors[cosmetics.color] || '#00f'));
            ctx.beginPath(); ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2); ctx.fill();
            if (cosmetics.color === 'sepia' && player.boostTimer <= 0 && player.stunTimer <= 0) { ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(player.x-player.r*.3, player.y-2, 2, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(player.x+player.r*.3, player.y-2, 2, 0, Math.PI*2); ctx.fill(); }
        }
        const equippedMask = maskImages[cosmetics.mask];
        if (cosmetics.mask !== 'none' && equippedMask?.complete) { ctx.drawImage(equippedMask, player.x - player.r * 2, player.y - player.r * 2.15, player.r * 4, player.r * 4); }
        const equippedHat = hatImages[cosmetics.hat];
        if (cosmetics.hat !== 'none' && equippedHat?.complete) { ctx.drawImage(equippedHat, player.x - player.r * 2, player.y - player.r * 2.15, player.r * 4, player.r * 4); }
    }
    ctx.restore();

    if(monsters.some(enemy => enemy.name === 'AMINE')&&amineFocus&&state===1){ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);for(const enemy of monsters.filter(entry=>entry.name==='AMINE')){const sx=(enemy.x-camera.x)*camera.zoom,sy=(enemy.y-camera.y)*camera.zoom;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(sx,sy,enemy.drawRadius*camera.zoom,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(sx-4,sy-2,2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(sx+4,sy-2,2,0,Math.PI*2);ctx.fill();}}

    drawHotelTaskArrows();
    drawForestGuidanceArrows();
    drawSubwayGoldGuidanceArrow();

    if (flareTimer > 0 && (state === 1 || state === 3) && Math.hypot(monster.x - player.x, monster.y - player.y) > 260) {
        const angle = Math.atan2(monster.y - player.y, monster.x - player.x), radius = Math.min(canvas.width, canvas.height) * .42;
        const x = canvas.width / 2 + Math.cos(angle) * radius, y = canvas.height / 2 + Math.sin(angle) * radius;
        ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.fillStyle = '#ffd36b'; ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(-10, -9); ctx.lineTo(-10, 9); ctx.closePath(); ctx.fill(); ctx.restore();
    }

    if (currentMapId === 'crimson' && rhysSweepTimer > 0) {
        const centerX = (COLS * TS) / 2, centerY = (ROWS * TS) / 2;
        const screenX = canvas.width / 2 + (centerX - camera.x - canvas.width / 2) * camera.zoom;
        const screenY = canvas.height / 2 + (centerY - camera.y - canvas.height / 2) * camera.zoom;
        ctx.strokeStyle = `rgba(255,235,150,${Math.min(.9, rhysSweepTimer / 100)})`;
        ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(screenX, screenY, rhysSweepRadius * camera.zoom, 0, Math.PI * 2); ctx.stroke();
    }

    if (state === 1 || state === 2 || state === 3 || state === 5 || state === 6 || state === 7) {
        if (empActive > 0) {
            let grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 20, canvas.width/2, canvas.height/2, 250);
            grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,0.98)');
            ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            let darkness = monster.hasGloom ? 0.85 : (currentMapId === 'forest' ? 0.72 : 0.55);
            if (forestFogTimer > 0) darkness = Math.min(.88, darkness + .10);
            if (flareTimer > 0) darkness = Math.max(0.18, darkness - 0.28);
            if (powerOutageTimer > 0) darkness = Math.min(0.92, darkness + 0.25);
            if (outageFlickerTimer > 0 && ambienceClock % 6 < 3) darkness = Math.max(0.05, darkness - 0.42);
            if (flickerTimer > 0 && ambienceClock % 8 < 4) darkness = Math.max(0, darkness - 0.25);
            ctx.fillStyle = `rgba(0, 0, 0, ${darkness})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    if (currentMapId === 'subway' && subwayGoldPressure?.active && state === 1) {
        const goldPulse = 0.10 + Math.sin(ambienceClock * 0.035) * 0.025;
        ctx.fillStyle = `rgba(214, 166, 48, ${goldPulse})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const goldGlow = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 40, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * .72);
        goldGlow.addColorStop(0, 'rgba(255, 220, 108, 0)');
        goldGlow.addColorStop(1, 'rgba(117, 72, 8, .16)');
        ctx.fillStyle = goldGlow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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
        ctx.fillText(`${currentGen?.isSubway ? 'SIGNAL SWITCH' : 'CIRCUIT REPAIR'} · STAGE ${circuitStage + 1}/${currentGen.requiredStages}`, cx, cy - 55);
        ctx.fillStyle = '#fff'; ctx.font = '18px Arial'; ctx.fillText('Enter the wire sequence', cx, cy - 20);
        ctx.font = '38px Arial'; ctx.fillText(circuitSequence.map(key => key.toUpperCase()).join('  '), cx, cy + 35);
        ctx.font = '16px Arial'; ctx.fillText('Use the W A S D buttons', cx, cy + 78);
    }

    if (state === 13 && routeBoard) {
        const layout = getRouteBoardLayout();
        ctx.fillStyle = 'rgba(2,7,10,.92)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#b9e9ff'; ctx.textAlign = 'center'; ctx.font = 'bold 23px Arial'; ctx.fillText('ROUTE BOARD', canvas.width / 2, 58);
        ctx.fillStyle = '#d4dfe5'; ctx.font = '15px Arial'; ctx.fillText('Tap or click tiles to rotate the glowing route.', canvas.width / 2, 84);
        ctx.fillStyle = '#6df2a2'; ctx.fillText('INPUT', layout.left - 34, layout.top + layout.tileSize / 2 + 5);
        ctx.fillStyle = '#ffd36b'; ctx.fillText('EXIT', layout.left + routeBoard.size * (layout.tileSize + layout.gap) + 28, layout.top + (routeBoard.size - 1) * (layout.tileSize + layout.gap) + layout.tileSize / 2 + 5);
        routeBoard.tiles.forEach((tile, index) => {
            const col = index % routeBoard.size, row = Math.floor(index / routeBoard.size);
            const x = layout.left + col * (layout.tileSize + layout.gap), y = layout.top + row * (layout.tileSize + layout.gap), midX = x + layout.tileSize / 2, midY = y + layout.tileSize / 2;
            ctx.fillStyle = '#16232b'; ctx.fillRect(x, y, layout.tileSize, layout.tileSize); ctx.strokeStyle = '#567080'; ctx.lineWidth = 2; ctx.strokeRect(x, y, layout.tileSize, layout.tileSize);
            const directions = tile.kind === 'straight' ? (tile.current === 0 ? [[-1,0],[1,0]] : [[0,-1],[0,1]]) : [[[0,-1],[1,0]], [[1,0],[0,1]], [[0,1],[-1,0]], [[-1,0],[0,-1]]][tile.current];
            ctx.strokeStyle = '#7be8ff'; ctx.lineWidth = Math.max(10, layout.tileSize * .13); ctx.lineCap = 'round'; ctx.beginPath();
            directions.forEach(([dx,dy]) => { ctx.moveTo(midX, midY); ctx.lineTo(midX + dx * layout.tileSize * .46, midY + dy * layout.tileSize * .46); }); ctx.stroke();
            ctx.fillStyle = '#d8fbff'; ctx.beginPath(); ctx.arc(midX, midY, Math.max(5, layout.tileSize * .08), 0, Math.PI * 2); ctx.fill();
        });
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
    if (state === 7) {
        const cx = canvas.width / 2, cy = canvas.height / 2, width = Math.min(420, canvas.width * .72), left = cx - width / 2;
        ctx.fillStyle = 'rgba(0,0,0,.68)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#9de4ff'; ctx.font = 'bold 23px Arial'; ctx.textAlign = 'center'; ctx.fillText(`FREQUENCY TUNE · ${tuneHits}/${tuneRequired}`, cx, cy - 62);
        ctx.fillStyle = '#26323a'; ctx.fillRect(left, cy - 12, width, 24);
        ctx.fillStyle = '#40d992'; ctx.fillRect(left + width * tuneZoneStart, cy - 12, width * (tuneZoneEnd - tuneZoneStart), 24);
        ctx.fillStyle = '#fff'; ctx.fillRect(left + width * tuneNeedle - 3, cy - 27, 6, 54);
        ctx.font = '16px Arial'; ctx.fillText(scDelay > 0 ? 'STABILIZING...' : 'TAP ALIGN WHEN THE NEEDLE IS GREEN', cx, cy + 62);
    }
    if(state===9){ctx.fillStyle='rgba(7,3,10,.9)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#ff75d2';ctx.lineWidth=2;ctx.strokeRect(18,18,canvas.width-36,74);ctx.fillStyle='#fff';ctx.font='bold 22px Arial';ctx.textAlign='center';ctx.fillText('RESPONSE ARRAY',canvas.width/2,48);ctx.font='15px Arial';ctx.fillStyle='#ffc1e9';ctx.fillText(`CLICK THE SIGNALS · ${rapidHits}/${rapidRequired}`,canvas.width/2,74);if(rapidTarget){ctx.fillStyle='rgba(255,79,197,.25)';ctx.beginPath();ctx.arc(rapidTarget.x,rapidTarget.y,rapidTarget.r+13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff4fc5';ctx.beginPath();ctx.arc(rapidTarget.x,rapidTarget.y,rapidTarget.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(rapidTarget.x,rapidTarget.y,rapidTarget.r,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fff';ctx.font='bold 19px Arial';ctx.fillText('TAP',rapidTarget.x,rapidTarget.y+7);}}
    if(state===10){ctx.fillStyle='rgba(0,0,0,.82)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#fff';ctx.font='bold 22px Arial';ctx.textAlign='center';ctx.fillText(`COLOR MEMORY · ROUND ${simonRound}/${simonSequence.length}`,canvas.width/2,70);const colors=['#e33','#38f','#3c5','#fd3'],symbols=['▲','●','■','★'],size=100,gap=14,left=canvas.width/2-size-gap/2,top=canvas.height/2-size-gap/2,active=simonPhase==='show'?simonSequence[Math.min(simonShowIndex,simonRound-1)]:-1;for(let i=0;i<4;i++){const x=left+(i%2)*(size+gap),y=top+Math.floor(i/2)*(size+gap),flashing=i===simonFlashChoice&&simonFlashTimer>0;ctx.fillStyle=i===active||flashing?'#fff':colors[i];ctx.fillRect(x,y,size,size);ctx.strokeStyle=flashing?'#fff':'rgba(255,255,255,.2)';ctx.lineWidth=flashing?5:1;ctx.strokeRect(x,y,size,size);ctx.fillStyle=i===active||flashing?colors[i]:'#111';ctx.font='bold 30px Arial';ctx.fillText(symbols[i],x+size/2,y+60);}ctx.fillStyle='#ddd';ctx.font='15px Arial';ctx.fillText(simonPhase==='show'?'WATCH THE PATTERN':'REPEAT THE PATTERN',canvas.width/2,top+size*2+gap+38);}
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
document.addEventListener('change', event => { if (event.target?.id?.startsWith('survival')) updateSurvivalSummary(); });
applySettings();
updateMenuData();
setupDeveloperStudio();
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
        content.innerHTML = `<button ${usable('adrenaline', invAdrenaline)} onclick="mobileKey(' '); closeMobileActionMenu()">ADRENALINE (${invAdrenaline})</button><button ${usable('flashbang', invFlashbang)} onclick="mobileKey('f'); closeMobileActionMenu()">FLASHBANG (${invFlashbang})</button><button ${usable('noiseMaker', invNoiseMaker)} onclick="mobileKey('n'); closeMobileActionMenu()">NOISE MAKER (${invNoiseMaker})</button><button ${usable('bearTrap', invBearTrap)} onclick="mobileKey('t'); closeMobileActionMenu()">BEAR TRAP (${invBearTrap})</button><button ${usable('battery', invBattery)} onclick="mobileKey('r'); closeMobileActionMenu()">EMERGENCY BATTERY (${invBattery})</button><button ${usable('signalScrambler', invSignalScrambler)} onclick="mobileKey('x'); closeMobileActionMenu()">SIGNAL SCRAMBLER (${invSignalScrambler})</button><button ${usable('neutralizer', invNeutralizer)} onclick="mobileKey('g'); closeMobileActionMenu()">GOOP NEUTRALIZER (${invNeutralizer})</button><button ${usable('repairKit', invRepairKit)} onclick="mobileKey('k'); closeMobileActionMenu()">REPAIR KIT (${invRepairKit})</button><button ${usable('flare', invFlare)} onclick="mobileKey('l'); closeMobileActionMenu()">EMERGENCY FLARE (${invFlare})</button>`;
    }
}

function updateMobileSkillCheckButton() {
    const button = document.getElementById('touchSkillCheck');
    if (!button) return;
    const active = state === 5 || state === 7;
    button.style.display = active ? 'block' : 'none';
    button.disabled = !active || scDelay > 0;
    button.textContent = scDelay > 0 ? 'READY...' : state === 7 ? 'ALIGN' : 'HIT';
    const focus=document.getElementById('touchFocus'); if(focus) focus.style.display=monsters.some(enemy => enemy.name === 'AMINE')&&state===1?'block':'none';
    const dash=document.getElementById('touchDash'); if(dash) { dash.style.display=upgDash && (state===1 || state===3) ? 'block' : 'none'; dash.disabled=!upgDash || dashCooldown>0; dash.textContent=dashCooldown>0 ? `${Math.ceil(dashCooldown/60)}s` : 'DASH'; }
    const mapButton=document.getElementById('mapButton'); if(mapButton) mapButton.style.display=mapIntel.includes(currentMapId) && (state===1 || state===3) ? 'block' : 'none';
    const roadControls=document.getElementById('amineRoadControls'); if(roadControls) roadControls.style.display=state===11 && isMobileClient()?'flex':'none';
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
        const directionLength = Math.hypot(dx, dy);
        lastMoveX = dx / directionLength;
        lastMoveY = dy / directionLength;
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
    bindHoldAction('amineRoadLeft', 'a');
    bindHoldAction('amineRoadRight', 'd');
    document.getElementById('amineRoadFire')?.addEventListener('pointerdown', event => { event.preventDefault(); fireAmineRoadWeapon(amineRoad?.aimX); });
    document.getElementById('touchDash')?.addEventListener('pointerdown', event => { event.preventDefault(); useDash(); });
    document.getElementById('touchAbilities')?.addEventListener('pointerdown', event => { event.preventDefault(); openMobileActionMenu('abilities'); });
    document.getElementById('touchItems')?.addEventListener('pointerdown', event => { event.preventDefault(); openMobileActionMenu('items'); });
    document.getElementById('touchSkillCheck')?.addEventListener('pointerdown', event => {
        event.preventDefault();
        if ((state === 5 || state === 7) && scDelay <= 0) mobileKey(' ');
    });
    const focus=document.getElementById('touchFocus');
    const releaseFocus=event=>{event.preventDefault();amineFocus=false;};
    focus?.addEventListener('pointerdown',event=>{event.preventDefault();if(monsters.some(enemy => enemy.name === 'AMINE')&&state===1)amineFocus=true;});
    focus?.addEventListener('pointerup',releaseFocus); focus?.addEventListener('pointercancel',releaseFocus); focus?.addEventListener('pointerleave',releaseFocus);

    document.querySelectorAll('[data-puzzle-key]').forEach(button => {
        button.addEventListener('pointerdown', event => {
            event.preventDefault();
            triggerKey(button.dataset.puzzleKey);
        });
    });

    const puzzlePad = document.getElementById('touchPuzzle');
    function updatePuzzlePad() {
        if (puzzlePad) puzzlePad.style.display = (state === 2 || state === 6) ? 'grid' : 'none';
        const touchActions = document.querySelector('.touch-actions');
        const joystickElement = document.getElementById('joystick');
        const canvasPuzzle = state === 9 || state === 10 || state === 11 || state === 14 || state === 16 || state === 17;
        const shadowDimension = state === 18;
        const bossFight = state === 20;
        const bossScene = state === 19 || state === 21;
        if (touchActions) touchActions.style.visibility = canvasPuzzle || shadowDimension || bossFight || bossScene ? 'hidden' : 'visible';
        if (joystickElement) joystickElement.style.visibility = canvasPuzzle || bossScene ? 'hidden' : 'visible';
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



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
    if (!audioCtx || setVolM == 0 || setVolS == 0) return;
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
    }
}

// Save Data Data
let tokens = parseInt(localStorage.getItem('br_tokens')) || 0;
let upgShoe = parseInt(localStorage.getItem('br_shoe')) || 0;
let upgHack = parseInt(localStorage.getItem('br_hack')) || 0;
let upgQuick = parseInt(localStorage.getItem('br_quick')) || 0;
let upgCoin = parseInt(localStorage.getItem('br_coin')) || 0;
let invAdrenaline = parseInt(localStorage.getItem('br_adrenaline')) || 0;
let invFlashbang = parseInt(localStorage.getItem('br_flashbang')) || 0;

// Settings Data
let setFPS = localStorage.getItem('br_fps') === 'true';
let setCRT = localStorage.getItem('br_crt') === 'true';
let setVolM = localStorage.getItem('br_volM') || 100;
let setVolS = localStorage.getItem('br_volS') || 100;

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
    localStorage.setItem('br_tokens', tokens);
    localStorage.setItem('br_shoe', upgShoe);
    localStorage.setItem('br_hack', upgHack);
    localStorage.setItem('br_quick', upgQuick);
    localStorage.setItem('br_coin', upgCoin);
    localStorage.setItem('br_adrenaline', invAdrenaline);
    localStorage.setItem('br_flashbang', invFlashbang);
    updateMenuData();
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

function showMenu(menuId) {
    document.querySelectorAll('.menu-panel').forEach(p => p.style.display = 'none');
    hud.style.display = 'none';
    document.getElementById(menuId).style.display = 'flex';
    updateMenuData();
}

function showInstallHelp() { showMenu('installMenu'); }

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
    if (tokens >= cost) {
        tokens -= cost;
        if (type === 'adrenaline') invAdrenaline++;
        if (type === 'flashbang') invFlashbang++;
        saveData();
    }
}

// Game Core Settings
const TS = 40; const COLS = 31; const ROWS = 23; 
let state = 0; let currentDiff = 0; let rewardTokens = 0;

let map = [], floors = [];
let player = { x: 0, y: 0, r: 12, baseSpeed: 3.8, speed: 3.8, boostTimer: 0, stunTimer: 0, direction: null, queuedDirection: 'd' };
let monster = { name: '', x: 0, y: 0, r: 14, drawRadius: 14, speed: 2.2, baseSpeed: 2.2, color: '', textColor: '', activeMutations: [], isReinforced: false, hasGloom: false, isResilient: false, hasScrambler: false, hasHexed: false, stunTimer: 0, lastTargetC: -1, lastTargetR: -1 };
let camera = { x: 0, y: 0, targetZoom: 1.0, zoom: 1.0 };
let nearGen = null; 

let generators = [], activeGens = 0, totalGens = 0;
let puzzleSequence = [], currentGen = null;
let lastSingleMutation = null; 

// AI & Item Variables
let jordanState = 'saboteur', mimicTimer = 0, stateTimer = 0, jordanSabotageCooldown = 0;
let empTimer = 0, empWarning = 0, empActive = 0, flashAlpha = 0;

// Skill Check Variables
let scNeedle = 0, scSpeed = 0, scZoneStart = 0, scZoneEnd = 0, scHits = 0, scRequired = 0, scDelay = 0;

let lastTime = 0, frames = 0;
let lastFrameTime = 0, gameAccumulator = 0;
const keys = { w: false, a: false, s: false, d: false };
let lastDirection = 'd';

window.addEventListener('keydown', (e) => {
    let k = e.key.toLowerCase();
    if (state === 0 || state === 4) return;
    
    // Adrenaline
    if ((state === 1 || state === 3) && k === ' ' && invAdrenaline > 0 && player.boostTimer <= 0 && player.stunTimer <= 0) {
        invAdrenaline--;
        player.boostTimer = monster.hasHexed ? 120 : 240; 
        saveData(); updateHUD();
    }

    // Flashbang
    if ((state === 1 || state === 3) && k === 'f' && invFlashbang > 0 && monster.stunTimer <= 0) {
        invFlashbang--;
        monster.stunTimer = monster.isResilient ? 120 : 240; 
        flashAlpha = 1.0;
        playSound('emp');
        saveData(); updateHUD();
    }

    // Generator Interaction
    if (state === 1 && k === 'e' && nearGen && player.stunTimer <= 0) {
        currentGen = nearGen;
        keys.w = false; keys.a = false; keys.s = false; keys.d = false;

        let roll = Math.random();
        let isSkillCheck = (currentDiff === 0 && roll < 0.2) || (currentDiff === 1 && roll < 0.5) || (currentDiff === 2 && roll < 0.8);
        
        if (isSkillCheck) {
            state = 5;
            scNeedle = 0; scHits = 0; 
            scRequired = Math.max(1, 3 - upgHack + (monster.isReinforced ? 1 : 0));
            scSpeed = (currentDiff === 0 ? 0.015 : currentDiff === 1 ? 0.025 : 0.035) * (1 - (upgQuick * 0.10));
            let zoneWidth = currentDiff === 0 ? Math.PI/2 : currentDiff === 1 ? Math.PI/3 : Math.PI/5;
            scZoneStart = Math.random() * (Math.PI*2 - zoneWidth);
            scZoneEnd = scZoneStart + zoneWidth;
            scDelay = 60; 
        } else {
            state = 2;
            let opts = ['w','a','s','d'];
            let seqLength = Math.max(1, 3 - upgHack + (monster.isReinforced ? 1 : 0));
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
                currentGen.active = true; activeGens++;
                state = 1; checkPhase();
                if(state===1 && monster.isFrenzy) monster.speed += 0.15;
            } else {
                scZoneStart = Math.random() * (Math.PI*2 - (scZoneEnd - scZoneStart));
                scZoneEnd = scZoneStart + (currentDiff === 0 ? Math.PI/2 : currentDiff === 1 ? Math.PI/3 : Math.PI/5);
                scNeedle = 0;
            }
        } else {
            state = 1; player.stunTimer = 120;
            playSound('fail'); keys.w = false; keys.a = false; keys.s = false; keys.d = false;
        }
        return;
    }
    
    // Typing Input
    if (state === 2) {
        if (k === puzzleSequence[0]) {
            puzzleSequence.shift();
            playSound('tick');
            if (puzzleSequence.length === 0) {
                currentGen.active = true; activeGens++;
                playSound('success');
                state = 1; checkPhase();
                keys.w = false; keys.a = false; keys.s = false; keys.d = false;
                if (state === 1 && monster.isFrenzy) monster.speed += 0.15; 
            }
        } else if (['w','a','s','d'].includes(k)) {
            state = 1; player.stunTimer = 120; playSound('fail');
        }
        return;
    }
    if (k in keys) {
        keys[k] = true;
        lastDirection = k;
        player.queuedDirection = k;
    }
});
window.addEventListener('keyup', (e) => {
    let k = e.key.toLowerCase();
    if (k in keys) {
        keys[k] = false;
        if (lastDirection === k) {
            const heldDirection = ['w', 'a', 's', 'd'].find(direction => keys[direction]);
            if (heldDirection) lastDirection = heldDirection;
        }
    }
});

function generateMaze() {
    map = Array.from({length: ROWS}, () => Array(COLS).fill(1));
    floors = [];
    function carve(r, c) {
        map[r][c] = 0;
        let dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]];
        dirs.sort(() => Math.random() - 0.5);
        for (let d of dirs) {
            let nr = r + d[0], nc = c + d[1];
            if (nr > 0 && nr < ROWS - 1 && nc > 0 && nc < COLS - 1 && map[nr][nc] === 1) {
                map[r + d[0]/2][c + d[1]/2] = 0;
                carve(nr, nc);
            }
        }
    }
    carve(1, 1);
    for (let r = 1; r < ROWS - 1; r++) {
        for (let c = 1; c < COLS - 1; c++) {
            if (map[r][c] === 1) {
                let vert = map[r-1][c] === 0 && map[r+1][c] === 0;
                let horz = map[r][c-1] === 0 && map[r][c+1] === 0;
                if ((vert || horz) && Math.random() < 0.15) map[r][c] = 0;
            }
        }
    }
    for (let r = 1; r < ROWS - 1; r++) {
        for (let c = 1; c < COLS - 1; c++) {
            if (map[r][c] === 0) floors.push({r, c});
        }
    }
}

function startGame(diffLevel) {
    initAudio();
    currentDiff = diffLevel;
    document.querySelectorAll('.menu-panel').forEach(p => p.style.display = 'none');
    hud.style.display = 'block';
    
    generateMaze();
    
    player.x = TS * 1.5; player.y = TS * 1.5;
    player.baseSpeed = 3.8 * (1 + (upgShoe * 0.05));
    player.speed = player.baseSpeed;
    player.boostTimer = 0; player.stunTimer = 0;
    player.direction = null; player.queuedDirection = 'd';
    camera.targetZoom = 1.0; camera.zoom = 1.0;
    nearGen = null; flashAlpha = 0;
    
    let diffData = [
        { t: 10, gMin: 3, gMax: 4, mMin: 0, mMax: 1, mSpd: 2.2 },
        { t: 25, gMin: 4, gMax: 5, mMin: 1, mMax: 2, mSpd: 2.7 },
        { t: 40, gMin: 5, gMax: 6, mMin: 2, mMax: 3, mSpd: 3.1 }
    ][diffLevel];
    
    rewardTokens = diffData.t;

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

    let startTile = floors[floors.length - 1];
    
    monster = { 
        name: monsterName,
        x: startTile.c * TS + TS / 2, y: startTile.r * TS + TS / 2, 
        r: 14, drawRadius: 14, 
        speed: diffData.mSpd, baseSpeed: diffData.mSpd,
        color: '#800', textColor: 'red',
        allSeeing: false, isPhantom: false, isFrenzy: false, isReinforced: false, hasGloom: false, isResilient: false, hasScrambler: false, hasHexed: false, stunTimer: 0, lastTargetC: -1, lastTargetR: -1,
        path: [], activeMutations: []
    };

    empTimer = 0; empWarning = 0; empActive = 0;
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
        { name: 'Hexed', apply: (m) => m.hasHexed = true }
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
    
    totalGens = Math.floor(Math.random() * (diffData.gMax - diffData.gMin + 1)) + diffData.gMin;
    activeGens = 0; generators = [];
    
    let genPool = [...floors].sort(() => Math.random() - 0.5);
    for (let tile of genPool) {
        if (generators.length >= totalGens) break;
        let tx = tile.c * TS + TS / 2, ty = tile.r * TS + TS / 2;
        if (!generators.some(g => Math.hypot(tx - g.x, ty - g.y) < TS * 6)) {
            generators.push({ x: tx, y: ty, r: 12, active: false });
        }
    }
    while (generators.length < totalGens) {
        let tile = genPool.pop();
        if (!tile) break; // Breakout to prevent infinite generation looping
        let tx = tile.c * TS + TS / 2, ty = tile.r * TS + TS / 2;
        generators.push({ x: tx, y: ty, r: 12, active: false });
    }
    
    canvas.classList.remove('shake');
    state = 1; updateHUD();
}

function endGame(isWin) {
    state = 4;
    document.querySelectorAll('.menu-panel').forEach(p => p.style.display = 'none');
    hud.style.display = 'none';
    document.getElementById('endMenu').style.display = 'flex';
    document.getElementById('endTitle').innerText = isWin ? "YOU WIN!" : "CAUGHT!";
    document.getElementById('endTitle').style.color = isWin ? "#0f0" : "#f00";
    
    if (isWin) {
        let earned = Math.floor(rewardTokens * (upgCoin > 0 ? 1.5 : 1));
        tokens += earned;
        saveData();
        playSound('success');
        document.getElementById('endDesc').innerHTML = `You caught ${monster.name}.<br>+${earned} Tokens`;
    } else {
        playSound('fail');
        document.getElementById('endDesc').innerHTML = `${monster.name} tore you apart.`;
    }
}

function checkPhase() {
    updateHUD();
    if (activeGens >= totalGens) {
        state = 3; 
        monster.speed = 4.0; 
        player.speed = player.baseSpeed + 1.0; 
        showMsg(`<span style="color:#0f0">POWER RESTORED</span><br>GO CATCH ${monster.name}`, 3500);
        
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
    msgBox.innerHTML = text; msgBox.style.display = 'block';
    if (time > 0) setTimeout(hideMsg, time);
}
function hideMsg() { msgBox.style.display = 'none'; }

function updateHUD() {
    document.getElementById('genCount').innerText = monster.hasScrambler ? "?/?" : `${activeGens}/${totalGens}`;
    
    let invText = [];
    if (invAdrenaline > 0) invText.push(`Adrenaline: ${invAdrenaline} (SPACE)`);
    if (invFlashbang > 0) invText.push(`Flashbang: ${invFlashbang} (F)`);
    document.getElementById('inventory').innerText = invText.join(' | ');
    
    let mText = monster.activeMutations.length > 0 ? `[${monster.activeMutations.join(', ')}]` : '[None]';
    let title = monster.name === 'JORDAN' && jordanState === 'mimic' ? '???' : monster.name;
    document.getElementById('mutations').innerHTML = `<span style="color:${monster.textColor}">${title}</span> <br> Mutations: ${mText}`;
}

function moveEntity(ent, dx, dy) {
    ent.x += dx; if (checkWall(ent)) ent.x -= dx;
    ent.y += dy; if (checkWall(ent)) ent.y -= dy;
}

const directionVectors = {
    w: { x: 0, y: -1 },
    a: { x: -1, y: 0 },
    s: { x: 0, y: 1 },
    d: { x: 1, y: 0 }
};
const oppositeDirections = { w: 's', s: 'w', a: 'd', d: 'a' };

function canEnterTile(c, r) {
    return r >= 0 && r < ROWS && c >= 0 && c < COLS && map[r][c] === 0;
}

function canMoveInDirection(direction) {
    const vector = directionVectors[direction];
    const c = Math.floor(player.x / TS) + vector.x;
    const r = Math.floor(player.y / TS) + vector.y;
    return canEnterTile(c, r);
}

function updateGridPlayerMovement() {
    const heldDirection = keys[player.queuedDirection]
        ? player.queuedDirection
        : ['w', 'a', 's', 'd'].find(direction => keys[direction]);

    if (!heldDirection) {
        player.direction = null;
        return;
    }

    const currentDirection = player.direction;
    const isReverse = currentDirection && oppositeDirections[currentDirection] === heldDirection;
    // Reverse immediately. A valid perpendicular turn is also accepted
    // immediately, then the lane coordinate snaps to the new corridor.
    if (!currentDirection || isReverse || (heldDirection !== currentDirection && canMoveInDirection(heldDirection))) {
        if (isReverse || !currentDirection || canMoveInDirection(heldDirection)) {
            player.direction = heldDirection;
        }
    }

    if (!player.direction) return;

    const vector = directionVectors[player.direction];
    const movingHorizontally = vector.x !== 0;
    const tileCenterX = Math.floor(player.x / TS) * TS + TS / 2;
    const tileCenterY = Math.floor(player.y / TS) * TS + TS / 2;

    // Snap only the lane coordinate. The movement coordinate remains smooth.
    if (movingHorizontally) {
        player.y = tileCenterY;
    } else {
        player.x = tileCenterX;
    }
    moveEntity(player, vector.x * player.speed, vector.y * player.speed);
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
    // BOUNDARY FIX: If any point is outside the grid, return empty path immediately to prevent crashes
    if (sc < 0 || sc >= COLS || sr < 0 || sr >= ROWS || tc < 0 || tc >= COLS || tr < 0 || tr >= ROWS) return [];
    if (map[tr][tc] === 1) return [];
    
    let queue = [{c: sc, r: sr, path: []}];
    let visited = Array.from({length: ROWS}, () => Array(COLS).fill(false));
    visited[sr][sc] = true;
    let dirs = [[0,1], [1,0], [0,-1], [-1,0]];
    while(queue.length > 0) {
        let curr = queue.shift();
        if (curr.c === tc && curr.r === tr) return curr.path;
        for (let d of dirs) {
            let nc = curr.c + d[0], nr = curr.r + d[1];
            if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && map[nr][nc] === 0 && !visited[nr][nc]) {
                visited[nr][nc] = true;
                queue.push({c: nc, r: nr, path: [...curr.path, {c: nc, r: nr}]});
            }
        }
    }
    return [];
}

function moveMonsterAlongPath(spd) {
    if (monster.path.length > 0) {
        let target = monster.path[0], tx = target.c * TS + TS/2, ty = target.r * TS + TS/2;
        if (Math.hypot(tx - monster.x, ty - monster.y) < spd) {
            monster.x = tx; monster.y = ty; monster.path.shift();
        } else {
            let ang = Math.atan2(ty - monster.y, tx - monster.x);
            moveEntity(monster, Math.cos(ang) * spd, Math.sin(ang) * spd);
        }
    }
}

function update() {
    if (state !== 1 && state !== 3 && state !== 5) return;

    if (flashAlpha > 0) flashAlpha -= 0.02;
    if (jordanSabotageCooldown > 0) jordanSabotageCooldown--;

    if (monster.name === 'CALEB' && state === 1) {
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
            if (empTimer <= 0) empWarning = 60; 
        }
    } else {
        empActive = 0; empWarning = 0;
    }

    if (player.stunTimer > 0) {
        player.stunTimer--;
    } else {
        if (player.boostTimer > 0) {
            player.boostTimer--;
            player.speed = player.baseSpeed * 1.5;
            if (player.boostTimer <= 0) player.speed = player.baseSpeed;
        }

        if (state === 1 || state === 3) updateGridPlayerMovement();
    }

    nearGen = null;
    if (state === 1 && player.stunTimer <= 0) {
        for (let g of generators) {
            if (!g.active && Math.hypot(player.x - g.x, player.y - g.y) < player.r + g.r + 15) {
                nearGen = g; break;
            }
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
    if (monster.stunTimer > 0) {
        monster.stunTimer--;
    } else if (state === 1 || state === 3) {
        let canSeePlayer = getLineOfSight(monster.x, monster.y, player.x, player.y);
        
        if (state === 1 && monster.name === 'JORDAN') {
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
                    moveMonsterAlongPath(monster.speed);
                    
                    if (Math.hypot(monster.x - targetGen.x, monster.y - targetGen.y) < 10) {
                        targetGen.active = false; activeGens--; 
                        jordanSabotageCooldown = 1800; 
                        updateHUD(); monster.path = [];
                    }
                } else {
                    if (monster.path.length === 0) {
                        let tile = floors[Math.floor(Math.random() * floors.length)];
                        monster.path = findPath(Math.floor(monster.x/TS), Math.floor(monster.y/TS), tile.c, tile.r);
                    }
                    moveMonsterAlongPath(monster.speed);
                }
                
                if (mimicTimer <= 0) {
                    let safeTile = floors[Math.floor(Math.random() * floors.length)];
                    let attempts = 0; // INFINITE LOOP PREVENTION
                    while(generators.some(g => Math.abs(g.x - (safeTile.c*TS+TS/2)) < TS && Math.abs(g.y - (safeTile.r*TS+TS/2)) < TS) && attempts < 50) {
                        safeTile = floors[Math.floor(Math.random() * floors.length)];
                        attempts++;
                    }
                    monster.x = safeTile.c * TS + TS/2; monster.y = safeTile.r * TS + TS/2;
                    jordanState = 'mimic'; stateTimer = 900; monster.path = []; updateHUD();
                }
                
                if (Math.hypot(player.x - monster.x, player.y - monster.y) < player.r + monster.r) {
                    endGame(false);
                }
            } else if (jordanState === 'mimic') {
                stateTimer--;
                if (stateTimer <= 0) { jordanState = 'saboteur'; mimicTimer = 600; updateHUD(); }
                if (Math.hypot(player.x - monster.x, player.y - monster.y) < player.r + monster.r + 5) {
                    jordanState = 'stun'; stateTimer = 180; 
                    playSound('fail');
                    showMsg(`<span style='color:red; font-size:30px'>THAT'S NOT A GENERATOR...</span>`, 2500); updateHUD();
                }
            } else if (jordanState === 'stun') {
                stateTimer--;
                if (stateTimer <= 0) { jordanState = 'enrage'; stateTimer = 600; canvas.classList.add('shake'); playSound('emp'); }
            } else if (jordanState === 'enrage') {
                stateTimer--;
                let boostSpeed = monster.baseSpeed * 1.45; 
                let pC = Math.floor(player.x/TS), pR = Math.floor(player.y/TS);
                if (monster.lastTargetC !== pC || monster.lastTargetR !== pR || monster.path.length === 0) {
                    monster.path = findPath(Math.floor(monster.x/TS), Math.floor(monster.y/TS), pC, pR);
                    monster.lastTargetC = pC; monster.lastTargetR = pR;
                }
                moveMonsterAlongPath(boostSpeed);
                
                if (stateTimer <= 0) { jordanState = 'saboteur'; mimicTimer = 600; canvas.classList.remove('shake'); }
                if (Math.hypot(player.x - monster.x, player.y - monster.y) < player.r + monster.r) {
                    canvas.classList.remove('shake'); endGame(false);
                }
            }
        } 
        else if (state === 1) { // Chase
            if (monster.isPhantom) {
                let ang = Math.atan2(player.y - monster.y, player.x - monster.x);
                monster.x += Math.cos(ang) * monster.speed;
                monster.y += Math.sin(ang) * monster.speed;
            } else {
                if (canSeePlayer) {
                    let pC = Math.floor(player.x/TS), pR = Math.floor(player.y/TS);
                    if (monster.lastTargetC !== pC || monster.lastTargetR !== pR || monster.path.length === 0) {
                        monster.path = findPath(Math.floor(monster.x/TS), Math.floor(monster.y/TS), pC, pR);
                        monster.lastTargetC = pC; monster.lastTargetR = pR;
                    }
                    moveMonsterAlongPath(monster.speed);
                } else {
                    if (monster.path.length === 0 || (monster.allSeeing && Math.random() < 0.05)) {
                        let targetC = monster.allSeeing ? Math.floor(player.x/TS) : floors[Math.floor(Math.random() * floors.length)].c;
                        let targetR = monster.allSeeing ? Math.floor(player.y/TS) : floors[Math.floor(Math.random() * floors.length)].r;
                        monster.path = findPath(Math.floor(monster.x/TS), Math.floor(monster.y/TS), targetC, targetR);
                    }
                    moveMonsterAlongPath(monster.speed);
                }
            }
            if (Math.hypot(player.x - monster.x, player.y - monster.y) < player.r + monster.r - 2) {
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
            moveMonsterAlongPath(monster.speed);
            
            if (Math.hypot(player.x - monster.x, player.y - monster.y) < player.r + monster.r - 2) {
                endGame(true);
            }
        }
    }
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
        ctx.fillStyle = g.active ? '#0f0' : '#888';
        ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
        
        if (state === 1 && nearGen === g && player.stunTimer <= 0) {
            ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
            ctx.fillText("[E]", g.x, g.y - 18);
        }
    }

    let dist = Math.hypot(player.x - monster.x, player.y - monster.y);
    if (monster.name === 'JORDAN' && jordanState === 'mimic' && state !== 3) {
        ctx.fillStyle = '#888';
        ctx.beginPath(); ctx.arc(monster.x, monster.y, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
    } else if (!monster.isPhantom || dist < 200 || state === 3) {
        ctx.fillStyle = monster.stunTimer > 0 ? '#fff' : (state === 3 ? '#555' : monster.color); 
        ctx.beginPath(); ctx.arc(monster.x, monster.y, monster.drawRadius, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = state === 3 ? 'black' : monster.textColor;
        ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
        ctx.fillText(monster.name, monster.x, monster.y - monster.drawRadius - 5);
    }

    ctx.fillStyle = player.boostTimer > 0 ? '#0ff' : (player.stunTimer > 0 ? '#ff0' : '#00f');
    ctx.beginPath(); ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    if (state === 1 || state === 2 || state === 5) {
        if (empActive > 0) {
            let grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 20, canvas.width/2, canvas.height/2, 250);
            grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,0.98)');
            ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = monster.hasGloom ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.55)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
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

applySettings();
updateMenuData();
requestAnimationFrame(loop);




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
        if (Math.abs(dx) > Math.abs(dy)) {
            player.queuedDirection = dx > 0 ? 'd' : 'a';
            keys[player.queuedDirection] = true;
        } else {
            player.queuedDirection = dy > 0 ? 's' : 'w';
            keys[player.queuedDirection] = true;
        }
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

    bindAction('touchInteract', 'e');
    bindAction('touchBoost', ' ');
    bindAction('touchFlash', 'f');

    document.querySelectorAll('[data-puzzle-key]').forEach(button => {
        button.addEventListener('pointerdown', event => {
            event.preventDefault();
            triggerKey(button.dataset.puzzleKey);
        });
    });

    const puzzlePad = document.getElementById('touchPuzzle');
    function updatePuzzlePad() {
        if (puzzlePad) puzzlePad.style.display = state === 2 ? 'grid' : 'none';
    }
    setInterval(updatePuzzlePad, 100);

    const fullscreenButton = document.getElementById('touchFullscreen');
    fullscreenButton?.addEventListener('pointerdown', async (event) => {
        event.preventDefault();
        try {
            if (!document.documentElement.requestFullscreen) {
                showMsg('For fullscreen, use<br><b>ADD TO HOME SCREEN</b>', 3000);
                return;
            }
            if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
            else await document.exitFullscreen();
        } catch (error) {
            showMsg('Use <b>PHONE / INSTALL</b><br>for fullscreen mode.', 3000);
        }
    });

    document.addEventListener('contextmenu', event => event.preventDefault());
})();

// Mobile browsers require audio to be created or resumed from a user gesture.
window.addEventListener('pointerdown', () => initAudio(), { passive: true });
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

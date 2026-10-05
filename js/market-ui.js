(() => {
    'use strict';

    const STOCK_KEY = 'calebs_shift_black_market_stock_v1';
    const STOCK_OPTIONS = Object.freeze([
        { id: 'adrenaline', name: 'Adrenaline Syringe', price: 15, description: 'A short burst of speed when the halls close in.', symbol: 'ϟ', icon: 'assets/ui/icons/market/AdrenalineSyringeIcon.svg' },
        { id: 'flashbang', name: 'Flashbang', price: 20, description: 'Stun a monster for a few seconds and make space.', symbol: '✹', icon: 'assets/ui/icons/market/FlashbangIcon.svg' },
        { id: 'noiseMaker', name: 'Noise Maker', price: 18, description: 'Send a sound down another corridor.', symbol: '♬', icon: 'assets/ui/icons/market/NoiseMakerIcon.svg' },
        { id: 'bearTrap', name: 'Bear Trap', price: 24, description: 'Catch a monster in its path for a brief moment.', symbol: '⌑', icon: 'assets/ui/icons/market/BearTrapIcon.svg' },
        { id: 'battery', name: 'Emergency Battery', price: 22, description: 'Bring the lights back during an outage.', symbol: '▣', icon: 'assets/ui/icons/market/EmergencyBatteryIcon.svg' },
        { id: 'signalScrambler', name: 'Signal Scrambler', price: 26, description: 'Disrupt tracking alerts while you move.', symbol: '⌁', icon: 'assets/ui/icons/market/SignalScramblerIcon.svg' },
        { id: 'flare', name: 'Emergency Flare', price: 12, description: 'Light the area and risk drawing attention.', symbol: '✦', icon: 'assets/ui/icons/market/EmergencyFlareIcon.svg' }
    ]);
    const BLACK_MARKET_ALLOWED = new Set(STOCK_OPTIONS.map(item => item.id));
    const noticeTimers = new WeakMap();
    let dailyStock = null;

    function localDateKey(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function createDailyStock(date = localDateKey()) {
        const shuffled = STOCK_OPTIONS.slice();
        for (let index = shuffled.length - 1; index > 0; index--) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
        }
        return {
            date,
            offers: shuffled.slice(0, 3).map(item => ({
                id: item.id,
                stock: 1 + Math.floor(Math.random() * 3),
                price: Math.max(1, Math.round(item.price * 0.8))
            }))
        };
    }

    function saveDailyStock() {
        try { localStorage.setItem(STOCK_KEY, JSON.stringify(dailyStock)); } catch (_) { /* The counter still works for this visit. */ }
    }

    function ensureDailyStock() {
        const today = localDateKey();
        if (dailyStock?.date === today) return false;
        let loaded = null;
        try {
            const parsed = JSON.parse(localStorage.getItem(STOCK_KEY) || 'null');
            if (parsed && parsed.date === today && Array.isArray(parsed.offers)) {
                const offers = parsed.offers.filter(offer => BLACK_MARKET_ALLOWED.has(offer.id)).map(offer => {
                    const item = STOCK_OPTIONS.find(option => option.id === offer.id);
                    const stock = Number(offer.stock);
                    return item && Number.isInteger(stock) && stock >= 0 && stock <= 3
                        ? { id: item.id, stock, price: Math.max(1, Math.min(item.price - 1, Number(offer.price) || Math.round(item.price * .8))) }
                        : null;
                }).filter(Boolean);
                if (offers.length === 3 && new Set(offers.map(offer => offer.id)).size === 3) loaded = { date: today, offers };
            }
        } catch (_) { /* Rebuild an invalid or unavailable local rotation. */ }
        dailyStock = loaded || createDailyStock(today);
        saveDailyStock();
        return true;
    }

    function refreshWallets() {
        const balance = typeof tokens === 'number' ? tokens : 0;
        ['tokenDisplayMarket', 'tokenDisplayShop', 'tokenDisplayMaps', 'tokenDisplayBlackMarket'].forEach(id => {
            const element = document.getElementById(id);
            if (!element) return;
            element.textContent = id === 'tokenDisplayShop' ? `Tokens: ${balance}` : `${balance} T`;
        });
    }

    function refreshInventory() {
        if (typeof getInventoryCount !== 'function') return;
        const inventory = {
            adrenaline: 15,
            flashbang: 20,
            noiseMaker: 18,
            bearTrap: 24,
            battery: 22,
            signalScrambler: 26,
            flare: 12
        };
        const carry = ['adrenaline', 'flashbang', 'noiseMaker', 'bearTrap', 'battery', 'breathFilter', 'signalScrambler', 'neutralizer', 'repairKit', 'flare']
            .reduce((sum, type) => sum + getInventoryCount(type), 0);
        const status = document.getElementById('shopCarryStatus');
        if (status) status.textContent = `${carry} / 8`;

        Object.entries(inventory).forEach(([type, price]) => {
            const count = getInventoryCount(type);
            const countLabel = document.getElementById(`count-${type}`);
            if (countLabel) countLabel.textContent = `${count} OWNED`;
            const card = countLabel?.closest('.market-product-card');
            const buy = card?.querySelector('.market-buy-button');
            const discard = card?.querySelector('.market-discard-button');
            if (buy) buy.disabled = carry >= 8 || tokens < price;
            if (discard) discard.disabled = count <= 0;
        });
    }

    function nextLocalMidnight() {
        const next = new Date();
        next.setHours(24, 0, 0, 0);
        return next;
    }

    function updateCountdown() {
        const output = document.getElementById('blackMarketCountdown');
        const rotated = ensureDailyStock();
        if (rotated) renderBlackMarket();
        if (!output) return;
        const remaining = Math.max(0, nextLocalMidnight().getTime() - Date.now());
        const totalSeconds = Math.floor(remaining / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        output.textContent = `${hours}:${minutes}:${seconds}`;
    }

    function renderBlackMarket() {
        ensureDailyStock();
        const content = document.getElementById('blackMarketOffers');
        if (!content) return;
        const carry = ['adrenaline', 'flashbang', 'noiseMaker', 'bearTrap', 'battery', 'breathFilter', 'signalScrambler', 'neutralizer', 'repairKit', 'flare']
            .reduce((sum, type) => sum + getInventoryCount(type), 0);
        content.innerHTML = dailyStock.offers.map(offer => {
            const item = STOCK_OPTIONS.find(option => option.id === offer.id);
            if (!item) return '';
            const soldOut = offer.stock < 1;
            const canBuy = !soldOut && carry < 8 && tokens >= offer.price;
            const stockLabel = soldOut ? 'SOLD OUT' : `${offer.stock} IN STOCK`;
            const buttonText = soldOut ? 'SOLD OUT' : carry >= 8 ? 'CARRY FULL' : tokens < offer.price ? 'NOT ENOUGH T' : `BUY · ${offer.price} T`;
            const itemMark = item.icon ? `<img src="${item.icon}" alt="">` : item.symbol;
            return `<article class="market-black-card">
                <div class="market-black-card-top"><span class="market-black-glyph" aria-hidden="true">${itemMark}</span><span class="market-black-stock">${stockLabel}<br>DAILY LOT</span></div>
                <h3>${item.name}</h3><p>${item.description}</p>
                <div class="market-black-prices"><del>${item.price} T</del><strong>${offer.price} T</strong><span>BELOW SHELF PRICE</span></div>
                <button class="market-buy-button" type="button" data-black-market-item="${item.id}" ${canBuy ? '' : 'disabled'} onclick="buyBlackMarketSupply('${item.id}')">${buttonText}</button>
            </article>`;
        }).join('');
        updateCountdown();
    }

    function renderMapIntel() {
        const content = document.getElementById('mapIntelCards');
        if (!content || typeof MAP_DEFINITIONS === 'undefined') return;
        const mapIds = Object.keys(MAP_DEFINITIONS);
        const available = mapIds.filter(id => unlockedMaps.includes(id));
        if (!available.length) {
            content.innerHTML = '<div class="market-map-empty">No site files are available yet. Clear a location to add it to the survey desk.</div>';
            return;
        }
        content.innerHTML = available.map(id => {
            const mapDef = MAP_DEFINITIONS[id];
            const mapIndex = mapIds.indexOf(id);
            const cost = 35 + mapIndex * 15;
            const mastery = mapMastery[id] || [];
            const mastered = mastery.length === 3 && mastery.every(Boolean);
            const owned = mapIntel.includes(id);
            const availableForPurchase = mastered && !owned && tokens >= cost;
            const difficulties = ['EASY', 'NORMAL', 'HARD'].map((label, index) => `<span class="${mastery[index] ? 'is-cleared' : ''}">${label}${mastery[index] ? ' ✓' : ''}</span>`).join('');
            const description = owned ? 'Live minimap available during runs on this site.' : mastered ? 'All difficulties cleared. The live site map is ready to purchase.' : 'Clear Easy, Normal, and Hard here to qualify for live map intel.';
            const buttonText = owned ? 'OWNED' : !mastered ? 'CLEAR ALL 3' : tokens < cost ? `${cost} TOKENS` : `BUY · ${cost} T`;
            const action = owned
                ? '<span class="market-map-status">IN FIELD RECORD</span>'
                : `<button type="button" class="market-buy-button" ${availableForPurchase ? '' : 'disabled'} onclick="buyMapIntel('${id}')">${buttonText}</button>`;
            return `<article class="market-map-card">
                <div class="market-map-diagram" aria-hidden="true"><img src="assets/ui/icons/market/MapsIcon.svg" alt=""></div>
                <div class="market-map-copy"><span class="market-map-index">SITE FILE / ${String(mapIndex + 1).padStart(2, '0')}</span><h3>${mapDef.name}</h3><p>${description}</p><div class="market-map-difficulties" aria-label="Difficulty clear status">${difficulties}</div>${action}</div>
            </article>`;
        }).join('');
    }

    function setNotice(id, message) {
        const element = document.getElementById(id);
        if (!element) return;
        element.textContent = message;
        const timer = noticeTimers.get(element);
        if (timer) clearTimeout(timer);
        if (message) noticeTimers.set(element, setTimeout(() => { element.textContent = ''; }, 3500));
    }

    function refreshMarketUI() {
        ensureDailyStock();
        refreshWallets();
        refreshInventory();
    }

    function openMarketScreen(menuId) {
        window.showMenu?.(menuId);
        window.focusMarketMenu(menuId);
    }

    function focusMarketMenu(menuId) {
        requestAnimationFrame(() => document.querySelector(`#${menuId} .market-back-button`)?.focus({ preventScroll: true }));
    }

    function buyBlackMarketSupply(itemId) {
        ensureDailyStock();
        const offer = dailyStock.offers.find(entry => entry.id === itemId);
        if (!BLACK_MARKET_ALLOWED.has(itemId) || !offer || offer.stock < 1) return false;
        if (typeof buyConsumable !== 'function' || !buyConsumable(itemId, offer.price)) return false;
        offer.stock -= 1;
        saveDailyStock();
        renderBlackMarket();
        const item = STOCK_OPTIONS.find(entry => entry.id === itemId);
        setNotice('blackMarketNotice', `${item?.name || 'Supply'} added to your carry inventory at the lower counter price.`);
        const sameOffer = document.querySelector(`#blackMarketOffers [data-black-market-item="${itemId}"]:not(:disabled)`);
        const nextOffer = sameOffer || document.querySelector('#blackMarketOffers .market-buy-button:not(:disabled)');
        (nextOffer || document.querySelector('#blackMarketMenu .market-back-button'))?.focus({ preventScroll: true });
        return true;
    }

    window.openMarket = () => openMarketScreen('marketMenu');
    window.openShop = () => openMarketScreen('shopMenu');
    window.openMapIntel = () => openMarketScreen('mapIntelMenu');
    window.openBlackMarket = () => openMarketScreen('blackMarketMenu');
    window.returnToLobbyFromMarket = () => {
        window.showMenu?.('mainMenu');
        requestAnimationFrame(() => document.querySelector('#mainMenu .lobby-market-button')?.focus({ preventScroll: true }));
    };
    window.focusMarketMenu = focusMarketMenu;
    window.refreshMarketUI = refreshMarketUI;
    window.refreshMarketInventory = refreshInventory;
    window.refreshBlackMarket = renderBlackMarket;
    window.renderMarketMapIntel = renderMapIntel;
    window.marketSetNotice = setNotice;
    window.buyBlackMarketSupply = buyBlackMarketSupply;

    ensureDailyStock();
    refreshMarketUI();
    updateCountdown();
    window.setInterval(updateCountdown, 1000);
})();

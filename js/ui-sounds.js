(() => {
    'use strict';

    const sources = {
        hover: 'assets/audio/ui/click-8bit.mp3',
        switch: 'assets/audio/ui/switch-006.mp3',
        purchase: 'assets/audio/ui/store-purchase.mp3',
        select: 'assets/audio/ui/select-006.mp3',
        discard: 'assets/audio/ui/store-discard.mp3'
    };
    const volumes = { hover: .4, switch: .24, purchase: .26, select: 1, discard: .24 };
    const audioCache = new Map();
    const hoverSelector = '.menu-panel button:not(:disabled):not([aria-disabled="true"]), .menu-panel [role="button"]:not([aria-disabled="true"]), .menu-panel a[href], .menu-panel input[type="range"], .mobile-action-menu button:not(:disabled):not([aria-disabled="true"]), .mobile-action-menu [role="button"]:not([aria-disabled="true"]), .lobby-menu-style-button:not(:disabled)';

    function readPercent(key) {
        try {
            const stored = localStorage.getItem(key);
            if (stored === null || stored.trim() === '') return 1;
            const value = Number(stored);
            return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) / 100 : 1;
        } catch (_) {
            return 1;
        }
    }

    function getAudio(name) {
        if (!sources[name]) return null;
        if (!audioCache.has(name)) {
            const audio = new Audio(sources[name]);
            audio.preload = 'auto';
            audio.load();
            audioCache.set(name, audio);
        }
        return audioCache.get(name);
    }

    function effectiveVolume(name) {
        return Math.min(1, readPercent('br_volM') * readPercent('br_volS') * volumes[name]);
    }

    function playUiSound(name) {
        if (!sources[name]) return;
        const source = getAudio(name);
        if (!source || effectiveVolume(name) <= 0) return;
        // Play the preloaded element itself. Cloning it here could leave each
        // click with a fresh, not-yet-loaded element, and previously hid any
        // playback rejection so that failure looked like a muted asset.
        source.pause();
        source.volume = effectiveVolume(name);
        try { source.currentTime = 0; } catch (_) {}
        const playback = source.play();
        if (playback?.catch) playback.catch(error => console.warn(`[UI audio] Could not play ${name}:`, error));
    }

    function closestElement(target, selector) {
        return target instanceof Element ? target.closest(selector) : null;
    }

    document.addEventListener('mouseover', event => {
        const control = closestElement(event.target, hoverSelector);
        if (!control || (event.relatedTarget instanceof Node && control.contains(event.relatedTarget))) return;
        playUiSound('hover');
    });

    document.addEventListener('click', event => {
        const control = closestElement(event.target, 'button, [role="button"], a[href]');
        if (!control || control.matches(':disabled,[aria-disabled="true"]')) return;
        if (!control.closest('.menu-panel, .mobile-action-menu') && !control.matches('.lobby-menu-style-button')) return;
        if (control.matches('.market-buy-button, .market-discard-button')) return;

        const explicitSound = control.dataset.uiSound;
        if (explicitSound) {
            playUiSound(explicitSound);
            return;
        }
        const changesSelection = control.matches('[aria-pressed],[aria-checked],[aria-selected],[aria-current],[aria-expanded],[role="tab"],[data-settings-target],[data-market-shop-tab],.lobby-position-option,.lobby-motion-option');
        playUiSound(changesSelection ? 'switch' : 'select');
    }, true);

    document.addEventListener('change', event => {
        const control = closestElement(event.target, '.menu-panel select, .menu-panel input[type="checkbox"], .menu-panel input[type="radio"], .menu-panel input[type="range"]');
        if (control) playUiSound('switch');
    }, true);

    document.querySelectorAll('.market-discard-button').forEach(button => {
        const itemName = button.closest('.market-product-card')?.querySelector('h3')?.textContent?.trim() || 'supply';
        button.title = `Discard one ${itemName} and receive 5 tokens`;
        button.setAttribute('aria-label', button.title);
    });
    window.playUiSound = playUiSound;
})();

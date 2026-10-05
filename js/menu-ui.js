(() => {
    'use strict';

    const mainMenu = document.getElementById('mainMenu');
    const styleScreen = document.getElementById('menuStyleMenu');
    const wardrobeScreen = document.getElementById('cosmeticsMenu');
    if (!mainMenu || !styleScreen) return;

    const STORAGE_KEY = 'calebs_shift_menu_style_v1';
    const defaults = Object.freeze({
        position: 'left',
        theme: 'lobby',
        motion: 'full',
        transparency: 12,
        iconLabels: true
    });
    const positionNames = { left: 'LEFT', center: 'CENTER', right: 'RIGHT' };
    const gameVersion = document.getElementById('settingsVersion');
    const menuVersion = document.getElementById('menuVersion');
    const previewVersion = document.getElementById('menuStylePreviewVersion');
    const tokenDisplay = document.getElementById('tokenDisplayMain');
    const previewTokens = document.getElementById('menuStylePreviewTokens');
    const previewStage = document.getElementById('menuStylePreviewStage');
    const previewPanel = document.getElementById('menuStylePreviewPanel');
    const statusText = document.getElementById('menuStyleStatusText');
    const saveHint = document.getElementById('menuStyleSaveHint');
    const saveButton = document.getElementById('menuStyleSave');
    const resetButton = document.getElementById('menuStyleReset');
    const backButton = document.getElementById('menuStyleBack');
    const themeToggle = document.getElementById('menuThemeToggle');
    const themeList = document.getElementById('menuThemeList');
    const transparencyInput = document.getElementById('menuTransparency');
    const transparencyValue = document.getElementById('menuTransparencyValue');
    const labelsToggle = document.getElementById('menuIconLabelsToggle');
    const styleButton = mainMenu.querySelector('.lobby-menu-style-button');
    const marketButton = mainMenu.querySelector('.lobby-market-button');
    const settingsStyleButton = document.getElementById('settingsMenuStyleLink');
    const reducedMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let returnMenuId = 'mainMenu';

    function returnScreenLabel() {
        if (returnMenuId === 'settingsMenu') return 'BACK TO SETTINGS';
        if (returnMenuId === 'cosmeticsMenu') return 'BACK TO WARDROBE';
        return 'BACK TO LOBBY';
    }

    function normalizeSettings(value) {
        const source = value && typeof value === 'object' ? value : {};
        const transparency = Number.isFinite(Number(source.transparency)) ? Math.round(Number(source.transparency)) : defaults.transparency;
        return {
            position: ['left', 'center', 'right'].includes(source.position) ? source.position : defaults.position,
            theme: 'lobby',
            motion: ['full', 'reduced', 'off'].includes(source.motion) ? source.motion : defaults.motion,
            transparency: Math.max(0, Math.min(55, transparency)),
            iconLabels: source.iconLabels !== false
        };
    }

    function readSavedSettings() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? normalizeSettings(JSON.parse(raw)) : { ...defaults };
        } catch (_) {
            return { ...defaults };
        }
    }

    function sameSettings(left, right) {
        return left.position === right.position &&
            left.theme === right.theme &&
            left.motion === right.motion &&
            left.transparency === right.transparency &&
            left.iconLabels === right.iconLabels;
    }

    let savedSettings = readSavedSettings();
    let draftSettings = { ...savedSettings };
    let pointerFramePending = false;
    let pointerX = 0;
    let pointerY = 0;

    function updateParallax(x, y) {
        mainMenu.style.setProperty('--lobby-parallax-x', `${x.toFixed(2)}px`);
        mainMenu.style.setProperty('--lobby-parallax-y', `${y.toFixed(2)}px`);
    }

    function applySettings(settings) {
        const normalized = normalizeSettings(settings);
        mainMenu.dataset.menuPosition = normalized.position;
        mainMenu.dataset.menuMotion = normalized.motion;
        mainMenu.dataset.iconLabels = normalized.iconLabels ? 'on' : 'off';
        mainMenu.style.setProperty('--lobby-panel-alpha', (1 - normalized.transparency / 100).toFixed(2));

        if (previewStage) {
            previewStage.dataset.position = normalized.position;
            previewStage.dataset.motion = normalized.motion;
            previewStage.dataset.iconLabels = normalized.iconLabels ? 'on' : 'off';
        }
        if (previewPanel) previewPanel.style.setProperty('--lobby-preview-alpha', (1 - normalized.transparency / 100).toFixed(2));

        const previewPosition = document.getElementById('lobbyPreviewPosition');
        if (previewPosition) previewPosition.textContent = `MENU / ${positionNames[normalized.position]}`;

        if (normalized.motion !== 'full' || reducedMotionPreference.matches) {
            pointerX = 0;
            pointerY = 0;
            updateParallax(0, 0);
        }
    }

    function setPressedState(buttons, selectedValue, dataKey) {
        buttons.forEach(button => {
            const selected = button.dataset[dataKey] === selectedValue;
            button.classList.toggle('is-selected', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
    }

    function updateEditor() {
        const dirty = !sameSettings(draftSettings, savedSettings);
        setPressedState(styleScreen.querySelectorAll('.lobby-position-option'), draftSettings.position, 'position');
        setPressedState(styleScreen.querySelectorAll('.lobby-motion-option'), draftSettings.motion, 'motion');

        if (transparencyInput) {
            transparencyInput.value = String(draftSettings.transparency);
            transparencyInput.style.setProperty('--slider-fill', `${(draftSettings.transparency / 55) * 100}%`);
        }
        if (transparencyValue) transparencyValue.textContent = `${draftSettings.transparency}%`;
        if (labelsToggle) labelsToggle.setAttribute('aria-checked', String(draftSettings.iconLabels));
        if (statusText) statusText.textContent = dirty ? 'UNSAVED PREVIEW' : 'CURRENT STYLE';
        if (saveHint) saveHint.textContent = dirty ? 'LIVE PREVIEW · SAVE TO KEEP · BACK WILL DISCARD' : 'STYLE SAVED ON THIS DEVICE';
        if (backButton) {
            const label = backButton.querySelector('span:last-child');
            if (label) label.textContent = dirty ? 'DISCARD PREVIEW' : returnScreenLabel();
        }
        if (saveButton) saveButton.classList.toggle('is-saved', !dirty);

        applySettings(draftSettings);
    }

    function openStyleScreen(event) {
        event?.preventDefault();
        event?.stopPropagation();
        const clickedControl = event?.target instanceof Element ? event.target.closest('#settingsMenuStyleLink, #wardrobeMenuStyleLink') : event?.currentTarget;
        returnMenuId = clickedControl?.id === 'settingsMenuStyleLink' ? 'settingsMenu' : clickedControl?.id === 'wardrobeMenuStyleLink' ? 'cosmeticsMenu' : 'mainMenu';
        draftSettings = { ...savedSettings };
        updateEditor();
        if (typeof window.showMenu === 'function') window.showMenu('menuStyleMenu');
        else {
            document.querySelectorAll('.menu-panel').forEach(panel => { panel.style.display = 'none'; });
            styleScreen.style.display = 'flex';
        }
    }

    function returnToLobby(event) {
        event?.preventDefault();
        if (!sameSettings(draftSettings, savedSettings)) {
            draftSettings = { ...savedSettings };
            applySettings(draftSettings);
        }
        if (typeof window.showMenu === 'function') window.showMenu(returnMenuId);
        else {
            styleScreen.style.display = 'none';
            document.getElementById(returnMenuId).style.display = 'flex';
        }
    }

    function previewChange(change) {
        draftSettings = { ...draftSettings, ...change };
        updateEditor();
    }

    function saveStyle() {
        const nextSettings = normalizeSettings(draftSettings);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings));
            savedSettings = { ...nextSettings };
            draftSettings = { ...savedSettings };
            updateEditor();
            if (statusText) statusText.textContent = 'STYLE SAVED';
            if (saveHint) saveHint.textContent = 'YOUR LOBBY WILL KEEP THIS LOOK';
        } catch (_) {
            if (statusText) statusText.textContent = 'SAVE UNAVAILABLE';
            if (saveHint) saveHint.textContent = 'THIS BROWSER COULD NOT SAVE YOUR MENU STYLE';
        }
    }

    function resetStyle() {
        draftSettings = { ...defaults };
        updateEditor();
        if (statusText) statusText.textContent = 'DEFAULT PREVIEW';
        if (saveHint) saveHint.textContent = 'DEFAULTS PREVIEWED · SAVE TO KEEP THEM';
    }

    // Keep unfinished lobby destinations inert while the Market has its own screen.
    mainMenu.addEventListener('click', event => {
        const target = event.target;
        const inertButton = target instanceof Element ? target.closest('button[aria-disabled="true"]') : null;
        if (!inertButton) return;
        event.preventDefault();
        event.stopPropagation();
    });

    if (gameVersion && menuVersion) menuVersion.textContent = gameVersion.textContent;
    if (gameVersion && previewVersion) previewVersion.textContent = gameVersion.textContent;
    if (tokenDisplay && previewTokens) previewTokens.textContent = tokenDisplay.textContent.replace(/^Tokens:\s*/i, 'TOKENS: ');

    applySettings(savedSettings);
    updateEditor();

    styleButton?.addEventListener('click', openStyleScreen);
    marketButton?.addEventListener('click', () => window.openMarket?.());
    settingsStyleButton?.addEventListener('click', openStyleScreen);
    wardrobeScreen?.addEventListener('click', event => {
        if (event.target instanceof Element && event.target.closest('#wardrobeMenuStyleLink')) openStyleScreen(event);
    });
    backButton?.addEventListener('click', returnToLobby);
    saveButton?.addEventListener('click', saveStyle);
    resetButton?.addEventListener('click', resetStyle);

    themeToggle?.addEventListener('click', () => {
        const expanded = themeToggle.getAttribute('aria-expanded') !== 'false';
        const nextExpanded = !expanded;
        themeToggle.setAttribute('aria-expanded', String(nextExpanded));
        themeToggle.setAttribute('aria-label', nextExpanded ? 'Collapse theme choices' : 'Expand theme choices');
        if (themeList) {
            themeList.classList.toggle('is-collapsed', !nextExpanded);
            themeList.setAttribute('aria-hidden', String(!nextExpanded));
            themeList.inert = !nextExpanded;
        }
    });

    styleScreen.querySelector('.lobby-position-options')?.addEventListener('click', event => {
        const button = event.target instanceof Element ? event.target.closest('.lobby-position-option') : null;
        if (button) previewChange({ position: button.dataset.position });
    });

    styleScreen.querySelector('.lobby-motion-options')?.addEventListener('click', event => {
        const button = event.target instanceof Element ? event.target.closest('.lobby-motion-option') : null;
        if (button) previewChange({ motion: button.dataset.motion });
    });

    transparencyInput?.addEventListener('input', () => previewChange({ transparency: Number(transparencyInput.value) }));
    labelsToggle?.addEventListener('click', () => previewChange({ iconLabels: !draftSettings.iconLabels }));

    const parallaxLayer = mainMenu.querySelector('.lobby-wallpaper-parallax');
    if (parallaxLayer && finePointer.matches && !reducedMotionPreference.matches) {
        mainMenu.addEventListener('pointermove', event => {
            if (event.pointerType !== 'mouse' || mainMenu.dataset.menuMotion !== 'full') return;
            const bounds = mainMenu.getBoundingClientRect();
            if (!bounds.width || !bounds.height) return;
            pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * -12;
            pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * -9;
            if (pointerFramePending) return;
            pointerFramePending = true;
            window.requestAnimationFrame(() => {
                updateParallax(pointerX, pointerY);
                pointerFramePending = false;
            });
        });

        mainMenu.addEventListener('pointerleave', () => {
            pointerX = 0;
            pointerY = 0;
            updateParallax(0, 0);
        });
    }
})();

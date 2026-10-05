(() => {
    'use strict';

    const settingsScreen = document.getElementById('settingsMenu');
    const settingsButton = document.getElementById('lobbySettingsButton');
    const categoryNav = document.getElementById('settingsCategoryNav');
    const content = document.getElementById('settingsContent');
    if (!settingsScreen || !settingsButton || !categoryNav || !content) return;

    const categories = Array.from(categoryNav.querySelectorAll('[data-settings-target]'));
    const sections = categories
        .map(button => document.getElementById(button.dataset.settingsTarget))
        .filter(Boolean);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let activeFrame = 0;
    let resetReturnFocus = null;

    function setActiveCategory(sectionId) {
        categories.forEach(button => {
            const active = button.dataset.settingsTarget === sectionId;
            button.classList.toggle('is-active', active);
            if (active) button.setAttribute('aria-current', 'location');
            else button.removeAttribute('aria-current');
        });

        const selected = categories.find(button => button.dataset.settingsTarget === sectionId);
        selected?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    function updateCategoryFromScroll() {
        activeFrame = 0;
        const contentTop = content.getBoundingClientRect().top;
        const marker = contentTop + Math.min(175, content.clientHeight * .34);
        let activeSection = sections[0];
        for (const section of sections) {
            if (section.getBoundingClientRect().top <= marker + 1) activeSection = section;
            else break;
        }
        if (activeSection) setActiveCategory(activeSection.id);
    }

    function scheduleCategoryUpdate() {
        if (activeFrame) return;
        activeFrame = window.requestAnimationFrame(updateCategoryFromScroll);
    }

    function scrollToCategory(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        const top = section.getBoundingClientRect().top - content.getBoundingClientRect().top + content.scrollTop;
        content.scrollTo({ top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        setActiveCategory(sectionId);
    }

    settingsButton.addEventListener('click', event => {
        event.preventDefault();
        if (typeof window.showMenu === 'function') window.showMenu('settingsMenu');
        content.scrollTop = 0;
        setActiveCategory(sections[0]?.id);
    });

    document.getElementById('settingsBack')?.addEventListener('click', () => {
        if (typeof window.showMenu === 'function') window.showMenu('mainMenu');
    });

    categoryNav.addEventListener('click', event => {
        const button = event.target instanceof Element ? event.target.closest('[data-settings-target]') : null;
        if (button) scrollToCategory(button.dataset.settingsTarget);
    });
    content.addEventListener('scroll', scheduleCategoryUpdate, { passive: true });
    window.addEventListener('resize', scheduleCategoryUpdate, { passive: true });

    for (const id of ['volMaster', 'volSFX', 'volGameplay']) {
        const input = document.getElementById(id);
        const output = document.getElementById(`${id}Value`);
        if (!input) continue;
        const updateOutput = () => {
            if (output) output.textContent = `${input.value}%`;
            if (typeof window.saveSettings === 'function') window.saveSettings();
        };
        input.addEventListener('input', updateOutput);
        if (output) output.textContent = `${input.value}%`;
    }

    const settingTypes = {
        btnFPS: 'fps',
        btnCRT: 'crt',
        btnVHS: 'vhs',
        btnSpeedrunTimer: 'speedrunTimer',
        btnReduceShake: 'reduceShake'
    };
    for (const [id, settingType] of Object.entries(settingTypes)) {
        document.getElementById(id)?.addEventListener('click', () => {
            if (typeof window.toggleSetting === 'function') window.toggleSetting(settingType);
        });
    }

    document.getElementById('settingsTestSound')?.addEventListener('click', () => {
        if (typeof window.testSound === 'function') window.testSound();
    });
    document.getElementById('settingsInstallHelp')?.addEventListener('click', () => {
        if (typeof window.showInstallHelp === 'function') window.showInstallHelp();
    });
    document.getElementById('settingsExportSave')?.addEventListener('click', () => {
        if (typeof window.exportSave === 'function') window.exportSave();
    });

    const saveFileInput = document.getElementById('saveFileInput');
    document.getElementById('settingsImportSave')?.addEventListener('click', () => saveFileInput?.click());
    saveFileInput?.addEventListener('change', event => {
        if (typeof window.importSave === 'function') window.importSave(event);
    });

    const resetDialog = document.getElementById('settingsResetDialog');
    const resetButton = document.getElementById('settingsResetProgress');
    const resetCancel = document.getElementById('settingsResetCancel');
    const resetConfirm = document.getElementById('settingsResetConfirm');

    function closeResetDialog() {
        if (!resetDialog) return;
        resetDialog.style.display = 'none';
        resetReturnFocus?.focus();
        resetReturnFocus = null;
    }

    resetButton?.addEventListener('click', () => {
        if (!resetDialog) return;
        resetReturnFocus = resetButton;
        resetDialog.style.display = 'grid';
        resetCancel?.focus();
    });
    resetCancel?.addEventListener('click', closeResetDialog);
    resetDialog?.addEventListener('click', event => {
        if (event.target === resetDialog) closeResetDialog();
    });
    resetConfirm?.addEventListener('click', () => {
        closeResetDialog();
        if (typeof window.resetProgress === 'function') window.resetProgress(true);
    });
    document.addEventListener('keydown', event => {
        if (resetDialog?.style.display !== 'grid') return;
        if (event.key === 'Escape') {
            closeResetDialog();
            return;
        }
        if (event.key === 'Tab') {
            const focusables = [resetCancel, resetConfirm].filter(Boolean);
            const currentIndex = focusables.indexOf(document.activeElement);
            if (event.shiftKey && currentIndex <= 0) {
                event.preventDefault();
                focusables.at(-1)?.focus();
            } else if (!event.shiftKey && currentIndex === focusables.length - 1) {
                event.preventDefault();
                focusables[0]?.focus();
            }
        }
    });

    setActiveCategory(sections[0]?.id);
})();

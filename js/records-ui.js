(() => {
    'use strict';

    const screen = document.getElementById('recordsMenu');
    const openButton = document.getElementById('lobbyRecordsButton');
    const backButton = document.getElementById('recordsBack');
    const categoryNav = document.getElementById('recordsCategoryNav');
    const content = document.getElementById('recordsContent');
    const title = document.getElementById('recordsScreenTitle');
    if (!screen || !openButton || !backButton || !categoryNav || !content) return;

    const categories = Array.from(categoryNav.querySelectorAll('[data-record-target]'));
    let sections = [];
    let activeFrame = 0;
    let returnFocus = openButton;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function setActiveCategory(sectionId) {
        categories.forEach(button => {
            const active = button.dataset.recordTarget === sectionId;
            button.classList.toggle('is-active', active);
            if (active) button.setAttribute('aria-current', 'location');
            else button.removeAttribute('aria-current');
        });

        categories.find(button => button.dataset.recordTarget === sectionId)
            ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    function updateCategoryFromScroll() {
        activeFrame = 0;
        const contentTop = content.getBoundingClientRect().top;
        const marker = contentTop + Math.min(150, content.clientHeight * .3);
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

    function openRecords(event) {
        event?.preventDefault();
        returnFocus = event?.currentTarget || openButton;
        if (typeof window.showMenu === 'function') window.showMenu('recordsMenu');
        else screen.style.display = 'flex';
    }

    function returnToLobby() {
        if (typeof window.showMenu === 'function') window.showMenu('mainMenu');
        else screen.style.display = 'none';
        returnFocus?.focus({ preventScroll: true });
    }

    window.initializeRecordsScreen = () => {
        sections = categories
            .map(button => document.getElementById(button.dataset.recordTarget))
            .filter(Boolean);
        content.scrollTop = 0;
        setActiveCategory(sections[0]?.id);
        title?.focus({ preventScroll: true });
    };

    openButton.addEventListener('click', openRecords);
    backButton.addEventListener('click', returnToLobby);
    categoryNav.addEventListener('click', event => {
        const button = event.target instanceof Element ? event.target.closest('[data-record-target]') : null;
        if (button) scrollToCategory(button.dataset.recordTarget);
    });
    content.addEventListener('scroll', scheduleCategoryUpdate, { passive: true });
    window.addEventListener('resize', scheduleCategoryUpdate, { passive: true });
    screen.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            event.preventDefault();
            returnToLobby();
        }
    });
})();

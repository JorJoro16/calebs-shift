(() => {
    const screen = document.getElementById('infoMenu');
    const menuButton = document.getElementById('lobbyArchiveButton');
    const backButton = document.getElementById('archiveBackButton');
    const content = document.getElementById('archiveScrollArea');
    const list = screen?.querySelector('.lobby-archive-sections');
    const search = document.getElementById('archiveSearch');
    const count = document.getElementById('archiveFileCount');
    const emptyState = document.getElementById('archiveNoResults');
    if (!screen || !content || !list) return;

    const directory = [
        { id: 'archiveOrientation', key: 'start', number: '01', title: 'FIELD NOTES', note: 'Controls, objectives, and first-shift advice.' },
        { id: 'archiveLocations', key: 'maps', number: '02', title: 'LOCATION FILES', note: 'Site layouts, route objectives, and hazards.' },
        { id: 'archiveEntities', key: 'monsters', number: '03', title: 'ENTITY DOSSIERS', note: 'Encounter behavior and field-tested counters.' },
        { id: 'archiveSystems', key: 'systems', number: '04', title: 'SHIFT SYSTEMS', note: 'Progression, modifiers, and supporting systems.' }
    ];

    const legacyEntries = [...list.querySelectorAll(':scope > .info-section')];
    const provenance = list.querySelector('.lobby-archive-provenance');
    const sections = new Map();

    for (const item of directory) {
        const section = document.createElement('section');
        section.className = 'lobby-archive-section';
        section.id = item.id;
        section.dataset.archiveSection = '';

        const heading = document.createElement('header');
        heading.className = 'lobby-archive-section-heading';
        heading.innerHTML = `<span>${item.number} <i>/</i> ARCHIVE INDEX</span><h2>${item.title}</h2><p>${item.note}</p>`;
        section.append(heading);
        sections.set(item.id, section);
    }

    for (const entry of legacyEntries) {
        const tab = entry.dataset.infoTab;
        const title = entry.querySelector('summary')?.textContent.trim().toUpperCase() || '';
        const destination = title === 'MUTATIONS'
            ? sections.get('archiveSystems')
            : sections.get(directory.find(item => item.key === tab)?.id);
        if (!destination) continue;
        entry.classList.add('lobby-archive-entry');
        if (destination.id === 'archiveEntities') entry.classList.add('lobby-archive-entity');
        entry.removeAttribute('data-info-tab');
        entry.querySelector('summary')?.setAttribute('aria-label', title);
        destination.append(entry);
    }

    list.replaceChildren(...directory.map(item => sections.get(item.id)));
    if (provenance) list.append(provenance);

    const navButtons = [...screen.querySelectorAll('[data-archive-target]')];
    const getEntries = () => [...screen.querySelectorAll('.lobby-archive-entry')];
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    let scrollFrame = 0;

    function setActive(id) {
        for (const button of navButtons) {
            const active = button.dataset.archiveTarget === id;
            button.classList.toggle('is-active', active);
            if (active) button.setAttribute('aria-current', 'location');
            else button.removeAttribute('aria-current');
        }
    }

    function updateActiveFromScroll() {
        scrollFrame = 0;
        const line = content.getBoundingClientRect().top + Math.min(145, content.clientHeight * 0.24);
        let active = directory[0].id;
        for (const item of directory) {
            const section = sections.get(item.id);
            if (!section || section.hidden) continue;
            if (section.getBoundingClientRect().top <= line) active = item.id;
            else break;
        }
        setActive(active);
    }

    function applySearch() {
        const query = (search?.value || '').trim().toLocaleLowerCase();
        let visibleCount = 0;

        for (const entry of getEntries()) {
            const locked = entry.dataset.archiveLocked === 'true';
            const matches = !query || (!locked && entry.textContent.toLocaleLowerCase().includes(query));
            entry.hidden = locked || !matches;
            if (!locked && matches) {
                visibleCount++;
                if (query && !entry.open) {
                    entry.open = true;
                    entry.dataset.archiveOpenedBySearch = 'true';
                }
            } else if (entry.dataset.archiveOpenedBySearch === 'true') {
                entry.open = false;
                delete entry.dataset.archiveOpenedBySearch;
            }
        }

        for (const item of directory) {
            const section = sections.get(item.id);
            const hasFiles = Boolean(section?.querySelector('.lobby-archive-entry:not([hidden])'));
            if (section) section.hidden = !hasFiles;
            const button = navButtons.find(candidate => candidate.dataset.archiveTarget === item.id);
            if (button) button.hidden = !hasFiles;
        }

        if (count) count.textContent = `${visibleCount} ${query ? 'MATCHES' : 'ACCESSIBLE FILES'}`;
        if (emptyState) emptyState.hidden = visibleCount !== 0;

        const activeButton = navButtons.find(button => button.classList.contains('is-active'));
        if (!activeButton || activeButton.hidden) {
            const firstVisible = directory.find(item => !sections.get(item.id)?.hidden);
            if (firstVisible) setActive(firstVisible.id);
        }
        updateActiveFromScroll();
    }

    function scrollToSection(id) {
        const section = sections.get(id);
        if (!section || section.hidden) return;
        const top = section.getBoundingClientRect().top - content.getBoundingClientRect().top + content.scrollTop;
        content.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
        setActive(id);
    }

    navButtons.forEach(button => button.addEventListener('click', () => scrollToSection(button.dataset.archiveTarget)));
    search?.addEventListener('input', applySearch);
    content.addEventListener('scroll', () => {
        if (!scrollFrame) scrollFrame = requestAnimationFrame(updateActiveFromScroll);
    }, { passive: true });

    menuButton?.addEventListener('click', () => showMenu('infoMenu'));
    backButton?.addEventListener('click', () => {
        showMenu('mainMenu');
        menuButton?.focus();
    });

    document.addEventListener('keydown', event => {
        if (document.body.dataset.activeMenu !== 'infoMenu') return;
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            showMenu('mainMenu');
            menuButton?.focus();
        } else if (event.key === 'Enter' && event.target === search) {
            const firstMatch = getEntries().find(entry => !entry.hidden);
            if (firstMatch) {
                event.preventDefault();
                firstMatch.open = true;
                firstMatch.querySelector('summary')?.focus();
            }
        }
    }, true);

    window.refreshArchiveUI = applySearch;
    window.openArchiveView = () => {
        content.scrollTop = 0;
        setActive(directory[0].id);
        applySearch();
    };
})();

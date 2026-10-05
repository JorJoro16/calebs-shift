(() => {
    'use strict';

    const modeScreen = document.getElementById('modeMenu');
    const challengeScreen = document.getElementById('challengeMenu');
    const mapSelectScreen = document.getElementById('mapSelectScreen');
    const runSetupScreen = document.getElementById('runSetupScreen');
    if (!modeScreen || !challengeScreen || !mapSelectScreen || !runSetupScreen) return;

    const mainPlayButton = document.getElementById('lobbyPlayButton');
    const modeBackButton = document.getElementById('playScreenBack');
    const campaignButton = document.getElementById('campaignLaunchButton');
    const challengeBackButton = document.getElementById('challengeScreenBack');
    const challengeContent = document.getElementById('challengeContent');
    const runMapList = document.getElementById('runMapList');
    const mapContinueButton = document.getElementById('mapContinueButton');
    const runStartButton = document.getElementById('startRunButton');
    const runDifficultyValue = document.getElementById('runDifficultyValue');
    const timeOutputs = [document.getElementById('playChallengeCountdown'), document.getElementById('challengeResetCountdown')].filter(Boolean);
    let returnFocus = mainPlayButton;
    let lastDateKey = '';

    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);

    function currentDateKey(date = new Date()) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    function focusScreenHeading(screen) {
        window.requestAnimationFrame(() => screen.querySelector('h1[tabindex="-1"]')?.focus({ preventScroll: true }));
    }

    function enterScreen(screen, focusReturnTo) {
        returnFocus = focusReturnTo || document.activeElement;
        if (typeof window.showMenu === 'function') window.showMenu(screen.id);
        else {
            document.querySelectorAll('.menu-panel').forEach(panel => { panel.style.display = 'none'; });
            screen.style.display = 'flex';
        }
        focusScreenHeading(screen);
    }

    function leaveScreen(destination, focusTarget) {
        if (typeof window.showMenu === 'function') window.showMenu(destination);
        else {
            document.querySelectorAll('.menu-panel').forEach(panel => { panel.style.display = 'none'; });
            const targetScreen = document.getElementById(destination);
            if (targetScreen) targetScreen.style.display = 'flex';
        }
        window.requestAnimationFrame(() => (focusTarget || returnFocus)?.focus?.({ preventScroll: true }));
    }

    function renderCampaignRoute(snapshot) {
        const total = Math.max(1, Number(snapshot.campaignTotal) || 1);
        const cleared = Math.max(0, Math.min(total, Number(snapshot.campaignCleared) || 0));
        const progress = document.getElementById('campaignProgressText');
        const map = document.getElementById('campaignNextMap');
        const description = document.getElementById('campaignNextDescription');
        const track = document.getElementById('campaignRouteProgress');
        const fill = document.getElementById('campaignRouteFill');
        const nodes = document.getElementById('campaignRouteNodes');
        const launch = document.getElementById('campaignLaunchButton');

        if (progress) progress.textContent = `${cleared} / ${total} SITES CLEARED`;
        if (map) map.textContent = snapshot.nextCampaignMap || 'LEVEL 0 — THE MAZE';
        if (description) description.textContent = snapshot.nextCampaignDescription || 'Choose a route and begin your shift.';
        if (track) {
            track.setAttribute('aria-valuemax', String(total));
            track.setAttribute('aria-valuenow', String(cleared));
        }
        if (fill) fill.style.width = `${(cleared / total) * 100}%`;
        if (nodes) {
            nodes.innerHTML = Array.from({ length: total }, (_, index) => {
                const state = index < cleared ? 'is-cleared' : index === cleared ? 'is-next' : '';
                return `<i class="play-route-node ${state}" aria-hidden="true"><span>${String(index + 1).padStart(2, '0')}</span></i>`;
            }).join('');
        }
        if (launch) launch.innerHTML = `${cleared ? 'CONTINUE CAMPAIGN' : 'BEGIN CAMPAIGN'} <span aria-hidden="true">↗</span>`;
    }

    function renderPlayModeScreen() {
        const snapshot = window.getPlayMenuSnapshot?.();
        if (!snapshot) return;
        renderCampaignRoute(snapshot);
        const modeCards = Array.from(modeScreen.querySelectorAll('[data-play-mode]'));
        const modeCount = modeCards.length + 1;
        const countReadout = document.getElementById('playModeCount');
        const totalReadout = document.getElementById('playModeTotal');
        if (countReadout) countReadout.textContent = `${String(modeCount).padStart(2, '0')} ACTIVE MODES`;
        if (totalReadout) totalReadout.textContent = `/ ${String(modeCount).padStart(2, '0')}`;
        modeCards.forEach((button, index) => {
            const serial = button.querySelector('.play-card-topline > i');
            if (serial) serial.textContent = String(index + 2).padStart(2, '0');
        });
        const endless = document.getElementById('endlessBestReadout');
        const survival = document.getElementById('survivalSiteReadout');
        const challenges = document.getElementById('challengeProgressReadout');
        if (endless) endless.textContent = `BEST · ${Number(snapshot.endlessBest) || 0} ROUNDS`;
        if (survival) survival.textContent = `${Number(snapshot.unlockedMapCount) || 1} ${Number(snapshot.unlockedMapCount) === 1 ? 'SITE' : 'SITES'} AVAILABLE`;
        if (challenges) challenges.textContent = `${Number(snapshot.challengeCompleteCount) || 0} / 3 CLEARED`;
        renderResetCountdown();
    }

    const modeLabels = { campaign: 'CAMPAIGN', endless: 'ENDLESS', survival: 'SURVIVAL' };
    const modeDescriptions = {
        campaign: 'Clear this location to open the next site on your campaign route.',
        endless: 'Clear the site to continue the loop. Each round raises the pressure.',
        survival: 'Your hunter pool and site rules shape this custom run.'
    };
    const mapMarks = { level0: '0', boilerworks: '3', hotel: 'H', crimson: 'C', forest: 'F', amine: 'G', subway: 'L', lucas: 'S' };
    const difficultyNames = ['EASY', 'NORMAL', 'HARD'];

    function equipmentMarkup(loadout) {
        if (!loadout) return '';
        const items = Array.isArray(loadout.items) ? loadout.items : [];
        const itemRows = items.slice(0, 4).map(item => {
            const itemIcon = item.icon
                ? `<img src="${escapeHtml(item.icon)}" alt="" aria-hidden="true">`
                : `<i aria-hidden="true">${escapeHtml(item.mark || item.name.slice(0, 1))}</i>`;
            return `<span class="run-equipped-item">${itemIcon}<span>${escapeHtml(item.name)} ×${Number(item.count) || 0}</span></span>`;
        }).join('');
        const extraTypes = Math.max(0, items.length - 4);
        const supplies = items.length
            ? `${itemRows}${extraTypes ? `<span class="run-equipped-item">+${extraTypes} MORE</span>` : ''}`
            : '<span class="run-equipped-empty">NO SUPPLIES IN THIS KIT</span>';
        return `<span class="run-equipped-mark"><img src="${escapeHtml(loadout.icon)}" alt="" aria-hidden="true"></span><span class="run-equipped-copy"><span>CURRENTLY EQUIPPED</span><strong>${escapeHtml(loadout.name)}</strong><small>${Number(loadout.totalItems) || 0} supplies ready · manage in Loadouts</small></span><span class="run-equipped-items">${supplies}</span>`;
    }

    function renderMapSelection(snapshot) {
        const maps = Array.isArray(snapshot.maps) ? snapshot.maps : [];
        const selectedMap = maps.find(map => map.id === snapshot.selectedMapId) || maps.find(map => map.selectable) || maps[0];
        if (!selectedMap || !runMapList) return;
        const unlockedCount = maps.filter(map => map.selectable).length;
        const modeLabel = modeLabels[snapshot.mode] || 'SHIFT';
        const progress = document.getElementById('mapSelectProgress');
        const listLabel = document.getElementById('mapListModeLabel');
        const kicker = document.getElementById('mapSelectKicker');
        if (progress) progress.textContent = `${unlockedCount} / ${maps.length} SITES OPEN`;
        if (listLabel) listLabel.textContent = `${modeLabel} ROUTE`;
        if (kicker) kicker.innerHTML = `${modeLabel} DISPATCH <i>01 / SITE INDEX</i>`;
        runMapList.innerHTML = maps.map(map => {
            const active = map.id === selectedMap.id;
            const state = snapshot.mode === 'campaign'
                ? (map.status || (map.selectable ? 'AVAILABLE' : 'SEALED'))
                : !map.selectable ? 'SEALED' : snapshot.mode === 'endless' && map.endlessBest ? `BEST ${Number(map.endlessBest)}` : 'OPEN';
            const subline = !map.selectable
                ? (map.campaignRouteLocked ? 'CLEAR THE PRIOR SITE' : 'CLEAR IN CAMPAIGN')
                : snapshot.mode === 'campaign' && map.cleared ? 'ROUTE CLEARED' : 'SITE OPEN';
            return `<button type="button" class="run-map-row${active ? ' is-selected' : ''}" data-run-map="${escapeHtml(map.id)}" data-map-status="${escapeHtml(state)}" ${map.selectable ? '' : 'disabled'} aria-pressed="${active}" aria-label="${escapeHtml(map.name)} · ${escapeHtml(subline)}">
                <span class="run-map-row-index">${String(Number(map.order) + 1).padStart(2, '0')}</span><span class="run-map-row-copy"><strong>${escapeHtml(map.name)}</strong><small>${escapeHtml(subline)}</small></span><span class="run-map-row-state">${active ? '●' : escapeHtml(state)}</span>
            </button>`;
        }).join('');

        const serial = String(Number(selectedMap.order) + 1).padStart(2, '0');
        const illustration = document.getElementById('runMapIllustration');
        if (illustration) illustration.dataset.mapId = selectedMap.id;
        const setText = (id, value) => { const element = document.getElementById(id); if (element) element.textContent = value; };
        setText('runMapSerial', serial);
        setText('runMapMark', mapMarks[selectedMap.id] || serial);
        setText('runMapOrder', `SITE ${serial} / ${String(maps.length).padStart(2, '0')}`);
        setText('runMapTitle', selectedMap.name);
        setText('runMapDescription', selectedMap.description || (selectedMap.campaignRouteLocked ? 'Complete the previous campaign site to open this route file.' : 'Clear this site in Campaign to add it to your dispatch options.'));
        setText('runMapStatus', selectedMap.status || 'AVAILABLE');
        const status = document.getElementById('runMapStatus');
        if (status) status.dataset.state = selectedMap.status || 'AVAILABLE';
        const metricLabel = document.getElementById('runMapMetricLabel');
        const metricValue = document.getElementById('runMapMetricValue');
        if (snapshot.mode === 'endless') {
            if (metricLabel) metricLabel.textContent = 'ENDLESS RECORD';
            if (metricValue) metricValue.textContent = selectedMap.endlessBest ? `ROUND ${Number(selectedMap.endlessBest)}` : 'NO CLEAR YET';
        } else if (snapshot.mode === 'survival') {
            if (metricLabel) metricLabel.textContent = 'SITE ACCESS';
            if (metricValue) metricValue.textContent = selectedMap.selectable ? 'READY TO CONFIGURE' : 'NOT OPEN';
        } else {
            if (metricLabel) metricLabel.textContent = 'CAMPAIGN ROUTE';
            if (metricValue) metricValue.textContent = selectedMap.cleared ? 'SITE CLEARED' : selectedMap.selectable ? 'READY TO ENTER' : 'NOT OPEN';
        }
        setText('runMapMastery', `${Math.min(3, Number(selectedMap.masteryCount) || 0)} / 3`);
        if (mapContinueButton) {
            mapContinueButton.disabled = !selectedMap.selectable;
            mapContinueButton.innerHTML = selectedMap.selectable
                ? 'SET UP THIS RUN <span aria-hidden="true">↗</span>'
                : 'SITE SEALED <span aria-hidden="true">⌑</span>';
        }
        const equipment = equipmentMarkup(snapshot.loadout);
        const mapEquipment = document.getElementById('mapEquippedLoadout');
        if (mapEquipment) mapEquipment.innerHTML = equipment;
    }

    function summaryField(label, value) {
        return `<div class="run-summary-field"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
    }

    function updateSurvivalSummaryText(snapshot) {
        const summary = document.getElementById('survivalSummary');
        const selectedHunters = ['Caleb', 'Malakai', 'Jordan', 'Aeson', 'Bassam', 'Rhys', 'Noah', 'Amine', 'Nizar']
            .filter(name => document.getElementById(`survival${name}`)?.checked);
        const count = Number(document.getElementById('survivalCount')?.value) || 1;
        const difficulty = difficultyNames[Number(document.getElementById('survivalDiff')?.value) || 0];
        const output = document.getElementById('survivalCountOutput');
        const generatorOutput = document.getElementById('survivalGensOutput');
        if (output) output.textContent = String(count);
        if (generatorOutput) generatorOutput.textContent = String(Number(document.getElementById('survivalGens')?.value) || 4);
        if (summary) summary.textContent = `${selectedHunters.length} hunter${selectedHunters.length === 1 ? '' : 's'} in pool · ${count} active · ${difficulty} · ${document.getElementById('survivalEvents')?.checked ? 'map events on' : 'map events off'}`;
        const start = document.getElementById('startRunButton');
        if (start) {
            start.disabled = selectedHunters.length === 0;
            start.classList.toggle('is-disabled', selectedHunters.length === 0);
            start.setAttribute('aria-disabled', String(selectedHunters.length === 0));
        }
        const modeReadout = document.getElementById('runSetupSummary');
        if (modeReadout && snapshot.mode === 'survival') {
            const pool = selectedHunters.length ? `${selectedHunters.length} HUNTER${selectedHunters.length === 1 ? '' : 'S'}` : 'CHOOSE A HUNTER';
            modeReadout.innerHTML = `${summaryField('RULE SET', difficulty)}${summaryField('HUNTERS', `${count} ACTIVE · ${pool}`)}${summaryField('GENERATORS', String(Number(document.getElementById('survivalGens')?.value) || 4))}${summaryField('MAP EVENTS', document.getElementById('survivalEvents')?.checked ? 'ENABLED' : 'DISABLED')}`;
        }
    }

    function renderRunBriefing(snapshot) {
        const map = snapshot.maps.find(entry => entry.id === snapshot.selectedMapId) || snapshot.maps.find(entry => entry.selectable) || snapshot.maps[0];
        if (!map) return;
        const isSurvival = snapshot.mode === 'survival';
        const selectedDifficulty = Number(runDifficultyValue?.value ?? 1);
        const survivalDifficulty = Number(document.getElementById('survivalDiff')?.value ?? 1);
        const modeName = modeLabels[snapshot.mode] || 'SHIFT';
        const setText = (id, value) => { const element = document.getElementById(id); if (element) element.textContent = value; };
        const setMarkup = (id, value) => { const element = document.getElementById(id); if (element) element.innerHTML = value; };
        setText('runSetupModeReadout', modeName);
        setMarkup('runSetupKicker', `${modeName} <i>ROUTE PREPARATION</i>`);
        setText('runSetupMapTitle', map.name);
        setText('runSetupMapDescription', map.description || 'Campaign access is required to open this site.');
        setText('runSetupMapOrder', `SITE ${String(Number(map.order) + 1).padStart(2, '0')}`);
        setText('runDestinationMark', mapMarks[map.id] || String(Number(map.order) + 1));
        setText('runBriefTitle', modeName.replace(/\b\w/g, letter => letter.toUpperCase()).toLowerCase().replace(/^\w/, letter => letter.toUpperCase()));
        setText('runBriefDescription', modeDescriptions[snapshot.mode] || 'Review the shift conditions before departure.');
        setText('runOrderCode', `CS / ${String(Number(map.order) + 1).padStart(2, '0')}`);

        document.getElementById('standardRunControls').hidden = isSurvival;
        document.getElementById('survivalRunControls').hidden = !isSurvival;
        const lucasChoice = document.getElementById('lucasRouteChoice');
        if (lucasChoice) lucasChoice.hidden = !snapshot.lucasBossChoiceAvailable;
        document.querySelectorAll('[data-lucas-entry]').forEach(button => {
            const selected = (button.dataset.lucasEntry === 'true') === Boolean(snapshot.campaignStartAtBoss);
            button.classList.toggle('is-selected', selected);
            button.setAttribute('aria-checked', String(selected));
        });
        document.querySelectorAll('[data-run-difficulty]').forEach(button => {
            const selected = Number(button.dataset.runDifficulty) === selectedDifficulty;
            button.classList.toggle('is-selected', selected);
            button.setAttribute('aria-checked', String(selected));
            button.tabIndex = selected ? 0 : -1;
        });
        document.querySelectorAll('[data-survival-difficulty]').forEach(button => {
            const selected = Number(button.dataset.survivalDifficulty) === survivalDifficulty;
            button.classList.toggle('is-selected', selected);
            button.setAttribute('aria-checked', String(selected));
            button.tabIndex = selected ? 0 : -1;
        });

        const selectedRecord = snapshot.mode === 'endless'
            ? (map.endlessBest ? `ROUND ${Number(map.endlessBest)}` : 'NO RECORD')
            : (map.cleared ? 'CAMPAIGN CLEAR' : 'FIRST CLEAR');
        const fields = isSurvival
            ? ''
            : `${summaryField('MODE', modeName)}${summaryField('DIFFICULTY', difficultyNames[selectedDifficulty] || 'NORMAL')}${summaryField('CLEAR REWARD', `+${[10, 25, 40][selectedDifficulty] || 25} TOKENS`)}${summaryField(snapshot.mode === 'endless' ? 'SITE RECORD' : 'ROUTE STATUS', selectedRecord)}`;
        setMarkup('runSetupSummary', fields);
        setMarkup('runEquippedLoadout', equipmentMarkup(snapshot.loadout));
        const startButton = document.getElementById('startRunButton');
        if (startButton) {
            const label = snapshot.mode === 'survival' ? 'START SURVIVAL' : snapshot.mode === 'endless' ? 'BEGIN ENDLESS' : 'BEGIN CAMPAIGN';
            startButton.innerHTML = `${label} <span aria-hidden="true">↗</span>`;
            if (!isSurvival) { startButton.disabled = false; startButton.classList.remove('is-disabled'); startButton.setAttribute('aria-disabled', 'false'); }
        }
        setText('runSetupFooterNote', `EQUIPPED KIT · ${snapshot.loadout.name}`);
        if (isSurvival) updateSurvivalSummaryText(snapshot);
    }

    function renderRunFlowScreens() {
        const snapshot = window.getRunFlowSnapshot?.();
        if (!snapshot || !Array.isArray(snapshot.maps) || !snapshot.maps.length) return;
        renderMapSelection(snapshot);
        renderRunBriefing(snapshot);
    }

    function contractCard(challenge, completed) {
        const serial = String(challenge.index + 1).padStart(2, '0');
        const difficulty = escapeHtml(challenge.difficultyName || 'NORMAL');
        const title = escapeHtml(challenge.title || 'FIELD CONTRACT');
        const detail = escapeHtml(challenge.detail || 'Complete the assignment and return alive.');
        const mapName = escapeHtml(challenge.mapName || 'UNKNOWN SITE');
        const reward = Math.max(0, Number(challenge.reward) || 0);
        const stateClass = completed ? ' is-complete' : '';
        const control = completed
            ? '<button class="challenge-accept-button is-cleared-button" type="button" disabled><span>CONTRACT CLEARED</span><i aria-hidden="true">✓</i></button>'
            : `<button class="challenge-accept-button" type="button" data-challenge-index="${challenge.index}"><span>ACCEPT CONTRACT</span><i aria-hidden="true">↗</i></button>`;

        return `<article class="challenge-contract-card${stateClass}">
            <div class="challenge-contract-rail"><span>${serial}</span><i aria-hidden="true"></i></div>
            <div class="challenge-contract-main">
                <div class="challenge-contract-topline"><span>DAILY CONTRACT</span><span class="challenge-contract-difficulty">${difficulty}</span></div>
                <h2>${title}</h2>
                <p>${detail}</p>
                <div class="challenge-contract-meta"><span><i aria-hidden="true">⌖</i> ${mapName}</span><span>+${reward} T BONUS</span></div>
                ${completed ? '<div class="challenge-cleared-stamp" aria-label="Completed today">CLEARED TODAY</div>' : ''}
                ${control}
            </div>
            <span class="challenge-contract-watermark" aria-hidden="true">${completed ? '✓' : serial}</span>
        </article>`;
    }

    function renderChallengeScreen() {
        const snapshot = window.getDailyChallengeSnapshot?.();
        if (!snapshot || !challengeContent) return;
        const completedIds = new Set(snapshot.completedIds || []);
        challengeContent.innerHTML = snapshot.cards.map(challenge => contractCard(challenge, completedIds.has(challenge.id))).join('');
        const count = Math.min(3, completedIds.size);
        const countLabel = document.getElementById('challengeCompletedCount');
        const progress = challengeScreen.querySelector('.challenge-board-progress [role="progressbar"]');
        const fill = document.getElementById('challengeProgressFill');
        if (countLabel) countLabel.textContent = `${count} / 3`;
        if (progress) progress.setAttribute('aria-valuenow', String(count));
        if (fill) fill.style.width = `${(count / 3) * 100}%`;
        renderResetCountdown();
    }

    function millisecondsUntilReset(now = new Date()) {
        const nextMidnight = new Date(now);
        nextMidnight.setHours(24, 0, 0, 0);
        return Math.max(0, nextMidnight.getTime() - now.getTime());
    }

    function formatDuration(milliseconds) {
        const seconds = Math.max(0, Math.floor(milliseconds / 1000));
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainder = seconds % 60;
        return [hours, minutes, remainder].map(value => String(value).padStart(2, '0')).join(':');
    }

    function renderResetCountdown() {
        const now = new Date();
        const value = formatDuration(millisecondsUntilReset(now));
        timeOutputs.forEach(output => { output.textContent = value; });
    }

    function onDailyClock() {
        const today = currentDateKey();
        renderResetCountdown();
        if (today === lastDateKey) return;
        lastDateKey = today;
        // Reading the snapshot also runs the existing save-safe daily rollover.
        window.getDailyChallengeSnapshot?.();
        renderPlayModeScreen();
        if (document.body.dataset.activeMenu === 'challengeMenu') {
            // Refresh the game-side board as well as the page when midnight passes
            // while the contracts screen is already open.
            window.openChallengeMode?.();
            focusScreenHeading(challengeScreen);
        } else {
            renderChallengeScreen();
        }
    }

    function trapFocus(event, screen) {
        if (event.key !== 'Tab') return;
        const focusable = Array.from(screen.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), [tabindex]:not([tabindex="-1"])'))
            .filter(element => element.getClientRects().length > 0);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || !screen.contains(document.activeElement))) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !screen.contains(document.activeElement))) {
            event.preventDefault();
            first.focus();
        }
    }

    function chooseModeAndFocus(mode) {
        window.chooseMode?.(mode);
        focusScreenHeading(mapSelectScreen);
    }

    function currentMapFocusTarget() {
        const snapshot = window.getRunFlowSnapshot?.();
        return Array.from(runMapList?.querySelectorAll('[data-run-map]') || []).find(button => button.dataset.runMap === snapshot?.selectedMapId)
            || mapContinueButton;
    }

    function handleRadioArrow(event, selector) {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return false;
        const group = Array.from(document.querySelectorAll(selector)).filter(button => !button.disabled);
        const currentIndex = group.indexOf(event.target);
        if (currentIndex < 0 || !group.length) return false;
        event.preventDefault();
        const direction = ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1;
        const next = group[(currentIndex + direction + group.length) % group.length];
        next.focus();
        next.click();
        return true;
    }

    mainPlayButton?.addEventListener('click', event => enterScreen(modeScreen, event.currentTarget));
    modeBackButton?.addEventListener('click', () => leaveScreen('mainMenu', mainPlayButton));
    campaignButton?.addEventListener('click', () => chooseModeAndFocus('campaign'));
    challengeBackButton?.addEventListener('click', () => leaveScreen('modeMenu', document.querySelector('[data-play-mode="challenge"]')));

    modeScreen.querySelectorAll('[data-play-mode]').forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.dataset.playMode;
            if (mode === 'challenge') {
                window.openChallengeMode?.();
                focusScreenHeading(challengeScreen);
            }
            else if (mode === 'endless' || mode === 'survival') chooseModeAndFocus(mode);
        });
    });

    document.querySelectorAll('[data-run-back]').forEach(button => {
        button.addEventListener('click', () => {
            const destination = button.dataset.runBack;
            const focusTarget = destination === 'mapSelectScreen'
                ? currentMapFocusTarget()
                : destination === 'modeMenu'
                    ? (window.getRunFlowSnapshot?.().mode === 'campaign' ? campaignButton : document.querySelector(`[data-play-mode="${window.getRunFlowSnapshot?.().mode}"]`))
                    : null;
            leaveScreen(destination, focusTarget);
        });
    });

    runMapList?.addEventListener('click', event => {
        const button = event.target instanceof Element ? event.target.closest('[data-run-map]') : null;
        if (!button || button.disabled) return;
        if (window.previewRunMap?.(button.dataset.runMap)) {
            window.requestAnimationFrame(() => currentMapFocusTarget()?.focus({ preventScroll: true }));
        }
    });
    mapContinueButton?.addEventListener('click', () => {
        const snapshot = window.getRunFlowSnapshot?.();
        if (!snapshot?.selectedMapId) return;
        window.selectMap?.(snapshot.selectedMapId);
        focusScreenHeading(runSetupScreen);
    });
    document.getElementById('runDifficultyChoices')?.addEventListener('click', event => {
        const button = event.target instanceof Element ? event.target.closest('[data-run-difficulty]') : null;
        if (!button || !runDifficultyValue) return;
        runDifficultyValue.value = button.dataset.runDifficulty;
        renderRunFlowScreens();
    });
    document.querySelectorAll('[data-lucas-entry]').forEach(button => {
        button.addEventListener('click', () => window.chooseLucasCampaignStart?.(button.dataset.lucasEntry === 'true'));
    });
    document.getElementById('survivalRunControls')?.addEventListener('click', event => {
        const button = event.target instanceof Element ? event.target.closest('[data-survival-difficulty]') : null;
        if (button) {
            const input = document.getElementById('survivalDiff');
            if (input) input.value = button.dataset.survivalDifficulty;
            renderRunFlowScreens();
            return;
        }
        const stepper = event.target instanceof Element ? event.target.closest('[data-stepper-target]') : null;
        if (!stepper) return;
        const input = document.getElementById(stepper.dataset.stepperTarget);
        if (!input) return;
        const bounds = input.id === 'survivalCount' ? [1, 8] : [3, 8];
        input.value = String(Math.max(bounds[0], Math.min(bounds[1], (Number(input.value) || bounds[0]) + Number(stepper.dataset.stepperDelta))));
        updateSurvivalSummaryText(window.getRunFlowSnapshot?.() || { mode: 'survival' });
    });
    document.getElementById('survivalRunControls')?.addEventListener('change', event => {
        if (event.target instanceof HTMLInputElement && event.target.type === 'checkbox') {
            updateSurvivalSummaryText(window.getRunFlowSnapshot?.() || { mode: 'survival' });
        }
    });
    runStartButton?.addEventListener('click', () => {
        const mode = window.getRunFlowSnapshot?.().mode;
        if (mode === 'survival') window.startSurvival?.();
        else window.startSelectedGame?.(Number(runDifficultyValue?.value ?? 1));
    });

    challengeContent?.addEventListener('click', event => {
        const button = event.target instanceof Element ? event.target.closest('[data-challenge-index]') : null;
        if (button) window.startChallenge?.(Number(button.dataset.challengeIndex));
    });

    [modeScreen, challengeScreen, mapSelectScreen, runSetupScreen].forEach(screen => screen.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            event.preventDefault();
            if (screen === challengeScreen) leaveScreen('modeMenu', document.querySelector('[data-play-mode="challenge"]'));
            else if (screen === mapSelectScreen) leaveScreen('modeMenu', window.getRunFlowSnapshot?.().mode === 'campaign' ? campaignButton : document.querySelector(`[data-play-mode="${window.getRunFlowSnapshot?.().mode}"]`));
            else if (screen === runSetupScreen) leaveScreen('mapSelectScreen', currentMapFocusTarget());
            else leaveScreen('mainMenu', mainPlayButton);
            return;
        }
        if (screen === runSetupScreen && handleRadioArrow(event, '#runDifficultyChoices [data-run-difficulty]')) return;
        if (screen === runSetupScreen && handleRadioArrow(event, '#survivalRunControls [data-survival-difficulty]')) return;
        if (screen === runSetupScreen && handleRadioArrow(event, '#lucasRouteChoice [data-lucas-entry]')) return;
        trapFocus(event, screen);
    }));

    window.renderPlayModeScreen = renderPlayModeScreen;
    window.renderChallengeScreen = renderChallengeScreen;
    window.renderRunFlowScreens = renderRunFlowScreens;
    window.refreshPlayScreen = () => {
        renderPlayModeScreen();
        renderChallengeScreen();
        renderRunFlowScreens();
    };

    lastDateKey = currentDateKey();
    renderResetCountdown();
    window.setInterval(onDailyClock, 1000);
    document.addEventListener('visibilitychange', onDailyClock);
})();

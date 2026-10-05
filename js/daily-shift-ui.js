(() => {
    'use strict';

    const openButton = document.getElementById('lobbyDailyShiftButton');
    const backButton = document.getElementById('dailyShiftBack');
    const screen = document.getElementById('objectivesMenu');
    const scrollPane = screen?.querySelector('.lobby-shift-main');
    const title = document.getElementById('dailyShiftTitle');
    const countdown = document.getElementById('dailyShiftCountdown');
    if (!openButton || !backButton || !screen || !scrollPane) return;

    let returnFocus = openButton;
    let currentDateKey = getLocalDateKey();

    function getLocalDateKey(date = new Date()) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    function updateCountdown() {
        if (!countdown) return;
        const now = new Date();
        const nextMidnight = new Date(now);
        nextMidnight.setHours(24, 0, 0, 0);
        const secondsLeft = Math.max(0, Math.floor((nextMidnight.getTime() - now.getTime()) / 1000));
        const hours = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
        const seconds = String(secondsLeft % 60).padStart(2, '0');
        countdown.textContent = `${hours}:${minutes}:${seconds}`;

        const dateKey = getLocalDateKey(now);
        if (dateKey !== currentDateKey) {
            currentDateKey = dateKey;
            if (typeof window.ensureDailyObjectives === 'function') window.ensureDailyObjectives();
            if (typeof window.renderDailyObjectives === 'function') window.renderDailyObjectives();
        }
    }

    function openDailyShift(event) {
        event?.preventDefault();
        returnFocus = event?.currentTarget || openButton;
        if (typeof window.showMenu === 'function') window.showMenu('objectivesMenu');
        else screen.style.display = 'flex';
        scrollPane.scrollTop = 0;
        title?.focus({ preventScroll: true });
    }

    function returnToLobby() {
        if (typeof window.showMenu === 'function') window.showMenu('mainMenu');
        else screen.style.display = 'none';
        returnFocus?.focus({ preventScroll: true });
    }

    openButton.addEventListener('click', openDailyShift);
    updateCountdown();
    window.setInterval(updateCountdown, 1000);
    backButton.addEventListener('click', returnToLobby);
    screen.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            event.preventDefault();
            returnToLobby();
        }
    });
})();

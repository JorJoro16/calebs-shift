(() => {
    const audio = document.getElementById('menuMusicAudio');
    const trackName = document.getElementById('menuMusicTrackName');
    const volumeSlider = document.getElementById('menuMusicVolume');
    const volumeValue = document.getElementById('menuMusicVolumeValue');
    const previousButton = document.getElementById('menuMusicPrevious');
    const toggleButton = document.getElementById('menuMusicToggle');
    const toggleIcon = document.getElementById('menuMusicToggleIcon');
    const nextButton = document.getElementById('menuMusicNext');
    const mainMenu = document.getElementById('mainMenu');
    if (!audio || !trackName || !volumeSlider || !toggleButton || !mainMenu) return;

    const tracks = [
        { name: 'Still Life', src: 'assets/audio/menu/still-life.mp3' },
        { name: 'Back There', src: 'assets/audio/menu/back-there.mp3' },
        { name: 'Camaraderie', src: 'assets/audio/menu/camaraderie.mp3' }
    ];
    const storage = {
        volume: 'caleb_shift_menu_music_volume_v1',
        track: 'caleb_shift_menu_music_track_v1',
        paused: 'caleb_shift_menu_music_paused_v1'
    };
    const readStoredNumber = (key, fallback) => {
        try {
            const stored = localStorage.getItem(key);
            if (stored === null || stored.trim() === '') return fallback;
            const value = Number(stored);
            return Number.isFinite(value) ? value : fallback;
        } catch (_) {
            return fallback;
        }
    };
    const writeStoredValue = (key, value) => {
        try { localStorage.setItem(key, String(value)); } catch (_) { /* Music controls still work without storage. */ }
    };
    const clampPercent = value => Math.max(0, Math.min(100, Number(value) || 0));

    let trackIndex = Math.max(0, Math.min(tracks.length - 1, Math.floor(readStoredNumber(storage.track, 0))));
    let trackVolume = clampPercent(readStoredNumber(storage.volume, 35));
    let masterVolume = clampPercent(readStoredNumber('br_volM', 100));
    let explicitlyPaused = false;
    try { explicitlyPaused = localStorage.getItem(storage.paused) === 'true'; } catch (_) { /* Use the default play preference. */ }

    function updateEffectiveVolume() {
        audio.volume = (trackVolume / 100) * (masterVolume / 100);
        volumeSlider.value = String(trackVolume);
        volumeSlider.style.setProperty('--music-volume-progress', `${Math.round(trackVolume)}%`);
        if (volumeValue) volumeValue.value = `${Math.round(trackVolume)}%`;
        if (volumeValue) volumeValue.textContent = `${Math.round(trackVolume)}%`;
    }

    function updatePlaybackControl() {
        const playing = !audio.paused && !audio.ended;
        toggleButton.setAttribute('aria-label', playing ? 'Pause menu music' : 'Play menu music');
        toggleButton.setAttribute('title', playing ? 'Pause menu music' : 'Play menu music');
        toggleButton.setAttribute('aria-pressed', String(playing));
        if (toggleIcon) toggleIcon.src = playing ? 'assets/ui/icons/audio-controls/pause.svg' : 'assets/ui/icons/audio-controls/play.svg';
    }

    function loadTrack(index, continuePlayback = false) {
        trackIndex = (index + tracks.length) % tracks.length;
        trackName.textContent = tracks[trackIndex].name;
        writeStoredValue(storage.track, trackIndex);
        audio.src = tracks[trackIndex].src;
        audio.load();
        updateEffectiveVolume();
        updatePlaybackControl();
        if (continuePlayback) startPlayback();
    }

    function startPlayback() {
        explicitlyPaused = false;
        writeStoredValue(storage.paused, false);
        const playback = audio.play();
        if (playback && typeof playback.then === 'function') {
            playback.then(updatePlaybackControl).catch(updatePlaybackControl);
        }
    }

    function skipTrack(offset) {
        const shouldContinue = !explicitlyPaused;
        loadTrack(trackIndex + offset, shouldContinue);
    }

    volumeSlider.value = String(trackVolume);
    volumeSlider.addEventListener('input', () => {
        trackVolume = clampPercent(volumeSlider.value);
        writeStoredValue(storage.volume, trackVolume);
        updateEffectiveVolume();
    });

    previousButton?.addEventListener('click', () => skipTrack(-1));
    nextButton?.addEventListener('click', () => skipTrack(1));
    toggleButton.addEventListener('click', () => {
        if (audio.paused || audio.ended) {
            startPlayback();
        } else {
            explicitlyPaused = true;
            writeStoredValue(storage.paused, true);
            audio.pause();
            updatePlaybackControl();
        }
    });

    audio.addEventListener('play', updatePlaybackControl);
    audio.addEventListener('pause', updatePlaybackControl);
    audio.addEventListener('ended', () => loadTrack(trackIndex + 1, !explicitlyPaused));

    window.updateMenuMusicMasterVolume = value => {
        masterVolume = clampPercent(value);
        updateEffectiveVolume();
    };
    window.pauseMenuMusicForGameplay = () => {
        audio.pause();
        updatePlaybackControl();
    };
    window.resumeMenuMusic = () => {
        if (!explicitlyPaused && audio.paused) startPlayback();
    };

    // Browsers may block the initial autoplay until the player receives a gesture.
    // Retry on the first non-player interaction while the lobby is still open.
    document.addEventListener('pointerdown', event => {
        if (explicitlyPaused || !audio.paused || mainMenu.style.display === 'none') return;
        if (event.target instanceof Element && event.target.closest('.lobby-music-player')) return;
        startPlayback();
    });

    loadTrack(trackIndex);
    updateEffectiveVolume();
    if (!explicitlyPaused) startPlayback();
    else updatePlaybackControl();
})();

(() => {
    'use strict';

    const screen = document.getElementById('cosmeticsMenu');
    const content = document.getElementById('cosmeticsContent');
    const canvas = document.getElementById('wardrobePreviewCanvas');
    const context = canvas?.getContext('2d');
    const title = document.getElementById('wardrobePreviewName');
    const detail = document.getElementById('wardrobePreviewDetail');
    const status = document.getElementById('wardrobePreviewStatus');
    const trailReadout = document.getElementById('wardrobeTrailReadout');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const validCategories = ['colors', 'trails', 'hats', 'masks', 'skins', 'menuThemes'];
    const categoryMeta = {
        colors: { heading: 'Colors', copy: 'A clear color mark makes your survivor easier to spot in a crowded shift.' },
        trails: { heading: 'Trails', copy: 'Preview each trail in motion. Locked effects can be inspected without changing your saved equipment.' },
        hats: { heading: 'Hats', copy: 'A familiar shape can make the long halls feel a little more personal.' },
        masks: { heading: 'Masks', copy: 'Recovered masks are displayed as field specimens until they are yours.' },
        skins: { heading: 'Skins', copy: 'Full appearance records, from the standard survivor to hard-earned clear marks.' }
    };
    const paletteColors = {
        blue: '#00aaff', crimson: '#d22', violet: '#a64dff', green: '#19c76b',
        amber: '#e7a21a', gold: '#e9cf38', sepia: '#800', white: '#f6f6f6',
        none: '#828778', spark: '#ffd750', ghost: '#b4d7ff', ember: '#ff7b35',
        static: '#d8eef2', circle: '#fff', afterimage: '#bde8ff', default: '#00aaff'
    };
    const loadedImages = new Map();
    let activeCategory = '';
    let previewItemId = null;
    let latestData = null;
    let animationFrame = 0;

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, character => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[character]);
    }

    function safeColor(value, fallback = '#b8bf7e') {
        return /^#[0-9a-f]{3,8}$/i.test(String(value || '')) ? value : fallback;
    }

    function getImage(path) {
        if (!path) return null;
        const source = `assets/${path}`;
        if (!loadedImages.has(source)) {
            const image = new Image();
            image.src = source;
            loadedImages.set(source, image);
        }
        return loadedImages.get(source);
    }

    function equippedPreview(data) {
        const current = data.cosmetics || {};
        const preview = {
            color: current.color || 'blue',
            trail: current.trail || 'none',
            hat: current.hat || 'none',
            mask: current.mask || 'none',
            skin: current.skin || 'default'
        };
        const group = data.group;
        if (group && previewItemId && group.items.some(item => item.id === previewItemId)) {
            preview[group.type] = previewItemId;
        }
        return preview;
    }

    function currentPreviewItem(data) {
        if (!data.group) return null;
        return data.group.items.find(item => item.id === previewItemId) ||
            data.group.items.find(item => item.id === (data.cosmetics || {})[data.group.type]) || null;
    }

    function selectInitialPreview(data) {
        if (!data.group) {
            previewItemId = null;
            return;
        }
        const equippedId = data.cosmetics?.[data.group.type];
        previewItemId = data.group.items.some(item => item.id === equippedId) ? equippedId : data.group.items[0]?.id || null;
    }

    function itemVisual(item, mode = 'standard') {
        const styleColor = safeColor(item.preview);
        if (item.image) {
            return `<img class="wardrobe-item-art wardrobe-item-art-${mode}" src="assets/${escapeHtml(item.image)}" alt="" loading="lazy">`;
        }
        if (['trails'].includes(activeCategory)) {
            return `<span class="wardrobe-trail-glyph wardrobe-trail-glyph-${escapeHtml(item.id)}" style="--item-color:${styleColor}" aria-hidden="true"><i></i><i></i><i></i><b></b></span>`;
        }
        return `<span class="wardrobe-color-orb" style="--item-color:${styleColor}" aria-hidden="true"><i></i></span>`;
    }

    function itemCard(item, data, variant) {
        const equipped = data.cosmetics?.[data.group.type] === item.id;
        const selected = previewItemId === item.id;
        const unlocked = data.cosmetics?.unlocked?.includes(item.id) || equipped;
        const progress = data.progressFor ? data.progressFor(item.id) : (unlocked ? 'UNLOCKED' : item.how);
        const state = equipped ? 'EQUIPPED' : selected ? (unlocked ? 'PREVIEW' : 'LOCKED SAMPLE') : (unlocked ? 'OWNED' : 'LOCKED');
        return `<button type="button" class="wardrobe-item wardrobe-item-${variant}${selected ? ' is-previewing' : ''}${equipped ? ' is-equipped' : ''}${!unlocked ? ' is-locked' : ''}" data-wardrobe-item="${escapeHtml(item.id)}" aria-pressed="${selected ? 'true' : 'false'}" aria-label="Preview ${escapeHtml(item.label)}. ${escapeHtml(state)}. ${unlocked ? 'Unlocked.' : `Unlock: ${escapeHtml(item.how)}`}" style="--item-color:${safeColor(item.preview)}">
            <span class="wardrobe-item-mark" aria-hidden="true">${String(data.group.items.indexOf(item) + 1).padStart(2, '0')}</span>
            <span class="wardrobe-item-artwell">${itemVisual(item, variant)}</span>
            <span class="wardrobe-item-copy"><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.desc)}</small><span class="wardrobe-item-unlock">${escapeHtml(unlocked ? 'ACCESS CLEARED' : `UNLOCK · ${item.how}`)}</span><span class="wardrobe-item-progress">${escapeHtml(unlocked ? 'UNLOCKED' : progress)}</span></span>
            <span class="wardrobe-item-state">${escapeHtml(state)}</span>
        </button>`;
    }

    function actionBar(data) {
        const item = currentPreviewItem(data);
        if (!item) return '';
        const equipped = data.cosmetics?.[data.group.type] === item.id;
        const unlocked = data.cosmetics?.unlocked?.includes(item.id) || equipped;
        const progress = data.progressFor ? data.progressFor(item.id) : item.how;
        const buttonLabel = equipped ? 'EQUIPPED' : unlocked ? `EQUIP ${item.label}` : 'LOCKED';
        return `<footer class="wardrobe-action-bar">
            <div class="wardrobe-action-copy"><span>${equipped ? 'CURRENTLY WORN' : unlocked ? 'READY TO EQUIP' : 'UNLOCK CONDITION'}</span><strong>${escapeHtml(equipped ? `${item.label} is equipped` : unlocked ? `Previewing ${item.label}` : item.how)}</strong>${!unlocked ? `<small>${escapeHtml(progress)}</small>` : ''}</div>
            <button type="button" class="wardrobe-equip-button" data-wardrobe-equip ${!unlocked || equipped ? 'disabled' : ''}>${escapeHtml(buttonLabel)} <span aria-hidden="true">↗</span></button>
        </footer>`;
    }

    function renderColors(data) {
        const meta = categoryMeta.colors;
        return `<header class="wardrobe-category-heading wardrobe-color-heading"><h2>${meta.heading}</h2><p>${meta.copy}</p></header>
            <div class="wardrobe-color-mosaic">${data.group.items.map(item => {
                const unlocked = data.cosmetics?.unlocked?.includes(item.id) || data.cosmetics?.color === item.id;
                const selected = previewItemId === item.id;
                return `<button type="button" class="wardrobe-color-chip${selected ? ' is-previewing' : ''}${!unlocked ? ' is-locked' : ''}" data-wardrobe-item="${escapeHtml(item.id)}" aria-pressed="${selected}" style="--item-color:${safeColor(item.preview)}">
                    <span class="wardrobe-color-sample"><i></i><b>${unlocked ? '✓' : '×'}</b></span><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(unlocked ? (data.cosmetics?.color === item.id ? 'CURRENT FINISH' : 'READY TO WEAR') : item.how)}</small>
                </button>`;
            }).join('')}</div>${actionBar(data)}`;
    }

    function renderTrails(data) {
        const meta = categoryMeta.trails;
        return `<header class="wardrobe-category-heading wardrobe-trail-heading"><h2>${meta.heading}</h2><p>${meta.copy}</p></header>
            <div class="wardrobe-trail-surface"><span class="wardrobe-trail-surface-label">WALK CYCLE / ACTIVE</span><span class="wardrobe-trail-surface-coordinate">FIELD TEST 01</span><div class="wardrobe-trail-route" aria-hidden="true"><i></i><i></i><i></i><b></b></div><span class="wardrobe-trail-surface-foot">THE PREVIEW FIGURE IS ALWAYS IN MOTION</span></div>
            <div class="wardrobe-trail-choices" aria-label="Trail effects">${data.group.items.map(item => itemCard(item, data, 'trail')).join('')}</div>${actionBar(data)}`;
    }

    function renderHats(data) {
        const meta = categoryMeta.hats;
        return `<header class="wardrobe-category-heading wardrobe-hat-heading"><h2>${meta.heading}</h2><p>${meta.copy}</p></header>
            <div class="wardrobe-rack-header"><span>RECOVERED HEADWEAR</span><i aria-hidden="true"></i><span>${data.group.items.length} FILES</span></div>
            <div class="wardrobe-headwear-rack">${data.group.items.map(item => itemCard(item, data, 'hat')).join('')}</div>${actionBar(data)}`;
    }

    function renderMasks(data) {
        const meta = categoryMeta.masks;
        return `<header class="wardrobe-category-heading wardrobe-mask-heading"><h2>${meta.heading}</h2><p>${meta.copy}</p></header>
            <div class="wardrobe-contact-sheet"><div class="wardrobe-contact-sheet-stamp"><span>CONTACT SHEET</span><strong>FACES / ${String(data.group.items.length).padStart(2, '0')}</strong></div>
                <div class="wardrobe-mask-files">${data.group.items.map(item => itemCard(item, data, 'mask')).join('')}</div></div>${actionBar(data)}`;
    }

    function renderSkins(data) {
        const meta = categoryMeta.skins;
        return `<header class="wardrobe-category-heading wardrobe-skin-heading"><h2>${meta.heading}</h2><p>${meta.copy}</p></header>
            <div class="wardrobe-skin-register"><span>APPEARANCE REGISTER</span><span>01 — ${String(data.group.items.length).padStart(2, '0')}</span></div>
            <div class="wardrobe-skin-gallery">${data.group.items.map(item => itemCard(item, data, 'skin')).join('')}</div>${actionBar(data)}`;
    }

    function renderThemes(data) {
        const theme = document.getElementById('menuThemeLobby');
        const active = theme?.getAttribute('aria-pressed') !== 'false';
        return `<header class="wardrobe-category-heading wardrobe-theme-heading"><h2>Menu Themes</h2><p>Theme unlocks live here. Menu Styles is where you choose how an owned theme frames the main menu.</p></header>
            <article class="wardrobe-theme-feature">
                <div class="wardrobe-theme-art" role="img" aria-label="The Lobby wallpaper preview"><span>LEVEL 0</span><b>THE<br>LOBBY</b></div>
                <div class="wardrobe-theme-feature-copy"><span class="wardrobe-theme-state"><i aria-hidden="true"></i> ${active ? 'CURRENT MENU THEME' : 'OWNED THEME'}</span><h3>The Lobby</h3><p>Yellowed wallpaper, soft fluorescent light, and a quiet sense that the halls continue farther than they should.</p><div class="wardrobe-theme-feature-meta"><span>LEVEL 0</span><span>OWNED</span></div></div>
            </article>
            <div class="wardrobe-theme-link-row"><div><span>STYLE YOUR ARRIVAL</span><p>Move the main menu, tune its motion, and preview The Lobby in context.</p></div><button type="button" id="wardrobeMenuStyleLink" class="wardrobe-theme-link">OPEN MENU STYLES <span aria-hidden="true">↗</span></button></div>`;
    }

    function setTabState(category) {
        document.querySelectorAll('#wardrobeTabs [data-wardrobe-tab]').forEach(button => {
            const selected = button.dataset.wardrobeTab === category;
            button.classList.toggle('is-active', selected);
            button.setAttribute('aria-selected', String(selected));
            button.tabIndex = selected ? 0 : -1;
        });
        const selectedTab = document.querySelector(`#wardrobeTabs [data-wardrobe-tab="${category}"]`);
        if (selectedTab && content) content.setAttribute('aria-labelledby', selectedTab.id);
        if (screen) screen.dataset.wardrobeCategory = category;
    }

    function render(data, preserveScroll = false) {
        if (!screen || !content || !data || !validCategories.includes(data.category)) return;
        const scrollContainer = content.parentElement;
        const scrollTop = preserveScroll ? scrollContainer?.scrollTop || 0 : 0;
        latestData = data;
        if (activeCategory !== data.category) {
            activeCategory = data.category;
            selectInitialPreview(data);
        }
        setTabState(data.category);

        if (data.category === 'menuThemes') {
            content.innerHTML = renderThemes(data);
        } else if (data.group) {
            if (data.category === 'colors') content.innerHTML = renderColors(data);
            if (data.category === 'trails') content.innerHTML = renderTrails(data);
            if (data.category === 'hats') content.innerHTML = renderHats(data);
            if (data.category === 'masks') content.innerHTML = renderMasks(data);
            if (data.category === 'skins') content.innerHTML = renderSkins(data);
        }
        if (scrollContainer && preserveScroll) scrollContainer.scrollTop = scrollTop;
        updatePreviewText(data);
        paintPreview(0);
        if (!reducedMotion.matches) startAnimation();
    }

    function updatePreviewText(data) {
        const item = currentPreviewItem(data);
        const preview = equippedPreview(data);
        const isEquipped = item && data.cosmetics?.[data.group?.type] === item.id;
        const unlocked = item && (data.cosmetics?.unlocked?.includes(item.id) || isEquipped);
        if (title) title.textContent = item?.label || 'CURRENT OUTFIT';
        if (detail) detail.textContent = item?.desc || 'Your current equipped look.';
        if (status) status.textContent = !item || isEquipped ? 'EQUIPPED LOOK' : unlocked ? 'TRY-ON PREVIEW' : 'LOCKED SAMPLE';
        const trailItem = data.catalog?.trails?.items?.find(entry => entry.id === preview.trail);
        if (trailReadout) trailReadout.textContent = preview.trail === 'none' ? 'TRAIL · NONE' : `TRAIL · ${trailItem?.label || preview.trail.toUpperCase()}${preview.trail !== data.cosmetics?.trail ? ' · SAMPLE' : ''}`;
        if (canvas) {
            canvas.dataset.trail = preview.trail;
            canvas.style.setProperty('--preview-trail-color', safeColor(data.catalog?.trails?.items?.find(entry => entry.id === preview.trail)?.preview, '#b8bf7e'));
        }
    }

    function samplePosition(time) {
        return {
            x: 160 + Math.sin(time * 0.00078) * 55,
            y: 162 + Math.sin(time * 0.00105 + 0.9) * 34
        };
    }

    function drawTrail(points, trail, color, now, colorForAvatar) {
        if (trail === 'none' || points.length < 2) return;
        const hex = safeColor(color);
        const rgb = hex.length === 4
            ? hex.slice(1).split('').map(part => parseInt(part + part, 16))
            : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
        const rgba = alpha => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
        context.save();
        context.lineCap = trail === 'static' ? 'butt' : 'round';
        context.lineJoin = 'round';
        context.shadowColor = rgba(.72);
        context.shadowBlur = trail === 'ghost' ? 20 : 12;
        context.strokeStyle = rgba(trail === 'static' ? .54 : .6);
        context.lineWidth = trail === 'ghost' ? 14 : trail === 'ember' ? 5 : 7;
        if (trail === 'static') {
            context.setLineDash([10, 9]);
            context.lineDashOffset = -(now * .025);
        }
        context.beginPath();
        points.forEach((point, index) => {
            context.globalAlpha = .12 + index / points.length * .72;
            if (index) context.lineTo(point.x, point.y);
            else context.moveTo(point.x, point.y);
        });
        context.stroke();
        context.setLineDash([]);
        context.globalAlpha = 1;

        if (trail === 'circle') {
            points.forEach((point, index) => {
                if (index % 3 !== 0) return;
                context.globalAlpha = .2 + index / points.length * .55;
                context.strokeStyle = rgba(.92);
                context.lineWidth = 1.5;
                context.beginPath();
                context.arc(point.x, point.y, 4 + index % 4, 0, Math.PI * 2);
                context.stroke();
            });
        } else if (trail === 'spark' || trail === 'ember') {
            points.forEach((point, index) => {
                if (index % (trail === 'spark' ? 2 : 4) !== 0) return;
                context.globalAlpha = .16 + index / points.length * .62;
                context.fillStyle = trail === 'ember' ? '#ffbe77' : '#fff0a6';
                context.shadowBlur = 9;
                context.beginPath();
                context.arc(point.x + Math.sin(now * .006 + index) * 3, point.y - index % 5, trail === 'ember' ? 2.2 : 1.6, 0, Math.PI * 2);
                context.fill();
            });
        } else if (trail === 'afterimage') {
            points.filter((_, index) => index % 5 === 0).forEach((point, index) => {
                context.globalAlpha = .12 + index * .035;
                context.fillStyle = colorForAvatar;
                context.beginPath();
                context.arc(point.x, point.y, 15, 0, Math.PI * 2);
                context.fill();
            });
        }
        context.restore();
    }

    function drawSurvivor(point, outfit) {
        const radius = 19;
        const colorItem = latestData?.catalog?.colors?.items?.find(item => item.id === outfit.color);
        const fill = safeColor(colorItem?.preview || paletteColors[outfit.color], '#45b9d9');
        const skinItem = latestData?.catalog?.skins?.items?.find(item => item.id === outfit.skin);
        const skin = outfit.skin !== 'default' ? getImage(skinItem?.image) : null;
        if (skin?.complete && skin.naturalWidth) {
            context.drawImage(skin, point.x - radius * 2, point.y - radius * 2.15, radius * 4, radius * 4);
        } else {
            context.save();
            context.shadowColor = 'rgba(0,0,0,.55)';
            context.shadowBlur = 10;
            context.fillStyle = fill;
            context.beginPath();
            context.arc(point.x, point.y, radius + 2, 0, Math.PI * 2);
            context.fill();
            context.restore();
        }
        const maskItem = latestData?.catalog?.masks?.items?.find(item => item.id === outfit.mask);
        const hatItem = latestData?.catalog?.hats?.items?.find(item => item.id === outfit.hat);
        const mask = outfit.mask !== 'none' ? getImage(maskItem?.image) : null;
        const hat = outfit.hat !== 'none' ? getImage(hatItem?.image) : null;
        [mask, hat].forEach(image => {
            if (image?.complete && image.naturalWidth) context.drawImage(image, point.x - radius * 2, point.y - radius * 2.15, radius * 4, radius * 4);
        });
    }

    function paintPreview(time) {
        if (!context || !canvas || !latestData) return;
        const now = time || performance.now();
        const width = canvas.width;
        const height = canvas.height;
        const outfit = equippedPreview(latestData);
        const trailItem = latestData.catalog?.trails?.items?.find(item => item.id === outfit.trail);
        const trailColor = trailItem?.preview || paletteColors[outfit.trail] || '#b8bf7e';
        const current = samplePosition(now);
        context.clearRect(0, 0, width, height);

        const background = context.createLinearGradient(0, 0, width, height);
        background.addColorStop(0, '#202417');
        background.addColorStop(.52, '#15190f');
        background.addColorStop(1, '#10140e');
        context.fillStyle = background;
        context.fillRect(0, 0, width, height);

        context.save();
        context.strokeStyle = 'rgba(218,224,153,.075)';
        context.lineWidth = 1;
        for (let line = 0; line <= width; line += 32) {
            context.beginPath(); context.moveTo(line, 0); context.lineTo(line, height); context.stroke();
            context.beginPath(); context.moveTo(0, line); context.lineTo(width, line); context.stroke();
        }
        context.restore();

        const points = [];
        for (let offset = -980; offset <= 0; offset += 42) points.push(samplePosition(now + offset));
        drawTrail(points, outfit.trail, trailColor, now, safeColor(latestData.catalog?.colors?.items?.find(item => item.id === outfit.color)?.preview || paletteColors[outfit.color]));
        drawSurvivor(current, outfit);
        context.fillStyle = 'rgba(230,232,190,.5)';
        context.font = '8px Courier New, monospace';
        context.fillText('N', 12, 20);
        context.fillText('SAMPLE ROUTE', 12, height - 13);
        context.textAlign = 'right';
        context.fillText('LEVEL 0', width - 12, height - 13);
        context.textAlign = 'left';
    }

    function startAnimation() {
        if (animationFrame || reducedMotion.matches) return;
        const step = time => {
            animationFrame = 0;
            if (!screen || screen.style.display === 'none' || document.hidden) return;
            paintPreview(time);
            animationFrame = window.requestAnimationFrame(step);
        };
        animationFrame = window.requestAnimationFrame(step);
    }

    function changeItem(itemId) {
        if (!latestData?.group?.items.some(item => item.id === itemId)) return;
        previewItemId = itemId;
        render(latestData, true);
    }

    document.getElementById('wardrobeTabs')?.addEventListener('click', event => {
        const tab = event.target instanceof Element ? event.target.closest('[data-wardrobe-tab]') : null;
        if (tab) window.setCosmeticTab?.(tab.dataset.wardrobeTab);
    });
    document.getElementById('wardrobeTabs')?.addEventListener('keydown', event => {
        if (!(event.target instanceof Element) || !event.target.matches('[data-wardrobe-tab]')) return;
        const buttons = [...document.querySelectorAll('#wardrobeTabs [data-wardrobe-tab]')];
        const currentIndex = buttons.indexOf(event.target);
        const move = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (!move) return;
        event.preventDefault();
        const next = buttons[(currentIndex + move + buttons.length) % buttons.length];
        next.focus();
        window.setCosmeticTab?.(next.dataset.wardrobeTab);
    });
    content?.addEventListener('click', event => {
        const target = event.target instanceof Element ? event.target : null;
        const item = target?.closest('[data-wardrobe-item]');
        if (item) {
            changeItem(item.dataset.wardrobeItem);
            return;
        }
        if (target?.closest('[data-wardrobe-equip]') && latestData?.group) {
            const selected = currentPreviewItem(latestData);
            if (selected) window.selectCosmetic?.(latestData.group.type, selected.id);
        }
    });
    document.getElementById('wardrobeBack')?.addEventListener('click', () => window.showMenu?.('mainMenu'));
    document.getElementById('lobbyWardrobeButton')?.addEventListener('click', () => window.showMenu?.('cosmeticsMenu'));
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && animationFrame) {
            window.cancelAnimationFrame(animationFrame);
            animationFrame = 0;
        } else if (!document.hidden && screen?.style.display !== 'none' && !reducedMotion.matches) startAnimation();
    });
    reducedMotion.addEventListener?.('change', () => {
        if (reducedMotion.matches && animationFrame) {
            window.cancelAnimationFrame(animationFrame);
            animationFrame = 0;
            paintPreview(0);
        } else if (!reducedMotion.matches && screen?.style.display !== 'none') startAnimation();
    });

    window.renderWardrobeScreen = render;
})();

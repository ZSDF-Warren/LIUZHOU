/**
 * 应用入口模块
 * 初始化所有功能、绑定事件
 */

// ===== 初始化 Markers =====
initMarkers();
fitAllBounds();

// ===== 渲染顶部筛选 Chips =====
(function renderChips() {
    const chipsEl = document.getElementById('filterChips');
    const catCounts = { all: ATTRACTIONS.length };
    ATTRACTIONS.forEach(a => {
        catCounts[a.cat] = (catCounts[a.cat] || 0) + 1;
    });

    const order = ['all', 'xhshot', 'luosifen', 'food', 'foodstreet', 'culture', 'landmark', 'nature', 'night', 'ethnic'];
    chipsEl.innerHTML = order.filter(cat => catCounts[cat]).map(cat => {
        const conf = CATEGORY_CONFIG[cat];
        return `<div class="chip ${conf.chipClass} ${cat === 'all' ? 'active' : ''}" data-filter="${cat}">${conf.label} ${catCounts[cat]}</div>`;
    }).join('');
})();

// ===== 渲染右侧按钮 =====
(function renderSideButtons() {
    const container = document.getElementById('sideButtons');
    const buttons = [
        { id: 'btnWeather', cls: 'side-btn-weather', emoji: '🌧️', label: '天气车票' },
        { id: 'btnDress',   cls: 'side-btn-dress',   emoji: '👗', label: '穿衣建议' },
        { id: 'btnPack',    cls: 'side-btn-pack',    emoji: '🎒', label: '出行准备' },
        { id: 'btnGuide',   cls: 'side-btn-guide',   emoji: '📖', label: '攻略参考' },
        { id: 'btnFitAll',  cls: 'side-btn-fit',     emoji: '📌', label: '全部景点' }
    ];
    container.innerHTML = buttons.map(b => `
        <button class="side-btn ${b.cls}" id="${b.id}">
            <div class="btn-icon">${b.emoji}</div>
            <span class="btn-label">${b.label}</span>
        </button>
    `).join('');
})();

// ===== 底部景点卡片 =====
const scrollEl = document.getElementById('attractionsScroll');

function renderCards(list) {
    scrollEl.innerHTML = '';
    list.forEach(a => {
        const tags = a.tags.map(t => `<span class="tag ${t.c}">${t.t}</span>`).join('');
        const card = document.createElement('div');
        card.className = 'attr-card';
        card.dataset.id = a.id;
        card.innerHTML = `
            <div class="card-top">
                <div class="card-num" style="background:${a.color}">${a.id}</div>
                <div class="card-name">${a.name}</div>
            </div>
            <div class="card-loc">${a.loc}</div>
            <div class="card-tags">${tags}</div>
            <div class="card-desc">${a.desc}</div>
            <div class="card-tip">${a.tips}</div>
        `;
        card.addEventListener('click', () => selectAttraction(a.id));
        scrollEl.appendChild(card);
    });
}

renderCards(ATTRACTIONS);

// ===== 景点选择 =====
let activeId = null;

function selectAttraction(id) {
    const prev = activeId;
    activeId = id;
    const a = ATTRACTIONS.find(x => x.id === id);

    document.querySelectorAll('.attr-card').forEach(c => {
        c.classList.toggle('active', +c.dataset.id === id);
        if (+c.dataset.id === id) {
            c.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    });

    if (prev && markers[prev]) {
        const p = markers[prev].data;
        markers[prev].marker.setIcon(createIcon(p.color, p.id));
    }
    if (markers[id]) {
        markers[id].marker.setIcon(createActiveIcon(a.color, a.id));
        const gcjTarget = toGCJ02(a.lat, a.lng);
        map.flyTo(gcjTarget, a.lat > 25 ? 11 : 14, { duration: 0.8 });
        markers[id].marker.openPopup();
    }

    showDetail(a);
}

// ===== 详情抽屉 =====
const detailOverlay = document.getElementById('detailOverlay');
const detailDrawer = document.getElementById('detailDrawer');
const detailBody = document.getElementById('detailBody');

function showDetail(a) {
    const tags = a.tags.map(t => `<span class="tag ${t.c}">${t.t}</span>`).join('');
    detailBody.innerHTML = `
        <div class="detail-header">
            <div class="detail-num" style="background:${a.color}">${a.id}</div>
            <div class="detail-title">${a.name}</div>
        </div>
        <div class="detail-loc">${a.loc}</div>
        <div class="detail-tags">${tags}</div>
        <div class="detail-desc">${a.desc}</div>
        <div class="detail-tip-box">
            <div class="detail-tip-label">小红书攻略</div>
            <div class="detail-tip-text">${a.tips}</div>
        </div>
    `;
    detailOverlay.classList.add('show');
    detailDrawer.classList.add('show');
}

function hideDetail() {
    detailOverlay.classList.remove('show');
    detailDrawer.classList.remove('show');
}

detailOverlay.addEventListener('click', hideDetail);
document.getElementById('detailHandle').addEventListener('click', hideDetail);

// ===== 筛选逻辑 =====
document.getElementById('filterChips').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const filter = chip.dataset.filter;

    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    markerLayer.clearLayers();
    const filtered = filter === 'all' ? ATTRACTIONS : ATTRACTIONS.filter(a => a.cat === filter);

    filtered.forEach(a => {
        const icon = createIcon(a.color, a.id);
        const gcjPos = toGCJ02(a.lat, a.lng);
        const marker = L.marker(gcjPos, { icon }).addTo(markerLayer);
        marker.bindPopup(`<div class="popup-title">${a.name}</div><div class="popup-loc">${a.loc}</div>`, { maxWidth: 220, closeButton: false });
        marker.on('click', () => selectAttraction(a.id));
        markers[a.id] = { marker, data: a };
    });

    renderCards(filtered);

    if (filtered.length > 0) {
        const bounds = L.latLngBounds(filtered.map(a => toGCJ02(a.lat, a.lng)));
        map.fitBounds(bounds, { padding: [60, 40, 160, 40] });
    }
});

// ===== 信息面板 =====
const infoOverlay = document.getElementById('infoOverlay');
const infoDrawer = document.getElementById('infoDrawer');
const infoBody = document.getElementById('infoBody');

function showInfo(type) {
    let html = '';
    if (type === 'weather') html = getWeatherHTML();
    else if (type === 'dress') html = getDressHTML();
    else if (type === 'pack') html = getPackHTML();
    else if (type === 'guide') html = getGuideHTML();
    infoBody.innerHTML = html;
    infoOverlay.classList.add('show');
    infoDrawer.classList.add('show');
}

function hideInfo() {
    infoOverlay.classList.remove('show');
    infoDrawer.classList.remove('show');
}

infoOverlay.addEventListener('click', hideInfo);
document.getElementById('infoHandle').addEventListener('click', hideInfo);

// ===== 右侧按钮事件 =====
document.getElementById('btnWeather').addEventListener('click', () => showInfo('weather'));
document.getElementById('btnDress').addEventListener('click', () => showInfo('dress'));
document.getElementById('btnPack').addEventListener('click', () => showInfo('pack'));
document.getElementById('btnGuide').addEventListener('click', () => showInfo('guide'));
document.getElementById('btnFitAll').addEventListener('click', () => fitAllBounds());

// ===== 左侧行程按钮 =====
document.getElementById('btnRoute').addEventListener('click', toggleRoute);
document.getElementById('routeOverlay').addEventListener('click', closeRoute);
document.getElementById('routeClose').addEventListener('click', closeRoute);

// ===== 底部面板拖拽 =====
const panel = document.getElementById('bottomPanel');
let panelHidden = false;

document.getElementById('panelHandle').addEventListener('click', () => {
    panelHidden = !panelHidden;
    panel.classList.toggle('hidden', panelHidden);
});

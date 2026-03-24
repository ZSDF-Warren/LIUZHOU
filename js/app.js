/**
 * 应用入口模块
 * 初始化所有功能、绑定事件、更新日志
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
        { id: 'btnFitAll',  cls: 'side-btn-fit',     emoji: '📌', label: '全部景点' },
        { id: 'btnChangelog', cls: 'side-btn-changelog', emoji: '📋', label: '更新日志' }
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
    list.forEach((a, idx) => {
        const tags = a.tags.map(t => `<span class="tag ${t.c}">${t.t}</span>`).join('');
        const catConf = CATEGORY_ICONS[a.cat] || CATEGORY_ICONS.landmark;
        const card = document.createElement('div');
        card.className = 'attr-card';
        card.dataset.id = a.id;
        card.style.animationDelay = `${idx * 0.05}s`;
        card.innerHTML = `
            <div class="card-top">
                <div class="card-num" style="background:${a.color}">${catConf.icon}</div>
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
        markers[prev].marker.setIcon(createIcon(p.color, p.id, p.cat, 0));
    }
    if (markers[id]) {
        markers[id].marker.setIcon(createActiveIcon(a.color, a.id, a.cat));
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
    const catConf = CATEGORY_ICONS[a.cat] || CATEGORY_ICONS.landmark;
    detailBody.innerHTML = `
        <div class="detail-header">
            <div class="detail-num" style="background:${a.color}">${catConf.icon}</div>
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

    filtered.forEach((a, idx) => {
        const icon = createIcon(a.color, a.id, a.cat, idx);
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

// ===== 更新日志 =====
const CHANGELOG_DATA = [
    {
        date: '2026-03-24',
        items: [
            { badge: 'feature', text: '全面UI动画优化：Marker弹跳入场、卡片渐入、面板丝滑滑入滑出' },
            { badge: 'feature', text: '为9个分类使用不同自定义SVG图钉：地标🏛️ 自然🌿 人文📚 夜景🌙 民族🎭 美食🍽️ 螺蛳粉🍜 美食街🏮 热门🔥' },
            { badge: 'new', text: '新增「更新日志」按钮，可查看项目历史变更记录' },
            { badge: 'improve', text: '按钮/芯片/卡片交互动效全面升级，hover & active反馈更丝滑' },
            { badge: 'improve', text: '面板弹出使用弹簧曲线动画 + 毛玻璃背景遮罩' },
            { badge: 'improve', text: '时间轴项目逐条淡入动画，增加视觉层次感' }
        ]
    },
    {
        date: '2026-03-24',
        subtitle: '早期更新',
        items: [
            { badge: 'feature', text: '项目模块化重构：拆分为多文件结构（data / js / styles）' },
            { badge: 'new', text: '新增行程路线面板：3天行程时间轴 + 地图路线绘制' },
            { badge: 'new', text: '新增55个景点/美食/螺蛳粉店标记点' },
            { badge: 'new', text: '新增小红书攻略参考面板和高德2025状元榜数据' },
            { badge: 'new', text: '新增天气预报、穿衣建议、出行准备清单面板' },
            { badge: 'feature', text: '支持分类筛选：9个分类 + 底部卡片横滑 + 详情抽屉' }
        ]
    },
    {
        date: '2026-03-23',
        items: [
            { badge: 'new', text: '项目创建：柳州旅行景点地图 v1.0' },
            { badge: 'feature', text: '使用 Leaflet + 高德瓦片构建交互式地图' },
            { badge: 'feature', text: '初始景点数据采集和页面布局设计' }
        ]
    }
];

function getChangelogHTML() {
    const badgeMap = {
        'new':     '<span class="changelog-badge changelog-badge-new">NEW</span>',
        'fix':     '<span class="changelog-badge changelog-badge-fix">FIX</span>',
        'improve': '<span class="changelog-badge changelog-badge-improve">优化</span>',
        'feature': '<span class="changelog-badge changelog-badge-feature">功能</span>'
    };

    return CHANGELOG_DATA.map((entry, idx) => `
        <div class="changelog-entry" style="animation-delay:${idx * 0.1}s">
            <div class="changelog-date">📅 ${entry.date}${entry.subtitle ? ' · ' + entry.subtitle : ''}</div>
            <ul class="changelog-items">
                ${entry.items.map(item => `<li>${badgeMap[item.badge] || ''}${item.text}</li>`).join('')}
            </ul>
        </div>
    `).join('');
}

function showChangelog() {
    const body = document.getElementById('changelogBody');
    body.innerHTML = getChangelogHTML();
    document.getElementById('changelogOverlay').classList.add('show');
    document.getElementById('changelogPanel').classList.add('show');
}

function hideChangelog() {
    document.getElementById('changelogOverlay').classList.remove('show');
    document.getElementById('changelogPanel').classList.remove('show');
}

document.getElementById('btnChangelog').addEventListener('click', showChangelog);
document.getElementById('changelogOverlay').addEventListener('click', hideChangelog);
document.getElementById('changelogClose').addEventListener('click', hideChangelog);

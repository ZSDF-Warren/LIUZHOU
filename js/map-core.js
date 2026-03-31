/**
 * 地图核心模块
 * 初始化地图、管理 markers、坐标转换
 * 使用自定义SVG图钉，不同分类有不同图标
 */

// 坐标直接使用（原始数据已是 GCJ-02）
function toGCJ02(lat, lng) {
    return [lat, lng];
}

// ===== 分类图标配置 =====
const CATEGORY_ICONS = {
    landmark:    { icon: '🏛️', pinColor: '#E53935', label: '地标' },
    nature:      { icon: '🌿', pinColor: '#FB8C00', label: '自然' },
    culture:     { icon: '📚', pinColor: '#43A047', label: '人文' },
    night:       { icon: '🌙', pinColor: '#1E88E5', label: '夜景' },
    ethnic:      { icon: '🎭', pinColor: '#8E24AA', label: '民族' },
    food:        { icon: '🍽️', pinColor: '#00897B', label: '美食' },
    luosifen:    { icon: '🍜', pinColor: '#D84315', label: '螺蛳粉' },
    foodstreet:  { icon: '🏮', pinColor: '#FF6F00', label: '美食街' },
    xhshot:      { icon: '🔥', pinColor: '#FF1744', label: '热门' }
};

// ===== SVG 图钉生成器 =====
function createPinSVG(color) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
        <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${color};stop-opacity:1"/>
                <stop offset="100%" style="stop-color:${adjustColor(color, -30)};stop-opacity:1"/>
            </linearGradient>
            <filter id="s">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
            </filter>
        </defs>
        <path d="M18 0C8.06 0 0 7.06 0 16c0 11 18 28 18 28s18-17 18-28C36 7.06 27.94 0 18 0z" fill="url(#g)" filter="url(#s)"/>
        <circle cx="18" cy="15" r="10" fill="rgba(255,255,255,0.25)"/>
    </svg>`;
}

function adjustColor(hex, amount) {
    hex = hex.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0,2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2,2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4,2), 16) + amount));
    return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
}

// ===== Marker 图标工厂 =====
function createIcon(color, label, cat) {
    const catConf = CATEGORY_ICONS[cat] || CATEGORY_ICONS.landmark;
    const pinSvg = encodeURIComponent(createPinSVG(catConf.pinColor));

    return L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin">
            <img class="marker-pin-bg" src="data:image/svg+xml,${pinSvg}" alt="">
            <span class="marker-pin-icon">${catConf.icon}</span>
        </div>`,
        iconSize: [36, 44],
        iconAnchor: [18, 44],
        popupAnchor: [0, -44]
    });
}

function createActiveIcon(color, label, cat) {
    const catConf = CATEGORY_ICONS[cat] || CATEGORY_ICONS.landmark;
    const pinSvg = encodeURIComponent(createPinSVG(catConf.pinColor));

    return L.divIcon({
        className: 'custom-marker marker-active',
        html: `<div class="marker-pin" style="transform:scale(1.25);">
            <img class="marker-pin-bg" src="data:image/svg+xml,${pinSvg}" alt="">
            <span class="marker-pin-icon" style="font-size:18px;">${catConf.icon}</span>
        </div>`,
        iconSize: [45, 55],
        iconAnchor: [22, 55],
        popupAnchor: [0, -55]
    });
}

function createRouteStepIcon(index, color) {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:28px;height:28px;background:${color};border:2.5px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:white;font-family:sans-serif;">${index}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -18]
    });
}

// ===== 地图初始化 =====
const centerGCJ = toGCJ02(24.33, 109.42);
const map = L.map('map', {
    center: centerGCJ,
    zoom: 12,
    zoomControl: true,
    attributionControl: true
});

// 高德瓦片（GCJ-02 坐标系）
L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    subdomains: ['1','2','3','4'],
    maxZoom: 18,
    attribution: '&copy; 高德地图'
}).addTo(map);

// ===== Marker 管理 =====
const markers = {};
const markerLayer = L.layerGroup().addTo(map);
const routeLayer = L.layerGroup(); // 路线图层（不默认添加）

function initMarkers() {
    ATTRACTIONS.forEach((a, idx) => {
        const icon = createIcon(a.color, a.id, a.cat);
        const gcjPos = toGCJ02(a.lat, a.lng);
        const marker = L.marker(gcjPos, { icon }).addTo(markerLayer);
        marker.bindPopup(`<div class="popup-title">${a.name}</div><div class="popup-loc">${a.loc}</div>`, { maxWidth: 220, closeButton: false });
        marker.on('click', () => selectAttraction(a.id));
        markers[a.id] = { marker, data: a };
    });
}

function getAllBounds() {
    return L.latLngBounds(ATTRACTIONS.map(a => toGCJ02(a.lat, a.lng)));
}

function fitAllBounds() {
    map.fitBounds(getAllBounds(), { padding: [60, 40, 160, 40] });
}

// ===== 路线绘制 =====
function drawRoute(dayData) {
    routeLayer.clearLayers();

    const points = [];
    dayData.items.forEach((item, idx) => {
        if (item.attractionId) {
            const a = ATTRACTIONS.find(x => x.id === item.attractionId);
            if (a) {
                const pos = toGCJ02(a.lat, a.lng);
                points.push(pos);
                // 路线步骤标记
                const typeConf = ITINERARY_TYPE_CONFIG[item.type] || ITINERARY_TYPE_CONFIG.scenic;
                const stepMarker = L.marker(pos, { 
                    icon: createRouteStepIcon(idx + 1, typeConf.color),
                    zIndexOffset: 1000
                }).addTo(routeLayer);
                stepMarker.bindPopup(`
                    <div class="popup-title">${item.icon} ${item.title}</div>
                    <div class="popup-loc">${item.time} · ${item.duration || ''}</div>
                `, { maxWidth: 240, closeButton: false });
            }
        }
    });

    // 绘制连线
    if (points.length >= 2) {
        const polyline = L.polyline(points, {
            color: dayData.color,
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 8',
            smoothFactor: 1.5
        }).addTo(routeLayer);
    }

    // 添加到地图并缩放
    routeLayer.addTo(map);
    if (points.length > 0) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [80, 60, 180, 60] });
    }
}

function clearRoute() {
    routeLayer.clearLayers();
    if (map.hasLayer(routeLayer)) {
        map.removeLayer(routeLayer);
    }
}

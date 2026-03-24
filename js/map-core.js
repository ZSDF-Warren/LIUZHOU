/**
 * 地图核心模块
 * 初始化地图、管理 markers、坐标转换
 */

// 坐标直接使用（原始数据已是 GCJ-02）
function toGCJ02(lat, lng) {
    return [lat, lng];
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

// ===== Marker 图标工厂 =====
function createIcon(color, label) {
    return L.divIcon({
        className: '',
        html: `<div style="width:32px;height:32px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:white;font-family:sans-serif;">${label}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -20]
    });
}

function createActiveIcon(color, label) {
    return L.divIcon({
        className: '',
        html: `<div style="width:42px;height:42px;background:${color};border:4px solid #FFD54F;border-radius:50%;box-shadow:0 0 0 4px rgba(255,213,79,0.3),0 4px 12px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:white;font-family:sans-serif;transition:all 0.2s;">${label}</div>`,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
        popupAnchor: [0, -24]
    });
}

function createRouteStepIcon(index, color) {
    return L.divIcon({
        className: '',
        html: `<div style="width:26px;height:26px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:white;font-family:sans-serif;">${index}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -16]
    });
}

// ===== Marker 管理 =====
const markers = {};
const markerLayer = L.layerGroup().addTo(map);
const routeLayer = L.layerGroup(); // 路线图层（不默认添加）

function initMarkers() {
    ATTRACTIONS.forEach(a => {
        const icon = createIcon(a.color, a.id);
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

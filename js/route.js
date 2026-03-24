/**
 * 行程路线模块
 * 管理左侧路线面板的交互、时间轴渲染、地图路线绘制
 */

let routeOpen = false;
let currentDay = 1;

function openRoute() {
    routeOpen = true;
    document.getElementById('routeOverlay').classList.add('show');
    document.getElementById('routePanel').classList.add('show');
    document.getElementById('btnRoute').classList.add('active');
    renderRouteTabs();
    renderRouteDay(currentDay);
}

function closeRoute() {
    routeOpen = false;
    document.getElementById('routeOverlay').classList.remove('show');
    document.getElementById('routePanel').classList.remove('show');
    document.getElementById('btnRoute').classList.remove('active');
    clearRoute();
}

function toggleRoute() {
    if (routeOpen) {
        closeRoute();
    } else {
        openRoute();
    }
}

function renderRouteTabs() {
    const tabsEl = document.getElementById('routeTabs');
    tabsEl.innerHTML = ITINERARY.map(d => `
        <div class="route-tab ${d.day === currentDay ? 'active' : ''}" data-day="${d.day}">
            Day${d.day}<br><span style="font-size:10px;font-weight:400;">${d.date.split('（')[0]}</span>
        </div>
    `).join('');

    tabsEl.addEventListener('click', (e) => {
        const tab = e.target.closest('.route-tab');
        if (!tab) return;
        currentDay = parseInt(tab.dataset.day);
        renderRouteTabs();
        renderRouteDay(currentDay);
    });
}

function renderRouteDay(day) {
    const dayData = ITINERARY.find(d => d.day === day);
    if (!dayData) return;

    const bodyEl = document.getElementById('routeBody');
    
    const itemsHTML = dayData.items.map((item, idx) => {
        const typeConf = ITINERARY_TYPE_CONFIG[item.type] || ITINERARY_TYPE_CONFIG.scenic;
        return `
            <div class="timeline-item" data-attraction-id="${item.attractionId || ''}" data-idx="${idx}">
                <div class="timeline-dot timeline-dot-${item.type}">
                    <span style="font-size:10px;">${item.icon}</span>
                </div>
                <div class="timeline-card timeline-card-${item.type}">
                    <div class="timeline-time">${item.time}</div>
                    <div class="timeline-title">
                        <span class="timeline-title-icon">${item.icon}</span>
                        ${item.title}
                    </div>
                    <div class="timeline-desc">${item.desc}</div>
                    ${item.duration ? `<div class="timeline-duration">⏱ 预计 ${item.duration}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');

    bodyEl.innerHTML = `
        <div class="route-day-theme">${dayData.theme}</div>
        <div class="timeline">${itemsHTML}</div>
    `;

    // 点击时间轴项跳转到对应景点
    bodyEl.querySelectorAll('.timeline-item').forEach(el => {
        el.addEventListener('click', () => {
            const aid = parseInt(el.dataset.attractionId);
            if (aid && markers[aid]) {
                selectAttraction(aid);
            }
        });
    });

    // 绘制地图路线
    drawRoute(dayData);
}

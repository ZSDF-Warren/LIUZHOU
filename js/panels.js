/**
 * 信息面板模块
 * 天气/车票/攻略/穿衣/行李的 HTML 生成函数
 */

function getWeatherHTML() {
    return `
        <div class="info-section-title">车票信息</div>
        <div class="train-card">
            <div class="train-header">
                <span class="train-number">G3882</span>
                <span class="train-badge train-badge-ok">去程已购</span>
            </div>
            <div class="train-route">
                <div class="train-station">
                    <div class="train-time">07:25</div>
                    <div class="train-city">广州南</div>
                </div>
                <div class="train-mid">
                    <div class="train-dur">4小时0分</div>
                    <div class="train-line"></div>
                    <div class="train-stop">经停</div>
                </div>
                <div class="train-station">
                    <div class="train-time">11:25</div>
                    <div class="train-city">柳州</div>
                </div>
            </div>
        </div>
        <div style="margin-top:8px;">
            <div class="train-card" style="opacity:0.7;">
                <div class="train-header">
                    <span class="train-number">回程</span>
                    <span class="train-badge train-badge-pending">待定</span>
                </div>
                <div style="text-align:center;color:#999;font-size:13px;padding:8px 0;">回程车票尚未购买</div>
            </div>
        </div>

        <div class="info-section-title">清明天气预报（4月4-6日）</div>
        <div class="weather-card">
            <div class="weather-warn">
                <div class="weather-warn-icon">&#9748;</div>
                <div class="weather-warn-text">降雨概率 90%+，属中雨级别<br>桂北局部可能大到暴雨</div>
            </div>
            <div class="weather-days">
                <div class="weather-day highlight">
                    <div class="wd-date">4月4日</div>
                    <div class="wd-icon">&#9748;</div>
                    <div class="wd-desc">大雨</div>
                    <div class="wd-temp">18~23&#8451;</div>
                </div>
                <div class="weather-day highlight">
                    <div class="wd-date">4月5日</div>
                    <div class="wd-icon">&#9748;</div>
                    <div class="wd-desc" style="color:#E53935;font-weight:700;">中雨</div>
                    <div class="wd-temp">18~25&#8451;</div>
                </div>
                <div class="weather-day">
                    <div class="wd-date">4月6日</div>
                    <div class="wd-icon">&#9926;</div>
                    <div class="wd-desc">阵雨转多云</div>
                    <div class="wd-temp">19~26&#8451;</div>
                </div>
            </div>
            <div class="weather-tips">
                <div style="font-size:13px;font-weight:700;color:#2c2c2c;margin-bottom:8px;">出行建议</div>
                <div class="weather-tip-item"><div class="weather-tip-dot"></div><div>必带雨具、防水鞋、保暖外套（体感偏凉）</div></div>
                <div class="weather-tip-item"><div class="weather-tip-dot"></div><div>山区注意防滑，避开陡坡和易发山洪区域</div></div>
                <div class="weather-tip-item"><div class="weather-tip-dot"></div><div>降雨可能影响交通，预留额外1~2小时机动时间</div></div>
                <div class="weather-tip-item"><div class="weather-tip-dot"></div><div>4月2日后关注短期精确预报获取更精准信息</div></div>
            </div>
        </div>
    `;
}

function getDressHTML() {
    return `
        <div class="info-section-title">👗 清明柳州穿衣建议</div>
        <div class="weather-card">
            <div class="weather-warn" style="background:linear-gradient(135deg,#E8EAF6,#C5CAE9);">
                <div class="weather-warn-icon">🌧️</div>
                <div class="weather-warn-text" style="color:#283593;">气温 18~25°C｜降雨概率 90%+<br>体感湿润偏凉，昼夜温差明显</div>
            </div>
            <div style="margin-top:14px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                    <span style="font-size:22px;">☀️</span>
                    <div>
                        <div style="font-size:14px;font-weight:700;color:#2c2c2c;">白天（22~25°C）</div>
                        <div style="font-size:11px;color:#999;">体感温暖，但多云或小雨时偏凉</div>
                    </div>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
                    <span style="padding:6px 12px;background:#E3F2FD;border-radius:20px;font-size:12px;font-weight:600;color:#1565C0;">短袖T恤 / 薄衬衫</span>
                    <span style="padding:6px 12px;background:#E8F5E9;border-radius:20px;font-size:12px;font-weight:600;color:#2E7D32;">棉麻长裤 / 牛仔裤</span>
                    <span style="padding:6px 12px;background:#FFF3E0;border-radius:20px;font-size:12px;font-weight:600;color:#E65100;">轻薄裙装（非爬山日）</span>
                </div>
            </div>
            <div style="margin-top:4px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                    <span style="font-size:22px;">🌙</span>
                    <div>
                        <div style="font-size:14px;font-weight:700;color:#2c2c2c;">早晚 / 雨天（18~20°C）</div>
                        <div style="font-size:11px;color:#999;">下雨时体感明显偏凉，需加外套</div>
                    </div>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
                    <span style="padding:6px 12px;background:#F3E5F5;border-radius:20px;font-size:12px;font-weight:600;color:#6A1B9A;">薄风衣 / 冲锋衣（防雨）</span>
                    <span style="padding:6px 12px;background:#E0F2F1;border-radius:20px;font-size:12px;font-weight:600;color:#00695C;">连帽卫衣 / 薄夹克</span>
                    <span style="padding:6px 12px;background:#FFF8E1;border-radius:20px;font-size:12px;font-weight:600;color:#F57F17;">长袖打底衫</span>
                </div>
            </div>
        </div>
        <div class="info-section-title">🎯 穿搭核心原则</div>
        <div class="weather-card">
            <div style="display:grid;gap:12px;">
                <div style="display:flex;align-items:flex-start;gap:10px;"><span style="font-size:20px;flex-shrink:0;">🧅</span><div><div style="font-size:13px;font-weight:700;color:#2c2c2c;">洋葱式穿搭</div><div style="font-size:12px;color:#666;line-height:1.6;">内层吸汗T恤 + 中层薄卫衣 + 外层防雨外套</div></div></div>
                <div style="display:flex;align-items:flex-start;gap:10px;"><span style="font-size:20px;flex-shrink:0;">🌂</span><div><div style="font-size:13px;font-weight:700;color:#2c2c2c;">雨天出行标配</div><div style="font-size:12px;color:#666;line-height:1.6;">折叠伞必带！爬山建议轻便雨衣</div></div></div>
                <div style="display:flex;align-items:flex-start;gap:10px;"><span style="font-size:20px;flex-shrink:0;">🎒</span><div><div style="font-size:13px;font-weight:700;color:#2c2c2c;">嗦粉友好穿搭</div><div style="font-size:12px;color:#666;line-height:1.6;">吃螺蛳粉穿深色衣服！汤汁溅到浅色衣服很难洗</div></div></div>
                <div style="display:flex;align-items:flex-start;gap:10px;"><span style="font-size:20px;flex-shrink:0;">📸</span><div><div style="font-size:13px;font-weight:700;color:#2c2c2c;">拍照出片穿搭</div><div style="font-size:12px;color:#666;line-height:1.6;">窑埠古镇可租苗服。西来古寺红墙配素色衣服好看</div></div></div>
            </div>
        </div>
    `;
}

function getPackHTML() {
    return `
        <div class="info-section-title">🧳 柳州出行准备清单</div>
        <div class="weather-card" style="background:linear-gradient(135deg,#E8F5E9,#C8E6C9);border-left:3px solid #4CAF50;">
            <div style="font-size:13px;font-weight:700;color:#2E7D32;margin-bottom:4px;">📋 根据柳州特点定制</div>
            <div style="font-size:12px;color:#388E3C;line-height:1.6;">以下清单根据天气（雨季）、美食（螺蛳粉辣&酸）、景点（爬山+溶洞）定制。</div>
        </div>
        <div class="info-section-title" style="font-size:15px;">🌧️ 雨季防护</div>
        <div class="weather-card" style="border-left:3px solid #1565C0;">
            <div style="display:grid;gap:10px;">
                <div style="display:flex;align-items:center;gap:10px;"><span style="width:32px;height:32px;background:#E3F2FD;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">☂️</span><div><div style="font-size:13px;font-weight:700;">折叠雨伞（必带！）</div><div style="font-size:11px;color:#999;">降雨概率90%+</div></div></div>
                <div style="display:flex;align-items:center;gap:10px;"><span style="width:32px;height:32px;background:#E3F2FD;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">🧥</span><div><div style="font-size:13px;font-weight:700;">轻便雨衣</div><div style="font-size:11px;color:#999;">爬山用，双手解放更安全</div></div></div>
                <div style="display:flex;align-items:center;gap:10px;"><span style="width:32px;height:32px;background:#E3F2FD;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">👟</span><div><div style="font-size:13px;font-weight:700;">防水/防滑鞋</div><div style="font-size:11px;color:#999;">雨天湿滑，别穿小白鞋</div></div></div>
            </div>
        </div>
        <div class="info-section-title" style="font-size:15px;">🍜 嗦粉装备</div>
        <div class="weather-card" style="border-left:3px solid #D84315;">
            <div style="display:grid;gap:10px;">
                <div style="display:flex;align-items:center;gap:10px;"><span style="width:32px;height:32px;background:#FFCCBC;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">👕</span><div><div style="font-size:13px;font-weight:700;">深色衣服多带几件</div><div style="font-size:11px;color:#999;">嗦粉汤汁四溅，浅色一顿报废</div></div></div>
                <div style="display:flex;align-items:center;gap:10px;"><span style="width:32px;height:32px;background:#FFCCBC;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">🤧</span><div><div style="font-size:13px;font-weight:700;">纸巾 / 湿巾（大量！）</div><div style="font-size:11px;color:#999;">吃螺蛳粉鼻涕眼泪一起来</div></div></div>
                <div style="display:flex;align-items:center;gap:10px;"><span style="width:32px;height:32px;background:#FFCCBC;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">💊</span><div><div style="font-size:13px;font-weight:700;">肠胃药（重要！）</div><div style="font-size:11px;color:#999;">蒙脱石散/整肠丸/健胃消食片</div></div></div>
                <div style="display:flex;align-items:center;gap:10px;"><span style="width:32px;height:32px;background:#FFCCBC;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">🍬</span><div><div style="font-size:13px;font-weight:700;">口香糖 / 漱口水</div><div style="font-size:11px;color:#999;">螺蛳粉+臭豆腐后的口气救星</div></div></div>
            </div>
        </div>
        <div class="info-section-title" style="font-size:15px;">✅ 速查清单</div>
        <div class="weather-card">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;color:#555;">
                <div>☑️ 身份证</div><div>☑️ 充电宝</div>
                <div>☑️ 折叠雨伞</div><div>☑️ 轻便雨衣</div>
                <div>☑️ 防水鞋</div><div>☑️ 深色衣服×3+</div>
                <div>☑️ 薄外套</div><div>☑️ 纸巾+湿巾</div>
                <div>☑️ 肠胃药</div><div>☑️ 驱蚊水</div>
                <div>☑️ 防晒霜</div><div>☑️ 口香糖</div>
                <div>☑️ 保温杯</div><div>☑️ 现金200元</div>
            </div>
        </div>
    `;
}

function getGuideHTML() {
    return `
        <div class="info-section-title">小红书攻略参考</div>
        <div class="xhs-card">
            <div class="xhs-header"><div class="xhs-avatar">渔</div><div><div class="xhs-author">渔泛泛</div><div class="xhs-date">02-05 发布</div></div></div>
            <div class="xhs-title">柳州2天1晚特种兵攻略!! 周末游浓缩版</div>
            <div class="xhs-body">
                <p><b>【行程安排】</b></p>
                <p>Day 1：龙潭公园 → 马鞍山公园 → 五星步行街 → 音乐喷泉 → 茶麸洗头</p>
                <p>Day 2：青云民生市场 → 西来古寺 → 窑埠古镇</p>
                <p><b>【打卡景点】</b></p>
                <ul>
                    <li><b>龙潭公园</b>：免费，北门进，打卡镜山→风雨桥→歪脖子树</li>
                    <li><b>窑埠古镇</b>：龙城阁19:30后亮灯！可租苗服拍写真</li>
                    <li><b>马鞍山公园</b>：免费，城区全景+日落！</li>
                    <li><b>青云民生市场</b>：网红早市，10点前到</li>
                </ul>
                <p><b>【美食推荐】</b></p>
                <p>卢姐炒冰 | 新月螺蛳粉 | 聚宝螺蛳粉 | 大华干捞粉</p>
            </div>
            <div class="xhs-tags">#柳州旅游 #柳州美食 #龙潭公园 #柳州螺蛳粉</div>
        </div>
        <div class="xhs-card">
            <div class="xhs-header"><div class="xhs-avatar" style="background:#9C27B0;">湘</div><div><div class="xhs-author">王湘</div><div class="xhs-date">10-23 发布</div></div></div>
            <div class="xhs-title">三天三晚柳州保姆级路线规划</div>
            <div class="xhs-body">
                <p><b>【Day 1】</b>五星步行街 → 音乐喷泉 → 风情港夜市</p>
                <p><b>【Day 2】</b>青云市场 → 西来古寺 → 柳州博物馆 → 柳侯公园</p>
                <p><b>【Day 3】</b>马鞍山公园 → 工业博物馆 → 文庙 → 窑埠古镇</p>
                <p>美食：新实惠牛杂火锅(配沙茶酱！)、娇姐螺蛳粉(最辣！)、天山牛杂</p>
            </div>
            <div class="xhs-tags">#柳州旅游 #柳州美食 #柳州攻略 #保姆级攻略</div>
        </div>
    `;
}

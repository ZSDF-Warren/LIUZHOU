/**
 * 信息面板数据（天气/车票/攻略/穿衣/行李）
 * 将原来硬编码在 HTML 函数中的内容抽取为数据驱动
 */

/**
 * 分类配置
 */
const CATEGORY_CONFIG = {
    all:         { label: "全部",        chipClass: "chip-all",        color: "rgba(255,255,255,0.9)", textColor: "#333" },
    xhshot:      { label: "🔥小红书热门", chipClass: "chip-xhshot",    color: "rgba(255,23,68,0.85)",  textColor: "white" },
    luosifen:    { label: "螺蛳粉",      chipClass: "chip-luosifen",   color: "rgba(216,67,21,0.85)",  textColor: "white" },
    food:        { label: "美食",        chipClass: "chip-food",       color: "rgba(0,137,123,0.85)",  textColor: "white" },
    foodstreet:  { label: "美食街",      chipClass: "chip-foodstreet", color: "rgba(255,111,0,0.85)",  textColor: "white" },
    culture:     { label: "人文",        chipClass: "chip-culture",    color: "rgba(67,160,71,0.85)",  textColor: "white" },
    landmark:    { label: "地标",        chipClass: "chip-landmark",   color: "rgba(229,57,53,0.85)",  textColor: "white" },
    nature:      { label: "自然",        chipClass: "chip-nature",     color: "rgba(251,140,0,0.85)",  textColor: "white" },
    night:       { label: "夜景",        chipClass: "chip-night",      color: "rgba(30,136,229,0.85)", textColor: "white" },
    ethnic:      { label: "民族",        chipClass: "chip-ethnic",     color: "rgba(142,36,170,0.85)", textColor: "white" }
};

/**
 * 侧边栏按钮配置
 */
const SIDE_BUTTONS = [
    { id: "btnRoute",   type: "route",   label: "行程路线", iconClass: "side-btn-route",   iconEmoji: "🗺️" },
    { id: "btnWeather", type: "weather", label: "天气车票", iconClass: "side-btn-weather", iconEmoji: "🌧️" },
    { id: "btnDress",   type: "dress",   label: "穿衣建议", iconClass: "side-btn-dress",   iconEmoji: "👗" },
    { id: "btnPack",    type: "pack",    label: "出行准备", iconClass: "side-btn-pack",    iconEmoji: "🎒" },
    { id: "btnGuide",   type: "guide",   label: "攻略参考", iconClass: "side-btn-guide",   iconEmoji: "📖" },
    { id: "btnFitAll",  type: "fitAll",  label: "全部景点", iconClass: "side-btn-fit",     iconEmoji: "📌" }
];

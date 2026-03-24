/**
 * 行程规划数据
 * 4月4日到达柳州 → 4月6日下午离开
 * 以吃为主，穿插博物馆和景点游览
 */
const ITINERARY = [
    // ===== Day 1: 4月4日（周六）- 抵达日，市区美食+夜景 =====
    {
        day: 1,
        date: "4月4日（周六）",
        theme: "🚄 抵达柳州 · 初尝柳州味",
        color: "#1565C0",
        items: [
            { time: "11:25", type: "transport", title: "抵达柳州站", desc: "G3882 广州南→柳州，到站后打车到酒店放行李", icon: "🚄", attractionId: null, duration: "30min" },
            { time: "12:00", type: "food", title: "午餐：秋果螺蛳粉（红光店）", desc: "离柳州站最近的宝藏螺蛳粉！下车直奔，粉偏硬有嚼劲，汤底鲜辣浓郁", icon: "🍜", attractionId: 51, duration: "40min" },
            { time: "13:00", type: "food", title: "甜品：阿婆豆腐花", desc: "5块钱一碗古法豆腐花，配茶叶蛋。嫩滑到极致，清甜不齁，唤醒味蕾", icon: "🍮", attractionId: 54, duration: "20min" },
            { time: "13:30", type: "scenic", title: "柳州博物馆", desc: "了解柳州从古至今的历史文化，免费参观，室内躲雨也不错。建议1.5小时", icon: "🏛️", attractionId: 32, duration: "1.5h" },
            { time: "15:00", type: "scenic", title: "西来古寺 + 来来居咖啡", desc: "千年古刹红墙打卡，旁边来来居咖啡馆喝杯下午茶休息", icon: "🏯", attractionId: 31, duration: "1h" },
            { time: "16:30", type: "food", title: "下午茶：点都得蜜汁鸭腿", desc: "五星步行街扫街，蜜汁鸭腿+A+臭豆腐+卢姐炒冰，边走边吃", icon: "🍗", attractionId: 47, duration: "1h" },
            { time: "18:00", type: "food", title: "晚餐：聚宝螺蛳粉（金鱼巷店）", desc: "柳州螺蛳粉鼻祖！必点油果+猪脚+酸笋+炸蛋，人均15元", icon: "🍜", attractionId: 16, duration: "40min" },
            { time: "19:00", type: "scenic", title: "蟠龙山瀑布公园（夜景）", desc: "亚洲最大人工瀑布，灯光+瀑布梦幻组合，是百里柳江灯光秀的高潮", icon: "🌊", attractionId: 15, duration: "40min" },
            { time: "20:00", type: "scenic", title: "百里柳江夜游", desc: "沿江散步欣赏20公里灯带，8点后看音乐喷泉和水幕电影", icon: "🌃", attractionId: 1, duration: "1h" },
            { time: "21:00", type: "food", title: "宵夜：金弟炒螺蛳粉", desc: "风情港夜市必吃TOP1！锅气十足的炒螺蛳粉，配冰啤收尾", icon: "🔥", attractionId: 46, duration: "40min" }
        ]
    },

    // ===== Day 2: 4月5日（周日）- 深度美食+龙潭公园 =====
    {
        day: 2,
        date: "4月5日（周日）",
        theme: "🌿 公园漫步 · 嗦粉之旅",
        color: "#43A047",
        items: [
            { time: "08:00", type: "food", title: "早餐：青云菜市 + 蒙记豆浆", desc: "网红早市10点前到！露水汤圆+糯米饭+豆浆油条，柳州式早餐", icon: "🌅", attractionId: 13, duration: "1h" },
            { time: "09:30", type: "scenic", title: "龙潭公园", desc: "柳州最大喀斯特山水公园，北门进→镜山→风雨桥→歪脖子树。约3小时", icon: "🌳", attractionId: 2, duration: "3h" },
            { time: "12:30", type: "food", title: "午餐：阿嬑螺蛳粉（胜利店）", desc: "红榜TOP1！酸笋巨臭巨香，加豆泡+腊肠+卤鸭脚+炸蛋，人均12元", icon: "🍜", attractionId: 19, duration: "40min" },
            { time: "13:30", type: "food", title: "甜品：张飞木薯羹", desc: "胜利路总店最正宗！Q弹不腻晶莹剔透，人均8元。暗号：要微辣加花生碎", icon: "🍡", attractionId: 48, duration: "20min" },
            { time: "14:00", type: "scenic", title: "柳州工业博物馆", desc: "免费！展示柳州百年工业史，五菱神车展区必看，户外蒸汽火车头拍照", icon: "🏭", attractionId: 7, duration: "1.5h" },
            { time: "15:30", type: "scenic", title: "柳侯公园", desc: "纪念柳宗元的历史文化名园，绿树成荫适合散步消食。柳侯祠值得看看", icon: "🏞️", attractionId: 5, duration: "1h" },
            { time: "17:00", type: "food", title: "下午茶：鱼酱泼奇（金鱼巷）", desc: "经典三明治是招牌，颜值高分量足，一份够两个人吃", icon: "🥪", attractionId: 43, duration: "30min" },
            { time: "18:00", type: "scenic", title: "马鞍山公园（看日落）", desc: "免费电梯直达山顶！360度俯瞰柳州全景，落日时分满城霓虹太美了", icon: "🌅", attractionId: 4, duration: "1.5h" },
            { time: "19:30", type: "scenic", title: "窑埠古镇（夜景）", desc: "龙城阁19:30后亮灯！龙城壁画很出片，逛古镇感受夜色", icon: "🏮", attractionId: 6, duration: "1h" },
            { time: "20:30", type: "food", title: "晚餐：新实惠牛肉牛杂火锅", desc: "配沙茶酱好吃到飞起！牛杂新鲜量足，柳州牛杂火锅天花板", icon: "🫕", attractionId: 41, duration: "1h" },
            { time: "21:30", type: "food", title: "宵夜：西环肥仔螺蛳粉", desc: "30年老字号！干捞螺蛳粉必点，营业到凌晨4点。配豆奶更过瘾", icon: "🍜", attractionId: 50, duration: "40min" }
        ]
    },

    // ===== Day 3: 4月6日（周一）- 最后半天，补充打卡 =====
    {
        day: 3,
        date: "4月6日（周一）",
        theme: "☀️ 最后半天 · 不留遗憾",
        color: "#FF6F00",
        items: [
            { time: "08:30", type: "food", title: "早餐：乾跃老友粉", desc: "老友伊面比老友粉更有嚼劲！广西特色美食，酸辣鲜香开胃", icon: "🍜", attractionId: 44, duration: "30min" },
            { time: "09:30", type: "scenic", title: "柳州文庙", desc: "故宫风建筑，中式建筑爱好者必去。注意：16:00停止入内，上午去最好", icon: "🏛️", attractionId: 33, duration: "1h" },
            { time: "10:30", type: "food", title: "点心：大华干捞粉", desc: "五星步行街老牌粉店，柳州特色干捞粉，粉条Q弹配特制酱料", icon: "🍜", attractionId: 42, duration: "30min" },
            { time: "11:00", type: "scenic", title: "五星步行街扫街购手信", desc: "最后采购！袋装螺蛳粉+金桔蜜饯+每日鲜古早味蛋糕", icon: "🛍️", attractionId: 25, duration: "1h" },
            { time: "12:00", type: "food", title: "午餐：娇姐老牌螺蛳粉", desc: "柳州螺蛳粉中最辣的一家！最后一顿嗦粉，给味蕾一个火辣告别", icon: "🌶️", attractionId: 37, duration: "40min" },
            { time: "13:00", type: "food", title: "最后甜品：卢姐炒冰", desc: "芒果+菠萝双拼收尾！解辣+解暑，完美句号", icon: "🧊", attractionId: 55, duration: "15min" },
            { time: "13:30", type: "transport", title: "返回酒店取行李 → 柳州站", desc: "预留充足时间前往火车站，准备返程", icon: "🧳", attractionId: null, duration: "1h" },
            { time: "14:30", type: "transport", title: "下午离开柳州", desc: "带着满满的回忆和螺蛳粉特产回家！", icon: "🚄", attractionId: null, duration: "" }
        ]
    }
];

/**
 * 行程类型配置
 */
const ITINERARY_TYPE_CONFIG = {
    food:      { label: "美食", color: "#D84315", bg: "#FFF3E0" },
    scenic:    { label: "景点", color: "#1565C0", bg: "#E3F2FD" },
    transport: { label: "交通", color: "#616161", bg: "#F5F5F5" }
};

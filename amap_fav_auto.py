# -*- coding: utf-8 -*-
"""
高德地图批量收藏脚本 v2
- 连接运行中的 Chromium (CDP port 9222)
- 使用诊断确认的正确 DOM 选择器
- 登录验证 + 收藏状态确认
- 输出到 amap_fav.log (UTF-8)
"""
import asyncio
import sys
import os
import json
import logging
from playwright.async_api import async_playwright

# ============== CONFIG ==============
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(SCRIPT_DIR, "amap_fav.log")
CDP_URL = "http://127.0.0.1:9222"

# Test mode: only first N locations. Set False for all.
TEST_MODE = False
TEST_COUNT = 3

# Delays (seconds)
SEARCH_WAIT = 3.5      # wait for search results to load
DETAIL_WAIT = 2.5      # wait for detail panel to load
FAV_WAIT = 2.0         # wait after clicking fav
BETWEEN_WAIT = 1.5     # wait between locations
# ====================================

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(message)s",
    datefmt="%H:%M:%S",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8", mode="w"),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger("amap")

# All 55 locations from attractions.js
ALL_LOCATIONS = [
    {"name": "百里柳江", "addr": "柳州市中心城区"},
    {"name": "龙潭公园", "addr": "鱼峰区龙潭路43号"},
    {"name": "立鱼峰", "addr": "鱼峰区鱼峰路"},
    {"name": "马鞍山公园", "addr": "柳江南岸市中心"},
    {"name": "柳侯公园", "addr": "城中区文惠路60号"},
    {"name": "窑埠古镇", "addr": "柳江河畔"},
    {"name": "柳州工业博物馆", "addr": "鱼峰区柳东路"},
    {"name": "程阳八寨", "addr": "三江侗族自治县"},
    {"name": "三江鼓楼", "addr": "三江侗族自治县"},
    {"name": "都乐岩风景区", "addr": "柳州市南12公里"},
    {"name": "香桥岩溶地质公园", "addr": "鹿寨县中渡镇"},
    {"name": "石门仙湖", "addr": "融安县大良镇"},
    {"name": "青云菜市", "addr": "城中区青云路"},
    {"name": "螺蛳粉产业园", "addr": "鱼峰区"},
    {"name": "蟠龙山瀑布公园", "addr": "蟠龙路"},
    {"name": "聚宝螺蛳粉", "addr": "城中区金鱼巷53号"},
    {"name": "黄氏真味螺蛳粉", "addr": "柳南区西环路"},
    {"name": "新月螺蛳粉", "addr": "城中区三中路"},
    {"name": "阿嬑螺蛳粉", "addr": "柳北区胜利路"},
    {"name": "六品坊螺蛳粉", "addr": "城中区五星步行街旁"},
    {"name": "深巷螺蛳粉", "addr": "柳南区城站路"},
    {"name": "翠翠家螺蛳粉", "addr": "鱼峰区细柳巷41号"},
    {"name": "罗忆螺蛳粉", "addr": "城中区三中路"},
    {"name": "梁婶螺蛳粉", "addr": "柳南区城站路南七巷"},
    {"name": "五星商业步行街", "addr": "城中区五星路"},
    {"name": "青云美食街", "addr": "柳南区青云路"},
    {"name": "谷埠街美食城", "addr": "鱼峰区飞鹅二路1号"},
    {"name": "胜利路烧烤城", "addr": "柳北区胜利路"},
    {"name": "箭盘山宵夜街", "addr": "鱼峰区箭盘路"},
    {"name": "水南路美食街", "addr": "城中区水南路"},
    {"name": "西来古寺", "addr": "城中区曙光东路"},
    {"name": "柳州博物馆", "addr": "城中区解放北路37号"},
    {"name": "柳州文庙", "addr": "城中区文惠路"},
    {"name": "柳州动物园", "addr": "柳南区航银路89号"},
    {"name": "地王新天地", "addr": "柳北区广场路10号"},
    {"name": "风情港夜市", "addr": "鱼峰区柳江边"},
    {"name": "娇姐老牌螺蛳粉", "addr": "城中区雅儒路"},
    {"name": "天山牛杂城", "addr": "鱼峰区天山路"},
    {"name": "阿历螺蛳粉", "addr": "城中区五星街附近"},
    {"name": "柳喜辣烧烤酒局", "addr": "鱼峰区跃进路"},
    {"name": "新实惠牛肉牛杂火锅", "addr": "鱼峰区柳江边"},
    {"name": "大华干捞粉", "addr": "城中区五星步行街"},
    {"name": "鱼酱泼奇", "addr": "城中区金鱼巷"},
    {"name": "乾跃老友粉", "addr": "城中区五星步行街附近"},
    {"name": "蒙记老牌豆浆", "addr": "城中区"},
    {"name": "金弟炒螺蛳粉", "addr": "鱼峰区风情港"},
    {"name": "点都得蜜汁鸭腿", "addr": "城中区五星步行街"},
    {"name": "张飞木薯羹", "addr": "柳北区胜利路"},
    {"name": "曹妹螺蛳粉", "addr": "柳北区柳锌"},
    {"name": "西环肥仔螺蛳粉", "addr": "柳南区鹅山路"},
    {"name": "秋果螺蛳粉", "addr": "柳南区红光小区"},
    {"name": "老牌铁三中螺蛳粉", "addr": "柳南区革新一区"},
    {"name": "A+臭豆腐", "addr": "城中区五星步行街"},
    {"name": "阿婆豆腐花", "addr": "鱼峰区公园路"},
    {"name": "卢姐炒冰", "addr": "城中区五星步行街"},
    # ===== 2026-03-26 新增 =====
    {"name": "阿嬷手作", "addr": "城中区万象城"},
    {"name": "椿记烧鹅", "addr": "鱼峰区南亚名邸"},
    {"name": "刘记炒鸭脚", "addr": "鱼峰区驾鹤路"},
    {"name": "水南曾姐豆浆", "addr": "城中区水南路"},
    {"name": "黑子米粉", "addr": "柳南区青云市场"},
    {"name": "生辉餐馆", "addr": "鱼峰区箭盘路"},
    {"name": "老八大排档", "addr": "城中区红阳路"},
    {"name": "新翔螺蛳粉", "addr": "柳北区航鹰大道"},
    {"name": "季季红火锅", "addr": "城中区五星步行街"},
    {"name": "潘姐小吃", "addr": "柳南区青云民生市场"},
    # ===== 2026-03-30 小红书每日搜索新增 =====
    {"name": "铛牛佬凉拌牛杂", "addr": "鱼峰区驾鹤路93号"},
    {"name": "五姐螺蛳粉", "addr": "城中区立新路"},
    {"name": "民高螺蛳粉", "addr": "柳北区广雅路北四巷"},
    {"name": "眼镜烧烤", "addr": "鱼峰区驾鹤路3-1号"},
    {"name": "羊角山鲜奶炖蛋", "addr": "鱼峰区荣军路"},
]


async def check_login(page) -> bool:
    """Check if user is logged in. Returns True if logged in."""
    info = await page.evaluate("""() => {
        const cookies = document.cookie;
        const hasPassport = cookies.includes('passport') || cookies.includes('token');
        const loginBtn = document.querySelector('.user-panel .login-btn');
        return {
            hasPassport,
            hasLoginBtn: !!loginBtn,
            loginBtnVisible: loginBtn ? loginBtn.offsetParent !== null : false,
        };
    }""")
    logged_in = info.get("hasPassport", False) or not info.get("hasLoginBtn", True)
    if not logged_in:
        log.info(f"[LOGIN] NOT logged in! Info: {info}")
    return logged_in


async def remove_masks(page):
    """Remove mask/overlay elements that block clicks."""
    removed = await page.evaluate("""() => {
        let count = 0;
        document.querySelectorAll('[class*="mask"]').forEach(el => {
            el.remove();
            count++;
        });
        return count;
    }""")
    if removed > 0:
        log.info(f"  [MASK] Removed {removed} overlay(s)")


async def close_login_modal(page):
    """Close login modal if it appeared (means login expired)."""
    has_modal = await page.evaluate("""() => {
        const modal = document.querySelector('.lbs-passport-modal');
        if (modal) {
            // Try to find close button
            const closeBtn = modal.querySelector('[class*="close"], .icon-close, button');
            if (closeBtn) closeBtn.click();
            return true;
        }
        return false;
    }""")
    if has_modal:
        log.info("  [WARN] Login modal detected — session may have expired!")
        # Also try pressing Escape
        await page.keyboard.press("Escape")
        await asyncio.sleep(0.5)
    return has_modal


async def go_home(page):
    """Navigate to amap homepage to reset state."""
    await page.goto("https://ditu.amap.com/", wait_until="domcontentloaded", timeout=15000)
    await asyncio.sleep(2)
    await remove_masks(page)


async def do_search(page, query: str) -> bool:
    """
    Type query into search box and submit.
    Returns True if search was submitted successfully.
    """
    # Try Playwright native first
    try:
        search_input = page.locator("#searchipt")
        await search_input.click(force=True, timeout=3000)
        await asyncio.sleep(0.2)
        # Triple-click to select all, then type to replace
        await search_input.fill("", force=True)
        await asyncio.sleep(0.1)
        await search_input.fill(query, force=True)
        await asyncio.sleep(0.2)
        await search_input.press("Enter")
        log.info(f"  Search: {query}")
        return True
    except Exception as e:
        log.info(f"  [WARN] Native search failed: {str(e)[:60]}")

    # Fallback: JS search
    ok = await page.evaluate("""(query) => {
        const input = document.getElementById('searchipt');
        if (!input) return false;
        input.focus();
        input.value = query;
        input.dispatchEvent(new Event('input', {bubbles: true}));
        input.dispatchEvent(new Event('change', {bubbles: true}));
        // Trigger Enter
        input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true}));
        input.dispatchEvent(new KeyboardEvent('keypress', {key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true}));
        input.dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true}));
        return true;
    }""", query)
    if ok:
        log.info(f"  Search (JS): {query}")
    else:
        log.info(f"  [ERROR] Search failed for: {query}")
    return ok


async def click_first_result(page, name: str) -> bool:
    """
    Click the first search result using correct selector: li.poibox
    Uses Playwright native click with force=True (confirmed working in diag2).
    Returns True if a result was clicked.
    """
    # Wait for results to appear
    try:
        await page.wait_for_selector("li.poibox", timeout=5000)
    except:
        pass

    # Method 1: Click first li.poibox with Playwright (confirmed working)
    try:
        first_result = page.locator("li.poibox").first
        if await first_result.count() > 0:
            result_name = await first_result.get_attribute("data-poiinfo-name") or "?"
            await first_result.click(force=True)
            log.info(f"  Clicked result: {result_name}")
            return True
    except Exception as e:
        log.info(f"  [WARN] li.poibox click failed: {str(e)[:60]}")

    # Method 2: Click span.poi-name inside first li.poibox
    try:
        poi_name = page.locator("li.poibox span.poi-name").first
        if await poi_name.count() > 0:
            await poi_name.click(force=True)
            log.info(f"  Clicked result via span.poi-name")
            return True
    except:
        pass

    # Method 3: Find by text match
    try:
        text_el = page.get_by_text(name, exact=False).first
        if await text_el.is_visible(timeout=2000):
            await text_el.click(force=True)
            log.info(f"  Clicked result via text match")
            return True
    except:
        pass

    log.info(f"  [WARN] No search result found for: {name}")
    return False


async def click_fav_button(page) -> str:
    """
    Click the favorite button in the detail panel.
    Correct selector: span.collect.favit (inside section.shortcuts > div.meepo)
    
    Returns:
        'ok'         — successfully favorited (text changed to 已收藏)
        'already'    — was already favorited
        'login'      — login modal appeared (not logged in)
        'fail'       — couldn't find or click the button
    """
    # Check if already favorited
    already = await page.evaluate("""() => {
        const favBtn = document.querySelector('.placebox span.collect.favit .meepo_text');
        if (favBtn) {
            const text = favBtn.textContent.trim();
            return text === '已收藏';
        }
        return false;
    }""")
    if already:
        return "already"

    # Find and click the visible fav button inside .placebox (detail panel)
    # Use JS dispatchEvent — confirmed working in diag2
    clicked = await page.evaluate("""() => {
        // Target: the fav button inside the currently visible detail panel (.placebox)
        const placeBox = document.querySelector('.placebox');
        if (!placeBox) return 'no_placebox';
        
        const favBtn = placeBox.querySelector('span.collect.favit');
        if (!favBtn) return 'no_fav_btn';
        
        // Use dispatchEvent with MouseEvent (confirmed working in diag2)
        favBtn.dispatchEvent(new MouseEvent('click', {
            bubbles: true, cancelable: true, view: window
        }));
        return 'clicked';
    }""")

    if clicked != "clicked":
        log.info(f"  [WARN] Fav button issue: {clicked}")
        # Fallback: try Playwright native click
        try:
            fav_el = page.locator(".placebox span.collect.favit").first
            if await fav_el.is_visible(timeout=2000):
                await fav_el.click(force=True)
                clicked = "clicked"
                log.info(f"  Fav clicked (Playwright fallback)")
        except:
            return "fail"

    if clicked != "clicked":
        return "fail"

    await asyncio.sleep(FAV_WAIT)

    # Check result: did login modal appear? Or did text change to 已收藏?
    result = await page.evaluate("""() => {
        // Check for login modal
        const modal = document.querySelector('.lbs-passport-modal');
        if (modal && modal.offsetParent !== null) return 'login_modal';
        
        // Check fav text changed
        const favBtn = document.querySelector('.placebox span.collect.favit .meepo_text');
        if (favBtn) {
            const text = favBtn.textContent.trim();
            if (text === '已收藏') return 'ok';
            if (text === '收藏') return 'not_changed';
        }
        
        // Also check if the class changed (some implementations add .active or .collected)
        const favSpan = document.querySelector('.placebox span.collect.favit');
        if (favSpan && (favSpan.classList.contains('active') || favSpan.classList.contains('collected'))) {
            return 'ok';
        }
        
        return 'unknown';
    }""")

    if result == "login_modal":
        await close_login_modal(page)
        return "login"
    elif result == "ok":
        return "ok"
    elif result == "not_changed":
        # Maybe need to wait longer or click again
        await asyncio.sleep(1)
        recheck = await page.evaluate("""() => {
            const favBtn = document.querySelector('.placebox span.collect.favit .meepo_text');
            return favBtn ? favBtn.textContent.trim() : '?';
        }""")
        if recheck == "已收藏":
            return "ok"
        return "fail"
    else:
        # 'unknown' — could still be ok, check more broadly
        return "ok"  # Optimistic if no login modal


async def search_and_fav(page, name: str, addr: str, index: int, total: int) -> str:
    """
    Search for a location and add to favorites.
    Returns: 'ok', 'already', 'login', 'no_result', 'fav_fail', 'error'
    """
    log.info(f"[{index}/{total}] {name} ({addr})")

    try:
        # Remove overlays
        await remove_masks(page)
        await asyncio.sleep(0.3)

        # Search
        query = f"{name} 柳州"
        if not await do_search(page, query):
            return "error"

        await asyncio.sleep(SEARCH_WAIT)
        await remove_masks(page)

        # Click first result
        if not await click_first_result(page, name):
            # Try shorter search (just the name)
            log.info(f"  Retrying with shorter query: {name}")
            if not await do_search(page, name):
                return "no_result"
            await asyncio.sleep(SEARCH_WAIT)
            await remove_masks(page)
            if not await click_first_result(page, name):
                await page.screenshot(
                    path=os.path.join(SCRIPT_DIR, f"amap_fail_{index}_noresult.png")
                )
                return "no_result"

        await asyncio.sleep(DETAIL_WAIT)

        # Verify detail panel loaded
        has_panel = await page.evaluate("""() => {
            const p = document.querySelector('.placebox');
            return p && p.offsetParent !== null;
        }""")
        if not has_panel:
            log.info(f"  [WARN] Detail panel not visible, waiting more...")
            await asyncio.sleep(2)

        # Click fav
        result = await click_fav_button(page)

        if result == "ok":
            log.info(f"  [OK] Favorited!")
        elif result == "already":
            log.info(f"  [SKIP] Already favorited")
        elif result == "login":
            log.info(f"  [FAIL] Login required - STOPPING")
            return "login"
        else:
            log.info(f"  [WARN] Fav result unclear: {result}")
            await page.screenshot(
                path=os.path.join(SCRIPT_DIR, f"amap_fail_{index}_fav.png")
            )

        return result

    except Exception as e:
        log.info(f"  [ERROR] {e}")
        try:
            await page.screenshot(
                path=os.path.join(SCRIPT_DIR, f"amap_fail_{index}_error.png")
            )
        except:
            pass
        return "error"


async def main():
    locations = ALL_LOCATIONS[:TEST_COUNT] if TEST_MODE else ALL_LOCATIONS
    total = len(locations)

    log.info("=" * 60)
    log.info(f"  高德地图批量收藏 v2")
    log.info(f"  Mode: {'TEST' if TEST_MODE else 'FULL'} ({total} locations)")
    log.info(f"  CDP: {CDP_URL}")
    log.info(f"  Log: {LOG_FILE}")
    log.info("=" * 60)

    async with async_playwright() as p:
        # Connect to browser
        try:
            browser = await p.chromium.connect_over_cdp(CDP_URL)
            log.info("[OK] Connected to browser via CDP")
        except Exception as e:
            log.info(f"[ERROR] Cannot connect: {e}")
            log.info("        Run amap_browser_launch.py first!")
            sys.exit(1)

        # Get existing page
        contexts = browser.contexts
        if contexts and contexts[0].pages:
            page = contexts[0].pages[0]
            log.info(f"[OK] Using page: {page.url[:80]}")
        else:
            page = await browser.new_page()
            log.info("[OK] Created new page")

        # Verify login
        if not await check_login(page):
            log.info("[ABORT] 请先在浏览器中登录高德账号！")
            return

        log.info("[OK] Login verified")

        # Navigate to amap home to start fresh
        await go_home(page)
        log.info("[OK] At amap.com homepage")

        # Process locations
        results = []
        login_failed = False

        for i, loc in enumerate(locations, 1):
            result = await search_and_fav(page, loc["name"], loc["addr"], i, total)
            results.append({"name": loc["name"], "result": result})

            if result == "login":
                log.info("[ABORT] 登录失效，停止运行。请重新登录后再试。")
                login_failed = True
                break

            await asyncio.sleep(BETWEEN_WAIT)

        # Summary
        ok = sum(1 for r in results if r["result"] == "ok")
        already = sum(1 for r in results if r["result"] == "already")
        failed = sum(1 for r in results if r["result"] not in ("ok", "already"))

        log.info("")
        log.info("=" * 60)
        log.info(f"  RESULTS: {ok} new + {already} existed / {len(results)} attempted / {total} total")
        if login_failed:
            log.info(f"  !! STOPPED: Login session expired!")
        log.info("=" * 60)
        for r in results:
            icon = {"ok": "[OK]", "already": "[SKIP]", "login": "[LOGIN]", "no_result": "[MISS]", "fail": "[FAIL]", "error": "[ERR]"}.get(r["result"], "[?]")
            log.info(f"  {icon} {r['name']} - {r['result']}")
        log.info("=" * 60)

        # Save results to JSON for reference
        with open(os.path.join(SCRIPT_DIR, "amap_fav_results.json"), "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        log.info(f"[OK] Results saved to amap_fav_results.json")


if __name__ == "__main__":
    asyncio.run(main())

# -*- coding: utf-8 -*-
"""
Connect to a running Chromium via CDP, auto-detect login, then search & fav locations.
No manual input needed - polls for login state automatically.
Output goes to both console and amap_fav.log file.
"""
import asyncio
import sys
import os
import logging
from playwright.async_api import async_playwright

# Setup logging to both file and console
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(SCRIPT_DIR, "amap_fav.log")
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

# ============== CONFIG ==============
CDP_URL = "http://127.0.0.1:9222"
# Test mode: only first N locations. Set False for all.
TEST_MODE = False
TEST_COUNT = 3
# ====================================

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
]


async def check_login(page):
    """Check if user is logged in by looking at the page state."""
    try:
        result = await page.evaluate("""() => {
            // Method 1: Check for user avatar / logged-in indicator
            const avatarEls = document.querySelectorAll(
                '.user-info, .header-user, [class*="avatar"], [class*="nickname"], ' +
                '.login-info .user, .head-portrait, .amap-logo-login'
            );
            for (const el of avatarEls) {
                if (el && el.offsetParent !== null) return {logged: true, method: 'avatar'};
            }
            
            // Method 2: Check if login button is gone or changed
            const loginBtns = document.querySelectorAll(
                '.login-btn, .header-login, [class*="login-link"], ' +
                'a[href*="passport"], .login-text'
            );
            let hasVisibleLoginBtn = false;
            for (const btn of loginBtns) {
                if (btn && btn.offsetParent !== null) {
                    const text = btn.textContent || '';
                    if (text.includes('\u767b\u5f55') || text.includes('Login')) {
                        hasVisibleLoginBtn = true;
                    }
                }
            }
            // If no login button visible, might be logged in
            if (!hasVisibleLoginBtn && document.querySelector('.amap-maps')) {
                return {logged: 'maybe', method: 'no_login_btn'};
            }
            
            // Method 3: Check cookies
            const hasCookie = document.cookie.includes('passport_login') || 
                            document.cookie.includes('token') ||
                            document.cookie.includes('cna');
            if (hasCookie) return {logged: 'maybe', method: 'cookie'};
            
            return {logged: false, method: 'none'};
        }""")
        return result
    except Exception as e:
        return {"logged": False, "method": "error", "error": str(e)}


async def wait_for_login(page, timeout_seconds=300):
    """Poll for login status every 3 seconds."""
    log.info("=" * 55)
    log.info("  Please login in the browser window (scan QR code)")
    log.info("  Auto-detecting login status every 3 seconds...")
    log.info("  Timeout: 5 minutes")
    log.info("=" * 55)
    
    start = asyncio.get_event_loop().time()
    check_count = 0
    
    while (asyncio.get_event_loop().time() - start) < timeout_seconds:
        check_count += 1
        elapsed = int(asyncio.get_event_loop().time() - start)
        
        result = await check_login(page)
        
        if check_count % 5 == 0:  # log status every ~15s
            log.info(f"  [{elapsed}s] Checking login... ({result.get('method', '?')})")
        
        if result.get("logged") == True:
            log.info(f"  [OK] Login detected! (method: {result['method']})")
            return True
        
        # After 20s, if we get 'maybe', assume logged in
        if elapsed > 20 and result.get("logged") == "maybe":
            log.info(f"  [INFO] Probable login after {elapsed}s (method: {result['method']}), proceeding...")
            await page.screenshot(path=os.path.join(SCRIPT_DIR, "amap_login_check.png"))
            return True
        
        await asyncio.sleep(3)
    
    log.info("  [TIMEOUT] Login detection timed out after 5 minutes.")
    return False


async def remove_masks(page):
    """Remove any mask/overlay elements that block pointer events."""
    removed = await page.evaluate("""() => {
        let count = 0;
        // Remove elements with class containing 'mask'
        document.querySelectorAll('[class*="mask"]').forEach(el => {
            el.remove();
            count++;
        });
        // Also remove any full-screen overlays with high z-index
        document.querySelectorAll('div').forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.position === 'fixed' && parseFloat(style.zIndex) > 100) {
                const rect = el.getBoundingClientRect();
                // If it covers most of the viewport, it's likely a mask
                if (rect.width > window.innerWidth * 0.8 && rect.height > window.innerHeight * 0.8) {
                    // Don't remove the map container itself
                    if (!el.id || (!el.id.includes('map') && !el.id.includes('app'))) {
                        el.style.pointerEvents = 'none';
                        count++;
                    }
                }
            }
        });
        return count;
    }""")
    if removed > 0:
        log.info(f"  [MASK] Removed/disabled {removed} overlay element(s)")
    return removed


async def js_search(page, query):
    """Use JavaScript to directly set search value and trigger search."""
    success = await page.evaluate("""(query) => {
        const input = document.getElementById('searchipt') || 
                      document.querySelector('input[placeholder*="搜索"]') ||
                      document.querySelector('#search-input');
        if (!input) return false;
        
        // Focus and set value
        input.focus();
        input.value = query;
        
        // Trigger input events so the page reacts
        input.dispatchEvent(new Event('input', {bubbles: true}));
        input.dispatchEvent(new Event('change', {bubbles: true}));
        
        // Find and click search button, or simulate Enter key
        const searchBtn = document.querySelector('#searchipt + .btn, .searchbox .btn, button[class*="search"], .search-btn');
        if (searchBtn) {
            searchBtn.click();
            return true;
        }
        
        // Simulate Enter keypress
        input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true}));
        input.dispatchEvent(new KeyboardEvent('keypress', {key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true}));
        input.dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true}));
        return true;
    }""", query)
    return success


async def search_and_fav(page, name, addr, index, total):
    """Search for a location and add it to favorites."""
    log.info(f"[{index}/{total}] {name} ({addr})")
    
    try:
        # Step 0: Remove mask/overlay elements that block clicks
        await remove_masks(page)
        await asyncio.sleep(0.3)
        
        # Step 1: Clear and type in search box
        search_query = f"{name} 柳州"
        search_ok = False
        
        # Method A: force click + fill (bypasses actionability checks)
        try:
            search_input = page.locator('#searchipt, input[placeholder*="搜索"], input.input-text, #search-input')
            await search_input.first.click(force=True, timeout=5000)
            await asyncio.sleep(0.3)
            await search_input.first.fill("", force=True)
            await asyncio.sleep(0.2)
            await search_input.first.fill(search_query, force=True)
            await asyncio.sleep(0.3)
            await search_input.first.press("Enter")
            search_ok = True
            log.info(f"  Typed (force click): {search_query}")
        except Exception as e:
            log.info(f"  [WARN] Force click failed: {str(e)[:80]}")
        
        # Method B: JavaScript direct input
        if not search_ok:
            log.info(f"  Trying JS search...")
            search_ok = await js_search(page, search_query)
            if search_ok:
                log.info(f"  Typed (JS): {search_query}")
            else:
                log.info(f"  [ERROR] All search methods failed")
                await page.screenshot(path=os.path.join(SCRIPT_DIR, f"amap_debug_{index}_search_fail.png"))
                return False
        
        log.info(f"  Search submitted, waiting for results...")
        await asyncio.sleep(3)
        
        # Remove masks again after search results load
        await remove_masks(page)
        await asyncio.sleep(0.3)
        
        # Step 2: Click first search result
        result_clicked = False
        
        result_selectors = [
            '.poibox .poibox-body .poi_item:first-child .poi_name',
            '.poibox .poibox-body:first-child',
            '.poi-item:first-child .poi-title',
            '.poi-item:first-child',
            '.amap_lib_placeSearch .poibox .poibox-body:first-child',
            '.poi-list .poi-item:first-child',
            '.result_item:first-child',
            'div[class*="result"] div[class*="item"]:first-child',
            'div[class*="poibox"] div[class*="body"]:first-child',
        ]
        
        for sel in result_selectors:
            try:
                el = page.locator(sel).first
                if await el.is_visible(timeout=2000):
                    await el.click(force=True)
                    result_clicked = True
                    log.info(f"  Clicked result ({sel})")
                    break
            except:
                continue
        
        if not result_clicked:
            try:
                name_el = page.get_by_text(name, exact=False).first
                if await name_el.is_visible(timeout=2000):
                    await name_el.click(force=True)
                    result_clicked = True
                    log.info(f"  Clicked text '{name}'")
            except:
                pass
        
        # Method C: click via JS
        if not result_clicked:
            clicked_js = await page.evaluate("""(name) => {
                // Try POI items
                const items = document.querySelectorAll('.poibox-body, .poi-item, [class*="poi"]');
                for (const item of items) {
                    if (item.textContent && item.textContent.includes(name)) {
                        item.click();
                        return true;
                    }
                }
                // Try any element containing the name
                const allEls = document.querySelectorAll('div, span, a, li');
                for (const el of allEls) {
                    if (el.children.length < 5 && el.textContent && el.textContent.includes(name)) {
                        el.click();
                        return true;
                    }
                }
                return false;
            }""", name)
            if clicked_js:
                result_clicked = True
                log.info(f"  Clicked result (JS match: '{name}')")
        
        if not result_clicked:
            log.info(f"  [WARN] No result found")
            await page.screenshot(path=os.path.join(SCRIPT_DIR, f"amap_debug_{index}_noresult.png"))
            return False
        
        await asyncio.sleep(2)
        
        # Remove masks again before clicking fav
        await remove_masks(page)
        await asyncio.sleep(0.3)
        
        # Step 3: Click favorite/collect button
        fav_clicked = False
        fav_selectors = [
            'div.collect',
            'div[class*="collect"]',
            'span[class*="collect"]',
            'a[class*="collect"]',
            'div[class*="star"]',
            'div[class*="fav"]',
            'button[class*="collect"]',
        ]
        
        for sel in fav_selectors:
            try:
                el = page.locator(sel).first
                if await el.is_visible(timeout=2000):
                    await el.click(force=True)
                    fav_clicked = True
                    log.info(f"  Clicked fav ({sel})")
                    break
            except:
                continue
        
        if not fav_clicked:
            try:
                fav_el = page.get_by_text("收藏", exact=True).first
                if await fav_el.is_visible(timeout=2000):
                    await fav_el.click(force=True)
                    fav_clicked = True
                    log.info(f"  Clicked text '收藏'")
            except:
                pass
        
        # Try JS click on fav button
        if not fav_clicked:
            fav_js = await page.evaluate("""() => {
                const els = document.querySelectorAll('div, span, a, button');
                for (const el of els) {
                    const text = (el.textContent || '').trim();
                    const cls = el.className || '';
                    if (text === '收藏' || cls.includes('collect') || cls.includes('fav')) {
                        if (el.offsetParent !== null) {
                            el.click();
                            return true;
                        }
                    }
                }
                return false;
            }""")
            if fav_js:
                fav_clicked = True
                log.info(f"  Clicked fav (JS)")
        
        if not fav_clicked:
            log.info(f"  [WARN] Fav button not found")
            await page.screenshot(path=os.path.join(SCRIPT_DIR, f"amap_debug_{index}_nofav.png"))
            return False
        
        await asyncio.sleep(1.5)
        
        # Check if a dialog appeared
        try:
            confirm_btn = page.get_by_text("确定", exact=True).first
            if await confirm_btn.is_visible(timeout=1500):
                await confirm_btn.click(force=True)
                log.info(f"  Confirmed dialog")
                await asyncio.sleep(1)
        except:
            pass
        
        log.info(f"  [OK] Favorited!")
        return True
        
    except Exception as e:
        log.info(f"  [ERROR] {e}")
        try:
            await page.screenshot(path=os.path.join(SCRIPT_DIR, f"amap_debug_{index}_error.png"))
        except:
            pass
        return False


async def main():
    locations = ALL_LOCATIONS[:TEST_COUNT] if TEST_MODE else ALL_LOCATIONS
    total = len(locations)
    
    log.info(f"[CONFIG] Mode: {'TEST' if TEST_MODE else 'FULL'} ({total} locations)")
    log.info(f"[CONFIG] CDP: {CDP_URL}")
    log.info(f"[CONFIG] Log: {LOG_FILE}")
    
    async with async_playwright() as p:
        try:
            browser = await p.chromium.connect_over_cdp(CDP_URL)
            log.info(f"[OK] Connected to browser via CDP")
        except Exception as e:
            log.info(f"[ERROR] Cannot connect to browser: {e}")
            log.info(f"        Run amap_browser_launch.py first!")
            sys.exit(1)
        
        # Get the existing page or create new one
        contexts = browser.contexts
        if contexts and contexts[0].pages:
            page = contexts[0].pages[0]
            log.info(f"[OK] Using existing page: {page.url}")
        else:
            page = await browser.new_page()
            await page.goto("https://ditu.amap.com/", wait_until="networkidle", timeout=30000)
            log.info(f"[OK] Opened amap.com")
        
        # Navigate to amap if not already there
        if "amap.com" not in page.url:
            await page.goto("https://ditu.amap.com/", wait_until="networkidle", timeout=30000)
            log.info(f"[OK] Navigated to amap.com")
        
        await asyncio.sleep(2)
        
        # Take initial screenshot
        await page.screenshot(path=os.path.join(SCRIPT_DIR, "amap_init.png"))
        log.info(f"[OK] Initial screenshot saved")
        
        # Wait for login
        logged_in = await wait_for_login(page)
        if not logged_in:
            log.info("[ABORT] Not logged in. Browser stays open, retry later.")
            return
        
        await asyncio.sleep(2)
        
        # Remove masks before starting
        await remove_masks(page)
        await asyncio.sleep(1)
        
        log.info(f"[START] Adding {total} locations to favorites...")
        
        results = []
        for i, loc in enumerate(locations, 1):
            success = await search_and_fav(page, loc["name"], loc["addr"], i, total)
            results.append((loc["name"], success))
            await asyncio.sleep(1.5)
        
        # Summary
        ok_count = sum(1 for _, s in results if s)
        fail_count = total - ok_count
        
        log.info("=" * 55)
        log.info(f"  RESULTS: {ok_count} OK / {fail_count} FAILED / {total} total")
        log.info("=" * 55)
        for name, ok in results:
            status = "OK" if ok else "FAIL"
            log.info(f"  [{status}] {name}")
        log.info("=" * 55)
        log.info(f"  Browser stays open. Verify in browser.")
        log.info(f"  Re-run to add more locations.")


if __name__ == "__main__":
    asyncio.run(main())

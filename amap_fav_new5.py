# -*- coding: utf-8 -*-
"""Fav only the 5 new locations (2026-03-30)."""
import asyncio, sys, os, json, logging
from playwright.async_api import async_playwright

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(SCRIPT_DIR, "amap_fav_new5.log")
CDP_URL = "http://127.0.0.1:9222"

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s", datefmt="%H:%M:%S",
    handlers=[logging.FileHandler(LOG_FILE, encoding="utf-8", mode="w"), logging.StreamHandler(sys.stdout)])
log = logging.getLogger("amap")

NEW_LOCATIONS = [
    {"name": "铛牛佬凉拌牛杂", "addr": "鱼峰区驾鹤路"},
    {"name": "五姐螺蛳粉", "addr": "城中区立新路"},
    {"name": "民高螺蛳粉", "addr": "柳北区广雅路"},
    {"name": "眼镜烧烤", "addr": "鱼峰区驾鹤路"},
    {"name": "羊角山鲜奶", "addr": "鱼峰区荣军路"},
]

async def remove_masks(page):
    await page.evaluate("""() => { document.querySelectorAll('[class*="mask"]').forEach(el => el.remove()); }""")

async def main():
    total = len(NEW_LOCATIONS)
    log.info(f"=== Fav {total} new locations ===")
    async with async_playwright() as p:
        try:
            browser = await p.chromium.connect_over_cdp(CDP_URL)
            log.info("[OK] Connected")
        except Exception as e:
            log.info(f"[ERROR] Cannot connect: {e}"); return
        ctx = browser.contexts
        page = ctx[0].pages[0] if ctx and ctx[0].pages else await browser.new_page()
        # Check login
        info = await page.evaluate("""() => { return { hasCookie: document.cookie.includes('passport') || document.cookie.includes('token') }; }""")
        if not info.get("hasCookie"):
            log.info("[ABORT] Not logged in!"); return
        log.info("[OK] Logged in")
        await page.goto("https://ditu.amap.com/", wait_until="domcontentloaded", timeout=15000)
        await asyncio.sleep(2)
        results = []
        for i, loc in enumerate(NEW_LOCATIONS, 1):
            log.info(f"[{i}/{total}] {loc['name']}")
            await remove_masks(page)
            query = f"{loc['name']} 柳州"
            inp = page.locator("#searchipt")
            try:
                await inp.click(force=True, timeout=3000)
                await inp.fill("", force=True); await asyncio.sleep(0.1)
                await inp.fill(query, force=True); await inp.press("Enter")
            except:
                log.info("  [WARN] search failed"); results.append({"name": loc["name"], "result": "error"}); continue
            await asyncio.sleep(3.5); await remove_masks(page)
            # Click first result
            try:
                await page.wait_for_selector("li.poibox", timeout=5000)
                fr = page.locator("li.poibox").first
                if await fr.count() > 0: await fr.click(force=True)
                else: log.info("  [MISS] no result"); results.append({"name": loc["name"], "result": "no_result"}); continue
            except:
                log.info("  [MISS] no result"); results.append({"name": loc["name"], "result": "no_result"}); continue
            await asyncio.sleep(2.5)
            # Check if already fav
            already = await page.evaluate("""() => { const t = document.querySelector('.placebox span.collect.favit .meepo_text'); return t && t.textContent.trim() === '已收藏'; }""")
            if already:
                log.info("  [SKIP] Already fav"); results.append({"name": loc["name"], "result": "already"}); await asyncio.sleep(1); continue
            # Click fav
            await page.evaluate("""() => { const b = document.querySelector('.placebox span.collect.favit'); if(b) b.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window})); }""")
            await asyncio.sleep(2)
            ok = await page.evaluate("""() => { const m = document.querySelector('.lbs-passport-modal'); if(m && m.offsetParent!==null) return 'login'; const t = document.querySelector('.placebox span.collect.favit .meepo_text'); return t && t.textContent.trim()==='已收藏' ? 'ok' : 'unknown'; }""")
            if ok == "login":
                log.info("  [ABORT] Login expired!"); results.append({"name": loc["name"], "result": "login"}); break
            log.info(f"  [{ok.upper()}] Fav result")
            results.append({"name": loc["name"], "result": ok})
            await asyncio.sleep(1.5)
        # Summary
        ok_c = sum(1 for r in results if r["result"] in ("ok","unknown"))
        skip_c = sum(1 for r in results if r["result"] == "already")
        fail_c = total - ok_c - skip_c
        log.info(f"\n=== RESULTS: {ok_c} new + {skip_c} existed + {fail_c} failed / {total} ===")
        for r in results:
            log.info(f"  {r['name']} -> {r['result']}")
        with open(os.path.join(SCRIPT_DIR, "amap_fav_new5_results.json"), "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    asyncio.run(main())

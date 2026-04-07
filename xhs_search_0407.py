#!/usr/bin/env python3
"""小红书 MCP 搜索脚本 - 2026-04-07"""
import json, requests, sys, time, os
os.environ["PYTHONIOENCODING"] = "utf-8"
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

MCP_URL = "http://localhost:18060/mcp"
HEADERS_BASE = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream"}

def mcp_init():
    body = {
        "jsonrpc": "2.0", "id": 1, "method": "initialize",
        "params": {"protocolVersion": "2025-03-26", "capabilities": {},
                   "clientInfo": {"name": "daily-search", "version": "1.0"}}
    }
    r = requests.post(MCP_URL, json=body, headers=HEADERS_BASE)
    sid = r.headers.get("Mcp-Session-Id", "")
    print(f"Session ID: {sid[:20]}...")
    # Send initialized notification
    notif = {"jsonrpc": "2.0", "method": "notifications/initialized"}
    headers = {**HEADERS_BASE, "Mcp-Session-Id": sid}
    requests.post(MCP_URL, json=notif, headers=headers)
    return sid

def mcp_call(sid, tool, args, call_id=2):
    headers = {**HEADERS_BASE, "Mcp-Session-Id": sid}
    body = {
        "jsonrpc": "2.0", "id": call_id, "method": "tools/call",
        "params": {"name": tool, "arguments": args}
    }
    r = requests.post(MCP_URL, json=body, headers=headers)
    raw = r.content.decode("utf-8")
    # Handle SSE format
    if raw.startswith("event:") or raw.startswith("data:"):
        for line in raw.split("\n"):
            if line.startswith("data:"):
                data = line[5:].strip()
                if data:
                    try:
                        return json.loads(data)
                    except:
                        pass
        return {"raw": raw}
    try:
        return json.loads(raw)
    except:
        return {"raw": raw}

def extract_feeds(result):
    """Extract feeds from MCP result"""
    feeds = []
    if not result:
        return feeds
    content = result.get("result", {}).get("content", [])
    for item in content:
        if item.get("type") == "text":
            try:
                data = json.loads(item["text"])
                if isinstance(data, dict) and "feeds" in data:
                    feeds = data["feeds"]
                elif isinstance(data, list):
                    feeds = data
            except:
                pass
    return feeds

def search_keyword(sid, keyword, call_id=2):
    print(f"\n搜索: {keyword}")
    result = mcp_call(sid, "search_feeds", {"keyword": keyword}, call_id)
    feeds = extract_feeds(result)
    print(f"  获取到 {len(feeds)} 条结果")
    return feeds

def get_interaction(feed):
    """Get interaction counts from a feed"""
    note = feed.get("noteCard", {})
    interact = note.get("interactInfo", {})
    liked = interact.get("likedCount", "0")
    collected = interact.get("collectedCount", "0")
    # Convert string counts like "1.2万" to numbers
    def parse_count(s):
        s = str(s)
        if "万" in s:
            return int(float(s.replace("万", "")) * 10000)
        try:
            return int(s)
        except:
            return 0
    return parse_count(liked), parse_count(collected)

def main():
    print("=" * 60)
    print("小红书每日搜索 - 2026-04-07")
    print("=" * 60)
    
    # Initialize
    try:
        sid = mcp_init()
    except Exception as e:
        print(f"MCP 连接失败: {e}")
        sys.exit(1)
    
    # Check login
    login_result = mcp_call(sid, "check_login_status", {}, 2)
    print(f"登录状态: {json.dumps(login_result, ensure_ascii=False)[:200]}")
    
    keywords = ["柳州美食推荐", "柳州必吃美食", "柳州探店 美食"]
    all_feeds = []
    seen_ids = set()
    
    for i, kw in enumerate(keywords):
        time.sleep(2)  # Rate limiting
        feeds = search_keyword(sid, kw, call_id=10+i)
        for f in feeds:
            fid = f.get("id", "")
            if fid and fid not in seen_ids:
                seen_ids.add(fid)
                all_feeds.append(f)
    
    print(f"\n总计去重后: {len(all_feeds)} 条")
    
    # Filter high interaction
    high_interact = []
    for f in all_feeds:
        liked, collected = get_interaction(f)
        note = f.get("noteCard", {})
        title = note.get("displayTitle", "无标题")
        user = note.get("user", {}).get("nickname", "未知")
        if liked >= 500 or collected >= 200:
            high_interact.append({
                "id": f.get("id"),
                "xsecToken": f.get("xsecToken", ""),
                "title": title,
                "user": user,
                "liked": liked,
                "collected": collected,
                "type": note.get("type", "")
            })
    
    # Sort by likes
    high_interact.sort(key=lambda x: x["liked"], reverse=True)
    print(f"高互动(赞>500或收藏>200): {len(high_interact)} 条")
    
    for h in high_interact:
        print(f"  [{h['liked']}赞/{h['collected']}藏] {h['title'][:40]} - @{h['user']}")
    
    # Save intermediate results
    output = {
        "date": "2026-04-07",
        "total_raw": 0,
        "total_dedup": len(all_feeds),
        "high_interact_count": len(high_interact),
        "high_interact": high_interact,
        "all_feeds_summary": [{
            "id": f.get("id"),
            "xsecToken": f.get("xsecToken", ""),
            "title": f.get("noteCard", {}).get("displayTitle", ""),
            "user": f.get("noteCard", {}).get("user", {}).get("nickname", ""),
            "liked": get_interaction(f)[0],
            "collected": get_interaction(f)[1]
        } for f in all_feeds]
    }
    
    with open("xhs_search_results_0407.json", "w", encoding="utf-8") as fp:
        json.dump(output, fp, ensure_ascii=False, indent=2)
    
    print(f"\n结果已保存到 xhs_search_results_0407.json")
    
    # Get details for high interact posts
    print(f"\n获取 {len(high_interact)} 条高互动帖详情...")
    details = []
    for i, h in enumerate(high_interact):
        if not h.get("xsecToken"):
            print(f"  跳过 [{h['title'][:30]}] - 无 xsecToken")
            continue
        time.sleep(2)
        print(f"  [{i+1}/{len(high_interact)}] {h['title'][:40]}...")
        try:
            result = mcp_call(sid, "get_feed_detail", {
                "feed_id": h["id"],
                "xsec_token": h["xsecToken"]
            }, 100+i)
            content = result.get("result", {}).get("content", [])
            detail_data = None
            for item in content:
                if item.get("type") == "text":
                    try:
                        detail_data = json.loads(item["text"])
                    except:
                        pass
            if detail_data:
                note = detail_data.get("data", {}).get("note", {})
                comments_data = detail_data.get("data", {}).get("comments", {})
                comment_list = comments_data.get("list", []) if isinstance(comments_data, dict) else []
                details.append({
                    "feed_id": h["id"],
                    "title": note.get("title", h["title"]),
                    "desc": note.get("desc", ""),
                    "liked": h["liked"],
                    "collected": h["collected"],
                    "user": h["user"],
                    "type": note.get("type", h.get("type", "")),
                    "time": note.get("time", ""),
                    "ipLocation": note.get("ipLocation", ""),
                    "comments_count": len(comment_list),
                    "top_comments": [
                        {"content": c.get("content", ""), "likes": c.get("likeCount", 0)}
                        for c in comment_list[:10]
                    ]
                })
                print(f"    正文长度: {len(note.get('desc', ''))}, 评论: {len(comment_list)}条")
            else:
                print(f"    无法解析详情")
        except Exception as e:
            print(f"    错误: {e}")
    
    # Save details
    with open("xhs_details_0407.json", "w", encoding="utf-8") as fp:
        json.dump(details, fp, ensure_ascii=False, indent=2)
    
    print(f"\n详情已保存: {len(details)} 条 → xhs_details_0407.json")

if __name__ == "__main__":
    main()

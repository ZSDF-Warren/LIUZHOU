import urllib.request
import urllib.error
import json
import subprocess
import time
import os
import sys
import re

MCP_URL = "http://localhost:18060/mcp"
MCP_EXE = os.path.join(os.environ["USERPROFILE"], ".local", "bin", "xiaohongshu-mcp-windows-amd64.exe")

def start_server():
    try:
        subprocess.run(["taskkill", "/f", "/im", "xiaohongshu-mcp-windows-amd64.exe"],
                       capture_output=True, timeout=5)
        time.sleep(2)
    except:
        pass
    proc = subprocess.Popen(
        [MCP_EXE, "--port=:18060"],
        creationflags=0x08000000,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )
    for i in range(10):
        time.sleep(2)
        try:
            req = urllib.request.Request(MCP_URL, method="GET")
            urllib.request.urlopen(req, timeout=3)
            return True
        except urllib.error.HTTPError:
            return True
        except:
            pass
    if proc.poll() is not None:
        stderr = proc.stderr.read().decode("utf-8", errors="replace")
        print(f"Server died: {stderr[:300]}")
    return False

def mcp_call(method, params=None, session_id=None):
    body = {"jsonrpc": "2.0", "method": method}
    if not method.startswith("notifications/"):
        body["id"] = 1
    if params:
        body["params"] = params
    data = json.dumps(body).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream"
    }
    if session_id:
        headers["Mcp-Session-Id"] = session_id
    req = urllib.request.Request(MCP_URL, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            sid = resp.headers.get("Mcp-Session-Id", session_id)
            raw = resp.read().decode("utf-8")
            if "text/event-stream" in resp.headers.get("Content-Type", ""):
                for line in raw.split("\n"):
                    if line.startswith("data: "):
                        try:
                            return json.loads(line[6:]), sid
                        except:
                            pass
                return {"raw_sse": raw}, sid
            return json.loads(raw), sid
    except urllib.error.HTTPError as e:
        body_text = e.read().decode("utf-8", errors="replace")
        print(f"HTTP {e.code}: {body_text[:500]}")
        return None, session_id
    except Exception as e:
        print(f"Error: {e}")
        return None, session_id

def extract_text(result):
    if not result:
        return ""
    content = result.get("result", {}).get("content", [])
    texts = []
    for c in content:
        if c.get("type") == "text":
            texts.append(c["text"])
    if texts:
        return "\n".join(texts)
    if "raw_sse" in result:
        return result["raw_sse"]
    return json.dumps(result, ensure_ascii=False, indent=2)

def main():
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', errors='replace', buffering=1)
    sys.stderr = open(sys.stderr.fileno(), mode='w', encoding='utf-8', errors='replace', buffering=1)
    
    if not start_server():
        print("FATAL: Could not start MCP server")
        sys.exit(1)
    
    # Initialize
    print("Initializing MCP session...")
    result, sid = mcp_call("initialize", {
        "protocolVersion": "2024-11-05",
        "capabilities": {},
        "clientInfo": {"name": "xhs-search", "version": "1.0"}
    })
    if not result:
        print("FATAL: Failed to initialize MCP")
        sys.exit(1)
    print(f"Session ID: {sid}")
    
    mcp_call("notifications/initialized", {}, sid)
    time.sleep(0.5)
    
    # List tools first to see correct parameters
    print("\n=== Listing available tools ===")
    result, sid = mcp_call("tools/list", {}, sid)
    tools_text = json.dumps(result, ensure_ascii=False, indent=2)
    with open("xhs_tools.json", "w", encoding="utf-8") as f:
        f.write(tools_text)
    # Print just tool names and their params
    if result and "result" in result:
        tools = result["result"].get("tools", [])
        for t in tools:
            print(f"  - {t['name']}: {json.dumps(t.get('inputSchema', {}), ensure_ascii=False)[:200]}")
    
    # Check login
    print("\n=== Checking login status ===")
    result, sid = mcp_call("tools/call", {
        "name": "check_login_status",
        "arguments": {}
    }, sid)
    login_text = extract_text(result)
    print(login_text[:300])
    
    if "未登录" in login_text or "not logged" in login_text.lower():
        print("\nWARNING: Not logged in! Exiting.")
        sys.exit(1)
    
    # Search - only use keyword, no extra params
    all_search_texts = {}
    keywords = ["柳州美食推荐", "柳州必吃美食", "柳州探店"]
    
    for kw in keywords:
        print(f"\n=== Searching: {kw} ===")
        result, sid = mcp_call("tools/call", {
            "name": "search_feeds",
            "arguments": {"keyword": kw}
        }, sid)
        text = extract_text(result)
        all_search_texts[kw] = text
        print(text[:3000])
        time.sleep(1)
    
    # Save raw search results
    with open("xhs_search_results_20260329.json", "w", encoding="utf-8") as f:
        json.dump(all_search_texts, f, ensure_ascii=False, indent=2)
    print("\nSearch results saved.")
    
    # Extract note IDs
    all_note_ids = []
    for text in all_search_texts.values():
        # Various patterns for note IDs
        ids = re.findall(r'(?:note_id|id)["\s:]+([a-f0-9]{24})', text)
        if not ids:
            ids = re.findall(r'/explore/([a-f0-9]{24})', text)
        if not ids:
            ids = re.findall(r'"([a-f0-9]{24})"', text)
        for nid in ids:
            if nid not in all_note_ids:
                all_note_ids.append(nid)
    
    print(f"\nFound {len(all_note_ids)} unique note IDs")
    
    # Get details for top posts (up to 12)
    details = []
    for i, nid in enumerate(all_note_ids[:12]):
        print(f"\n=== Detail {i+1}/{min(12, len(all_note_ids))}: {nid} ===")
        result, sid = mcp_call("tools/call", {
            "name": "get_feed_detail",
            "arguments": {"note_id": nid}
        }, sid)
        text = extract_text(result)
        details.append({"note_id": nid, "detail": text})
        print(text[:2000])
        time.sleep(1)
    
    # Save details
    with open("xhs_details_20260329.json", "w", encoding="utf-8") as f:
        json.dump(details, f, ensure_ascii=False, indent=2)
    
    print(f"\n\nDone! {len(details)} details saved.")

if __name__ == "__main__":
    main()

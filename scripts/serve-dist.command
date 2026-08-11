#!/bin/sh
# 在 Finder 直接雙擊本檔即可啟動本機 server，供四寬度 Browser QA 使用。
#
# 為何不用 file://：file:// 是 opaque origin，service worker 不會註冊、
# location.origin 讀出 "null"，QA 量到的不是 production 行為。
#
# 為何不用 npx／vite preview：本機未必裝 node。macOS 內建 python3。
#
# 關閉：在本視窗按 Control + C，或直接關掉視窗。

cd "$(dirname "$0")/../dist" || {
  echo "找不到 dist/。請先讓 Claude 跑 npm run build。"
  read -r _
  exit 1
}

PORT=4173
echo "────────────────────────────────────────"
echo "  玄空紫白 QA server"
echo "  http://localhost:$PORT"
echo ""
echo "  要停止：按 Control + C"
echo "────────────────────────────────────────"
echo ""

exec python3 -m http.server "$PORT"

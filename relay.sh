#!/bin/bash
# Claude Code Hook 脚本
# 用法: relay.sh <STATE> [TOOL_NAME]

STATE="${1:-IDLE}"
TOOL="${2:-}"
SERVER="${CLAUDE_RELAY_URL:-http://localhost:3847}"

curl -s -X POST "$SERVER/api/state" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"state_change\",\"state\":\"$STATE\",\"tool\":\"$TOOL\",\"timestamp\":$(date +%s000),\"sessionId\":\"default\"}" \
  > /dev/null 2>&1 &

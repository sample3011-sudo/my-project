#!/usr/bin/env bash
# Auto-format hook for Claude Code PostToolUse events

# Read JSON payload from stdin
PAYLOAD=$(cat)

if [ -z "$PAYLOAD" ]; then
  exit 0
fi

# Extract file path from tool_input
FILE_PATH=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

if [ -n "$FILE_PATH" ] && [ -f "$FILE_PATH" ]; then
  npx prettier --write "$FILE_PATH" 2>/dev/null || true
fi

exit 0

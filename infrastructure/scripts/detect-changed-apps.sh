#!/usr/bin/env bash
set -e

# Detect which apps have changed in the current commit
# Outputs a JSON array of changed app names

# Get list of changed files
CHANGED_FILES=$(git diff --name-only HEAD^ HEAD 2>/dev/null || git diff --name-only HEAD)

# Define all apps with their directories
declare -a APPS=(
  "portfolio:apps/portfolio/frontend"
  "camera-tricks-demo:apps/camera-tricks-demo"
  "home-page:apps/home-page"
  "gifster:apps/gifster"
  "fallcrate:apps/fallcrate"
  "shareme:apps/shareme/frontend"
  "su-done-ku:apps/su-done-ku/frontend"
  "sketches:apps/sketches"
  "resume:apps/resume"
  "ascii-video:apps/ascii-video"
  "steering-text:apps/steering-text"
  "minesweeper:apps/minesweeper"
  "pathfinder-visualizer:apps/pathfinder-visualizer"
  "enlight:apps/enlight"
  "quipster:apps/quipster"
)

# Array to store changed apps
CHANGED_APPS=()

# Check if any shared packages changed (rebuild all apps if so)
if echo "$CHANGED_FILES" | grep -q "^packages/"; then
  echo "Shared packages changed, building all apps"
  for app in "${APPS[@]}"; do
    APP_NAME="${app%%:*}"
    CHANGED_APPS+=("\"$APP_NAME\"")
  done
else
  # Check each app individually
  for app in "${APPS[@]}"; do
    APP_NAME="${app%%:*}"
    APP_PATH="${app##*:}"
    
    # Check if any files in the app directory changed
    if echo "$CHANGED_FILES" | grep -q "^$APP_PATH/"; then
      echo "App changed: $APP_NAME"
      CHANGED_APPS+=("\"$APP_NAME\"")
    fi
  done
fi

# Output JSON array
if [ ${#CHANGED_APPS[@]} -eq 0 ]; then
  echo "[]"
else
  # Join array elements with commas
  APPS_JSON=$(IFS=,; echo "${CHANGED_APPS[*]}")
  echo "[$APPS_JSON]"
fi

#!/usr/bin/env bash
set -e

echo "🧹 Cleaning up AWS Amplify apps..."
echo ""

# List all Amplify apps
echo "Fetching Amplify apps..."
APPS=$(aws amplify list-apps --query 'apps[?starts_with(name, `dreadfolio-`)].{Name:name,Id:appId}' --output json)

if [ "$(echo $APPS | jq '. | length')" -eq 0 ]; then
  echo "✅ No Amplify apps found with prefix 'dreadfolio-'"
  exit 0
fi

echo "Found the following apps:"
echo "$APPS" | jq -r '.[] | "- \(.Name) (\(.Id))"'
echo ""

# Ask for confirmation
read -p "⚠️  Are you sure you want to DELETE all these apps? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Aborted"
  exit 0
fi

echo ""
echo "Deleting apps..."

# Delete each app
echo "$APPS" | jq -r '.[].Id' | while read APP_ID; do
  APP_NAME=$(echo "$APPS" | jq -r ".[] | select(.Id == \"$APP_ID\") | .Name")
  echo "Deleting $APP_NAME ($APP_ID)..."
  
  aws amplify delete-app --app-id "$APP_ID" || {
    echo "⚠️  Failed to delete $APP_NAME"
    continue
  }
  
  echo "✅ Deleted $APP_NAME"
done

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Next steps:"
echo "1. Delete amplify.yml files: find apps -name 'amplify.yml' -delete"
echo "2. Remove Amplify scripts from infrastructure/scripts/"

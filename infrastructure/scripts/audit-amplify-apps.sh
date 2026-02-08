#!/usr/bin/env bash

# Audit existing AWS Amplify Apps
# Shows what apps exist and their current configuration

set -e

AWS_REGION="us-east-1"

echo "================================================"
echo "Auditing AWS Amplify Apps"
echo "================================================"
echo ""

# Get all Amplify apps
APPS=$(aws amplify list-apps --region "$AWS_REGION" --query 'apps[].[name,appId,defaultDomain,repository]' --output json)

if [ "$APPS" == "[]" ]; then
    echo "No Amplify apps found in region $AWS_REGION"
    exit 0
fi

# Parse and display each app
echo "$APPS" | jq -r '.[] | @tsv' | while IFS=$'\t' read -r NAME APP_ID DOMAIN REPO; do
    echo "App: $NAME"
    echo "  App ID: $APP_ID"
    echo "  Domain: $DOMAIN"
    echo "  Repository: ${REPO:-Not connected}"
    
    # Get branches for this app
    BRANCHES=$(aws amplify list-branches --app-id "$APP_ID" --region "$AWS_REGION" --query 'branches[].[branchName,totalNumberOfJobs]' --output json 2>/dev/null || echo "[]")
    
    if [ "$BRANCHES" != "[]" ]; then
        echo "  Branches:"
        echo "$BRANCHES" | jq -r '.[] | "    - \(.[0]): \(.[1]) deploy(s)"'
    else
        echo "  Branches: None"
    fi
    
    echo ""
done

echo "================================================"
echo "Total apps: $(echo "$APPS" | jq '. | length')"
echo "================================================"

#!/usr/bin/env bash

# Create AWS Amplify Apps for Dreadfolio Monorepo
# This script creates 15 separate Amplify apps, one for each static application

set -e

# Configuration
GITHUB_REPO="https://github.com/dreadhalor/dreadfolio"  # Update with your actual repo URL
AWS_REGION="us-east-1"

# Array of apps with their configuration (app-name:app-root)
# Using simple arrays instead of associative arrays for zsh compatibility
APPS=(
    "camera-tricks-demo:apps/camera-tricks-demo"
    "portfolio-frontend:apps/portfolio/frontend"
    "home-page:apps/home-page"
    "sketches:apps/sketches"
    "resume:apps/resume"
    "ascii-video:apps/ascii-video"
    "steering-text:apps/steering-text"
    "minesweeper:apps/minesweeper"
    "pathfinder-visualizer:apps/pathfinder-visualizer"
    "enlight:apps/enlight"
    "gifster:apps/gifster"
    "quipster:apps/quipster"
    "su-done-ku:apps/su-done-ku/frontend"
    "fallcrate:apps/fallcrate"
    "shareme:apps/shareme/frontend"
)

echo "================================================"
echo "Creating AWS Amplify Apps for Dreadfolio"
echo "================================================"
echo ""

# Check if AWS CLI is installed and configured
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed. Please install it first."
    echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "Error: AWS credentials are not configured properly."
    echo "Run: aws configure"
    exit 1
fi

echo "✓ AWS CLI configured"
echo ""

# Create each Amplify app
for APP_ENTRY in "${APPS[@]}"; do
    # Split the entry into name and root
    APP_NAME="${APP_ENTRY%%:*}"
    APP_ROOT="${APP_ENTRY#*:}"
    
    echo "Creating Amplify app: dreadfolio-$APP_NAME"
    echo "  App Root: $APP_ROOT"
    
    # Create the Amplify app
    APP_ID=$(aws amplify create-app \
        --name "dreadfolio-$APP_NAME" \
        --repository "$GITHUB_REPO" \
        --platform WEB \
        --enable-branch-auto-build \
        --region "$AWS_REGION" \
        --query 'app.appId' \
        --output text)
    
    if [ -z "$APP_ID" ]; then
        echo "  ✗ Failed to create app"
        continue
    fi
    
    echo "  ✓ Created app with ID: $APP_ID"
    
    # Create staging branch
    echo "  Creating staging branch..."
    aws amplify create-branch \
        --app-id "$APP_ID" \
        --branch-name "staging" \
        --enable-auto-build \
        --region "$AWS_REGION" \
        > /dev/null
    echo "  ✓ Created staging branch"
    
    # Create main branch
    echo "  Creating main branch..."
    aws amplify create-branch \
        --app-id "$APP_ID" \
        --branch-name "main" \
        --enable-auto-build \
        --region "$AWS_REGION" \
        > /dev/null
    echo "  ✓ Created main branch"
    
    # Set build settings
    echo "  Configuring build settings..."
    aws amplify update-app \
        --app-id "$APP_ID" \
        --build-spec "$(cat <<EOF
version: 1
applications:
  - appRoot: $APP_ROOT
    frontend:
      phases:
        preBuild:
          commands:
            - cd ../..
            - npm install -g pnpm@8.15.1
            - pnpm install
        build:
          commands:
            - pnpm build --filter=$APP_NAME
      artifacts:
        baseDirectory: $APP_ROOT/dist
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
EOF
)" \
        --region "$AWS_REGION" \
        > /dev/null
    echo "  ✓ Configured build settings"
    
    echo ""
done

echo "================================================"
echo "✓ All Amplify apps created successfully!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Configure environment variables for each app in the Amplify Console"
echo "2. Connect GitHub repository to trigger builds"
echo "3. Configure custom domains for staging and production"
echo ""
echo "View your apps: https://console.aws.amazon.com/amplify/home?region=$AWS_REGION"

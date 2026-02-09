#!/usr/bin/env bash
set -e

ENV=${1:-staging}
echo "Deploying apps to S3 ($ENV environment)..."

# App mappings: app-name:dist-path:bucket-name
APPS=(
  "portfolio:apps/portfolio/frontend/dist:portfolio-$ENV-2026"
  "camera-tricks-demo:apps/camera-tricks-demo/dist:camera-tricks-demo-$ENV-2026"
  "home-page:apps/home-page/dist:home-page-$ENV-2026"
  "gifster:apps/gifster/dist:gifster-$ENV-2026"
  "fallcrate:apps/fallcrate/dist:fallcrate-$ENV-2026"
  "shareme:apps/shareme/frontend/dist:shareme-$ENV-2026"
  "su-done-ku:apps/su-done-ku/frontend/dist:su-done-ku-$ENV-2026"
  "sketches:apps/sketches/dist:sketches-$ENV-2026"
  "resume:apps/resume/dist:resume-$ENV-2026"
  "ascii-video:apps/ascii-video/dist:ascii-video-$ENV-2026"
  "steering-text:apps/steering-text/dist:steering-text-$ENV-2026"
  "minesweeper:apps/minesweeper/dist:minesweeper-$ENV-2026"
  "pathfinder-visualizer:apps/pathfinder-visualizer/dist:pathfinder-visualizer-$ENV-2026"
  "enlight:apps/enlight/dist:enlight-$ENV-2026"
  "quipster:apps/quipster/dist:quipster-$ENV-2026"
)

for app in "${APPS[@]}"; do
  IFS=':' read -r APP_NAME DIST_PATH BUCKET_NAME <<< "$app"
  
  echo ""
  echo "Deploying $APP_NAME..."
  
  # Upload all files except index.html with long cache
  aws s3 sync "$DIST_PATH" "s3://$BUCKET_NAME/" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "index.html"
  
  # Upload index.html with no cache (for immediate updates)
  aws s3 cp "$DIST_PATH/index.html" "s3://$BUCKET_NAME/index.html" \
    --cache-control "public, max-age=0, must-revalidate"
  
  echo "✅ Deployed $APP_NAME to s3://$BUCKET_NAME/"
done

echo ""
echo "🎉 All apps deployed!"
echo ""
echo "Invalidating CloudFront distribution..."

# Get CloudFront distribution ID for environment
if [ "$ENV" == "prod" ]; then
  DIST_ID="<PROD_CLOUDFRONT_ID>"
else
  DIST_ID="E1RAIZQJ35RLQQ"
fi

aws cloudfront create-invalidation \
  --distribution-id "$DIST_ID" \
  --paths "/*"

echo "✅ CloudFront invalidation initiated"
echo ""
echo "🌐 Staging URL: https://staging.scottjhetrick.com"

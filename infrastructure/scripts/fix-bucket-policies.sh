#!/usr/bin/env bash
set -e

ENV=${1:-staging}
DIST_ARN="arn:aws:cloudfront::851725492026:distribution/E1RAIZQJ35RLQQ"

echo "Fixing S3 bucket policies for $ENV environment..."
echo "CloudFront Distribution ARN: $DIST_ARN"

# App list
APPS=(
  "portfolio"
  "camera-tricks-demo"
  "home-page"
  "gifster"
  "fallcrate"
  "shareme"
  "su-done-ku"
  "sketches"
  "resume"
  "ascii-video"
  "steering-text"
  "minesweeper"
  "pathfinder-visualizer"
  "enlight"
  "quipster"
)

for app in "${APPS[@]}"; do
  BUCKET_NAME="$app-$ENV-2026"
  
  echo "Updating policy for $BUCKET_NAME..."
  
  cat > /tmp/bucket-policy-$app.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*",
      "Condition": {
        "StringEquals": {
          "aws:SourceArn": "$DIST_ARN"
        }
      }
    }
  ]
}
EOF
  
  aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy "file:///tmp/bucket-policy-$app.json"
  echo "✅ Updated $BUCKET_NAME"
done

echo ""
echo "🎉 All bucket policies updated!"
echo "Invalidating CloudFront..."

aws cloudfront create-invalidation --distribution-id E1RAIZQJ35RLQQ --paths "/*" > /dev/null

echo "✅ CloudFront invalidation initiated"

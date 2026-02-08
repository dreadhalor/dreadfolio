#!/bin/bash

# Setup Route 53 for Dreadfolio Staging Environment
# This script creates a subdomain for staging deployments

set -e

# Configuration
DOMAIN="scottjhetrick.com"
STAGING_SUBDOMAIN="staging.$DOMAIN"
AWS_REGION="us-east-1"

echo "================================================"
echo "Setting up Route 53 for Staging Environment"
echo "================================================"
echo ""
echo "Domain: $DOMAIN"
echo "Staging Subdomain: $STAGING_SUBDOMAIN"
echo ""

# Check if AWS CLI is installed and configured
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed."
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "Error: AWS credentials are not configured."
    exit 1
fi

# Get the hosted zone ID for the main domain
echo "Looking up hosted zone for $DOMAIN..."
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name \
    --dns-name "$DOMAIN" \
    --query "HostedZones[0].Id" \
    --output text | cut -d'/' -f3)

if [ -z "$HOSTED_ZONE_ID" ] || [ "$HOSTED_ZONE_ID" == "None" ]; then
    echo "Error: Could not find hosted zone for $DOMAIN"
    echo "Please ensure the domain is registered in Route 53"
    exit 1
fi

echo "✓ Found hosted zone: $HOSTED_ZONE_ID"
echo ""

echo "================================================"
echo "Staging subdomain is ready to be used!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. In each Amplify app, go to 'Domain management'"
echo "2. Add custom domain: $STAGING_SUBDOMAIN"
echo "3. Configure path-based routing for each app:"
echo "   - $STAGING_SUBDOMAIN/camera-tricks → camera-tricks-demo app"
echo "   - $STAGING_SUBDOMAIN/su-done-ku → su-done-ku app"
echo "   - etc."
echo ""
echo "Or use the main domain for production:"
echo "   - $DOMAIN → portfolio-frontend app"
echo "   - $DOMAIN/camera-tricks → camera-tricks-demo app"
echo "   - etc."
echo ""
echo "Amplify will automatically:"
echo "- Create necessary DNS records"
echo "- Provision SSL certificates via ACM"
echo "- Handle HTTPS redirects"

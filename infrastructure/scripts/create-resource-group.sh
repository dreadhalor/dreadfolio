#!/usr/bin/env bash
set -e

ENV=${1:-staging}

echo "Creating AWS Resource Group for Dreadfolio $ENV..."

# Create resource group that filters by tags
aws resource-groups create-group \
  --name "dreadfolio-${ENV}-portfolio" \
  --description "All resources for Dreadfolio portfolio ${ENV} environment" \
  --resource-query '{
    "Type": "TAG_FILTERS_1_0",
    "Query": "{\"ResourceTypeFilters\":[\"AWS::S3::Bucket\",\"AWS::CloudFront::Distribution\",\"AWS::Lambda::Function\"],\"TagFilters\":[{\"Key\":\"ManagedBy\",\"Values\":[\"Terraform\"]},{\"Key\":\"Environment\",\"Values\":[\"'${ENV}'\"]}]}"
  }' \
  --tags "Project=Dreadfolio,Environment=${ENV},ManagedBy=Terraform" \
  --region us-east-1

echo "✅ Resource Group created: dreadfolio-${ENV}-portfolio"
echo ""
echo "View in AWS Console:"
echo "https://console.aws.amazon.com/resource-groups/group/dreadfolio-${ENV}-portfolio"
echo ""
echo "All S3 buckets, CloudFront distributions, and Lambda functions"
echo "tagged with Environment=${ENV} will appear in this group!"

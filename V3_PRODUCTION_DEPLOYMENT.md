# V3 Production Deployment Summary

## Overview

Successfully migrated v3 portfolio infrastructure to production with clean naming convention: `scottjhetrick-{app}-v3-{environment}`

## Infrastructure Created

### S3 Buckets (30 total)

**Staging (15 buckets):**
```
scottjhetrick-portfolio-v3-staging
scottjhetrick-camera-tricks-demo-v3-staging
scottjhetrick-home-page-v3-staging
scottjhetrick-gifster-v3-staging
scottjhetrick-fallcrate-v3-staging
scottjhetrick-shareme-v3-staging
scottjhetrick-su-done-ku-v3-staging
scottjhetrick-sketches-v3-staging
scottjhetrick-resume-v3-staging
scottjhetrick-ascii-video-v3-staging
scottjhetrick-steering-text-v3-staging
scottjhetrick-minesweeper-v3-staging
scottjhetrick-pathfinder-visualizer-v3-staging
scottjhetrick-enlight-v3-staging
scottjhetrick-quipster-v3-staging
```

**Production (15 buckets):**
```
scottjhetrick-portfolio-v3-prod
scottjhetrick-camera-tricks-demo-v3-prod
scottjhetrick-home-page-v3-prod
scottjhetrick-gifster-v3-prod
scottjhetrick-fallcrate-v3-prod
scottjhetrick-shareme-v3-prod
scottjhetrick-su-done-ku-v3-prod
scottjhetrick-sketches-v3-prod
scottjhetrick-resume-v3-prod
scottjhetrick-ascii-video-v3-prod
scottjhetrick-steering-text-v3-prod
scottjhetrick-minesweeper-v3-prod
scottjhetrick-pathfinder-visualizer-v3-prod
scottjhetrick-enlight-v3-prod
scottjhetrick-quipster-v3-prod
```

### CloudFront Distributions

**Staging:**
- Distribution ID: `E1RAIZQJ35RLQQ`
- Domain: `d32mc8efjkze42.cloudfront.net`
- Custom Domain: `staging.scottjhetrick.com`
- SSL Cert: `65f10c13-2cad-4353-b1af-9deedbb6a981` (staging.scottjhetrick.com)
- Status: Updated with new bucket names

**Production:**
- Distribution ID: `E12XGPJPG4VM7M`
- Domain: `d3aa4igwntlipf.cloudfront.net`
- Custom Domains: `scottjhetrick.com`, `www.scottjhetrick.com`
- SSL Cert: `088eabe4-8561-46af-96e0-58bd1a286e3f` (*.scottjhetrick.com wildcard)
- Status: InProgress (deploying)

### Origin Access Control

Both distributions use OAC: `E1L8GTM8RZDBF2`

## CI/CD Pipeline Updates

### Branch Strategy
- `main` branch → Production environment
- `staging` branch → Staging environment

### Bucket Naming Convention
Updated from `{app}-{env}-2026` to `scottjhetrick-{app}-v3-{env}`

### Changes Made
- Enabled environment detection based on branch
- Updated bucket naming formula in `deploy.yml`
- Removed temporary staging hardcode
- Added `staging` branch to workflow triggers

## ✅ Deployment Complete!

### All Steps Completed (2026-02-11)

1. ✅ **GitHub Secret Added**: `PROD_CLOUDFRONT_ID=E12XGPJPG4VM7M`
2. ✅ **Staging Branch Created**: `staging` branch created and pushed
3. ✅ **DNS Updated**: Both `scottjhetrick.com` and `www.scottjhetrick.com` → CloudFront
4. ✅ **First Production Deploy**: camera-tricks-demo deployed successfully
5. ✅ **IAM Policies Updated**: S3 and CloudFront access configured

### DNS Changes Made

**scottjhetrick.com:**
- **Before**: Load Balancer (v2 React physics portfolio)
- **After**: CloudFront E12XGPJPG4VM7M (v3 3D gallery) ✅

**www.scottjhetrick.com:**
- **Added**: CloudFront E12XGPJPG4VM7M (v3 3D gallery) ✅

**Change Status**: PENDING (propagating - typically 5-15 minutes)

### Test Deployments

**Test staging:**
```bash
cd /Users/dreadhalor/Desktop/Coding/dreadfolios/dreadfolio

# Make a change
git checkout staging
# ... edit files ...
git commit -am "test: staging deployment"
git push

# Verify at staging.scottjhetrick.com
```

**Test production:**
```bash
# Merge staging to main or make changes directly
git checkout main
git merge staging
git push

# Verify at scottjhetrick.com
```

## Cleanup (After Verification)

### Delete Old Staging Buckets
Once the new buckets are verified working, delete the old ones:

```bash
OLD_BUCKETS=(
  portfolio-staging-2026
  camera-tricks-demo-staging-2026
  home-page-staging-2026
  gifster-staging-2026
  fallcrate-staging-2026
  shareme-staging-2026
  su-done-ku-staging-2026
  sketches-staging-2026
  resume-staging-2026
  ascii-video-staging-2026
  steering-text-staging-2026
  minesweeper-staging-2026
  pathfinder-visualizer-staging-2026
  enlight-staging-2026
  quipster-staging-2026
)

for bucket in "${OLD_BUCKETS[@]}"; do
  aws s3 rb "s3://${bucket}" --force
  echo "Deleted $bucket"
done
```

## URL Structure After DNS Update

- `scottjhetrick.com` → v3 3D gallery (2026) [Production]
- `staging.scottjhetrick.com` → v3 3D gallery (2026) [Staging]
- `v1.scottjhetrick.com` → v1 Angular (2022)
- `v2.scottjhetrick.com` → v2 React physics (2024)

## Deployment Workflow

### Staging Deployments
1. Push to `staging` branch
2. GitHub Actions detects changed apps
3. Builds and deploys to `scottjhetrick-{app}-v3-staging` buckets
4. Invalidates CloudFront E1RAIZQJ35RLQQ cache
5. Changes live at `staging.scottjhetrick.com`

### Production Deployments
1. Push to `main` branch (or merge `staging` → `main`)
2. GitHub Actions detects changed apps
3. Builds and deploys to `scottjhetrick-{app}-v3-prod` buckets
4. Invalidates CloudFront E12XGPJPG4VM7M cache
5. Changes live at `scottjhetrick.com`

## Architecture Benefits

### Version-Explicit Naming
- `scottjhetrick-{app}-v3-{env}` clearly indicates this is v3 infrastructure
- Future v4 can coexist without conflicts
- No need to delete v3 buckets when v4 is created

### Namespace Protection
- `scottjhetrick-` prefix ensures global uniqueness
- Consistent with v1 naming (`scottjhetrick-portfolio-v1`)
- Prevents bucket name conflicts

### Environment Separation
- Complete isolation between staging and production
- Independent CloudFront distributions
- Separate bucket sets for each environment

## Timeline

**Date:** 2026-02-11

**Completed:**
- ✅ Created 30 S3 buckets with new naming
- ✅ Copied staging data to new buckets
- ✅ Configured bucket policies for OAC
- ✅ Updated staging CloudFront distribution
- ✅ Created production CloudFront distribution
- ✅ Updated CI/CD pipeline
- ✅ Committed changes to main branch

**Pending:**
- ⏳ Add `PROD_CLOUDFRONT_ID` GitHub secret
- ⏳ Create `staging` branch
- ⏳ Update DNS for `scottjhetrick.com`
- ⏳ Test deployments
- ⏳ Delete old staging buckets

## Notes

- Production CloudFront distribution is currently deploying (InProgress)
- Should be ready in 10-15 minutes
- DNS propagation will take 5-15 minutes after update
- Old staging buckets can be safely deleted after new infrastructure is verified
- v2 portfolio (currently at scottjhetrick.com) will be available at v2.scottjhetrick.com after DNS update

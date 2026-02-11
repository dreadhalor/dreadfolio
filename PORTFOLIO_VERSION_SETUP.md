# Portfolio Version Setup Summary

## Overview

Discovered 3 portfolio versions spanning 2022-2026 and reorganized into `dreadfolios/` directory structure.

## Directory Structure

```
~/Desktop/Coding/dreadfolios/
  dreadfolio-v1/    ← Complete v1 ecosystem (2022)
                      GitHub: https://github.com/Dreadhalor/dreadfolio-v1
                      Structure: apps/ containing portfolio + 5 archived apps
  dreadfolio-v2/    ← React physics (2024) - Physics-based app switcher
  dreadfolio/       ← 3D camera gallery (2026) - Current monorepo
```

## Deployment URLs

### Current State - All Live! ✅
- `scottjhetrick.com` → v3 3D gallery (2026) via CloudFront ✅ (2026-02-11)
- `www.scottjhetrick.com` → v3 3D gallery (2026) via CloudFront ✅ (2026-02-11)
- `staging.scottjhetrick.com` → v3 3D gallery (2026) staging ✅
- `v1.scottjhetrick.com` → v1 Angular (2022) via CloudFront ✅ (2026-02-10)
- `v2.scottjhetrick.com` → v2 React physics (2024) via EC2 Load Balancer ✅ (2026-02-10)

### Final URL Structure (Chronologically Correct)
- `v1.scottjhetrick.com` → Angular (2022) with 5 archived apps
- `v2.scottjhetrick.com` → React physics (2024)
- `scottjhetrick.com` → 3D gallery (2026) [PRODUCTION]
- `staging.scottjhetrick.com` → 3D gallery (2026) [STAGING]

## AWS Resources Deployed

### DNS Records
- ✅ `scottjhetrick.com` → CloudFront `E12XGPJPG4VM7M` (2026-02-11)
  - Serves v3 3D gallery portfolio (PRODUCTION)
- ✅ `www.scottjhetrick.com` → CloudFront `E12XGPJPG4VM7M` (2026-02-11)
  - Serves v3 3D gallery portfolio (PRODUCTION)
- ✅ `staging.scottjhetrick.com` → CloudFront `E1RAIZQJ35RLQQ`
  - Serves v3 3D gallery portfolio (STAGING)
- ✅ `v1.scottjhetrick.com` → CloudFront `E2OH90LTG8IZP1` (2026-02-11)
  - Serves Angular v1 portfolio + 5 archived apps via path routing
  - Previous distribution `E1GW95D8P43MF1` (disabled, being deleted)
- ✅ `v2.scottjhetrick.com` → Load Balancer (2026-02-10)
  - Serves React physics v2 portfolio

### V1 S3 Buckets (2022 Time Capsule)
- ✅ `scottjhetrick-portfolio-v1` - Angular v1 portfolio (3.6 MB, 50 files)
- ✅ `scottjhetrick-minesweeper-v1` - Minesweeper 2022 build (278 KB, 17 files)
- ✅ `scottjhetrick-enlight-v1` - Enlight 2022 build (1.3 MB, 14 files)
- ✅ `scottjhetrick-visualizeit-v1` - Pathfinder Visualizer 2022 build (512 KB, 14 files)
- ✅ `scottjhetrick-shareme-v1` - ShareMe 2022 build (5.0 MB, 35 files)
- ✅ `scottjhetrick-ascii-video-v1` - ASCII-Video/Matrix-Cam 2022 build (2.6 MB, 6 files)

### V3 S3 Buckets (2026 Production & Staging)
**30 buckets total** - 15 apps × 2 environments

**Naming pattern:** `scottjhetrick-{app}-v3-{staging|prod}`

**Apps:** portfolio, camera-tricks-demo, home-page, gifster, fallcrate, shareme, su-done-ku, sketches, resume, ascii-video, steering-text, minesweeper, pathfinder-visualizer, enlight, quipster

### CloudFront Distributions

**V3 Production** - `E12XGPJPG4VM7M` (d3aa4igwntlipf.cloudfront.net)
- Custom Domains: `scottjhetrick.com`, `www.scottjhetrick.com`
- **15 Origins** (one per app) with path-based routing
- SSL: Wildcard cert `*.scottjhetrick.com` (arn:...088eabe4-8561-46af-96e0-58bd1a286e3f)
- Origin Access Control: E1L8GTM8RZDBF2
- Status: Deployed ✅ (2026-02-11)

**V3 Staging** - `E1RAIZQJ35RLQQ` (d32mc8efjkze42.cloudfront.net)
- Custom Domain: `staging.scottjhetrick.com`
- **15 Origins** (one per app) with path-based routing
- SSL: Staging cert (arn:...65f10c13-2cad-4353-b1af-9deedbb6a981)
- Origin Access Control: E1L8GTM8RZDBF2
- Status: Updated with new bucket names ✅ (2026-02-11)

**V1 Time Capsule** - `E2OH90LTG8IZP1` (d1vyptossjlgly.cloudfront.net)
- Custom Domain: `v1.scottjhetrick.com`
- **6 Origins** with path-based routing:
  - `/` → `scottjhetrick-portfolio-v1` (Angular portfolio)
  - `/minesweeper/*` → `scottjhetrick-minesweeper-v1/minesweeper/`
  - `/enlight/*` → `scottjhetrick-enlight-v1/enlight/`
  - `/pathfinder-visualizer/*` → `scottjhetrick-visualizeit-v1/pathfinder-visualizer/`
  - `/shareme/*` → `scottjhetrick-shareme-v1/shareme/`
  - `/ascii-video/*` → `scottjhetrick-ascii-video-v1/ascii-video/` (Matrix-Cam)
- CloudFront Function: `v1-url-rewrite-simple` (appends index.html to directories)
- SSL: Wildcard cert `*.scottjhetrick.com` (arn:...088eabe4-8561-46af-96e0-58bd1a286e3f)
- Origin Access Control: E1L8GTM8RZDBF2
- Status: Fully functional ✅ (2026-02-11)

## Completed Work

### Initial Setup
1. ✅ Reorganized directories into `dreadfolios/` structure
2. ✅ Added footer link in app grid for portfolio v1
3. ✅ Fixed Safari aspect ratio bug for app cards
4. ✅ Removed unused VintageOverlay component
5. ✅ Cleaned up v1 detection code (no longer needed)
6. ✅ Committed changes: `2262f9f`

### v1 Portfolio Deployment (2026-02-10)
7. ✅ Built Angular v1 production bundle (268 KB → 74 KB compressed)
8. ✅ Created S3 bucket `portfolio-v1-2026` (later renamed)
9. ✅ Uploaded v1 build to S3 (50 files, 3.6 MB)
10. ✅ Configured S3 for static website hosting
11. ✅ Created CloudFront distribution `E1GW95D8P43MF1`
12. ✅ Configured Origin Access Control for secure S3 access
13. ✅ Updated DNS: `v1.scottjhetrick.com` → CloudFront

### v2 DNS Setup (2026-02-10)
14. ✅ Created DNS record for `v2.scottjhetrick.com` → Load Balancer

### V3 Production Promotion (2026-02-11)
28. ✅ Created 30 S3 buckets with clean naming: `scottjhetrick-{app}-v3-{environment}`
29. ✅ Copied all staging data to new staging buckets
30. ✅ Updated staging CloudFront distribution (E1RAIZQJ35RLQQ) with new bucket names
31. ✅ Created production CloudFront distribution (E12XGPJPG4VM7M)
32. ✅ Configured OAC policies for all 30 buckets
33. ✅ Updated IAM role policies:
    - S3 access: Wildcards for `scottjhetrick-*-v3-staging` and `scottjhetrick-*-v3-prod`
    - CloudFront invalidation: Both staging and production distributions
34. ✅ Updated CI/CD pipeline:
    - Branch-based deployment: `main` → prod, `staging` → staging
    - New bucket naming in deploy.yml
    - Removed temporary staging hardcode
35. ✅ Added `PROD_CLOUDFRONT_ID` GitHub secret
36. ✅ Created and pushed `staging` branch
37. ✅ Updated DNS records:
    - `scottjhetrick.com` → Production CloudFront
    - `www.scottjhetrick.com` → Production CloudFront
38. ✅ First production deployment successful (camera-tricks-demo)
39. ✅ Added v1 and v2 portfolio links to camera-tricks-demo app grid

### V1 Time Capsule - Full Ecosystem (2026-02-10/11)
15. ✅ Created `v1-archive/` directory structure
16. ✅ Found 2022 commits for all apps
17. ✅ Cloned and checked out 2022 versions:
    - Minesweeper: 437d18c (2022-12-29)
    - Enlight: 0457d67 (2022-12-30)
    - Pathfinder Visualizer: cf63d8a (2022-12-19)
    - ShareMe: 993c0df (2022-12-27)
    - ASCII-Video: e936e05 (2022-03-28)
18. ✅ Built all 5 apps with 2022 dependencies:
    - Pathfinder Visualizer: Used Node 16 + Python 3.9 for node-sass compatibility
    - ShareMe: Fixed missing assets and TypeScript declarations
19. ✅ Created 5 new S3 buckets with clean naming:
    - `scottjhetrick-minesweeper-v1`
    - `scottjhetrick-enlight-v1`
    - `scottjhetrick-visualizeit-v1`
    - `scottjhetrick-shareme-v1`
    - `scottjhetrick-ascii-video-v1`
20. ✅ Uploaded all app builds to S3
21. ✅ Recreated portfolio bucket as `scottjhetrick-portfolio-v1`
22. ✅ Configured S3 bucket policies for CloudFront OAC on all 6 buckets
23. ✅ Updated CloudFront distribution with 6 origins and path-based routing
24. ✅ Updated v1 portfolio URLs to reference archived apps
25. ✅ Rebuilt and redeployed v1 portfolio with updated URLs (twice - added Matrix-Cam on 2026-02-11)
26. ✅ Created comprehensive README for `v1-archive/`
27. ✅ Updated deploy script for new bucket names
28. ✅ (2026-02-11) Debugged and fixed v1 CloudFront routing issues:
    - Identified broken cache behaviors in distribution `E1GW95D8P43MF1`
    - Created new CloudFront distribution `E2OH90LTG8IZP1` from scratch
    - Reorganized S3 structure: apps now in subfolders matching CloudFront paths
    - Created simple CloudFront Function for index.html appending
    - Updated all bucket policies for new distribution
    - Disabled old distribution `E1GW95D8P43MF1`
    - ✅ Verified all 6 apps working correctly at `v1.scottjhetrick.com`
29. ✅ (2026-02-11) Consolidated v1 portfolio GitHub repository:
    - Moved portfolio into `apps/portfolio/` alongside archived apps
    - All v1 apps now peers in `apps/` directory for consistent structure
    - Repository: https://github.com/Dreadhalor/dreadfolio-v1
    - Removed .git folders from archived apps (commits documented in README)
    - Cleaned node_modules and build artifacts (can be reinstalled)
    - Complete v1 time capsule now in single repository
    - Renamed from portfolio-og to dreadfolio-v1 for consistency
    - Moved from `v1-archive/portfolio/` to `dreadfolio-v1/` (consistent with v2/v3)
    - Migrated Pathfinder Visualizer URL from `/AlgorithmVisualizer` to `/pathfinder-visualizer` for kebab-case consistency
    - Renamed directory from `visualizeit/` to `pathfinder-visualizer/` for complete consistency

## Next Steps

### V1 Time Capsule - Completed! ✅
- ✅ Full v1 ecosystem deployed with 2022 app versions
- ✅ Portfolio + 5 archived apps served under `v1.scottjhetrick.com`
- ✅ CloudFront path routing configured
- ✅ All 5 apps load correctly (Minesweeper, Enlight, Pathfinder Visualizer, ShareMe, Matrix-Cam/ASCII-Video)
- ✅ External apps still work (BetterMUN, NetWorth)

**Test URLs:**
- https://v1.scottjhetrick.com (portfolio)
- https://v1.scottjhetrick.com/minesweeper
- https://v1.scottjhetrick.com/enlight
- https://v1.scottjhetrick.com/pathfinder-visualizer/
- https://v1.scottjhetrick.com/shareme
- https://v1.scottjhetrick.com/ascii-video (Matrix-Cam)

### V3 Production Infrastructure - Deployed! ✅ (2026-02-11)
- ✅ Created 30 S3 buckets: `scottjhetrick-{app}-v3-{staging|prod}`
- ✅ Migrated staging data to new bucket naming
- ✅ Updated staging CloudFront (E1RAIZQJ35RLQQ) with new origins
- ✅ Created production CloudFront (E12XGPJPG4VM7M)
- ✅ Configured OAC policies for all 30 buckets
- ✅ Updated IAM policies for S3 and CloudFront access
- ✅ Updated CI/CD: main → prod, staging → staging
- ✅ Added PROD_CLOUDFRONT_ID GitHub secret
- ✅ Created staging branch
- ✅ Updated DNS: scottjhetrick.com + www → production CloudFront
- ✅ First production deployment successful (camera-tricks-demo)

**See:** `V3_PRODUCTION_DEPLOYMENT.md` for complete deployment guide

### V2 Status
Currently v2 runs on EC2 Load Balancer and is accessible at `v2.scottjhetrick.com`. After DNS update, v2 will remain at its subdomain.

## Time Machine UI Ideas

With 3 versions (like Brittany Chiang), could create:
- Dedicated "Time Machine" button in floating menu bar
- Modal showing all 3 versions with screenshots
- Each version opens in new tab
- Show year/tech stack for each version

## References

- AWS Account: 851725492026
- Route 53 Hosted Zone: Z0453773EO1Z1O69QMPI
- Wildcard SSL Cert: `*.scottjhetrick.com` 
  - ARN: arn:aws:acm:us-east-1:851725492026:certificate/088eabe4-8561-46af-96e0-58bd1a286e3f
- Load Balancer: portfolio-load-balancer-1443273364.us-east-1.elb.amazonaws.com
- CloudFront OAC ID: E1L8GTM8RZDBF2

## Recent Commits

- `2262f9f` - feat(camera-tricks-demo): add portfolio v1 time capsule footer link
  - Added footer link (currently points to wrong version after renaming)
  - Fixed Safari aspect ratio for app cards
  - Added @react-spring/web dependency

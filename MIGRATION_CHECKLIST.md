# Dreadfolio Migration Checklist

Use this checklist to track progress during the migration from EC2 to AWS Amplify + Lambda.

## Pre-Migration Setup

- [ ] AWS CLI installed and configured
- [ ] AWS SAM CLI installed
- [ ] GitHub repository connected to AWS Amplify
- [ ] Domain (scottjhetrick.com) confirmed in Route 53
- [ ] Review [DEPLOYMENT.md](DEPLOYMENT.md) thoroughly

## Phase 1: Lambda API Deployment

### Sudoku API Lambda

- [ ] Navigate to `infrastructure/lambda/sudoku-api`
- [ ] Run `npm install`
- [ ] Run `npm run build` (verify no errors)
- [ ] Deploy to staging: `sam deploy --guided`
  - [ ] Stack name: `sudoku-api-staging`
  - [ ] Environment: `staging`
  - [ ] Region: `us-east-1`
- [ ] Save the API URL from CloudFormation outputs
- [ ] Test API with curl:
  ```bash
  curl "https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/staging/random?difficulty=easy"
  ```
- [ ] Verify response contains puzzle data

**API URL (save this):**
```
Staging: _____________________________________________
```

## Phase 2: Amplify Apps Creation

### Automated Creation (Recommended)

- [ ] Run `./infrastructure/scripts/create-amplify-apps.sh`
- [ ] Verify all 15 apps created in Amplify Console
- [ ] Connect GitHub repository to Amplify (if not automatic)

### Manual Verification

Verify these apps exist in Amplify Console:

- [ ] dreadfolio-camera-tricks-demo
- [ ] dreadfolio-portfolio-frontend
- [ ] dreadfolio-home-page
- [ ] dreadfolio-sketches
- [ ] dreadfolio-resume
- [ ] dreadfolio-ascii-video
- [ ] dreadfolio-steering-text
- [ ] dreadfolio-minesweeper
- [ ] dreadfolio-pathfinder-visualizer
- [ ] dreadfolio-enlight
- [ ] dreadfolio-gifster
- [ ] dreadfolio-quipster
- [ ] dreadfolio-su-done-ku
- [ ] dreadfolio-fallcrate
- [ ] dreadfolio-shareme

## Phase 3: Environment Variables

### For Each Amplify App

Configure in Amplify Console → App → Environment variables:

#### Gifster
- [ ] `VITE_GIPHY_API_KEY` = `_______________`

#### Su-done-ku
- [ ] `VITE_SUDOKU_API_URL` = `<Lambda API URL from Phase 1>`

#### Fallcrate
- [ ] `VITE_FALLCRATE_FIREBASE_API_KEY` = `_______________`
- [ ] `VITE_FALLCRATE_FIREBASE_AUTH_DOMAIN` = `_______________`
- [ ] `VITE_FALLCRATE_FIREBASE_PROJECT_ID` = `_______________`
- [ ] `VITE_FALLCRATE_FIREBASE_STORAGE_BUCKET` = `_______________`
- [ ] `VITE_FALLCRATE_FIREBASE_MESSAGING_SENDER_ID` = `_______________`
- [ ] `VITE_FALLCRATE_FIREBASE_APP_ID` = `_______________`

#### ShareMe
- [ ] `VITE_SHAREME_FIREBASE_API_KEY` = `_______________`
- [ ] `VITE_SHAREME_FIREBASE_AUTH_DOMAIN` = `_______________`
- [ ] `VITE_SHAREME_FIREBASE_PROJECT_ID` = `_______________`
- [ ] `VITE_SHAREME_FIREBASE_STORAGE_BUCKET` = `_______________`
- [ ] `VITE_SHAREME_FIREBASE_MESSAGING_SENDER_ID` = `_______________`
- [ ] `VITE_SHAREME_FIREBASE_APP_ID` = `_______________`

#### Optional: Turborepo Remote Caching (All Apps)
- [ ] `TURBO_TOKEN` = `_______________`
- [ ] `TURBO_TEAM` = `_______________`

## Phase 4: Domain Configuration

### Staging Subdomain

- [ ] Run `./infrastructure/scripts/setup-route53.sh`
- [ ] Verify hosted zone exists for scottjhetrick.com

### Configure Amplify Custom Domains

For each app, in Amplify Console → Domain management:

#### Staging (staging.scottjhetrick.com)

- [ ] camera-tricks-demo → `/camera-tricks`
- [ ] portfolio-frontend → `/` (root)
- [ ] home-page → `/home`
- [ ] sketches → `/sketches`
- [ ] resume → `/resume`
- [ ] ascii-video → `/ascii-video`
- [ ] steering-text → `/steering-text`
- [ ] minesweeper → `/minesweeper`
- [ ] pathfinder-visualizer → `/pathfinder-visualizer`
- [ ] enlight → `/enlight`
- [ ] gifster → `/gifster`
- [ ] quipster → `/quipster`
- [ ] su-done-ku → `/su-done-ku`
- [ ] fallcrate → `/fallcrate`
- [ ] shareme → `/shareme`

**Note:** Wait 15-30 minutes for DNS propagation and SSL certificate provisioning.

## Phase 5: Git Branch Setup

- [ ] Create staging branch:
  ```bash
  git checkout -b staging
  git push -u origin staging
  ```
- [ ] Verify Amplify apps are set to auto-deploy on:
  - [ ] `staging` branch → staging environment
  - [ ] `main` branch → production environment

## Phase 6: Testing Staging Deployment

### Initial Deploy

- [ ] Push changes to staging branch (triggers first build)
  ```bash
  git checkout staging
  git add .
  git commit -m "Add Amplify configuration and Lambda infrastructure"
  git push origin staging
  ```
- [ ] Monitor builds in Amplify Console
- [ ] Wait for all 15 apps to complete building (~10-20 min)

### Functional Testing

Test each app URL (staging.scottjhetrick.com/*):

- [ ] `/` - Portfolio landing page loads
- [ ] `/camera-tricks` - 3D gallery loads and is interactive
- [ ] `/su-done-ku` - Game loads and can fetch puzzles
- [ ] `/sketches` - P5.js sketches render correctly
- [ ] `/resume` - Resume displays properly
- [ ] `/ascii-video` - Camera app works (requires HTTPS)
- [ ] `/steering-text` - Text animation works
- [ ] `/minesweeper` - Game is playable
- [ ] `/pathfinder-visualizer` - Visualizer works
- [ ] `/enlight` - Game loads
- [ ] `/gifster` - Can search GIFs
- [ ] `/quipster` - Quotes load
- [ ] `/fallcrate` - Firebase connection works
- [ ] `/shareme` - Firebase connection works
- [ ] `/home` - Original homepage loads

### Performance Testing

- [ ] All pages serve over HTTPS
- [ ] SSL certificates are valid
- [ ] HTTP redirects to HTTPS
- [ ] Check TTFB is <200ms:
  ```bash
  curl -w "\nTTFB: %{time_starttransfer}s\n" -o /dev/null -s \
    "https://staging.scottjhetrick.com/camera-tricks"
  ```
- [ ] Check CloudFront is serving assets (check response headers)

### API Testing

- [ ] Su-done-ku can fetch easy puzzles
- [ ] Su-done-ku can fetch medium puzzles
- [ ] Su-done-ku can fetch hard puzzles
- [ ] API responds quickly (<200ms)
- [ ] CORS headers allow frontend access

## Phase 7: Production Cutover

### Pre-Cutover

- [ ] All staging tests passed
- [ ] All apps functioning correctly
- [ ] Performance metrics acceptable
- [ ] Team has reviewed staging environment

### Lower DNS TTL (24h before cutover)

- [ ] In Route 53, edit A record for scottjhetrick.com
- [ ] Set TTL to 300 seconds (5 minutes)
- [ ] Wait 24 hours for old TTL to expire

### Execute Cutover

- [ ] Merge staging to main:
  ```bash
  git checkout main
  git merge staging
  git push origin main
  ```
- [ ] Monitor Amplify builds for all apps
- [ ] Verify all apps build successfully
- [ ] Configure production custom domains (same as staging, but use scottjhetrick.com)
- [ ] Wait for DNS propagation (~30 min)

### Post-Cutover Verification

Test production URLs (scottjhetrick.com/*):

- [ ] All apps load correctly
- [ ] SSL certificates valid
- [ ] Performance is good (TTFB <200ms)
- [ ] No console errors
- [ ] Monitor CloudWatch for Lambda errors

### Monitoring Period

- [ ] Monitor for 24 hours
- [ ] Check error rates in CloudWatch
- [ ] Monitor user feedback
- [ ] Keep EC2 instance running as backup

## Phase 8: Cleanup (After 1 week)

### Verify Stability

- [ ] No critical issues reported
- [ ] Performance metrics stable
- [ ] Cost within expected range
- [ ] User feedback positive

### Decommission Old Infrastructure

- [ ] Stop EC2 instance:
  ```bash
  aws ec2 stop-instances --instance-ids <instance-id>
  ```
- [ ] Wait 3-7 days (in case rollback needed)
- [ ] Terminate EC2 instance:
  ```bash
  aws ec2 terminate-instances --instance-ids <instance-id>
  ```
- [ ] Delete ECR repository:
  ```bash
  aws ecr delete-repository --repository-name portfolio --force
  ```
- [ ] Archive old GitHub Actions workflow:
  ```bash
  git mv .github/workflows/build-and-deploy.yml \
         .github/workflows/OLD_build-and-deploy.yml
  ```
- [ ] (Optional) Remove Docker files:
  ```bash
  git rm Dockerfile docker-compose.yml deploy.sh
  ```

## Post-Migration

### Documentation

- [ ] Update README.md with new deployment instructions
- [ ] Document environment variables
- [ ] Update team runbook
- [ ] Archive migration checklist

### Monitoring Setup

- [ ] Set up CloudWatch billing alerts
- [ ] Configure CloudWatch dashboards
- [ ] Set up error notifications (SNS/email)
- [ ] Document monitoring procedures

### Backup & Disaster Recovery

- [ ] Export Route 53 zone file
- [ ] Document rollback procedures
- [ ] Test rollback process (in staging)
- [ ] Create disaster recovery runbook

## Rollback Plan

If critical issues occur:

### Immediate Rollback (Within 1 week while EC2 running)

- [ ] Restart EC2 instance
- [ ] Update Route 53 DNS to point back to EC2
- [ ] Monitor DNS propagation
- [ ] Verify old system working

### Amplify Rollback

- [ ] Go to Amplify Console → App → Deployments
- [ ] Click "Redeploy" on previous working version
- [ ] Repeat for all affected apps

### Lambda Rollback

- [ ] Deploy previous Lambda version
- [ ] Update API Gateway if needed

## Notes & Issues

Use this space to track any issues or notes during migration:

```
Date: ___________
Issue: 



Resolution: 



---

Date: ___________
Issue: 



Resolution: 


```

## Sign-off

- [ ] Migration completed successfully
- [ ] All tests passed
- [ ] Documentation updated
- [ ] Team trained on new deployment process
- [ ] Old infrastructure decommissioned

**Completed by:** _______________  
**Date:** _______________  
**Reviewed by:** _______________  
**Date:** _______________

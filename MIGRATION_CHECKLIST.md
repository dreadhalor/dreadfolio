# Migration Checklist: CloudFront + Terraform Deployment

This checklist guides you through migrating from the current EC2 deployment to CloudFront + S3 + Terraform.

## Pre-Migration

### Prerequisites

- [ ] AWS CLI installed and configured
- [ ] Terraform >= 1.0 installed
- [ ] pnpm 8.15.1 installed
- [ ] Git repository up to date
- [ ] Access to AWS account with admin permissions
- [ ] Access to Route 53 hosted zone for scottjhetrick.com

### Backup Current System

- [ ] Document current EC2 instance details
- [ ] Backup current deployment configuration
- [ ] Export environment variables from EC2
- [ ] Take snapshot of current site (screenshots)
- [ ] Note current DNS configuration
- [ ] Backup `.env` files

## Phase 1: Infrastructure Setup

### 1.1 Terraform State Backend

- [ ] Create S3 bucket: `dreadfolio-terraform-state`
  ```bash
  aws s3api create-bucket --bucket dreadfolio-terraform-state --region us-east-1
  ```
- [ ] Enable versioning on state bucket
  ```bash
  aws s3api put-bucket-versioning --bucket dreadfolio-terraform-state --versioning-configuration Status=Enabled
  ```
- [ ] Enable encryption on state bucket
  ```bash
  aws s3api put-bucket-encryption --bucket dreadfolio-terraform-state --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
  ```
- [ ] Create DynamoDB table: `dreadfolio-terraform-locks`
  ```bash
  aws dynamodb create-table --table-name dreadfolio-terraform-locks --attribute-definitions AttributeName=LockID,AttributeType=S --key-schema AttributeName=LockID,KeyType=HASH --billing-mode PAY_PER_REQUEST --region us-east-1
  ```
- [ ] Verify backend resources created
  ```bash
  aws s3 ls | grep dreadfolio-terraform-state
  aws dynamodb describe-table --table-name dreadfolio-terraform-locks
  ```

### 1.2 SSL Certificates

**Staging Certificate:**

- [ ] Request certificate for `staging.scottjhetrick.com`
  ```bash
  aws acm request-certificate --domain-name staging.scottjhetrick.com --validation-method DNS --region us-east-1
  ```
- [ ] Note certificate ARN: `_____________________`
- [ ] Get DNS validation records
  ```bash
  aws acm describe-certificate --certificate-arn <arn> --region us-east-1
  ```
- [ ] Add validation CNAME to Route 53
- [ ] Wait for validation (5-30 minutes)
  ```bash
  aws acm wait certificate-validated --certificate-arn <arn> --region us-east-1
  ```
- [ ] Verify certificate status: `ISSUED`

**Production Certificate:**

- [ ] Request certificate for `scottjhetrick.com` with SAN `*.scottjhetrick.com`
  ```bash
  aws acm request-certificate --domain-name scottjhetrick.com --subject-alternative-names "*.scottjhetrick.com" --validation-method DNS --region us-east-1
  ```
- [ ] Note certificate ARN: `_____________________`
- [ ] Get DNS validation records
- [ ] Add validation CNAME to Route 53
- [ ] Wait for validation
- [ ] Verify certificate status: `ISSUED`

### 1.3 Update Terraform Configuration

- [ ] Edit `infrastructure/terraform/staging.tfvars`
  - [ ] Update `certificate_arn` with staging certificate ARN
  - [ ] Verify `domain_name = "staging.scottjhetrick.com"`
  - [ ] Verify `environment = "staging"`

- [ ] Edit `infrastructure/terraform/production.tfvars`
  - [ ] Update `certificate_arn` with production certificate ARN
  - [ ] Verify `domain_name = "scottjhetrick.com"`
  - [ ] Verify `environment = "prod"`

### 1.4 Initialize Terraform

- [ ] Navigate to Terraform directory
  ```bash
  cd infrastructure/terraform
  ```
- [ ] Initialize Terraform
  ```bash
  terraform init
  ```
- [ ] Verify initialization successful
  - [ ] Providers downloaded
  - [ ] Backend configured
  - [ ] Modules loaded

## Phase 2: Deploy Staging Environment

### 2.1 Terraform Plan

- [ ] Run Terraform plan for staging
  ```bash
  terraform plan -var-file=staging.tfvars
  ```
- [ ] Review planned resources:
  - [ ] 15 S3 buckets
  - [ ] 1 CloudFront distribution
  - [ ] 1 Route 53 A record
  - [ ] 1 Route 53 AAAA record
  - [ ] 1 IAM role
  - [ ] 2 IAM policies
  - [ ] 1 OIDC provider

### 2.2 Terraform Apply

- [ ] Apply Terraform configuration
  ```bash
  terraform apply -var-file=staging.tfvars
  ```
- [ ] Confirm with `yes`
- [ ] Wait for completion (10-30 minutes)
- [ ] Save outputs
  ```bash
  terraform output > ../staging-outputs.txt
  ```

### 2.3 Capture Terraform Outputs

- [ ] CloudFront Distribution ID: `_____________________`
- [ ] CloudFront Domain Name: `_____________________`
- [ ] GitHub Actions Role ARN: `_____________________`
- [ ] S3 Bucket Names (sample a few):
  - gifster-staging: `_____________________`
  - fallcrate-staging: `_____________________`
  - portfolio-staging: `_____________________`

### 2.4 Verify Infrastructure

- [ ] Check CloudFront distribution status
  ```bash
  aws cloudfront get-distribution --id <dist-id> --query 'Distribution.Status'
  ```
  Wait until status is `Deployed` (can take 15-30 minutes)

- [ ] Verify S3 buckets created
  ```bash
  aws s3 ls | grep staging
  ```

- [ ] Check Route 53 DNS record
  ```bash
  aws route53 list-resource-record-sets --hosted-zone-id <zone-id> --query "ResourceRecordSets[?Name=='staging.scottjhetrick.com.']"
  ```

## Phase 3: Configure GitHub Secrets

### 3.1 Add AWS Secrets

Go to GitHub repository → Settings → Secrets and variables → Actions

- [ ] Add `AWS_ROLE_ARN` = GitHub Actions Role ARN from Terraform output
- [ ] Add `STAGING_CLOUDFRONT_ID` = CloudFront Distribution ID from Terraform output
- [ ] Add `AWS_TERRAFORM_ROLE_ARN` = (same as AWS_ROLE_ARN for now)

### 3.2 Add Build Environment Variables

- [ ] Add `VITE_GIPHY_API_KEY` = (from existing .env)
- [ ] Add `VITE_FIREBASE_API_KEY` = (from Firebase console)
- [ ] Add `VITE_FIREBASE_AUTH_DOMAIN` = (from Firebase console)
- [ ] Add `VITE_FIREBASE_PROJECT_ID` = (from Firebase console)
- [ ] Add `VITE_FIREBASE_STORAGE_BUCKET` = (from Firebase console)
- [ ] Add `VITE_FIREBASE_MESSAGING_SENDER_ID` = (from Firebase console)
- [ ] Add `VITE_FIREBASE_APP_ID` = (from Firebase console)
- [ ] Add `VITE_VERCEL_TOKEN` = (from Vercel dashboard)
- [ ] Add `VITE_SUDOKU_API_URL` = (will add after Lambda deployment)

## Phase 4: Deploy Lambda API

### 4.1 Build and Deploy Sudoku API

- [ ] Navigate to Lambda directory
  ```bash
  cd infrastructure/lambda/sudoku-api
  ```

- [ ] Install dependencies
  ```bash
  pnpm install --ignore-workspace
  ```

- [ ] Build Lambda function
  ```bash
  pnpm build
  ```

- [ ] Verify build output
  ```bash
  ls -la dist/
  ```
  Should contain:
  - [ ] `index.js`
  - [ ] `puzzles/` directory with `easy.txt`, `medium.txt`, `hard.txt`

- [ ] Deploy with SAM
  ```bash
  sam deploy --guided
  ```
  Configure:
  - Stack name: `sudoku-api-staging`
  - Region: `us-east-1`
  - Confirm changes: `y`
  - Allow SAM CLI IAM role creation: `y`
  - Disable rollback: `n`
  - Save arguments to config: `y`

- [ ] Note API Gateway URL from outputs: `_____________________`

- [ ] Test API endpoint
  ```bash
  curl https://<api-url>/random
  ```
  Should return JSON with puzzle data

- [ ] Add API URL to GitHub secrets as `VITE_SUDOKU_API_URL`

## Phase 5: Deploy Apps to Staging

### 5.1 Test Builds Locally

- [ ] Build all apps locally
  ```bash
  cd /Users/dreadhalor/Desktop/Coding/dreadfolio
  pnpm install
  pnpm build
  ```

- [ ] Verify build outputs exist for all apps:
  - [ ] `apps/portfolio/frontend/dist/`
  - [ ] `apps/gifster/dist/`
  - [ ] `apps/fallcrate/dist/`
  - [ ] `apps/shareme/frontend/dist/`
  - [ ] `apps/su-done-ku/frontend/dist/`
  - [ ] `apps/sketches/dist/`
  - [ ] `apps/resume/dist/`
  - [ ] `apps/ascii-video/dist/`
  - [ ] `apps/steering-text/dist/`
  - [ ] `apps/minesweeper/dist/`
  - [ ] `apps/pathfinder-visualizer/dist/`
  - [ ] `apps/enlight/dist/`
  - [ ] `apps/quipster/dist/`
  - [ ] `apps/home-page/dist/`
  - [ ] `apps/camera-tricks-demo/dist/`

- [ ] Check that built files reference correct base paths
  ```bash
  grep -r 'src="/gifster' apps/gifster/dist/index.html
  grep -r 'src="/resume' apps/resume/dist/index.html
  ```

### 5.2 Trigger GitHub Actions Deployment

- [ ] Push code to staging branch
  ```bash
  git checkout staging
  git merge main  # or your current branch
  git push origin staging
  ```

- [ ] Monitor GitHub Actions
  - Go to GitHub → Actions tab
  - Watch "Deploy to CloudFront" workflow
  - Check that all apps build successfully
  - Verify S3 sync completes
  - Verify CloudFront invalidation triggered

- [ ] Wait for deployment to complete (~10-15 minutes for all apps)

## Phase 6: Verify Staging Deployment

### 6.1 DNS Propagation

- [ ] Check DNS resolution
  ```bash
  nslookup staging.scottjhetrick.com
  dig staging.scottjhetrick.com
  ```
- [ ] Verify points to CloudFront
- [ ] Wait for propagation if needed (up to 48h, usually < 5 minutes)

### 6.2 Test Each App

Test all apps at `https://staging.scottjhetrick.com/`:

- [ ] Portfolio (root `/`)
  - [ ] Page loads
  - [ ] App switcher works
  - [ ] No console errors

- [ ] `/home/`
  - [ ] Loads correctly
  - [ ] Images load
  - [ ] Navigation works

- [ ] `/camera-tricks/`
  - [ ] 3D scene renders
  - [ ] Room navigation works
  - [ ] No WebGL errors

- [ ] `/gifster/`
  - [ ] Loads
  - [ ] Giphy API works
  - [ ] GIF search works
  - [ ] Firebase auth works
  - [ ] Achievements work

- [ ] `/fallcrate/`
  - [ ] Game loads
  - [ ] Controls work
  - [ ] Firebase auth works
  - [ ] Leaderboard works

- [ ] `/shareme/`
  - [ ] Loads
  - [ ] Image upload works
  - [ ] Firebase auth works

- [ ] `/su-done-ku/`
  - [ ] Loads
  - [ ] Sudoku board renders
  - [ ] API call works (new puzzle)
  - [ ] Firebase auth works
  - [ ] Game logic works

- [ ] `/sketches/`
  - [ ] p5.js sketches load
  - [ ] Animation works
  - [ ] Sketch selector works

- [ ] `/resume/`
  - [ ] PDF renders
  - [ ] Download works

- [ ] `/ascii-video/`
  - [ ] Video upload works
  - [ ] ASCII conversion works

- [ ] `/steering-text/`
  - [ ] Text animation works
  - [ ] Controls work

- [ ] `/minesweeper/`
  - [ ] Game loads
  - [ ] Firebase auth works
  - [ ] Gameplay works
  - [ ] Achievements work

- [ ] `/pathfinder-visualizer/`
  - [ ] Visualizer loads
  - [ ] Algorithms work
  - [ ] Firebase auth works
  - [ ] Achievements work

- [ ] `/enlight/`
  - [ ] Puzzle game loads
  - [ ] Levels work
  - [ ] Firebase auth works

- [ ] `/quipster/`
  - [ ] App loads
  - [ ] Quips load

### 6.3 Test Shared Features

- [ ] Firebase Authentication
  - [ ] Login works from one app (e.g., gifster)
  - [ ] User stays logged in when navigating to another app (e.g., fallcrate)
  - [ ] Logout works globally
  - [ ] User profile accessible from all apps

- [ ] Achievements System
  - [ ] Earn achievement in one app
  - [ ] Achievement visible in dread-ui menu from another app
  - [ ] Achievement count syncs across apps

- [ ] Performance
  - [ ] Run Lighthouse on multiple apps
  - [ ] Check Performance score > 90
  - [ ] Check accessibility
  - [ ] Verify no major issues

### 6.4 Test SPA Routing

- [ ] Direct URL navigation works (e.g., `staging.scottjhetrick.com/gifster/search`)
- [ ] Browser refresh preserves route
- [ ] Deep links work when shared
- [ ] Back/forward buttons work

### 6.5 Test Mobile

- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Verify responsive design
- [ ] Check touch interactions
- [ ] Test achievement menu on mobile

## Phase 7: Production Deployment

**⚠️ ONLY proceed after staging is fully tested ⚠️**

### 7.1 Pre-Production Checklist

- [ ] All staging tests passed
- [ ] Firebase auth working correctly
- [ ] No console errors in any app
- [ ] Performance acceptable
- [ ] Stakeholder approval (if applicable)

### 7.2 Lower DNS TTL

To enable faster rollback if needed:

- [ ] Get current TTL for scottjhetrick.com A record
  ```bash
  aws route53 list-resource-record-sets --hosted-zone-id <zone-id> --query "ResourceRecordSets[?Name=='scottjhetrick.com.']"
  ```
- [ ] Update TTL to 300 (5 minutes)
  ```bash
  # Via console or CLI
  ```
- [ ] Wait 24 hours for old TTL to expire

### 7.3 Deploy Production Infrastructure

- [ ] Run Terraform plan for production
  ```bash
  terraform plan -var-file=production.tfvars
  ```
- [ ] Review changes carefully
  - Should create production versions of all staging resources
  - Should NOT modify staging resources

- [ ] Apply Terraform for production
  ```bash
  terraform apply -var-file=production.tfvars
  ```

- [ ] Wait for CloudFront distribution to deploy (15-30 min)
  ```bash
  aws cloudfront wait distribution-deployed --id <prod-dist-id>
  ```

- [ ] Save production outputs
  ```bash
  terraform output > ../production-outputs.txt
  ```

- [ ] Note production CloudFront ID: `_____________________`

- [ ] Add `PROD_CLOUDFRONT_ID` to GitHub secrets

### 7.4 Deploy Lambda API to Production

- [ ] Deploy Sudoku API to production
  ```bash
  cd infrastructure/lambda/sudoku-api
  sam deploy --config-env prod
  # Or run sam deploy --guided with prod settings
  ```
- [ ] Note production API URL: `_____________________`
- [ ] Update `VITE_SUDOKU_API_URL` in GitHub secrets (or create separate prod secret)
- [ ] Test production API
  ```bash
  curl https://<prod-api-url>/random
  ```

### 7.5 Deploy Apps to Production

- [ ] Merge staging to main
  ```bash
  git checkout main
  git merge staging --no-ff -m "Deploy to production"
  git push origin main
  ```

- [ ] Monitor GitHub Actions deployment
- [ ] Wait for all apps to deploy (~10-15 minutes)

### 7.6 DNS Cutover

**⚠️ This is the critical step that switches traffic ⚠️**

The Route 53 record should already be created by Terraform and pointing to the new CloudFront distribution.

- [ ] Verify DNS record exists
  ```bash
  aws route53 list-resource-record-sets --hosted-zone-id <zone-id> --query "ResourceRecordSets[?Name=='scottjhetrick.com.']"
  ```

- [ ] If updating existing record, use CloudFormation changeset or manual update
- [ ] Record time of cutover: `_____________________`

### 7.7 Verify Production

- [ ] Wait 5-10 minutes for DNS propagation
- [ ] Test `https://scottjhetrick.com/` (root)
- [ ] Test all apps (same checklist as staging)
- [ ] Verify Firebase auth works
- [ ] Check browser console for errors
- [ ] Test on multiple devices
- [ ] Run Lighthouse audit

### 7.8 Monitor Production

- [ ] Watch CloudFront metrics for 30 minutes
- [ ] Check error rates
- [ ] Monitor GitHub Actions for any failed deployments
- [ ] Check AWS CloudWatch logs for Lambda errors
- [ ] Watch for user reports/feedback

## Phase 8: Cleanup

### 8.1 Delete Amplify Apps (if any exist)

- [ ] Run cleanup script
  ```bash
  ./infrastructure/scripts/cleanup-amplify-apps.sh
  ```
- [ ] Confirm deletion when prompted
- [ ] Verify all Amplify apps deleted
  ```bash
  aws amplify list-apps
  ```

### 8.2 Decommission EC2 Instance

**⚠️ Wait at least 1 week before decommissioning ⚠️**

- [ ] Verify production stable for 1+ week
- [ ] No rollback needed
- [ ] All functionality confirmed working
- [ ] Take final snapshot of EC2 instance
  ```bash
  aws ec2 create-snapshot --volume-id <volume-id> --description "Final backup before decommission"
  ```
- [ ] Stop EC2 instance
  ```bash
  aws ec2 stop-instances --instance-ids <instance-id>
  ```
- [ ] Test production still works
- [ ] Wait 24 hours
- [ ] Terminate EC2 instance
  ```bash
  aws ec2 terminate-instances --instance-ids <instance-id>
  ```
- [ ] Delete associated resources:
  - [ ] Elastic IP (if any)
  - [ ] Security groups (if unused)
  - [ ] Load balancers (if any)
  - [ ] Old Route 53 records pointing to EC2

### 8.3 Update Documentation

- [ ] Update README.md with new deployment info
- [ ] Archive old deployment docs
- [ ] Update team wiki/docs (if applicable)
- [ ] Document any gotchas encountered

### 8.4 Restore DNS TTL

- [ ] Increase TTL back to 3600 (1 hour) or 86400 (24 hours)
- [ ] Apply change in Route 53

## Phase 9: Post-Migration

### 9.1 Cost Monitoring

- [ ] Set up AWS budget alert ($10/month)
- [ ] Enable cost anomaly detection
- [ ] Review first month's costs
- [ ] Compare to old EC2 costs
- [ ] Expected savings: ~$26/month

### 9.2 Monitoring Setup

- [ ] Set up CloudWatch dashboard for CloudFront
- [ ] Configure SNS alerts for errors
- [ ] Set up GitHub Actions failure notifications (email/Slack)
- [ ] Document monitoring procedures

### 9.3 Team Training

- [ ] Document deployment workflow for team
- [ ] Create runbook for common operations
- [ ] Document rollback procedures
- [ ] Schedule knowledge transfer session (if applicable)

## Rollback Procedures

### If Issues Found During Staging

- [ ] Do NOT proceed to production
- [ ] Investigate and fix issues
- [ ] Redeploy to staging
- [ ] Re-test thoroughly

### If Issues Found During Production

**Within first hour:**

- [ ] Revert DNS to old EC2 IP (if EC2 still running)
- [ ] Or rollback via Git revert and redeploy

**After first hour:**

- [ ] Identify specific failing app(s)
- [ ] Rollback those app(s) via S3 versioning
- [ ] Or deploy hotfix via GitHub Actions

**Critical failure:**

- [ ] Use emergency rollback script
- [ ] Deploy previous working version manually
- [ ] Investigate root cause
- [ ] Post-mortem and fix

## Success Criteria

Migration is considered successful when:

- [ ] All 15 apps deployed and accessible
- [ ] Firebase authentication working across all apps
- [ ] Achievements syncing across apps
- [ ] No console errors or major bugs
- [ ] Performance meets or exceeds old site
- [ ] Zero downtime during cutover
- [ ] Costs reduced by ~85%
- [ ] Deployment time reduced from 10+ min to ~4 min per app
- [ ] Team comfortable with new workflow
- [ ] Documentation complete

## Notes

**Migration start date:** `_____________________`

**Staging deployed:** `_____________________`

**Production deployed:** `_____________________`

**EC2 decommissioned:** `_____________________`

**Issues encountered:**
- 
- 
-

**Lessons learned:**
-
-
-

**Total time spent:** `_____________________`

**Cost savings realized:** `_____________________`

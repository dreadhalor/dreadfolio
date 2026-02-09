# Dreadfolio Deployment Guide

This guide covers the deployment of the Dreadfolio portfolio using **AWS CloudFront + S3 + Terraform**.

## Architecture Overview

**Infrastructure:**
- **CloudFront**: CDN for global content delivery with path-based routing
- **S3**: 15 static site buckets (one per app) for staging and production
- **Lambda**: Sudoku API backend
- **Route 53**: DNS management
- **ACM**: SSL certificates
- **IAM**: GitHub Actions deployment role (OIDC)

**CI/CD:**
- **GitHub Actions**: Automated build and deployment
- **Terraform**: Infrastructure as Code

**URL Structure:**
- **Production**: `scottjhetrick.com/*`
- **Staging**: `staging.scottjhetrick.com/*`

All apps are hosted at path-based routes (e.g., `/gifster`, `/fallcrate`) enabling shared Firebase authentication across all apps.

## Prerequisites

### Required Tools

1. **Terraform** >= 1.0
   ```bash
   brew install terraform
   ```

2. **AWS CLI** >= 2.0
   ```bash
   brew install awscli
   aws configure
   ```

3. **Node.js** >= 20 and **pnpm** 8.15.1
   ```bash
   brew install node
   corepack enable
   corepack prepare pnpm@8.15.1 --activate
   ```

### AWS Account Setup

You need:
- AWS account with admin access
- AWS CLI configured with credentials
- Route 53 hosted zone for `scottjhetrick.com`

## Initial Setup

### 1. Create Terraform State Backend

The Terraform state backend stores infrastructure state remotely with locking.

```bash
# Create S3 bucket for state
aws s3api create-bucket \
  --bucket dreadfolio-terraform-state \
  --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket dreadfolio-terraform-state \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket dreadfolio-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name dreadfolio-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 2. Request ACM Certificates

ACM certificates **must** be in `us-east-1` region for CloudFront.

**Staging certificate:**

```bash
aws acm request-certificate \
  --domain-name staging.scottjhetrick.com \
  --validation-method DNS \
  --region us-east-1

# Note the certificate ARN from output
```

**Production certificate:**

```bash
aws acm request-certificate \
  --domain-name scottjhetrick.com \
  --subject-alternative-names "*.scottjhetrick.com" \
  --validation-method DNS \
  --region us-east-1

# Note the certificate ARN from output
```

**Validate certificates:**

1. Get validation records:
   ```bash
   aws acm describe-certificate \
     --certificate-arn <certificate-arn> \
     --region us-east-1 \
     --query 'Certificate.DomainValidationOptions'
   ```

2. Add the CNAME records to Route 53:
   ```bash
   # Via console or CLI
   aws route53 change-resource-record-sets \
     --hosted-zone-id <zone-id> \
     --change-batch file://validation-record.json
   ```

3. Wait for validation (5-30 minutes):
   ```bash
   aws acm wait certificate-validated \
     --certificate-arn <certificate-arn> \
     --region us-east-1
   ```

### 3. Update Terraform Variables

Edit certificate ARNs in:

**`infrastructure/terraform/staging.tfvars`:**
```hcl
certificate_arn = "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID"
```

**`infrastructure/terraform/production.tfvars`:**
```hcl
certificate_arn = "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID"
```

Replace `ACCOUNT_ID` and `CERT_ID` with actual values from step 2.

### 4. Initialize Terraform

```bash
cd infrastructure/terraform
terraform init
```

This will:
- Download AWS provider
- Configure remote state backend
- Prepare modules

### 5. Deploy Staging Infrastructure

```bash
# Plan (see what will be created)
terraform plan -var-file=staging.tfvars

# Apply (create resources)
terraform apply -var-file=staging.tfvars
```

This creates:
- 15 S3 buckets (*-staging)
- 1 CloudFront distribution
- Route 53 DNS record
- IAM role for GitHub Actions
- Origin Access Control

**Save outputs:**

```bash
terraform output > staging-outputs.txt
```

You'll need:
- `cloudfront_distribution_id` for GitHub secrets
- `github_actions_role_arn` for GitHub secrets

### 6. Configure GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets):

**Required for both environments:**
- `AWS_ROLE_ARN`: IAM role ARN from Terraform output
- `STAGING_CLOUDFRONT_ID`: Staging distribution ID
- `PROD_CLOUDFRONT_ID`: Production distribution ID (after prod deployment)

**Build-time environment variables:**
- `VITE_GIPHY_API_KEY`: Giphy API key (for Gifster)
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID`: Firebase app ID
- `VITE_VERCEL_TOKEN`: Vercel token (for deployment features)
- `VITE_SUDOKU_API_URL`: Lambda API URL

**Terraform-specific (for infrastructure workflow):**
- `AWS_TERRAFORM_ROLE_ARN`: IAM role ARN for Terraform operations

### 7. Deploy Lambda API (Sudoku)

The Sudoku API is deployed separately using AWS SAM:

```bash
cd infrastructure/lambda/sudoku-api

# Install dependencies (isolated from monorepo)
pnpm install --ignore-workspace

# Build and package
pnpm build

# Deploy with SAM
sam deploy --guided
```

Follow prompts:
- Stack name: `sudoku-api-prod` or `sudoku-api-staging`
- Region: `us-east-1`
- Confirm changes: Yes

**Save API URL:**

After deployment, note the API Gateway URL and add to GitHub secrets as `VITE_SUDOKU_API_URL`.

## Deployment Workflow

### Standard Workflow

1. **Develop on feature branch**
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git commit -m "Add feature"
   git push origin feature/new-feature
   ```

2. **Merge to staging branch**
   ```bash
   git checkout staging
   git merge feature/new-feature
   git push origin staging
   ```

3. **Automatic deployment to staging**
   - GitHub Actions detects changed apps
   - Builds only changed apps
   - Deploys to S3 staging buckets
   - Invalidates CloudFront paths
   - Test at `staging.scottjhetrick.com/*`

4. **Merge to main for production**
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

5. **Automatic deployment to production**
   - Same process for production buckets
   - Deploys to `scottjhetrick.com/*`

### Manual Deployment

You can manually trigger deployments via GitHub Actions:

1. Go to **Actions** tab in GitHub
2. Select **Deploy to CloudFront** workflow
3. Click **Run workflow**
4. Enter comma-separated app names (or leave empty for all changed)
5. Click **Run workflow**

### Deploy Specific Apps

To deploy specific apps without waiting for changes:

```bash
# Via GitHub Actions UI
# Workflow: Deploy to CloudFront
# Input: gifster,fallcrate,minesweeper
```

Or push changes to specific app directories.

## Selective Deployment

The deployment system is smart about which apps to build:

**Triggers:**
- Changes in `apps/{app-name}/**` → Deploy that app only
- Changes in `packages/**` → Deploy all apps (shared dependencies)
- Manual trigger with app list → Deploy specified apps

**Benefits:**
- Fast deploys (~4 min for single app vs 20+ min for all)
- Parallel builds via GitHub Actions matrix
- Cost-effective (only invalidate changed paths)

**Example:**

```
Commit touches: apps/gifster/src/App.tsx
Result: Only gifster is built and deployed
Time: ~4 minutes
```

## App URL Structure

All apps are available at path-based routes:

**Production (`scottjhetrick.com`):**
```
/                         → portfolio (main app switcher)
/home/                    → home-page
/camera-tricks/           → camera-tricks-demo
/gifster/                 → gifster
/fallcrate/               → fallcrate
/shareme/                 → shareme
/su-done-ku/              → su-done-ku
/sketches/                → p5 sketches
/resume/                  → resume
/ascii-video/             → ascii-video
/steering-text/           → steering-text
/minesweeper/             → minesweeper
/pathfinder-visualizer/   → pathfinder-visualizer
/enlight/                 → enlight
/quipster/                → quipster
```

**Staging** has identical structure at `staging.scottjhetrick.com/*`

### Shared Authentication

Because all apps share the same origin domain, Firebase authentication and achievements work across all apps seamlessly.

Apps with achievements:
- home-page
- minesweeper
- pathfinder-visualizer
- shareme
- fallcrate
- su-done-ku
- gifster

## Infrastructure Management

### View Current Infrastructure

```bash
cd infrastructure/terraform

# List all resources
terraform state list

# Show specific resource
terraform state show module.app_buckets[\"gifster\"].aws_s3_bucket.app

# View outputs
terraform output
terraform output cloudfront_distribution_id
```

### Update Infrastructure

```bash
# Make changes to .tf files

# Plan changes
terraform plan -var-file=staging.tfvars

# Apply changes
terraform apply -var-file=staging.tfvars
```

### Add a New App

1. **Update Terraform variables:**

   Edit `infrastructure/terraform/variables.tf`:
   ```hcl
   variable "apps" {
     default = [
       # ... existing apps
       { name = "new-app", path = "/new-app/" }
     ]
   }
   ```

2. **Apply Terraform:**
   ```bash
   terraform apply -var-file=staging.tfvars
   ```

3. **Configure app's `vite.config.ts`:**
   ```typescript
   export default defineConfig({
     base: '/new-app/',
     // ... other config
   });
   ```

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Add new-app"
   git push origin staging
   ```

### Remove an App

1. Remove from `variables.tf` apps list
2. Run `terraform apply`
3. Manually delete S3 bucket contents:
   ```bash
   aws s3 rm s3://app-name-staging --recursive
   aws s3 rm s3://app-name-prod --recursive
   ```

## Troubleshooting

### Certificate Validation Stuck

**Problem:** ACM certificate stuck in "Pending validation"

**Solution:**
```bash
# Check validation records
aws acm describe-certificate \
  --certificate-arn <arn> \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions'

# Verify DNS records exist in Route 53
aws route53 list-resource-record-sets \
  --hosted-zone-id <zone-id> \
  --query "ResourceRecordSets[?Type=='CNAME']"
```

### Build Failures

**Problem:** pnpm build fails in GitHub Actions

**Solution:**
```bash
# Test locally first
pnpm install
pnpm build --filter=app-name

# Check for missing environment variables
# Add to GitHub secrets if needed
```

### CloudFront Cache Not Updating

**Problem:** Changes deployed but old content still showing

**Solution:**
```bash
# Manually invalidate entire distribution
aws cloudfront create-invalidation \
  --distribution-id <dist-id> \
  --paths "/*"

# Check invalidation status
aws cloudfront get-invalidation \
  --distribution-id <dist-id> \
  --id <invalidation-id>
```

**Note:** `index.html` has `cache-control: no-cache` so should update immediately. If not, check S3 file metadata.

### SPA Routes Return 404

**Problem:** `/app/route` returns 404 instead of serving app

**Solution:**
1. Verify CloudFront custom error responses are configured (404 → 200, `/index.html`)
2. Check app's `vite.config.ts` has correct `base` path
3. Test build locally:
   ```bash
   pnpm build --filter=app-name
   cd apps/app-name/dist
   python3 -m http.server 8000
   # Visit http://localhost:8000/app-name/
   ```

### Permission Denied in GitHub Actions

**Problem:** AWS permissions errors during deployment

**Solution:**
```bash
# Verify IAM role ARN in GitHub secrets matches Terraform output
terraform output github_actions_role_arn

# Check IAM role trust policy includes GitHub OIDC
aws iam get-role --role-name dreadfolio-github-actions-deploy

# Verify IAM policies attached to role
aws iam list-attached-role-policies \
  --role-name dreadfolio-github-actions-deploy
```

### Terraform State Locked

**Problem:** `terraform apply` fails with "state locked"

**Solution:**
```bash
# Check who has the lock
aws dynamodb get-item \
  --table-name dreadfolio-terraform-locks \
  --key '{"LockID": {"S": "dreadfolio-terraform-state/terraform.tfstate"}}'

# Force unlock (only if you're sure no one else is running terraform)
terraform force-unlock <lock-id>
```

## Cost Optimization

### Current Costs

**Estimated monthly costs:**
- CloudFront (staging + prod): ~$3.00
- S3 storage (30 buckets): ~$0.70
- Route 53 hosted zone: $0.50
- Lambda (Sudoku API): ~$0.20
- Data transfer: ~$0.50
- **Total: ~$4.90/month**

**Savings:** ~$26/month vs previous EC2 setup ($31/month)

### Optimization Tips

1. **CloudFront caching:**
   - Assets cached for 1 year (31536000s)
   - Only invalidate changed paths
   - Use versioned filenames (Vite does this automatically)

2. **S3 lifecycle:**
   - Old versions deleted after 30 days
   - Reduces storage costs

3. **GitHub Actions:**
   - Selective builds save minutes
   - Use cache for node_modules
   - Free tier: 2000 minutes/month

## Rollback Procedure

### Rollback via S3 Versioning

```bash
# List versions
aws s3api list-object-versions \
  --bucket app-name-prod \
  --prefix index.html

# Copy previous version to current
aws s3api copy-object \
  --bucket app-name-prod \
  --copy-source app-name-prod/index.html?versionId=<version-id> \
  --key index.html

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id <dist-id> \
  --paths "/app-name/*"
```

### Rollback via Git Revert

```bash
# Revert commit
git revert <commit-hash>
git push origin main

# GitHub Actions will auto-deploy reverted version
```

### Emergency Rollback (Manual)

```bash
# Build previous version locally
git checkout <previous-commit>
pnpm install
pnpm build --filter=app-name

# Upload to S3
aws s3 sync apps/app-name/dist/ s3://app-name-prod/ --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id <dist-id> \
  --paths "/app-name/*"
```

## Security

### IAM Role Best Practices

- ✅ OIDC authentication (no long-lived keys)
- ✅ Principle of least privilege (S3 + CloudFront only)
- ✅ Scoped to specific repository
- ✅ Separate role for Terraform operations

### S3 Bucket Security

- ✅ All buckets private (no public access)
- ✅ CloudFront OAC (Origin Access Control)
- ✅ Encryption at rest (AES256)
- ✅ Versioning enabled (for rollbacks)

### CloudFront Security

- ✅ HTTPS only (HTTP → HTTPS redirect)
- ✅ TLS 1.2+ enforced
- ✅ Custom SSL certificates (not default)
- ✅ Geographic restrictions: none (global access)

### Secrets Management

- ✅ GitHub Secrets (encrypted at rest)
- ✅ No secrets in code or Terraform files
- ✅ Build-time environment variables only
- ✅ Firebase API keys restricted to domains

## Monitoring

### CloudFront Metrics

View in AWS Console → CloudFront → Distribution → Monitoring

Key metrics:
- **Requests**: Total requests per minute
- **Bytes downloaded**: Bandwidth usage
- **Error rate**: 4xx/5xx errors
- **Cache hit rate**: % of requests served from cache

### GitHub Actions Logs

View in GitHub → Actions → Workflow runs

Includes:
- Build output
- Deployment logs
- CloudFront invalidation status
- S3 sync details

### Cost Monitoring

View in AWS Console → Cost Management → Cost Explorer

Set up:
- Budget alerts ($10/month threshold)
- Cost anomaly detection
- Monthly cost reports

## Maintenance

### Regular Tasks

**Weekly:**
- Review GitHub Actions logs for failures
- Check CloudFront cache hit rate
- Monitor AWS costs

**Monthly:**
- Review S3 storage usage
- Check for unused resources
- Update Terraform provider versions

**Quarterly:**
- Audit IAM permissions
- Review CloudFront behaviors
- Test rollback procedures
- Update Node.js/pnpm versions

### Updating Dependencies

```bash
# Update all packages
pnpm update --recursive

# Test locally
pnpm build

# Deploy to staging first
git push origin staging
# Test thoroughly
git push origin main
```

## Production Deployment Checklist

Before deploying to production for the first time:

- [ ] Terraform backend created and configured
- [ ] ACM certificates validated
- [ ] Staging environment tested end-to-end
- [ ] All apps tested in staging
- [ ] Firebase authentication working in staging
- [ ] GitHub secrets configured for production
- [ ] Backup current production site
- [ ] DNS TTL lowered (24h before cutover)
- [ ] Production Terraform applied
- [ ] All apps deployed to production
- [ ] Smoke tests passed
- [ ] SSL certificate verified
- [ ] Performance tested (Lighthouse)
- [ ] Monitoring configured
- [ ] Rollback procedure documented

## Additional Resources

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [Vite Base Path](https://vitejs.dev/guide/build.html#public-base-path)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

## Support

For issues:
1. Check this documentation
2. Review Terraform module READMEs in `infrastructure/terraform/`
3. Check GitHub Actions logs
4. Review AWS CloudWatch logs
5. Consult AWS documentation

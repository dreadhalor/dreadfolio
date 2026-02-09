# Dreadfolio Terraform Infrastructure

This directory contains Terraform configuration for deploying the Dreadfolio portfolio to AWS using CloudFront + S3.

## Architecture

- **CloudFront**: CDN with path-based routing
- **S3**: Static file storage (one bucket per app)
- **Route 53**: DNS management
- **ACM**: SSL certificates
- **IAM**: GitHub Actions deployment role (OIDC)

## Prerequisites

1. **Terraform** >= 1.0 installed
2. **AWS CLI** configured with credentials
3. **ACM Certificates** created for domains (see below)
4. **Terraform State Backend** (S3 bucket + DynamoDB table)

## Initial Setup

### 1. Create Terraform State Backend

```bash
# Create S3 bucket for Terraform state
aws s3api create-bucket \
  --bucket dreadfolio-terraform-state \
  --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket dreadfolio-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name dreadfolio-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 2. Request ACM Certificates

ACM certificates must be in **us-east-1** region for CloudFront.

**Staging:**

```bash
aws acm request-certificate \
  --domain-name staging.scottjhetrick.com \
  --validation-method DNS \
  --region us-east-1

# Get certificate ARN from output
# Add DNS validation records in Route 53
```

**Production:**

```bash
aws acm request-certificate \
  --domain-name scottjhetrick.com \
  --subject-alternative-names "*.scottjhetrick.com" \
  --validation-method DNS \
  --region us-east-1

# Get certificate ARN from output
# Add DNS validation records in Route 53
```

### 3. Update tfvars Files

Edit the certificate ARNs in:
- `staging.tfvars`
- `production.tfvars`

Replace `ACCOUNT_ID` and `CERTIFICATE_ID` with actual values.

## Deployment

### Initialize Terraform

```bash
cd infrastructure/terraform
terraform init
```

### Deploy Staging Environment

```bash
# Plan changes
terraform plan -var-file=staging.tfvars

# Apply changes
terraform apply -var-file=staging.tfvars
```

This creates:
- 15 S3 buckets (*-staging)
- 1 CloudFront distribution
- Route 53 DNS record
- IAM role for GitHub Actions

### Deploy Production Environment

```bash
# Plan changes
terraform plan -var-file=production.tfvars

# Apply changes
terraform apply -var-file=production.tfvars
```

### Get Outputs

```bash
# View all outputs
terraform output

# Get specific output
terraform output cloudfront_distribution_id
terraform output github_actions_role_arn
```

## Configuration

### Adding a New App

1. **Add to variables.tf:**

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
terraform apply -var-file=production.tfvars
```

This creates:
- New S3 bucket: `new-app-prod`
- New CloudFront cache behavior: `/new-app/*`

3. **Deploy app via GitHub Actions** (automatic on push)

### Removing an App

1. Remove from `variables.tf` apps list
2. Run `terraform apply`
3. Manually delete S3 bucket contents if needed

## Modules

### s3-app-bucket

Creates S3 bucket for hosting a single app with:
- Versioning enabled (for rollbacks)
- Public access blocked (CloudFront OAC only)
- Lifecycle policy (delete old versions after 30 days)
- Bucket policy allowing CloudFront access

### cloudfront

Creates CloudFront distribution with:
- Multiple origins (one per S3 bucket)
- Path-based routing via ordered cache behaviors
- Custom error responses (SPA fallback)
- SSL certificate
- Compression enabled

### github-actions-iam

Creates IAM resources for GitHub Actions:
- OIDC provider for GitHub
- IAM role with temporary credentials
- Policies for S3 upload and CloudFront invalidation

## Terraform State Management

**State location:** `s3://dreadfolio-terraform-state/terraform.tfstate`

**State locking:** DynamoDB table `dreadfolio-terraform-locks`

**Why remote state:**
- Team collaboration (if needed)
- State history and versioning
- Prevents concurrent modifications
- Secure storage with encryption

## Cost Estimates

**Staging environment:**
- CloudFront: ~$1.50/month
- S3 storage: ~$0.35/month
- Route 53 record: $0
- **Total: ~$1.85/month**

**Production environment:**
- CloudFront: ~$1.50/month
- S3 storage: ~$0.35/month
- Route 53 hosted zone: $0.50/month
- **Total: ~$2.35/month**

**Combined: ~$4.20/month**

## Maintenance

### Update Infrastructure

```bash
# Make changes to .tf files
# Plan to see what will change
terraform plan -var-file=staging.tfvars

# Apply changes
terraform apply -var-file=staging.tfvars
```

### View Current State

```bash
# List all resources
terraform state list

# Show specific resource
terraform state show module.app_buckets[\"gifster\"].aws_s3_bucket.app
```

### Destroy Infrastructure (careful!)

```bash
# Destroy staging
terraform destroy -var-file=staging.tfvars

# Destroy production
terraform destroy -var-file=production.tfvars
```

## Troubleshooting

### Certificate Issues

**Problem:** Certificate ARN invalid or not found

**Solution:**
```bash
# List certificates in us-east-1
aws acm list-certificates --region us-east-1

# Verify certificate is issued (not pending)
aws acm describe-certificate --certificate-arn <arn> --region us-east-1
```

### S3 Bucket Already Exists

**Problem:** Bucket name conflict

**Solution:** S3 bucket names are globally unique. If bucket exists:
1. Check if it's yours: `aws s3 ls s3://bucket-name`
2. Import existing bucket: `terraform import module.app_buckets[\"app\"].aws_s3_bucket.app bucket-name`
3. Or choose different naming scheme in variables

### CloudFront Deployment Slow

**Normal:** CloudFront distributions take 10-30 minutes to fully deploy.

**Check status:**
```bash
aws cloudfront get-distribution --id <distribution-id> --query 'Distribution.Status'
```

Wait for status: `Deployed`

### Permission Errors

**Problem:** GitHub Actions can't deploy

**Solution:**
1. Verify IAM role ARN in GitHub secrets
2. Check IAM policies include required permissions
3. Verify OIDC trust relationship allows your repo

## Security

- **S3 buckets**: Private, CloudFront OAC only
- **IAM**: OIDC temporary credentials (no long-lived keys)
- **SSL**: TLS 1.2+ enforced
- **HTTPS**: Automatic redirect from HTTP
- **State**: Encrypted in S3

## Additional Resources

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [CloudFront Terraform Module](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudfront_distribution)
- [S3 Terraform Module](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket)

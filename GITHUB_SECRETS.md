# GitHub Secrets Configuration

Add these secrets to your GitHub repository: `https://github.com/dreadhalor/dreadfolio/settings/secrets/actions`

## AWS Deployment Secrets

```
AWS_ROLE_ARN = arn:aws:iam::851725492026:role/dreadfolio-github-actions-deploy
STAGING_CLOUDFRONT_ID = E1RAIZQJ35RLQQ
AWS_TERRAFORM_ROLE_ARN = arn:aws:iam::851725492026:role/dreadfolio-github-actions-deploy
```

## Build Environment Variables

You need to add these from your existing `.env` file or Firebase console:

```
VITE_GIPHY_API_KEY = (from your .env)
VITE_FIREBASE_API_KEY = (from Firebase console)
VITE_FIREBASE_AUTH_DOMAIN = (from Firebase console)
VITE_FIREBASE_PROJECT_ID = (from Firebase console)
VITE_FIREBASE_STORAGE_BUCKET = (from Firebase console)
VITE_FIREBASE_MESSAGING_SENDER_ID = (from Firebase console)
VITE_FIREBASE_APP_ID = (from Firebase console)
VITE_VERCEL_TOKEN = (from Vercel dashboard - if needed)
VITE_SUDOKU_API_URL = https://isvllixfsd.execute-api.us-east-1.amazonaws.com/staging/random
```

## Instructions

1. Go to: https://github.com/dreadhalor/dreadfolio/settings/secrets/actions
2. Click "New repository secret" for each secret above
3. Copy/paste the values exactly as shown
4. For VITE_* environment secrets (Firebase, Giphy, Vercel), get values from your local `.env` file or service dashboards

## Production Secrets (Add Later)

After deploying production infrastructure:
```
PROD_CLOUDFRONT_ID = (from production terraform output)
VITE_SUDOKU_API_URL_PROD = (from production Lambda deployment)
```

---

## Quick Actions

Install GitHub CLI to add secrets programmatically:
```bash
brew install gh
gh auth login
gh secret set AWS_ROLE_ARN --body "arn:aws:iam::851725492026:role/dreadfolio-github-actions-deploy"
# etc...
```

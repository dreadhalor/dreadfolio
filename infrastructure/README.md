# Dreadfolio Infrastructure

This directory contains infrastructure-as-code and deployment scripts for the Dreadfolio portfolio.

## Directory Structure

```
infrastructure/
├── lambda/
│   └── sudoku-api/          # Lambda function for su-done-ku API
│       ├── index.ts         # Lambda handler
│       ├── package.json     # Dependencies
│       ├── template.yaml    # SAM template
│       ├── tsconfig.json    # TypeScript config
│       ├── puzzles/         # Puzzle data files
│       └── README.md        # Deployment docs
│
└── scripts/
    ├── create-amplify-apps.sh   # Create all Amplify apps
    └── setup-route53.sh         # Configure DNS
```

## Quick Start

### 1. Deploy Lambda API

```bash
cd lambda/sudoku-api
pnpm install
pnpm build
sam deploy --guided
```

### 2. Create Amplify Apps

```bash
cd ../scripts
./create-amplify-apps.sh
```

### 3. Configure Domains

```bash
./setup-route53.sh
```

## Components

### Lambda Functions

- **sudoku-api**: REST API for serving random Sudoku puzzles
  - Runtime: Node.js 20.x
  - Memory: 256 MB
  - Cost: ~$0.20/month for typical usage

### Amplify Apps

15 static web applications hosted on AWS Amplify:

1. **camera-tricks-demo** - Main 3D gallery showcase
2. **portfolio-frontend** - Landing page
3. **home-page** - Original homepage
4. **sketches** - P5.js sketches collection
5. **resume** - Interactive resume
6. **ascii-video** - Matrix-style camera effect
7. **steering-text** - Text steering visualization
8. **minesweeper** - Minesweeper game
9. **pathfinder-visualizer** - Pathfinding algorithm visualizer
10. **enlight** - Lighting game
11. **gifster** - GIF search and sharing
12. **quipster** - Quote management app
13. **su-done-ku** - Sudoku game (frontend)
14. **fallcrate** - File management app
15. **shareme** - Image sharing platform

### Scripts

- **create-amplify-apps.sh**: Automates creation of all 15 Amplify apps
- **setup-route53.sh**: Configures Route 53 for staging subdomain

## Architecture

```
GitHub Repo → Amplify (15 apps) → CloudFront CDN → Route 53
                                         ↓
                                   scottjhetrick.com
                                   staging.scottjhetrick.com

GitHub Repo → Lambda + API Gateway
                  ↓
            su-done-ku API
```

## Deployment Process

See [DEPLOYMENT.md](../DEPLOYMENT.md) in the root directory for the complete deployment guide.

### Summary:

1. **Phase 1**: Deploy Lambda API
2. **Phase 2**: Create Amplify apps
3. **Phase 3**: Configure environment variables
4. **Phase 4**: Setup custom domains
5. **Phase 5**: Configure branch strategy
6. **Phase 6**: Test staging deployment
7. **Phase 7**: Production cutover
8. **Phase 8**: Decommission old infrastructure

## Monitoring

- **Amplify Console**: Build logs and deployment history
- **CloudWatch Logs**: Lambda execution logs
- **CloudWatch Metrics**: API Gateway and Lambda metrics
- **Route 53 Console**: DNS health checks

## Cost Estimates

| Component | Monthly Cost |
|-----------|--------------|
| Amplify Hosting (15 apps) | ~$30 |
| Lambda | ~$0.20 |
| API Gateway | ~$0.50 |
| Route 53 | $0.50 |
| **Total** | **~$31** |

## Troubleshooting

### Lambda Deployment Issues

```bash
# Check SAM version
sam --version

# Validate template
sam validate --template template.yaml

# View logs
sam logs --stack-name sudoku-api-staging --tail
```

### Amplify Build Issues

```bash
# Test build locally
cd apps/[app-name]
pnpm install
pnpm build

# Check build logs in Amplify Console
# → App → Deployments → View logs
```

### DNS Issues

```bash
# Check DNS propagation
dig staging.scottjhetrick.com
dig scottjhetrick.com

# Check Route 53 records
aws route53 list-resource-record-sets \
  --hosted-zone-id <zone-id>
```

## Security

- **API Authentication**: Currently public (sudoku-api)
  - Can add API key via API Gateway if needed
- **HTTPS**: Enforced by Amplify and API Gateway
- **Secrets**: Managed via AWS Amplify environment variables
- **IAM**: Lambda execution role with minimal permissions

## Maintenance

### Update Lambda Function

```bash
cd lambda/sudoku-api
pnpm build
sam deploy
```

### Update Amplify App

Changes are automatically deployed when pushing to GitHub:

```bash
git push origin staging    # Deploys to staging
git push origin main       # Deploys to production
```

### Rollback

**Amplify**:
- Console → App → Deployments → Redeploy previous version

**Lambda**:
```bash
aws lambda update-function-code \
  --function-name sudoku-api-staging \
  --zip-file fileb://previous-version.zip
```

## Additional Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [Route 53 Documentation](https://docs.aws.amazon.com/route53/)

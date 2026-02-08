pnpm # Sudoku API Lambda Function

This Lambda function replaces the Express backend endpoint for serving random Sudoku puzzles.

## Architecture

- **Runtime**: Node.js 20.x
- **Memory**: 256 MB
- **Timeout**: 10 seconds
- **API**: REST API via API Gateway

## Local Development

### Prerequisites

- AWS CLI configured with credentials
- AWS SAM CLI installed (`brew install aws-sam-cli`)
- Node.js 20+ and pnpm 8.15.1+

### Install Dependencies

The Lambda function has its own isolated dependencies (separate from the monorepo):

```bash
cd infrastructure/lambda/sudoku-api

# Install dependencies independently (ignore workspace)
pnpm install --ignore-workspace
```

**Note**: We use `--ignore-workspace` because this Lambda function needs its own `node_modules` with AWS-specific dependencies.

### Build the Function

```bash
pnpm build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

This compiles TypeScript to JavaScript in the `dist/` directory.

### Test Locally

Start the local API Gateway:

```bash
sam local start-api
```

Then test the endpoint:

```bash
# Get random puzzle (any difficulty)
curl http://localhost:3000/random

# Get easy puzzle
curl "http://localhost:3000/random?difficulty=easy"

# Get medium puzzle
curl "http://localhost:3000/random?difficulty=medium"

# Get hard puzzle
curl "http://localhost:3000/random?difficulty=hard"
```

## Deployment

### Staging Environment

```bash
# Build and package
pnpm build

# Deploy to staging
sam deploy \
  --template-file template.yaml \
  --stack-name sudoku-api-staging \
  --parameter-overrides Environment=staging \
  --capabilities CAPABILITY_IAM \
  --region us-east-1
```

### Production Environment

```bash
# Deploy to production
sam deploy \
  --template-file template.yaml \
  --stack-name sudoku-api-production \
  --parameter-overrides Environment=production \
  --capabilities CAPABILITY_IAM \
  --region us-east-1
```

### Get API URL

After deployment, get the API Gateway URL:

```bash
aws cloudformation describe-stacks \
  --stack-name sudoku-api-staging \
  --query 'Stacks[0].Outputs[?OutputKey==`SudokuApiUrl`].OutputValue' \
  --output text
```

## Update Frontend Configuration

After deploying the Lambda, update the su-done-ku frontend to use the new API URL:

1. Open `apps/su-done-ku/frontend/src/config.ts` (or wherever API URL is configured)
2. Update the API URL to the Lambda endpoint
3. Commit and deploy the frontend

Example:

```typescript
// Before (Express backend)
const API_URL = 'https://scottjhetrick.com/su-done-ku/api/random';

// After (Lambda)
const API_URL = 'https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/staging/random';
```

## Monitoring

View logs in CloudWatch:

```bash
sam logs --stack-name sudoku-api-staging --tail
```

## Cost Estimate

Based on typical usage:
- 1,000 requests/month: ~$0.20/month
- 10,000 requests/month: ~$2.00/month

AWS Lambda Free Tier includes:
- 1M requests/month
- 400,000 GB-seconds of compute time/month

## API Response Format

```json
{
  "difficulty": "easy",
  "puzzle": {
    "sha": "abc123...",
    "rating": "1500",
    "puzzle": "4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......"
  }
}
```

## Cleanup

To delete the stack:

```bash
sam delete --stack-name sudoku-api-staging
```

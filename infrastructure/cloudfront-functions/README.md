# CloudFront Functions

This directory contains CloudFront Functions for request/response manipulation at the edge.

## spa-rewrite.js

**Purpose:** Enable SPA (Single Page Application) routing for React apps.

**Problem it solves:**
- When users navigate to `/gifster/settings` directly (or refresh), CloudFront would normally return a 404 because `/gifster/settings` doesn't exist as a file in S3
- The app needs to serve `/gifster/index.html` so React Router can handle the client-side routing

**How it works:**
1. Intercepts requests at the CloudFront edge
2. Checks if the URI has a file extension (`.js`, `.css`, etc.)
3. If no extension, assumes it's a client-side route
4. Rewrites the request to serve `index.html` from the app's base path
5. Preserves the original URL so React Router can handle routing

**Example transformations:**
- `/gifster` → `/gifster/index.html`
- `/gifster/` → `/gifster/index.html`
- `/gifster/settings` → `/gifster/index.html`
- `/gifster/assets/main.js` → `/gifster/assets/main.js` (unchanged)

## Deployment

This function is deployed via Terraform in the CloudFront module. It's attached to the `viewer-request` event for each cache behavior.

**Manual deployment (if needed):**

1. Create the function in AWS Console:
   - Go to CloudFront → Functions
   - Create function
   - Copy contents of `spa-rewrite.js`
   - Publish

2. Associate with distribution:
   - Go to CloudFront distribution
   - Edit behavior
   - Function associations → Viewer request
   - Select the function

**Via Terraform:**

The function is automatically created and associated when you run:

```bash
terraform apply -var-file=staging.tfvars
```

## Testing

CloudFront Functions can be tested in the AWS Console:

1. Go to CloudFront → Functions → spa-rewrite
2. Click "Test" tab
3. Enter test event:

```json
{
  "request": {
    "uri": "/gifster/settings",
    "method": "GET"
  }
}
```

4. Verify output URI is `/gifster/index.html`

## Limitations

- CloudFront Functions are lightweight (< 10KB, < 1ms execution)
- No network or file I/O
- Limited to JavaScript ES5
- Cannot modify response body

For more complex logic, use Lambda@Edge instead.

## Alternative Approach

Instead of using CloudFront Functions, you can use CloudFront custom error responses:

```hcl
custom_error_response {
  error_code         = 404
  response_code      = 200
  response_page_path = "/index.html"
}
```

However, this approach:
- Requires an actual 404 error (slower)
- Less flexible for multi-app routing
- Can't preserve specific paths

CloudFront Functions are recommended for SPA routing.

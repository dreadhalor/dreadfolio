output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = module.cloudfront.distribution_id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = module.cloudfront.distribution_domain_name
}

output "s3_buckets" {
  description = "Map of app names to S3 bucket names"
  value       = { for k, v in module.app_buckets : k => v.bucket_name }
}

output "github_actions_role_arn" {
  description = "ARN of the IAM role for GitHub Actions"
  value       = module.github_actions_iam.role_arn
}

output "website_url" {
  description = "URL of the deployed website"
  value       = "https://${var.domain_name}"
}

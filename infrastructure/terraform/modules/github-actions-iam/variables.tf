variable "github_repo" {
  description = "GitHub repository in format: owner/repo"
  type        = string
  default     = "dreadhalor/dreadfolio"
}

variable "cloudfront_distributions" {
  description = "List of CloudFront distribution ARNs"
  type        = list(string)
}

variable "s3_bucket_arns" {
  description = "List of S3 bucket ARNs for deployment"
  type        = list(string)
}

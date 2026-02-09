variable "environment" {
  description = "Environment (staging or prod)"
  type        = string
}

variable "domain_name" {
  description = "Primary domain name (e.g., scottjhetrick.com or staging.scottjhetrick.com)"
  type        = string
}

variable "apps" {
  description = "Map of apps with their S3 bucket info and paths"
  type = map(object({
    bucket_regional_domain_name = string
    bucket_arn                  = string
    path                        = string
  }))
}

variable "certificate_arn" {
  description = "ARN of the ACM SSL certificate"
  type        = string
}

variable "price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100" # Use only North America and Europe
}

variable "enable_ipv6" {
  description = "Enable IPv6 for CloudFront"
  type        = bool
  default     = true
}

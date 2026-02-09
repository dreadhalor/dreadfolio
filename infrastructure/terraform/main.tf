terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Dreadfolio"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Create S3 buckets for each app
module "app_buckets" {
  source   = "./modules/s3-app-bucket"
  for_each = { for app in var.apps : app.name => app }

  app_name    = each.value.name
  environment = var.environment
}

# Create CloudFront distribution
module "cloudfront" {
  source = "./modules/cloudfront"

  environment     = var.environment
  domain_name     = var.domain_name
  certificate_arn = var.certificate_arn

  apps = {
    for app in var.apps : app.name => {
      bucket_regional_domain_name = module.app_buckets[app.name].bucket_regional_domain_name
      bucket_arn                  = module.app_buckets[app.name].bucket_arn
      path                        = app.path
    }
  }

  depends_on = [module.app_buckets]
}

# Create IAM role for GitHub Actions
module "github_actions_iam" {
  source = "./modules/github-actions-iam"

  github_repo              = "dreadhalor/dreadfolio"
  cloudfront_distributions = [module.cloudfront.distribution_arn]
  s3_bucket_arns          = [for bucket in module.app_buckets : bucket.bucket_arn]
}

# Route 53 DNS record
data "aws_route53_zone" "main" {
  name = "scottjhetrick.com"
}

resource "aws_route53_record" "cloudfront" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = module.cloudfront.distribution_domain_name
    zone_id                = module.cloudfront.distribution_hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "cloudfront_ipv6" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "AAAA"

  alias {
    name                   = module.cloudfront.distribution_domain_name
    zone_id                = module.cloudfront.distribution_hosted_zone_id
    evaluate_target_health = false
  }
}

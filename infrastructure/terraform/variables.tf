variable "environment" {
  description = "Environment name (staging or prod)"
  type        = string
  validation {
    condition     = contains(["staging", "prod"], var.environment)
    error_message = "Environment must be either 'staging' or 'prod'."
  }
}

variable "domain_name" {
  description = "Primary domain name for this environment"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate for the domain"
  type        = string
}

variable "apps" {
  description = "List of app names to deploy"
  type = list(object({
    name = string
    path = string
  }))
  default = [
    { name = "portfolio", path = "/portfolio/" },
    { name = "camera-tricks-demo", path = "/" },
    { name = "home-page", path = "/home/" },
    { name = "gifster", path = "/gifster/" },
    { name = "fallcrate", path = "/fallcrate/" },
    { name = "shareme", path = "/shareme/" },
    { name = "su-done-ku", path = "/su-done-ku/" },
    { name = "sketches", path = "/sketches/" },
    { name = "resume", path = "/resume/" },
    { name = "ascii-video", path = "/ascii-video/" },
    { name = "steering-text", path = "/steering-text/" },
    { name = "minesweeper", path = "/minesweeper/" },
    { name = "pathfinder-visualizer", path = "/pathfinder-visualizer/" },
    { name = "enlight", path = "/enlight/" },
    { name = "quipster", path = "/quipster/" }
  ]
}

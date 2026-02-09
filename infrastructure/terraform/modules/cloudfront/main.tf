resource "aws_cloudfront_origin_access_control" "default" {
  name                              = "dreadfolio-oac-${var.environment}"
  description                       = "Origin Access Control for Dreadfolio ${var.environment}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Function for path rewriting
resource "aws_cloudfront_function" "path_rewrite" {
  name    = "path-rewrite-${var.environment}"
  runtime = "cloudfront-js-2.0"
  comment = "Strips app prefix from URI for path-based routing"
  publish = true
  code    = file("${path.module}/../../../cloudfront-functions/path-rewrite.js")
}

# CloudFront Function for trailing slash redirects
resource "aws_cloudfront_function" "trailing_slash" {
  name    = "trailing-slash-${var.environment}"
  runtime = "cloudfront-js-2.0"
  comment = "Redirects app paths to include trailing slash"
  publish = true
  code    = file("${path.module}/../../../cloudfront-functions/trailing-slash-redirect.js")
}

resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = var.enable_ipv6
  comment             = "Dreadfolio Portfolio - ${var.environment}"
  default_root_object = "index.html"
  price_class         = var.price_class

  aliases = [var.domain_name]

  # Create an origin for each app
  dynamic "origin" {
    for_each = var.apps
    content {
      domain_name              = origin.value.bucket_regional_domain_name
      origin_id                = "S3-${origin.key}"
      origin_access_control_id = aws_cloudfront_origin_access_control.default.id
    }
  }

  # Default cache behavior (camera-tricks-demo at root)
  default_cache_behavior {
    target_origin_id       = "S3-camera-tricks-demo"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400   # 1 day
    max_ttl     = 31536000 # 1 year

    # Associate trailing slash redirect function
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.trailing_slash.arn
    }
  }

  # Ordered cache behaviors for each app path
  dynamic "ordered_cache_behavior" {
    for_each = { for k, v in var.apps : k => v if k != "camera-tricks-demo" }
    content {
      path_pattern           = "${ordered_cache_behavior.value.path}*"
      target_origin_id       = "S3-${ordered_cache_behavior.key}"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true

      forwarded_values {
        query_string = false
        cookies {
          forward = "none"
        }
      }

      min_ttl     = 0
      default_ttl = 86400
      max_ttl     = 31536000

      # Associate path rewrite function
      function_association {
        event_type   = "viewer-request"
        function_arn = aws_cloudfront_function.path_rewrite.arn
      }
    }
  }

  # Custom error responses for SPA routing
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

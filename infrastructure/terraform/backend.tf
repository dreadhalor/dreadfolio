terraform {
  backend "s3" {
    bucket         = "dreadfolio-terraform-state"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "dreadfolio-terraform-locks"
    encrypt        = true
  }
}

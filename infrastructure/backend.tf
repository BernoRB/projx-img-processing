terraform {
  backend "s3" {
    bucket         = "terraform-state-img-processing"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
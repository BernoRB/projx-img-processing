terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Módulos para cada componente de infraestructura
module "s3" {
  source      = "./modules/s3"
  project_name = var.project_name
  environment = var.environment
}

module "dynamodb" {
  source      = "./modules/dynamodb"
  project_name = var.project_name
  environment = var.environment
}

module "sqs" {
  source      = "./modules/sqs"
  project_name = var.project_name
  environment = var.environment
}

module "iam" {
  source             = "./modules/iam"
  project_name       = var.project_name
  environment        = var.environment
  s3_bucket_original = module.s3.bucket_original_name
  s3_bucket_processed = module.s3.bucket_processed_name
  dynamodb_table_arn = module.dynamodb.table_arn
  sqs_queues_arns    = module.sqs.queue_arns
}

module "lambda" {
  source             = "./modules/lambda"
  project_name       = var.project_name
  environment        = var.environment
  lambda_role_arn    = module.iam.lambda_role_arn
  s3_bucket_original = module.s3.bucket_original_name
  s3_bucket_processed = module.s3.bucket_processed_name
  sqs_lambda_queue_url = module.sqs.lambda_queue_url
  sqs_lambda_queue_arn = module.sqs.lambda_queue_arn
  sqs_completion_queue_url = module.sqs.completion_queue_url
}

module "ec2" {
  source                  = "./modules/ec2"
  project_name            = var.project_name
  environment             = var.environment
  aws_region              = var.aws_region
  docker_image_upload     = var.docker_image_upload
  docker_image_processing = var.docker_image_processing
  aws_access_key_id       = var.aws_access_key_id
  aws_secret_access_key   = var.aws_secret_access_key
  s3_bucket_original      = module.s3.bucket_original_name
  s3_bucket_processed     = module.s3.bucket_processed_name
  dynamodb_table_name     = module.dynamodb.table_name
  sqs_processing_queue_url = module.sqs.processing_queue_url
  sqs_processing_queue_arn = module.sqs.processing_queue_arn
  sqs_lambda_queue_url    = module.sqs.lambda_queue_url
  sqs_lambda_queue_arn    = module.sqs.lambda_queue_arn
  sqs_completion_queue_url = module.sqs.completion_queue_url
  sqs_completion_queue_arn = module.sqs.completion_queue_arn
  key_name                = var.key_name
}
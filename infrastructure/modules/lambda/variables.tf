variable "project_name" {
  description = "Name of the project for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment (dev, qa, prod)"
  type        = string
}

variable "lambda_role_arn" {
  description = "ARN of the Lambda execution role"
  type        = string
}

variable "s3_bucket_original" {
  description = "Name of the S3 bucket for original images"
  type        = string
}

variable "s3_bucket_processed" {
  description = "Name of the S3 bucket for processed images"
  type        = string
}

variable "sqs_lambda_queue_url" {
  description = "URL of the SQS lambda queue"
  type        = string
}

variable "sqs_completion_queue_url" {
  description = "URL of the SQS completion queue"
  type        = string
}
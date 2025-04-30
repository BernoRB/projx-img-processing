variable "project_name" {
  description = "Name of the project for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment (dev, qa, prod)"
  type        = string
}

variable "s3_bucket_original" {
  description = "Name of the original images S3 bucket"
  type        = string
}

variable "s3_bucket_processed" {
  description = "Name of the processed images S3 bucket"
  type        = string
}

variable "dynamodb_table_arn" {
  description = "ARN of the DynamoDB table"
  type        = string
}

variable "sqs_queues_arns" {
  description = "ARNs of SQS queues"
  type        = list(string)
}
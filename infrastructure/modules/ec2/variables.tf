variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "ami_id" {
  description = "AMI ID for EC2 instance"
  type        = string
  default     = "ami-0440d3b780d96b29d"  # Amazon Linux 2 AMI (adjust for your region)
}

variable "key_name" {
  description = "SSH key name for EC2 access"
  type        = string
  default     = ""  # You'll need to create and specify a key pair
}

variable "repository_url" {
  description = "Git repository URL for the application"
  type        = string
  default     = "https://github.com/BernoRB/projx-img-processing.git" 
}

variable "s3_bucket_original" {
  description = "Name of S3 bucket for original images"
  type        = string
}

variable "s3_bucket_processed" {
  description = "Name of S3 bucket for processed images"
  type        = string
}

variable "dynamodb_table_name" {
  description = "Name of DynamoDB table"
  type        = string
}

variable "sqs_processing_queue_url" {
  description = "URL of SQS processing queue"
  type        = string
}

variable "sqs_processing_queue_arn" {
  description = "ARN of SQS processing queue"
  type        = string
}

variable "sqs_lambda_queue_url" {
  description = "URL of SQS lambda queue"
  type        = string
}

variable "sqs_lambda_queue_arn" {
  description = "ARN of SQS lambda queue"
  type        = string
}

variable "sqs_completion_queue_url" {
  description = "URL of SQS completion queue"
  type        = string
}

variable "sqs_completion_queue_arn" {
  description = "ARN of SQS completion queue"
  type        = string
}
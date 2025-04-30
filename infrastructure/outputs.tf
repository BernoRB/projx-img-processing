
output "s3_bucket_original" {
  description = "Name of the S3 bucket for original images"
  value       = module.s3.bucket_original_name
}

output "s3_bucket_processed" {
  description = "Name of the S3 bucket for processed images"
  value       = module.s3.bucket_processed_name
}

output "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  value       = module.dynamodb.table_name
}

output "sqs_processing_queue_url" {
  description = "URL of the SQS processing queue"
  value       = module.sqs.processing_queue_url
}

output "sqs_lambda_queue_url" {
  description = "URL of the SQS lambda queue"
  value       = module.sqs.lambda_queue_url
}

output "sqs_completion_queue_url" {
  description = "URL of the SQS completion queue"
  value       = module.sqs.completion_queue_url
}

output "lambda_function_name" {
  description = "Name of the Lambda function for image processing"
  value       = module.lambda.function_name
}
output "processing_queue_url" {
  description = "URL of the SQS processing queue"
  value       = aws_sqs_queue.processing_queue.url
}

output "lambda_queue_url" {
  description = "URL of the SQS lambda queue"
  value       = aws_sqs_queue.lambda_queue.url
}

output "completion_queue_url" {
  description = "URL of the SQS completion queue"
  value       = aws_sqs_queue.completion_queue.url
}

output "queue_arns" {
  description = "ARNs of all SQS queues"
  value = [
    aws_sqs_queue.processing_queue.arn,
    aws_sqs_queue.lambda_queue.arn,
    aws_sqs_queue.completion_queue.arn
  ]
}
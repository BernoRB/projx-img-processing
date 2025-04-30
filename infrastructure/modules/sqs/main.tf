resource "aws_sqs_queue" "processing_queue" {
  name                      = "${var.project_name}-${var.environment}-processing-queue"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
  
  tags = {
    Name        = "${var.project_name}-processing-queue"
    Environment = var.environment
  }
}

resource "aws_sqs_queue" "lambda_queue" {
  name                      = "${var.project_name}-${var.environment}-lambda-queue"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
  
  tags = {
    Name        = "${var.project_name}-lambda-queue"
    Environment = var.environment
  }
}

resource "aws_sqs_queue" "completion_queue" {
  name                      = "${var.project_name}-${var.environment}-completion-queue"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
  
  tags = {
    Name        = "${var.project_name}-completion-queue"
    Environment = var.environment
  }
}
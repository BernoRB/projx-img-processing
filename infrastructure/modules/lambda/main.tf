# Crear un archivo zip para la función Lambda
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../lambda"
  output_path = "${path.module}/lambda_function.zip"
}

# Crear la función Lambda
resource "aws_lambda_function" "image_processor" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.project_name}-${var.environment}-image-processor"
  role             = var.lambda_role_arn
  handler          = "src/index.handler"
  runtime          = "nodejs16.x"
  timeout          = 30
  memory_size      = 1024
  
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = {
      S3_BUCKET_ORIGINAL     = var.s3_bucket_original
      S3_BUCKET_PROCESSED    = var.s3_bucket_processed
      SQS_COMPLETION_QUEUE_URL = var.sqs_completion_queue_url
    }
  }
  
  depends_on = [
    data.archive_file.lambda_zip
  ]

  tags = {
    Name        = "${var.project_name}-image-processor"
    Environment = var.environment
  }
}

# Configurar el trigger SQS para Lambda
resource "aws_lambda_event_source_mapping" "lambda_sqs_trigger" {
  event_source_arn = var.sqs_lambda_queue_arn
  function_name    = aws_lambda_function.image_processor.arn
  batch_size       = 1
}
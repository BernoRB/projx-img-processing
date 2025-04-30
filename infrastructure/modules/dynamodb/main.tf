resource "aws_dynamodb_table" "images" {
  name         = "${var.project_name}-${var.environment}-images"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name        = "${var.project_name}-images"
    Environment = var.environment
  }
}
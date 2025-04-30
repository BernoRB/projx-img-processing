resource "aws_s3_bucket" "original_images" {
  bucket = "${var.project_name}-${var.environment}-original"
  
  tags = {
    Name        = "${var.project_name}-original"
    Environment = var.environment
  }
}

resource "aws_s3_bucket" "processed_images" {
  bucket = "${var.project_name}-${var.environment}-processed"
  
  tags = {
    Name        = "${var.project_name}-processed"
    Environment = var.environment
  }
}

# Configurar acceso público (bloqueado por defecto)
resource "aws_s3_bucket_public_access_block" "original_block" {
  bucket = aws_s3_bucket.original_images.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_public_access_block" "processed_block" {
  bucket = aws_s3_bucket.processed_images.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Configurar CORS para el bucket de imágenes procesadas
resource "aws_s3_bucket_cors_configuration" "processed_cors" {
  bucket = aws_s3_bucket.processed_images.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}
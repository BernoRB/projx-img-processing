output "bucket_original_name" {
  description = "Name of the S3 bucket for original images"
  value       = aws_s3_bucket.original_images.id
}

output "bucket_processed_name" {
  description = "Name of the S3 bucket for processed images"
  value       = aws_s3_bucket.processed_images.id
}
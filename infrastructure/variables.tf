variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project for resource naming"
  type        = string
  default     = "img-processing"
}

variable "environment" {
  description = "Environment (dev, qa, prod)"
  type        = string
  default     = "dev"
}

variable "repository_url" {
  description = "Git repository URL"
  type        = string
  default     = "https://github.com/BernoRB/projx-img-processing.git"
}

variable "key_name" {
  description = "SSH key name for EC2 access"
  type        = string
  default     = "img-processing-key"
}

variable "docker_image_upload" {
  description = "Docker image for upload service"
  type        = string
  default     = "bernorb/img-processing-upload:latest"
}

variable "docker_image_processing" {
  description = "Docker image for processing service"
  type        = string
  default     = "bernorb/img-processing-processing:latest"
}

variable "aws_access_key_id" {
  description = "AWS Access Key ID for services"
  type        = string
  sensitive   = true
}

variable "aws_secret_access_key" {
  description = "AWS Secret Access Key for services"
  type        = string
  sensitive   = true
}
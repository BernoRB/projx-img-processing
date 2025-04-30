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
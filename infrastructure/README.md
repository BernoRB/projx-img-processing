# Terraform Infrastructure for Image Processing

This directory contains the Terraform configuration for the AWS infrastructure required by the image processing system.

## Components

- **S3**: Buckets for original and processed images
- **DynamoDB**: Table for image metadata storage
- **SQS**: Queues for asynchronous processing
- **Lambda**: Function for image processing
- **IAM**: Roles and policies for secure access

## Usage

### Initialize Terraform
terraform init

### Plan the deployment
terraform plan -out=tfplan

### Apply the changes
terraform apply tfplan

### Destroy the infrastructure (when finished)
terraform destroy

## Configuration
You can adjust the configuration by modifying the variables in `variables.tf` or by providing a `.tfvars` file.

## Outputs
After applying the Terraform configuration, you will get the following outputs:
- S3 bucket names
- DynamoDB table name
- SQS queue URLs
- Lambda function name

These values should be used in the service configuration files.
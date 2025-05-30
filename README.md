# Image Processing Microservices System

A cloud microservices architecture for asynchronous image processing deployed on AWS.

## Architecture Overview

![Diagrama de Arquitectura](https://i.postimg.cc/RFGWc4Fd/diagram-export-4-30-2025-8-14-33-PM.png)

This project implements a microservices architecture that processes images asynchronously:

- **Upload Service (NestJS)**: Receives user uploads, stores images in S3, and initiates processing
- **Processing Service (NodeJs + Express)**: Orchestrates the processing workflow through message queues
- **Lambda Function**: Performs CPU-intensive image transformations with Sharp Library
- **AWS Infrastructure**: S3, DynamoDB, SQS for storage, persistence, and communication

### Data Flow
**Upload Stage**:
1. User submits an image and processing operations to Upload Service
2. Upload Service validates the file and parameters
3. Image is stored in S3 Original Bucket
4. Processing request is saved in DynamoDB with status "uploaded"
5. Message is sent to SQS Processing Queue with image ID and operations

**Processing Coordination**:
1. Processing Service monitors SQS Processing Queue
2. Upon receiving a message, updates status in DynamoDB to "processing"
3. Creates a processing task in memory
4. Sends message to SQS Lambda Queue with processing details

**Image Processing:**
1. Lambda function is triggered by SQS Lambda Queue
2. Reads original image from S3 Original Bucket
3. Applies requested transformations using Sharp library
4. Saves processed image to S3 Processed Bucket
5. Sends completion notification to SQS Completion Queue

**Completion Handling:**
1. Processing Service monitors SQS Completion Queue
2. Upon receiving completion message, updates record in DynamoDB: sets status to "completed" with processed image URL

**Result Retrieval:**
1. User queries Upload Service for processing status
2. Upload Service retrieves status from DynamoDB. If processing is complete, returns URLs to processed images.
3. User can access processed images directly from S3

## Services

### Upload Service (NestJS)

- **Endpoints**:
  - `POST /uploads`: Accepts multipart form image uploads with processing operations
  - `GET /status/:id`: Returns current processing status
- **Features**:
  - File validation and sanitization
  - Secure S3 uploads
  - Unique ID generation for job tracking
  - Support for custom image processing operations

### Processing Service (Node + Express)

- **Components**:
  - SQS consumers for processing coordination
  - State management with DynamoDB
  - Processing orchestration layer
- **APIs**:
  - `GET /api/status/:id`: Internal endpoint for status checks

### Lambda Function

- **Capabilities**:
  - Image resizing, optimization and format conversion using Sharp library
  - Allows multiple operations in a single request

## Infrastructure
Infrastructure is defined as code using **Terraform** with modular organization:

- **S3**: Separate buckets for original and processed images
- **DynamoDB**: Tracking processing state and metadata
- **SQS**: Multiple queues for workflow coordination
  - Processing Queue: Initial requests
  - Lambda Queue: Processing instructions
  - Completion Queue: Processing results
- **Lambda**: Serverless processing function with Sharp library
- **EC2**: Hosts containerized microservices
- **IAM**: Least-privilege security policies

## Deployment
The project uses GitHub Actions for CI/CD automation:
- **Infrastructure Pipeline**: Terraform workflow for AWS resource provisioning
- **Application Pipeline**: Docker builds and deployments to EC2

### Deployment Components
1. **Terraform Backend**: S3 bucket for state storage with DynamoDB locking
2. **Docker Images**: Pre-built images hosted on Docker Hub
3. **EC2 Configuration**: Automatic setup with Docker and Docker Compose
4. **Lambda Package**: Auto-compiled with platform-specific dependencies



## Getting Started

This guide provides instructions for complete deployment with AWS infrastructure.

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/bernorb/projx-img-processing.git
   ```

2. **Set up required AWS credentials**:
   - Create an AWS account if you don't have one
   - Create an IAM user with appropriate permissions
   - Configure GitHub repository secrets:
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
     - `AWS_REGION`
     - `EC2_KEY_NAME` (for SSH access)

3. **Build and push Docker images**:
   ```bash
   (Requires DockerHub user logged in)

   # Build images locally
   docker build -t youtDockerHubUser/img-processing-upload:latest ./upload-service
   docker build -t youtDockerHubUser/img-processing-processing:latest ./processing-service
   
   # Push to Docker Hub
   docker push youtDockerHubUser/img-processing-upload:latest
   docker push youtDockerHubUser/img-processing-processing:latest
   ```

4. **Update configuration**:
   - Edit `infrastructure/variables.tf` to update what's needed, including docker img urls
   - Update Docker image names in `infrastructure/modules/ec2/variables.tf` too

5. **Deploy infrastructure**:
   - Trigger the GitHub Action workflow (uncomment the "on" block in .github/workflows/terraform-deploy.yml and push), or run Terraform locally:
   ```bash
   cd infrastructure
   terraform init
   terraform apply
   ```
   This will create all the required resources in AWS.

6. **Configure services with infrastructure outputs**:
    The Terraform deployment will output resource identifiers (S3 buckets, SQS queues, etc.)
    If using GitHub Actions, these outputs are automatically collected and stored as artifacts If running locally, capture these outputs from the terminal.
    
    Then you need to update the EC2 docker-compose with those values. The way I did it was logging into EC2 via SSH and editing it there.

7. **Access the application**:
   - You can check EC2 public IP from Terraform outputs
   - Access the Upload Service at `http://<EC2-PUBLIC-IP>:3000`
   - Access the Processing Service at `http://<EC2-PUBLIC-IP>:3001`

### Testing the API

Once your services are running, you can test the API:

#### Upload an image with processing operations:

```bash
curl -X POST http://<EC2-PUBLIC-IP>:3000/uploads \
  -F "file=@/path/to/image.jpg" \
  -F "title=Sample Image" \
  -F "description=Test description" \
  -F 'operations=[
    {"type":"resize","params":{"width":800,"height":600,"fit":"cover"}},
    {"type":"optimize","params":{"quality":80,"format":"jpeg"}}
  ]'
```

#### Check processing status:
```bash
curl http://<EC2-PUBLIC-IP>:3000/uploads/status/[IMAGE_ID]
```

Replace `[IMAGE_ID]` with the ID received in the upload response.

### Notes

- Full functionality requires AWS resources (S3, DynamoDB, SQS, Lambda)
- The system is designed to stay within AWS Free Tier limits for demonstration purposes

## Project Structure
```
/
├── upload-service/        # NestJS service for uploads
│   ├── src/               # Service source code
│   ├── Dockerfile         # Container definition
│   └── package.json       # Dependencies
│
├── processing-service/    # Node + Express service for orchestration
│   ├── src/               # Service source code
│   ├── Dockerfile         # Container definition
│   └── package.json       # Dependencies
│
├── lambda/                # Image processing function
│   ├── src/               # Lambda function code
│   └── package.json       # Dependencies (including Sharp)
│
├── infrastructure/        # Terraform IaC
│   ├── main.tf            # Main Terraform configuration
│   ├── variables.tf       # Input variables
│   ├── outputs.tf         # Output variables
│   ├── backend.tf         # S3 backend configuration
│   └── modules/           # Modular infrastructure components
│       ├── s3/            # S3 buckets configuration
│       ├── dynamodb/      # DynamoDB tables
│       ├── sqs/           # SQS queues
│       ├── lambda/        # Lambda function
│       ├── iam/           # IAM roles and policies
│       └── ec2/           # EC2 instance for services
│
├── .github/
│   └── workflows/         # CI/CD pipeline definitions
│       └── terraform-deploy.yml  # Infrastructure deployment
│
└── docker-compose.yml     # Local development orchestration
```
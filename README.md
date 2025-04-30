Image Processing Microservices System
=====================================

A cloud-native microservices architecture for asynchronous image processing deployed on AWS.

Architecture Overview
---------------------

This project implements a microservices architecture that processes images asynchronously:

-   **Upload Service (NestJS)**: Receives user uploads, stores images in AWS S3, and initiates processing
-   **Processing Service (Node + Express)**: Orchestrates the processing workflow through message queues
-   **Lambda Function**: Performs CPU-intensive image transformations
-   **AWS Infrastructure**: Leverages S3, DynamoDB, SQS for storage, persistence, and communication

### Data Flow

1.  User uploads image → Upload Service → S3 bucket + message to processing queue
2.  Processing Service consumes message → updates status in DynamoDB → triggers Lambda
3.  Lambda processes image → stores result in S3 → sends completion notification
4.  User can query status and retrieve processed images

Services
--------

### Upload Service (NestJS)

-   **Endpoints**:
    -   `POST /uploads`: Accepts multipart form image uploads
    -   `GET /status/:id`: Returns current processing status
-   **Features**:
    -   File validation and sanitization
    -   Secure S3 uploads with presigned URLs
    -   Unique ID generation for job tracking

### Processing Service (NodeJs)

-   **Components**:
    -   SQS consumers for processing coordination
    -   State management with DynamoDB
    -   Processing orchestration layer
-   **APIs**:
    -   `GET /api/status/:id`: Internal endpoint for status checks

### Lambda Function

-   **Capabilities**:
    -   Image resizing and optimization
    -   Format conversion
    -   Metadata extraction
    -   Advanced processing options

Infrastructure
--------------

Infrastructure is defined as code using Terraform with modular organization:

-   **S3**: Separate buckets for original and processed images
-   **DynamoDB**: Tracking processing state and metadata
-   **SQS**: Multiple queues for workflow coordination
-   **Lambda**: Serverless processing function
-   **IAM**: Least-privilege security policies

Deployment
----------

The project uses GitHub Actions for CI/CD automation:

-   **Infrastructure Pipeline**: Terraform workflow for AWS resource provisioning
-   **Application Pipeline**: Docker builds and deployments to EC2

Local Development
-----------------

### Prerequisites

-   Docker and Docker Compose
-   AWS CLI configured locally
-   Node.js 16+ for local testing

### Getting Started

1.  Clone the repository
2.  Run `docker-compose up` to start local services
3.  Use the provided Postman collection for testing endpoints

Project Structure
-----------------
```
├── upload-service/       # NestJS service for uploads
├── processing-service/   # NodeJs service for orchestration
├── lambda/               # Image processing function
├── infrastructure/       # Terraform IaC modules
└── .github/workflows/    # CI/CD pipeline definitions
```


# Image Processing Microservices System

A microservices-based image processing system deployed on AWS.

## Architecture

This project implements a streamlined microservices architecture for image processing with:

- Upload Service: Handles image uploads and provides status information
- Processing Service: Coordinates asynchronous processing via SQS
- Lambda: Performs intensive image processing
- AWS Services: S3, DynamoDB, SQS for storage and communication

## Services

### Upload Service
NestJS service to receive and validate images before uploading to S3. Also provides endpoints to check processing status.

### Processing Service
Express service that coordinates the processing workflow using SQS messages. Listens to SQS queues and manages the state of processing in DynamoDB.

## Infrastructure

Infrastructure is defined as code using Terraform and deployed on AWS.

## Local Development

Instructions for running the system locally with Docker Compose (coming soon).
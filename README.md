# Image Processing Microservices System

A microservices-based image processing system deployed on AWS.

## Architecture

This project implements a microservices architecture for image processing with:

- Upload Service: Receives images and stores them in S3
- Processing Service: Coordinates asynchronous processing
- API Gateway: Provides unified endpoints for clients
- Lambda: Performs intensive image processing
- AWS Services: S3, DynamoDB, SQS for storage and communication

## Services

### Upload Service
NestJS service to receive and validate images before uploading to S3.

### Processing Service
Express service that coordinates the processing workflow using SQS messages.

### API Gateway
Unified API built with NestJS to interact with the system.

## Infrastructure

Infrastructure is defined as code using Terraform and deployed on AWS.

## Local Development

Instructions for running the system locally with Docker Compose (coming soon).
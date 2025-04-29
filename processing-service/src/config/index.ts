import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  queues: {
    processingQueue: process.env.SQS_PROCESSING_QUEUE_URL || '',
    lambdaQueue: process.env.SQS_LAMBDA_QUEUE_URL || '',
    completionQueue: process.env.SQS_COMPLETION_QUEUE_URL || ''
  },
  dynamodb: {
    table: process.env.DYNAMODB_TABLE || 'image-processing'
  }
};

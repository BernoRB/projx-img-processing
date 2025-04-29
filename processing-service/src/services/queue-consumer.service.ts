// src/services/queue-consumer.service.ts
import { queueService } from './queue.service';
import { processingService } from './processing.service';
import { config } from '../config';

class QueueConsumerService {
  private isRunning = false;
  private processingQueueUrl = config.queues.processingQueue;
  private completionQueueUrl = config.queues.completionQueue;

  async startProcessingConsumer(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Starting processing queue consumer...');
    
    this.pollProcessingQueue();
    this.pollCompletionQueue();
  }
  
  private async pollProcessingQueue(): Promise<void> {
    while (this.isRunning) {
      try {
        const messages = await queueService.receiveMessages(this.processingQueueUrl);
        
        for (const message of messages) {
          console.log('Received processing message:', message.body);
          
          // Extract data from message
          const { imageId, s3Key, operations } = message.body;
          
          // Process image
          await processingService.processUploadedImage(imageId, s3Key, operations);
          
          // Delete message from queue
          await queueService.deleteMEssage(this.processingQueueUrl, message.receiptHandle);
        }
        
        // Short delay between polls if no messages
        if (messages.length === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Error polling processing queue:', error);
        // Continue polling despite errors
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  
  private async pollCompletionQueue(): Promise<void> {
    while (this.isRunning) {
      try {
        const messages = await queueService.receiveMessages(this.completionQueueUrl);
        
        for (const message of messages) {
          console.log('Received completion message:', message.body);
          
          // Extract data from message
          const { imageId, processedUrls } = message.body;
          
          // Update completion status
          await processingService.handleProcessingCompletion(imageId, processedUrls);
          
          // Delete message from queue
          await queueService.deleteMEssage(this.completionQueueUrl, message.receiptHandle);
        }
        
        // Short delay between polls if no messages
        if (messages.length === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Error polling completion queue:', error);
        // Continue polling despite errors
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  
  stopConsumer(): void {
    this.isRunning = false;
    console.log('Stopping queue consumers...');
  }
}

export const queueConsumerService = new QueueConsumerService();
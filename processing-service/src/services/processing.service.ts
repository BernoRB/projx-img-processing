import { queueService } from './queue.service';
import { dbService } from './db.service';
import { config } from '../config';
import { ProcessingMessage, ProcessingOperation } from '../models/image.model';

class ProcessingService {

  async processUploadedImage(imageId: string, s3Key: string, operations: ProcessingOperation[]): Promise<void> {
    try {
      // Update img status to processing
      await dbService.updateImageStatus(imageId, 'processing')

      // Define what to do
      const processingOperations = operations

      // Message for lambda
      const message: ProcessingMessage = {
        imageId,
        s3Key,
        operations: processingOperations
        }
        
        // Send message to lambda queue
        await queueService.sendMessage(
          config.queues.lambdaQueue,
          message
        )

        console.log(`Sent image ${imageId} for processing with ${processingOperations.length} operations`)
      
    } catch(error) {
      console.log(`Error processing image ${imageId}: `, error);
      // Update status to error
      await dbService.updateImageStatus(imageId, 'error', {
        error: `Processing failed:  ${error instanceof Error ? error.message : String(error)}`
      })
      throw error;
    }
  }

  
  async handleProcessingCompletion(imageId: string, processedUrls: string[]): Promise<void> {
    try {
      // Update status and add processed urls
      await dbService.updateImageStatus(imageId, 'completed', {
        processedUrls
      })
      console.log(`Completed processing for image ${imageId}`);
    } catch(error) {
      console.error(`Error handling completion for image ${imageId}: `, error);
      throw error;
    }
  }
}

export const processingService = new ProcessingService();

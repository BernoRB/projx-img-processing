import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { config } from "../config";

class QueueService {
  private client: SQSClient;

  constructor() {
    this.client = new SQSClient({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId || '',
        secretAccessKey: config.aws.secretAccessKey || ''
      }
    });
  }

  async sendMessage(queueUrl: string, messageBody: any): Promise<string> {
    const params = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(messageBody),
    };

    try {
      const command = new SendMessageCommand(params);
      const data = await this.client.send(command);
      return data.MessageId || '';
    } catch(error) {
      console.log('Error sending message to SQS: ', error);
      throw error;
    }
  }

  
  async receiveMessages(queueUrl: string, maxMEssages = 10): Promise<any[]> {
    const params = {
      QueueUrl: queueUrl,
      MaxNumberOfMessages: maxMEssages,
      WaitTimeSeconds: 20,
      VisibilityTimeout: 30
    };

    try {
      const command = new ReceiveMessageCommand(params);
      const data = await this.client.send(command);

      return (data.Messages || []).map(message => ({
        body: JSON.parse(message.Body || '{}'),
        receiptHandle: message.ReceiptHandle
      }))
    }
    catch(error) {
      console.error('Error receiveng messages from SQS: ', error);
      throw error;
    }
  }


  async deleteMEssage(queueUrl: string, receiptHandle: string): Promise<void> {
    const params = {
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle
    };

    try {
      const command = new DeleteMessageCommand(params);
      await this.client.send(command);
    } catch(error) {
      console.error('Error deleting message from SQS: ', error);
      throw error;
    }
  }
}

export const queueService = new QueueService();
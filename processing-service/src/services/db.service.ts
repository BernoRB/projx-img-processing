import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, GetCommandInput, PutCommandInput, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { config } from '../config';
import { ImageMetadata } from '../models/image.model';

class DBService {
  private client: DynamoDBClient;
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    this.client = new DynamoDBClient({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId || '',
        secretAccessKey: config.aws.secretAccessKey || ''
      }
    });
    this.docClient = DynamoDBDocumentClient.from(this.client);
    this.tableName = config.dynamodb.table;
  }


  async getImage(id: string): Promise<ImageMetadata | null> {
    const params: GetCommandInput = {
      TableName: this.tableName,
      Key: { id }
    }

    try {
      const { Item } = await this.docClient.send(new GetCommand(params));
      return Item as ImageMetadata || null;
    } catch (error) {
      console.log('Error getting image from DynamoDB: ', error);
      throw error;
    }
  }


  async saveImage(imageData: ImageMetadata): Promise<void> {
    const params: PutCommandInput = {
      TableName: this.tableName,
      Item: imageData
    }

    try {
      await this.docClient.send(new PutCommand(params));
    } catch (error) {
      console.log('Error saving image to DynamoDB: ', error);
      throw error;
    }
  }

  
  async updateImageStatus(
    id: string,
    status: ImageMetadata['status'],
    additionalData: Partial<ImageMetadata> = {}
  ): Promise<void> {

    console.log(`Attempting to update image ${id} to status ${status}`);
    console.log(`Using DynamoDB table: ${this.tableName}`);

    const existingImage = await this.getImage(id);
    console.log(`Existing image record: ${JSON.stringify(existingImage)}`);
    
    const updateExpression = [
      'SET #status = :status',
      '#updatedAt = :updatedAt'
    ];

    const expressionAttributeNames: Record<string, string> = {
      '#status': 'status',
      '#updatedAt': 'updatedAt'
    };

    const expressionAttributeValues: Record<string, any> = {
      ':status': status,
      ':updatedAt': new Date().toISOString()
    };

    // Additional fields if any has changed
    Object.entries(additionalData).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'status' && value !== undefined) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    const params: UpdateCommandInput = {
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: updateExpression.join(', '),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    };

    try {
      await this.docClient.send(new UpdateCommand(params));
    } catch(error) {
      console.error('Error updating image status in DynamoDB: ', error);
      throw error;
    }
  }
}

export const dbService = new DBService()

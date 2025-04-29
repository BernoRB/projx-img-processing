export interface ImageMetadata {
  id: string;
  originalName: string;
  size: number;
  mimeType: string;
  s3Url: string;
  processedUrls?: string[];
  title?: string;
  description?: string;
  status: 'uploaded' | 'processing' | 'completed' | 'error'; //TODO poner en env
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessingMessage {
  imageId: string;
  s3Key: string;
  operations: ProcessingOperation[];
}

export interface ProcessingOperation {
  type: 'resize' | 'optimize' | 'convert'; //TODO poner en env
  params: {
    widht?: number;
    height?: number;
    quality?: number;
    format?: string;
    [key: string]: any;
  }
}

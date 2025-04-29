export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
  filename?: string;
  path?: string;
  destination?: string;
  fieldname?: string;
  encoding?: string;
}

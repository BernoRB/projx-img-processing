export class UploadFileDto {
  readonly file: Express.Multer.File;
  readonly title?: string;
  readonly description?: string;
}
import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileService {
  private fileClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.fileClient = new Minio.Client({
      endPoint: this.configService.get<string>('AWS_ENDPOINT') ?? "localhost",
      port: this.configService.get<number>('AWS_PORT'),
      useSSL: false,
      accessKey: this.configService.get<string>('AWS_ACCESS_KEY'),
      secretKey: this.configService.get<string>('AWS_SECRET_KEY'),
    });
    this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME') ?? "dev";
  }

  async uploadPDF(fileName: string, buffer: Buffer): Promise<string> {
    if (!(await this.fileClient.bucketExists(this.bucketName))) {
      await this.fileClient.makeBucket(this.bucketName, 'us-east-1');
    }

    await this.fileClient.putObject(this.bucketName, fileName, buffer);
    return `http://localhost:9000/${this.bucketName}/${fileName}`; // Construct URL manually
  }

  async downloadPDF(fileUrl: string): Promise<Buffer> {
    const objectName = fileUrl.split('/').slice(4).join('/');

    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      this.fileClient.getObject(this.bucketName, objectName)
        .then((stream) => {
          stream.on('data', (chunk) => chunks.push(chunk));
          stream.on('end', () => resolve(Buffer.concat(chunks)));
          stream.on('error', (error) => reject(error));
        })
        .catch((err) => reject(err));
    });
  }
}

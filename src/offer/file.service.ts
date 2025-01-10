import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class FileService {
  private fileClient: Minio.Client;

  constructor() {
    this.fileClient = new Minio.Client({
      endPoint: 'localhost',
      port: 9000,
      useSSL: false,
      accessKey: 'minioadmin',
      secretKey: 'minioadmin',
    });
  }

  async uploadPDF(fileName: string, buffer: Buffer): Promise<string> {
    const bucketName = 'offers';
    if (!(await this.fileClient.bucketExists(bucketName))) {
      await this.fileClient.makeBucket(bucketName, 'us-east-1');
    }

    await this.fileClient.putObject(bucketName, fileName, buffer);
    return `${this.fileClient.protocol}//${this.fileClient.endPoint}:${this.fileClient.port}/${bucketName}/${fileName}`;
  }

  async downloadPDF(fileUrl: string): Promise<Buffer> {
    const bucketName = fileUrl.split('/')[3];
    const objectName = fileUrl.split('/').slice(4).join('/');

    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      this.fileClient.getObject(bucketName, objectName, (err, stream) => {
        if (err) return reject(err);
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    });
  }
}

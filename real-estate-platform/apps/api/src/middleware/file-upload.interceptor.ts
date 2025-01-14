import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as multer from 'multer';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  private upload = multer({
    storage: multer.memoryStorage(), // In-memory storage
  }).single('file');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log(next);

    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    return new Observable((observer) => {
      this.upload(req, req.res, (err) => {
        if (err) {
          observer.error(
            new HttpException('File upload failed', HttpStatus.BAD_REQUEST),
          );
          return;
        }
        if (!req.file) {
          observer.error(
            new HttpException('No file uploaded', HttpStatus.BAD_REQUEST),
          );
          return;
        }
        observer.next(req);
        observer.complete();
      });
    });
  }
}

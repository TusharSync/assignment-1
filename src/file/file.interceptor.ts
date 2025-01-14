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
    fileFilter: (req, file, callback) => {
      // Validate the file type
      if (file.mimetype !== 'application/pdf') {
        return callback(
          new HttpException('Only PDF files are allowed', HttpStatus.BAD_REQUEST),
          false,
        );
      }
      callback(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  }).single('file');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    return new Observable((observer) => {
      this.upload(req, req.res, (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            // Handle multer-specific errors
            observer.error(
              new HttpException(
                `File upload error: ${err.message}`,
                HttpStatus.BAD_REQUEST,
              ),
            );
          } else {
            // Handle other errors (e.g., file validation)
            observer.error(err);
          }
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

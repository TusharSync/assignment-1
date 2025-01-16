import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import multer from 'multer'; // Default import for multer

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  private upload = multer({
    storage: multer.memoryStorage(), // In-memory storage
    fileFilter: (req, file, callback) => {
      // Validate the file type
      if (file.mimetype !== 'application/pdf') {
        console.log("ifffffffffffffffffffffffffffff");
        
        return callback(
          null,
          false,
        );
      }
      callback(null, true);
    },
    limits: { fileSize: 15 * 1024 * 1024 }, // Limit file size to 15MB
  }).single('file');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    
    return new Observable((observer) => {
      this.upload(req, req.res, (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            // Multer-specific errors (e.g., file too large)
            observer.error(
              new HttpException(
                `File upload error: ${err.message}`,
                HttpStatus.BAD_REQUEST,
              ),
            );
          } else if (err instanceof HttpException) {
            // Custom validation errors (e.g., non-PDF files)
            observer.error(err);
          } else {
            // Other errors
            observer.error(
              new HttpException(
                'Unexpected error during file upload',
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
            );
          }
          return;
        }
        if (!req.file) {
          observer.error(
            new HttpException('No file uploaded', HttpStatus.BAD_REQUEST),
          );
          return;
        }
        // Continue with request processing
        observer.next();
        observer.complete();
      });
    });
  }
}

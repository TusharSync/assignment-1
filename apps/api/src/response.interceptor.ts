import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data: data,
        message: 'Request successful',
      })),
      catchError((err) => {
        // Optionally rethrow the error if needed
        throw {
          success: false,
          data: null,
          message: err.message || 'An error occurred',
        };
      })
    );
  }
}

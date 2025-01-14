import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  private connectionOptions = {
    host: 'localhost',
    port: 6379, // Redis default port
  };

  createQueue(queueName: string): Queue {
    return new Queue(queueName, { connection: this.connectionOptions });
  }

  getConnectionOptions() {
    return this.connectionOptions;
  }
}

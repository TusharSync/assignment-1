import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [ConfigModule], // Import ConfigModule
  providers: [FileService]
})
export class FileModule { }

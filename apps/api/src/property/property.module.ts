import { BadRequestException, Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Property, PropertySchema } from './schemas/property.schema';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { RolesGuard } from '../user/roles.guard';
import { FileService } from '../file/file.service'; // Import FileService
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(), // Use in-memory storage
      fileFilter: (req, file, cb) => {
        // File validation logic
        if (!file.mimetype.match(/\/(pdf)$/)) {
          cb(new BadRequestException('Invalid file type'), false); // Reject unsupported file types
        } else {
          cb(null, true); // Accept the file
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
      },
    }),
    MongooseModule.forFeature([
      { name: Property.name, schema: PropertySchema },
    ]),
    JwtModule,
    UserModule,
  ],
  controllers: [PropertyController],
  providers: [PropertyService, RolesGuard, FileService], // Include FileService
  exports: [PropertyService],
})
export class PropertyModule {}

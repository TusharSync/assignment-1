import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Property, PropertySchema } from './schemas/property.schema';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { RolesGuard } from '../user/roles.guard';
import { FileService } from '../file/file.service'; // Import FileService

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Property.name, schema: PropertySchema }]),
    JwtModule,
    UserModule,
  ],
  controllers: [PropertyController],
  providers: [PropertyService, RolesGuard, FileService], // Include FileService
  exports: [PropertyService],
})
export class PropertyModule { }

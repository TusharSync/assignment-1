import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Property, PropertySchema } from './schemas/property.schema';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { RolesGuard } from '../user/roles.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Property.name, schema: PropertySchema },
    ]),
    JwtModule,
    UserModule,
  ],
  controllers: [PropertyController],
  providers: [PropertyService, RolesGuard],
  exports: [PropertyService],
})
export class PropertyModule {}

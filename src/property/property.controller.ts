import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { Property } from './schemas/property.schema';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post('create')
  async createProperty(
    @Body()
    body: {
      title: string;
      price: number;
      location: string;
      propertyType: string;
    },
  ): Promise<Property> {
    return this.propertyService.createProperty(
      body.title,
      body.price,
      body.location,
      body.propertyType,
    );
  }

  @Get('all')
  async getAllProperties(): Promise<Property[]> {
    return this.propertyService.getAllProperties();
  }

  @Get(':id')
  async getPropertyById(@Param('id') id: string): Promise<Property> {
    return this.propertyService.getPropertyById(id);
  }

  @Put(':id')
  async updateProperty(
    @Param('id') id: string,
    @Body() updateData: Partial<Property>,
  ): Promise<Property> {
    return this.propertyService.updateProperty(id, updateData);
  }

  @Delete(':id')
  async deleteProperty(@Param('id') id: string): Promise<Property> {
    return this.propertyService.deleteProperty(id);
  }
}

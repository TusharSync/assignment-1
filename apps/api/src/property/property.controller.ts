import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { Property } from './schemas/property.schema';
import { JwtAuthGuard } from '../user/jwt-auth.guard';
import { RolesGuard } from '../user/roles.guard';
import { Roles } from '../user/roles.decorator';
import { Request } from 'express';
import { FileUploadInterceptor } from '../file/file.interceptor';

@Controller('property')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post('create')
  @Roles('admin')
  @UseInterceptors(FileUploadInterceptor)
  async createProperty(
    @Body()
    body: {
      title: string;
      price: number;
      location: string;
      propertyType: string;
      city: string;
      state: string;
      area: string;
    },
    @UploadedFile() file: any,
  ): Promise<Property> {
    const templateUrl = await this.propertyService.uploadTemplate(file);
    return this.propertyService.createProperty(
      body.title,
      body.price,
      body.location,
      body.propertyType,
      body.city,
      body.state,
      body.area,
      templateUrl,
    );
  }

  @Get('all')
  async getAllProperties(): Promise<Property[]> {
    return this.propertyService.getAllProperties();
  }

  @Get(':id')
  async getPropertyById(@Param('id') id: string): Promise<Property|null> {
    return this.propertyService.getPropertyById(id);
  }

  @Get('filter')
  async filterProperties(
    @Query()
    filters: {
      price?: number;
      location?: string;
      propertyType?: string;
      city?: string;
      state?: string;
      area?: string;
    },
  ): Promise<Property[]> {
    return this.propertyService.filterProperties(filters);
  }

  @Get('market-level')
  async getMarketLevelDetails(): Promise<any> {
    return this.propertyService.getMarketLevelDetails();
  }

  @Get('neighborhood-level')
  async getNeighborhoodLevelDetails(@Req() req: any): Promise<any> {
    const user = req.user as { city: string; state: string; area: string };
    return this.propertyService.getNeighborhoodLevelDetails(
      user.city,
      user.state,
      user.area,
    );
  }

  @Post('calculate-irr')
  async calculateIRR(@Body() body: { cashFlows: number[] }): Promise<number> {
    return this.propertyService.calculateIRR(body.cashFlows);
  }

  @Post('calculate-cap-rate')
  async calculateCapRate(
    @Body() body: { propertyValue: number; netOperatingIncome: number },
  ): Promise<number> {
    return this.propertyService.calculateCapRate(
      body.propertyValue,
      body.netOperatingIncome,
    );
  }

  @Put(':id')
  @Roles('admin')
  async updateProperty(
    @Param('id') id: string,
    @Body() updateData: Partial<Property>,
  ): Promise<Property|null> {
    return this.propertyService.updateProperty(id, updateData);
  }

  @Delete(':id')
  @Roles('admin')
  async deleteProperty(@Param('id') id: string): Promise<Property|null> {
    return this.propertyService.deleteProperty(id);
  }
}

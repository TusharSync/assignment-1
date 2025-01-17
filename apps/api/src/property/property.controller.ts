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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../user/jwt-auth.guard';
import { RolesGuard } from '../user/roles.guard';
import { Roles } from '../user/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { PropertyListQuery } from './property.query';
import { OfferService } from '../offer/offer.service';

@ApiTags('Property') // Groups all routes under the "Property" section in Swagger
@Controller('property')
@ApiBearerAuth() // Adds Bearer Authentication to all routes in this controller
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly offerService: OfferService
  ) {}

  @Post('create')
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Create a new property with file upload' })
  @ApiConsumes('multipart/form-data') // Indicates this endpoint accepts multipart/form-data
  @ApiResponse({ status: 201, description: 'Property created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Luxury Villa' },
        price: { type: 'number', example: 500000 },
        location: { type: 'string', example: 'Downtown' },
        propertyType: { type: 'string', example: 'Residential' },
        city: { type: 'string', example: 'San Francisco' },
        state: { type: 'string', example: 'California' },
        area: { type: 'string', example: 'West End' },
        file: {
          type: 'string',
          format: 'binary', // Indicates a file upload
          description: 'File to upload (e.g., property blueprint or images)',
        },
      },
      required: [
        'title',
        'price',
        'location',
        'propertyType',
        'city',
        'state',
        'area',
        'file',
      ],
    },
  })
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
    @UploadedFile() file: any
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
      templateUrl
    );
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all properties with filters' })
  @ApiResponse({
    status: 200,
    description: 'List of properties retrieved successfully',
  })
  async getAllProperties(
    @Req() req: any,
    @Query()
    filters: PropertyListQuery
  ): Promise<Property[]> {
    const user = req.user as { city: string; state: string; area: string };
    return this.propertyService.filterProperties({ ...filters, user });
  }

  @Get(':id/offers')
  @Roles('admin')
  @ApiOperation({ summary: 'Get all offers for a property' })
  @ApiParam({ name: 'id', description: 'ID of the property' })
  @ApiResponse({
    status: 200,
    description: 'List of offers with user details for the specified property',
    schema: {
      example: [
        {
          propertyId: 'property123',
          buyerName: 'John Doe',
          buyerEmail: 'john@example.com',
          offerAmount: 500000,
          createdAt: '2025-01-17T10:00:00.000Z',
          pdfUrl: 'http://example.com/pdf',
          emailChain: ['email1', 'email2'],
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async getOffersForProperty(@Param('id') propertyId: string) {
    return await this.offerService.getOffersByProperty(propertyId);
  }

  @Get('offer/:id/email-thread')
  @Roles('admin')
  @ApiOperation({ summary: 'Get the entire email thread for a specific offer' })
  @ApiParam({ name: 'id', description: 'ID of the offer' })
  @ApiResponse({
    status: 200,
    description: 'Email thread for the specified offer',
    schema: {
      example: [
        {
          messageId: 'message123',
          offerId: 'offer123',
          recipient: 'user@example.com',
          subject: 'Offer Discussion',
          body: 'Email body content',
          sentAt: '2025-01-17T10:00:00.000Z',
          replies: [
            {
              messageId: 'reply123',
              from: 'another@example.com',
              subject: 'Re: Offer Discussion',
              body: 'Reply body content',
              receivedAt: '2025-01-17T12:00:00.000Z',
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async getEmailThread(@Param('id') offerId: string) {
    return await this.offerService.getEmailThread(offerId);
  }
  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get a property by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Property ID',
    example: '63e4567890abcdef12345678',
  })
  @ApiResponse({ status: 200, description: 'Property retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async getPropertyById(@Param('id') id: string): Promise<Property | null> {
    return this.propertyService.getPropertyById(id);
  }

  @Post('calculate-irr')
  @ApiOperation({ summary: 'Calculate the Internal Rate of Return (IRR)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cashFlows: {
          type: 'array',
          items: { type: 'number' },
          example: [1000, 2000, 3000, -5000],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'IRR calculated successfully' })
  async calculateIRR(@Body() body: { cashFlows: number[] }): Promise<number> {
    return this.propertyService.calculateIRR(body.cashFlows);
  }

  @Post('calculate-cap-rate')
  @ApiOperation({ summary: 'Calculate the Capitalization Rate (Cap Rate)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        propertyValue: { type: 'number', example: 1000000 },
        netOperatingIncome: { type: 'number', example: 80000 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Cap rate calculated successfully' })
  async calculateCapRate(
    @Body() body: { propertyValue: number; netOperatingIncome: number }
  ): Promise<number> {
    return this.propertyService.calculateCapRate(
      body.propertyValue,
      body.netOperatingIncome
    );
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a property by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Property ID',
    example: '63e4567890abcdef12345678',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated Title' },
        price: { type: 'number', example: 600000 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Property updated successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async updateProperty(
    @Param('id') id: string,
    @Body() updateData: Partial<Property>
  ): Promise<Property | null> {
    return this.propertyService.updateProperty(id, updateData);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a property by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Property ID',
    example: '63e4567890abcdef12345678',
  })
  @ApiResponse({ status: 200, description: 'Property deleted successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async deleteProperty(@Param('id') id: string): Promise<Property | null> {
    return this.propertyService.deleteProperty(id);
  }
}

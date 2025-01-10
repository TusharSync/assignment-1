import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('market')
  async getMarketAnalytics(): Promise<any> {
    return this.analyticsService.getMarketAnalytics();
  }

  @Get('neighborhood')
  async getNeighborhoodAnalytics(
    @Query('name') neighborhood: string,
  ): Promise<any> {
    return this.analyticsService.getNeighborhoodAnalytics(neighborhood);
  }

  @Get('property')
  async getPropertyAnalytics(@Query('id') propertyId: string): Promise<any> {
    return this.analyticsService.getPropertyAnalytics(propertyId);
  }
}

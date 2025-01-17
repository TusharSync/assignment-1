import { ApiPropertyOptional } from '@nestjs/swagger';

export class PropertyListQuery {
  @ApiPropertyOptional({
    description: 'Filter by price of the property',
    example: 500000,
  })
  price?: number;

  @ApiPropertyOptional({
    description: 'Filter by location of the property',
    example: 'Downtown',
  })
  location?: string;

  @ApiPropertyOptional({
    description: 'Filter by property type (e.g., Residential, Commercial)',
    example: 'Residential',
  })
  propertyType?: string;

  @ApiPropertyOptional({
    description: 'Filter by city',
    example: 'San Francisco',
  })
  city?: string;

  @ApiPropertyOptional({
    description: 'Filter by state',
    example: 'California',
  })
  state?: string;

  @ApiPropertyOptional({
    description: 'Filter by area within the city',
    example: 'West End',
  })
  area?: string;

  @ApiPropertyOptional({
    description: 'Filter by marketLevel',
    example: 'true',
  })
  marketLevel?: string;
  @ApiPropertyOptional({
    description: 'Filter by neighborhoodLevel',
    example: 'true',
  })
  neighborhoodLevel?: string;

  @ApiPropertyOptional({
    description: 'Lowest Price',
    example: 0,
  })
  low?: number;
  @ApiPropertyOptional({
    description: 'Highest Price',
    example: 1000,
  })
  high?: number;
}

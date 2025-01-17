import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property } from './schemas/property.schema';
import { FileService } from '../file/file.service';

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    private fileService: FileService // Injecting FileService
  ) {}

  async createProperty(
    title: string,
    price: number,
    location: string,
    propertyType: string,
    city: string,
    state: string,
    area: string,
    templateUrl: string
  ): Promise<Property> {
    const property = new this.propertyModel({
      title,
      price,
      location,
      propertyType,
      city,
      state,
      area,
      templateUrl,
    });
    return property.save();
  }
  async uploadTemplate(file: any): Promise<string> {
    try {
      const fileName = `template-${Date.now()}-${file.originalname}`;
      return await this.fileService.uploadPDF(fileName, file.buffer);
    } catch (error) {
      throw new Error('Failed to upload template');
    }
  }

  async getAllProperties(): Promise<Property[]> {
    return this.propertyModel.find().exec();
  }

  async getPropertyById(id: string): Promise<Property | null> {
    return this.propertyModel.findById(id).exec();
  }

  async filterProperties(filters: {
    price?: number;
    location?: string;
    propertyType?: string;
    city?: string;
    state?: string;
    area?: string;
    marketLevel?: string;
    low?: number;
    high?: number;
    neighborhoodLevel?: string;
    user?: any;
  }): Promise<Property[]> {
    const { user, low, high } = filters;
    if (filters?.marketLevel === 'true' && low && high) {
      return this.getMarketLevelDetails(low, high);
    }
    if (filters?.neighborhoodLevel === 'true') {
      console.log(user);

      return this.getNeighborhoodLevelDetails(user.city, user.state, user.area);
    }
    const query: any = {};
    if (filters.price) {
      query['price'] = { $lte: filters.price };
    }
    if (filters.location) {
      query['location'] = filters.location;
    }
    if (filters.propertyType) {
      query['propertyType'] = filters.propertyType;
    }
    if (filters.city) {
      query['city'] = filters.city;
    }
    if (filters.state) {
      query['state'] = filters.state;
    }
    if (filters.area) {
      query['area'] = filters.area;
    }
    return this.propertyModel.find(query).exec();
  }

  async updateProperty(
    id: string,
    updateData: Partial<Property>
  ): Promise<Property | null> {
    return this.propertyModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async deleteProperty(id: string): Promise<Property | null> {
    return this.propertyModel.findByIdAndDelete(id).exec();
  }

  async getMarketLevelDetails(low: number, high: number): Promise<any> {
    if (low < 0 || high < 0) {
      throw new Error('Price values cannot be negative.');
    }
    // Normalize: Ensure low is the smaller value and high is the larger value
    const normalizedLow = Math.min(low, high);
    const normalizedHigh = Math.max(low, high);

    return this.propertyModel
      .find({ price: { $gte: normalizedLow, $lte: normalizedHigh } })
      .exec();
  }
  async getNeighborhoodLevelDetails(
    city: string,
    state: string,
    area: string
  ): Promise<any> {
    return this.propertyModel
      .find({
        $or: [
          { city: { $eq: city.toLowerCase() } }, // Exact match for city
          { state: { $eq: state.toLowerCase() } }, // Exact match for state
          { area: { $eq: area.toLowerCase() } }, // Exact match for area
        ],
      })
      .exec();
  }

  async calculateIRR(cashFlows: number[]): Promise<number> {
    const NPV = (rate: number) =>
      cashFlows.reduce(
        (acc, cashFlow, i) => acc + cashFlow / Math.pow(1 + rate, i),
        0
      );
    let rate = 0.1; // Initial guess
    for (let i = 0; i < 100; i++) {
      const npv = NPV(rate);
      if (Math.abs(npv) < 0.01) break;
      rate += npv > 0 ? 0.01 : -0.01;
    }
    return rate;
  }

  async calculateCapRate(
    propertyValue: number,
    netOperatingIncome: number
  ): Promise<number> {
    return (netOperatingIncome / propertyValue) * 100;
  }
}

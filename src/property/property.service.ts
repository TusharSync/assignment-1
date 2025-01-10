import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property } from './schemas/property.schema';

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
  ) {}

  async createProperty(
    title: string,
    price: number,
    location: string,
    propertyType: string,
    city: string,
    state: string,
    area: string,
  ): Promise<Property> {
    const property = new this.propertyModel({
      title,
      price,
      location,
      propertyType,
      city,
      state,
      area,
    });
    return property.save();
  }

  async getAllProperties(): Promise<Property[]> {
    return this.propertyModel.find().exec();
  }

  async getPropertyById(id: string): Promise<Property> {
    return this.propertyModel.findById(id).exec();
  }

  async filterProperties(filters: {
    price?: number;
    location?: string;
    propertyType?: string;
    city?: string;
    state?: string;
    area?: string;
  }): Promise<Property[]> {
    const query = {};
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
    updateData: Partial<Property>,
  ): Promise<Property> {
    return this.propertyModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async deleteProperty(id: string): Promise<Property> {
    return this.propertyModel.findByIdAndDelete(id).exec();
  }

  async getMarketLevelDetails(): Promise<any> {
    return {
      averagePrice: await this.propertyModel
        .aggregate([
          { $group: { _id: null, averagePrice: { $avg: '$price' } } },
        ])
        .exec(),
      propertyCount: await this.propertyModel.countDocuments().exec(),
    };
  }

  async getNeighborhoodLevelDetails(
    city: string,
    state: string,
    area: string,
  ): Promise<any> {
    return this.propertyModel
      .aggregate([
        { $match: { city, state, area } },
        {
          $group: {
            _id: { city: '$city', state: '$state', area: '$area' },
            averagePrice: { $avg: '$price' },
            propertyCount: { $sum: 1 },
          },
        },
      ])
      .exec();
  }

  async calculateIRR(cashFlows: number[]): Promise<number> {
    const NPV = (rate: number) =>
      cashFlows.reduce(
        (acc, cashFlow, i) => acc + cashFlow / Math.pow(1 + rate, i),
        0,
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
    netOperatingIncome: number,
  ): Promise<number> {
    return (netOperatingIncome / propertyValue) * 100;
  }
}

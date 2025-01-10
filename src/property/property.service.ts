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
  ): Promise<Property> {
    const property = new this.propertyModel({
      title,
      price,
      location,
      propertyType,
    });
    return property.save();
  }

  async getAllProperties(): Promise<Property[]> {
    return this.propertyModel.find().exec();
  }

  async getPropertyById(id: string): Promise<Property> {
    return this.propertyModel.findById(id).exec();
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
}

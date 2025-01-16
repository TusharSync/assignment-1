import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService
  ) {}

  async register(
    email: string,
    password: string,
    name: string,
    city: string,
    state: string,
    area: string
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      email: email,
      password: hashedPassword,
      name: name,
      city: city,
      state: state,
      area: area,
      role: 'user',
    });
    return user.save();
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    if (user && (await bcrypt.compare(password, user.password))) {
      await this.userModel.updateOne(
        { _id: user._id },
        { $set: { isLoggedIn: true } }
      );
      return user;
    } else {
      await this.userModel.updateOne(
        { _id: user?._id },
        { $set: { isLoggedIn: false } }
      );
    }
    return null;
  }

  async login(
    user: User
  ): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
      city: user.city,
      state: user.state,
      area: user.area,
    };
    const { password, ...userWithoutPassword } = user;
    return {
      accessToken: this.jwtService.sign(payload),
      user: { ...userWithoutPassword._doc, isLoggedIn: true } as Omit<
        User,
        'password'
      >,
    };
  }
}

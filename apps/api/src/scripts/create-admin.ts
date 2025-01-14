import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { User } from '../user/schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import * as readline from 'readline';

class AdminCreator {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async promptInput(question: string, isPassword = false): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(isPassword ? answer.trim() : answer);
      });
    });
  }

  async createAdmin() {
    try {
      const email = await this.promptInput('Enter admin email: ');
      const password = await this.promptInput('Enter admin password: ', true);
      const name = await this.promptInput('Enter admin name: ');
      const city = await this.promptInput('Enter admin city: ');
      const state = await this.promptInput('Enter admin state: ');
      const area = await this.promptInput('Enter admin area: ');

      const hashedPassword = await bcrypt.hash(password, 10);

      const adminUser = new this.userModel({
        email,
        password: hashedPassword,
        name,
        role: 'admin',
        city,
        state,
        area,
      });

      await adminUser.save();
      process.exit(0);
      console.log('Admin user created successfully!');
    } catch (error) {
      console.error('Error creating admin user:', error);
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<User>>('UserModel'); // Retrieve the UserModel
  const adminCreator = new AdminCreator(userModel);

  await adminCreator.createAdmin();

  await app.close(); // Ensure proper cleanup
}

bootstrap();

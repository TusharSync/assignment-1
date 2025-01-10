import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; name: string },
  ) {
    return this.userService.register(body.email, body.password, body.name);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.userService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.userService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('protected')
  protectedRoute(@Request() req) {
    return { message: `Hello ${req.user.email}` };
  }
}

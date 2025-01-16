import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('User') // Groups the routes under "User" in Swagger
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' }) // Description of the endpoint
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request (validation error)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'strongPassword123' },
        name: { type: 'string', example: 'John Doe' },
        city: { type: 'string', example: 'San Francisco' },
        state: { type: 'string', example: 'California' },
        area: { type: 'string', example: 'Downtown' },
      },
    },
  })
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      name: string;
      city: string;
      state: string;
      area: string;
    }
  ) {
    return this.userService.register(
      body.email,
      body.password,
      body.name,
      body.city,
      body.state,
      body.area
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' }) // Description of the endpoint
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'strongPassword123' },
      },
    },
  })
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.userService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.userService.login(user);
  }
}

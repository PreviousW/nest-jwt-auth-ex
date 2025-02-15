import { Controller, Post, Body, Request, UseGuards, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local/local-auth.guard';
import { User } from './user/user.schema';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { UserService } from './user/user.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

  @Get('check')
  @ApiOperation({ summary: 'Check if user is already exists.' })
  @ApiResponse({ status: 201, description: 'The user has been successfully registered.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async check(@Query('nickname') nickname: string) {
    return this.userService.checkAbsent(nickname);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    schema: {
      properties: {
        nickname: { type: 'string' },
        password: { type: 'string' },
        age: { type: 'number' },
        name: { type: 'string' }
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The user has been successfully registered.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async register(@Body() user: User) {
    return this.authService.register(user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login with nickname and password' })
  @ApiBody({
    schema: {
      properties: {
        nickname: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(@Request() req) {
    const user = req.user;
    console.log(user);
    return this.authService.login(user);
  }


  @UseGuards(JwtAuthGuard)
  @Post('protected')
  @ApiOperation({ summary: 'Access user with jwt token - which was issued at login()' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Successful access to protected route.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async protected(@Request() req) {
    return { user: req.user };
  }
}
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user/user.service';
import { User } from './user/user.schema';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  private readonly saltRounds = 2

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (user && await this.comparePassword(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { nickname: user.nickname, age: user.age, name: user.name };
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '1h'}),
      refresh_token: refreshToken,
    };
  }

  async refresh(accessToken: string, refreshToken: string) {
    try {
      const accessPayload = this.jwtService.verify(accessToken, { ignoreExpiration: true });
      const refreshPayload = this.jwtService.verify(refreshToken);

      if (accessPayload.nickname !== refreshPayload.nickname ||
          accessPayload.age !== refreshPayload.age ||
          accessPayload.name !== refreshPayload.name) {
        throw new UnauthorizedException('Invalid tokens');
      }

      const newAccessToken = this.jwtService.sign({ nickname: accessPayload.nickname, age: accessPayload.age, name: accessPayload.name });
      return {
        access_token: newAccessToken,
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(user: User) {
    user.password = await this.hashPassword(user.password)
    return this.userService.create(user);
  }
}
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { jwt_expiry } from 'config';
import { T } from 'libs/types/common';
import { UserResponseDto } from 'libs/dto/user/user.response.dto';
import { Message } from 'libs/enums/common.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private jwtService: JwtService) {}

  // hash password
  public async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  // compare password
  public async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  // create token
  public async createToken(
    user: Prisma.UserCreateInput,
    activationCode?: string,
    expiry: string = jwt_expiry,
  ): Promise<string> {
    const payload: T = {};
    Object.keys(user['_doc'] ? user['_doc'] : user).forEach((key) => {
      payload[key] = user[key];
    });

    payload.activationCode = activationCode;
    delete payload.password;

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: expiry,
      secret: process.env.JWT_SECRET,
    });

    return accessToken;
  }

  // verify token
  public async verifyToken(token: string): Promise<UserResponseDto> {
    try {
      const user = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      return user;
    } catch (error) {
      this.logger.warn(`Invalid token: ${error?.message || error}`);
      throw new UnauthorizedException(Message.TOKEN_NOT_EXIST);
    }
  }
}

import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { UserInput } from 'libs/dto/user/user.create.dto';
import { Message } from 'libs/enums/common.enum';
import { PrismaService } from 'prisma/src/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import * as crypto from 'crypto';
import { UserResponseDto } from 'libs/dto/user/user.response.dto';
@Injectable()
export class UserService {
  constructor(
    private readonly authService: AuthService,
    private prisma: PrismaService,
  ) {}

  // signup
  public async signup(
    dto: UserInput,
  ): Promise<{ userData: UserResponseDto; token: string }> {
    const { email, password: userPassword } = dto;

    // 1. Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      Logger.error(`Signup failed: email already in use → ${email}`);
      throw new ConflictException(Message.USED_EMAIL);
    }

    // 2. Hash password
    const hashedPassword = await this.authService.hashPassword(userPassword);
    const activationCode = crypto.randomInt(100000, 1000000).toString();

    // 3. Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const { password, ...userData } = user;

    Logger.debug(`New user registered: ${user.email} (id: ${user.id})`);
    const token = await this.authService.createToken(user, activationCode);
    //TODO: Send email

    return { userData, token };
  }
}

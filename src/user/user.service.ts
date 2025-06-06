import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserInput } from 'libs/dto/user/user.create.dto';
import { Message } from 'libs/enums/common.enum';
import { PrismaService } from 'prisma/src/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import * as crypto from 'crypto';
import { UserResponseDto } from 'libs/dto/user/user.response.dto';
import { MailService } from 'src/mail/mail.service';
import { buildActivationEmail, subject } from 'libs/utils/email-template';
import { verification_expiry } from 'config';
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly authService: AuthService,
    private readonly mailSertvice: MailService,
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
      this.logger.error(`Signup failed: email already in use → ${email}`);
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
    this.logger.debug(`New user registered: ${user.email} (id: ${user.id})`);
    const token = await this.authService.createToken(
      user,
      activationCode,
      verification_expiry,
    );

    // 4. Send email
    const htmlContent = buildActivationEmail(user.email, activationCode);
    const mailBody = {
      email: user.email,
      subject,
      text: `Your activation code is ${activationCode}`,
      htmlContent,
    };
    await this.mailSertvice.sendEmail(mailBody);

    // 5. return
    return { userData, token };
  }

  // verify email
  public async verifyEmail(input: {
    token: string;
    code: string;
  }): Promise<{ userData: UserResponseDto; accessToken: string }> {
    const { token, code } = input;
    let payload: any;
    try {
      payload = await this.authService.verifyToken(token);
    } catch (err) {
      this.logger.warn(`Email verification failed: invalid or expired token`);
      throw new UnauthorizedException(Message.TOKEN_NOT_EXIST);
    }

    const { email, activationCode } = payload;
    if (!email || !activationCode) {
      throw new BadRequestException(Message.TOKEN_NOT_EXIST);
    }

    if (activationCode !== code) {
      this.logger.warn(`Activation code mismatch for email: ${email}`);
      throw new BadRequestException(Message.INVALID_CODE);
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException(Message.USER_NOT_FOUND);
    }

    if (user.isVerified) {
      throw new BadRequestException(Message.VERIFIED_EMAIL);
    }

    const updatedUser = await this.prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });
    const accessToken = await this.authService.createToken(updatedUser);

    this.logger.log(`Email verified successfully for user: ${email}`);
    const { password, ...userData } = updatedUser;
    return { userData, accessToken };
  }

  //login

  public async login(
    dto: UserInput,
  ): Promise<{ user: UserResponseDto; token: string }> {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      this.logger.warn(`Login failed: no user found for email ${email}`);
      throw new UnauthorizedException(Message.INVALID_CREDENTIALS);
    }

    const isMatch = await this.authService.comparePassword(
      password,
      user.password,
    );
    if (!isMatch) {
      this.logger.warn(`Login failed: invalid password for email ${email}`);
      throw new UnauthorizedException(Message.INVALID_CREDENTIALS);
    }

    if (!user.isVerified) {
      throw new BadRequestException(Message.EMAIL_NOT_VERIFIED);
    }

    const { password: _, ...userData } = user;

    const token = await this.authService.createToken(user);

    this.logger.log(`User logged in: ${user.email}`);
    return { user: userData, token };
  }
}

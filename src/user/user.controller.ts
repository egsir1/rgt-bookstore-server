import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import { ActivationInput, UserInput } from 'libs/dto/user/user.create.dto';
import { AuthGuard } from 'libs/guards/auth.guard';
import { AuthenticatedUser } from 'libs/decorators/auth.decorator';
import { UserResponseDto } from 'libs/dto/user/user.response.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // signup
  @Post('signup')
  public async signup(
    @Body() input: UserInput,
    @Res() res: Response,
  ): Promise<void> {
    Logger.verbose(`UserController ~ signup input: ${JSON.stringify(input)}`);
    const { userData, token } = await this.userService.signup(input);
    res.status(201).json({
      message: 'Signup successful. Please check your email for verification.',
      data: userData,
      verificationToken: token,
    });
  }

  // verify
  @Patch('verify-email')
  public async verifyEmail(
    @Body() input: ActivationInput,
    @Res() res: Response,
  ): Promise<void> {
    Logger.verbose(
      `UserController ~ verifyEmail input: ${JSON.stringify(input)}`,
    );
    const { userData, accessToken } = await this.userService.verifyEmail(input);
    this.setTokens(res, accessToken);

    res.status(200).json({
      message: 'Email activated',
      data: userData,
    });
  }
  // login
  @Post('login')
  public async login(
    @Body() input: UserInput,
    @Res() res: Response,
  ): Promise<void> {
    Logger.verbose(`UserController ~ login input: ${JSON.stringify(input)}`);
    const { user, token } = await this.userService.login(input);
    this.setTokens(res, token);

    res.status(200).json({
      message: 'Login success',
      data: user,
    });
  }

  @Post('logout')
  public async logout(@Res() res: Response): Promise<void> {
    this.clearTokens(res);
    res.status(200).json({ message: 'Logout successful' });
  }

  // get me
  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@AuthenticatedUser() user: UserResponseDto) {
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  //set tokens
  private setTokens(res: Response, accessToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    const accessCookieOptions = {
      httpOnly: true,
      secure: false,
      // secure: isProduction,
      sameSite: 'lax' as const,
      // httpOnly: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    // Set access token
    res.cookie('accessToken', accessToken, accessCookieOptions);
  }

  // clear tokens
  private clearTokens(res: Response) {
    const cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      expires: new Date(0),
    };

    res.cookie('accessToken', '', cookieOptions);
  }
}

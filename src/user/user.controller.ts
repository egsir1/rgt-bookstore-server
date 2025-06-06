import { Body, Controller, Logger, Post, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { UserInput } from 'libs/dto/user/user.create.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // signup
  @Post('signup')
  public async signup(
    @Body() input: UserInput,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    Logger.verbose(`UserController ~ input: ${JSON.stringify(input)}`);
    const { userData, token } = await this.userService.signup(input);
    res.status(201).json({
      message: 'Signup successful. Please check your email for verification.',
      user: userData,
      verificationToken: token,
    });
  }

  //set tokens
  private setTokens(res: Response, accessToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    const accessCookieOptions = {
      httpOnly: true,
      secure: isProduction,
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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      expires: new Date(0),
    };

    res.cookie('accessToken', '', cookieOptions);
  }
}

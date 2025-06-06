import { Body, Controller, Logger, Post, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { UserInput } from 'libs/dto/user/user.create.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  public async signup(
    @Body() input: UserInput,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    Logger.verbose(`UserController ~ input: ${JSON.stringify(input)}`);
    const user = await this.userService.signup(input);
    res.status(201).json(user);
  }
}

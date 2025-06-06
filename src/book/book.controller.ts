import {
  Body,
  Controller,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { Roles } from 'libs/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'libs/guards/roles.guard';
import { Request, Response } from 'express';
import { AuthenticatedUser } from 'libs/decorators/auth.decorator';
import { CreateBookDto } from 'libs/dto/books/book.create.dto';
import { UserResponseDto } from 'libs/dto/user/user.response.dto';

@Controller('book')
export class BookController {
  private readonly logger = new Logger(BookController.name);
  constructor(private readonly bookService: BookService) {}

  // create book
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Post('create')
  async createBook(
    @Body() input: CreateBookDto,
    @Req() req: Request,
    @Res() res: Response,
    @AuthenticatedUser() user: UserResponseDto,
  ): Promise<void> {
    this.logger.debug(`Book create user: ${JSON.stringify(user)}`);
    this.logger.verbose(`input: ${JSON.stringify(input)}`);
    const { id } = user;
    const result = await this.bookService.createBook(id, input);
    this.logger.debug(`Book created result: ${JSON.stringify(result)}`);

    res.status(201).json({ message: 'Book created', data: result });
  }
}

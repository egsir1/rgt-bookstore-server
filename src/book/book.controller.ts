import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { Roles } from 'libs/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'libs/guards/roles.guard';
import { AuthenticatedUser } from 'libs/decorators/auth.decorator';
import { CreateBookDto } from 'libs/dto/books/book.create.dto';
import { UserResponseDto } from 'libs/dto/user/user.response.dto';
import { DeleteBookDto, UpdateBookDto } from 'libs/dto/books/book.update.dto';
import { OptionalAuthGuard } from 'libs/guards/optional.guard';
import {
  allBooksDto,
  BooksResponseDto,
} from 'libs/dto/books/book.response.dto';

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
    @AuthenticatedUser() user: UserResponseDto,
  ): Promise<BooksResponseDto> {
    this.logger.debug(`Book create user: ${JSON.stringify(user)}`);
    this.logger.verbose(`input: ${JSON.stringify(input)}`);
    const { id } = user;
    const result = await this.bookService.createBook(id, input);
    this.logger.debug(`Book created result: ${JSON.stringify(result)}`);

    return result;
  }

  // update book
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Put('update')
  async updateBook(
    @Body() input: UpdateBookDto,
    @AuthenticatedUser() user: UserResponseDto,
  ): Promise<BooksResponseDto> {
    this.logger.debug(`Book update user: ${JSON.stringify(user)}`);
    this.logger.verbose(`input: ${JSON.stringify(input)}`);
    const { id } = user;
    const { bookId, ...dto } = input;
    const result = await this.bookService.updateBook(bookId, id, dto);
    this.logger.debug(`Book update result: ${JSON.stringify(result)}`);

    return result;
  }

  // delete book
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Delete('delete')
  async deleteBook(
    @Body() input: DeleteBookDto,
    @AuthenticatedUser() user: UserResponseDto,
  ): Promise<BooksResponseDto> {
    this.logger.debug(`Book delete user: ${JSON.stringify(user)}`);
    this.logger.verbose(`input: ${JSON.stringify(input)}`);
    const { id } = user;
    const { bookId, ...dto } = input;
    const result = await this.bookService.deleteBook(bookId, id);
    this.logger.debug(`Book delete result: ${JSON.stringify(result)}`);

    return result;
  }

  //  get all books
  @UseGuards(OptionalAuthGuard)
  @Get('all-books')
  async getBooks(
    @Query() query: allBooksDto,
    @AuthenticatedUser() user: UserResponseDto,
  ) {
    const role = user?.role ?? undefined;
    this.logger.debug(
      `BookController ~ getBooks ~ query: ${JSON.stringify(query)}`,
    );
    this.logger.debug(`allBooks role: ${role}`);

    return await this.bookService.getAllBooks({
      page: query.page,
      limit: query.limit,
      search: query.search,
      sort: query.sort,
      category: query.category,
      role,
    });
  }

  // get single book
  @Get(':id')
  async getBookById(@Param('id') id: string): Promise<BooksResponseDto> {
    const bookId = parseInt(id, 10);
    if (isNaN(bookId)) {
      throw new NotFoundException('Invalid book ID');
    }

    return await this.bookService.getBookById(bookId, true);
  }
}

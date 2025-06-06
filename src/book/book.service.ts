import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookDto } from 'libs/dto/books/book.create.dto';
import { BooksResponseDto } from 'libs/dto/books/book.response.dto';
import { UpdateBookDto } from 'libs/dto/books/book.update.dto';
import { Message } from 'libs/enums/common.enum';
import { PrismaService } from 'prisma/src/prisma.service';

@Injectable()
export class BookService {
  private readonly logger = new Logger(BookService.name);
  constructor(private readonly prisma: PrismaService) {}

  // create book
  public async createBook(
    ownerId: number,
    dto: CreateBookDto,
  ): Promise<BooksResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (!user) {
      throw new NotFoundException(Message.USER_NOT_FOUND);
    }
    const duplicate = await this.prisma.book.findFirst({
      where: {
        title: dto.title,
        author: dto.author,
        edition: dto.edition,
        ownerId,
      },
    });

    if (duplicate) {
      throw new ConflictException(Message.BOOK_DUPLICATE);
    }

    const book = await this.prisma.book.create({
      data: {
        title: dto.title,
        author: dto.author,
        description: dto.description,
        price: dto.price,
        amount: dto.amount,
        thumbnailUrl: dto.thumbnailUrl,
        edition: dto.edition,
        publisher: dto.publisher,
        publication_date: dto.publication_date,
        category: dto.category,
        language: dto.language,
        print_length: dto.print_length,
        ownerId,
      },
    });
    this.logger.verbose(`Book created: ${book.title} by user ${user?.email}`);
    return book;
  }

  // update book
  public async updateBook(
    bookId: number,
    ownerId: number,
    dto: Partial<UpdateBookDto>,
  ): Promise<BooksResponseDto> {
    const book = await this.getBookById(bookId);

    if (book.ownerId !== ownerId) {
      throw new BadRequestException(Message.UNAUTHORIZED_ACTION);
    }

    // clean update object
    const data: Partial<BooksResponseDto> = {};
    if (dto.title) data.title = dto.title;
    if (dto.author) data.author = dto.author;
    if (dto.description) data.description = dto.description;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.thumbnailUrl) data.thumbnailUrl = dto.thumbnailUrl;
    if (dto.edition) data.edition = dto.edition;
    if (dto.publisher) data.publisher = dto.publisher;
    if (dto.publication_date)
      data.publication_date = new Date(dto.publication_date);
    if (dto.category) data.category = dto.category;
    if (dto.language) data.language = dto.language;
    if (dto.print_length !== undefined) data.print_length = dto.print_length;

    data.updatedAt = new Date();

    return this.prisma.book.update({
      where: { id: bookId, ownerId },
      data,
    });
  }

  // helpers
  private async getBookById(id: number): Promise<BooksResponseDto> {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new NotFoundException(Message.NO_DATA_FOUND);
    }
    return book;
  }
}

import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookDto } from 'libs/dto/books/book.create.dto';
import { BooksResponseDto } from 'libs/dto/books/book.response.dto';
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
        ...dto,
        ownerId,
      },
    });
    this.logger.verbose(`Book created: ${book.title} by user ${user?.email}`);
    return book;
  }
}

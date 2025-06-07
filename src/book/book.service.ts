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
import * as path from 'path';
import * as fs from 'fs';
import { BookCategory, BookStatus, Role } from '@prisma/client';

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

  // delete book
  public async deleteBook(
    id: number,
    ownerId: number,
  ): Promise<BooksResponseDto> {
    const book = await this.prisma.book.findUnique({ where: { id, ownerId } });

    if (!book) throw new NotFoundException(Message.NO_DATA_FOUND);
    if (book.thumbnailUrl) {
      const absolutePath = path.join(process.cwd(), book.thumbnailUrl);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    }
    const deletedBook = await this.prisma.book.delete({
      where: { id, ownerId },
    });

    this.logger.log(`Book and image deleted by user ${ownerId}`);
    return deletedBook;
  }

  public async getBookById(id: number): Promise<BooksResponseDto> {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new NotFoundException(Message.NO_DATA_FOUND);
    }
    return book;
  }

  // get all books
  public async getAllBooks(params: {
    page: number;
    limit: number;
    search?: string;
    sort?: 'newest' | 'top_rated' | 'most_sold';
    category?: BookCategory;
    role?: Role;
  }): Promise<{
    data: BooksResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      sort = 'newest',
      category,
      role,
    } = params;

    const whereClause: any = {};

    if (role !== 'ADMIN') {
      whereClause.status = BookStatus.ACTIVE;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      whereClause.category = category;
    }

    let orderByClause: any = { createdAt: 'desc' };
    if (sort === 'top_rated') orderByClause = { ratings: 'desc' };
    else if (sort === 'most_sold') orderByClause = { soldCount: 'desc' };

    const [total, books] = await this.prisma.$transaction([
      this.prisma.book.count({ where: whereClause }),
      this.prisma.book.findMany({
        where: whereClause,
        orderBy: orderByClause,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: books,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}

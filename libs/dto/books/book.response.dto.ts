import { BookCategory } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class BooksResponseDto {
  id: number;
  title: string;
  author: string;
  description?: string | null;
  price: number;
  amount: number;
  thumbnailUrl?: string | null;
  soldCount: number;
  ratings: number;
  edition?: string | null;
  publisher?: string | null;
  publication_date: Date;
  category: BookCategory;
  language: string;
  print_length: number;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class allBooksDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  page: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  limit: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  sort?: 'newest' | 'top_rated' | 'most_sold';

  @IsOptional()
  @IsEnum(BookCategory)
  category?: BookCategory;
}

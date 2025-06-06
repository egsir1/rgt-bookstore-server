import { BookCategory } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateBookDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  bookId: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({}, { message: 'price must be a number (float or int)' })
  price?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  amount?: number;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  edition?: string;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsNotEmpty()
  publication_date?: Date;

  @IsOptional()
  @IsEnum(BookCategory)
  category: BookCategory;

  @IsOptional()
  @IsString()
  language: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({}, { message: 'print_length must be a number (float or int)' })
  print_length: number;
}

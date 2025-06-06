import { BookCategory } from '@prisma/client';

export class BooksResponseDto {
  id: number;
  title: string;
  author: string;
  description?: string;
  price: number;
  amount: number;
  thumbnailUrl?: string;
  soldCount: number;
  ratings: string;
  edition?: string;
  publisher?: string;
  publication_date: Date;
  category: BookCategory;
  language: string;
  print_length: number;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}

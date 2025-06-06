import { BookCategory } from '@prisma/client';

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

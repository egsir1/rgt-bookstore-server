import { Role } from '@prisma/client';

export class UserResponseDto {
  id: number;
  email: string;
  name?: string | null;
  role: Role;
  books?: any;
  createdAt: Date;
  updatedAt: Date;
}

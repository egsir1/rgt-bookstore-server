import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { AuthModule } from 'src/auth/auth.module';
import { RolesGuard } from 'libs/guards/roles.guard';

@Module({
  imports: [AuthModule],
  providers: [BookService, RolesGuard],
  controllers: [BookController],
})
export class BookModule {}

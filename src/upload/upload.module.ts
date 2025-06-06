import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UploadController } from './upload.controller';

@Module({
  imports: [AuthModule],
  providers: [UploadController],
  controllers: [UploadController],
})
export class UploadModule {}

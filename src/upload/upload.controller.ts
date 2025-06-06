import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { AuthGuard } from 'libs/guards/auth.guard';
import { img_file_size } from 'config';
import { Message } from 'libs/enums/common.enum';

@Controller('upload')
export class UploadController {
  @UseGuards(AuthGuard)
  @Post(':type/single')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: img_file_size },
      fileFilter: (req, file, callback) => {
        const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(Message.ALLOWED_IMG_TYPES),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )

  // SINGLE UPLOAD
  async uploadSingleImage(
    @Param('type') type: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(Message.NO_FILE_UPLOAD);
    }

    const uniqueSuffix = uuidv4() + extname(file.originalname);
    const uploadPath = getUploadPath(type);
    const fullPath = path.join(uploadPath, uniqueSuffix);

    try {
      if (file.mimetype.includes('svg')) {
        fs.writeFileSync(fullPath, file.buffer);
      } else {
        await sharp(file.buffer)
          .resize({ width: 1280, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 70 })
          .toFile(fullPath);
      }

      return {
        message: `${capitalize(type)} image uploaded & compressed successfully.`,
        filename: uniqueSuffix,
        path: `/uploads/${type}-images/${uniqueSuffix}`,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to process image: ${error.message}`,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Post(':type/multiple')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: memoryStorage(),
      limits: { fileSize: img_file_size },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException(Message.ALLOWED_IMG_TYPES),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  // UPLOAD UMLTIPLE IMAGES
  async uploadMultipleImages(
    @Param('type') type: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException(Message.NO_FILE_UPLOAD);
    }

    const uploadPath = getUploadPath(type);
    const uploadedFiles: { filename: string; path: string }[] = [];

    for (const file of files) {
      const uniqueSuffix = uuidv4() + extname(file.originalname);
      const fullPath = path.join(uploadPath, uniqueSuffix);

      try {
        if (file.mimetype.includes('svg')) {
          fs.writeFileSync(fullPath, file.buffer);
        } else {
          await sharp(file.buffer)
            .resize({ width: 1280, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 70 })
            .toFile(fullPath);
        }

        uploadedFiles.push({
          filename: uniqueSuffix,
          path: `/uploads/${type}-images/${uniqueSuffix}`,
        });
      } catch (error) {
        throw new BadRequestException(
          `${Message.UPLOAD_FAILED} ${error.message}`,
        );
      }
    }

    return {
      message: `${capitalize(type)} images uploaded & compressed successfully.`,
      files: uploadedFiles,
    };
  }
}

// Helper to get the correct folder
const getUploadPath = (type: string) => {
  switch (type) {
    case 'user':
      return './uploads/user-images';
    case 'book':
      return './uploads/book-images';
    default:
      throw new BadRequestException(Message.INVALID_UPLOAD);
  }
};

const capitalize = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

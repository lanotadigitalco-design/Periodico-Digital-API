import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Solo se permiten archivos de imagen'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir una imagen' })
  @ApiResponse({
    status: 201,
    description: 'Imagen subida exitosamente',
    schema: {
      example: {
        url: '/uploads/1705700000000-imagen.jpg',
        filename: '1705700000000-imagen.jpg',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Archivo inválido' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file);
  }

  @Post('images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Solo se permiten archivos de imagen'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB por imagen
    }),
  )
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir múltiples imágenes' })
  @ApiResponse({
    status: 201,
    description: 'Imágenes subidas exitosamente',
    schema: {
      example: {
        urls: [
          '/uploads/1705700000000-imagen1.jpg',
          '/uploads/1705700001000-imagen2.jpg',
        ],
        filenames: [
          '1705700000000-imagen1.jpg',
          '1705700001000-imagen2.jpg',
        ],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Archivos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadService.uploadMultiple(files);
  }
}

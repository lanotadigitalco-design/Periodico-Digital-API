import {
  Controller,
  Post,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  BadRequestException,
  Param,
  Body,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
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
  @ApiOperation({
    summary: 'Subir una imagen (se convierte a WebP y se aloja en Cloudinary)',
  })
  @ApiResponse({
    status: 201,
    description: 'Imagen subida exitosamente',
    schema: {
      example: {
        url: 'https://res.cloudinary.com/demo/image/upload/v1/articulos/imagen.webp',
        filename: 'articulos/imagen',
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
  @ApiOperation({
    summary:
      'Subir múltiples imágenes (se convierten a WebP y se alojan en Cloudinary)',
  })
  @ApiResponse({
    status: 201,
    description: 'Imágenes subidas exitosamente',
    schema: {
      example: {
        urls: [
          'https://res.cloudinary.com/demo/image/upload/v1/articulos/imagen1.webp',
          'https://res.cloudinary.com/demo/image/upload/v1/articulos/imagen2.webp',
        ],
        filenames: ['articulos/imagen1', 'articulos/imagen2'],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Archivos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadService.uploadMultiple(files);
  }

  @Get('image/:filename')
  @ApiOperation({
    summary:
      'Redirige a la URL de Cloudinary de la imagen (compatibilidad con enlaces existentes)',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirección a la imagen alojada en Cloudinary',
  })
  getImage(@Param('filename') filename: string, @Res() res: Response) {
    res.redirect(this.uploadService.getPublicUrl(filename));
  }

  @Delete('image/:filename')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Eliminar una imagen de Cloudinary (filename = public_id, URL-encoded)',
  })
  @ApiResponse({
    status: 200,
    description: 'Imagen eliminada exitosamente',
    schema: {
      example: {
        message: 'Imagen articulos/imagen eliminada correctamente',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'No se pudo eliminar la imagen' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async deleteImage(@Param('filename') filename: string) {
    try {
      return await this.uploadService.deleteFile(filename);
    } catch (error) {
      throw new BadRequestException('No se pudo eliminar la imagen');
    }
  }

  @Delete('images/batch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar múltiples imágenes de Cloudinary' })
  @ApiResponse({
    status: 200,
    description: 'Imágenes eliminadas exitosamente',
    schema: {
      example: {
        message: '2 archivo(s) eliminado(s) correctamente',
        deleted: ['articulos/imagen1', 'articulos/imagen2'],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  deleteMultipleImages(@Body() body: { filenames: string[] }) {
    try {
      return this.uploadService.deleteMultipleFiles(body.filenames);
    } catch (error) {
      throw new BadRequestException('Error al eliminar las imágenes');
    }
  }
}

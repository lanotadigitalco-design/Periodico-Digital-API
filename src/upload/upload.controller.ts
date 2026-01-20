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
  Res,
  NotFoundException,
  Body,
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
        filenames: ['1705700000000-imagen1.jpg', '1705700001000-imagen2.jpg'],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Archivos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadService.uploadMultiple(files);
  }

  @Get('image/:filename')
  @ApiOperation({ summary: 'Recuperar una imagen' })
  @ApiResponse({
    status: 200,
    description: 'Imagen recuperada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
  getImage(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const { file, mimetype } = this.uploadService.getFile(filename);
      res.set('Content-Type', mimetype);
      res.send(file);
    } catch (error) {
      throw new NotFoundException('Imagen no encontrada');
    }
  }

  @Post('images/multiple')
  @ApiOperation({ summary: 'Recuperar múltiples imágenes' })
  @ApiResponse({
    status: 200,
    description: 'Imágenes recuperadas exitosamente',
    schema: {
      example: [
        {
          filename: '1705700000000-imagen1.jpg',
          data: 'base64_encoded_data',
          mimetype: 'image/jpeg',
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  getMultipleImages(@Body() body: { filenames: string[] }) {
    try {
      const files = this.uploadService.getMultipleFiles(body.filenames);
      return files.map((file) => ({
        filename: file.filename,
        data: file.file.toString('base64'),
        mimetype: file.mimetype,
      }));
    } catch (error) {
      throw new BadRequestException('Error al recuperar las imágenes');
    }
  }

  @Delete('image/:filename')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar una imagen' })
  @ApiResponse({
    status: 200,
    description: 'Imagen eliminada exitosamente',
    schema: {
      example: {
        message: 'Archivo 1705700000000-imagen.jpg eliminado correctamente',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  deleteImage(@Param('filename') filename: string) {
    try {
      return this.uploadService.deleteFile(filename);
    } catch (error) {
      throw new NotFoundException('Imagen no encontrada');
    }
  }

  @Delete('images/batch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar múltiples imágenes' })
  @ApiResponse({
    status: 200,
    description: 'Imágenes eliminadas exitosamente',
    schema: {
      example: {
        message: '2 archivo(s) eliminado(s) correctamente',
        deleted: ['1705700000000-imagen1.jpg', '1705700001000-imagen2.jpg'],
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

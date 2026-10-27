import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

// sharp publica declaraciones duales (ESM/CJS) que TS resuelve de forma
// ambigua bajo moduleResolution "node10"; se usa require directo.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp');

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
    this.logger.log('UploadService inicializado (Cloudinary)');
  }

  private async toWebp(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer).webp({ quality: 80 }).toBuffer();
  }

  private uploadBuffer(buffer: Buffer): Promise<UploadApiResponse> {
    // public_id sin "/" a propósito: el frontend trata los identificadores
    // de imagen como nombres planos (split("/").pop()) en varios lugares.
    const publicId = `articulo-${uuidv4()}`;

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          format: 'webp',
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Falló la subida a Cloudinary'));
            return;
          }
          resolve(result);
        },
      );
      stream.end(buffer);
    });
  }

  getPublicUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      resource_type: 'image',
      format: 'webp',
      secure: true,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
  ): Promise<{ url: string; filename: string }> {
    if (!file) {
      this.logger.error('Intento de subir archivo sin proporcionar archivo');
      throw new Error('No file provided');
    }

    this.logger.log(
      `Procesando imagen: ${file.originalname} (${file.size} bytes)`,
    );
    const webpBuffer = await this.toWebp(file.buffer);
    const result = await this.uploadBuffer(webpBuffer);
    this.logger.log(`Imagen subida a Cloudinary: ${result.public_id}`);

    return {
      url: result.secure_url,
      filename: result.public_id,
    };
  }

  async uploadMultiple(files: Express.Multer.File[]): Promise<{
    urls: string[];
    filenames: string[];
  }> {
    if (!files || files.length === 0) {
      this.logger.error(
        'Intento de subir múltiples archivos sin proporcionar archivos',
      );
      throw new Error('No files provided');
    }

    this.logger.log(`Subiendo ${files.length} archivos`);
    const results = await Promise.all(
      files.map((file) => this.uploadFile(file)),
    );
    this.logger.log(`${files.length} archivos subidos exitosamente`);

    return {
      urls: results.map((r) => r.url),
      filenames: results.map((r) => r.filename),
    };
  }

  async deleteFile(publicId: string): Promise<{ message: string }> {
    this.logger.log(`Eliminando imagen de Cloudinary: ${publicId}`);
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      this.logger.error(
        `Error al eliminar imagen ${publicId}: ${result.result}`,
      );
      throw new Error(`No se pudo eliminar la imagen: ${result.result}`);
    }

    this.logger.log(`Imagen eliminada exitosamente: ${publicId}`);
    return { message: `Imagen ${publicId} eliminada correctamente` };
  }

  async deleteMultipleFiles(publicIds: string[]): Promise<{
    message: string;
    deleted: string[];
  }> {
    this.logger.log(`Intentando eliminar ${publicIds.length} imágenes`);
    const deleted: string[] = [];

    for (const publicId of publicIds) {
      try {
        await this.deleteFile(publicId);
        deleted.push(publicId);
      } catch (error) {
        this.logger.error(
          `Error al eliminar imagen ${publicId}: ${error.message}`,
        );
      }
    }

    this.logger.log(
      `${deleted.length}/${publicIds.length} imágenes eliminadas exitosamente`,
    );
    return {
      message: `${deleted.length} archivo(s) eliminado(s) correctamente`,
      deleted,
    };
  }
}

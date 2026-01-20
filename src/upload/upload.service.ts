import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Crear directorio si no existe
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
      this.logger.log(`Directorio de uploads creado: ${this.uploadsDir}`);
    }
    this.logger.log('UploadService inicializado');
  }

  uploadFile(file: Express.Multer.File): { url: string; filename: string } {
    if (!file) {
      this.logger.error('Intento de subir archivo sin proporcionar archivo');
      throw new Error('No file provided');
    }

    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(this.uploadsDir, filename);

    this.logger.log(`Subiendo archivo: ${filename} (${file.size} bytes)`);
    fs.writeFileSync(filepath, file.buffer);
    this.logger.log(`Archivo subido exitosamente: ${filename}`);

    return {
      filename,
      url: `/api/uploads/${filename}`,
    };
  }

  uploadMultiple(files: Express.Multer.File[]): {
    urls: string[];
    filenames: string[];
  } {
    if (!files || files.length === 0) {
      this.logger.error(
        'Intento de subir múltiples archivos sin proporcionar archivos',
      );
      throw new Error('No files provided');
    }

    this.logger.log(`Subiendo ${files.length} archivos`);
    const result: { urls: string[]; filenames: string[] } = {
      urls: [],
      filenames: [],
    };

    files.forEach((file, index) => {
      const filename = `${Date.now()}-${Math.random()}-${file.originalname}`;
      const filepath = path.join(this.uploadsDir, filename);

      fs.writeFileSync(filepath, file.buffer);
      this.logger.log(
        `Archivo ${index + 1}/${files.length} subido: ${filename}`,
      );

      result.filenames.push(filename);
      result.urls.push(`/api/uploads/${filename}`);
    });

    this.logger.log(`${files.length} archivos subidos exitosamente`);
    return result;
  }

  getFile(filename: string): { file: Buffer; mimetype: string } {
    const filepath = path.join(this.uploadsDir, filename);

    this.logger.log(`Intentando recuperar archivo: ${filename}`);
    if (!fs.existsSync(filepath)) {
      this.logger.error(`Archivo no encontrado: ${filename}`);
      throw new Error('Archivo no encontrado');
    }

    const file = fs.readFileSync(filepath);
    const ext = path.extname(filename).toLowerCase();
    const mimetypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };

    this.logger.log(
      `Archivo recuperado exitosamente: ${filename} (${file.length} bytes)`,
    );
    return {
      file,
      mimetype: mimetypes[ext] || 'application/octet-stream',
    };
  }

  getMultipleFiles(
    filenames: string[],
  ): Array<{ filename: string; file: Buffer; mimetype: string }> {
    this.logger.log(`Recuperando ${filenames.length} archivos`);
    const result = filenames.map((filename) => {
      const { file, mimetype } = this.getFile(filename);
      return { filename, file, mimetype };
    });
    this.logger.log(`${filenames.length} archivos recuperados exitosamente`);
    return result;
  }

  deleteFile(filename: string): { message: string } {
    const filepath = path.join(this.uploadsDir, filename);

    this.logger.log(`Intentando eliminar archivo: ${filename}`);
    if (!fs.existsSync(filepath)) {
      this.logger.error(`Archivo no encontrado para eliminar: ${filename}`);
      throw new Error('Archivo no encontrado');
    }

    fs.unlinkSync(filepath);
    this.logger.log(`Archivo eliminado exitosamente: ${filename}`);
    return { message: `Archivo ${filename} eliminado correctamente` };
  }

  deleteMultipleFiles(filenames: string[]): {
    message: string;
    deleted: string[];
  } {
    this.logger.log(`Intentando eliminar ${filenames.length} archivos`);
    const deleted: string[] = [];

    filenames.forEach((filename) => {
      try {
        const filepath = path.join(this.uploadsDir, filename);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
          deleted.push(filename);
          this.logger.log(`Archivo eliminado: ${filename}`);
        } else {
          this.logger.warn(`Archivo no encontrado: ${filename}`);
        }
      } catch (error) {
        this.logger.error(
          `Error al eliminar archivo ${filename}: ${error.message}`,
        );
      }
    });

    this.logger.log(
      `${deleted.length}/${filenames.length} archivos eliminados exitosamente`,
    );
    return {
      message: `${deleted.length} archivo(s) eliminado(s) correctamente`,
      deleted,
    };
  }
}

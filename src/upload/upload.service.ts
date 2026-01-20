import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Crear directorio si no existe
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  uploadFile(file: Express.Multer.File): { url: string; filename: string } {
    if (!file) {
      throw new Error('No file provided');
    }

    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(this.uploadsDir, filename);

    fs.writeFileSync(filepath, file.buffer);

    return {
      filename,
      url: `/uploads/${filename}`,
    };
  }

  uploadMultiple(
    files: Express.Multer.File[],
  ): { urls: string[]; filenames: string[] } {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const result = {
      urls: [],
      filenames: [],
    };

    files.forEach((file) => {
      const filename = `${Date.now()}-${Math.random()}-${file.originalname}`;
      const filepath = path.join(this.uploadsDir, filename);

      fs.writeFileSync(filepath, file.buffer);

      result.filenames.push(filename);
      result.urls.push(`/uploads/${filename}`);
    });

    return result;
  }

  deleteFile(filename: string): void {
    const filepath = path.join(this.uploadsDir, filename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }
}

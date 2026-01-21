import { Injectable, Logger } from '@nestjs/common';
import { CreateLiveStreamDto } from './dto/create-live-stream.dto';
import { UpdateLiveStreamDto } from './dto/update-live-stream.dto';
import { LiveStreamCacheService } from './live-stream-cache.service';

@Injectable()
export class LiveStreamService {
  private readonly logger = new Logger(LiveStreamService.name);

  constructor(private readonly cacheService: LiveStreamCacheService) {
    this.logger.debug('LiveStreamService inicializado');
  }

  async get(): Promise<any> {
    this.logger.debug('Obteniendo transmisión desde Redis');
    const stream = await this.cacheService.getLiveStream();

    if (stream) {
      this.logger.log(`Transmisión encontrada: "${stream.titulo}"`);
      return stream;
    }

    this.logger.log('No hay transmisión disponible');
    return null;
  }

  async upsert(dto: CreateLiveStreamDto): Promise<any> {
    this.logger.log('Creando o actualizando transmisión en Redis');

    const existing = await this.cacheService.getLiveStream();
    const now = new Date();

    const liveStream = {
      url: dto.url,
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      activo: dto.activo ?? true,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    await this.cacheService.setLiveStream(liveStream);
    this.logger.log(
      `Transmisión ${existing ? 'actualizada' : 'creada'} en Redis: "${dto.titulo}"`,
    );

    return liveStream;
  }

  async remove(): Promise<void> {
    this.logger.log('Eliminando transmisión de Redis');
    await this.cacheService.deleteLiveStream();
    this.logger.log('Transmisión eliminada de Redis');
  }
}

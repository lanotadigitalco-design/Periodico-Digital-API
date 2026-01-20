import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveStream } from '../entities/live-stream.entity';
import { CreateLiveStreamDto } from './dto/create-live-stream.dto';
import { UpdateLiveStreamDto } from './dto/update-live-stream.dto';

@Injectable()
export class LiveStreamService {
  private readonly logger = new Logger(LiveStreamService.name);

  constructor(
    @InjectRepository(LiveStream)
    private repo: Repository<LiveStream>,
  ) {
    this.logger.log('LiveStreamService inicializado');
  }

  async create(dto: CreateLiveStreamDto): Promise<LiveStream | null> {
    this.logger.log('Intentando crear o actualizar live stream (ID: 1)');
    // Hacer upsert: si existe ID 1, actualizar; si no, crear
    const existing = await this.repo.findOne({ where: { id: 1 } });
    
    if (existing) {
      // Actualizar
      this.logger.log('Live stream existente encontrado, actualizando...');
      await this.repo.update(1, {
        url: dto.url,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        activo: dto.activo ?? true,
      });
      const updated = await this.repo.findOne({ where: { id: 1 } });
      this.logger.log(`Live stream actualizado: "${dto.titulo}"`);
      return updated;
    } else {
      // Crear con ID 1
      this.logger.log('Creando nuevo live stream con ID: 1');
      const newStream = this.repo.create({
        id: 1,
        url: dto.url,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        activo: dto.activo ?? true,
      });
      const saved = await this.repo.save(newStream);
      this.logger.log(`Live stream creado: "${dto.titulo}"`);
      return saved;
    }
  }

  async findActive(): Promise<LiveStream | null> {
    this.logger.log('Buscando live stream activo');
    const stream = await this.repo.findOne({ where: { activo: true } });
    if (stream) {
      this.logger.log(`Live stream activo encontrado: "${stream.titulo}"`);
    } else {
      this.logger.log('No hay live stream activo');
    }
    return stream;
  }

  async findOne(id: number): Promise<LiveStream | null> {
    this.logger.log(`Buscando live stream con ID: ${id}`);
    const stream = await this.repo.findOne({ where: { id } });
    if (stream) {
      this.logger.log(`Live stream encontrado: "${stream.titulo}"`);
    } else {
      this.logger.warn(`Live stream con ID ${id} no encontrado`);
    }
    return stream;
  }

  async findAll(): Promise<LiveStream[]> {
    this.logger.log('Obteniendo todos los live streams');
    const streams = await this.repo.find({ order: { createdAt: 'DESC' } });
    this.logger.log(`Se encontraron ${streams.length} live streams`);
    return streams;
  }

  async update(id: number, dto: UpdateLiveStreamDto): Promise<LiveStream | null> {
    this.logger.log(`Actualizando live stream ID: ${id}`);
    // Siempre actualizar el ID 1
    await this.repo.update(1, {
      ...(dto.url && { url: dto.url }),
      ...(dto.titulo && { titulo: dto.titulo }),
      ...(dto.descripcion && { descripcion: dto.descripcion }),
      ...(dto.activo !== undefined && { activo: dto.activo }),
    });

    const updated = await this.repo.findOne({ where: { id: 1 } });
    this.logger.log('Live stream actualizado exitosamente');
    return updated;
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Desactivando live stream ID: ${id}`);
    // No permitir eliminar, solo desactivar
    await this.repo.update(id, { activo: false });
    this.logger.log(`Live stream ${id} desactivado`);
  }
}


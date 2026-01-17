import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveStream } from '../entities/live-stream.entity';
import { CreateLiveStreamDto } from './dto/create-live-stream.dto';
import { UpdateLiveStreamDto } from './dto/update-live-stream.dto';

@Injectable()
export class LiveStreamService {
  constructor(
    @InjectRepository(LiveStream)
    private repo: Repository<LiveStream>,
  ) {}

  async create(dto: CreateLiveStreamDto): Promise<LiveStream | null> {
    // Hacer upsert: si existe ID 1, actualizar; si no, crear
    const existing = await this.repo.findOne({ where: { id: 1 } });
    
    if (existing) {
      // Actualizar
      await this.repo.update(1, {
        url: dto.url,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        activo: dto.activo ?? true,
      });
      return this.repo.findOne({ where: { id: 1 } });
    } else {
      // Crear con ID 1
      const newStream = this.repo.create({
        id: 1,
        url: dto.url,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        activo: dto.activo ?? true,
      });
      return this.repo.save(newStream);
    }
  }

  async findActive(): Promise<LiveStream | null> {
    return this.repo.findOne({ where: { activo: true } });
  }

  async findOne(id: number): Promise<LiveStream | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(): Promise<LiveStream[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async update(id: number, dto: UpdateLiveStreamDto): Promise<LiveStream | null> {
    // Siempre actualizar el ID 1
    await this.repo.update(1, {
      ...(dto.url && { url: dto.url }),
      ...(dto.titulo && { titulo: dto.titulo }),
      ...(dto.descripcion && { descripcion: dto.descripcion }),
      ...(dto.activo !== undefined && { activo: dto.activo }),
    });

    return this.repo.findOne({ where: { id: 1 } });
  }

  async remove(id: number): Promise<void> {
    // No permitir eliminar, solo desactivar
    await this.repo.update(id, { activo: false });
  }
}


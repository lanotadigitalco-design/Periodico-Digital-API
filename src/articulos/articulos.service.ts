import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Articulo } from '../entities/articulo.entity';
import { Usuario } from '../entities/usuario.entity';
import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';
import { RolEnum } from '../entities/rol.entity';

@Injectable()
export class ArticulosService {
  private readonly logger = new Logger(ArticulosService.name);

  constructor(
    @InjectRepository(Articulo)
    private articuloRepository: Repository<Articulo>,
  ) {
    this.logger.log('ArticulosService inicializado');
  }

  async create(createArticuloDto: CreateArticuloDto, usuario: Usuario) {
    this.logger.log(
      `Creando artículo: "${createArticuloDto.titulo}" por usuario: ${usuario.email}`,
    );
    const articulo = this.articuloRepository.create({
      ...createArticuloDto,
      autores: [usuario],
    });

    const saved = await this.articuloRepository.save(articulo);
    this.logger.log(`Artículo creado exitosamente con ID: ${saved.id}`);
    return saved;
  }

  async findAll() {
    this.logger.log('Obteniendo lista de artículos publicados');
    const articulos = await this.articuloRepository.find({
      where: { publicado: true },
      relations: ['autores', 'autores.rol'],
      order: { createdAt: 'DESC' },
    });
    this.logger.log(`Se encontraron ${articulos.length} artículos publicados`);
    return articulos;
  }

  async findOne(id: number) {
    this.logger.log(`Buscando artículo con ID: ${id}`);
    const articulo = await this.articuloRepository.findOne({
      where: { id },
      relations: [
        'autores',
        'autores.rol',
        'comentarios',
        'comentarios.usuario',
      ],
    });

    if (!articulo) {
      this.logger.warn(`Artículo con ID ${id} no encontrado`);
      throw new NotFoundException(`Artículo con ID ${id} no encontrado`);
    }

    this.logger.log(`Artículo encontrado: "${articulo.titulo}"`);
    return articulo;
  }

  async search(query: string) {
    this.logger.log(`Buscando artículos con query: "${query}"`);
    const articulos = await this.articuloRepository.find({
      where: [
        { titulo: Like(`%${query}%`), publicado: true },
        { categoria: Like(`%${query}%`), publicado: true },
      ],
      relations: ['autores', 'autores.rol'],
      order: { createdAt: 'DESC' },
    });

    this.logger.log(
      `Se encontraron ${articulos.length} artículos con query: "${query}"`,
    );
    return articulos;
  }

  async searchByAutor(nombreAutor: string) {
    this.logger.log(`Buscando artículos por autor: "${nombreAutor}"`);
    const articulos = await this.articuloRepository
      .createQueryBuilder('articulo')
      .leftJoinAndSelect('articulo.autores', 'autor')
      .leftJoinAndSelect('autor.rol', 'rol')
      .where('articulo.publicado = :publicado', { publicado: true })
      .andWhere(
        '(autor.nombre LIKE :nombre OR autor.apellido LIKE :apellido)',
        {
          nombre: `%${nombreAutor}%`,
          apellido: `%${nombreAutor}%`,
        },
      )
      .orderBy('articulo.createdAt', 'DESC')
      .getMany();

    this.logger.log(
      `Se encontraron ${articulos.length} artículos del autor: "${nombreAutor}"`,
    );
    return articulos;
  }

  async update(
    id: number,
    updateArticuloDto: UpdateArticuloDto,
    usuario: Usuario,
  ) {
    this.logger.log(
      `Usuario ${usuario.email} intenta actualizar artículo: ${id}`,
    );
    const articulo = await this.findOne(id);

    // Verificar si el usuario es administrador o es autor del artículo
    const esAdmin = usuario.rol.nombre === RolEnum.ADMINISTRADOR;
    const esAutor = articulo.autores.some((autor) => autor.id === usuario.id);

    if (!esAdmin && !esAutor) {
      this.logger.warn(
        `Usuario ${usuario.email} sin permisos para modificar artículo: ${id}`,
      );
      throw new ForbiddenException(
        'No tienes permisos para modificar este artículo',
      );
    }

    Object.assign(articulo, updateArticuloDto);

    const updated = await this.articuloRepository.save(articulo);
    this.logger.log(
      `Artículo ${id} actualizado exitosamente por ${usuario.email}`,
    );
    return updated;
  }

  async remove(id: number, usuario: Usuario) {
    this.logger.log(
      `Usuario ${usuario.email} intenta eliminar artículo: ${id}`,
    );
    const articulo = await this.findOne(id);

    // Verificar si el usuario es administrador o es autor del artículo
    const esAdmin = usuario.rol.nombre === RolEnum.ADMINISTRADOR;
    const esAutor = articulo.autores.some((autor) => autor.id === usuario.id);

    if (!esAdmin && !esAutor) {
      this.logger.warn(
        `Usuario ${usuario.email} sin permisos para eliminar artículo: ${id}`,
      );
      throw new ForbiddenException(
        'No tienes permisos para eliminar este artículo',
      );
    }

    await this.articuloRepository.remove(articulo);
    this.logger.log(
      `Artículo ${id} eliminado exitosamente por ${usuario.email}`,
    );
    return { message: 'Artículo eliminado exitosamente' };
  }

  async incrementarVisualizaciones(id: number) {
    this.logger.log(`Incrementando visualizaciones del artículo: ${id}`);
    await this.articuloRepository.increment(
      { id },
      'contadorVisualizaciones',
      1,
    );
  }

  async findUnpublished() {
    this.logger.log('Obteniendo lista de artículos no publicados');
    const articulos = await this.articuloRepository.find({
      where: { publicado: false },
      relations: ['autores', 'autores.rol'],
      order: { createdAt: 'DESC' },
    });
    this.logger.log(
      `Se encontraron ${articulos.length} artículos no publicados`,
    );
    return articulos;
  }
}

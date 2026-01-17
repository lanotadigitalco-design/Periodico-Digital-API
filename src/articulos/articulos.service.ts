import {
  Injectable,
  NotFoundException,
  ForbiddenException,
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
  constructor(
    @InjectRepository(Articulo)
    private articuloRepository: Repository<Articulo>,
  ) {}

  async create(createArticuloDto: CreateArticuloDto, usuario: Usuario) {
    const articulo = this.articuloRepository.create({
      ...createArticuloDto,
      autores: [usuario],
    });

    return this.articuloRepository.save(articulo);
  }

  async findAll() {
    return this.articuloRepository.find({
      where: { publicado: true },
      relations: ['autores', 'autores.rol'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
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
      throw new NotFoundException(`Artículo con ID ${id} no encontrado`);
    }

    return articulo;
  }

  async search(query: string) {
    const articulos = await this.articuloRepository.find({
      where: [
        { titulo: Like(`%${query}%`), publicado: true },
        { categoria: Like(`%${query}%`), publicado: true },
      ],
      relations: ['autores', 'autores.rol'],
      order: { createdAt: 'DESC' },
    });

    return articulos;
  }

  async searchByAutor(nombreAutor: string) {
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

    return articulos;
  }

  async update(
    id: number,
    updateArticuloDto: UpdateArticuloDto,
    usuario: Usuario,
  ) {
    const articulo = await this.findOne(id);

    // Verificar si el usuario es administrador o es autor del artículo
    const esAdmin = usuario.rol.nombre === RolEnum.ADMINISTRADOR;
    const esAutor = articulo.autores.some((autor) => autor.id === usuario.id);

    if (!esAdmin && !esAutor) {
      throw new ForbiddenException(
        'No tienes permisos para modificar este artículo',
      );
    }

    Object.assign(articulo, updateArticuloDto);

    return this.articuloRepository.save(articulo);
  }

  async remove(id: number, usuario: Usuario) {
    const articulo = await this.findOne(id);

    // Verificar si el usuario es administrador o es autor del artículo
    const esAdmin = usuario.rol.nombre === RolEnum.ADMINISTRADOR;
    const esAutor = articulo.autores.some((autor) => autor.id === usuario.id);

    if (!esAdmin && !esAutor) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar este artículo',
      );
    }

    await this.articuloRepository.remove(articulo);
    return { message: 'Artículo eliminado exitosamente' };
  }

  async incrementarVisualizaciones(id: number) {
    await this.articuloRepository.increment(
      { id },
      'contadorVisualizaciones',
      1,
    );
  }

  async findUnpublished() {
    return this.articuloRepository.find({
      where: { publicado: false },
      relations: ['autores', 'autores.rol'],
      order: { createdAt: 'DESC' },
    });
  }
}

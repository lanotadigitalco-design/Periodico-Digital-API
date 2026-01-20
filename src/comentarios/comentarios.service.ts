import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comentario } from '../entities/comentario.entity';
import { Articulo } from '../entities/articulo.entity';
import { Usuario } from '../entities/usuario.entity';
import { RolEnum } from '../entities/rol.entity';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';

@Injectable()
export class ComentariosService {
  private readonly logger = new Logger(ComentariosService.name);

  constructor(
    @InjectRepository(Comentario)
    private comentarioRepository: Repository<Comentario>,
    @InjectRepository(Articulo)
    private articuloRepository: Repository<Articulo>,
  ) {
    this.logger.log('ComentariosService inicializado');
  }

  async create(createComentarioDto: CreateComentarioDto, usuario: Usuario) {
    const { articuloId, comentarioPadreId, contenido } = createComentarioDto;

    this.logger.log(`Usuario ${usuario.email} crea comentario en artículo: ${articuloId}`);

    // Verificar que el artículo existe
    const articulo = await this.articuloRepository.findOne({
      where: { id: articuloId },
    });
    if (!articulo) {
      this.logger.warn(`Intento de comentar en artículo inexistente: ${articuloId}`);
      throw new NotFoundException(
        `Artículo con ID ${articuloId} no encontrado`,
      );
    }

    const comentario = this.comentarioRepository.create({
      contenido,
      articulo,
      usuario,
    });

    // Si es una respuesta a otro comentario
    if (comentarioPadreId) {
      const comentarioPadre = await this.comentarioRepository.findOne({
        where: { id: comentarioPadreId },
      });

      if (!comentarioPadre) {
        this.logger.warn(`Comentario padre ${comentarioPadreId} no encontrado`);
        throw new NotFoundException(
          `Comentario padre con ID ${comentarioPadreId} no encontrado`,
        );
      }

      comentario.padre = comentarioPadre;
      this.logger.log(`Comentario será respuesta de comentario: ${comentarioPadreId}`);
    }

    const saved = await this.comentarioRepository.save(comentario);
    this.logger.log(`Comentario creado exitosamente con ID: ${saved.id}`);
    return saved;
  }

  async findByArticulo(articuloId: number) {
    this.logger.log(`Obteniendo comentarios del artículo: ${articuloId}`);
    const articulo = await this.articuloRepository.findOne({
      where: { id: articuloId },
    });
    if (!articulo) {
      this.logger.warn(`Artículo ${articuloId} no encontrado`);
      throw new NotFoundException(
        `Artículo con ID ${articuloId} no encontrado`,
      );
    }

    // Obtener árbol completo de comentarios
    const comentarios = await this.comentarioRepository
      .createQueryBuilder('comentario')
      .leftJoinAndSelect('comentario.usuario', 'usuario')
      .leftJoinAndSelect('usuario.rol', 'rol')
      .leftJoinAndSelect('comentario.respuestas', 'respuestas')
      .leftJoinAndSelect('respuestas.usuario', 'respuestasUsuario')
      .where('comentario.articulo.id = :articuloId', { articuloId })
      .andWhere('comentario.padre IS NULL')
      .andWhere('comentario.visible = :visible', { visible: true })
      .orderBy('comentario.createdAt', 'DESC')
      .addOrderBy('respuestas.createdAt', 'ASC')
      .getMany();

    this.logger.log(`Se encontraron ${comentarios.length} comentarios principales para artículo: ${articuloId}`);
    return comentarios;
  }

  async findOne(id: string) {
    this.logger.log(`Buscando comentario con ID: ${id}`);
    const comentario = await this.comentarioRepository.findOne({
      where: { id },
      relations: ['usuario', 'articulo', 'respuestas'],
    });

    if (!comentario) {
      this.logger.warn(`Comentario con ID ${id} no encontrado`);
      throw new NotFoundException(`Comentario con ID ${id} no encontrado`);
    }

    return comentario;
  }

  async update(
    id: string,
    updateComentarioDto: UpdateComentarioDto,
    usuario: Usuario,
  ) {
    this.logger.log(`Usuario ${usuario.email} intenta actualizar comentario: ${id}`);
    const comentario = await this.findOne(id);

    // Solo el autor puede editar su comentario
    if (comentario.usuario.id !== usuario.id) {
      this.logger.warn(`Usuario ${usuario.email} sin permisos para editar comentario: ${id}`);
      throw new ForbiddenException(
        'No tienes permisos para editar este comentario',
      );
    }

    Object.assign(comentario, updateComentarioDto);

    const updated = await this.comentarioRepository.save(comentario);
    this.logger.log(`Comentario ${id} actualizado exitosamente`);
    return updated;
  }

  async remove(id: string, usuario: Usuario) {
    this.logger.log(`Usuario ${usuario.email} intenta eliminar comentario: ${id}`);
    const comentario = await this.findOne(id);

    // El autor o un administrador pueden eliminar el comentario
    const puedeEliminar =
      comentario.usuario.id === usuario.id ||
      usuario.rol.nombre === RolEnum.ADMINISTRADOR;

    if (!puedeEliminar) {
      this.logger.warn(`Usuario ${usuario.email} sin permisos para eliminar comentario: ${id}`);
      throw new ForbiddenException(
        'No tienes permisos para eliminar este comentario',
      );
    }

    // Soft delete: marcar como no visible
    comentario.visible = false;
    await this.comentarioRepository.save(comentario);

    this.logger.log(`Comentario ${id} marcado como no visible por ${usuario.email}`);
    return { message: 'Comentario eliminado exitosamente' };
  }
}

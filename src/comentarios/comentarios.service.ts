import {
  Injectable,
  NotFoundException,
  ForbiddenException,
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
  constructor(
    @InjectRepository(Comentario)
    private comentarioRepository: Repository<Comentario>,
    @InjectRepository(Articulo)
    private articuloRepository: Repository<Articulo>,
  ) {}

  async create(createComentarioDto: CreateComentarioDto, usuario: Usuario) {
    const { articuloId, comentarioPadreId, contenido } = createComentarioDto;

    // Verificar que el artículo existe
    const articulo = await this.articuloRepository.findOne({
      where: { id: articuloId },
    });
    if (!articulo) {
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
        throw new NotFoundException(
          `Comentario padre con ID ${comentarioPadreId} no encontrado`,
        );
      }

      comentario.padre = comentarioPadre;
    }

    return this.comentarioRepository.save(comentario);
  }

  async findByArticulo(articuloId: number) {
    const articulo = await this.articuloRepository.findOne({
      where: { id: articuloId },
    });
    if (!articulo) {
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

    return comentarios;
  }

  async findOne(id: string) {
    const comentario = await this.comentarioRepository.findOne({
      where: { id },
      relations: ['usuario', 'articulo', 'respuestas'],
    });

    if (!comentario) {
      throw new NotFoundException(`Comentario con ID ${id} no encontrado`);
    }

    return comentario;
  }

  async update(
    id: string,
    updateComentarioDto: UpdateComentarioDto,
    usuario: Usuario,
  ) {
    const comentario = await this.findOne(id);

    // Solo el autor puede editar su comentario
    if (comentario.usuario.id !== usuario.id) {
      throw new ForbiddenException(
        'No tienes permisos para editar este comentario',
      );
    }

    Object.assign(comentario, updateComentarioDto);

    return this.comentarioRepository.save(comentario);
  }

  async remove(id: string, usuario: Usuario) {
    const comentario = await this.findOne(id);

    // El autor o un administrador pueden eliminar el comentario
    const puedeEliminar =
      comentario.usuario.id === usuario.id ||
      usuario.rol.nombre === RolEnum.ADMINISTRADOR;

    if (!puedeEliminar) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar este comentario',
      );
    }

    // Soft delete: marcar como no visible
    comentario.visible = false;
    await this.comentarioRepository.save(comentario);

    return { message: 'Comentario eliminado exitosamente' };
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Articulo } from '../entities/articulo.entity';
import { Rol, RolEnum } from '../entities/rol.entity';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Articulo)
    private articuloRepository: Repository<Articulo>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
  ) {
    this.logger.log('UsuariosService inicializado');
  }

  async findAll() {
    this.logger.log('Obteniendo lista de todos los usuarios');
    const usuarios = await this.usuarioRepository.find({
      relations: ['rol', 'informacion'],
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        activo: true,
        createdAt: true,
        rol: {
          id: true,
          nombre: true,
        },
      },
    });
    this.logger.log(`Se encontraron ${usuarios.length} usuarios`);
    return usuarios;
  }

  async findOne(id: number) {
    this.logger.log(`Buscando usuario con ID: ${id}`);
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['rol', 'informacion'],
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        activo: true,
        createdAt: true,
        rol: {
          id: true,
          nombre: true,
        },
      },
    });

    if (!usuario) {
      this.logger.warn(`Usuario con ID ${id} no encontrado`);
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    this.logger.log(`Usuario encontrado: ${usuario.email}`);
    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    this.logger.log(`Actualizando usuario con ID: ${id}`);
    const usuario = await this.findOne(id);

    Object.assign(usuario, updateUsuarioDto);

    const updated = await this.usuarioRepository.save(usuario);
    this.logger.log(`Usuario actualizado exitosamente: ${id}`);
    return updated;
  }

  async remove(id: number, adminId: number) {
    this.logger.log(`Desactivando usuario con ID: ${id} por admin: ${adminId}`);
    const usuario = await this.findOne(id);

    // Desactivar el usuario en lugar de eliminarlo
    usuario.activo = false;
    await this.usuarioRepository.save(usuario);

    this.logger.log(`Usuario ${id} desactivado exitosamente`);
    return { message: 'Usuario desactivado exitosamente' };
  }

  async activate(id: number) {
    this.logger.log(`Reactivando usuario con ID: ${id}`);
    const usuario = await this.findOne(id);

    // Reactivar el usuario
    usuario.activo = true;
    await this.usuarioRepository.save(usuario);

    this.logger.log(`Usuario ${id} reactivado exitosamente`);
    return { message: 'Usuario reactivado exitosamente' };
  }

  async updateRol(id: number, rolNombre: string) {
    this.logger.log(`Actualizando rol de usuario ${id} a: ${rolNombre}`);
    const usuario = await this.findOne(id);

    // Normalizar el nombre del rol a minúsculas (como está en RolEnum)
    const rolNormalizado = rolNombre.toLowerCase();

    // Validar que el rol existe
    const rolesValidos = Object.values(RolEnum);
    if (!rolesValidos.includes(rolNormalizado as RolEnum)) {
      this.logger.warn(`Intento de asignar rol inválido: ${rolNombre}`);
      throw new BadRequestException(
        `Rol inválido. Los roles válidos son: ${rolesValidos.join(', ')}`,
      );
    }

    // Buscar el rol en la base de datos
    const rol = await this.rolRepository.findOne({
      where: { nombre: rolNormalizado as RolEnum },
    });

    if (!rol) {
      this.logger.error(
        `Rol ${rolNormalizado} no encontrado en la base de datos`,
      );
      throw new NotFoundException(`Rol ${rolNormalizado} no encontrado`);
    }

    usuario.rol = rol;
    const updated = await this.usuarioRepository.save(usuario);
    this.logger.log(
      `Rol de usuario ${id} actualizado exitosamente a: ${rolNormalizado}`,
    );
    return updated;
  }
}

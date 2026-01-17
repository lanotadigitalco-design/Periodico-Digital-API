import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Articulo } from '../entities/articulo.entity';
import { Rol, RolEnum } from '../entities/rol.entity';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Articulo)
    private articuloRepository: Repository<Articulo>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
  ) {}

  async findAll() {
    return this.usuarioRepository.find({
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
  }

  async findOne(id: number) {
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
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.findOne(id);

    Object.assign(usuario, updateUsuarioDto);

    return this.usuarioRepository.save(usuario);
  }

  async remove(id: number, adminId: number) {
    const usuario = await this.findOne(id);

    // Desactivar el usuario en lugar de eliminarlo
    usuario.activo = false;
    await this.usuarioRepository.save(usuario);

    return { message: 'Usuario desactivado exitosamente' };
  }

  async activate(id: number) {
    const usuario = await this.findOne(id);

    // Reactivar el usuario
    usuario.activo = true;
    await this.usuarioRepository.save(usuario);

    return { message: 'Usuario reactivado exitosamente' };
  }

  async updateRol(id: number, rolNombre: string) {
    const usuario = await this.findOne(id);

    // Normalizar el nombre del rol a minúsculas (como está en RolEnum)
    const rolNormalizado = rolNombre.toLowerCase();

    // Validar que el rol existe
    const rolesValidos = Object.values(RolEnum);
    if (!rolesValidos.includes(rolNormalizado as RolEnum)) {
      throw new BadRequestException(
        `Rol inválido. Los roles válidos son: ${rolesValidos.join(', ')}`,
      );
    }

    // Buscar el rol en la base de datos
    const rol = await this.rolRepository.findOne({
      where: { nombre: rolNormalizado as RolEnum },
    });

    if (!rol) {
      throw new NotFoundException(`Rol ${rolNormalizado} no encontrado`);
    }

    usuario.rol = rol;
    return this.usuarioRepository.save(usuario);
  }
}

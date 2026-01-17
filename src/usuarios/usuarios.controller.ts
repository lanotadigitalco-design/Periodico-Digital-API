import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdateUsuarioRolDto } from './dto/update-usuario-rol.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { GetUser } from '../decorators/get-user.decorator';
import { RolEnum } from '../entities/rol.entity';
import { Usuario } from '../entities/usuario.entity';

@ApiTags('Usuarios')
@ApiBearerAuth('JWT-auth')
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener todos los usuarios (Solo admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios',
    schema: {
      example: [
        {
          id: 1,
          email: 'juan@ejemplo.com',
          nombre: 'Juan',
          apellido: 'Pérez',
          activo: true,
          rol: {
            id: 2,
            nombre: 'PERIODISTA',
          },
          createdAt: '2025-12-20T10:00:00.000Z',
          updatedAt: '2025-12-20T10:00:00.000Z',
        },
        {
          id: 2,
          email: 'maria@ejemplo.com',
          nombre: 'María',
          apellido: 'García',
          activo: true,
          rol: {
            id: 3,
            nombre: 'LECTOR',
          },
          createdAt: '2025-12-21T11:00:00.000Z',
          updatedAt: '2025-12-21T11:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Requiere rol ADMINISTRADOR' })
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener usuario por ID (Solo admin)' })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
    schema: {
      example: {
        id: 1,
        email: 'juan@ejemplo.com',
        nombre: 'Juan',
        apellido: 'Pérez',
        activo: true,
        rol: {
          id: 2,
          nombre: 'PERIODISTA',
        },
        createdAt: '2025-12-20T10:00:00.000Z',
        updatedAt: '2025-12-20T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar usuario (Solo admin)' })
  @ApiBody({ type: UpdateUsuarioDto })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado',
    schema: {
      example: {
        id: 1,
        email: 'juannuevo@ejemplo.com',
        nombre: 'Juan Carlos',
        apellido: 'Pérez López',
        activo: true,
        rol: {
          id: 2,
          nombre: 'PERIODISTA',
        },
        createdAt: '2025-12-20T10:00:00.000Z',
        updatedAt: '2025-12-25T13:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({ summary: 'Desactivar usuario (Solo admin)' })
  @ApiResponse({
    status: 200,
    description: 'Usuario desactivado',
    schema: {
      example: {
        message: 'Usuario desactivado exitosamente',
        id: 1,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() admin: Usuario,
  ) {
    return this.usuariosService.remove(id, admin.id);
  }

  @Patch(':id/activate')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({ summary: 'Reactivar usuario desactivado (Solo admin)' })
  @ApiResponse({
    status: 200,
    description: 'Usuario reactivado',
    schema: {
      example: {
        message: 'Usuario reactivado exitosamente',
        id: 1,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.activate(id);
  }

  @Patch(':id/rol')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar rol del usuario (Solo admin)' })
  @ApiBody({ type: UpdateUsuarioRolDto })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado',
    schema: {
      example: {
        id: 1,
        email: 'juan@ejemplo.com',
        nombre: 'Juan',
        apellido: 'Pérez',
        activo: true,
        rol: {
          id: 2,
          nombre: 'PERIODISTA',
        },
        createdAt: '2025-12-20T10:00:00.000Z',
        updatedAt: '2025-12-25T13:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Rol inválido' })
  @ApiResponse({ status: 404, description: 'Usuario o rol no encontrado' })
  updateRol(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRolDto: UpdateUsuarioRolDto,
  ) {
    return this.usuariosService.updateRol(id, updateRolDto.rol);
  }
}

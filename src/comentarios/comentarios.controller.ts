import {
  Controller,
  Get,
  Post,
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
import { ComentariosService } from './comentarios.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetUser } from '../decorators/get-user.decorator';
import { Usuario } from '../entities/usuario.entity';

@ApiTags('Comentarios')
@Controller('comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear comentario o respuesta' })
  @ApiBody({ type: CreateComentarioDto })
  @ApiResponse({
    status: 201,
    description: 'Comentario creado exitosamente',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        contenido: 'Excelente artículo, muy informativo',
        articulo: { id: 1 },
        usuario: {
          id: 2,
          nombre: 'María',
          apellido: 'García',
          email: 'maria@ejemplo.com',
        },
        visible: true,
        createdAt: '2025-12-25T11:00:00.000Z',
        updatedAt: '2025-12-25T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  create(
    @Body() createComentarioDto: CreateComentarioDto,
    @GetUser() usuario: Usuario,
  ) {
    return this.comentariosService.create(createComentarioDto, usuario);
  }

  @Get('articulo/:articuloId')
  @ApiOperation({
    summary: 'Obtener todos los comentarios de un artículo (Público)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de comentarios con estructura anidada',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          contenido: 'Excelente artículo',
          usuario: {
            id: 2,
            nombre: 'María',
            apellido: 'García',
          },
          visible: true,
          createdAt: '2025-12-25T11:00:00.000Z',
          respuestas: [
            {
              id: '660e8400-e29b-41d4-a716-446655440001',
              contenido: 'Gracias por tu comentario',
              usuario: {
                id: 1,
                nombre: 'Juan',
                apellido: 'Pérez',
              },
              visible: true,
              createdAt: '2025-12-25T11:30:00.000Z',
              respuestas: [],
            },
          ],
        },
      ],
    },
  })
  findByArticulo(@Param('articuloId', ParseIntPipe) articuloId: number) {
    return this.comentariosService.findByArticulo(articuloId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener comentario por UUID (Público)' })
  @ApiResponse({
    status: 200,
    description: 'Comentario encontrado',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        contenido: 'Excelente artículo',
        usuario: {
          id: 2,
          nombre: 'María',
          apellido: 'García',
          email: 'maria@ejemplo.com',
        },
        articulo: { id: 1 },
        visible: true,
        createdAt: '2025-12-25T11:00:00.000Z',
        updatedAt: '2025-12-25T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Comentario no encontrado' })
  findOne(@Param('id') id: string) {
    return this.comentariosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar comentario propio' })
  @ApiBody({ type: UpdateComentarioDto })
  @ApiResponse({
    status: 200,
    description: 'Comentario actualizado',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        contenido: 'Comentario actualizado con nueva información',
        usuario: {
          id: 2,
          nombre: 'María',
          apellido: 'García',
        },
        visible: true,
        createdAt: '2025-12-25T11:00:00.000Z',
        updatedAt: '2025-12-25T12:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para editar este comentario',
  })
  @ApiResponse({ status: 404, description: 'Comentario no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateComentarioDto: UpdateComentarioDto,
    @GetUser() usuario: Usuario,
  ) {
    return this.comentariosService.update(id, updateComentarioDto, usuario);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar comentario (Autor o Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Comentario eliminado (soft delete)',
    schema: {
      example: {
        message: 'Comentario eliminado exitosamente',
        id: '550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para eliminar este comentario',
  })
  @ApiResponse({ status: 404, description: 'Comentario no encontrado' })
  remove(@Param('id') id: string, @GetUser() usuario: Usuario) {
    return this.comentariosService.remove(id, usuario);
  }
}

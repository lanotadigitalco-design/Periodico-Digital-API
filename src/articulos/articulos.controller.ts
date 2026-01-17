import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ArticulosService } from './articulos.service';
import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { GetUser } from '../decorators/get-user.decorator';
import { RolEnum } from '../entities/rol.entity';
import { Usuario } from '../entities/usuario.entity';

@ApiTags('Artículos')
@Controller('articulos')
export class ArticulosController {
  constructor(private readonly articulosService: ArticulosService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.PERIODISTA)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear nuevo artículo (Admin/Periodista)' })
  @ApiBody({ type: CreateArticuloDto })
  @ApiResponse({
    status: 201,
    description: 'Artículo creado exitosamente',
    schema: {
      example: {
        id: 1,
        titulo: 'La importancia de la tecnología en 2025',
        contenido:
          'En este artículo exploraremos las tendencias tecnológicas...',
        categoria: 'Tecnología',
        imagenes: ['https://example.com/imagen1.jpg'],
        publicado: true,
        contadorVisualizaciones: 0,
        autores: [
          {
            id: 1,
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan@ejemplo.com',
            rol: { id: 2, nombre: 'PERIODISTA' },
          },
        ],
        createdAt: '2025-12-25T10:30:00.000Z',
        updatedAt: '2025-12-25T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Requiere rol ADMINISTRADOR o PERIODISTA',
  })
  create(
    @Body() createArticuloDto: CreateArticuloDto,
    @GetUser() usuario: Usuario,
  ) {
    return this.articulosService.create(createArticuloDto, usuario);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los artículos (Público)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de artículos',
    schema: {
      example: [
        {
          id: 1,
          titulo: 'La importancia de la tecnología en 2025',
          contenido: 'En este artículo exploraremos...',
          categoria: 'Tecnología',
          imagenes: ['https://example.com/imagen1.jpg'],
          publicado: true,
          contadorVisualizaciones: 150,
          autores: [
            {
              id: 1,
              nombre: 'Juan',
              apellido: 'Pérez',
              email: 'juan@ejemplo.com',
            },
          ],
          createdAt: '2025-12-25T10:30:00.000Z',
          updatedAt: '2025-12-25T10:30:00.000Z',
        },
      ],
    },
  })
  findAll() {
    return this.articulosService.findAll();
  }

  @Get('despublicados')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.PERIODISTA)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener todos los artículos despublicados (Admin/Periodista)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de artículos despublicados',
    schema: {
      example: [
        {
          id: 1,
          titulo: 'Artículo sin publicar',
          contenido: 'En este artículo...',
          categoria: 'Tecnología',
          imagenes: ['https://example.com/imagen1.jpg'],
          publicado: false,
          contadorVisualizaciones: 0,
          autores: [
            {
              id: 1,
              nombre: 'Juan',
              apellido: 'Pérez',
              email: 'juan@ejemplo.com',
            },
          ],
          createdAt: '2025-12-25T10:30:00.000Z',
          updatedAt: '2025-12-25T10:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Requiere rol ADMINISTRADOR o PERIODISTA',
  })
  findUnpublished() {
    return this.articulosService.findUnpublished();
  }

  @Get('buscar')
  @ApiOperation({
    summary: 'Buscar artículos por título, contenido o categoría',
  })
  @ApiQuery({ name: 'q', description: 'Término de búsqueda', required: true })
  @ApiResponse({
    status: 200,
    description: 'Resultados de la búsqueda',
    schema: {
      example: [
        {
          id: 1,
          titulo: 'La importancia de la tecnología en 2025',
          contenido: 'En este artículo exploraremos...',
          categoria: 'Tecnología',
          imagenes: ['https://example.com/imagen1.jpg'],
          publicado: true,
          contadorVisualizaciones: 150,
          autores: [
            {
              id: 1,
              nombre: 'Juan',
              apellido: 'Pérez',
              email: 'juan@ejemplo.com',
            },
          ],
          createdAt: '2025-12-25T10:30:00.000Z',
        },
      ],
    },
  })
  search(@Query('q') query: string) {
    return this.articulosService.search(query);
  }

  @Get('buscar-autor')
  @ApiOperation({ summary: 'Buscar artículos por nombre de autor' })
  @ApiQuery({ name: 'autor', description: 'Nombre del autor', required: true })
  @ApiResponse({
    status: 200,
    description: 'Artículos del autor',
    schema: {
      example: [
        {
          id: 1,
          titulo: 'La importancia de la tecnología en 2025',
          contenido: 'En este artículo exploraremos...',
          categoria: 'Tecnología',
          autores: [
            {
              id: 1,
              nombre: 'Juan',
              apellido: 'Pérez',
              email: 'juan@ejemplo.com',
            },
          ],
          createdAt: '2025-12-25T10:30:00.000Z',
        },
      ],
    },
  })
  searchByAutor(@Query('autor') autor: string) {
    return this.articulosService.searchByAutor(autor);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener artículo por ID (Público)' })
  @ApiResponse({
    status: 200,
    description: 'Artículo encontrado',
    schema: {
      example: {
        id: 1,
        titulo: 'La importancia de la tecnología en 2025',
        contenido:
          'En este artículo exploraremos las tendencias tecnológicas...',
        categoria: 'Tecnología',
        imagenes: ['https://example.com/imagen1.jpg'],
        publicado: true,
        contadorVisualizaciones: 150,
        autores: [
          {
            id: 1,
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan@ejemplo.com',
            rol: { id: 2, nombre: 'PERIODISTA' },
          },
        ],
        createdAt: '2025-12-25T10:30:00.000Z',
        updatedAt: '2025-12-25T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.articulosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.PERIODISTA)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar artículo (Admin o autor)' })
  @ApiBody({ type: UpdateArticuloDto })
  @ApiResponse({
    status: 200,
    description: 'Artículo actualizado',
    schema: {
      example: {
        id: 1,
        titulo: 'Título actualizado',
        contenido: 'Contenido actualizado...',
        categoria: 'Tecnología',
        imagenes: ['https://example.com/imagen1.jpg'],
        publicado: true,
        contadorVisualizaciones: 150,
        autores: [
          {
            id: 1,
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan@ejemplo.com',
          },
        ],
        createdAt: '2025-12-25T10:30:00.000Z',
        updatedAt: '2025-12-25T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para editar este artículo',
  })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticuloDto: UpdateArticuloDto,
    @GetUser() usuario: Usuario,
  ) {
    return this.articulosService.update(id, updateArticuloDto, usuario);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.PERIODISTA)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar artículo (Admin o autor)' })
  @ApiResponse({
    status: 200,
    description: 'Artículo eliminado',
    schema: {
      example: {
        message: 'Artículo eliminado exitosamente',
        id: 1,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para eliminar este artículo',
  })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() usuario: Usuario) {
    return this.articulosService.remove(id, usuario);
  }
}

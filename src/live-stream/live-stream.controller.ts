import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LiveStreamService } from './live-stream.service';
import { CreateLiveStreamDto } from './dto/create-live-stream.dto';
import { UpdateLiveStreamDto } from './dto/update-live-stream.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { RolEnum } from '../entities/rol.entity';

@ApiTags('Live Stream')
@Controller('live-stream')
export class LiveStreamController {
  constructor(private readonly liveStreamService: LiveStreamService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener transmisión activa' })
  async findActive() {
    return this.liveStreamService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener transmisión por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.liveStreamService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear transmisión' })
  async create(@Body() dto: CreateLiveStreamDto) {
    return this.liveStreamService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar transmisión' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLiveStreamDto,
  ) {
    return this.liveStreamService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({ summary: 'Eliminar transmisión' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.liveStreamService.remove(id);
    return { message: 'Eliminado' };
  }
}

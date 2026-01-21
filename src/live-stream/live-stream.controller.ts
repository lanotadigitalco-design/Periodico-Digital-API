import { Controller, Get, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LiveStreamService } from './live-stream.service';
import { CreateLiveStreamDto } from './dto/create-live-stream.dto';
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
  async get() {
    return this.liveStreamService.get();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear o actualizar transmisión' })
  async upsert(@Body() dto: CreateLiveStreamDto) {
    return this.liveStreamService.upsert(dto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({ summary: 'Eliminar transmisión' })
  async remove() {
    await this.liveStreamService.remove();
    return { message: 'Transmisión eliminada' };
  }
}

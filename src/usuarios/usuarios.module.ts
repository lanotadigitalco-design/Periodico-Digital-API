import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario } from '../entities/usuario.entity';
import { Articulo } from '../entities/articulo.entity';
import { Rol } from '../entities/rol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Articulo, Rol])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}

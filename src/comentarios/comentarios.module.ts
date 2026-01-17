import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComentariosService } from './comentarios.service';
import { ComentariosController } from './comentarios.controller';
import { Comentario } from '../entities/comentario.entity';
import { Articulo } from '../entities/articulo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comentario, Articulo])],
  controllers: [ComentariosController],
  providers: [ComentariosService],
  exports: [ComentariosService],
})
export class ComentariosModule {}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { Comentario } from './comentario.entity';
import { LogVisualizacionArticulo } from './log-visualizacion-articulo.entity';

@Entity('articulos')
export class Articulo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  titulo: string;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ type: 'text', nullable: true })
  resumen: string;

  @Column({ type: 'varchar', length: 255 })
  categoria: string;

  @Column({ type: 'simple-array', nullable: true })
  imagenes: string[];

  @Column({ type: 'boolean', default: true })
  publicado: boolean;

  @ManyToMany(() => Usuario, (usuario) => usuario.articulos, { eager: true })
  @JoinTable({
    name: 'articulo_autores',
    joinColumn: { name: 'articulo_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'usuario_id', referencedColumnName: 'id' },
  })
  autores: Usuario[];

  @OneToMany(() => Comentario, (comentario) => comentario.articulo)
  comentarios: Comentario[];

  @OneToMany(() => LogVisualizacionArticulo, (log) => log.articulo)
  visualizaciones: LogVisualizacionArticulo[];

  @Column({ type: 'int', default: 0 })
  contadorVisualizaciones: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}

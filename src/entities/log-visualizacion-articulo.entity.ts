import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Articulo } from './articulo.entity';

@Entity('log_visualizacion_articulos')
export class LogVisualizacionArticulo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Articulo, (articulo) => articulo.visualizaciones)
  @JoinColumn({ name: 'articulo_id' })
  articulo: Articulo;

  @Column({ type: 'varchar', nullable: true })
  ip: string;

  @Column({ type: 'varchar', nullable: true })
  navegador: string;

  @Column({ type: 'varchar', nullable: true })
  sistemaOperativo: string;

  @Column({ type: 'varchar', nullable: true })
  dispositivo: string;

  @Column({ type: 'varchar', nullable: true })
  ubicacion: string;

  @Column({ type: 'varchar', nullable: true })
  referer: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}

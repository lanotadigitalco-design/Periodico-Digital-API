import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('log_visualizacion_sitio')
export class LogVisualizacionSitio {
  @PrimaryGeneratedColumn()
  id: number;

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
  url: string;

  @Column({ type: 'varchar', nullable: true })
  referer: string;

  @Column({ type: 'varchar', nullable: true })
  metodo: string;

  @Column({ type: 'int', nullable: true })
  statusCode: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}

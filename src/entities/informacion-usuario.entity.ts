import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('informacion_usuario')
export class InformacionUsuario {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Usuario, (usuario) => usuario.informacion)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'varchar', nullable: true })
  ultimaIp: string;

  @Column({ type: 'timestamp', nullable: true })
  ultimoInicioSesion: Date;

  @Column({ type: 'varchar', nullable: true })
  navegador: string;

  @Column({ type: 'varchar', nullable: true })
  sistemaOperativo: string;

  @Column({ type: 'varchar', nullable: true })
  dispositivo: string;

  @Column({ type: 'varchar', nullable: true })
  ubicacion: string;

  @Column({ type: 'int', default: 0 })
  intentosFallidosLogin: number;

  @Column({ type: 'timestamp', nullable: true })
  ultimoIntentoFallido: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}

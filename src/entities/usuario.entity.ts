import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  ManyToMany,
  JoinColumn,
} from 'typeorm';
import { Rol } from './rol.entity';
import { InformacionUsuario } from './informacion-usuario.entity';
import { Articulo } from './articulo.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  apellido: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @ManyToOne(() => Rol, (rol) => rol.usuarios, { eager: true })
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @OneToOne(() => InformacionUsuario, (info) => info.usuario, { cascade: true })
  informacion: InformacionUsuario;

  @ManyToMany(() => Articulo, (articulo) => articulo.autores)
  articulos: Articulo[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}

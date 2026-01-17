import { DataSource } from 'typeorm';
import { Rol, RolEnum } from '../entities/rol.entity';

export async function seedRoles(dataSource: DataSource) {
  const rolRepository = dataSource.getRepository(Rol);

  const roles = [
    {
      nombre: RolEnum.ADMINISTRADOR,
      descripcion: 'Administrador del sistema con todos los permisos',
    },
    {
      nombre: RolEnum.PERIODISTA,
      descripcion:
        'Periodista que puede crear, editar y eliminar sus propios artículos',
    },
    {
      nombre: RolEnum.LECTOR,
      descripcion: 'Lector que puede comentar artículos',
    },
  ];

  for (const rolData of roles) {
    const rolExiste = await rolRepository.findOne({
      where: { nombre: rolData.nombre },
    });

    if (!rolExiste) {
      const rol = rolRepository.create(rolData);
      await rolRepository.save(rol);
      console.log(`✅ Rol creado: ${rolData.nombre}`);
    } else {
      console.log(`ℹ️  Rol ya existe: ${rolData.nombre}`);
    }
  }
}

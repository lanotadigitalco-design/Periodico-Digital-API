import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/usuario.entity';
import { Rol, RolEnum } from '../entities/rol.entity';

export async function seedAdmin(dataSource: DataSource) {
  const usuarioRepository = dataSource.getRepository(Usuario);
  const rolRepository = dataSource.getRepository(Rol);

  // Buscar el rol de administrador
  const rolAdmin = await rolRepository.findOne({
    where: { nombre: RolEnum.ADMINISTRADOR },
  });

  if (!rolAdmin) {
    console.error('❌ Rol de administrador no encontrado. Ejecuta primero el seed de roles.');
    return;
  }

  // Verificar si el usuario ya existe
  const existingUser = await usuarioRepository.findOne({
    where: { email: 'agustin@gmail.com' },
  });

  if (existingUser) {
    console.log('ℹ️  Usuario administrador ya existe: agustin@gmail.com');
    return;
  }

  // Hash del password
  const hashedPassword = await bcrypt.hash('miPassword123', 10);

  // Crear el usuario administrador
  const admin = usuarioRepository.create({
    email: 'agustin@gmail.com',
    password: hashedPassword,
    nombre: 'Agustin',
    apellido: 'Hernandez',
    activo: true,
    rol: rolAdmin,
  });

  await usuarioRepository.save(admin);
  console.log('✅ Usuario administrador creado exitosamente: agustin@gmail.com');
}

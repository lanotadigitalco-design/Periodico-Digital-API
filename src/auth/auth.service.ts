import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/usuario.entity';
import { Rol, RolEnum } from '../entities/rol.entity';
import { InformacionUsuario } from '../entities/informacion-usuario.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    @InjectRepository(InformacionUsuario)
    private informacionUsuarioRepository: Repository<InformacionUsuario>,
    private jwtService: JwtService,
  ) {
    this.logger.log('AuthService inicializado');
  }

  async register(registerDto: RegisterDto) {
    const { email, password, nombre, apellido, rol } = registerDto;

    this.logger.log(`Intento de registro para email: ${email}`);

    // Verificar si el usuario ya existe
    const usuarioExiste = await this.usuarioRepository.findOne({
      where: { email },
    });
    if (usuarioExiste) {
      this.logger.warn(`Intento de registro con email ya existente: ${email}`);
      throw new BadRequestException('El email ya está registrado');
    }

    // Obtener el rol (por defecto LECTOR)
    const rolEntity = await this.rolRepository.findOne({
      where: { nombre: rol || RolEnum.LECTOR },
    });

    if (!rolEntity) {
      throw new InternalServerErrorException('Rol no encontrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const usuario = this.usuarioRepository.create({
      email,
      password: hashedPassword,
      nombre,
      apellido,
      rol: rolEntity,
    });

    try {
      await this.usuarioRepository.save(usuario);

      // Crear información de usuario
      const informacion = this.informacionUsuarioRepository.create({
        usuario,
      });
      await this.informacionUsuarioRepository.save(informacion);

      this.logger.log(
        `Usuario registrado exitosamente: ${email} (ID: ${usuario.id})`,
      );

      // Generar token
      const token = this.generateToken(usuario);

      return {
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          rol: usuario.rol.nombre,
        },
        token,
      };
    } catch (error) {
      this.logger.error(`Error al crear usuario ${email}: ${error.message}`);
      throw new InternalServerErrorException('Error al crear el usuario');
    }
  }

  async login(loginDto: LoginDto, ip?: string, userAgent?: string) {
    const { email, password } = loginDto;

    this.logger.log(`Intento de login para email: ${email} desde IP: ${ip}`);

    // Buscar usuario
    const usuario = await this.usuarioRepository.findOne({
      where: { email },
      relations: ['rol', 'informacion'],
    });

    if (!usuario) {
      this.logger.warn(`Intento de login con email no existente: ${email}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!usuario.activo) {
      this.logger.warn(`Intento de login con usuario desactivado: ${email}`);
      throw new UnauthorizedException('Usuario desactivado');
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      this.logger.warn(`Contraseña inválida para usuario: ${email}`);
      // Registrar intento fallido
      await this.registrarIntentoFallido(usuario);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar información de sesión
    await this.actualizarInformacionSesion(usuario, ip, userAgent);

    this.logger.log(`Login exitoso para usuario: ${email} (ID: ${usuario.id})`);

    // Generar token
    const token = this.generateToken(usuario);

    return {
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol.nombre,
      },
      token,
    };
  }

  private generateToken(usuario: Usuario): string {
    const payload = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol.nombre,
    };

    return this.jwtService.sign(payload);
  }

  private async actualizarInformacionSesion(
    usuario: Usuario,
    ip?: string,
    userAgent?: string,
  ) {
    let informacion = await this.informacionUsuarioRepository.findOne({
      where: { usuario: { id: usuario.id } },
    });

    if (!informacion) {
      informacion = this.informacionUsuarioRepository.create({ usuario });
    }

    informacion.ultimaIp = ip || informacion.ultimaIp;
    informacion.ultimoInicioSesion = new Date();
    informacion.navegador = userAgent || informacion.navegador;
    informacion.intentosFallidosLogin = 0;

    await this.informacionUsuarioRepository.save(informacion);
  }

  private async registrarIntentoFallido(usuario: Usuario) {
    let informacion = await this.informacionUsuarioRepository.findOne({
      where: { usuario: { id: usuario.id } },
    });

    if (!informacion) {
      informacion = this.informacionUsuarioRepository.create({ usuario });
    }

    informacion.intentosFallidosLogin =
      (informacion.intentosFallidosLogin || 0) + 1;
    informacion.ultimoIntentoFallido = new Date();

    await this.informacionUsuarioRepository.save(informacion);
  }

  async validateUser(userId: number): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { id: userId, activo: true },
      relations: ['rol'],
    });
  }
}

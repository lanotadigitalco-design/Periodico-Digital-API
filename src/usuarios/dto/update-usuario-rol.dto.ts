import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUsuarioRolDto {
  @ApiProperty({
    description: 'Nombre del rol a asignar',
    example: 'PERIODISTA',
    enum: ['LECTOR', 'ESCRITOR', 'PERIODISTA', 'ADMINISTRADOR'],
  })
  @IsString()
  @IsNotEmpty()
  rol: string;
}

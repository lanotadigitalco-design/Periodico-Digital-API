import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticuloDto {
  @ApiProperty({
    description: 'Título del artículo',
    example: 'La importancia de la tecnología en 2025',
  })
  @IsString()
  @IsNotEmpty({ message: 'El título es requerido' })
  titulo: string;

  @ApiProperty({
    description: 'Contenido completo del artículo',
    example: 'En este artículo exploraremos las tendencias tecnológicas...',
  })
  @IsString()
  @IsNotEmpty({ message: 'El contenido es requerido' })
  contenido: string;

  @ApiProperty({
    description: 'Resumen breve del artículo',
    example: 'Un resumen de una línea sobre el artículo...',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'El resumen es requerido' })
  resumen: string;

  @ApiProperty({
    description: 'Categoría del artículo',
    example: 'Tecnología',
  })
  @IsString()
  @IsNotEmpty({ message: 'La categoría es requerida' })
  categoria: string;

  @ApiProperty({
    description: 'URLs de las imágenes del artículo',
    example: ['https://example.com/imagen1.jpg', 'https://example.com/imagen2.jpg'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  imagenes?: string[];

  @ApiProperty({
    description: 'Estado de publicación del artículo',
    example: true,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  publicado?: boolean;
}

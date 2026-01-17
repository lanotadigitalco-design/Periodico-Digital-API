import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateComentarioDto {
  @ApiProperty({
    description: 'Contenido del comentario',
    example: 'Excelente artículo, muy informativo',
  })
  @IsString()
  @IsNotEmpty({ message: 'El contenido es requerido' })
  contenido: string;

  @ApiProperty({
    description: 'ID del artículo al que pertenece el comentario',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'El ID del artículo es requerido' })
  articuloId: number;

  @ApiPropertyOptional({
    description: 'UUID del comentario padre si es una respuesta',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsOptional()
  comentarioPadreId?: string; // UUID del comentario padre si es una respuesta
}

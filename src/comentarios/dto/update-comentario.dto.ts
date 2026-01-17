import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateComentarioDto {
  @ApiPropertyOptional({
    description: 'Nuevo contenido del comentario',
    example: 'Comentario actualizado con nueva información',
  })
  @IsString()
  @IsOptional()
  contenido?: string;
}

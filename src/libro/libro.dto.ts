import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class LibroDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  autor: string;

  @IsDateString()
  @IsNotEmpty()
  fechaPublicacion: string;

  @IsString()
  @IsNotEmpty()
  ISBN: string;
}

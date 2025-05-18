import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class BibliotecaDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  readonly direccion: string;

  @IsString()
  @IsNotEmpty()
  readonly ciudad: string;

  @IsDateString()
  @IsNotEmpty()
  readonly horaApertura: Date;

  @IsDateString()
  @IsNotEmpty()
  readonly horaCierre: Date;
}

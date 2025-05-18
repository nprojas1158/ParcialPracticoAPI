import { BibliotecaLibroService } from './biblioteca-libro.service';
import { BibliotecaEntity } from 'src/biblioteca/biblioteca.entity';
import { LibroEntity } from 'src/libro/libro.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [BibliotecaLibroService],
  imports: [TypeOrmModule.forFeature([BibliotecaEntity, LibroEntity])],
})
export class BibliotecaLibroModule {}

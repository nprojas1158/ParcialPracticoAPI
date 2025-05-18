import { Module } from '@nestjs/common';
import { BibliotecaEntity } from './biblioteca.entity';
import { BibliotecaService } from './biblioteca.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([BibliotecaEntity])],
  providers: [BibliotecaService],
  exports: [BibliotecaService],
})
export class BibliotecaModule {}

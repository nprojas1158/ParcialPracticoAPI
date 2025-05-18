/* eslint-disable prettier/prettier */
import { BibliotecaEntity } from '../../biblioteca/biblioteca.entity';
import { LibroEntity } from '../../libro/libro.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

export const TypeOrmTestingConfig = () => [
  TypeOrmModule.forRoot({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [BibliotecaEntity, LibroEntity],
    synchronize: true,
  }),
  TypeOrmModule.forFeature([BibliotecaEntity, LibroEntity]),
];

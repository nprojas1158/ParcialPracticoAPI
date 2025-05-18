import { LibroEntity } from '../libro/libro.entity';
import {
  Entity,
  Column,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class BibliotecaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  direccion: string;

  @Column()
  ciudad: string;

  @Column()
  horaApertura: Date;

  @Column()
  horaCierre: Date;

  @ManyToMany(() => LibroEntity, (libro) => libro.bibliotecas)
  @JoinTable()
  libros: LibroEntity[];
}

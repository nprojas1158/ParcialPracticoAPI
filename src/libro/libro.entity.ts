import { BibliotecaEntity } from '../biblioteca/biblioteca.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LibroEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column()
  autor: string;

  @Column()
  fechaPublicacion: Date;

  @Column()
  ISBN: string;

  @ManyToMany(() => BibliotecaEntity, (biblioteca) => biblioteca.libros)
  bibliotecas: BibliotecaEntity[];
}

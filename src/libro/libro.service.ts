import { InjectRepository } from '@nestjs/typeorm';
import { LibroEntity } from './libro.entity';
import { Injectable } from '@nestjs/common';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/businnes-errors';
import { Repository } from 'typeorm';

@Injectable()
export class LibroService {
  constructor(
    @InjectRepository(LibroEntity)
    private readonly libroRepository: Repository<LibroEntity>,
  ) {}

  async findAll(): Promise<LibroEntity[]> {
    return await this.libroRepository.find({ relations: ['bibliotecas'] });
  }

  async findOne(id: string): Promise<LibroEntity> {
    const libro = await this.libroRepository.findOne({
      where: { id },
      relations: ['bibliotecas'],
    });
    if (!libro)
      throw new BusinessLogicException(
        'El libro con el id ingresado no fue encontrado',
        BusinessError.NOT_FOUND,
      );

    return libro;
  }

  async create(libro: LibroEntity): Promise<LibroEntity> {
    const fechaActual = new Date();
    if (libro.fechaPublicacion >= fechaActual) {
      throw new BusinessLogicException(
        'La fecha de publicación no puede ser mayor o igual a la fecha actual',
        BusinessError.BAD_REQUEST,
      );
    }
    return await this.libroRepository.save(libro);
  }

  async update(id: string, libro: LibroEntity): Promise<LibroEntity> {
    const persistedLibro = await this.libroRepository.findOne({
      where: { id },
    });
    const fechaActual = new Date();

    if (!persistedLibro)
      throw new BusinessLogicException(
        'El libro con el id ingresado no fue encontrado',
        BusinessError.NOT_FOUND,
      );

    if (libro.fechaPublicacion >= fechaActual) {
      throw new BusinessLogicException(
        'La fecha de publicación no puede ser mayor o igual a la fecha actual',
        BusinessError.BAD_REQUEST,
      );
    }

    return await this.libroRepository.save({ ...persistedLibro, ...libro });
  }

  async delete(id: string) {
    const libro = await this.libroRepository.findOne({ where: { id } });
    if (!libro)
      throw new BusinessLogicException(
        'El libro con el id ingresado no fue encontrado',
        BusinessError.NOT_FOUND,
      );

    await this.libroRepository.remove(libro);
  }
}

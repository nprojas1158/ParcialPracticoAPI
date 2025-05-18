import { InjectRepository } from '@nestjs/typeorm';
import { BibliotecaEntity } from './biblioteca.entity';
import { Injectable } from '@nestjs/common';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/businnes-errors';
import { Repository } from 'typeorm';

@Injectable()
export class BibliotecaService {
  constructor(
    @InjectRepository(BibliotecaEntity)
    private readonly bibliotecaRepository: Repository<BibliotecaEntity>,
  ) {}

  async findAll(): Promise<BibliotecaEntity[]> {
    return await this.bibliotecaRepository.find({ relations: ['libros'] });
  }

  async findOne(id: string): Promise<BibliotecaEntity> {
    const biblioteca = await this.bibliotecaRepository.findOne({
      where: { id },
      relations: ['libros'],
    });
    if (!biblioteca)
      throw new BusinessLogicException(
        'La biblioteca con el id ingresado no fue encontrada',
        BusinessError.NOT_FOUND,
      );

    return biblioteca;
  }

  async create(biblioteca: BibliotecaEntity): Promise<BibliotecaEntity> {
    if (biblioteca.horaApertura >= biblioteca.horaCierre) {
      throw new BusinessLogicException(
        'La hora de apertura debe ser menor a la hora de cierre',
        BusinessError.BAD_REQUEST,
      );
    }
    return await this.bibliotecaRepository.save(biblioteca);
  }

  async update(
    id: string,
    biblioteca: BibliotecaEntity,
  ): Promise<BibliotecaEntity> {
    const persistedBiblioteca = await this.bibliotecaRepository.findOne({
      where: { id },
    });
    if (!persistedBiblioteca) {
      throw new BusinessLogicException(
        'La biblioteca con el id ingresado no fue encontrada',
        BusinessError.NOT_FOUND,
      );
    }

    if (biblioteca.horaApertura >= biblioteca.horaCierre) {
      throw new BusinessLogicException(
        'La hora de apertura debe ser menor a la hora de cierre',
        BusinessError.BAD_REQUEST,
      );
    }

    return await this.bibliotecaRepository.save({
      ...persistedBiblioteca,
      ...biblioteca,
    });
  }

  async delete(id: string) {
    const biblioteca = await this.bibliotecaRepository.findOne({
      where: { id },
    });
    if (!biblioteca)
      throw new BusinessLogicException(
        'La biblioteca con el id ingresado no fue encontrada',
        BusinessError.NOT_FOUND,
      );

    await this.bibliotecaRepository.remove(biblioteca);
  }
}

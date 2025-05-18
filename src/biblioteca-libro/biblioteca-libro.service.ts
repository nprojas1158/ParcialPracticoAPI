import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BibliotecaEntity } from '../biblioteca/biblioteca.entity';
import { LibroEntity } from '../libro/libro.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/businnes-errors';
import { Repository } from 'typeorm';

@Injectable()
export class BibliotecaLibroService {
  constructor(
    @InjectRepository(BibliotecaEntity)
    private readonly bibliotecaRepository: Repository<BibliotecaEntity>,

    @InjectRepository(LibroEntity)
    private readonly libroRepository: Repository<LibroEntity>,
  ) {}

  async addBookToLibrary(
    bibliotecaId: string,
    libroId: string,
  ): Promise<BibliotecaEntity> {
    const libro = await this.libroRepository.findOne({
      where: { id: libroId },
    });
    if (!libro)
      throw new BusinessLogicException(
        'El libro con el id ingresado no fue encontrado',
        BusinessError.NOT_FOUND,
      );

    const biblioteca = await this.bibliotecaRepository.findOne({
      where: { id: bibliotecaId },
      relations: ['libros'],
    });
    if (!biblioteca)
      throw new BusinessLogicException(
        'La biblioteca con el id ingresado no fue encontrada',
        BusinessError.NOT_FOUND,
      );

    biblioteca.libros = biblioteca.libros || [];
    biblioteca.libros = [...biblioteca.libros, libro];
    return await this.bibliotecaRepository.save(biblioteca);
  }

  async findBooksFromLibrary(bibliotecaId: string): Promise<LibroEntity[]> {
    const biblioteca = await this.bibliotecaRepository.findOne({
      where: { id: bibliotecaId },
      relations: ['libros'],
    });
    if (!biblioteca)
      throw new BusinessLogicException(
        'La biblioteca con el id ingresado no fue encontrada',
        BusinessError.NOT_FOUND,
      );

    return biblioteca.libros;
  }

  async findBookFromLibrary(
    bibliotecaId: string,
    libroId: string,
  ): Promise<LibroEntity> {
    const libro = await this.libroRepository.findOne({
      where: { id: libroId },
    });
    if (!libro)
      throw new BusinessLogicException(
        'El libro con el id ingresado no fue encontrado',
        BusinessError.NOT_FOUND,
      );

    const biblioteca = await this.bibliotecaRepository.findOne({
      where: { id: bibliotecaId },
      relations: ['libros'],
    });
    if (!biblioteca)
      throw new BusinessLogicException(
        'La biblioteca con el id ingresado no fue encontrada',
        BusinessError.NOT_FOUND,
      );

    const bibliotecaLibro: LibroEntity | undefined = biblioteca.libros.find(
      (libro) => libro.id === libroId,
    );

    if (!bibliotecaLibro)
      throw new BusinessLogicException(
        'El libro con el id ingresado no está asociado a la biblioteca indicada',
        BusinessError.PRECONDITION_FAILED,
      );

    return bibliotecaLibro;
  }

  async updateBooksFromLibrary(
    bibliotecaId: string,
    libros: LibroEntity[],
  ): Promise<BibliotecaEntity> {
    const biblioteca = await this.bibliotecaRepository.findOne({
      where: { id: bibliotecaId },
      relations: ['libros'],
    });
    if (!biblioteca)
      throw new BusinessLogicException(
        'La biblioteca con el id ingresado no fue encontrada',
        BusinessError.NOT_FOUND,
      );

    const librosIds = libros.map((libro) => libro.id);
    const librosEncontrados = await this.libroRepository.findByIds(librosIds);

    if (librosEncontrados.length !== librosIds.length) {
      throw new BusinessLogicException(
        'Uno o más de los libros indicados no fueron encontrados',
        BusinessError.NOT_FOUND,
      );
    }

    biblioteca.libros = librosEncontrados;
    return await this.bibliotecaRepository.save(biblioteca);
  }

  async deleteBookFromLibrary(bibliotecaId: string, libroId: string) {
    const libro = await this.libroRepository.findOne({
      where: { id: libroId },
    });
    if (!libro)
      throw new BusinessLogicException(
        'El libro con el id ingresado no fue encontrado',
        BusinessError.NOT_FOUND,
      );

    const biblioteca = await this.bibliotecaRepository.findOne({
      where: { id: bibliotecaId },
      relations: ['libros'],
    });
    if (!biblioteca)
      throw new BusinessLogicException(
        'La biblioteca con el id ingresado no fue encontrada',
        BusinessError.NOT_FOUND,
      );

    const bibliotecaLibro: LibroEntity | undefined = biblioteca.libros.find(
      (libro) => libro.id === libroId,
    );

    if (!bibliotecaLibro)
      throw new BusinessLogicException(
        'El libro con el id ingresado no está asociado a la biblioteca indicada',
        BusinessError.PRECONDITION_FAILED,
      );

    biblioteca.libros = biblioteca.libros.filter((e) => e.id !== libroId);
    await this.bibliotecaRepository.save(biblioteca);
  }
}

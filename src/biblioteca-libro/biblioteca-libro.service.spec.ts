import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BibliotecaLibroService } from './biblioteca-libro.service';
import { BibliotecaEntity } from '../biblioteca/biblioteca.entity';
import { LibroEntity } from '../libro/libro.entity';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';

describe('BibliotecaLibroService', () => {
  let service: BibliotecaLibroService;
  let bibliotecaRepository: Repository<BibliotecaEntity>;
  let libroRepository: Repository<LibroEntity>;
  let bibliotecaList: BibliotecaEntity[];
  let libroList: LibroEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [BibliotecaLibroService],
    }).compile();

    service = module.get<BibliotecaLibroService>(BibliotecaLibroService);
    bibliotecaRepository = module.get<Repository<BibliotecaEntity>>(
      getRepositoryToken(BibliotecaEntity),
    );
    libroRepository = module.get<Repository<LibroEntity>>(
      getRepositoryToken(LibroEntity),
    );

    await seedDatabase();
  });

  const seedDatabase = async () => {
    await bibliotecaRepository.clear();
    await libroRepository.clear();

    bibliotecaList = [];
    libroList = [];

    for (let i = 0; i < 5; i++) {
      const apertura = faker.date.between({
        from: new Date('2024-01-01T07:00:00'),
        to: new Date('2024-01-01T10:00:00'),
      });

      const cierre = faker.date.between({
        from: new Date(apertura.getTime() + 2 * 60 * 60 * 1000),
        to: new Date('2024-01-01T20:00:00'),
      });

      const biblioteca: BibliotecaEntity = await bibliotecaRepository.save({
        nombre: faker.company.name(),
        direccion: faker.location.streetAddress(),
        ciudad: faker.location.city(),
        horaApertura: apertura,
        horaCierre: cierre,
      });

      bibliotecaList.push(biblioteca);
    }

    for (let i = 0; i < 5; i++) {
      const libro: LibroEntity = await libroRepository.save({
        titulo: faker.lorem.words(3),
        autor: faker.person.fullName(),
        fechaPublicacion: faker.date.past({ years: 10 }),
        ISBN: faker.string.uuid(),
      });
      libroList.push(libro);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addBookToLibrary debería agregar un libro a la biblioteca', async () => {
    const libro: LibroEntity = libroList[0];
    const biblioteca: BibliotecaEntity = bibliotecaList[0];

    const result: BibliotecaEntity = await service.addBookToLibrary(
      biblioteca.id,
      libro.id,
    );

    expect(result.libros.length).toBe(1);
    expect(result.libros[0]).not.toBeNull();
    expect(result.libros[0].titulo).toBe(libro!.titulo);
    expect(result.libros[0].autor).toBe(libro!.autor);
    expect(result.libros[0].ISBN).toBe(libro!.ISBN);
    expect(result.libros[0].fechaPublicacion.toISOString()).toBe(
      libro!.fechaPublicacion.toISOString(),
    );
  });

  it('findBookFromLibrary debería retornar un libro asociado', async () => {
    const libroAsociado: LibroEntity = libroList[0];
    const biblioteca: BibliotecaEntity = bibliotecaList[0];
    await service.addBookToLibrary(biblioteca.id, libroAsociado.id);

    const result: LibroEntity = await service.findBookFromLibrary(
      biblioteca.id,
      libroAsociado.id,
    );

    expect(result).not.toBeNull();
    expect(result.id).toBe(libroAsociado.id);
    expect(result.titulo).toBe(libroAsociado!.titulo);
    expect(result.autor).toBe(libroAsociado!.autor);
    expect(result.ISBN).toBe(libroAsociado!.ISBN);
    expect(result.fechaPublicacion.toISOString()).toBe(
      libroAsociado!.fechaPublicacion.toISOString(),
    );
  });

  it('findBookFromLibrary debería lanzar excepción si el libro no está asociado a la biblioteca', async () => {
    const libroNoAsociado: LibroEntity = libroList[0];
    const biblioteca: BibliotecaEntity = bibliotecaList[0];

    await expect(() =>
      service.findBookFromLibrary(biblioteca.id, libroNoAsociado.id),
    ).rejects.toHaveProperty(
      'message',
      'El libro con el id ingresado no está asociado a la biblioteca indicada',
    );
  });

  it('updateBooksFromLibrary debería reemplazar los libros', async () => {
    const nuevoLibro: LibroEntity = libroList[0];
    const biblioteca: BibliotecaEntity = bibliotecaList[0];

    const result: BibliotecaEntity = await service.updateBooksFromLibrary(
      biblioteca.id,
      [nuevoLibro],
    );

    const bibliotecaActualizada = await bibliotecaRepository.findOne({
      where: { id: biblioteca.id },
      relations: ['libros'],
    });

    expect(result).not.toBeNull();
    expect(result.libros.length).toBe(1);
    expect(result.libros[0].id).toEqual(nuevoLibro.id);
    expect(bibliotecaActualizada).not.toBeNull();
    expect(bibliotecaActualizada!.libros.length).toBe(1);
    expect(bibliotecaActualizada!.libros[0].id).toEqual(nuevoLibro.id);
  });

  it('deleteBookFromLibrary debería eliminar un libro asociado a la biblioteca', async () => {
    const libro: LibroEntity = libroList[0];
    const biblioteca: BibliotecaEntity = bibliotecaList[0];
    await service.addBookToLibrary(biblioteca.id, libro.id);

    await service.deleteBookFromLibrary(biblioteca.id, libro.id);
    const result = await bibliotecaRepository.findOne({
      where: { id: biblioteca.id },
      relations: ['libros'],
    });

    expect(result!.libros.length).toBe(0);
  });

  it('deleteBookFromLibrary debería lanzar error si el libro no está asociado', async () => {
    const libroNoAsociado: LibroEntity = libroList[0];
    const biblioteca: BibliotecaEntity = bibliotecaList[0];

    await expect(
      service.deleteBookFromLibrary(biblioteca.id, libroNoAsociado.id),
    ).rejects.toHaveProperty(
      'message',
      'El libro con el id ingresado no está asociado a la biblioteca indicada',
    );
  });
});

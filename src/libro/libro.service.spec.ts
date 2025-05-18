import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';
import { LibroService } from './libro.service';
import { LibroEntity } from './libro.entity';

describe('LibroService', () => {
  let service: LibroService;
  let repository: Repository<LibroEntity>;
  let librosList: LibroEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [LibroService],
    }).compile();

    service = module.get<LibroService>(LibroService);
    repository = module.get<Repository<LibroEntity>>(
      getRepositoryToken(LibroEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    librosList = [];

    for (let i = 0; i < 5; i++) {
      const libro: LibroEntity = await repository.save({
        titulo: faker.lorem.words(3),
        autor: faker.person.fullName(),
        fechaPublicacion: faker.date.past({ years: 10 }),
        ISBN: faker.string.uuid(),
      });
      librosList.push(libro);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll deberia retornar todos los libros', async () => {
    const libros: LibroEntity[] = await service.findAll();
    expect(libros).not.toBeNull();
    expect(libros).toHaveLength(librosList.length);
  });

  it('findOne deberia retornar un libro por id', async () => {
    const storedLibro: LibroEntity = librosList[0];
    const libro: LibroEntity = await service.findOne(storedLibro.id);
    expect(libro).not.toBeNull();
    expect(libro.titulo).toEqual(storedLibro.titulo);
    expect(libro.autor).toEqual(storedLibro.autor);
    expect(libro.ISBN).toEqual(storedLibro.ISBN);
    expect(libro.fechaPublicacion.toISOString()).toEqual(
      storedLibro.fechaPublicacion.toISOString(),
    );
  });

  it('findOne deberia lanzar una excepcion por un libro invalido', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'El libro con el id ingresado no fue encontrado',
    );
  });

  it('create deberia retornar un nuevo libro', async () => {
    const libro: LibroEntity = {
      id: '',
      titulo: faker.lorem.words(3),
      autor: faker.person.fullName(),
      fechaPublicacion: faker.date.past({ years: 10 }),
      ISBN: faker.string.uuid(),
      bibliotecas: [],
    };

    const newLibro: LibroEntity = await service.create(libro);
    expect(newLibro).not.toBeNull();

    const storedLibro = await repository.findOne({
      where: { id: newLibro.id },
    });
    expect(libro).not.toBeNull();
    expect(libro.titulo).toEqual(storedLibro!.titulo);
    expect(libro.autor).toEqual(storedLibro!.autor);
    expect(libro.ISBN).toEqual(storedLibro!.ISBN);
    expect(libro.fechaPublicacion.toISOString()).toEqual(
      storedLibro!.fechaPublicacion.toISOString(),
    );
  });

  it('update deberia modificar un libro', async () => {
    const libro: LibroEntity = librosList[0];
    libro.titulo = 'Cambio titulo';
    libro.autor = 'Cambio autor';

    const updatedLibro: LibroEntity = await service.update(libro.id, libro);
    expect(updatedLibro).not.toBeNull();

    const storedLibro = await repository.findOne({ where: { id: libro.id } });
    expect(storedLibro).not.toBeNull();
    expect(storedLibro!.titulo).toEqual(libro.titulo);
    expect(storedLibro!.autor).toEqual(libro.autor);
  });

  it('update deberia lanzar una excepcion por un libro invalido', async () => {
    let libro: LibroEntity = librosList[0];
    libro = {
      ...libro,
      titulo: 'Cambio titulo',
      autor: 'Cambio autor',
    };
    await expect(() => service.update('0', libro)).rejects.toHaveProperty(
      'message',
      'El libro con el id ingresado no fue encontrado',
    );
  });

  it('delete deberia eliminar un libro', async () => {
    const libro: LibroEntity = librosList[0];
    await service.delete(libro.id);

    const deletedLibro = await repository.findOne({ where: { id: libro.id } });
    expect(deletedLibro).toBeNull();
  });

  it('delete deberia lanzar una excepcion por un libro invalido', async () => {
    const libro: LibroEntity = librosList[0];
    await service.delete(libro.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'El libro con el id ingresado no fue encontrado',
    );
  });
});

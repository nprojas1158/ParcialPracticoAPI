import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { BibliotecaService } from './biblioteca.service';
import { BibliotecaEntity } from './biblioteca.entity';
import { faker } from '@faker-js/faker';

describe('BibliotecaService', () => {
  let service: BibliotecaService;
  let repository: Repository<BibliotecaEntity>;
  let bibliotecaList: BibliotecaEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [BibliotecaService],
    }).compile();

    service = module.get<BibliotecaService>(BibliotecaService);
    repository = module.get<Repository<BibliotecaEntity>>(
      getRepositoryToken(BibliotecaEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    bibliotecaList = [];

    for (let i = 0; i < 5; i++) {
      const apertura = faker.date.between({
        from: new Date('2024-01-01T07:00:00'),
        to: new Date('2024-01-01T10:00:00'),
      });

      const cierre = faker.date.between({
        from: new Date(apertura.getTime() + 2 * 60 * 60 * 1000),
        to: new Date('2024-01-01T20:00:00'),
      });

      const biblioteca: BibliotecaEntity = await repository.save({
        nombre: faker.company.name(),
        direccion: faker.location.streetAddress(),
        ciudad: faker.location.city(),
        horaApertura: apertura,
        horaCierre: cierre,
      });

      bibliotecaList.push(biblioteca);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll deberia retornar todas las bibliotecas', async () => {
    const bibliotecas: BibliotecaEntity[] = await service.findAll();
    expect(bibliotecas).not.toBeNull();
    expect(bibliotecas).toHaveLength(bibliotecaList.length);
  });

  it('findOne deberia retornar una biblioteca por id', async () => {
    const storedBiblioteca: BibliotecaEntity = bibliotecaList[0];
    const biblioteca: BibliotecaEntity = await service.findOne(
      storedBiblioteca.id,
    );
    expect(biblioteca).not.toBeNull();
    expect(biblioteca.nombre).toEqual(storedBiblioteca.nombre);
    expect(biblioteca.direccion).toEqual(storedBiblioteca.direccion);
    expect(biblioteca.ciudad).toEqual(storedBiblioteca.ciudad);
    expect(biblioteca.horaApertura.toISOString()).toEqual(
      storedBiblioteca.horaApertura.toISOString(),
    );
    expect(biblioteca.horaCierre.toISOString()).toEqual(
      storedBiblioteca.horaCierre.toISOString(),
    );
  });

  it('findOne deberia lanzar una excepcion por una biblioteca invalida', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'La biblioteca con el id ingresado no fue encontrada',
    );
  });

  it('create deberia retornar una nueva biblioteca', async () => {
    const biblioteca: BibliotecaEntity = {
      id: '',
      nombre: faker.company.name(),
      direccion: faker.location.streetAddress(),
      ciudad: faker.location.city(),
      horaApertura: new Date('2024-01-01T08:00:00'),
      horaCierre: new Date('2024-01-01T18:00:00'),
      libros: [],
    };

    const newBiblioteca: BibliotecaEntity = await service.create(biblioteca);
    expect(newBiblioteca).not.toBeNull();

    const storedBiblioteca = await repository.findOne({
      where: { id: newBiblioteca.id },
    });
    expect(storedBiblioteca).not.toBeNull();
    expect(storedBiblioteca!.nombre).toEqual(storedBiblioteca!.nombre);
    expect(storedBiblioteca!.direccion).toEqual(storedBiblioteca!.direccion);
    expect(storedBiblioteca!.ciudad).toEqual(storedBiblioteca!.ciudad);
    expect(storedBiblioteca!.horaApertura.toISOString()).toEqual(
      storedBiblioteca!.horaApertura.toISOString(),
    );
    expect(storedBiblioteca!.horaCierre.toISOString()).toEqual(
      storedBiblioteca!.horaCierre.toISOString(),
    );
  });

  it('update deberia modificar una biblioteca', async () => {
    const biblioteca: BibliotecaEntity = bibliotecaList[0];
    biblioteca.nombre = 'Cambio nombre';
    biblioteca.direccion = 'Cambio direccion';

    const updatedBiblioteca = await service.update(biblioteca.id, biblioteca);
    expect(updatedBiblioteca).not.toBeNull();

    const storedBiblioteca = await repository.findOne({
      where: { id: biblioteca.id },
    });
    expect(storedBiblioteca).not.toBeNull();
    expect(storedBiblioteca!.nombre).toEqual(biblioteca.nombre);
    expect(storedBiblioteca!.direccion).toEqual(biblioteca.direccion);
  });

  it('update deberia lanzar una excepcion por una biblioteca invalida', async () => {
    let biblioteca: BibliotecaEntity = bibliotecaList[0];
    biblioteca = {
      ...biblioteca,
      nombre: 'Cambio nombre',
      direccion: 'Cambio direccion',
    };
    await expect(() => service.update('0', biblioteca)).rejects.toHaveProperty(
      'message',
      'La biblioteca con el id ingresado no fue encontrada',
    );
  });

  it('delete deberia eliminar una biblioteca', async () => {
    const biblioteca: BibliotecaEntity = bibliotecaList[0];
    await service.delete(biblioteca.id);

    const deletedBiblioteca = await repository.findOne({
      where: { id: biblioteca.id },
    });
    expect(deletedBiblioteca).toBeNull();
  });

  it('delete deberia lanzar una excepcion por una biblioteca invalida', async () => {
    const biblioteca: BibliotecaEntity = bibliotecaList[0];
    await service.delete(biblioteca.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'La biblioteca con el id ingresado no fue encontrada',
    );
  });
});

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptors';
import { BibliotecaLibroService } from './biblioteca-libro.service';
import { LibroEntity } from 'src/libro/libro.entity';
import { LibroDto } from 'src/libro/libro.dto';
import { BibliotecaEntity } from 'src/biblioteca/biblioteca.entity';

@Controller('libraries')
@UseInterceptors(BusinessErrorsInterceptor)
export class BibliotecaLibroController {
  constructor(
    private readonly bibliotecaLibroService: BibliotecaLibroService,
  ) {}

  @Post(':idBiblioteca/books/:idLibro')
  async addBookToLibrary(
    @Param('idBiblioteca') idBiblioteca: string,
    @Param('idLibro') idLibro: string,
  ) {
    return await this.bibliotecaLibroService.addBookToLibrary(
      idBiblioteca,
      idLibro,
    );
  }

  @Get(':idBiblioteca/books')
  async findBooksFromLibrary(@Param('idBiblioteca') idBiblioteca: string) {
    return await this.bibliotecaLibroService.findBooksFromLibrary(idBiblioteca);
  }

  @Get(':idBiblioteca/books/:idlibro')
  async findBookFromLibrary(
    @Param('idBiblioteca') idBiblioteca: string,
    @Param('idLibro') idLibro: string,
  ) {
    return await this.bibliotecaLibroService.findBookFromLibrary(
      idBiblioteca,
      idLibro,
    );
  }

  @Put(':idBiblioteca/books')
  async updateBooksFromLibrary(
    @Param('idBiblioteca') idBiblioteca: string,
    @Body() librosDto: LibroDto[],
  ): Promise<BibliotecaEntity> {
    const libros = plainToInstance(LibroEntity, librosDto);
    return this.bibliotecaLibroService.updateBooksFromLibrary(idBiblioteca,
      libros,
    );
  }

  @Delete(':idBiblioteca/books')
  @HttpCode(204)
  async deleteBookFromLibrary(
    @Param('idBibliteca') idBiblioteca: string,
    @Param('idLibro') idLibro: string,
  ) {
    return await this.bibliotecaLibroService.deleteBookFromLibrary(
      idBiblioteca,
      idLibro,
    );
  }}

 

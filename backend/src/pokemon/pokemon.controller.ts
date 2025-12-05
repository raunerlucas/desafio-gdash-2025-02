import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { PokemonQueryDto } from './dto/pokemon.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pokemon')
@UseGuards(JwtAuthGuard)
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  findAll(@Query() query: PokemonQueryDto) {
    return this.pokemonService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pokemonService.findOne(id);
  }
}

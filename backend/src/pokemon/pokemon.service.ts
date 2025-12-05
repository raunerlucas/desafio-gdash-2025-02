import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  PokemonQueryDto,
  PokemonListResponseDto,
  PokemonDetailDto,
  PokemonSummaryDto,
  PokemonAbilityDto,
  PokemonStatDto
} from './dto/pokemon.dto';

@Injectable()
export class PokemonService {
  private readonly baseUrl = process.env.POKEMON_API_URL || 'https://pokeapi.co/api/v2';

  constructor(private readonly httpService: HttpService) {}

  async findAll(query: PokemonQueryDto): Promise<PokemonListResponseDto> {
    const { page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`)
      );

      const { results, count } = response.data;
      const totalPages = Math.ceil(count / limit);

      // Enriquecer os dados com ID e imagem
      const enrichedData: PokemonSummaryDto[] = results.map((pokemon: any) => {
        const urlParts = pokemon.url.split('/');
        const id = parseInt(urlParts[urlParts.length - 2]);

        return {
          id,
          name: pokemon.name,
          url: pokemon.url,
          imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        };
      });

      return {
        data: enrichedData,
        total: count,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      console.error('Error fetching Pokemon list:', error);
      throw new Error('Failed to fetch Pokemon list');
    }
  }

  async findOne(id: number): Promise<PokemonDetailDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/pokemon/${id}`)
      );

      const pokemon = response.data;

      const abilities: PokemonAbilityDto[] = pokemon.abilities.map((ability: any) => ({
        name: ability.ability.name,
        isHidden: ability.is_hidden,
      }));

      const stats: PokemonStatDto[] = pokemon.stats.map((stat: any) => ({
        name: stat.stat.name,
        baseStat: stat.base_stat,
      }));

      const types: string[] = pokemon.types.map((type: any) => type.type.name);

      return {
        id: pokemon.id,
        name: pokemon.name,
        height: pokemon.height,
        weight: pokemon.weight,
        baseExperience: pokemon.base_experience,
        imageUrl: pokemon.sprites?.front_default ||
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
        types,
        abilities,
        stats,
      };
    } catch (error) {
      console.error(`Error fetching Pokemon ${id}:`, error);
      throw new Error(`Failed to fetch Pokemon with ID ${id}`);
    }
  }
}

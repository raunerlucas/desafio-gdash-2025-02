import { IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class PokemonQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 20;
}

export class PokemonListResponseDto {
  data: PokemonSummaryDto[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class PokemonSummaryDto {
  id: number;
  name: string;
  url: string;
  imageUrl: string;
}

export class PokemonDetailDto {
  id: number;
  name: string;
  height: number;
  weight: number;
  baseExperience: number;
  imageUrl: string;
  types: string[];
  abilities: PokemonAbilityDto[];
  stats: PokemonStatDto[];
}

export class PokemonAbilityDto {
  name: string;
  isHidden: boolean;
}

export class PokemonStatDto {
  name: string;
  baseStat: number;
}

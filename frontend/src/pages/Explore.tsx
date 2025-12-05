import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  Users,
  Eye,
  Compass,
} from 'lucide-react';

interface PokemonListItem {
  name: string;
  url: string;
}

interface PokemonDetails {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: {
    front_default: string;
    front_shiny: string;
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
}

interface PaginationData {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

const Explore: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadPokemonList(1);
  }, []);

  const loadPokemonList = async (page: number) => {
    try {
      setLoading(true);
      const offset = (page - 1) * itemsPerPage;
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${itemsPerPage}&offset=${offset}`
      );
      const data: PaginationData = await response.json();

      setPokemonList(data.results);
      setPagination(data);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading Pokemon list:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPokemonDetails = async (pokemonUrl: string) => {
    try {
      setDetailLoading(true);
      const response = await fetch(pokemonUrl);
      const data: PokemonDetails = await response.json();
      setSelectedPokemon(data);
    } catch (error) {
      console.error('Error loading Pokemon details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const searchPokemon = async (name: string) => {
    if (!name.trim()) {
      loadPokemonList(1);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
      );

      if (response.ok) {
        const data: PokemonDetails = await response.json();
        setPokemonList([{ name: data.name, url: `https://pokeapi.co/api/v2/pokemon/${data.id}/` }]);
        setPagination(null);
        setSelectedPokemon(data);
      } else {
        setPokemonList([]);
        setPagination(null);
      }
    } catch (error) {
      console.error('Error searching Pokemon:', error);
      setPokemonList([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchPokemon(searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    loadPokemonList(newPage);
  };

  const getPokemonImageUrl = (pokemonUrl: string) => {
    const id = pokemonUrl.split('/').filter(Boolean).pop();
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  };

  const formatStatName = (statName: string) => {
    const statMap: { [key: string]: string } = {
      'hp': 'HP',
      'attack': 'Ataque',
      'defense': 'Defesa',
      'special-attack': 'Ataque Esp.',
      'special-defense': 'Defesa Esp.',
      'speed': 'Velocidade',
    };
    return statMap[statName] || statName;
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      fire: 'bg-red-500',
      water: 'bg-blue-500',
      grass: 'bg-green-500',
      electric: 'bg-yellow-500',
      psychic: 'bg-pink-500',
      ice: 'bg-blue-200',
      dragon: 'bg-purple-500',
      dark: 'bg-gray-800',
      fairy: 'bg-pink-300',
      normal: 'bg-gray-400',
      fighting: 'bg-red-700',
      poison: 'bg-purple-600',
      ground: 'bg-yellow-600',
      flying: 'bg-indigo-400',
      bug: 'bg-green-400',
      rock: 'bg-yellow-800',
      ghost: 'bg-purple-700',
      steel: 'bg-gray-500',
    };
    return colors[type] || 'bg-gray-400';
  };

  const totalPages = pagination ? Math.ceil(pagination.count / itemsPerPage) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Compass className="h-8 w-8 mr-3" />
            Explorar Pokémon
          </h1>
          <p className="text-gray-600 mt-1">
            Explore dados de Pokémon através da PokéAPI pública
          </p>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-2" />
          {pagination && `${pagination.count} Pokémon disponíveis`}
        </div>
      </div>

      {/* Search */}
      <Card className="p-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar Pokémon pelo nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              loadPokemonList(1);
              setSelectedPokemon(null);
            }}
          >
            Limpar
          </Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pokemon List */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Lista de Pokémon
            </h3>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pokemonList.map((pokemon) => (
                    <div
                      key={pokemon.name}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => loadPokemonDetails(pokemon.url)}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={getPokemonImageUrl(pokemon.url)}
                          alt={pokemon.name}
                          className="w-12 h-12"
                          loading="lazy"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">
                            {pokemon.name}
                          </h4>
                          <div className="flex items-center text-sm text-gray-600">
                            <Eye className="h-3 w-3 mr-1" />
                            Ver detalhes
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && !searchTerm && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Página {currentPage} de {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages || loading}
                      >
                        Próximo
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>

        {/* Pokemon Details */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detalhes do Pokémon
            </h3>

            {detailLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : selectedPokemon ? (
              <div className="space-y-4">
                {/* Pokemon Image and Basic Info */}
                <div className="text-center">
                  <img
                    src={selectedPokemon.sprites.front_default}
                    alt={selectedPokemon.name}
                    className="w-32 h-32 mx-auto"
                  />
                  <h4 className="text-xl font-bold capitalize text-gray-900">
                    {selectedPokemon.name}
                  </h4>
                  <p className="text-gray-600">#{selectedPokemon.id}</p>
                </div>

                {/* Types */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Tipos</h5>
                  <div className="flex gap-2 flex-wrap">
                    {selectedPokemon.types.map((type) => (
                      <span
                        key={type.type.name}
                        className={`px-3 py-1 rounded-full text-white text-sm capitalize ${getTypeColor(type.type.name)}`}
                      >
                        {type.type.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Physical Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-900">Altura</h5>
                    <p className="text-gray-600">{selectedPokemon.height / 10}m</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Peso</h5>
                    <p className="text-gray-600">{selectedPokemon.weight / 10}kg</p>
                  </div>
                </div>

                {/* Base Experience */}
                <div>
                  <h5 className="font-medium text-gray-900">Experiência Base</h5>
                  <p className="text-gray-600">{selectedPokemon.base_experience}</p>
                </div>

                {/* Stats */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Estatísticas</h5>
                  <div className="space-y-2">
                    {selectedPokemon.stats.map((stat) => (
                      <div key={stat.stat.name}>
                        <div className="flex justify-between text-sm">
                          <span>{formatStatName(stat.stat.name)}</span>
                          <span className="font-medium">{stat.base_stat}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(100, (stat.base_stat / 255) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shiny Sprite */}
                {selectedPokemon.sprites.front_shiny && (
                  <div className="text-center pt-4 border-t">
                    <h5 className="font-medium text-gray-900 mb-2">Versão Shiny</h5>
                    <img
                      src={selectedPokemon.sprites.front_shiny}
                      alt={`${selectedPokemon.name} shiny`}
                      className="w-20 h-20 mx-auto"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Star className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Selecione um Pokémon para ver os detalhes</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Explore;

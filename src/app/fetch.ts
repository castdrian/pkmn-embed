import type { Pokemon, PokemonApiResponse } from "./types";

const pokemonQuery = `
	{
		getFuzzyPokemon(pokemon: %POKEMON%) {
			num
			species
			baseSpecies
			classification
			forme
			sprite
			shinySprite
			backSprite
			shinyBackSprite
			gender {
				female
				male
			}
			catchRate {
				base
				percentageWithOrdinaryPokeballAtFullHealth
			}
			baseStats {
				attack
				defense
				hp
				specialattack
				specialdefense
				speed
			}
			types {
				name
			}
			flavorTexts {
				flavor
			}
			height
			weight
			abilities {
				first {
					name
				}
				second {
					name
				}
				hidden {
					name
				}
			}
			color
			smogonTier
		}
	}
`;

export async function fetchMon(id: string): Promise<Pokemon> {
	const response = await fetch("https://graphqlpokemon.favware.tech/v8", {
		body: JSON.stringify({
			query: pokemonQuery.replace("%POKEMON%", JSON.stringify(id)),
		}),
		headers: {
			"Content-Type": "application/json",
		},
		method: "POST",
	});

	if (!response.ok) {
		throw new Error(`Pokémon API request failed with status ${response.status}`);
	}

	const payload = (await response.json()) as PokemonApiResponse;
	const mon = payload.data.getFuzzyPokemon[0];

	if (!mon) {
		throw new Error(`No Pokémon found for ${id}`);
	}

	return mon;
}

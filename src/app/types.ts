export interface Pokemon {
	num: number;
	species: string;
	baseSpecies: string | null;
	classification: string | null;
	gender: {
		female: string;
		male: string;
	};
	catchRate: {
		percentageWithOrdinaryPokeballAtFullHealth: string;
	};
	forme: string | null;
	sprite: string;
	shinySprite: string;
	backSprite: string;
	shinyBackSprite: string;
	baseStats: {
		attack: number;
		defense: number;
		hp: number;
		specialattack: number;
		specialdefense: number;
		speed: number;
	};
	types: Array<{ name: string }>;
	flavorTexts: Array<{ flavor: string }>;
	height: number;
	weight: number;
	abilities: {
		first: { name: string };
		second: { name: string } | null;
		hidden: { name: string } | null;
	};
	color: string;
	smogonTier: string;
}

export interface PokemonApiResponse {
	data: {
		getFuzzyPokemon: Pokemon[];
	};
}

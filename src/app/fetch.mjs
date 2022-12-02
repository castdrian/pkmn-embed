import { request } from "undici";

export async function fetchMon(id) {
	// check if id is a number
	if (isNaN(id)) {
		// if not, get the national dex number from the name
		// id = mon.getPokemonByName(id).num;
	}

	const mon = await request('https://graphqlpokemon.favware.tech/v7', {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json'
		},
		body: JSON.stringify({
		  query: `
			{
			  getFuzzyPokemon(pokemon: "${id}") {
				num
				species
				sprite
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
				serebiiPage
			  }
			}
		  `
		})
	}).then(({ body }) => body.json());
	return mon.data.getFuzzyPokemon[0];
}
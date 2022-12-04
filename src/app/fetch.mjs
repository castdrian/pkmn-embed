import { request } from "undici";

export async function fetchMon(id) {
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
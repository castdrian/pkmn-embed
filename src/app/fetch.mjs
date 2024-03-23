import { request } from "undici";

export async function fetchMon(id) {
	const mon = await request('https://graphqlpokemon.favware.tech/v8', {
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
				shinySprite
				backSprite
				shinyBackSprite
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
				serebiiPage
			  }
			}
		  `
		})
	}).then(({ body }) => body.json());
	return mon.data.getFuzzyPokemon[0];
}
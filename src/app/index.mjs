import { fetchMon } from "./fetch.mjs";
import { getEmbedHTML } from "./response.mjs";

export default async (app, _opts) => {
	app.get('/', async (_req, reply) => {
		const html = `
		<html>
			<head>
				<link rel="icon" href="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg">
			</head>
			<body>
				<code>https://embed.pkmn.dev/:id<br>// :id is the species name of the Pokémon</code><br><br><code>https://embed.pkmn.dev/:id?sprite=value<br>// the sprite query parameter value can be one of the following: <br> // shiny, back, shiny&back, back&shiny</code>
			</body>
		</html>`;
		reply.code(200).type('text/html; charset=utf-8').send(html);
	});
	// respond to every /:id request with the embed
	app.get('/:id', async (req, reply) => {
		// get the id from the request
		const { id } = req.params;
		const { query } = req;
		// fetch the data from the API
		const mon = await fetchMon(id);
		// get the embed html
		const html = await getEmbedHTML(mon, query?.sprite);
		reply.code(200).type('text/html; charset=utf-8').send(html);
	});
}
import { fetchMon } from "./fetch.mjs";
import { getEmbedHTML } from "./response.mjs";

export default async (app, opts) => {
	app.get('/', async (req, reply) => {
		reply.code(200).type('text/html').send('<code>https://api.pkmn.dev/embed/:id\n// :id is the national dex number of the Pokémon or the species name</code>');
	});
// respond to every /embed/:id request with the embed
	app.get('/embed/:id', async (req, reply) => {
		// get the id from the request
		const { id } = req.params;
		// fetch the data from the API
		const mon = await fetchMon(id);
		// get the embed html
		const html = await getEmbedHTML(mon, id);
		reply.code(200).type('text/html').send(html);
	});
}
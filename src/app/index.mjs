import { fetchMon } from "./fetch.mjs";

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
		console.log(mon);

		const html = `
		<html>
			<head>
			<meta property="og:url" content="${mon.serebiiPage}" />
			<meta property="og:title" content="#${mon.num} ${mon.species}" />
			<meta property="og:image" content="${mon.sprite}" />
			<meta property="og:description" content="${mon.flavorTexts[0].flavor}" />
			</head>
			<body>
				Please copy <a href="https://api.pkmn.dev/embed/${id}">https://api.pkmn.dev/embed/${id}</a> and paste it into a Discord channel.
			</body>
		</html>
		`
		reply.code(200).type('text/html').send(html);
	});
}
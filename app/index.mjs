async function server (app, opts) {
// respond to every /embed/:id request with the embed
app.get('/embed/:id', async (req, reply) => {
		// get the id from the request
		const { id } = req.params;
		// const { sprite, num, species, color } = mon.getPokemon;
		const html = `
		<html>
			<head>
			<meta property="og:title" content="${id}" />
			<meta property="og:description" content="${id} placeholder description" />
			</head>
			<body>
			<h1>${id}</h1>
		</body>
		</html>
		`
		reply.code(200).type('text/html').send(html);
	});
}
  
export default server
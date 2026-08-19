export function getIndexHTML(): string {
	return `
	<html>
		<head>
			<link rel="icon" href="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg">
		</head>
		<body>
			<code>https://embed.pkmn.dev/:id<br>// :id is the species name of the Pokémon</code><br><br><code>https://embed.pkmn.dev/:id?sprite=value<br>// the sprite query parameter value can be one of the following: <br> // shiny, back, shiny&back, back&shiny</code>
		</body>
	</html>`;
}

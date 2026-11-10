export function getIndexHTML(): string {
	return `
	<html>
		<head>
			<link rel="icon" href="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg">
		</head>
		<body>
			<p>Replace <code>:id</code> with a Pokémon species name in <code>https://embed.pkmn.dev/:id</code>.</p>
			<p>Use <code>?sprite=shiny</code>, <code>?sprite=back</code>, or <code>?sprite=shiny%26back</code> to select a sprite.</p>
		</body>
	</html>`;
}

export function getIndexHTML(): string {
	return `
	<html>
		<head>
			<link rel="icon" href="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg">
		</head>
		<body>
			<p>Replace <code>:id</code> with a Pokémon species name in <code>https://embed.pkmn.dev/:id</code>.</p>
			<p>The preview shows front and back sprites. Use <code>?sprite=shiny</code> for both shiny views.</p>
		</body>
	</html>`;
}

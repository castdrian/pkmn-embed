export async function getEmbedHTML(mon) {
	const { num, species, sprite, types, flavorTexts, height, weight, abilities, serebiiPage } = mon;

	const type1 = types[0].name;
	const type2 = types[1] ? types[1].name : null;

	const ability1 = abilities.first.name;
	const ability2 = abilities.second ? abilities.second.name : null;
	const abilityHidden = abilities.hidden ? abilities.hidden.name : null;

	const flavor = flavorTexts[0].flavor;

	const description = `Type: ${type1}${type2 ? `/${type2}` : ''}\nAbility: ${ability1}${ability2 ? `/${ability2}` : ''}${abilityHidden ? ` (Hidden: ${abilityHidden})` : ''}\nHeight: ${height} M Weight: ${weight} KG\n\n${flavor}\n\n${serebiiPage ? `Read more at ${serebiiPage}` : ''}`;

	const embed = `
	<html>
		<head>
			<meta property="og:url" content="${serebiiPage}" />
			<meta property="og:title" content="#${num} ${species.charAt(0).toUpperCase() + mon.species.slice(1)}" />
			<meta property="og:image" content="${sprite}" />
			<meta property="og:description" content="${description}" />
		</head>
		<body>
			Please copy <a href="https://embed.pkmn.dev/${species}">https://embed.pkmn.dev/${species}</a> and paste it into a Discord channel.
		</body>
	</html>
	`

	return embed;
}
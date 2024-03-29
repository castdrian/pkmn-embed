import { resolveColor, typeWithUnicodeEmoji } from "./util.mjs";

export async function getEmbedHTML(mon, query) {
	const { num, species, sprite, shinySprite, backSprite, shinyBackSprite, baseStats, types, flavorTexts, height, weight, abilities, color, serebiiPage } = mon;

	const type1 = types[0].name;
	const type2 = types[1] ? types[1].name : null;

	const ability1 = abilities.first.name;
	const ability2 = abilities.second ? abilities.second.name : null;
	const abilityHidden = abilities.hidden ? abilities.hidden.name : null;

	const { attack, defense, hp, specialattack, specialdefense, speed } = baseStats;
	const stats = `${hp} HP / ${attack} Atk / ${defense} Def / ${specialattack} SpA / ${specialdefense} SpD / ${speed} Spe`;

	const flavor = flavorTexts[0]?.flavor ?? 'No description available';
	let thumbnail;

	switch (query) {
		case 'shiny':
			thumbnail = shinySprite;
			break;
		case 'back':
			thumbnail = backSprite;
			break;
		case 'shiny&back':
		case 'back&shiny':
			thumbnail = shinyBackSprite;
			break;
		default:
			thumbnail = sprite;
			break;
	}

	const description = `Type: ${typeWithUnicodeEmoji(type1)}${type2 ? `/${typeWithUnicodeEmoji(type2)}` : ''}\nAbility: ${ability1}${ability2 ? `/${ability2}` : ''}${abilityHidden ? ` | HA: ${abilityHidden}` : ''}\nDimensions: Height: ${height} M | Weight: ${weight} KG\nBase Stats: ${stats}\n\n${flavor}`;
	const url = query ? `https://embed.pkmn.dev/${species}?sprite=${query}` : `https://embed.pkmn.dev/${species}`;

	const embed = `
	<html>
		<head>
			<link rel="icon" href="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg">
			<meta property="og:url" content="${serebiiPage}" />
			<meta property="og:title" content="#${num} ${species.charAt(0).toUpperCase() + mon.species.slice(1)}" />
			<meta property="og:image" content="${thumbnail}" />
			<meta property="og:description" content="${description}" />
			<meta name="theme-color" content="${resolveColor(color)}" />
		</head>
		<body>
			Please copy <a href="${url}">${url}</a> and paste it into a Discord channel.
		</body>
	</html>
	`

	return embed;
}
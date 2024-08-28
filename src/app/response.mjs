import { resolveColor, typeWithUnicodeEmoji } from "./util.mjs";

export async function getEmbedHTML(mon, query) {
	const { num, species, baseSpecies, classification, gender, catchRate, forme, sprite, shinySprite, backSprite, shinyBackSprite, baseStats, types, flavorTexts, height, weight, abilities, color, smogonTier } = mon;

	const type1 = types[0].name;
	const type2 = types[1] ? types[1].name : null;

	const ability1 = abilities.first.name;
	const ability2 = abilities.second ? abilities.second.name : null;
	const abilityHidden = abilities.hidden ? abilities.hidden.name : null;

	const { attack, defense, hp, specialattack, specialdefense, speed } = baseStats;
	const stats = `${hp} HP / ${attack} Atk / ${defense} Def / ${specialattack} SpA / ${specialdefense} SpD / ${speed} Spe`;

	const flavor = flavorTexts[0]?.flavor ?? 'No description available';
	const { percentageWithOrdinaryPokeballAtFullHealth } = catchRate;
	
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

	const description = `${classification ? `The ${classification}` : ""}\n\nType: ${typeWithUnicodeEmoji(type1)}${type2 ? ` ${typeWithUnicodeEmoji(type2)}` : ''} | Tier: ${smogonTier}\nAbility: ${ability1}${ability2 ? `/${ability2}` : ''}${abilityHidden ? ` | HA: ${abilityHidden}` : ''}\nDimensions: Height: ${height} M | Weight: ${weight} KG\nBase Stats: ${stats}\n\n${flavor}\n\n🪙 consider donating on ko-fi.com/castdrian`;
	const url = query ? `https://embed.pkmn.dev/${species}?sprite=${query}` : `https://embed.pkmn.dev/${species}`;

	const embed = `
	<html>
		<head>
			<link rel="icon" href="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg">
			<meta property="og:title" content="#${num} ${baseSpecies ? `${baseSpecies.charAt(0).toUpperCase()}${baseSpecies.slice(1)}` : `${species.charAt(0).toUpperCase()}${species.slice(1)}`}${forme ? ` (${forme})` : ''} (♂️ ${gender.male} ♀️ ${gender.female} ◓ ${percentageWithOrdinaryPokeballAtFullHealth})" />
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

import { resolveColor, typeWithUnicodeEmoji } from "./util";
import { getFallbackSprite } from "./sprites";
import type { Pokemon } from "./types";

export function getEmbedHTML(mon: Pokemon, query?: string | null, thumbnail = getFallbackSprite(mon, query)): string {
	const {
		num,
		species,
		baseSpecies,
		classification,
		gender,
		catchRate,
		forme,
		baseStats,
		types,
		flavorTexts,
		height,
		weight,
		abilities,
		color,
		smogonTier,
	} = mon;

	const type1 = types[0];

	if (!type1) {
		throw new Error(`No type found for ${species}`);
	}

	const type2 = types[1]?.name;
	const ability1 = abilities.first.name;
	const ability2 = abilities.second?.name;
	const abilityHidden = abilities.hidden?.name;
	const { attack, defense, hp, specialattack, specialdefense, speed } = baseStats;
	const stats = `${hp} HP / ${attack} Atk / ${defense} Def / ${specialattack} SpA / ${specialdefense} SpD / ${speed} Spe`;
	const flavor = flavorTexts[0]?.flavor ?? "No description available";
	const { percentageWithOrdinaryPokeballAtFullHealth } = catchRate;

	const description = `${classification ? `The ${classification}\n\n` : ""}Type: ${typeWithUnicodeEmoji(type1.name)}${type2 ? ` ${typeWithUnicodeEmoji(type2)}` : ""} | Tier: ${smogonTier}\nAbility: ${ability1}${ability2 ? `/${ability2}` : ""}${abilityHidden ? ` | HA: ${abilityHidden}` : ""}\nHeight: ${height} M | Weight: ${weight} KG\nBase Stats: ${stats}\n\n${flavor}`;
	const url = query ? `https://embed.pkmn.dev/${species}?sprite=${query}` : `https://embed.pkmn.dev/${species}`;

	return `
	<html>
		<head>
			<link rel="icon" href="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg">
			<meta property="og:title" content="#${num} ${baseSpecies ? `${baseSpecies.charAt(0).toUpperCase()}${baseSpecies.slice(1)}` : `${species.charAt(0).toUpperCase()}${species.slice(1)}`}${forme ? ` (${forme})` : ""} (♂️ ${gender.male} ♀️ ${gender.female} ◓ ${percentageWithOrdinaryPokeballAtFullHealth})" />
			<meta property="og:image" content="${thumbnail}" />
			<meta property="og:description" content="${description}" />
			<meta name="theme-color" content="${resolveColor(color)}" />
		</head>
		<body>
			<p>Please copy <a href="${url}">${url}</a> and paste it into a Discord channel.</p>
			<p><a href="https://ko-fi.com/castdrian" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.65rem 1rem; border-radius: 0.5rem; background: #13c3ff; color: #082032; font-weight: 700; text-decoration: none;">☕ Support this project</a></p>
		</body>
	</html>
	`;
}

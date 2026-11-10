import { escapeMarkdown, getComponentEmbed } from "./component-embed";
import { resolveColor, typeWithUnicodeEmoji } from "./util";
import { getFallbackSprite, spriteVariants } from "./sprites";
import type { Pokemon } from "./types";

function escapeHTML(value: string): string {
	return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function getEmbedHTML(mon: Pokemon, sprites = spriteVariants.map((variant) => getFallbackSprite(mon, variant))): string {
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
	const url = new URL(encodeURIComponent(species), "https://embed.pkmn.dev/");
	const shareURL = escapeHTML(url.href);
	const name = baseSpecies || species;
	const title = `#${num} ${name.charAt(0).toUpperCase()}${name.slice(1)}${forme ? ` (${forme})` : ""}`;
	const demographics = `♂️ ${gender.male} ♀️ ${gender.female}`;
	const accent = resolveColor(color);
	const heading = `## ${escapeMarkdown(title)}${classification ? `\n-# The ${escapeMarkdown(classification)}` : ""}`;
	const typeNames = types.slice(0, 2).map(({ name }) => typeWithUnicodeEmoji(name)).join(" · ");
	const abilityNames = [ability1, ability2].filter(Boolean).join(" / ");
	const details = [
		`**Type** ${escapeMarkdown(typeNames)} · **Tier** ${escapeMarkdown(smogonTier)}`,
		`**Abilities** ${escapeMarkdown(abilityNames)}${abilityHidden ? ` · **Hidden** ${escapeMarkdown(abilityHidden)}` : ""}`,
		`**Height** ${height} m · **Weight** ${weight} kg`,
		`**Gender** ${escapeMarkdown(demographics)} · **Catch chance** ${escapeMarkdown(percentageWithOrdinaryPokeballAtFullHealth)}`,
		`**Base stats** ${stats}`,
	].join("\n");
	const payload = getComponentEmbed(mon, accent, sprites, heading, details, flavor);

	return `
	<html>
		<head>
			<link rel="icon" href="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg">
			<meta property="og:title" content="${escapeHTML(`${title} (${demographics} ◓ ${percentageWithOrdinaryPokeballAtFullHealth})`)}" />
			<meta property="og:image" content="${escapeHTML(sprites[0] ?? "")}" />
			<meta property="og:description" content="${escapeHTML(description)}" />
			<meta name="theme-color" content="${accent}" />
			${payload ? `<script id="discord:component-embed" type="application/json">${payload}</script>` : ""}
		</head>
		<body>
			<p>Please copy <a href="${shareURL}">${shareURL}</a> and paste it into a Discord channel.</p>
			<p><a href="https://ko-fi.com/castdrian" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.65rem 1rem; border-radius: 0.5rem; background: #13c3ff; color: #082032; font-weight: 700; text-decoration: none;">☕ Support this project</a></p>
		</body>
	</html>
	`;
}

import { escapeMarkdown, getComponentEmbed } from "./component-embed";
import { resolveColor, typeWithUnicodeEmoji } from "./util";
import { getFallbackSprite, getSpriteVariant } from "./sprites";
import type { Pokemon } from "./types";

const typeIcons = new Map([
	["Bug", "<:bugtype:1038083428156985354>"],
	["Dark", "<:darktype:1038083430166044773>"],
	["Dragon", "<:dragontype:1038083431592112169>"],
	["Electric", "<:electrictype:1038083433500528730>"],
	["Fairy", "<:fairytype:1038083435106938980>"],
	["Fighting", "<:fighting:1038083436654624918>"],
	["Fire", "<:firetype:1038083438344949860>"],
	["Flying", "<:flyingtype:1038083439905226822>"],
	["Ghost", "<:ghosttype:1038083441524220024>"],
	["Grass", "<:grasstype:1038083443445203064>"],
	["Ground", "<:groundtype:1038083445085196388>"],
	["Ice", "<:icetype:1038083447102652446>"],
	["Normal", "<:normaltype:1038083448906199120>"],
	["Poison", "<:poisontype:1038083450927853618>"],
	["Psychic", "<:psychictype:1038083452601389119>"],
	["Rock", "<:rocktype:1038083454883074118>"],
	["Steel", "<:steeltype:1038083456707612762>"],
	["Water", "<:watertype:1038083426110160926>"],
]);

function escapeHTML(value: string): string {
	return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

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
	const url = new URL(encodeURIComponent(species), "https://embed.pkmn.dev/");
	if (query) url.searchParams.set("sprite", query);
	const shareURL = escapeHTML(url.href);
	const name = baseSpecies || species;
	const title = `#${num} ${name.charAt(0).toUpperCase()}${name.slice(1)}${forme ? ` (${forme})` : ""}`;
	const demographics = `♂️ ${gender.male} ♀️ ${gender.female}`;
	const accent = resolveColor(color);
	const icons = types.map(({ name }) => typeIcons.get(name)).filter(Boolean).join(" ");
	const heading = [
		`**${escapeMarkdown(title)}**`,
		...(classification ? [`-# The ${escapeMarkdown(classification)}`] : []),
	].join("\n");
	const typeLine = `${icons ? `${icons} · ` : ""}**Tier** ${escapeMarkdown(smogonTier)}`;
	const abilityNames = [ability1, ability2].filter(Boolean).join(" / ");
	const { shiny, facing } = getSpriteVariant(query);
	const spriteCaption = [shiny ? "Shiny" : "", facing === "back" ? "Back view" : ""].filter(Boolean).join(" · ");
	const baseStatTotal = hp + attack + defense + specialattack + specialdefense + speed;
	const details = [
		`**Abilities** ${escapeMarkdown(abilityNames)}${abilityHidden ? ` · ${escapeMarkdown(abilityHidden)} (Hidden)` : ""}`,
		`**Height** ${height} m · **Weight** ${weight} kg`,
		`**Gender** ${escapeMarkdown(demographics)} · **Catch rate** ${escapeMarkdown(percentageWithOrdinaryPokeballAtFullHealth)}`,
		"-# Standard Poké Ball at full HP",
		`**Base stats** · ${baseStatTotal} BST`,
		`${hp} HP · ${attack} Atk · ${defense} Def`,
		`${specialattack} SpA · ${specialdefense} SpD · ${speed} Spe`,
	].join("\n");
	const payload = getComponentEmbed(mon, accent, thumbnail, spriteCaption, heading, typeLine, details, flavor.trim());

	return `
	<html>
		<head>
			<link rel="icon" href="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg">
			<meta property="og:title" content="${escapeHTML(`${title} (${demographics} ◓ ${percentageWithOrdinaryPokeballAtFullHealth})`)}" />
			<meta property="og:image" content="${escapeHTML(thumbnail)}" />
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

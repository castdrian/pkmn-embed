import type { Pokemon } from "./types";

const maxPayloadBytes = 3000;
const flavorLineLength = 44;
const encoder = new TextEncoder();

export function escapeMarkdown(value: string): string {
	return value.replace(/[\\`*_{}\[\]()<>#+\-.!|~]/g, "\\$&");
}

function textDisplay(content: string) {
	return { type: 10, content };
}

function formatFlavor(value: string): string {
	const lines: string[] = [];
	let line = "";
	let length = 0;

	for (const word of value.split(/\s+/)) {
		const wordLength = Array.from(word).length;
		if (line && length + 1 + wordLength > flavorLineLength) {
			lines.push(line);
			line = "";
			length = 0;
		}
		line = line ? `${line} ${word}` : word;
		length += length ? 1 + wordLength : wordLength;
	}

	if (line) lines.push(line);
	return lines.map((text) => `*${escapeMarkdown(text)}*`).join("\n");
}

const serebiiSlugByDexNumber = new Map([
	[29, "nidoranf"],
	[32, "nidoranm"],
	[83, "farfetch'd"],
	[122, "mr.mime"],
	[250, "ho-oh"],
	[439, "mimejr."],
	[474, "porygon-z"],
	[772, "type:null"],
	[782, "jangmo-o"],
	[783, "hakamo-o"],
	[784, "kommo-o"],
	[865, "sirfetch'd"],
	[866, "mr.rime"],
	[1001, "wo-chien"],
	[1002, "chien-pao"],
	[1003, "ting-lu"],
	[1004, "chi-yu"],
]);

function referenceLinks(mon: Pokemon) {
	const species = (mon.baseSpecies || mon.species).trim().toLowerCase();
	const slug = species.replaceAll("é", "e").replaceAll("♀", "-f").replaceAll("♂", "-m")
		.replace(/[.'’]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !Number.isSafeInteger(mon.num) || mon.num < 1) return [];

	const serebiiSlug = serebiiSlugByDexNumber.get(mon.num) ?? slug.replaceAll("-", "");
	return [
		{ type: 2, style: 5, label: "Serebii", url: `https://www.serebii.net/pokemon/${serebiiSlug}` },
		{ type: 2, style: 5, label: "Pokémon Database", url: `https://pokemondb.net/pokedex/${slug}` },
	];
}

function isSpriteURL(value: string): boolean {
	if (!value || value.length > 2048) return false;
	try {
		const url = new URL(value);
		return url.protocol === "https:" || url.protocol === "http:";
	} catch {
		return false;
	}
}

export function getComponentEmbed(
	mon: Pokemon,
	color: string,
	sprite: string,
	heading: string,
	typeLine: string,
	details: string,
	flavor: string,
): string {
	const gallery = isSpriteURL(sprite) ? [{ type: 12, items: [{ media: { url: sprite } }] }] : [];
	const divider = { type: 14, spacing: 1 };
	const links = referenceLinks(mon);
	const actions = links.length ? [divider, { type: 1, components: links }] : [];
	const serialize = (excerpt: string) => JSON.stringify({
		component: {
			type: 17,
			accent_color: Number.parseInt(color.slice(1), 16),
			components: [
				textDisplay(heading),
				divider,
				textDisplay(typeLine),
				...gallery,
				...(excerpt ? [textDisplay(formatFlavor(excerpt))] : []),
				divider,
				textDisplay(details),
				...actions,
			],
		},
	}).replaceAll("<", "\\u003c");
	const fits = (payload: string) => encoder.encode(payload).length <= maxPayloadBytes;

	const full = serialize(flavor);
	if (fits(full)) return full;

	const withoutFlavor = serialize("");
	if (!fits(withoutFlavor)) return "";

	const characters = Array.from(flavor);
	let best = withoutFlavor;
	let low = 1;
	let high = Math.min(characters.length - 1, maxPayloadBytes);
	while (low <= high) {
		const length = Math.floor((low + high) / 2);
		const candidate = serialize(characters.slice(0, length).join("") + "…");
		if (fits(candidate)) {
			best = candidate;
			low = length + 1;
		} else {
			high = length - 1;
		}
	}
	return best;
}

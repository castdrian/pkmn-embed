import type { Pokemon } from "./types";

export type SpriteVariant = {
	facing: "front" | "back";
	shiny: boolean;
};

const highResolutionFrontSpriteRoots = [
	"https://www.pkparaiso.com/imagenes/espada_escudo/sprites/animados-gigante/",
	"https://www.pkparaiso.com/imagenes/ultra_sol_ultra_luna/sprites/animados-sinbordes-gigante/",
];

const highResolutionBackSpriteRoots = [
	"https://www.pkparaiso.com/imagenes/espada_escudo/sprites/animados-gigante/",
];

const highResolutionFrontIndexUrls = [
	"https://www.pkparaiso.com/espada_escudo/sprites_pokemon.php",
	"https://www.pkparaiso.com/ultra-sol-ultra-luna/sprites_pokemon_sin_bordes.php",
];

const highResolutionBackIndexUrls = [
	"https://www.pkparaiso.com/espada_escudo/sprites_pokemon_espalda.php",
];

const spriteAvailability = new Map<string, Promise<boolean>>();
const indexResponses = new Map<string, Promise<string | null>>();
const requestTimeoutMs = 2500;

export function getSpriteVariant(query?: string | null): SpriteVariant {
	switch (query) {
		case "shiny":
			return { facing: "front", shiny: true };
		case "back":
			return { facing: "back", shiny: false };
		case "shiny&back":
		case "back&shiny":
			return { facing: "back", shiny: true };
		default:
			return { facing: "front", shiny: false };
	}
}

export function getFallbackSprite(mon: Pokemon, query?: string | null): string {
	switch (query) {
		case "shiny":
			return mon.shinySprite;
		case "back":
			return mon.backSprite;
		case "shiny&back":
		case "back&shiny":
			return mon.shinyBackSprite;
		default:
			return mon.sprite;
	}
}

export async function resolveSprite(
	mon: Pokemon,
	query?: string | null,
	fetcher: typeof fetch = globalThis.fetch,
): Promise<string> {
	const variant = getSpriteVariant(query);
	const animatedSprite = await findHighResolutionAnimatedSprite(mon, variant, fetcher);
	return animatedSprite ?? getFallbackSprite(mon, query);
}

export function getHighResolutionSpriteCandidates(mon: Pokemon, variant: SpriteVariant): string[] {
	const speciesNames = getSpeciesNames(mon);
	const roots = variant.facing === "back" ? highResolutionBackSpriteRoots : highResolutionFrontSpriteRoots;
	const candidates = new Set<string>();

	for (const species of speciesNames) {
		for (const spriteName of getHighResolutionSpriteNames(species)) {
			for (const root of roots) {
				candidates.add(`${root}${getSpriteFileName(spriteName, variant)}`);
			}
		}
	}

	return [...candidates];
}

async function findHighResolutionAnimatedSprite(
	mon: Pokemon,
	variant: SpriteVariant,
	fetcher: typeof fetch,
): Promise<string | null> {
	const directSprite = await findAvailableSprite(getHighResolutionSpriteCandidates(mon, variant), fetcher);
	if (directSprite) return directSprite;

	const speciesNames = getSpeciesNames(mon);
	const indexUrls = variant.facing === "back" ? highResolutionBackIndexUrls : highResolutionFrontIndexUrls;

	for (const indexUrl of indexUrls) {
		const indexHtml = await getIndexResponse(indexUrl, fetcher);
		if (!indexHtml) continue;

		const indexedCandidates = getIndexedSpriteCandidates(indexHtml, speciesNames, variant);
		const indexedSprite = await findAvailableSprite(indexedCandidates, fetcher);
		if (indexedSprite) return indexedSprite;

		const pageUrls = getSpriteGroupPageUrls(indexHtml, indexUrl);
		const groupPages = await Promise.all(pageUrls.map((pageUrl) => getIndexResponse(pageUrl, fetcher)));
		const groupCandidates = groupPages.flatMap((page) =>
			page ? getIndexedSpriteCandidates(page, speciesNames, variant) : [],
		);
		const groupSprite = await findAvailableSprite(groupCandidates, fetcher);
		if (groupSprite) return groupSprite;
	}

	return null;
}

async function findAvailableSprite(
	candidates: string[],
	fetcher: typeof fetch,
): Promise<string | null> {
	const uniqueCandidates = [...new Set(candidates)];
	if (uniqueCandidates.length === 0) return null;

	const availability = await Promise.all(
		uniqueCandidates.map((candidate) => hasImage(candidate, fetcher)),
	);
	return uniqueCandidates.find((_, index) => availability[index]) ?? null;
}

async function hasImage(url: string, fetcher: typeof fetch): Promise<boolean> {
	const cacheKey = fetcher === globalThis.fetch ? url : null;
	if (cacheKey) {
		const cached = spriteAvailability.get(cacheKey);
		if (cached) return cached;
	}

	const request = checkImage(url, fetcher);
	if (cacheKey) spriteAvailability.set(cacheKey, request);
	return request;
}

async function checkImage(url: string, fetcher: typeof fetch): Promise<boolean> {
	try {
		const head = await fetcher(url, {
			method: "HEAD",
			signal: AbortSignal.timeout(requestTimeoutMs),
		});
		if (head.ok && isImageResponse(head)) return true;
		if (head.status === 404) return false;
	} catch {
		return false;
	}

	try {
		const response = await fetcher(url, {
			headers: { Range: "bytes=0-0" },
			signal: AbortSignal.timeout(requestTimeoutMs),
		});
		const result = response.ok && isImageResponse(response);
		await response.body?.cancel();
		return result;
	} catch {
		return false;
	}
}

function isImageResponse(response: Response): boolean {
	return response.headers.get("content-type")?.toLowerCase().startsWith("image/") ?? false;
}

async function getIndexResponse(url: string, fetcher: typeof fetch): Promise<string | null> {
	const cacheKey = fetcher === globalThis.fetch ? url : null;
	if (cacheKey) {
		const cached = indexResponses.get(cacheKey);
		if (cached) return cached;
	}

	const request = fetchIndex(url, fetcher);
	if (cacheKey) indexResponses.set(cacheKey, request);
	return request;
}

async function fetchIndex(url: string, fetcher: typeof fetch): Promise<string | null> {
	try {
		const response = await fetcher(url, {
			signal: AbortSignal.timeout(requestTimeoutMs),
		});
		if (!response.ok) return null;
		return await response.text();
	} catch {
		return null;
	}
}

function getIndexedSpriteCandidates(
	html: string,
	speciesNames: string[],
	variant: SpriteVariant,
): string[] {
	const requestedNames = new Set(
		speciesNames.flatMap((species) => [species, species.replaceAll("-", " ")]).map(normalizeMatchName),
	);
	const imagePathPattern = /(?:(?:https?:)?\/\/www\.pkparaiso\.com)?\/?imagenes\/[^"'<>\s]*\/sprites\/(?:animados-gigante|animados-sinbordes-gigante)\/[^"'<>\s]+?\.gif/gi;
	const candidates: string[] = [];

	for (const match of html.matchAll(imagePathPattern)) {
		const path = match[0].split("?")[0] ?? "";
		const fileName = path.slice(path.lastIndexOf("/") + 1);
		const fileStem = fileName.slice(0, -4);
		const shiny = fileStem.toLowerCase().endsWith("-s");
		if (shiny !== variant.shiny) continue;

		const nonShinyStem = shiny ? fileStem.slice(0, -2) : fileStem;
		const back = nonShinyStem.toLowerCase().endsWith("-back");
		if (back !== (variant.facing === "back")) continue;

		const speciesStem = back ? nonShinyStem.slice(0, -5) : nonShinyStem;
		if (!requestedNames.has(normalizeMatchName(speciesStem))) continue;

		candidates.push(toAbsoluteSpriteUrl(path));
	}

	return [...new Set(candidates)];
}

function getSpriteGroupPageUrls(html: string, indexUrl: string): string[] {
	const groupLinkPattern = /href=["'][^"']*sprites_pokemon(?:_variocolores)?(?:_espalda|_sin_bordes)?\.php\?cid=(\d+)[^"']*["']/gi;
	const urls = new Set<string>();

	for (const match of html.matchAll(groupLinkPattern)) {
		const cid = match[1];
		if (!cid) continue;
		try {
			const pageUrl = new URL(indexUrl);
			pageUrl.search = `?cid=${cid}&order=`;
			pageUrl.hash = "sprites";
			urls.add(pageUrl.toString());
		} catch {
			continue;
		}
	}

	return [...urls];
}

function getSpeciesNames(mon: Pokemon): string[] {
	const names = new Set<string>();
	for (const species of [mon.species, mon.baseSpecies ?? ""]) {
		const trimmed = species.trim();
		if (!trimmed) continue;
		names.add(trimmed);
		const baseSpecies = trimmed.split("-", 1)[0]?.trim();
		if (baseSpecies) names.add(baseSpecies);
	}
	return [...names];
}

function getHighResolutionSpriteNames(species: string): string[] {
	return [...new Set([animationId(species), normalizeSpriteName(species), dexId(species)])];
}

function getSpriteFileName(spriteName: string, variant: SpriteVariant): string {
	return `${spriteName}${variant.facing === "back" ? "-back" : ""}${variant.shiny ? "-s" : ""}.gif`;
}

function normalizeSpriteName(species: string): string {
	return species
		.trim()
		.toLowerCase()
		.replace("é", "e")
		.replace("♀", "-f")
		.replace("♂", "-m")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function animationId(value: string): string {
	return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function dexId(value: string): string {
	const original = value.trim().toLowerCase();
	const normalized = original
		.replace("é", "e")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	if (original.includes("♀") || normalized === "nidoran-f") return "nidoran-f";
	if (original.includes("♂") || normalized === "nidoran-m") return "nidoran-m";
	return normalized;
}

function normalizeMatchName(value: string): string {
	return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function toAbsoluteSpriteUrl(path: string): string {
	if (path.startsWith("https://")) return path;
	if (path.startsWith("http://")) return path.replace(/^http:/i, "https:");
	if (path.startsWith("//")) return `https:${path}`;
	return new URL(path, "https://www.pkparaiso.com").toString();
}

import { expect, test } from "bun:test";
import { getEmbedHTML } from "./response";
import { getHighResolutionSpriteCandidates, resolveSprite } from "./sprites";
import type { Pokemon } from "./types";

const pikachu: Pokemon = {
	num: 25,
	species: "pikachu",
	baseSpecies: null,
	classification: "Mouse Pokémon",
	gender: { female: "12.5%", male: "87.5%" },
	catchRate: { percentageWithOrdinaryPokeballAtFullHealth: "35.2%" },
	forme: null,
	sprite: "https://example.com/pikachu.png",
	shinySprite: "https://example.com/pikachu-shiny.png",
	backSprite: "https://example.com/pikachu-back.png",
	shinyBackSprite: "https://example.com/pikachu-shiny-back.png",
	baseStats: { attack: 55, defense: 40, hp: 35, specialattack: 50, specialdefense: 50, speed: 90 },
	types: [{ name: "Electric" }],
	flavorTexts: [{ flavor: "A test description." }],
	height: 4,
	weight: 60,
	abilities: { first: { name: "Static" }, second: null, hidden: { name: "Lightning Rod" } },
	color: "Yellow",
	smogonTier: "PU",
};

test("keeps the donation link out of the Open Graph description", () => {
	const html = getEmbedHTML(pikachu, null, pikachu.sprite);
	const openGraphDescription = html.match(/<meta property="og:description"[^>]+>/)?.[0] ?? "";

	expect(openGraphDescription).not.toContain("ko-fi");
	expect(html).toContain("https://ko-fi.com/castdrian");
	expect(html).toContain("A test description.");
});

test("selects the requested sprite variant", () => {
	const html = getEmbedHTML(pikachu, "shiny", pikachu.shinySprite);

	expect(html).toContain(pikachu.shinySprite);
});

test("prefers an available HD animated sprite", async () => {
	const hdSprite = getHighResolutionSpriteCandidates(pikachu, { facing: "front", shiny: false })[0];
	const fetcher: typeof fetch = async (input, init) => {
		if (String(input) === hdSprite && init?.method === "HEAD") {
			return new Response(null, { headers: { "content-type": "image/gif" }, status: 200 });
		}
		return new Response(null, { status: 404 });
	};

	expect(await resolveSprite(pikachu, null, fetcher)).toBe(hdSprite);
});

test("falls back to the API sprite when no HD animated sprite is available", async () => {
	const fetcher: typeof fetch = async () => new Response(null, { status: 404 });

	expect(await resolveSprite(pikachu, "back", fetcher)).toBe(pikachu.backSprite);
});

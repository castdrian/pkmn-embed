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
	const html = getEmbedHTML(pikachu);
	const openGraphDescription = html.match(/<meta property="og:description"[^>]+>/)?.[0] ?? "";

	expect(openGraphDescription).not.toContain("ko-fi");
	expect(html).toContain("https://ko-fi.com/castdrian");
	expect(html).toContain("A test description.");
});

test("shows front and back sprites together in standard and shiny previews", () => {
	const variants = [
		[false, pikachu.sprite, pikachu.backSprite],
		[true, pikachu.shinySprite, pikachu.shinyBackSprite],
	] as const;

	for (const [shiny, front, back] of variants) {
		const html = getEmbedHTML(pikachu, shiny);
		const { component } = JSON.parse(componentJSON(html)!);

		expect(component.components[3].items).toEqual([
			{ media: { url: front }, description: "Front" },
			{ media: { url: back }, description: "Back" },
		]);
		expect(html).toContain(`<meta property="og:image" content="${front}"`);
	}
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

function componentJSON(html: string): string | undefined {
	return html.match(/<script id="discord:component-embed" type="application\/json">([\s\S]*?)<\/script>/)?.[1];
}

test("renders a single accented container with sprite, byline, flavor, stats and reference buttons", () => {
	const html = getEmbedHTML(pikachu, true);
	const { component } = JSON.parse(componentJSON(html)!);

	expect(component).toMatchObject({ type: 17, accent_color: 0xfff359 });
	expect(component.components.map(({ type }: { type: number }) => type)).toEqual([10, 14, 10, 12, 10, 14, 10, 14, 1]);
	expect(component.components[3].items).toHaveLength(2);
	expect(component.components[0].content).toBe("**\\#25 Pikachu**\n-# The Mouse Pokémon");
	expect(component.components[6].content).toContain("**Catch rate**");
	expect(component.components[6].content).toContain("**Base stats**\n35 HP · 55 Atk · 40 Def\n50 SpA · 50 SpD · 90 Spe");
	expect(component.components[4].content).toBe("*A test description\\.*");
	expect(component.components[8].components).toEqual([
		{ type: 2, style: 5, label: "Serebii", url: "https://www.serebii.net/pokemon/pikachu" },
		{ type: 2, style: 5, label: "Pokémon Database", url: "https://pokemondb.net/pokedex/pikachu" },
	]);
	expect(html).toContain('name="theme-color"');
	expect(html).toContain("?sprite=shiny");
});

test("links alternate forms to the base species and omits an invalid sprite", () => {
	const html = getEmbedHTML({ ...pikachu, num: 122, species: "mr-mime-galar", baseSpecies: "Mr. Mime", forme: "Galar" }, false, "", "");
	const { component } = JSON.parse(componentJSON(html)!);

	expect(component.components[0]).toMatchObject({ type: 10, content: expect.stringContaining("Galar") });
	expect(component.components.at(-1).components.map(({ url }: { url: string }) => url)).toEqual([
		"https://www.serebii.net/pokemon/mr.mime",
		"https://pokemondb.net/pokedex/mr-mime",
	]);
});

test("escapes upstream text and shortens multibyte flavor within the byte limit", () => {
	const html = getEmbedHTML({
		...pikachu,
		flavorTexts: [{ flavor: '</script> "**' + "✨".repeat(3000) }],
	});
	const payload = componentJSON(html)!;
	const flavor = JSON.parse(payload).component.components[4].content;

	expect(new TextEncoder().encode(payload).length).toBeLessThanOrEqual(3000);
	expect(payload).toContain("\\u003c");
	expect(payload).not.toContain("</script>");
	expect(flavor).toContain("\\*\\*");
	expect(flavor.endsWith("…*")).toBe(true);
	expect(html).toContain("&lt;/script&gt; &quot;");
});

test("keeps Open Graph when the component payload cannot fit without flavor", () => {
	const html = getEmbedHTML({ ...pikachu, classification: "✨".repeat(1100) });

	expect(componentJSON(html)).toBeUndefined();
	expect(html).toContain('property="og:description"');
	expect(html).toContain(pikachu.sprite);
});

test("renders custom type icons without type names in the Discord card", () => {
	const html = getEmbedHTML({ ...pikachu, types: [{ name: "Water" }, { name: "Dark" }] });
	const { component } = JSON.parse(componentJSON(html)!);
	const typeLine = component.components[2].content;

	expect(typeLine).toBe("<:watertype:1038083426110160926> <:darktype:1038083430166044773> · **Tier** PU");
	expect(html).toContain("Type: Water💧 Dark🌙");
});

test("wraps flavor text at word boundaries and italicizes each line", () => {
	const html = getEmbedHTML({
		...pikachu,
		flavorTexts: [{ flavor: "It stores electricity in its cheeks and releases it when threatened." }],
	});
	const { component } = JSON.parse(componentJSON(html)!);

	expect(component.components[4].content).toBe(
		"*It stores electricity in its cheeks and*\n*releases it when threatened\\.*",
	);
});

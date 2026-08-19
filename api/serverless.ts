import { fetchMon } from "../src/app/fetch";
import { getIndexHTML } from "../src/app/index";
import { getEmbedHTML } from "../src/app/response";
import { resolveSprite } from "../src/app/sprites";

const htmlHeaders = {
	"Content-Type": "text/html; charset=utf-8",
};

function htmlResponse(html: string, status = 200): Response {
	return new Response(html, { headers: htmlHeaders, status });
}

export default {
	async fetch(request: Request): Promise<Response> {
		if (request.method !== "GET") {
			return new Response("Method Not Allowed", {
				headers: { Allow: "GET" },
				status: 405,
			});
		}

		const url = new URL(request.url);
		const pathSegments = url.pathname.split("/").filter(Boolean);

		if (pathSegments.length === 0) {
			return htmlResponse(getIndexHTML());
		}

		const id = decodeURIComponent(pathSegments[0] ?? "");
		const mon = await fetchMon(id);
		const query = url.searchParams.get("sprite");
		const html = getEmbedHTML(mon, query, await resolveSprite(mon, query));

		return htmlResponse(html);
	},
};

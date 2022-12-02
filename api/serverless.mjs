// Require the framework
import Fastify from "fastify";
import disableCache from "fastify-disablecache";

// Instantiate Fastify with some config
const app = Fastify({
  logger: true,
});

// Register your application as a normal plugin.
app.register(import("../src/app/index.mjs"));
app.register(disableCache);

export default async (req, res) => {
    await app.ready();
    app.server.emit('request', req, res);
}
/*
 * CozyMix offline worker.
 *
 * - Recordings (audio/) never change: served from the cache first.
 * - Everything else goes to the network first and falls back to the cache, so
 *   an online visit always gets the latest version and nothing goes stale.
 * - Older CozyMix caches are deleted on activation, and pages they served are
 *   reloaded once. Caches of other sites on the same origin (for example other
 *   projects on the same github.io domain) are left alone.
 * - Works at the root of a domain or under a sub-path such as /cozymix/.
 */
const PREFIX = "cozymix";
const CACHE = `${PREFIX}-v2`;
const BASE = new URL(self.registration.scope).pathname.replace(/\/$/, "");
const AUDIO = [
  "/audio/rain-window.mp3",
  "/audio/wind-pine-forest.mp3",
  "/audio/stream.mp3",
  "/audio/waves-shore.mp3",
  "/audio/thunder.mp3",
  "/audio/fireplace.mp3",
  "/audio/coffee-shop.mp3",
  "/audio/train.mp3",
  "/audio/nebulizer.wav",
];
const SHELL = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];
const at = (path) => BASE + path;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll([...SHELL, ...AUDIO].map(at));
      // Keep the scripts and styles the page needs, as listed in its HTML.
      const html = await (await cache.match(at("/"))).text();
      const assets = [...html.matchAll(/(?:src|href)="([^"]*\/_next\/static\/[^"]+)"/g)].map(
        (match) => match[1],
      );
      await cache.addAll([...new Set(assets)]);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const stale = (await caches.keys()).filter((key) => key.startsWith(PREFIX) && key !== CACHE);
      await Promise.all(stale.map((key) => caches.delete(key)));
      await self.clients.claim();
      if (stale.length) {
        // An older worker was serving cached pages: reload them once.
        const windows = await self.clients.matchAll({ type: "window" });
        await Promise.all(windows.map((client) => client.navigate(client.url).catch(() => {})));
      }
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "cache" || !Array.isArray(event.data.urls)) return;
  const urls = event.data.urls.filter(
    (url) => typeof url === "string" && new URL(url).origin === self.location.origin,
  );
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(urls))
      .catch(() => {}),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (url.pathname.startsWith(at("/audio/"))) {
    event.respondWith(
      caches
        .match(url.pathname)
        .then((hit) => hit ?? fetch(request).then((response) => keep(url.pathname, response))),
    );
    return;
  }

  const key = request.mode === "navigate" ? at("/") : request;
  event.respondWith(
    fetch(request)
      .then((response) => keep(key, response))
      .catch(async () => (await caches.match(key)) ?? Response.error()),
  );
});

async function keep(key, response) {
  if (response.ok && response.type === "basic") {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(key, copy));
  }
  return response;
}

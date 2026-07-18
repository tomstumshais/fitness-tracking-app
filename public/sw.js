const CACHE_PREFIX = "fitness-log-shell";
const CACHE_NAME = `${CACHE_PREFIX}-v1`;

function appUrl(path = "./") {
  return new URL(path, self.registration.scope);
}

async function cacheResponse(cache, url, response) {
  if (response.ok) await cache.put(url, response);
}

async function precacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  const rootUrl = appUrl();
  const indexResponse = await fetch(rootUrl, { cache: "reload" });
  if (!indexResponse.ok) throw new Error("Could not cache the app shell");

  await cache.put(rootUrl, indexResponse.clone());
  await cache.put(appUrl("index.html"), indexResponse.clone());
  const html = await indexResponse.text();
  const assetUrls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => new URL(match[1], rootUrl))
    .filter((url) =>
      url.origin === rootUrl.origin &&
      url.pathname.startsWith(rootUrl.pathname)
    );
  const fixedUrls = [
    appUrl("manifest.webmanifest"),
    appUrl("favicon.svg"),
    appUrl("icons/app-icon-180.png"),
    appUrl("icons/app-icon-192.png"),
    appUrl("icons/app-icon-512.png"),
    appUrl("icons/app-icon-maskable-512.png"),
  ];

  const requiredUrls = [
    ...new Set(
      [...assetUrls, ...fixedUrls].map((url) => url.href),
    ),
  ];
  await Promise.all(requiredUrls.map(async (url) => {
    const response = await fetch(url, { cache: "reload" });
    if (!response.ok) throw new Error(`Could not cache ${url}`);
    await cache.put(url, response);
  }));
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheAppShell().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
        .map((name) => caches.delete(name)),
    );
    await self.clients.claim();
  })());
});

async function respondToNavigation(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    await cacheResponse(cache, appUrl(), response.clone());
    await cacheResponse(cache, appUrl("index.html"), response.clone());
    return response;
  } catch {
    return (await cache.match(appUrl())) ||
      (await cache.match(appUrl("index.html"))) || Response.error();
  }
}

async function respondToAsset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  await cacheResponse(cache, request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  event.respondWith(
    request.mode === "navigate"
      ? respondToNavigation(request)
      : respondToAsset(request),
  );
});

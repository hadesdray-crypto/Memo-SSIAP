/* Service worker du Mémo SSIAP : met l'appli en cache pour l'utiliser sans connexion. */
const CACHE = "memo-ssiap-1.4.0-1e46bad2b4";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./maskable-512.png", "./apple-touch-icon.png", "./favicon-32.png"];
self.addEventListener("install", (e) => {
  // cache: "reload" : toujours la version en ligne, jamais une copie du navigateur (sinon une mise à jour pourrait garder l'ancienne page).
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((u) => new Request(u, { cache: "reload" })))));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("memo-ssiap-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("message", (e) => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith("/veille.json")) return; // veille réglementaire : toujours le réseau, jamais le cache
  if (req.mode === "navigate") {
    e.respondWith(caches.match("./index.html").then((r) => r || fetch(req)));
    return;
  }
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((r) => r || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});

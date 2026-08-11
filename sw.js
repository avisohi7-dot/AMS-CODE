// Study Ledger service worker — app-shell caching for offline use.
// Everything (CSS, JS, icons) is inlined into index.html, so caching the
// document itself is enough to make the whole app work offline.
//
// Bump CACHE_NAME whenever this file or the caching strategy changes, so old
// caches get cleaned up on activate.
const CACHE_NAME = "study-ledger-shell-v1";
const APP_SHELL = ["./", "./index.html"];

self.addEventListener("install", function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(APP_SHELL); }).catch(function () {})
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

// Network-first: always try to serve the latest version when online (this
// app is actively updated), falling back to the cached shell when offline.
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
        return response;
      })
      .catch(function () {
        return caches.match(event.request).then(function (cached) { return cached || caches.match("./"); });
      })
  );
});

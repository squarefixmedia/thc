/* Trinity booking app: caches the app shell so it opens instantly, even on weak signal. */
var CACHE = "thc-book-v3";
var SHELL = ["./", "app.css", "app.js", "../assets/data.js", "../assets/fonts.css",
  "../assets/fonts/newsreader-latin-400-normal.woff2", "../assets/fonts/newsreader-latin-500-normal.woff2", "../assets/fonts/hanken-grotesk-latin-400-normal.woff2",
  "../assets/fonts/hanken-grotesk-latin-600-normal.woff2", "../img/logo-96.png", "../img/symbol.svg"];
self.addEventListener("install", function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener("activate", function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener("fetch", function (e) {
  var r = e.request;
  if (r.method !== "GET" || r.url.indexOf("/api/") > -1) return; // never cache bookings
  // network first for pages and data (so edits show up), cache fallback offline
  e.respondWith(fetch(r).then(function (res) {
    if (res.ok && new URL(r.url).origin === location.origin) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, cp); }); }
    return res;
  }).catch(function () { return caches.match(r, { ignoreSearch: true }); }));
});

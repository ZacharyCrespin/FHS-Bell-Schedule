const urlsToCache = ["index.html", "style.css", "favicon.ico"];
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("pwa-assets")
      .then(cache => {
        return cache.addAll(urlsToCache);
      }));
});
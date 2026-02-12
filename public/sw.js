self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

// NO interceptamos fetch

// const CACHE_NAME = "pd3-cache-v1";
// const CORE_ASSETS = [
//   "/",
//   "/index.html",
// ];

// self.addEventListener("install", event => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then(cache =>
//       cache.addAll(CORE_ASSETS)
//     )
//   );
//   self.skipWaiting();
// });

// self.addEventListener("activate", event => {
//   event.waitUntil(
//     caches.keys().then(keys =>
//       Promise.all(
//         keys
//           .filter(k => k !== CACHE_NAME)
//           .map(k => caches.delete(k))
//       )
//     )
//   );
//   self.clients.claim();
// });

// self.addEventListener("fetch", event => {
//   // 🔒 IMPORTANTE: no tocar requests que no sean GET
//   if (event.request.method !== "GET") {
//     return;
//   }

//   event.respondWith(
//     caches.match(event.request).then(cached => {
//       if (cached) {
//         return cached;
//       }

//       return fetch(event.request)
//         .then(response => {
//           // Evitar cachear respuestas inválidas o cross-origin raras
//           if (
//             !response ||
//             response.status !== 200 ||
//             response.type !== "basic"
//           ) {
//             return response;
//           }

//           const copy = response.clone();
//           caches.open(CACHE_NAME).then(cache =>
//             cache.put(event.request, copy)
//           );

//           return response;
//         })
//         .catch(() => caches.match(event.request));
//     })
//   );
// });

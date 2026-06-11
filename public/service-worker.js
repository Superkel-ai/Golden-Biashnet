/* eslint-env serviceworker */

// ==============================
// GOLDEN BIASHNET SERVICE WORKER
// PRODUCTION GRADE PWA (v4)
// ==============================

// 🔥 VERSION (change on updates)
const CACHE_VERSION = "v4";

// Cache names
const STATIC_CACHE = `biashnet-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `biashnet-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `biashnet-images-${CACHE_VERSION}`;

// Offline fallback
const OFFLINE_PAGE = "/index.html";

// Limits
const MAX_DYNAMIC_ITEMS = 80;
const MAX_IMAGE_ITEMS = 120;


// ==============================
// STATIC ASSETS
// ==============================

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/biash512.jpeg",
  "/biash192.png"
];


// ==============================
// INSTALL
// ==============================

self.addEventListener("install", (event) => {

  console.log("SW: Installing...");

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log("SW: Pre-caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
  );

  self.skipWaiting(); // 🔥 activate immediately

});


// ==============================
// ACTIVATE
// ==============================

self.addEventListener("activate", (event) => {

  console.log("SW: Activating...");

  event.waitUntil(

    caches.keys().then((keys) => {

      return Promise.all(

        keys.map((key) => {

          if (
            key !== STATIC_CACHE &&
            key !== DYNAMIC_CACHE &&
            key !== IMAGE_CACHE
          ) {
            console.log("SW: Deleting old cache:", key);
            return caches.delete(key);
          }

        })

      );

    })

  );

  self.clients.claim(); // 🔥 take control immediately

});


// ==============================
// CACHE LIMIT FUNCTION
// ==============================

const limitCacheSize = async (cacheName, maxItems) => {

  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxItems) {

    await cache.delete(keys[0]);
    limitCacheSize(cacheName, maxItems);

  }

};


// ==============================
// FETCH STRATEGIES
// ==============================

self.addEventListener("fetch", (event) => {

  const request = event.request;

  if (request.method !== "GET") return;


  // ==========================
  // 🔥 FIRESTORE / API (NETWORK FIRST)
  // ==========================

  if (request.url.includes("firestore.googleapis.com")) {

    event.respondWith(

      fetch(request)
        .then((res) => {
          return res;
        })
        .catch(() => caches.match(request))

    );

    return;

  }


  // ==========================
  // 🔥 IMAGES (CACHE FIRST + OPTIMIZED)
  // ==========================

  if (request.destination === "image") {

    event.respondWith(

      caches.match(request).then((cached) => {

        return cached || fetch(request).then((res) => {

          return caches.open(IMAGE_CACHE).then((cache) => {

            cache.put(request, res.clone());
            limitCacheSize(IMAGE_CACHE, MAX_IMAGE_ITEMS);

            return res;

          });

        });

      })

    );

    return;

  }


  // ==========================
  // 🔥 STATIC FILES (STALE-WHILE-REVALIDATE)
  // ==========================

  if (
    request.destination === "style" ||
    request.destination === "script"
  ) {

    event.respondWith(

      caches.match(request).then((cached) => {

        const fetchPromise = fetch(request).then((networkRes) => {

          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, networkRes.clone());
            limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);
          });

          return networkRes;

        });

        return cached || fetchPromise;

      })

    );

    return;

  }


  // ==========================
  // 🔥 PAGE NAVIGATION (NETWORK FIRST)
  // ==========================

  if (request.mode === "navigate") {

    event.respondWith(

      fetch(request)
        .then((res) => {

          return caches.open(DYNAMIC_CACHE).then((cache) => {

            cache.put(request, res.clone());
            limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);

            return res;

          });

        })
        .catch(() => {

          return caches.match(request)
            .then((res) => res || caches.match(OFFLINE_PAGE));

        })

    );

    return;

  }

});


// ==============================
// 🔥 SKIP WAITING MESSAGE
// ==============================

self.addEventListener("message", (event) => {

  if (event.data && event.data.type === "SKIP_WAITING") {

    console.log("SW: Skip waiting received");

    self.skipWaiting();

  }

});
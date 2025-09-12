// Змінюй версію при оновленнях
const CACHE_NAME = "tasks-pwa-v5";

const urlsToCache = [
    "./",
    "./index.html",
    "./script.js",
    "./styles.css",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];

// Встановлення Service Worker (перший кеш)
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

// Активування (видаляємо старі кеші)
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        console.log("[SW] Видаляю старий кеш:", name);
                        return caches.delete(name);
                    }
                })
            );
        })
    );
});

// Fetch з Network First
self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // якщо відповідь ок — кешуємо її
                if (response && response.status === 200) {
                    const cloned = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, cloned);
                    });
                }
                return response;
            })
            .catch(() => {
                // якщо мережа недоступна → беремо з кешу
                return caches.match(event.request);
            })
    );
});

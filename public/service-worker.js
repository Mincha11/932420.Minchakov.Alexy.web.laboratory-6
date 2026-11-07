const CACHE_NAME = "calculator-pwa-v1";

const APP_FILES = [
    "/",
    "/about",
    "/index.html",
    "/about.html",
    "/style.css",
    "/app.js",
    "/manifest.json",
    "/icons/icon.svg"
];

// Установка Service Worker и кеширование файлов.
self.addEventListener("install", (event) => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_FILES))
            .then(() => self.skipWaiting())

    );

});

// Активация и удаление старого кеша.
self.addEventListener("activate", (event) => {

    event.waitUntil(

        caches.keys()
            .then((keys) => Promise.all(

                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))

            ))
            .then(() => self.clients.claim())

    );

});

// Обработка запросов.
self.addEventListener("fetch", (event) => {

    const url = new URL(event.request.url);

    // API не кешируем: вычисления выполняются на сервере.
    if (
        event.request.method !== "GET" ||
        url.pathname.startsWith("/api/")
    ) {
        return;
    }

    event.respondWith(

        caches.match(event.request)

            .then((cachedResponse) => {

                // Если файл есть в кеше — возвращаем его.
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Иначе пытаемся загрузить файл из сети.
                return fetch(event.request)

                    .then((networkResponse) => {

                        if (networkResponse && networkResponse.ok) {

                            const responseCopy = networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseCopy);
                                });

                        }

                        return networkResponse;

                    });

            })

            .catch(() => {

                // Если сеть недоступна, возвращаем главную страницу из кеша.
                if (event.request.mode === "navigate") {
                    return caches.match("/");
                }

                return new Response(
                    "Ресурс недоступен без подключения к интернету.",
                    {
                        status: 503,
                        headers: {
                            "Content-Type": "text/plain; charset=utf-8"
                        }
                    }
                );

            })

    );

});
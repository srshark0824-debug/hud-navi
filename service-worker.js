// ================================
// HUDナビ Service Worker
// Step4: オフライン対応（安定版）
// ================================

const CACHE_NAME = "hud-navi-v2";

// キャッシュ対象（※実在するファイルのみ）
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./offline.html",     // ★オフライン用必須
  "./manifest.json",
  "./arrow.png",
  "./icon-192.png",
  "./icon-512.png"
];

// ================================
// install: キャッシュ登録
// ================================
self.addEventListener("install", event => {
  console.log("[SW] Install");

  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // 1ファイル失敗しても install を落とさない
      for (const file of FILES_TO_CACHE) {
        try {
          await cache.add(file);
        } catch (err) {
          console.warn("[SW] Cache skipped:", file, err);
        }
      }
    })
  );

  // すぐに有効化
  self.skipWaiting();
});

// ================================
// activate: 古いキャッシュ削除
// ================================
self.addEventListener("activate", event => {
  console.log("[SW] Activate");

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log("[SW] Delete old cache:", key);
            return caches.delete(key);
          })
      );
    })
  );

  self.clients.claim();
});

// ================================
// fetch: キャッシュ優先 + オフライン対応
// ================================
self.addEventListener("fetch", event => {
  // GET 以外は触らない（POST 等）
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {

      // キャッシュがあれば即返す
      if (cachedResponse) {
        return cachedResponse;
      }

      // ネットワーク取得を試みる
      return fetch(event.request)
        .then(networkResponse => {
          // 成功したらキャッシュに追加（HTML / 画像）
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // ★ オフライン時のフォールバック
          if (event.request.mode === "navigate") {
            return caches.match("./offline.html");
          }
        });
    })
  );
});

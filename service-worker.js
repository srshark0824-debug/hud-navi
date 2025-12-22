const CACHE_NAME = "hud-navi-v2";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./offline.html", 
  "./manifest.json",
  "./arrow.png",
  "./icon-192.png",
  "./icon-512.png"
];

// インストール時にキャッシュ
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// リクエスト時はキャッシュ優先
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        return response;
      })
      .catch(() => {
        // 通信失敗時
        return caches.match(event.request)
          .then(res => {
            // キャッシュがあればそれを返す
            return res || caches.match("./offline.html");
          });
      })
  );
});







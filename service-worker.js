const CACHE_NAME = "hud-navi-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
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
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// ================================
// リセット処理
// ================================
document.getElementById("resetBtn").addEventListener("click", () => {
  const ok = confirm("保存された目的地とナビ状態を全て削除しますか？");
  if (!ok) return;

  localStorage.removeItem("hud_waypoints");
  waypoints = [];
  currentIndex = 0;
  arrived = false;

  document.getElementById("listView").style.display = "none";
  document.getElementById("info").innerText = "リセットしました。";
  document.getElementById("arrow").style.display = "block";
  document.getElementById("startBtn").style.display = "inline";
});


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

// ================================
// 目的地一覧を描画
// ================================
function renderWaypointList() {
  const list = document.getElementById("listView");
  list.innerHTML = "<h3>目的地一覧</h3>";

  waypoints.forEach((wp, index) => {
    const item = document.createElement("div");
    item.style.margin = "10px";
    item.style.border = "1px solid lime";
    item.style.padding = "5px";

    item.innerHTML = `
      <div>${index + 1}. ${wp.name}</div>
      <button onclick="moveUp(${index})">↑</button>
      <button onclick="moveDown(${index})">↓</button>
      <button onclick="removeWaypoint(${index})">削除</button>
    `;
    list.appendChild(item);
  });

  if (waypoints.length === 0) {
    list.innerHTML += "<p>目的地がありません。</p>";
  }
}

//並び替え処理
function moveUp(index) {
  if (index === 0) return;
  [waypoints[index - 1], waypoints[index]] =
    [waypoints[index], waypoints[index - 1]];
  saveWaypoints();
  renderWaypointList();
}

function moveDown(index) {
  if (index === waypoints.length - 1) return;
  [waypoints[index + 1], waypoints[index]] =
    [waypoints[index], waypoints[index + 1]];
  saveWaypoints();
  renderWaypointList();
}

//削除処理
function removeWaypoint(index) {
  const ok = confirm(`「${waypoints[index].name}」を削除しますか？`);
  if (!ok) return;

  waypoints.splice(index, 1);

  if (currentIndex >= waypoints.length) {
    currentIndex = waypoints.length - 1;
  }
  if (currentIndex < 0) currentIndex = 0;

  saveWaypoints();
  renderWaypointList();
}

//一覧ボタンの動作
document.getElementById("listBtn").addEventListener("click", () => {
  const list = document.getElementById("listView");
  const visible = list.style.display === "block";

  list.style.display = visible ? "none" : "block";

  if (!visible) {
    renderWaypointList();
  }
});






let currentSnapshot = null;
let selectedStation = null;
let latestShareText = "全国アメダスの最新気温から、今日のひと涼み目安を確認。のどが渇く前に水分を。 #最強熊谷伝説 #水分補給";

function setObservationTime(latestTime) {
  const text = `観測時刻：${formatObservationTime(latestTime)}`;
  document.getElementById("observation-time").textContent = text;
  document.getElementById("ranking-time").textContent = text;
}

function renderSnapshot(snapshot, target) {
  const ranking = buildTemperatureRanking(snapshot.readings, snapshot.stations);
  const capitalRanking = buildCapitalTemperatureList(snapshot.readings, snapshot.stations);
  const kumagaya = ranking.find(item => item.id === CONFIG.kumagayaStationId);
  const siteHeatClass = getTempClass(ranking[0]?.temperature ?? kumagaya?.temperature ?? 0);
  document.body.classList.remove(
    "temp-extreme", "temp-purple", "temp-red", "temp-orange",
    "temp-yellow", "temp-green", "temp-blue", "temp-cold"
  );
  document.body.classList.add("site-heat", siteHeatClass);
  if (!kumagaya) throw new Error("熊谷の気温を確認できませんでした。");

  const selectedFromCurrentData = target && ranking.find(item => item.id === target.id);
  const defaultCapital = capitalRanking
    .filter(item => item.temperature !== null && item.id !== kumagaya.id)
    .sort((a, b) => b.temperature - a.temperature)[0];
  selectedStation = selectedFromCurrentData || defaultCapital || kumagaya;

  const capitalInfo = getCapitalByStationId(selectedStation.id);
  if (capitalInfo) selectedStation = { ...selectedStation, ...capitalInfo };

  setObservationTime(snapshot.latestTime);
  renderComparison(kumagaya, selectedStation, ranking);
  updateShareLinks();

  const featuredNationwideRanking = ranking.filter((item, index) =>
    index < 10 || item.temperature >= kumagaya.temperature
  );

  renderHeatRanking(featuredNationwideRanking, kumagaya.temperature);
  renderCapitalTemperatureList(capitalRanking);
  renderAllTemperatureStations(ranking, kumagaya);
}

function getXShareUrl() {
  const pageUrl = location.href.split("#")[0].split("?")[0];
  return "https://x.com/intent/post?text=" + encodeURIComponent(latestShareText) + "&url=" + encodeURIComponent(pageUrl);
}

function updateShareLinks() {
  const button = document.getElementById("share-button");
  if (button) button.dataset.shareUrl = getXShareUrl();
}

function shareTemperatureResult() {
  const button = document.getElementById("share-button");
  const status = document.getElementById("share-status");
  const shareUrl = button?.dataset.shareUrl || getXShareUrl();
  status.textContent = "Xの投稿画面を開いています…";
  location.assign(shareUrl);
}

async function reloadHeatData() {
  const button = document.getElementById("refresh-button");
  button.disabled = true;
  button.textContent = "確認中…";

  try {
    currentSnapshot = await fetchAmedasSnapshot();
    renderSnapshot(currentSnapshot, selectedStation);
  } catch (error) {
    console.error(error);
    showError("観測値を取得できませんでした。");
  } finally {
    button.disabled = false;
    button.textContent = "最新の気温を確認";
  }
}

function useCurrentLocation() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(position => {
    if (!currentSnapshot) return;

    const nearest = findNearestTemperatureStation(
      position,
      buildTemperatureRanking(currentSnapshot.readings, currentSnapshot.stations)
    );

    if (!nearest) return;

    const prefectureLabel = normalizePrefectureName(nearest.prefecture);
    document.getElementById("location-note").textContent =
      `${prefectureLabel}の近い観測データから休憩目安を出しています。観測地点名は画面やX投稿に表示しません。`;

    renderSnapshot(currentSnapshot, nearest);
  }, () => {
    document.getElementById("location-note").textContent =
      "位置情報を取得できなかったため、気温ランキング上位の県データから休憩目安を表示しています。";
  }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 });
}

function setupScrollReveals() {
  const blocks = document.querySelectorAll(
    ".comparison-section, .ranking-section, .capital-section, .all-stations-section"
  );
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    blocks.forEach(block => block.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });

  blocks.forEach(block => {
    block.classList.add("reveal-block");
    observer.observe(block);
  });
}

function setupHydrationAction() {
  const button = document.getElementById("hydration-button");
  const status = document.getElementById("hydration-status");
  if (!button || !status) return;

  const storageKey = "saikyo-kumagaya-hydration-time";
  const showRecordedTime = timestamp => {
    const time = new Date(timestamp);
    if (!Number.isFinite(time.getTime())) return;
    status.textContent = `${time.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })} に水分補給を記録しました`;
  };

  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) showRecordedTime(saved);
  } catch (_) {
    // Storage may be unavailable in private browsing.
  }

  button.addEventListener("click", () => {
    const timestamp = new Date().toISOString();
    try {
      localStorage.setItem(storageKey, timestamp);
    } catch (_) {
      // The on-screen record still works without storage.
    }
    showRecordedTime(timestamp);
    button.classList.add("is-recorded");
    button.innerHTML = '<span aria-hidden="true">✓</span> 記録しました';
  });
}

setupScrollReveals();
setupHydrationAction();
document.getElementById("refresh-button").addEventListener("click", reloadHeatData);
document.getElementById("share-button").addEventListener("click", shareTemperatureResult);
reloadHeatData().then(useCurrentLocation);

let currentSnapshot = null;
let selectedStation = null;
let latestShareText = "全国アメダスの最新気温から、今日のひと涼み目安を確認。のどが渇く前に水分を。 #最強熊谷伝説 #水分補給";
let locationRequestInFlight = false;

const LOCATION_STORAGE_KEY = "saikyo-kumagaya-nearest-station-v1";
const LOCATION_OPTIONS = {
  enableHighAccuracy: false,
  timeout: 12000,
  maximumAge: 30 * 60 * 1000
};

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

  const featuredNationwideRanking = ranking.slice(0, 10);

  renderHeatRanking(featuredNationwideRanking, kumagaya.temperature);
  renderCapitalTemperatureList(capitalRanking);
  renderAllTemperatureStations(ranking);
  document.body.classList.add("data-is-live");
}

async function shareTemperatureResult() {
  const status = document.getElementById("share-status");
  const payload = {
    title: "最強熊谷伝説",
    text: latestShareText,
    url: location.href.split("#")[0].split("?")[0]
  };

  if (navigator.share) {
    try {
      await navigator.share(payload);
      status.textContent = "共有しました";
    } catch (error) {
      if (error?.name !== "AbortError") status.textContent = "共有できませんでした";
    }
    return;
  }

  const shareText = `${payload.text}\n${payload.url}`;
  try {
    await navigator.clipboard.writeText(shareText);
    status.textContent = "結果とURLをコピーしました";
  } catch (_) {
    const textarea = document.createElement("textarea");
    textarea.value = shareText;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    status.textContent = copied ? "結果とURLをコピーしました" : "共有できませんでした";
  }
}

async function reloadHeatData() {
  const button = document.getElementById("refresh-button");
  const locationButton = document.getElementById("location-button");
  const comparisonCard = document.getElementById("comparison-card");
  button.disabled = true;
  locationButton.disabled = true;
  button.textContent = "確認中…";
  document.body.classList.add("is-refreshing");
  comparisonCard?.setAttribute("aria-busy", "true");

  try {
    currentSnapshot = await fetchAmedasSnapshot();
    const restoredTarget = selectedStation || getCachedLocationTarget(currentSnapshot);
    renderSnapshot(currentSnapshot, restoredTarget);
  } catch (error) {
    console.error(error);
    showError("観測値を取得できませんでした。");
  } finally {
    button.disabled = false;
    locationButton.disabled = locationRequestInFlight || !currentSnapshot;
    button.textContent = "最新の気温を確認";
    document.body.classList.remove("is-refreshing");
    comparisonCard?.setAttribute("aria-busy", "false");
  }
}

function readLocationPreference() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCATION_STORAGE_KEY) || "null");
    if (!saved || !/^\d{5}$/.test(String(saved.stationId || ""))) return null;
    return saved;
  } catch (_) {
    return null;
  }
}

function getCachedLocationTarget(snapshot) {
  const saved = readLocationPreference();
  if (!saved || !snapshot) return null;
  return buildTemperatureRanking(snapshot.readings, snapshot.stations)
    .find(item => item.id === String(saved.stationId)) || null;
}

function saveLocationPreference(target) {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({
      stationId: String(target.id),
      savedAt: new Date().toISOString()
    }));
  } catch (_) {
    // Private browsing may disable storage. The current comparison still works.
  }
}

function setLocationControl(message, state = "idle") {
  const control = document.querySelector(".location-control");
  const note = document.getElementById("location-note");
  if (control) control.dataset.locationState = state;
  if (note) note.textContent = message;
}

function setLocationButton({ loading = false, active = false } = {}) {
  const button = document.getElementById("location-button");
  if (!button) return;
  button.disabled = loading || !currentSnapshot;
  button.classList.toggle("is-loading", loading);
  button.classList.toggle("is-active", active);
  button.querySelector("b").textContent = loading
    ? "現在地を確認中…"
    : active ? "現在地を更新" : "現在地で比較";
  button.querySelector("small").textContent = loading
    ? "許可画面は必要な時だけ"
    : active ? "前回地点を使用中" : "押した時だけ確認";
}

function applyLocationTarget(nearest, { save = false, cached = false } = {}) {
  if (!nearest || !currentSnapshot) return false;
  if (save) saveLocationPreference(nearest);

  const prefectureLabel = normalizePrefectureName(nearest.prefecture);
  setLocationControl(
    cached
      ? `前回の${prefectureLabel}付近を使っています。移動した時だけ「現在地を更新」を押してください。観測地点名は表示・共有しません。`
      : `${prefectureLabel}の近い観測データから休憩目安を出しています。次回から前回地点を使うため、許可画面は毎回出ません。観測地点名は表示・共有しません。`,
    "active"
  );
  setLocationButton({ active: true });
  if (selectedStation?.id !== nearest.id) renderSnapshot(currentSnapshot, nearest);
  return true;
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, LOCATION_OPTIONS);
  });
}

async function getGeolocationPermissionState() {
  if (!navigator.permissions?.query) return "unknown";
  try {
    const permission = await navigator.permissions.query({ name: "geolocation" });
    return permission.state;
  } catch (_) {
    return "unknown";
  }
}

function locationErrorMessage(error) {
  if (error?.code === 1) {
    return "位置情報は許可されていません。使う場合はブラウザのサイト設定で許可してから、もう一度ボタンを押してください。";
  }
  if (error?.code === 3) {
    return "現在地の確認が時間切れになりました。電波のよい場所で、必要な時だけもう一度お試しください。";
  }
  return "現在地を確認できませんでした。気温ランキング上位の県データで比較を続けます。";
}

async function requestCurrentLocation() {
  if (!currentSnapshot || locationRequestInFlight) return;
  if (!navigator.geolocation) {
    setLocationControl("このブラウザは位置情報に対応していません。気温ランキング上位の県データで比較します。", "unavailable");
    return;
  }

  locationRequestInFlight = true;
  setLocationButton({ loading: true });
  setLocationControl("現在地を確認しています。位置情報は近い観測地点を選ぶためだけに使い、座標は保存しません。", "loading");

  try {
    const position = await getCurrentPosition();
    const nearest = findNearestTemperatureStation(
      position,
      buildTemperatureRanking(currentSnapshot.readings, currentSnapshot.stations)
    );
    if (!nearest) throw new Error("nearest station unavailable");
    applyLocationTarget(nearest, { save: true });
  } catch (error) {
    const cachedTarget = getCachedLocationTarget(currentSnapshot);
    setLocationControl(
      `${locationErrorMessage(error)}${cachedTarget ? " 前回地点の比較はそのまま続けます。" : ""}`,
      "error"
    );
    setLocationButton({ active: Boolean(cachedTarget) });
  } finally {
    locationRequestInFlight = false;
    document.getElementById("location-button").disabled = !currentSnapshot;
  }
}

async function initializeLocationPreference() {
  if (!currentSnapshot) {
    setLocationControl("気温データを取得できなかったため、現在地との比較を開始できませんでした。", "error");
    return;
  }

  const cachedTarget = getCachedLocationTarget(currentSnapshot);
  if (cachedTarget) {
    applyLocationTarget(cachedTarget, { cached: true });
    return;
  }

  if (!navigator.geolocation) {
    setLocationControl("このブラウザは位置情報に対応していません。気温ランキング上位の県データで比較します。", "unavailable");
    setLocationButton();
    return;
  }

  const permissionState = await getGeolocationPermissionState();
  setLocationControl(
    permissionState === "denied"
      ? "位置情報は許可されていません。使う場合はブラウザのサイト設定を変更してからボタンを押してください。"
      : "位置情報は自動では要求しません。現在地で比べたい時だけボタンを押してください。観測地点名は表示・共有しません。",
    permissionState === "denied" ? "unavailable" : "idle"
  );
  setLocationButton();
}

function setupLocationControl() {
  document.getElementById("location-button")
    .addEventListener("click", requestCurrentLocation);
}

function setupScrollReveals() {
  const blocks = document.querySelectorAll(
    ".hero, .comparison-section, .ranking-section, .capital-section, .all-stations-section"
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
  const action = button?.closest(".hydration-action");
  if (!button || !status) return;

  const storageKey = "saikyo-kumagaya-hydration-time";
  const showRecordedTime = timestamp => {
    const time = new Date(timestamp);
    if (!Number.isFinite(time.getTime())) return;
    status.textContent = `${time.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })} に水分補給を記録しました`;
    button.classList.add("is-recorded");
    button.innerHTML = '<span aria-hidden="true">✓</span> 記録しました';
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
    if (action && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      action.classList.remove("is-celebrating");
      requestAnimationFrame(() => {
        action.classList.add("is-celebrating");
        window.setTimeout(() => action.classList.remove("is-celebrating"), 950);
      });
    }
  });
}

function setupUltraPresentation() {
  const root = document.documentElement;
  const comparisonCard = document.getElementById("comparison-card");
  const details = document.getElementById("all-stations-details");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let progressFrame = 0;

  const updateProgress = () => {
    const scrollRange = Math.max(1, root.scrollHeight - window.innerHeight);
    root.style.setProperty("--page-progress", Math.min(1, window.scrollY / scrollRange));
    progressFrame = 0;
  };

  window.addEventListener("scroll", () => {
    if (progressFrame) return;
    progressFrame = requestAnimationFrame(updateProgress);
  }, { passive: true });
  updateProgress();

  details?.addEventListener("toggle", () => {
    if (details.open) {
      renderPendingAllTemperatureStations();
    } else {
      clearRenderedAllTemperatureStations();
    }
  });

  if (!reducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    comparisonCard?.addEventListener("pointermove", event => {
      const bounds = comparisonCard.getBoundingClientRect();
      comparisonCard.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
      comparisonCard.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
    });
    comparisonCard?.addEventListener("pointerleave", () => {
      comparisonCard.style.removeProperty("--pointer-x");
      comparisonCard.style.removeProperty("--pointer-y");
    });
  }
}

setupScrollReveals();
setupHydrationAction();
setupUltraPresentation();
setupLocationControl();
document.getElementById("refresh-button").addEventListener("click", reloadHeatData);
document.getElementById("share-button").addEventListener("click", shareTemperatureResult);
reloadHeatData().then(initializeLocationPreference);

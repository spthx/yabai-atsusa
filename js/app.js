let currentSnapshot = null;
let selectedStation = null;
let selectedStationSource = "fallback";
let latestShareText = "全国アメダスの最新気温から、今日のひと涼み目安を確認。のどが渇く前に水分を。 #最強熊谷伝説 #水分補給";
let locationRequestInFlight = false;
let dataRequestInFlight = false;

const LOCATION_STORAGE_KEY = "saikyo-kumagaya-nearest-station-v1";
const LOCATION_AUTO_DECISION_KEY = "saikyo-kumagaya-location-auto-v1";
const LOCATION_OPTIONS = {
  enableHighAccuracy: false,
  timeout: 12000,
  maximumAge: 30 * 60 * 1000
};

const SUPPORT_CHARACTER_POOL = [
  "assets/characters/pref-aichi-v2.webp",
  "assets/characters/pref-aomori.webp",
  "assets/characters/pref-chiba.webp",
  "assets/characters/pref-fukui.webp",
  "assets/characters/pref-fukushima.webp",
  "assets/characters/pref-gifu.webp",
  "assets/characters/pref-gunma-v2.webp",
  "assets/characters/pref-hyogo.webp",
  "assets/characters/pref-ibaraki.webp",
  "assets/characters/pref-iwate.webp",
  "assets/characters/pref-kyoto.webp",
  "assets/characters/pref-kagawa.webp",
  "assets/characters/pref-ehime.webp",
  "assets/characters/pref-mie.webp",
  "assets/characters/pref-miyagi.webp",
  "assets/characters/pref-miyazaki.webp",
  "assets/characters/pref-nagano.webp",
  "assets/characters/pref-nagasaki.webp",
  "assets/characters/pref-nara.webp",
  "assets/characters/pref-niigata.webp",
  "assets/characters/pref-okayama.webp",
  "assets/characters/pref-okinawa.webp",
  "assets/characters/pref-oita.webp",
  "assets/characters/pref-osaka.webp",
  "assets/characters/pref-shimane.webp",
  "assets/characters/pref-shiga.webp",
  "assets/characters/pref-shizuoka.webp",
  "assets/characters/pref-saga.webp",
  "assets/characters/pref-tokushima.webp",
  "assets/characters/pref-tochigi.webp",
  "assets/characters/pref-tokyo.webp",
  "assets/characters/pref-tottori.webp",
  "assets/characters/pref-toyama.webp",
  "assets/characters/pref-fukuoka.webp",
  "assets/characters/pref-kumamoto.webp",
  "assets/characters/pref-yamaguchi.webp",
  "assets/characters/pref-yamagata.webp",
  "assets/characters/pref-yamanashi.webp",
  "assets/characters/region-hokkaido.webp",
  "assets/characters/region-chugoku.webp",
  "assets/characters/region-kanto.webp",
  "assets/characters/region-kinki.webp",
  "assets/characters/region-kyushu.webp",
  "assets/characters/region-shikoku.webp",
  "assets/characters/region-tohoku.webp"
];
let supportCharacterImages = [];

function assignSupportCharacters(excludedImages = []) {
  const normalize = path => path?.split("?")[0];
  const excluded = new Set(excludedImages.map(normalize));
  const currentIsUsable = supportCharacterImages.length === 5
    && supportCharacterImages.every(image => !excluded.has(normalize(image)));
  if (currentIsUsable) return;

  const pool = SUPPORT_CHARACTER_POOL
    .filter(image => !excluded.has(normalize(image)))
    .map(image => ({ image, order: Math.random() }))
    .sort((a, b) => a.order - b.order)
    .map(item => item.image);
  supportCharacterImages = pool.slice(0, 5);

  const slots = [
    document.querySelector(".hydration-girl"),
    document.querySelector(".share-character-left"),
    document.querySelector(".share-character-right"),
    document.querySelector(".archive-banner-left"),
    document.querySelector(".archive-banner-right")
  ];
  slots.forEach((slot, index) => {
    if (slot && supportCharacterImages[index]) slot.src = supportCharacterImages[index];
  });
}

function syncRequestButtons() {
  const refreshButton = document.getElementById("refresh-button");
  const locationButton = document.getElementById("location-button");
  if (refreshButton) refreshButton.disabled = dataRequestInFlight || locationRequestInFlight;
  if (locationButton) {
    locationButton.disabled = dataRequestInFlight || locationRequestInFlight || !currentSnapshot;
  }
}

function setObservationTime(latestTime) {
  const text = `観測時刻：${formatObservationTime(latestTime)}`;
  document.getElementById("observation-time").textContent = text;
  document.getElementById("ranking-time").textContent = text;
}

function renderSnapshot(snapshot, target, { source = "fallback" } = {}) {
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
  selectedStationSource = selectedFromCurrentData && source === "location"
    ? "location"
    : "fallback";
  const heroCatch = document.querySelector(".hero-catch");
  if (heroCatch) {
    heroCatch.innerHTML = selectedStationSource === "location"
      ? "あなたの県と熊谷、<strong>いま暑いのはどっち？</strong>"
      : "熊谷と47県代表1位、<strong>いま暑いのはどっち？</strong>";
  }

  const capitalInfo = getCapitalByStationId(selectedStation.id);
  if (capitalInfo) selectedStation = { ...selectedStation, ...capitalInfo };

  setObservationTime(snapshot.latestTime);
  renderComparison(kumagaya, selectedStation, ranking, {
    isFallback: selectedStationSource === "fallback"
  });
  assignSupportCharacters([
    CHARACTER_REGISTRY.kumagaya.image,
    getCharacterForPrefecture(selectedStation.prefecture).image
  ]);

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

async function reloadHeatData({ initialLocationPromise = null } = {}) {
  if (dataRequestInFlight || (locationRequestInFlight && !initialLocationPromise)) {
    return { skipped: true };
  }

  const button = document.getElementById("refresh-button");
  const comparisonCard = document.getElementById("comparison-card");
  let initialLocation = null;
  let initialTarget = null;
  dataRequestInFlight = true;
  syncRequestButtons();
  button.textContent = "確認中…";
  document.body.classList.add("is-refreshing");
  comparisonCard?.setAttribute("aria-busy", "true");

  try {
    try {
      currentSnapshot = await fetchAmedasSnapshot();

      const cachedTarget = getCachedLocationTarget(currentSnapshot);
      const restoredTarget = selectedStationSource === "location"
        ? selectedStation
        : cachedTarget;
      renderSnapshot(currentSnapshot, restoredTarget, {
        source: restoredTarget ? "location" : "fallback"
      });
    } catch (error) {
      console.error(error);
      showError("観測値を取得できませんでした。");
      return { initialLocation, initialTarget, failed: true };
    }

    try {
      initialLocation = initialLocationPromise ? await initialLocationPromise : null;

      if (initialLocation?.position) {
        initialTarget = findNearestTemperatureStation(
          initialLocation.position,
          buildTemperatureRanking(currentSnapshot.readings, currentSnapshot.stations)
        );
        if (initialTarget) {
          const locationPersisted = saveLocationPreference(initialTarget);
          saveAutoLocationDecision(locationPersisted ? "success" : "session-only");
          renderSnapshot(currentSnapshot, initialTarget, { source: "location" });
        }
      }
    } catch (error) {
      console.warn("位置情報から比較地点を選べませんでした。", error);
      initialTarget = null;
      initialLocation = { status: "error", error };
    }

    return { initialLocation, initialTarget };
  } finally {
    dataRequestInFlight = false;
    syncRequestButtons();
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

function readAutoLocationDecision() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCATION_AUTO_DECISION_KEY) || "null");
    return saved && typeof saved.status === "string" ? saved : null;
  } catch (_) {
    return null;
  }
}

function saveAutoLocationDecision(status, attemptId = "") {
  try {
    localStorage.setItem(LOCATION_AUTO_DECISION_KEY, JSON.stringify({
      status,
      attemptId,
      savedAt: new Date().toISOString()
    }));
    return true;
  } catch (_) {
    // Without persistent storage the browser's own permission state remains authoritative.
    return false;
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
    return true;
  } catch (_) {
    // Private browsing may disable storage. The current comparison still works.
    return false;
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
  button.disabled = loading || dataRequestInFlight || locationRequestInFlight || !currentSnapshot;
  button.classList.toggle("is-loading", loading);
  button.classList.toggle("is-active", active);
  button.querySelector("b").textContent = loading
    ? "現在地を確認中…"
    : active ? "現在地を更新" : "現在地で比較";
  button.querySelector("small").textContent = loading
    ? "初回または更新時だけ"
    : active ? "前回地点を使用中" : "押した時だけ確認";
}

function applyLocationTarget(nearest, { save = false, cached = false } = {}) {
  if (!nearest || !currentSnapshot) return false;
  const locationPersisted = save
    ? saveLocationPreference(nearest)
    : Boolean(readLocationPreference());
  if (save) saveAutoLocationDecision(locationPersisted ? "success" : "session-only");

  const prefectureLabel = normalizePrefectureName(nearest.prefecture);
  setLocationControl(
    locationPersisted
      ? cached
        ? `前回の${prefectureLabel}付近を使用中。移動した時だけ更新してください。比較地点名は対戦カード・共有には出しません。`
        : `${prefectureLabel}付近のデータで比較中。次回は前回地点を使うため、許可画面は毎回出ません。比較地点名は対戦カード・共有には出しません。`
      : `${prefectureLabel}付近のデータをこの画面だけで使用中。端末に保存できないため、次回は必要ならボタンから再確認してください。`,
    "active"
  );
  setLocationButton({ active: true });
  if (selectedStationSource !== "location" || selectedStation?.id !== nearest.id) {
    renderSnapshot(currentSnapshot, nearest, { source: "location" });
  }
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

async function requestInitialLocationOnce() {
  if (readLocationPreference()) return { status: "cached" };
  if (readAutoLocationDecision()) return { status: "skipped" };
  if (!navigator.geolocation) {
    saveAutoLocationDecision("unavailable");
    return { status: "unavailable" };
  }

  const attemptId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  if (!saveAutoLocationDecision("checking", attemptId)) {
    return { status: "storage-unavailable" };
  }

  const permissionState = await getGeolocationPermissionState();
  if (readAutoLocationDecision()?.attemptId !== attemptId) {
    return { status: "skipped" };
  }
  if (permissionState === "denied") {
    saveAutoLocationDecision("denied", attemptId);
    return { status: "denied", error: { code: 1 } };
  }

  // Save before opening the prompt so a reload during the dialog cannot trigger it again.
  if (!saveAutoLocationDecision("requested", attemptId)) {
    return { status: "storage-unavailable" };
  }
  locationRequestInFlight = true;
  syncRequestButtons();
  setLocationButton({ loading: true });
  setLocationControl(
    "初回だけ現在地を確認中。次回は前回の比較地点を使い、座標は保存しません。",
    "loading"
  );

  try {
    const position = await getCurrentPosition();
    return { status: "success", position };
  } catch (error) {
    const status = error?.code === 1 ? "denied" : error?.code === 3 ? "timeout" : "error";
    saveAutoLocationDecision(status, attemptId);
    return { status, error };
  } finally {
    locationRequestInFlight = false;
    syncRequestButtons();
  }
}

function locationErrorMessage(error) {
  if (error?.code === 1) {
    return "位置情報は許可されていません。使う場合はブラウザのサイト設定で許可してから、もう一度ボタンを押してください。";
  }
  if (error?.code === 3) {
    return "現在地の確認が時間切れになりました。電波のよい場所で、必要な時だけもう一度お試しください。";
  }
  return "現在地を確認できませんでした。47都道府県代表地点の現在1位で暫定比較を続けます。";
}

async function requestCurrentLocation() {
  if (!currentSnapshot || locationRequestInFlight || dataRequestInFlight) return;
  if (!navigator.geolocation) {
    setLocationControl("このブラウザは位置情報に対応していません。47都道府県代表地点の現在1位で暫定比較します。", "unavailable");
    return;
  }

  saveAutoLocationDecision("manual");
  locationRequestInFlight = true;
  syncRequestButtons();
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
    syncRequestButtons();
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
    setLocationControl("このブラウザは位置情報に対応していません。47都道府県代表地点の現在1位で暫定比較します。", "unavailable");
    setLocationButton();
    return;
  }

  const permissionState = await getGeolocationPermissionState();
  setLocationControl(
    permissionState === "denied"
      ? "位置情報は許可されていません。使う場合はブラウザのサイト設定を変更してからボタンを押してください。"
      : "位置情報は自動では要求しません。現在地で比べたい時だけボタンを押してください。比較地点名は対戦カード・共有には出しません。",
    permissionState === "denied" ? "unavailable" : "idle"
  );
  setLocationButton();
}

async function initializeApp() {
  const initialLocationPromise = requestInitialLocationOnce();
  const result = await reloadHeatData({ initialLocationPromise });
  if (result?.failed || !currentSnapshot) return;

  if (result.initialTarget) {
    applyLocationTarget(result.initialTarget);
    return;
  }

  const initialStatus = result.initialLocation?.status;
  if (["denied", "timeout", "error", "unavailable", "storage-unavailable"].includes(initialStatus)) {
    const message = initialStatus === "unavailable"
      ? "このブラウザは位置情報に対応していません。47都道府県代表地点の現在1位を暫定表示しています。"
      : initialStatus === "storage-unavailable"
        ? "この端末では初回確認済みの記録を保存できないため、自動取得は行いません。必要な時だけボタンから確認できます。"
        : `${locationErrorMessage(result.initialLocation?.error)} 次回アクセスでは自動確認せず、必要な時だけボタンから再確認できます。`;
    setLocationControl(
      message,
      ["denied", "unavailable", "storage-unavailable"].includes(initialStatus) ? "unavailable" : "error"
    );
    setLocationButton();
    return;
  }

  await initializeLocationPreference();
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
assignSupportCharacters();
setupHydrationAction();
setupUltraPresentation();
setupLocationControl();
document.getElementById("refresh-button").addEventListener("click", () => reloadHeatData());
document.getElementById("share-button").addEventListener("click", shareTemperatureResult);
initializeApp();

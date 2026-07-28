function characterMarkup(character, side, ribbonOverride = "") {
  const style = `--character-accent:${character.accent || "#55c4ff"};--character-focus:${character.focus || "50% 50%"}`;
  const skills = (character.skills || []).map(skill => `<span>${skill}</span>`).join("");
  const ribbonLabel = ribbonOverride || character.region || "地方の案内役";
  return `<div class="character ${side}" style="${style}">
    <span class="region-ribbon">${ribbonLabel}</span>
    <small class="attribute-label">${character.type || "GUIDE TYPE"}</small>
    <div class="fighter-photo"><img src="${character.image}" alt="${character.name}"></div>
    <div class="skill-tags" aria-label="特技">${skills}</div>
    <p>${character.catchphrase}</p>
  </div>`;
}

function getCoolDownGuide(temperature) {
  if (temperature >= 35) return {
    label: "いったん、涼しい場所へ",
    detail: "無理を続けず、冷房のある場所や木陰で休みながら、こまめに水分をとりましょう。",
    className: "guide-urgent",
    priority: "最優先",
    level: 92
  };
  if (temperature >= 30) return {
    label: "こまめに、ひと涼み",
    detail: "のどが渇く前に水分をとり、暑さを感じたら早めに涼しい場所で休みましょう。",
    className: "guide-break",
    priority: "高め",
    level: 72
  };
  if (temperature >= 25) return {
    label: "水分を忘れずに",
    detail: "過ごしやすく感じても、外出中は水分と休憩を忘れないようにしましょう。",
    className: "guide-water",
    priority: "ふつう",
    level: 48
  };
  return {
    label: "気持ちよく、ひと休み",
    detail: "気温が低めでも、活動量や体調に合わせて水分をとりましょう。",
    className: "guide-gentle",
    priority: "低め",
    level: 28
  };
}

function renderComparison(kumagaya, target, ranking, { isFallback = false } = {}) {
  const comparison = getComparison(target.temperature, kumagaya.temperature);
  const guide = getCoolDownGuide(target.temperature);
  const kumagayaHeatClass = getTempClass(kumagaya.temperature);
  const targetHeatClass = getTempClass(target.temperature);
  const comparisonHeatClass = getTempClass(Math.max(kumagaya.temperature, target.temperature));
  const kumagayaScore = getKumagayaDeviation(kumagaya.temperature, kumagaya.temperature);
  const targetScore = getKumagayaDeviation(target.temperature, kumagaya.temperature);
  const targetPrefecture = normalizePrefectureName(target.prefecture);
  const targetDisplayName = isFallback ? "47県暫定1位" : targetPrefecture;
  const targetDetail = isFallback ? `${targetPrefecture}・代表地点` : "観測地点 非公開";
  const targetShareLabel = isFallback ? `47都道府県代表・暫定1位（${targetPrefecture}）` : targetPrefecture;
  const targetCharacter = getCharacterForPrefecture(targetPrefecture);
  const kumagayaRank = ranking.findIndex(item => item.id === kumagaya.id) + 1;
  const targetRank = ranking.findIndex(item => item.id === target.id) + 1;
  const difference = Math.abs(comparison.diff).toFixed(1);
  const differenceText = comparison.diff > 0
    ? `熊谷より ${difference}℃ 低め`
    : comparison.diff < 0
      ? `熊谷より ${difference}℃ 高め`
      : "熊谷と同じ気温";

  latestShareText = `${targetShareLabel} ${formatTemperature(target.temperature)}｜${differenceText}。今日の休憩目安は「${guide.label}」。水分を忘れずに。 #最強熊谷伝説 #水分補給`;

  const comparisonCard = document.getElementById("comparison-card");
  comparisonCard.className = `comparison-card ${comparisonHeatClass}${isFallback ? " is-fallback" : ""}`;
  comparisonCard.innerHTML = `
    <div class="cool-backdrop" aria-hidden="true">
      <img src="assets/japan-silhouette.svg" alt="">
      <i class="water-ring ring-left"></i><i class="water-ring ring-right"></i>
      <span class="cool-bubble bubble-one"></span><span class="cool-bubble bubble-two"></span><span class="cool-bubble bubble-three"></span>
    </div>
    <div class="match-live-strip" role="group" aria-label="熊谷と${targetDisplayName}の現在気温">
      <span class="live-signal"><i></i> LIVE</span>
      <b><small>熊谷</small>${formatTemperature(kumagaya.temperature)}</b>
      <em>${differenceText}</em>
      <b><small>${targetDisplayName}</small>${formatTemperature(target.temperature)}</b>
    </div>
    <div class="contestants">
      <article class="contestant kumagaya-side ${kumagayaHeatClass}">${characterMarkup(CHARACTER_REGISTRY.kumagaya, "hot")}
        <h3>埼玉県<small>熊谷・基準地点</small></h3>
        <p class="heat-rank">全国気温 <b>${kumagayaRank}位</b></p>
        <p class="score-label">熊谷偏差値</p>
        <p class="score">${kumagayaScore ?? "–"}</p>
        <p class="temperature">${formatTemperature(kumagaya.temperature)}</p>
      </article>
      <div class="versus"><span>熊谷と</span>比較</div>
      <article class="contestant target-side ${targetHeatClass}">${characterMarkup(targetCharacter, "cool", isFallback ? "現在地未確定" : "")}
        <h3>${targetDisplayName}<small>${targetDetail}</small></h3>
        <p class="heat-rank">全国気温 <b>${targetRank}位</b></p>
        <p class="score-label">熊谷偏差値</p>
        <p class="score">${targetScore ?? "–"}</p>
        <p class="temperature">${formatTemperature(target.temperature)}</p>
      </article>
    </div>
    <div class="verdict ${guide.className}">
      <img class="verdict-character" src="${targetCharacter.image}" alt="" loading="lazy" decoding="async">
      <small>${differenceText}</small>
      <strong>${guide.label}</strong>
      <div class="cooldown-meter" style="--guide-level:${guide.level}%">
        <span>ひと涼み優先度</span>
        <div><i></i></div>
        <b>${guide.priority}</b>
      </div>
      <span>${guide.detail}</span>
    </div>`;
  requestAnimationFrame(() => comparisonCard.classList.add("is-fresh"));
}

function renderCapitalHeatSpotlight(capitals) {
  const spotlight = document.getElementById("regional-heat-spotlight");
  const hottest = capitals.find(item => item.temperature !== null);
  if (spotlight && hottest) {
    const character = getCharacterForPrefecture(hottest.prefecture);
    spotlight.style.setProperty("--spotlight-accent", character.accent);
    spotlight.querySelector("img").src = character.image;
    spotlight.querySelector("img").alt = `${hottest.prefecture}の水分補給キャラクター`;
    spotlight.querySelector("strong").textContent = `${hottest.prefecture} ${formatTemperature(hottest.temperature)}`;
    spotlight.querySelector("span").textContent = "47都道府県の代表地点で現在1位。水分補給と休憩を忘れずに。";
  }

}

function renderHeatRanking(ranking, kumagayaTemp) {
  const list = document.getElementById("heat-ranking-list");
  list.innerHTML = "";

  ranking.forEach((item, index) => {
    const score = getKumagayaDeviation(item.temperature, kumagayaTemp);
    const rank = index + 1;
    const rankIcon = rank === 1 ? "🧊" : rank === 2 ? "💧" : rank === 3 ? "🌿" : "";
    const municipality = item.city || item.location || item.name;

    const row = document.createElement("article");
    row.className = `ranking-card rank-${rank} ${index >= 10 ? "extra-kumagaya-line" : ""} ${getTempClass(item.temperature)}`;
    const regionKey = getRegionKeyForPrefecture(item.prefecture);
    const character = getCharacterForPrefecture(item.prefecture);
    row.dataset.region = regionKey;
    row.style.setProperty("--delay", `${Math.min(index, 14) * 45}ms`);
    row.style.setProperty("--girl-watermark", `url("../${character.image}")`);
    row.innerHTML = `
      <span class="rank-icon" aria-hidden="true">${rankIcon}</span>
      <span class="rank">${rank}位</span>
      <strong class="rank-temperature">${formatTemperature(item.temperature)}</strong>
      ${prefectureMascotMarkup(item.prefecture, rank)}
      <span class="place">
        <em>${item.prefecture || "都道府県情報なし"}</em>
        <b>${municipality}</b>
        <small>観測地点：${item.name}</small>
      </span>
      <span class="rank-score">熊谷偏差値<b>${score ?? "–"}</b></span>`;
    list.appendChild(row);
  });
}

function renderCapitalTemperatureList(capitals) {
  const list = document.getElementById("capital-temperature-list");
  list.innerHTML = "";

  capitals.forEach((item, index) => {
    const card = document.createElement("article");
    const missing = item.temperature === null;
    const regionKey = getRegionKeyForPrefecture(item.prefecture);
    const character = getCharacterForPrefecture(item.prefecture);
    card.dataset.region = regionKey;
    card.style.setProperty("--card-index", Math.min(index, 11));
    card.style.setProperty("--girl-watermark", `url("../${character.image}")`);
    card.className = `capital-card ${index < 12 ? "ultra-reveal-card" : ""} ${missing ? "temp-missing" : getTempClass(item.temperature)}`;
    card.innerHTML = `
      <span class="capital-rank">${index + 1}</span>
      <span class="capital-place">
        <b>${item.prefecture}</b>
        <small>${item.city}</small>
      </span>
      <strong>${missing ? "観測なし" : formatTemperature(item.temperature)}</strong>`;
    list.appendChild(card);
  });
  renderCapitalHeatSpotlight(capitals);
}

let pendingAllStationsRanking = [];
let allStationsRendered = false;
let allStationsNextIndex = 10;
let allStationsLoadObserver = null;
const ALL_STATIONS_BATCH_SIZE = 60;

function renderAllTemperatureStations(ranking) {
  const list = document.getElementById("all-temperature-stations");
  const note = document.getElementById("all-stations-note");
  const summary = document.getElementById("all-stations-summary");
  const details = document.getElementById("all-stations-details");
  const kumagayaIndex = ranking.findIndex(item => item.id === CONFIG.kumagayaStationId);
  const kumagayaRank = kumagayaIndex >= 0 ? kumagayaIndex + 1 : null;
  const remainingRanking = ranking.slice(10);

  pendingAllStationsRanking = ranking;
  allStationsRendered = false;
  allStationsNextIndex = 10;
  allStationsLoadObserver?.disconnect();
  allStationsLoadObserver = null;
  list.innerHTML = "";
  note.textContent = `11位以下の${remainingRanking.length}地点を、同一観測時刻・高い順で集計しています。`;
  if (summary) {
    summary.textContent = kumagayaRank
      ? `${remainingRanking.length}地点・熊谷は全国${kumagayaRank}位`
      : `${remainingRanking.length}地点を表示`;
  }

  if (details?.open) renderPendingAllTemperatureStations();
}

function renderPendingAllTemperatureStations() {
  if (!pendingAllStationsRanking.length) return;

  const list = document.getElementById("all-temperature-stations");
  if (!list.children.length) {
    allStationsNextIndex = 10;
    allStationsRendered = false;
  }
  appendAllTemperatureStationBatch();
}

function appendAllTemperatureStationBatch() {
  if (allStationsRendered || !pendingAllStationsRanking.length) return;

  const list = document.getElementById("all-temperature-stations");
  const ranking = pendingAllStationsRanking;
  const batchEnd = Math.min(ranking.length, allStationsNextIndex + ALL_STATIONS_BATCH_SIZE);
  list.querySelector(".all-stations-load-more")?.remove();
  const fragment = document.createDocumentFragment();

  for (let index = allStationsNextIndex; index < batchEnd; index += 1) {
    const item = ranking[index];
    const remainingIndex = index - 10;
    const card = document.createElement("article");
    const isKumagaya = item.id === CONFIG.kumagayaStationId;
    const prefectureLabel = item.prefecture || "都道府県情報なし";
    const locationLabel = item.location || "市区町村情報なし";
    const regionKey = getRegionKeyForPrefecture(prefectureLabel);
    const character = getCharacterForPrefecture(prefectureLabel);

    card.dataset.region = regionKey;
    card.style.setProperty("--girl-watermark", `url("../${character.image}")`);
    if (remainingIndex < 16) card.style.setProperty("--station-index", remainingIndex);
    card.className = `all-station-card ${remainingIndex < 16 ? "station-reveal" : ""} ${isKumagaya ? "kumagaya-marker" : ""} ${getTempClass(item.temperature)}`;
    card.innerHTML = `
      <span class="station-rank">${index + 1}</span>
      <div class="station-info">
        <em>${prefectureLabel}</em>
        <b>${locationLabel}</b>
        <small>観測地点：${item.point}${isKumagaya ? " / 熊谷基準" : ""}</small>
      </div>
      <strong>${formatTemperature(item.temperature)}</strong>`;

    fragment.appendChild(card);
  }

  list.appendChild(fragment);
  allStationsNextIndex = batchEnd;
  allStationsRendered = allStationsNextIndex >= ranking.length;

  if (!allStationsRendered) {
    const loadMore = document.createElement("button");
    loadMore.type = "button";
    loadMore.className = "all-stations-load-more";
    loadMore.textContent = `続きを表示（残り${ranking.length - allStationsNextIndex}地点）`;
    loadMore.addEventListener("click", appendAllTemperatureStationBatch, { once: true });
    list.appendChild(loadMore);

    if ("IntersectionObserver" in window) {
      allStationsLoadObserver?.disconnect();
      allStationsLoadObserver = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        allStationsLoadObserver?.disconnect();
        appendAllTemperatureStationBatch();
      }, { rootMargin: "240px 0px" });
      allStationsLoadObserver.observe(loadMore);
    }
  } else {
    allStationsLoadObserver?.disconnect();
    allStationsLoadObserver = null;
  }
}

function clearRenderedAllTemperatureStations() {
  allStationsLoadObserver?.disconnect();
  allStationsLoadObserver = null;
  document.getElementById("all-temperature-stations").innerHTML = "";
  allStationsRendered = false;
  allStationsNextIndex = 10;
}

function showError(message) {
  document.getElementById("comparison-card").innerHTML =
    `<p class="error">${message}<br>しばらくしてから更新してください。</p>`;
}

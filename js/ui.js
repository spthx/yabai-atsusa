function characterMarkup(character, side) {
  const style = `--character-accent:${character.accent || "#55c4ff"};--character-focus:${character.focus || "50% 50%"}`;
  const skills = (character.skills || []).map(skill => `<span>${skill}</span>`).join("");
  return `<div class="character ${side}" style="${style}">
    <span class="region-ribbon">${character.region || "地方の案内役"}</span>
    <small class="attribute-label">${character.type || "GUIDE TYPE"}</small>
    <div class="fighter-photo"><img src="${character.image}" alt="${character.name}"></div>
    <div class="skill-tags" aria-label="特技">${skills}</div>
    <p>${character.catchphrase}</p>
  </div>`;
}

function renderRegionalRoster() {
  const roster = document.getElementById("regional-roster");
  if (!roster) return;
  roster.innerHTML = getRegionalCharacterList().map((character, index) => `
    <article class="regional-fighter" style="--character-accent:${character.accent};--delay:${index * 70}ms">
      <div class="regional-fighter-photo">
        <span class="roster-attribute">${character.type || "GUIDE TYPE"}</span>
        <img src="${character.image}" alt="${character.name}" style="object-position:${character.focus || "50% 50%"}">
      </div>
      <div><b>${character.region}</b><small>${character.role}</small><em>★ ${(character.skills || ["夏の案内"])[0]}</em></div>
    </article>`).join("");
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

function renderComparison(kumagaya, target, ranking) {
  const comparison = getComparison(target.temperature, kumagaya.temperature);
  const guide = getCoolDownGuide(target.temperature);
  const kumagayaHeatClass = getTempClass(kumagaya.temperature);
  const targetHeatClass = getTempClass(target.temperature);
  const comparisonHeatClass = getTempClass(Math.max(kumagaya.temperature, target.temperature));
  const kumagayaScore = getKumagayaDeviation(kumagaya.temperature, kumagaya.temperature);
  const targetScore = getKumagayaDeviation(target.temperature, kumagaya.temperature);
  const targetPrefecture = normalizePrefectureName(target.prefecture);
  const targetCharacter = getCharacterForPrefecture(targetPrefecture);
  const kumagayaRank = ranking.findIndex(item => item.id === kumagaya.id) + 1;
  const targetRank = ranking.findIndex(item => item.id === target.id) + 1;
  const difference = Math.abs(comparison.diff).toFixed(1);
  const differenceText = comparison.diff > 0
    ? `熊谷より ${difference}℃ 低め`
    : comparison.diff < 0
      ? `熊谷より ${difference}℃ 高め`
      : "熊谷と同じ気温";

  latestShareText = `${targetPrefecture} ${formatTemperature(target.temperature)}｜${differenceText}。今日の休憩目安は「${guide.label}」。水分を忘れずに。 #最強熊谷伝説 #水分補給`;

  const comparisonCard = document.getElementById("comparison-card");
  comparisonCard.className = `comparison-card ${comparisonHeatClass}`;
  comparisonCard.innerHTML = `
    <div class="cool-backdrop" aria-hidden="true">
      <img src="assets/japan-silhouette.svg" alt="">
      <i class="water-ring ring-left"></i><i class="water-ring ring-right"></i>
      <span class="cool-bubble bubble-one"></span><span class="cool-bubble bubble-two"></span><span class="cool-bubble bubble-three"></span>
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
      <article class="contestant target-side ${targetHeatClass}">${characterMarkup(targetCharacter, "cool")}
        <h3>${targetPrefecture}<small>観測地点 非公開</small></h3>
        <p class="heat-rank">全国気温 <b>${targetRank}位</b></p>
        <p class="score-label">熊谷偏差値</p>
        <p class="score">${targetScore ?? "–"}</p>
        <p class="temperature">${formatTemperature(target.temperature)}</p>
      </article>
    </div>
    <div class="verdict ${guide.className}">
      <small>${differenceText}</small>
      <strong>${guide.label}</strong>
      <div class="cooldown-meter" style="--guide-level:${guide.level}%">
        <span>ひと涼み優先度</span>
        <div><i></i></div>
        <b>${guide.priority}</b>
      </div>
      <span>${guide.detail}</span>
    </div>`;
}

const REGION_DISPLAY_LABELS = {
  hokkaido: "北海道", tohoku: "東北", kanto: "関東", chubu: "中部",
  kinki: "近畿", chugoku: "中国", shikoku: "四国", kyushu: "九州・沖縄"
};
function renderCapitalRegionUI(capitals) {
  const spotlight = document.getElementById("regional-heat-spotlight");
  const hottest = capitals.find(item => item.temperature !== null);
  if (spotlight && hottest) {
    const regionKey = getRegionKeyForPrefecture(hottest.prefecture);
    const character = REGIONAL_CHARACTERS[regionKey];
    spotlight.style.setProperty("--spotlight-accent", character.accent);
    spotlight.querySelector("img").src = character.image;
    spotlight.querySelector("img").alt = `${REGION_DISPLAY_LABELS[regionKey]}の案内役`;
    spotlight.querySelector("strong").textContent = `${hottest.prefecture} ${formatTemperature(hottest.temperature)}`;
    spotlight.querySelector("span").textContent = `${REGION_DISPLAY_LABELS[regionKey]}の案内役が、県庁所在地ランキング首位を案内中`;
  }

  const filter = document.getElementById("region-character-filter");
  if (!filter) return;
  filter.innerHTML = Object.entries(REGIONAL_CHARACTERS).map(([key, character]) => {
    const count = (PREFECTURE_REGION_MAP[key] || []).length;
    return `<div class="region-character-button" style="--region-accent:${character.accent}">
      <img src="${character.image}" alt="" loading="lazy" decoding="async">
      <span><b>${REGION_DISPLAY_LABELS[key]}</b><small>${count}都道府県</small></span>
    </div>`;
  }).join("");

}

function renderTop10RegionRibbon(ranking) {
  const ribbon = document.getElementById("top10-region-ribbon");
  if (!ribbon) return;
  const counts = new Map();
  ranking.forEach(item => {
    const key = getRegionKeyForPrefecture(item.prefecture);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const regions = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  ribbon.innerHTML = `<div class="top10-ribbon-title"><small>TOP10 REGIONAL SIGNAL</small><strong>いま上位にいる地方</strong></div>` + regions.map(([key, count]) => {
    const character = REGIONAL_CHARACTERS[key];
    return `<div class="top10-region-chip" style="--region-accent:${character.accent}">
      <img src="${character.image}" alt="" loading="lazy" decoding="async">
      <span><b>${REGION_DISPLAY_LABELS[key]}</b><small>TOP10に ${count}地点</small></span>
    </div>`;
  }).join("");
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
    const regionCharacter = REGIONAL_CHARACTERS[regionKey];
    row.dataset.region = regionKey;
    row.style.setProperty("--delay", `${Math.min(index, 14) * 45}ms`);
    row.style.setProperty("--girl-watermark", `url("../${regionCharacter.image}")`);
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
  renderTop10RegionRibbon(ranking);
}

function renderCapitalTemperatureList(capitals) {
  const list = document.getElementById("capital-temperature-list");
  list.innerHTML = "";

  capitals.forEach((item, index) => {
    const card = document.createElement("article");
    const missing = item.temperature === null;
    const regionKey = getRegionKeyForPrefecture(item.prefecture);
    const regionCharacter = REGIONAL_CHARACTERS[regionKey];
    card.dataset.region = regionKey;
    card.style.setProperty("--girl-watermark", `url("../${regionCharacter.image}")`);
    card.className = `capital-card ${missing ? "temp-missing" : getTempClass(item.temperature)}`;
    card.innerHTML = `
      <span class="capital-rank">${index + 1}</span>
      <span class="capital-place">
        <b>${item.prefecture}</b>
        <small>${item.city}</small>
      </span>
      <strong>${missing ? "観測なし" : formatTemperature(item.temperature)}</strong>`;
    list.appendChild(card);
  });
  renderCapitalRegionUI(capitals);
}

function renderAllTemperatureStations(ranking) {
  const list = document.getElementById("all-temperature-stations");
  const note = document.getElementById("all-stations-note");
  const summary = document.getElementById("all-stations-summary");
  const kumagayaIndex = ranking.findIndex(item => item.id === CONFIG.kumagayaStationId);
  const kumagayaRank = kumagayaIndex >= 0 ? kumagayaIndex + 1 : null;
  const remainingRanking = ranking.slice(10);

  note.textContent = `11位以下の${remainingRanking.length}地点を、同一観測時刻・高い順で集計しています。`;
  const stationCastCount = document.querySelector(".station-cast-count");
  if (stationCastCount) stationCastCount.textContent = `${remainingRanking.length}地点`;

  if (summary) {
    summary.textContent = kumagayaRank
      ? `${remainingRanking.length}地点・熊谷は全国${kumagayaRank}位`
      : `${remainingRanking.length}地点を表示`;
  }

  list.innerHTML = "";
  const fragment = document.createDocumentFragment();

  remainingRanking.forEach((item, remainingIndex) => {
    const index = remainingIndex + 10;
    const card = document.createElement("article");
    const isKumagaya = item.id === CONFIG.kumagayaStationId;
    const prefectureLabel = item.prefecture || "都道府県情報なし";
    const locationLabel = item.location || "市区町村情報なし";
    const regionKey = getRegionKeyForPrefecture(prefectureLabel);
    const regionCharacter = REGIONAL_CHARACTERS[regionKey];

    card.dataset.region = regionKey;
    card.style.setProperty("--girl-watermark", `url("../${regionCharacter.image}")`);
    card.className = `all-station-card ${isKumagaya ? "kumagaya-marker" : ""} ${getTempClass(item.temperature)}`;
    card.innerHTML = `
      <span class="station-rank">${index + 1}</span>
      <div class="station-info">
        <em>${prefectureLabel}</em>
        <b>${locationLabel}</b>
        <small>観測地点：${item.point}${isKumagaya ? " / 熊谷基準" : ""}</small>
      </div>
      <strong>${formatTemperature(item.temperature)}</strong>`;

    fragment.appendChild(card);
  });

  list.appendChild(fragment);
}

function showError(message) {
  document.getElementById("comparison-card").innerHTML =
    `<p class="error">${message}<br>しばらくしてから更新してください。</p>`;
}
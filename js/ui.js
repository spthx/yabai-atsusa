function characterMarkup(character, side) {
  return `<div class="character ${side}"><div class="fighter-photo"><img src="${character.image}" alt="${character.name}"></div><p>${character.catchphrase}</p></div>`;
}

function renderComparison(kumagaya, target, ranking) {
  const comparison = getComparison(target.temperature, kumagaya.temperature);
  const kumagayaScore = getKumagayaDeviation(kumagaya.temperature, kumagaya.temperature);
  const targetScore = getKumagayaDeviation(target.temperature, kumagaya.temperature);
  const targetCharacter = getCharacterForStation(target.name);
  const targetMunicipality = target.city || target.location || target.name;
  const targetLocation = `${target.prefecture || "所在地不明"}<small>${targetMunicipality}</small>`;
  const kumagayaRank = ranking.findIndex(item => item.id === kumagaya.id) + 1;
  const targetRank = ranking.findIndex(item => item.id === target.id) + 1;
  const difference = Math.abs(comparison.diff).toFixed(1);
  const kumagayaWins = comparison.diff > 0;
  const targetWins = comparison.diff < 0;

  const verdictText = comparison.diff >= 3 ? `熊谷より ${difference}℃ かなりマシ！`
    : comparison.diff >= 1 ? `熊谷より ${difference}℃ マシ！`
    : comparison.diff > -1 ? "ほぼ熊谷"
    : `熊谷超え ${difference}℃！`;

  document.getElementById("comparison-card").innerHTML = `
    <div class="battle-backdrop" aria-hidden="true">
      <img src="assets/japan-silhouette.svg" alt="">
      <i class="battle-flame flame-left"></i><i class="battle-flame flame-right"></i>
      <span class="heat-spark spark-one">✦</span><span class="heat-spark spark-two">✦</span>
    </div>
    <div class="contestants">
      <article class="contestant kumagaya-side ${kumagayaWins ? "is-winner" : ""}">${kumagayaWins ? '<span class="winner-badge">WIN!</span>' : ""}${characterMarkup(CHARACTER_REGISTRY.kumagaya, "hot")}
        <h3>埼玉県<small>${CONFIG.kumagayaStationName}</small></h3>
        <p class="heat-rank">全国暑さ <b>${kumagayaRank}位</b></p>
        <p class="score-label">熊谷偏差値</p>
        <p class="score">${kumagayaScore ?? "–"}</p>
        <p class="temperature">${formatTemperature(kumagaya.temperature)}</p>
      </article>
      <div class="versus">VS</div>
      <article class="contestant target-side ${targetWins ? "is-winner" : ""}">${targetWins ? '<span class="winner-badge">WIN!</span>' : ""}${characterMarkup(targetCharacter, "cool")}
        <h3>${targetLocation}</h3>
        <p class="heat-rank">全国暑さ <b>${targetRank}位</b></p>
        <p class="score-label">熊谷偏差値</p>
        <p class="score">${targetScore ?? "–"}</p>
        <p class="temperature">${formatTemperature(target.temperature)}</p>
      </article>
    </div>
    <div class="verdict ${comparison.className}">
      <strong>${verdictText}</strong>
      <span>${comparison.detail}</span>
    </div>`;
}

function renderHeatRanking(ranking, kumagayaTemp) {
  const list = document.getElementById("heat-ranking-list");
  list.innerHTML = "";

  ranking.forEach((item, index) => {
    const score = getKumagayaDeviation(item.temperature, kumagayaTemp);
    const rank = index + 1;
    const rankIcon = rank === 1 ? "👑" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";

    const row = document.createElement("article");
    row.className = `ranking-card rank-${rank} ${index >= 10 ? "extra-kumagaya-line" : ""} ${getTempClass(item.temperature)}`;
    row.innerHTML = `
      <span class="rank-icon" aria-hidden="true">${rankIcon}</span>
      <span class="rank">${rank}位</span>
      <strong class="rank-temperature">${formatTemperature(item.temperature)}</strong>
      ${prefectureMascotMarkup(item.prefecture, rank)}
      <span class="place">
        <em>${item.prefecture}</em>
        <b>${item.city}</b>
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
}

function renderAllTemperatureStations(ranking, kumagaya) {
  const list = document.getElementById("all-temperature-stations");
  const note = document.getElementById("all-stations-note");
  const summary = document.getElementById("all-stations-summary");
  const kumagayaIndex = ranking.findIndex(item => item.id === CONFIG.kumagayaStationId);
  const kumagayaRank = kumagayaIndex >= 0 ? kumagayaIndex + 1 : null;
  const hotterThanKumagaya = kumagaya
    ? ranking.filter(item => item.temperature > kumagaya.temperature).length
    : null;

  note.textContent = `${ranking.length}地点の気温を、同一観測時刻・暑い順で集計しています。`;

  if (summary) {
    summary.textContent = kumagayaRank
      ? `熊谷は${kumagayaRank}位 / ${ranking.length}地点中・熊谷超え${hotterThanKumagaya}地点`
      : `${ranking.length}地点を表示`;
  }

  list.innerHTML = "";
  const fragment = document.createDocumentFragment();

  ranking.forEach((item, index) => {
    const card = document.createElement("article");
    const isKumagaya = item.id === CONFIG.kumagayaStationId;
    const prefectureLabel = item.prefecture || "都道府県情報なし";
    const locationLabel = item.location || "市区町村情報なし";

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

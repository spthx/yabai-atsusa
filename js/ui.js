function characterMarkup(character, side) {
  return `<div class="character ${side}"><img src="${character.image}" alt="${character.name}"><p>${character.catchphrase}</p></div>`;
}

function renderComparison(kumagaya, target) {
  const comparison = getComparison(target.temperature, kumagaya.temperature);
  const kumagayaScore = getKumagayaDeviation(kumagaya.temperature, kumagaya.temperature);
  const targetScore = getKumagayaDeviation(target.temperature, kumagaya.temperature);
  const targetCharacter = getCharacterForStation(target.name);
  const targetLocation = target.prefecture && target.city ? `${target.prefecture}<small>${target.city}</small>` : `近隣の観測地点<small>${target.name}</small>`;
  const difference = Math.abs(comparison.diff).toFixed(1);
  const verdictText = comparison.diff >= 3 ? `熊谷より ${difference}℃ かなりマシ！`
    : comparison.diff >= 1 ? `熊谷より ${difference}℃ マシ！`
    : comparison.diff > -1 ? "ほぼ熊谷"
    : `熊谷超え ${difference}℃`;
  document.getElementById("comparison-card").innerHTML = `
    <div class="contestants">
      <article class="contestant kumagaya-side">${characterMarkup(CHARACTER_REGISTRY.kumagaya, "hot")}
        <h3>埼玉県<small>${CONFIG.kumagayaStationName}</small></h3><p class="score-label">熊谷偏差値</p><p class="score">${kumagayaScore ?? "–"}</p><p class="temperature">${formatTemperature(kumagaya.temperature)}</p>
      </article>
      <div class="versus">VS</div>
      <article class="contestant target-side">${characterMarkup(targetCharacter, "cool")}
        <h3>${targetLocation}</h3><p class="score-label">熊谷偏差値</p><p class="score">${targetScore ?? "–"}</p><p class="temperature">${formatTemperature(target.temperature)}</p>
      </article>
    </div>
    <div class="verdict ${comparison.className}"><strong>${verdictText}</strong><span>${comparison.detail}</span></div>`;
}

function renderHeatRanking(ranking, kumagayaTemp) {
  const list = document.getElementById("heat-ranking-list");
  list.innerHTML = "";
  ranking.slice(0, 10).forEach((item, index) => {
    const comparison = getComparison(item.temperature, kumagayaTemp);
    const score = getKumagayaDeviation(item.temperature, kumagayaTemp);
    const delta = Math.abs(comparison.diff).toFixed(1);
    const diffText = comparison.diff === 0 ? "熊谷と同じ" : `${comparison.label} ${delta}℃`;
    const row = document.createElement("article");
    row.className = `ranking-card ${getTempClass(item.temperature)}`;
    row.innerHTML = `${prefectureMascotMarkup(item.prefecture, index + 1)}<span class="rank">${index + 1}位</span><span class="place"><em>${item.prefecture}</em>${item.city}</span><strong>${formatTemperature(item.temperature)}</strong><span class="rank-diff">${diffText}</span><span class="rank-score">熊谷偏差値<br><b>${score ?? "–"}</b></span>`;
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
    card.innerHTML = `<span class="capital-rank">${index + 1}</span><span class="capital-place"><b>${item.prefecture}</b><small>${item.city}</small></span><strong>${missing ? "観測なし" : formatTemperature(item.temperature)}</strong>`;
    list.appendChild(card);
  });
}

function renderAllTemperatureStations(ranking) {
  const list = document.getElementById("all-temperature-stations");
  const note = document.getElementById("all-stations-note");
  note.textContent = `${ranking.length}地点の気温を、同一観測時刻・暑い順で表示しています`;
  list.innerHTML = "";
  const fragment = document.createDocumentFragment();
  ranking.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = `all-station-card ${getTempClass(item.temperature)}`;
    card.innerHTML = `<span>${index + 1}</span><b>${item.name}</b><strong>${formatTemperature(item.temperature)}</strong>`;
    fragment.appendChild(card);
  });
  list.appendChild(fragment);
}

function showError(message) {
  document.getElementById("comparison-card").innerHTML = `<p class="error">${message}<br>しばらくしてから更新してください。</p>`;
}

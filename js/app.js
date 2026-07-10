let currentSnapshot = null;
let selectedStation = null;

function setObservationTime(latestTime) {
  const text = `観測時刻：${formatObservationTime(latestTime)}`;
  document.getElementById("observation-time").textContent = text;
  document.getElementById("ranking-time").textContent = text;
}

function renderSnapshot(snapshot, target) {
  const ranking = buildTemperatureRanking(snapshot.readings, snapshot.stations);
  const capitalRanking = buildCapitalTemperatureList(snapshot.readings, snapshot.stations);
  const kumagaya = ranking.find(item => item.id === CONFIG.kumagayaStationId);
  if (!kumagaya) throw new Error("熊谷の気温を確認できませんでした。");

  const selectedFromCurrentData = target && ranking.find(item => item.id === target.id);
  const defaultCapital = capitalRanking.find(item => item.temperature !== null && item.id !== kumagaya.id);
  selectedStation = selectedFromCurrentData || defaultCapital || kumagaya;

  const capitalInfo = getCapitalByStationId(selectedStation.id);
  if (capitalInfo) selectedStation = { ...selectedStation, ...capitalInfo };

  setObservationTime(snapshot.latestTime);
  renderComparison(kumagaya, selectedStation, ranking);

  const validCapitalRanking = capitalRanking.filter(item => item.temperature !== null);
  const featuredCapitalRanking = validCapitalRanking.filter((item, index) => {
    const score = getKumagayaDeviation(item.temperature, kumagaya.temperature);
    return index < 10 || (score !== null && score >= 100);
  });

  renderHeatRanking(featuredCapitalRanking, kumagaya.temperature);
  renderCapitalTemperatureList(capitalRanking);
  renderAllTemperatureStations(ranking, kumagaya);
}

async function reloadHeatData() {
  const button = document.getElementById("refresh-button");
  button.disabled = true;
  button.textContent = "更新中…";

  try {
    currentSnapshot = await fetchAmedasSnapshot();
    renderSnapshot(currentSnapshot, selectedStation);
  } catch (error) {
    console.error(error);
    showError("観測値を取得できませんでした。");
  } finally {
    button.disabled = false;
    button.textContent = "最新の観測値を更新";
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

    const locationLabel = [nearest.prefecture, nearest.location].filter(Boolean).join("・") || "所在地情報なし";
    document.getElementById("location-note").textContent =
      `現在地に近い ${locationLabel} の観測地点「${nearest.name}」（約${nearest.distance.toFixed(0)}km）と比較しています。`;

    renderSnapshot(currentSnapshot, nearest);
  }, () => {
    document.getElementById("location-note").textContent =
      "位置情報を取得できなかったため、暑さランキング上位の地点と比較しています。";
  }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 });
}

document.getElementById("refresh-button").addEventListener("click", reloadHeatData);
reloadHeatData().then(useCurrentLocation);
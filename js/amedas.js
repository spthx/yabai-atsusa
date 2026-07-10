async function fetchAmedasSnapshot() {
  const latestResponse = await fetch(CONFIG.latestTimeUrl, { cache: "no-store" });
  if (!latestResponse.ok) throw new Error("最新観測時刻を取得できませんでした。");
  const latestTime = (await latestResponse.text()).trim();
  const stamp = toJmaStamp(latestTime);
  const [mapResponse, stationResponse] = await Promise.all([
    fetch(`${CONFIG.mapDataBaseUrl}/${stamp}.json`, { cache: "no-store" }),
    fetch(CONFIG.stationTableUrl, { cache: "force-cache" })
  ]);
  if (!mapResponse.ok || !stationResponse.ok) throw new Error("アメダス観測値を取得できませんでした。");
  return { latestTime, readings: await mapResponse.json(), stations: await stationResponse.json() };
}

function buildTemperatureRanking(readings, stations) {
  return Object.entries(readings).map(([id, reading]) => {
    const temperature = getTemperature(reading);
    const station = stations[id];
    return station && temperature !== null ? { id, name: station.kjName, temperature, station } : null;
  }).filter(Boolean).sort((a, b) => b.temperature - a.temperature);
}

function buildCapitalTemperatureList(readings, stations) {
  return CONFIG.capitalStations.map(capital => {
    const station = stations[capital.id];
    const temperature = getTemperature(readings[capital.id]);
    return { ...capital, name: station?.kjName || capital.city, station, temperature };
  }).sort((a, b) => (b.temperature ?? -Infinity) - (a.temperature ?? -Infinity));
}

function getCapitalByStationId(stationId) {
  return CONFIG.capitalStations.find(capital => capital.id === stationId) || null;
}

function findNearestTemperatureStation(position, ranking) {
  const here = { lat: position.coords.latitude, lon: position.coords.longitude };
  return ranking.map(item => ({ ...item, distance: distanceKm(here, getStationCoordinates(item.station)) }))
    .filter(item => Number.isFinite(item.distance)).sort((a, b) => a.distance - b.distance)[0] || null;
}

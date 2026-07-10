function toJmaStamp(latestTime) {
  const match = String(latestTime).trim().match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  if (!match) throw new Error("観測時刻の形式を確認できませんでした。");
  return match.slice(1).join("");
}

function formatObservationTime(latestTime) {
  const match = String(latestTime).trim().match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  return match ? `${match[1]}/${match[2]}/${match[3]} ${match[4]}:${match[5]}` : "不明";
}

function getTemperature(reading) {
  const value = reading?.temp?.[0];
  return Number.isFinite(value) ? value : null;
}

function getStationCoordinates(station) {
  const lat = station?.lat;
  const lon = station?.lon;
  if (!Array.isArray(lat) || !Array.isArray(lon)) return null;
  return { lat: Number(lat[0]) + Number(lat[1]) / 60, lon: Number(lon[0]) + Number(lon[1]) / 60 };
}

function distanceKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function formatTemperature(temp) { return `${temp.toFixed(1)}℃`; }

function getKumagayaDeviation(targetTemp, kumagayaTemp) {
  return Number.isFinite(kumagayaTemp) && kumagayaTemp > 0 && Number.isFinite(targetTemp)
    ? Math.round((targetTemp / kumagayaTemp) * 100) : null;
}

function getComparison(targetTemp, kumagayaTemp) {
  const diff = kumagayaTemp - targetTemp;
  if (diff >= 3) return { label: "熊谷よりかなりマシ", detail: "比較で涼しく見えても、のどが渇く前にこまめに水分をとりましょう。", className: "much-cooler", diff };
  if (diff >= 1) return { label: "熊谷よりマシ", detail: "気温が低めでも油断せず、こまめに水分をとりましょう。", className: "cooler", diff };
  if (diff > -1) return { label: "ほぼ熊谷", detail: "同じくらい暑いです。のどが渇く前にこまめに水分をとりましょう。", className: "same", diff };
  return { label: "熊谷超え", detail: "涼しい場所で休み、のどが渇く前にこまめに水分をとりましょう。", className: "hotter", diff };
}

function getTempClass(temp) {
  if (temp >= 40) return "temp-extreme";
  if (temp >= 38) return "temp-purple";
  if (temp >= 35) return "temp-red";
  if (temp >= 30) return "temp-orange";
  if (temp >= 27) return "temp-yellow";
  if (temp >= 24) return "temp-green";
  if (temp >= 20) return "temp-blue";
  return "temp-cold";
}
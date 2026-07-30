(function setupAmedasQa() {
  const params = new URLSearchParams(location.search);
  if (params.get("qa") !== "amedas") return;

  const report = {
    status: "starting",
    startedAt: new Date().toISOString(),
    viewport: { width: innerWidth, height: innerHeight },
    snapshot: {},
    data: { errors: [], warnings: [] },
    assets: { checked: 0, failed: [] },
    visual: {
      stationsChecked: 0,
      stationCardsChecked: 0,
      failureCounts: {},
      failures: [],
      worstOverflow: null
    }
  };
  const backgroundUrls = new Set();

  const output = document.createElement("pre");
  output.id = "qa-output";
  output.hidden = true;
  document.body.appendChild(output);

  const publish = () => {
    output.dataset.status = report.status;
    output.textContent = JSON.stringify(report, null, 2);
    document.documentElement.dataset.qaStatus = report.status;
  };

  const addIssue = (bucket, code, detail = {}) => {
    bucket.push({ code, ...detail });
  };

  const imageUrl = path => new URL(String(path).split("?")[0], document.baseURI).href;

  const preloadImage = url => new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve({
      url,
      ok: image.naturalWidth > 0 && image.naturalHeight > 0,
      width: image.naturalWidth,
      height: image.naturalHeight
    });
    image.onerror = () => resolve({ url, ok: false, width: 0, height: 0 });
    image.src = url;
  });

  const rect = element => {
    const bounds = element?.getBoundingClientRect();
    return bounds ? {
      left: bounds.left,
      right: bounds.right,
      top: bounds.top,
      bottom: bounds.bottom,
      width: bounds.width,
      height: bounds.height
    } : null;
  };

  const horizontalOverflow = element =>
    element ? Math.max(0, element.scrollWidth - element.clientWidth) : 0;

  const inspectBackgroundUrl = (element, pseudo = "::before") => {
    const background = getComputedStyle(element, pseudo).backgroundImage;
    const match = background.match(/url\(["']?(.+?)["']?\)/);
    const url = match?.[1] || "";
    if (url) backgroundUrls.add(url);
    return url;
  };

  const recordVisualFailure = failure => {
    const codes = failure.failures.map(item => item.code);
    codes.forEach(code => {
      report.visual.failureCounts[code] = (report.visual.failureCounts[code] || 0) + 1;
    });
    if (report.visual.failures.length < 40) report.visual.failures.push(failure);
  };

  function inspectComparison(stationId, prefecture) {
    const card = document.getElementById("comparison-card");
    const contestants = card.querySelector(".contestants");
    const articles = [...card.querySelectorAll(".contestant")];
    const photos = [...card.querySelectorAll(".fighter-photo")];
    const images = [...card.querySelectorAll(".fighter-photo img")];
    const failures = [];

    const recordOverflow = (name, element) => {
      const overflow = horizontalOverflow(element);
      const overflowMode = element ? getComputedStyle(element).overflowX : "visible";
      const leaksOutsideFrame = !["hidden", "clip"].includes(overflowMode);
      if (overflow > 1 && leaksOutsideFrame) {
        failures.push({ code: "horizontal-overflow", element: name, pixels: overflow, overflowMode });
      }
      if (
        leaksOutsideFrame &&
        (!report.visual.worstOverflow || overflow > report.visual.worstOverflow.pixels)
      ) {
        report.visual.worstOverflow = { stationId, prefecture, element: name, pixels: overflow };
      }
    };

    recordOverflow("comparison-card", card);
    recordOverflow("contestants", contestants);
    articles.forEach((article, index) => recordOverflow(`contestant-${index}`, article));

    photos.forEach((photo, index) => {
      const bounds = rect(photo);
      if (!bounds || bounds.width < 100 || bounds.height < 120) {
        failures.push({ code: "character-photo-too-small", index, bounds });
      }
    });

    images.forEach((image, index) => {
      const imageBounds = rect(image);
      const photoBounds = rect(photos[index]);
      if (!image.complete || image.naturalWidth === 0) {
        failures.push({ code: "character-image-failed", index, src: image.currentSrc || image.src });
      }
      if (
        imageBounds && photoBounds &&
        (
          imageBounds.left > photoBounds.left + 1 ||
          imageBounds.right < photoBounds.right - 1 ||
          imageBounds.top > photoBounds.top + 1 ||
          imageBounds.bottom < photoBounds.bottom - 1
        )
      ) {
        failures.push({
          code: "character-image-does-not-cover-frame",
          index,
          imageBounds,
          photoBounds
        });
      }
    });

    if (failures.length) {
      recordVisualFailure({ stationId, prefecture, failures });
    }
  }

  function inspectStationCards(cards) {
    cards.forEach(card => {
      report.visual.stationCardsChecked += 1;
      const overflow = horizontalOverflow(card);
      const backgroundUrl = inspectBackgroundUrl(card, "::after");
      const info = card.querySelector(".station-info");
      const textOverflow = horizontalOverflow(info);
      const cardLeaks = !["hidden", "clip"].includes(getComputedStyle(card).overflowX);
      const infoLeaks = !["hidden", "clip"].includes(getComputedStyle(info).overflowX);
      if ((overflow > 1 && cardLeaks) || (textOverflow > 1 && infoLeaks) || !backgroundUrl) {
        recordVisualFailure({
          stationId: card.dataset.stationId || "",
          prefecture: card.querySelector("em")?.textContent || "",
          failures: [
            ...(overflow > 1 && cardLeaks ? [{ code: "station-card-overflow", pixels: overflow }] : []),
            ...(textOverflow > 1 && infoLeaks ? [{ code: "station-text-overflow", pixels: textOverflow }] : []),
            ...(!backgroundUrl ? [{ code: "station-background-missing" }] : [])
          ]
        });
      }
    });
  }

  async function runQa() {
    const timeoutAt = Date.now() + 30000;
    while (!currentSnapshot && Date.now() < timeoutAt) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!currentSnapshot) throw new Error("アメダスのスナップショットを取得できませんでした。");

    const ranking = buildTemperatureRanking(currentSnapshot.readings, currentSnapshot.stations);
    const capitals = buildCapitalTemperatureList(currentSnapshot.readings, currentSnapshot.stations);
    const kumagaya = ranking.find(item => item.id === CONFIG.kumagayaStationId);
    const stationTableIds = Object.keys(currentSnapshot.stations);
    const readingIds = Object.keys(currentSnapshot.readings);
    const temperatures = ranking.map(item => item.temperature);

    report.snapshot = {
      latestTime: currentSnapshot.latestTime,
      stationTableCount: stationTableIds.length,
      readingCount: readingIds.length,
      temperatureRankingCount: ranking.length,
      capitalCount: capitals.length,
      capitalWithTemperatureCount: capitals.filter(item => item.temperature !== null).length,
      minTemperature: Math.min(...temperatures),
      maxTemperature: Math.max(...temperatures),
      kumagayaTemperature: kumagaya?.temperature ?? null,
      kumagayaRank: ranking.findIndex(item => item.id === CONFIG.kumagayaStationId) + 1
    };

    if (stationTableIds.length < 900) {
      addIssue(report.data.errors, "station-table-count-too-small", { count: stationTableIds.length });
    }
    if (ranking.length < 800 || ranking.length > stationTableIds.length) {
      addIssue(report.data.errors, "temperature-ranking-count-out-of-range", { count: ranking.length });
    }
    if (CONFIG.capitalStations.length !== 47) {
      addIssue(report.data.errors, "capital-config-count", { count: CONFIG.capitalStations.length });
    }
    if (!kumagaya) addIssue(report.data.errors, "kumagaya-missing");

    const seenIds = new Set();
    ranking.forEach((item, index) => {
      if (seenIds.has(item.id)) addIssue(report.data.errors, "duplicate-station-id", { id: item.id });
      seenIds.add(item.id);
      if (!/^\d{5}$/.test(item.id)) addIssue(report.data.errors, "invalid-station-id", { id: item.id });
      if (index && ranking[index - 1].temperature < item.temperature) {
        addIssue(report.data.errors, "ranking-order", { id: item.id, index });
      }
      if (getTemperature(currentSnapshot.readings[item.id]) !== item.temperature) {
        addIssue(report.data.errors, "temperature-source-mismatch", { id: item.id });
      }
      if (!Number.isFinite(item.temperature) || item.temperature < -60 || item.temperature > 60) {
        addIssue(report.data.errors, "temperature-out-of-range", { id: item.id, temperature: item.temperature });
      }
      const coordinates = getStationCoordinates(item.station);
      if (
        !coordinates ||
        !Number.isFinite(coordinates.lat) ||
        !Number.isFinite(coordinates.lon) ||
        coordinates.lat < 20 ||
        coordinates.lat > 50 ||
        coordinates.lon < 120 ||
        coordinates.lon > 155
      ) {
        addIssue(report.data.errors, "invalid-coordinate", { id: item.id, coordinates });
      }
      if (!item.prefecture || !item.location || !item.point) {
        addIssue(report.data.warnings, "location-metadata-incomplete", {
          id: item.id,
          prefecture: item.prefecture,
          location: item.location,
          point: item.point
        });
      }
      if (!PREFECTURE_REGION_MAP[getRegionKeyForPrefecture(item.prefecture)]?.includes(normalizePrefectureName(item.prefecture))) {
        addIssue(report.data.warnings, "prefecture-normalization-fallback", {
          id: item.id,
          prefecture: item.prefecture
        });
      }
    });

    const capitalIds = new Set();
    const capitalPrefectures = new Set();
    CONFIG.capitalStations.forEach(capital => {
      if (capitalIds.has(capital.id)) {
        addIssue(report.data.errors, "duplicate-capital-station", { id: capital.id });
      }
      capitalIds.add(capital.id);
      capitalPrefectures.add(capital.prefecture);
      if (!currentSnapshot.stations[capital.id]) {
        addIssue(report.data.errors, "capital-station-missing", {
          id: capital.id,
          prefecture: capital.prefecture
        });
      }
    });
    if (capitalPrefectures.size !== 47) {
      addIssue(report.data.errors, "capital-prefecture-count", { count: capitalPrefectures.size });
    }

    const characterPaths = new Set([
      CHARACTER_REGISTRY.kumagaya.image,
      ...Object.values(REGIONAL_CHARACTERS).map(character => character.image),
      ...Object.values(PREFECTURE_CHARACTERS).map(character => character.image),
      ...SUPPORT_CHARACTER_POOL
    ]);
    const assetResults = await Promise.all([...characterPaths].map(path => preloadImage(imageUrl(path))));
    report.assets.checked = assetResults.length;
    report.assets.failed = assetResults.filter(result => !result.ok);

    for (let index = 0; index < ranking.length; index += 1) {
      const item = ranking[index];
      renderComparison(kumagaya, item, ranking);
      inspectComparison(item.id, normalizePrefectureName(item.prefecture));
      report.visual.stationsChecked += 1;
      if (index % 60 === 59) await new Promise(resolve => requestAnimationFrame(resolve));
    }

    renderHeatRanking(ranking.slice(0, 10), kumagaya.temperature);
    renderCapitalTemperatureList(capitals);
    document.querySelectorAll(".ranking-card, .capital-card").forEach(card => {
      const backgroundUrl = inspectBackgroundUrl(card, "::before");
      const overflow = horizontalOverflow(card);
      const leaks = !["hidden", "clip"].includes(getComputedStyle(card).overflowX);
      if (!backgroundUrl || (overflow > 1 && leaks)) {
        recordVisualFailure({
          stationId: "",
          prefecture: card.querySelector("em, .capital-place b")?.textContent || "",
          failures: [
            ...(!backgroundUrl ? [{ code: "ranking-background-missing" }] : []),
            ...(overflow > 1 && leaks ? [{ code: "ranking-card-overflow", pixels: overflow }] : [])
          ]
        });
      }
    });

    renderAllTemperatureStations(ranking);
    while (!allStationsRendered) {
      appendAllTemperatureStationBatch();
      const cards = [...document.querySelectorAll(".all-station-card")];
      cards.forEach((card, index) => {
        const rankText = card.querySelector(".station-rank")?.textContent || "";
        const rank = Number.parseInt(rankText, 10);
        card.dataset.stationId = ranking[rank - 1]?.id || "";
      });
      inspectStationCards(cards);
      cards.forEach(card => card.remove());
      document.querySelector(".all-stations-load-more")?.remove();
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    clearRenderedAllTemperatureStations();

    const backgroundResults = await Promise.all([...backgroundUrls].map(url => preloadImage(url)));
    report.assets.backgroundsChecked = backgroundResults.length;
    report.assets.failed.push(...backgroundResults.filter(result => !result.ok));

    const longestLabelTarget = ranking.reduce((longest, item) => {
      const length = `${item.prefecture}${item.location}${item.point}`.length;
      return !longest || length > longest.length ? { item, length } : longest;
    }, null)?.item;
    if (longestLabelTarget) renderComparison(kumagaya, longestLabelTarget, ranking);

    const gallery = document.createElement("section");
    gallery.id = "qa-character-gallery";
    gallery.setAttribute("aria-label", "QA character gallery");
    gallery.innerHTML = `
      <style>
        #qa-character-gallery{position:relative;z-index:2000;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:24px;padding:18px;border-radius:22px;background:#eefdff}
        #qa-character-gallery article{min-width:0;overflow:hidden;border:1px solid #8bdce8;border-radius:18px;background:white}
        #qa-character-gallery .qa-photo{height:190px;overflow:hidden;background:#caeff4}
        #qa-character-gallery img{display:block;width:100%;height:100%;object-fit:cover;object-position:center}
        #qa-character-gallery b,#qa-character-gallery small{display:block;padding:5px 9px;overflow-wrap:anywhere}
        #qa-character-gallery small{padding-top:0;color:#477084}
      </style>
      ${Object.entries(PREFECTURE_CHARACTERS).map(([prefecture, character]) => `
        <article>
          <div class="qa-photo"><img src="${character.image}" alt=""></div>
          <b>${prefecture}</b><small>${character.name}</small>
        </article>`).join("")}`;
    document.body.appendChild(gallery);

    report.status = (
      report.data.errors.length ||
      report.assets.failed.length ||
      Object.keys(report.visual.failureCounts).length
    ) ? "failed" : "passed";
    report.finishedAt = new Date().toISOString();
    publish();
  }

  publish();
  runQa().catch(error => {
    report.status = "error";
    report.error = {
      name: error?.name || "Error",
      message: error?.message || String(error),
      stack: error?.stack || ""
    };
    report.finishedAt = new Date().toISOString();
    publish();
  });
})();

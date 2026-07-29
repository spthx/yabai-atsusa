(function () {
  "use strict";

  const cast = [
    { src: "assets/characters/kumagaya-anime.png", alt: "くまがや水分係" },
    { src: "assets/characters/pref-gunma.webp", alt: "湯煙あつね" },
    { src: "assets/characters/pref-toyama.webp", alt: "雪解みずは" },
    { src: "assets/characters/pref-niigata.webp", alt: "雲田みのり" },
    { src: "assets/characters/region-tohoku.webp", alt: "稲守ねむ" },
    { src: "assets/characters/region-hokkaido.webp", alt: "銀雪クール係" },
    { src: "assets/characters/region-kanto.webp", alt: "涼風ポニーテール" },
    { src: "assets/characters/region-kyushu.webp", alt: "南国クールダウン係" }
  ];

  const mainImage = document.querySelector("#hero-character-main");
  const sideImage = document.querySelector("#hero-character-side");
  const shuffleButton = document.querySelector("#shuffle-cast");
  let currentPair = [0, 1];

  function choosePair() {
    const candidates = cast.map((_, index) => index);
    const first = candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0];
    const second = candidates[Math.floor(Math.random() * candidates.length)];
    return [first, second];
  }

  function renderPair(pair) {
    const [first, second] = pair;
    mainImage.src = cast[first].src;
    mainImage.alt = cast[first].alt;
    sideImage.src = cast[second].src;
    sideImage.alt = cast[second].alt;
    currentPair = pair;
  }

  function shufflePair() {
    let nextPair = choosePair();
    while (nextPair[0] === currentPair[0] && nextPair[1] === currentPair[1]) {
      nextPair = choosePair();
    }
    renderPair(nextPair);
  }

  if (shuffleButton && mainImage && sideImage) {
    shuffleButton.addEventListener("click", shufflePair);
  }

  const revealTargets = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    revealTargets.forEach(function (target) { observer.observe(target); });
  } else {
    revealTargets.forEach(function (target) { target.classList.add("is-visible"); });
  }

  const mangaPages = document.querySelectorAll(".manga-page");
  const progressCurrent = document.querySelector("#reader-progress-current");
  if ("IntersectionObserver" in window && mangaPages.length) {
    const pageObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        mangaPages.forEach(function (page) { page.classList.remove("is-reading"); });
        entry.target.classList.add("is-reading");
        if (progressCurrent) progressCurrent.textContent = entry.target.dataset.page || "01";
      });
    }, { rootMargin: "-28% 0px -48% 0px", threshold: 0.05 });
    mangaPages.forEach(function (page) { pageObserver.observe(page); });
  } else if (mangaPages.length) {
    mangaPages[0].classList.add("is-reading");
  }
}());

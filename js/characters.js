const CHARACTER_REGISTRY = {
  kumagaya: { name: "くまがや灼熱くま", image: "assets/characters/kumagaya.svg", catchphrase: "基準点は まかせるクマ！" },
  default: { name: "ヤバいせ判定員", image: "assets/characters/default.svg", catchphrase: "この気温はヤバいせ！！" }
};

function getCharacterForStation(stationName) {
  return CHARACTER_REGISTRY[stationName] || CHARACTER_REGISTRY.default;
}

function prefectureMascotMarkup(prefecture, rank) {
  const colors = ["#f84e79", "#ff782b", "#ffbd25", "#55c4ff", "#a878ff", "#30d7ba", "#ff5aa7", "#7ce14b", "#ff9455", "#64a5ff"];
  const color = colors[(rank - 1) % colors.length];
  const shortName = prefecture.replace(/[都道府県]/g, "");
  return `<span class="prefecture-mascot" style="--mascot-color:${color}" aria-label="${prefecture}のオリジナルご当地マスコット"><svg viewBox="0 0 64 64" role="img" aria-hidden="true"><path d="M18 28 10 16l15 5L32 9l7 12 15-5-8 12v16c0 9-6 14-14 14s-14-5-14-14Z" fill="var(--mascot-color)" stroke="#fff" stroke-width="2"/><circle cx="25" cy="35" r="3" fill="#092041"/><circle cx="39" cy="35" r="3" fill="#092041"/><path d="M25 44q7 6 14 0" fill="none" stroke="#092041" stroke-width="3" stroke-linecap="round"/></svg><b>${shortName}</b></span>`;
}

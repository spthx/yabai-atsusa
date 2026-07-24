const CHARACTER_REGISTRY = {
  kumagaya: {
    region: "熊谷の案内役",
    name: "くまがや水分係",
    image: "assets/characters/kumagaya-anime.png",
    catchphrase: "ひと休みしていくクマ？",
    role: "熊谷の休憩案内",
    type: "BASE TYPE",
    skills: ["基準気温", "水分コール"],
    accent: "#39c8d7",
    focus: "50% 50%"
  }
};

const REGIONAL_CHARACTERS = {
  hokkaido: {
    region: "北海道の案内役",
    name: "北国の涼み案内",
    image: "assets/characters/region-hokkaido.webp",
    catchphrase: "冷たい水、用意してあるよ。",
    role: "北のひと涼み",
    type: "ICE TYPE",
    skills: ["冷気観測", "水分ストック"],
    accent: "#83e5ff",
    focus: "50% 50%"
  },
  tohoku: {
    region: "東北の案内役",
    name: "水辺の休憩案内",
    image: "assets/characters/region-tohoku.webp",
    catchphrase: "水分補給、忘れないでね。",
    role: "水辺の休憩案内",
    type: "WATER TYPE",
    skills: ["水温チェック", "休憩コール"],
    accent: "#ffd45c",
    focus: "50% 50%"
  },
  kanto: {
    region: "関東の案内役",
    name: "木陰サーチ係",
    image: "assets/characters/region-kanto.webp",
    catchphrase: "いちばん近い木陰、探そっか。",
    role: "街なかの木陰案内",
    type: "SHADE TYPE",
    skills: ["木陰サーチ", "街風レーダー"],
    accent: "#ff6f91",
    focus: "50% 50%"
  },
  chubu: {
    region: "中部の案内役",
    name: "山風ルート調査係",
    image: "assets/characters/region-chubu.webp",
    catchphrase: "涼しい山風、こっちだよ。",
    role: "山風ルート案内",
    type: "WIND TYPE",
    skills: ["山風キャッチ", "日陰ルート"],
    accent: "#6fdb8d",
    focus: "50% 50%"
  },
  kinki: {
    region: "近畿の案内役",
    name: "木陰ルート案内係",
    image: "assets/characters/region-kinki.webp",
    catchphrase: "急がず、木陰でひと休み。",
    role: "木陰ルート案内",
    type: "ROUTE TYPE",
    skills: ["木陰ナビ", "休憩ポイント"],
    accent: "#ff9f43",
    focus: "50% 50%"
  },
  chugoku: {
    region: "中国の案内役",
    name: "涼風ナビゲーター",
    image: "assets/characters/region-chugoku.webp",
    catchphrase: "風の通り道、見つけた！",
    role: "涼風ルート案内",
    type: "BREEZE TYPE",
    skills: ["涼風サーチ", "水辺ナビ"],
    accent: "#5ec8ff",
    focus: "50% 50%"
  },
  shikoku: {
    region: "四国の案内役",
    name: "打ち水サポーター",
    image: "assets/characters/region-shikoku.webp",
    catchphrase: "冷たい水で、ひと息つこう。",
    role: "打ち水と休憩案内",
    type: "SUN TYPE",
    skills: ["日差しセンサー", "照り返しチェック"],
    accent: "#ff6954",
    focus: "50% 50%"
  },
  kyushu: {
    region: "九州・沖縄の案内役",
    name: "南国クールダウン係",
    image: "assets/characters/region-kyushu.webp",
    catchphrase: "日陰で水分、ちゃんと取ろう。",
    role: "南国の休憩案内",
    type: "TROPICAL TYPE",
    skills: ["湿度レーダー", "水分タイマー"],
    accent: "#ff5ebc",
    focus: "50% 50%"
  }
};

const PREFECTURE_REGION_MAP = {
  hokkaido: ["北海道"],
  tohoku: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
  kanto: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
  chubu: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
  kinki: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
  chugoku: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
  shikoku: ["徳島県", "香川県", "愛媛県", "高知県"],
  kyushu: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"]
};

function normalizePrefectureName(prefecture = "") {
  const raw = String(prefecture);
  for (const prefectures of Object.values(PREFECTURE_REGION_MAP)) {
    const match = prefectures.find(name => raw.includes(name));
    if (match) return match;
  }
  return raw.split(/[・\s]/)[0] || "都道府県不明";
}

function getRegionKeyForPrefecture(prefecture) {
  const normalized = normalizePrefectureName(prefecture);
  return Object.entries(PREFECTURE_REGION_MAP)
    .find(([, prefectures]) => prefectures.includes(normalized))?.[0] || "kanto";
}

function getCharacterForPrefecture(prefecture) {
  return REGIONAL_CHARACTERS[getRegionKeyForPrefecture(prefecture)] || REGIONAL_CHARACTERS.kanto;
}

function getRegionalCharacterList() {
  return Object.values(REGIONAL_CHARACTERS);
}

function prefectureMascotMarkup(prefecture, rank) {
  const colors = ["#f84e79", "#ff782b", "#ffbd25", "#55c4ff", "#a878ff", "#30d7ba", "#ff5aa7", "#7ce14b", "#ff9455", "#64a5ff"];
  const color = colors[(rank - 1) % colors.length];
  const shortName = normalizePrefectureName(prefecture).replace(/[都道府県]/g, "");
  return `<span class="prefecture-mascot" style="--mascot-color:${color}" aria-label="${normalizePrefectureName(prefecture)}のオリジナルご当地マスコット"><svg viewBox="0 0 64 64" role="img" aria-hidden="true"><path d="M18 28 10 16l15 5L32 9l7 12 15-5-8 12v16c0 9-6 14-14 14s-14-5-14-14Z" fill="var(--mascot-color)" stroke="#fff" stroke-width="2"/><circle cx="25" cy="35" r="3" fill="#092041"/><circle cx="39" cy="35" r="3" fill="#092041"/><path d="M25 44q7 6 14 0" fill="none" stroke="#092041" stroke-width="3" stroke-linecap="round"/></svg><b>${shortName}</b></span>`;
}

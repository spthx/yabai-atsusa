const CHARACTER_REGISTRY = {
  kumagaya: {
    region: "熊谷代表",
    name: "くまがや灼熱くま",
    image: "assets/characters/kumagaya-anime.png",
    catchphrase: "基準点は まかせるクマ！",
    role: "絶対王者・熊谷",
    accent: "#ff3d62",
    focus: "50% 42%"
  }
};

const REGIONAL_CHARACTERS = {
  hokkaido: {
    region: "北海道代表",
    name: "北国の温度観測係",
    image: "assets/characters/region-hokkaido.webp",
    catchphrase: "25℃？ こっちはもう真夏だよ。",
    role: "北の温度観測",
    accent: "#83e5ff",
    focus: "50% 44%"
  },
  tohoku: {
    region: "東北代表",
    name: "水田の水温管理係",
    image: "assets/characters/region-tohoku.webp",
    catchphrase: "水温の変化、見逃さないよ。",
    role: "水田の水温管理",
    accent: "#ffd45c",
    focus: "50% 45%"
  },
  kanto: {
    region: "関東代表",
    name: "関東ヒート判定員",
    image: "assets/characters/default-anime.png",
    catchphrase: "関東の熱気、受けて立つ！",
    role: "都市熱の判定",
    accent: "#ff6f91",
    focus: "50% 45%"
  },
  chubu: {
    region: "中部代表",
    name: "山影ルート調査係",
    image: "assets/characters/region-chubu.webp",
    catchphrase: "日陰の逃げ道、こっち。",
    role: "山影ルート調査",
    accent: "#6fdb8d",
    focus: "50% 43%"
  },
  kinki: {
    region: "近畿代表",
    name: "木陰ルートランナー",
    image: "assets/characters/region-kinki.webp",
    catchphrase: "暑さも勢いで駆け抜ける！",
    role: "木陰ルート探索",
    accent: "#ff9f43",
    focus: "50% 44%"
  },
  chugoku: {
    region: "中国代表",
    name: "涼風ナビゲーター",
    image: "assets/characters/region-chugoku.webp",
    catchphrase: "風の通り道、見つけた！",
    role: "涼風ルート案内",
    accent: "#5ec8ff",
    focus: "50% 42%"
  },
  shikoku: {
    region: "四国代表",
    name: "照り返しファイター",
    image: "assets/characters/region-shikoku.webp",
    catchphrase: "照り返しごと勝負するよ！",
    role: "日差し迎撃",
    accent: "#ff6954",
    focus: "50% 42%"
  },
  kyushu: {
    region: "九州・沖縄代表",
    name: "南国ヒートランナー",
    image: "assets/characters/region-kyushu.webp",
    catchphrase: "この暑さ、まだまだ負けない！",
    role: "南国の暑さ耐久",
    accent: "#ff5ebc",
    focus: "50% 42%"
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

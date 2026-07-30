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
    region: "北海道",
    name: "銀雪クール係",
    image: "assets/characters/region-hokkaido.webp?v=20260726-pref1",
    catchphrase: "冷たいタオルで、ひと息つこう。",
    role: "冷却タオルと水分",
    type: "ICE TYPE",
    skills: ["冷却タオル", "水分ストック"],
    accent: "#83e5ff",
    focus: "50% 50%"
  },
  tohoku: {
    region: "東北",
    name: "水辺の休憩案内",
    image: "assets/characters/region-tohoku.webp?v=20260726-pref1",
    catchphrase: "無理しないで、少し休もう。",
    role: "木陰と休憩",
    type: "SHADE TYPE",
    skills: ["木陰サーチ", "休憩コール"],
    accent: "#ffd45c",
    focus: "50% 50%"
  },
  kanto: {
    region: "関東",
    name: "涼風ポニーテール",
    image: "assets/characters/region-kanto.webp?v=20260726-pref1",
    catchphrase: "日陰に入って、水を飲もっか。",
    role: "日陰と水分",
    type: "BREEZE TYPE",
    skills: ["涼風キャッチ", "水分チェック"],
    accent: "#ff6f91",
    focus: "50% 50%"
  },
  chubu: {
    region: "中部",
    name: "レモンウォーター係",
    image: "assets/characters/pref-niigata.webp?v=20260727-chubu2",
    catchphrase: "冷たい一杯、持ってきたよ！",
    role: "水分と外出対策",
    type: "CITRUS TYPE",
    skills: ["レモン水", "外出チェック"],
    accent: "#6fdb8d",
    focus: "50% 50%"
  },
  kinki: {
    region: "近畿",
    name: "木陰ドリンク係",
    image: "assets/characters/region-kinki.webp?v=20260726-pref1",
    catchphrase: "冷たいの、どうぞ。",
    role: "冷たい飲み物と木陰",
    type: "DRINK TYPE",
    skills: ["ドリンクシェア", "木陰ナビ"],
    accent: "#ff9f43",
    focus: "50% 50%"
  },
  chugoku: {
    region: "中国",
    name: "携帯クール係",
    image: "assets/characters/region-chugoku.webp?v=20260726-pref1",
    catchphrase: "風を送るね。水分も忘れずに。",
    role: "携帯扇風機と水分",
    type: "FAN TYPE",
    skills: ["ハンディファン", "水筒チェック"],
    accent: "#5ec8ff",
    focus: "50% 50%"
  },
  shikoku: {
    region: "四国",
    name: "打ち水サポーター",
    image: "assets/characters/region-shikoku.webp?v=20260726-pref1",
    catchphrase: "冷たい水で、ひと息つこう。",
    role: "打ち水と休憩案内",
    type: "SUN TYPE",
    skills: ["日差しセンサー", "照り返しチェック"],
    accent: "#ff6954",
    focus: "50% 50%"
  },
  kyushu: {
    region: "九州・沖縄",
    name: "南国クールダウン係",
    image: "assets/characters/region-kyushu.webp?v=20260726-pref1",
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

const PREFECTURE_CHARACTERS = {
  "北海道": {
    ...REGIONAL_CHARACTERS.hokkaido,
    region: "北海道",
    name: "銀雪クール係"
  },
  "青森県": {
    region: "青森県",
    name: "青空アイスブレイク",
    image: "assets/characters/pref-aomori.webp?v=20260728-unique1",
    catchphrase: "冷たいひと口のあとも、お水を忘れずに。",
    role: "冷却休憩と水分確認",
    type: "ICE POP TYPE",
    skills: ["アイス休憩", "水分チェック"],
    accent: "#ef6f70",
    focus: "50% 50%"
  },
  "岩手県": {
    region: "岩手県",
    name: "高原クールパック",
    image: "assets/characters/pref-iwate.webp?v=20260728-unique1",
    catchphrase: "冷やしたら、次はちゃんと飲もう。",
    role: "保冷パウチと屋外休憩",
    type: "OUTDOOR TYPE",
    skills: ["クールパウチ", "木陰サーチ"],
    accent: "#3aa9de",
    focus: "50% 50%"
  },
  "宮城県": {
    region: "宮城県",
    name: "木陰ファン係",
    image: "assets/characters/pref-miyagi.webp?v=20260728-unique1",
    catchphrase: "風に当たりながら、一口飲もっか。",
    role: "送風と木陰休憩",
    type: "FAN TYPE",
    skills: ["木陰ファン", "休憩コール"],
    accent: "#469bd2",
    focus: "50% 50%"
  },
  "秋田県": {
    ...REGIONAL_CHARACTERS.tohoku,
    region: "秋田県",
    name: "稲守ねむ",
    catchphrase: "ん……水がぬるい。先に休もう。",
    role: "木陰と水温チェック",
    type: "SHADE TYPE",
    skills: ["水温チェック", "菅笠の木陰"]
  },
  "山形県": {
    region: "山形県",
    name: "麦わらティー係",
    image: "assets/characters/pref-yamagata.webp?v=20260726-pref1",
    catchphrase: "冷たいお茶、持ってきたよ。",
    role: "冷茶と日差し対策",
    type: "TEA TYPE",
    skills: ["冷茶ボトル", "麦わら日陰"],
    accent: "#f0b63d",
    focus: "50% 50%"
  },
  "福島県": {
    region: "福島県",
    name: "先回りウォーター",
    image: "assets/characters/pref-fukushima.webp?v=20260728-unique2",
    catchphrase: "はい、お水。動く前に一口飲もう。",
    role: "外出前の水分補給",
    type: "WATER TYPE",
    skills: ["先回り給水", "外出チェック"],
    accent: "#6eaed5",
    focus: "50% 50%"
  },
  "茨城県": {
    region: "茨城県",
    name: "給水ランナー",
    image: "assets/characters/pref-ibaraki.webp?v=20260726-pref1",
    catchphrase: "一本飲んでから、行こっ！",
    role: "外出前の水分補給",
    type: "SPORT TYPE",
    skills: ["先回り給水", "外出チェック"],
    accent: "#ef5da8",
    focus: "50% 50%"
  },
  "栃木県": {
    region: "栃木県",
    name: "ピンク給水係",
    image: "assets/characters/pref-tochigi.webp?v=20260726-pref1",
    catchphrase: "はい、お水。元気なうちにね。",
    role: "こまめな水分補給",
    type: "POP TYPE",
    skills: ["ボトルパス", "元気チェック"],
    accent: "#ff7897",
    focus: "50% 50%"
  },
  "群馬県": {
    region: "群馬県",
    name: "湯煙あつね",
    image: "assets/characters/pref-gunma-v2.webp?v=20260731-cafe",
    catchphrase: "湯上がりこそ、まず一杯！",
    role: "湯上がりの水分補給",
    type: "SPA BREAK TYPE",
    skills: ["日陰休憩", "湯上がり給水"],
    accent: "#5c78b8",
    focus: "68% 38%"
  },
  "埼玉県": {
    ...CHARACTER_REGISTRY.kumagaya,
    region: "埼玉県",
    name: "くまがや水分係"
  },
  "千葉県": {
    region: "千葉県",
    name: "海風セーラー",
    image: "assets/characters/pref-chiba.webp?v=20260726-pref1",
    catchphrase: "帽子とお水、どっちも忘れずに。",
    role: "日差しと水分対策",
    type: "MARINE TYPE",
    skills: ["海風キャッチ", "ボトル確認"],
    accent: "#55b9ec",
    focus: "50% 50%"
  },
  "東京都": {
    region: "東京都",
    name: "宵涼みウォーター",
    image: "assets/characters/pref-tokyo.webp?v=20260726-pref1",
    catchphrase: "夕方でも油断せず、一口どうぞ。",
    role: "夕方の水分案内",
    type: "NIGHT TYPE",
    skills: ["宵涼み", "給水リマインド"],
    accent: "#5958b8",
    focus: "50% 50%"
  },
  "神奈川県": {
    ...REGIONAL_CHARACTERS.kanto,
    region: "神奈川県",
    name: "涼風ポニーテール"
  },
  "新潟県": {
    region: "新潟県",
    name: "雲田みのり",
    image: "assets/characters/pref-niigata.webp?v=20260726-pref1",
    catchphrase: "日差しを避けて、先に飲もう。",
    role: "帽子と水分補給",
    type: "SKY TYPE",
    skills: ["麦わらシェード", "先飲みボトル"],
    accent: "#9c7bd8",
    focus: "50% 50%"
  },
  "富山県": {
    region: "富山県",
    name: "雪解みずは",
    image: "assets/characters/pref-toyama.webp?v=20260726-pref1",
    catchphrase: "冷たい一杯で、山道もひと休み。",
    role: "涼所と水分補給",
    type: "ALPINE TYPE",
    skills: ["雪解け給水", "涼所サーチ"],
    accent: "#70b8dc",
    focus: "50% 50%"
  },
  "石川県": {
    region: "石川県",
    name: "加賀しずく係",
    image: "assets/characters/default-anime.png?v=20260731-ishikawa1",
    catchphrase: "海風の前に、冷たい一杯を。",
    role: "海辺の給水案内",
    type: "NOTO BLUE TYPE",
    skills: ["海風ボトル", "木陰休憩"],
    accent: "#2f9ed8",
    focus: "50% 42%"
  },
  "福井県": {
    region: "福井県",
    name: "青空パラソル",
    image: "assets/characters/pref-fukui.webp?v=20260728-unique1",
    catchphrase: "日差しを避けて、涼しい場所で飲もう。",
    role: "日傘と日差し対策",
    type: "PARASOL TYPE",
    skills: ["透明パラソル", "日陰ルート"],
    accent: "#5b9bd5",
    focus: "50% 50%"
  },
  "山梨県": {
    region: "山梨県",
    name: "麦わら給水係",
    image: "assets/characters/pref-yamanashi.webp?v=20260726-pref1",
    catchphrase: "木陰で冷たい一杯、どうぞ。",
    role: "木陰と冷水",
    type: "SHADE TYPE",
    skills: ["麦わらシェード", "冷水フラスク"],
    accent: "#4db9bd",
    focus: "50% 50%"
  },
  "長野県": {
    region: "長野県",
    name: "山風ハンディファン",
    image: "assets/characters/pref-nagano.webp?v=20260726-pref1",
    catchphrase: "風を送るね。飲み物も忘れずに。",
    role: "送風と休憩",
    type: "BREEZE TYPE",
    skills: ["ハンディファン", "休憩コール"],
    accent: "#61b58d",
    focus: "50% 50%"
  },
  "岐阜県": {
    region: "岐阜県",
    name: "清流クールファン",
    image: "assets/characters/pref-gifu.webp?v=20260730-fill1",
    catchphrase: "風に当たりながら、冷たい水を一口。",
    role: "送風とこまめな給水",
    type: "RIVER BREEZE TYPE",
    skills: ["ハンディファン", "清流ボトル"],
    accent: "#4e9fd0",
    focus: "50% 42%"
  },
  "静岡県": {
    region: "静岡県",
    name: "プールサイド給水",
    image: "assets/characters/pref-shizuoka.webp?v=20260726-pref1",
    catchphrase: "泳いだあとも、ちゃんと飲もう。",
    role: "運動後の水分補給",
    type: "SWIM TYPE",
    skills: ["運動後給水", "体調チェック"],
    accent: "#45aee3",
    focus: "50% 50%"
  },
  "愛知県": {
    region: "愛知県",
    name: "喫茶ひと休み係",
    image: "assets/characters/pref-aichi-v2.webp?v=20260731-cafe",
    catchphrase: "涼しい店内で、ゆっくり一杯。",
    role: "喫茶店での給水休憩",
    type: "KISSA BREAK TYPE",
    skills: ["店内クールダウン", "休憩ドリンク"],
    accent: "#69aebb",
    focus: "57% 36%"
  },
  "三重県": {
    region: "三重県",
    name: "白日傘ウォーター",
    image: "assets/characters/pref-mie.webp?v=20260730-fill1",
    catchphrase: "日傘の下で、先に水分をとろう。",
    role: "日差し対策と給水",
    type: "PARASOL TYPE",
    skills: ["白日傘", "木陰ボトル"],
    accent: "#8d8bd7",
    focus: "50% 42%"
  },
  "滋賀県": {
    region: "滋賀県",
    name: "湖風ウォーター",
    image: "assets/characters/pref-shiga.webp?v=20260726-pref1",
    catchphrase: "涼しい場所で、一杯飲もう。",
    role: "水辺の休憩案内",
    type: "LAKE TYPE",
    skills: ["湖風クール", "給水タイム"],
    accent: "#63d6b2",
    focus: "50% 50%"
  },
  "京都府": {
    region: "京都府",
    name: "夕涼み給水",
    image: "assets/characters/pref-kyoto.webp?v=20260726-pref1",
    catchphrase: "日が傾いても、水分は忘れずに。",
    role: "夕方の水分案内",
    type: "EVENING TYPE",
    skills: ["夕涼み", "冷茶ボトル"],
    accent: "#7180d6",
    focus: "50% 50%"
  },
  "大阪府": {
    region: "大阪府",
    name: "パステルドリンク",
    image: "assets/characters/pref-osaka.webp?v=20260728-unique2",
    catchphrase: "冷たいドリンク、いっしょに飲も！",
    role: "街歩きの水分補給",
    type: "POP DRINK TYPE",
    skills: ["ドリンクシェア", "街中休憩"],
    accent: "#ef79bd",
    focus: "50% 50%"
  },
  "兵庫県": {
    region: "兵庫県",
    name: "青風タオル係",
    image: "assets/characters/pref-hyogo.webp?v=20260730-fill1",
    catchphrase: "汗を拭いたら、もう一口飲んで。",
    role: "タオル休憩と水分補給",
    type: "TOWEL TYPE",
    skills: ["クールタオル", "ボトル確認"],
    accent: "#4e9fd0",
    focus: "50% 42%"
  },
  "奈良県": {
    region: "奈良県",
    name: "紫陽花クール係",
    image: "assets/characters/pref-nara.webp?v=20260726-pref1",
    catchphrase: "慌てず、ここで一口飲んで。",
    role: "水分と休憩案内",
    type: "FLOWER TYPE",
    skills: ["ボトルパス", "木陰ナビ"],
    accent: "#a978d2",
    focus: "50% 50%"
  },
  "和歌山県": {
    ...REGIONAL_CHARACTERS.kinki,
    region: "和歌山県",
    name: "木陰ドリンク係"
  },
  "鳥取県": {
    region: "鳥取県",
    name: "砂丘シェード係",
    image: "assets/characters/pref-tottori.webp?v=20260730-fill1",
    catchphrase: "帽子をかぶって、乾く前に飲もう。",
    role: "日差し対策と給水",
    type: "SUN HAT TYPE",
    skills: ["白帽子", "給水コール"],
    accent: "#6aaed7",
    focus: "50% 40%"
  },
  "島根県": {
    region: "島根県",
    name: "縁涼みドリンク",
    image: "assets/characters/pref-shimane.webp?v=20260730-fill1",
    catchphrase: "木陰でゆっくり、ひと口どうぞ。",
    role: "木陰休憩と水分補給",
    type: "SHADE TYPE",
    skills: ["木陰休憩", "ボトルタイム"],
    accent: "#d98285",
    focus: "50% 42%"
  },
  "岡山県": {
    region: "岡山県",
    name: "晴れ空ボトル係",
    image: "assets/characters/pref-okayama.webp?v=20260730-fill1",
    catchphrase: "晴れの日こそ、早めに飲んでおこう。",
    role: "晴天時の水分補給",
    type: "SUNNY TYPE",
    skills: ["麦わらシェード", "先回り給水"],
    accent: "#e3b55f",
    focus: "50% 42%"
  },
  "広島県": {
    ...REGIONAL_CHARACTERS.chugoku,
    region: "広島県",
    name: "携帯クール係"
  },
  "山口県": {
    region: "山口県",
    name: "木陰うちわ係",
    image: "assets/characters/pref-yamaguchi.webp?v=20260730-fill1",
    catchphrase: "風を作って、涼しい場所で飲もう。",
    role: "送風と木陰休憩",
    type: "FAN TYPE",
    skills: ["折りたたみ扇", "木陰ナビ"],
    accent: "#65b7a0",
    focus: "50% 42%"
  },
  "徳島県": {
    region: "徳島県",
    name: "桃風クールタオル",
    image: "assets/characters/pref-tokushima.webp?v=20260730-fill1",
    catchphrase: "汗を拭いて、水分もしっかりね。",
    role: "クールタオルと給水",
    type: "COOL TOWEL TYPE",
    skills: ["タオルクール", "給水チェック"],
    accent: "#ea8f9d",
    focus: "50% 42%"
  },
  "香川県": {
    region: "香川県",
    name: "ひまわり日差し係",
    image: "assets/characters/pref-kagawa.webp?v=20260728-unique2",
    catchphrase: "日差しを避けて、お水も忘れずに。",
    role: "日差し対策と給水案内",
    type: "SUNFLOWER TYPE",
    skills: ["日差しシェード", "給水コール"],
    accent: "#e7ad38",
    focus: "50% 50%"
  },
  "愛媛県": {
    region: "愛媛県",
    name: "柑橘ブリーズ係",
    image: "assets/characters/pref-ehime.webp?v=20260730-fill1",
    catchphrase: "風に当たりながら、冷たい一口を。",
    role: "送風と冷水休憩",
    type: "CITRUS BREEZE TYPE",
    skills: ["ハンディファン", "冷水ボトル"],
    accent: "#b69cd6",
    focus: "50% 42%"
  },
  "高知県": {
    ...REGIONAL_CHARACTERS.shikoku,
    region: "高知県",
    name: "打ち水サポーター"
  },
  "福岡県": {
    region: "福岡県",
    name: "海風クールウォーター",
    image: "assets/characters/pref-fukuoka.webp?v=20260731-kyushu",
    catchphrase: "海風の下で、冷たい一口を。",
    role: "海辺の給水休憩",
    type: "SEASIDE TYPE",
    skills: ["海風休憩", "冷水ボトル"],
    accent: "#46b9d8",
    focus: "50% 46%"
  },
  "佐賀県": {
    region: "佐賀県",
    name: "干潟ブリーズティー",
    image: "assets/characters/pref-saga.webp?v=20260731-kyushu",
    catchphrase: "水辺を眺めて、ゆっくり休もう。",
    role: "水辺の麦茶休憩",
    type: "TIDAL FLAT TYPE",
    skills: ["木道休憩", "麦茶タイム"],
    accent: "#62c6bc",
    focus: "50% 33%"
  },
  "長崎県": {
    region: "長崎県",
    name: "港町クールグラス",
    image: "assets/characters/pref-nagasaki.webp?v=20260731-kyushu",
    catchphrase: "港を眺めて、ひと涼み。",
    role: "港辺の給水休憩",
    type: "HARBOR CAFE TYPE",
    skills: ["海風テラス", "冷水グラス"],
    accent: "#577dc2",
    focus: "39% 36%"
  },
  "熊本県": {
    region: "熊本県",
    name: "渓流ひと休み係",
    image: "assets/characters/pref-kumamoto.webp?v=20260731-kyushu",
    catchphrase: "清流のそばで、体を休めよう。",
    role: "渓流の休憩案内",
    type: "GORGE TYPE",
    skills: ["清流クール", "座って休憩"],
    accent: "#3d8c80",
    focus: "44% 40%"
  },
  "大分県": {
    region: "大分県",
    name: "湧水プール休憩係",
    image: "assets/characters/pref-oita.webp?v=20260731-kyushu",
    catchphrase: "日傘の下で、先に水分を。",
    role: "日傘と給水休憩",
    type: "SPRING POOL TYPE",
    skills: ["日傘シェード", "プールサイド給水"],
    accent: "#6ecbc7",
    focus: "45% 39%"
  },
  "宮崎県": {
    region: "宮崎県",
    name: "渓谷ミスト案内",
    image: "assets/characters/pref-miyazaki.webp?v=20260731-kyushu",
    catchphrase: "滝の涼しさで、ゆっくりひと息。",
    role: "渓谷の涼み休憩",
    type: "WATERFALL TYPE",
    skills: ["滝ミスト", "木陰休憩"],
    accent: "#4ca5a9",
    focus: "63% 34%"
  },
  "鹿児島県": {
    ...REGIONAL_CHARACTERS.kyushu,
    region: "鹿児島県",
    name: "南国クールダウン係"
  },
  "沖縄県": {
    region: "沖縄県",
    name: "プールサイド休憩係",
    image: "assets/characters/pref-okinawa.webp?v=20260726-pref1",
    catchphrase: "遊ぶ前にも、お水を一口。",
    role: "レジャー前の水分補給",
    type: "POOL TYPE",
    skills: ["レジャー前給水", "日陰チェック"],
    accent: "#55c6ec",
    focus: "50% 50%"
  }
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
  const normalized = normalizePrefectureName(prefecture);
  return PREFECTURE_CHARACTERS[normalized]
    || REGIONAL_CHARACTERS[getRegionKeyForPrefecture(normalized)]
    || REGIONAL_CHARACTERS.kanto;
}

function hasPrefectureCharacter(prefecture) {
  return Object.hasOwn(PREFECTURE_CHARACTERS, normalizePrefectureName(prefecture));
}

function getAssignedPrefectureCharacterCount() {
  return Object.keys(PREFECTURE_CHARACTERS).length;
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

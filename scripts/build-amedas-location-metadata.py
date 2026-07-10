"""気象庁の観測所一覧から、公開サイト用の地点行政区域データを生成する。"""
import csv
import io
import json
import re
import urllib.request
import zipfile
from pathlib import Path

SOURCE_URL = "https://www.jma.go.jp/jma/kishou/know/amedas/ame_master.zip"
OUTPUT_PATH = Path(__file__).parents[1] / "js" / "locations.js"

PREFECTURE_RANGES = [
    (10000, 29999, "北海道"), (31000, 31999, "青森県"), (32000, 32999, "秋田県"),
    (33000, 33999, "岩手県"), (34000, 34999, "宮城県"), (35000, 35999, "山形県"),
    (36000, 36999, "福島県"), (40000, 40999, "茨城県"), (41000, 41999, "栃木県"),
    (42000, 42999, "群馬県"), (43000, 43999, "埼玉県"), (44000, 44999, "東京都"),
    (45000, 45999, "千葉県"), (46000, 46999, "神奈川県"), (48000, 48999, "長野県"),
    (49000, 49999, "山梨県"), (50000, 50999, "静岡県"), (51000, 51999, "愛知県"),
    (52000, 52999, "岐阜県"), (53000, 53999, "三重県"), (54000, 54999, "新潟県"),
    (55000, 55999, "富山県"), (56000, 56999, "石川県"), (57000, 57999, "福井県"),
    (60000, 60999, "滋賀県"), (61000, 61999, "京都府"), (62000, 62999, "大阪府"),
    (63000, 63999, "兵庫県"), (64000, 64999, "奈良県"), (65000, 65999, "和歌山県"),
    (66000, 66999, "岡山県"), (67000, 67999, "広島県"), (68000, 68999, "島根県"),
    (69000, 69999, "鳥取県"), (71000, 71999, "徳島県"), (72000, 72999, "香川県"),
    (73000, 73999, "愛媛県"), (74000, 74999, "高知県"), (81000, 81999, "山口県"),
    (82000, 82999, "福岡県"), (83000, 83999, "大分県"), (84000, 84999, "長崎県"),
    (85000, 85999, "佐賀県"), (86000, 86999, "熊本県"), (87000, 87999, "宮崎県"),
    (88000, 88999, "鹿児島県"), (91000, 94999, "沖縄県")
]

def prefecture_for(station_id):
    return next((name for start, end, name in PREFECTURE_RANGES if start <= station_id <= end), "所在地不明")

def municipality_from(address):
    match = re.search(r"[一-龥々ヶぁ-んァ-ヴー]+?(?:市|区|町|村)", address)
    return match.group(0) if match else address

archive = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(SOURCE_URL).read()))
csv_name = next(name for name in archive.namelist() if name.endswith(".csv"))
rows = csv.reader(io.TextIOWrapper(archive.open(csv_name), encoding="cp932"))
next(rows)
metadata = {}
for row in rows:
    station_id = int(row[1])
    metadata[str(station_id)] = {
        "prefecture": prefecture_for(station_id),
        "municipality": municipality_from(row[6]),
        "point": row[3]
    }

OUTPUT_PATH.write_text(
    "// 気象庁『地域気象観測所一覧』を加工して作成。更新は scripts/build-amedas-location-metadata.py を実行。\n"
    f"const AMEDAS_LOCATION_METADATA = {json.dumps(metadata, ensure_ascii=False, separators=(',', ':'))};\n",
    encoding="utf-8"
)

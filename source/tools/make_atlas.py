#!/usr/bin/env python3
"""World atlas data for the «أطلس العالم» app.

Inputs (public domain / MIT, kept in data/atlas/):
  ne/   Natural Earth 1:50m countries + 1:110m physical layers (naturalearthdata.com, public domain)
  flags/ country flags from lipis/flag-icons (MIT)

The map follows Saudi Arabia's point of view as published by Natural Earth (field ADM0_A3_SA):
the land of Israel is shown and taught as Palestine, Western Sahara as Morocco, Somaliland as Somalia,
Northern Cyprus as Cyprus. Countries to learn: UN members + Palestine + Vatican + Kosovo (recognised by Saudi Arabia).

Outputs:
  src/apps/atlas/data.js      names, capitals, continents, packs (inlined in index.html, small)
  dist/assets/atlas/world.js  map shapes as SVG paths (loaded when the app opens)
  dist/assets/flags/*.svg     flags of the countries taught

The projection is Equal Earth (areas look right). Coordinates are rounded to a 0.2-unit grid on a 1000-unit-wide map;
merged countries (Palestine, Morocco, ...) are joined by cancelling their shared edges, so no inner border shows.
"""
import json, math, os, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(HERE)
NE = os.path.join(SRC, 'data', 'atlas', 'ne')
FLAGS = os.path.join(SRC, 'data', 'atlas', 'flags')
OUT_JS = os.path.join(SRC, 'src', 'apps', 'atlas', 'data.js')
OUT_GEO = os.path.join(SRC, 'dist', 'assets', 'atlas')
OUT_FLAGS = os.path.join(SRC, 'dist', 'assets', 'flags')

# ---------- projection: Robinson (the familiar classroom world map: shapes and sizes both look right) ----------
RX = [1.0000, 0.9986, 0.9954, 0.9900, 0.9822, 0.9730, 0.9600, 0.9427, 0.9216, 0.8962, 0.8679, 0.8350, 0.7986, 0.7597, 0.7186, 0.6732, 0.6213, 0.5722, 0.5322]
RY = [0.0000, 0.0620, 0.1240, 0.1860, 0.2480, 0.3100, 0.3720, 0.4340, 0.4958, 0.5571, 0.6176, 0.6769, 0.7346, 0.7903, 0.8435, 0.8936, 0.9394, 0.9761, 1.0000]
S = 160.0           # scale: the map is about 1000 x 500 units
Q = 12              # grid: 1/Q unit (about 0.08 units: sharp even when zoomed in on Bahrain or Lebanon)
def _interp(tab, a):
    i = min(int(a / 5), 17); f = (a - i * 5) / 5
    # cubic (Catmull-Rom) interpolation through the table, so coastlines bend smoothly
    p0, p1, p2, p3 = tab[max(i - 1, 0)], tab[i], tab[i + 1], tab[min(i + 2, 18)]
    return p1 + 0.5 * f * (p2 - p0 + f * (2 * p0 - 5 * p1 + 4 * p2 - p3 + f * (3 * (p1 - p2) + p3 - p0)))
def proj(lon, lat):
    a = min(abs(lat), 90.0)
    x = 0.8487 * _interp(RX, a) * math.radians(lon) * S
    y = 1.3523 * _interp(RY, a) * (1 if lat >= 0 else -1) * S
    return x, -y
X0, Y0 = proj(-180, 0)[0], proj(0, 90)[1]     # shift so the map starts at 0,0
W, H = round(-2 * X0), round(-2 * Y0)
def P(lon, lat):
    x, y = proj(lon, lat)
    return (round((x - X0) * Q), round((y - Y0) * Q))   # integer grid units
def pt(lon, lat):
    x, y = P(lon, lat); return [round(x / Q, 2), round(y / Q, 2)]

def rings_of(geom):
    if geom['type'] == 'Polygon': return [r for r in geom['coordinates']]
    if geom['type'] == 'MultiPolygon': return [r for poly in geom['coordinates'] for r in poly]
    return []
def qring(r):
    out = []
    for lon, lat in r:
        p = P(lon, lat)
        if not out or out[-1] != p: out.append(p)
    if len(out) > 1 and out[0] == out[-1]: out.pop()
    return out if len(out) >= 3 else None

def union(rings):
    """join edge-adjacent rings by cancelling shared edges (same vertices, opposite directions), then re-chain"""
    edges = {}
    for r in rings:
        for i in range(len(r)):
            a, b = r[i], r[(i + 1) % len(r)]
            if (b, a) in edges:
                edges[(b, a)] -= 1
                if not edges[(b, a)]: del edges[(b, a)]
            else: edges[(a, b)] = edges.get((a, b), 0) + 1
    nxt = {}
    for (a, b), n in edges.items():
        for _ in range(n): nxt.setdefault(a, []).append(b)
    out = []
    while nxt:
        a = next(iter(nxt)); ring = [a]; cur = a
        while True:
            lst = nxt.get(cur)
            if not lst: break
            b = lst.pop()
            if not lst: del nxt[cur]
            if b == a: break
            ring.append(b); cur = b
        if len(ring) >= 3: out.append(ring)
    return out

def graticule():
    """faint latitude/longitude lines every 30 degrees, and the outline of the world"""
    out = []
    for lat in range(-60, 61, 30): out.append(line_path([(lon, lat) for lon in range(-180, 181, 5)]))
    for lon in range(-150, 151, 30): out.append(line_path([(lon, lat) for lat in range(-90, 91, 5)]))
    edge = [(-180, lat) for lat in range(-90, 91, 5)] + [(180, lat) for lat in range(90, -91, -5)]
    return ''.join(out), path([[P(lon, lat) for lon, lat in edge]])

def path(rings):
    """SVG path with relative moves; numbers in 1/Q units divided back to map units with one decimal"""
    s = []
    for r in rings:
        px, py = r[0]; s.append('M%s %s' % (fmt(px), fmt(py)))
        seg = []
        for x, y in r[1:]:
            seg.append('%s %s' % (fmt(x - px), fmt(y - py))); px, py = x, y
        s.append('l' + ' '.join(seg).replace(' -', '-') + 'z')
    return ''.join(s)
def fmt(v):
    v = v / Q
    t = ('%.2f' % v).rstrip('0').rstrip('.')
    if t.startswith('0.'): t = t[1:]
    elif t.startswith('-0.'): t = '-' + t[2:]
    return t or '0'
def line_path(coords):
    pts = []
    for lon, lat in coords:
        p = P(lon, lat)
        if not pts or pts[-1] != p: pts.append(p)
    return path_open(pts)
def path_open(r):
    px, py = r[0]; seg = []
    for x, y in r[1:]: seg.append('%s %s' % (fmt(x - px), fmt(y - py))); px, py = x, y
    return 'M%s %sl' % (fmt(r[0][0]), fmt(r[0][1])) + ' '.join(seg).replace(' -', '-')
def bbox(rings):
    xs = [x for r in rings for x, _ in r]; ys = [y for r in rings for _, y in r]
    return [round(min(xs) / Q, 1), round(min(ys) / Q, 1), round(max(xs) / Q, 1), round(max(ys) / Q, 1)]
def ring_area(r):
    return abs(sum(r[i][0] * r[(i + 1) % len(r)][1] - r[(i + 1) % len(r)][0] * r[i][1] for i in range(len(r)))) / 2 / Q / Q

# ---------- curated facts ----------
CONT_AR = {'AS': 'آسيا', 'AF': 'إفريقيا', 'EU': 'أوروبا', 'NA': 'أمريكا الشمالية', 'SA': 'أمريكا الجنوبية', 'OC': 'أوقيانوسيا', 'AN': 'القارة القطبية الجنوبية'}
CONT_EN = {'AS': 'Asia', 'AF': 'Africa', 'EU': 'Europe', 'NA': 'North America', 'SA': 'South America', 'OC': 'Oceania', 'AN': 'Antarctica'}
NE_CONT = {'Asia': 'AS', 'Africa': 'AF', 'Europe': 'EU', 'North America': 'NA', 'South America': 'SA', 'Oceania': 'OC', 'Antarctica': 'AN'}
CONT_FIX = {'MDV': 'AS', 'MUS': 'AF', 'SYC': 'AF'}
ARAB = 'SAU ARE KWT QAT BHR OMN YEM IRQ SYR JOR LBN PSX EGY SDN LBY TUN DZA MAR MRT SOM DJI COM'.split()
EXTRA = {'PSX', 'KOS'}               # learned although not marked "sovereign" in the data
NOT_TAUGHT = {'TWN'}
NAME_FIX = {'IRL': 'أيرلندا', 'OMN': 'عُمان', 'ARE': 'الإمارات', 'FSM': 'ميكرونيسيا', 'MWI': 'ملاوي', 'ZAF': 'جنوب إفريقيا',
            'CAF': 'إفريقيا الوسطى', 'COD': 'الكونغو الديمقراطية', 'COG': 'الكونغو', 'SAU': 'المملكة العربية السعودية', 'GBR': 'المملكة المتحدة',
            'USA': 'الولايات المتحدة الأمريكية', 'DOM': 'الدومينيكان', 'TLS': 'تيمور الشرقية', 'SWZ': 'إسواتيني', 'NLD': 'هولندا', 'CZE': 'التشيك'}
EN_FIX = {'PSX': 'Palestine', 'USA': 'United States', 'COD': 'DR Congo', 'CAF': 'Central African Republic', 'BIH': 'Bosnia and Herzegovina',
          'DOM': 'Dominican Republic', 'GNQ': 'Equatorial Guinea', 'SDS': 'South Sudan', 'ATG': 'Antigua and Barbuda', 'VCT': 'Saint Vincent and the Grenadines',
          'KNA': 'Saint Kitts and Nevis', 'MHL': 'Marshall Islands', 'SLB': 'Solomon Islands', 'SWZ': 'Eswatini'}
# capital fixes: (Arabic, English, lon, lat); everything else comes from Natural Earth's populated places
CAP_FIX = {
    'PSX': ('القدس', 'Jerusalem', 35.21, 31.78), 'SDS': ('جوبا', 'Juba', 31.58, 4.85), 'TZA': ('دودوما', 'Dodoma', 35.74, -6.17),
    'NRU': ('يارين', 'Yaren', 166.92, -0.55), 'BEN': ('بورتو نوفو', 'Porto-Novo', 2.63, 6.5), 'KAZ': ('أستانا', 'Astana', 71.45, 51.17),
    'PLW': ('نغيرولمود', 'Ngerulmud', 134.62, 7.5), 'CIV': ('ياموسوكرو', 'Yamoussoukro', -5.28, 6.82), 'ZAF': ('بريتوريا', 'Pretoria', 28.19, -25.75),
    'BOL': ('سوكري', 'Sucre', -65.26, -19.04), 'TUN': ('تونس', 'Tunis', 10.18, 36.81), 'BEL': ('بروكسل', 'Brussels', 4.35, 50.85),
    'LUX': ('لوكسمبورغ', 'Luxembourg', 6.13, 49.61), 'SMR': ('سان مارينو', 'San Marino', 12.45, 43.94), 'MKD': ('سكوبيه', 'Skopje', 21.43, 42.0),
    'KOR': ('سيول', 'Seoul', 126.98, 37.57), 'GTM': ('غواتيمالا', 'Guatemala City', -90.51, 14.63), 'MEX': ('مكسيكو', 'Mexico City', -99.13, 19.43),
    'PAN': ('بنما', 'Panama City', -79.52, 8.98), 'KWT': ('الكويت', 'Kuwait City', 47.98, 29.37), 'DNK': ('كوبنهاغن', 'Copenhagen', 12.57, 55.68),
    'USA': ('واشنطن', 'Washington, D.C.', -77.04, 38.9), 'AND': ('أندورا لا فيلا', 'Andorra la Vella', 1.52, 42.51), 'KIR': ('تاراوا', 'Tarawa', 173.0, 1.33),
    'LKA': ('كولومبو', 'Colombo', 79.86, 6.93), 'JOR': ('عمّان', 'Amman', 35.93, 31.95), 'LIE': ('فادوز', 'Vaduz', 9.52, 47.14),
    'MCO': ('موناكو', 'Monaco', 7.42, 43.74), 'VAT': ('الفاتيكان', 'Vatican City', 12.45, 41.9), 'SGP': ('سنغافورة', 'Singapore', 103.85, 1.29),
    'DJI': ('جيبوتي', 'Djibouti', 43.15, 11.59), 'NLD': ('أمستردام', 'Amsterdam', 4.9, 52.37), 'SWZ': ('مبابان', 'Mbabane', 31.13, -26.31),
    'MDA': ('كيشيناو', 'Chisinau', 28.86, 47.01), 'TCD': ('نجامينا', "N'Djamena", 15.04, 12.11),
}
# tiny countries missing at this scale: drawn as a dot
MICRO = [('VAT', 'الفاتيكان', 'Vatican City', 'EU', 'va', 12.453, 41.904, ('الفاتيكان', 'Vatican City', 12.453, 41.904)),
         ('NRU', 'ناورو', 'Nauru', 'OC', 'nr', 166.93, -0.53, ('يارين', 'Yaren', 166.92, -0.55))]
# packs: from near to far ("expanding horizons"); each country belongs to one pack
PACKS = [
    ('gulf', 'شبه الجزيرة العربية', 'Arabian Peninsula', '🐪', ['SAU', 'ARE', 'KWT', 'QAT', 'BHR', 'OMN', 'YEM']),
    ('levant', 'الشام والعراق', 'Levant and Iraq', '🌿', ['IRQ', 'SYR', 'JOR', 'LBN', 'PSX']),
    ('arabaf', 'الوطن العربي في إفريقيا', 'Arab Africa', '🏜️', ['EGY', 'SDN', 'LBY', 'TUN', 'DZA', 'MAR', 'MRT', 'SOM', 'DJI', 'COM']),
    ('wasia', 'غرب آسيا ووسطها', 'West and Central Asia', '⛰️', ['TUR', 'IRN', 'AFG', 'PAK', 'CYP', 'GEO', 'ARM', 'AZE', 'KAZ', 'UZB', 'TKM', 'KGZ', 'TJK']),
    ('sasia', 'جنوب آسيا وشرقها', 'South and East Asia', '🏯', ['IND', 'BGD', 'NPL', 'BTN', 'LKA', 'MDV', 'CHN', 'MNG', 'JPN', 'KOR', 'PRK']),
    ('seasia', 'جنوب شرق آسيا', 'Southeast Asia', '🌴', ['MMR', 'THA', 'LAO', 'KHM', 'VNM', 'MYS', 'SGP', 'IDN', 'BRN', 'PHL', 'TLS']),
    ('afw', 'غرب إفريقيا', 'West Africa', '🥁', ['SEN', 'GMB', 'GNB', 'GIN', 'SLE', 'LBR', 'CIV', 'GHA', 'TGO', 'BEN', 'NGA', 'NER', 'MLI', 'BFA', 'CPV']),
    ('afc', 'وسط إفريقيا وشرقها', 'Central and East Africa', '🦁', ['TCD', 'CMR', 'CAF', 'GNQ', 'GAB', 'COG', 'COD', 'STP', 'SDS', 'ETH', 'ERI', 'KEN', 'UGA', 'RWA', 'BDI', 'TZA', 'SYC']),
    ('afs', 'جنوب إفريقيا', 'Southern Africa', '🦓', ['AGO', 'ZMB', 'MWI', 'MOZ', 'ZWE', 'BWA', 'NAM', 'ZAF', 'LSO', 'SWZ', 'MDG', 'MUS']),
    ('euw', 'غرب أوروبا', 'Western Europe', '🏰', ['GBR', 'IRL', 'FRA', 'ESP', 'PRT', 'BEL', 'NLD', 'LUX', 'DEU', 'CHE', 'AUT', 'ITA', 'MCO', 'LIE', 'AND', 'SMR', 'VAT', 'MLT']),
    ('eun', 'شمال أوروبا وشرقها', 'Northern and Eastern Europe', '❄️', ['ISL', 'NOR', 'SWE', 'FIN', 'DNK', 'EST', 'LVA', 'LTU', 'POL', 'CZE', 'SVK', 'HUN', 'ROU', 'BGR', 'UKR', 'BLR', 'MDA', 'RUS']),
    ('eus', 'البلقان', 'The Balkans', '🏛️', ['GRC', 'ALB', 'MKD', 'SRB', 'MNE', 'BIH', 'HRV', 'SVN', 'KOS']),
    ('nam', 'أمريكا الشمالية والوسطى', 'North and Central America', '🦅', ['CAN', 'USA', 'MEX', 'GTM', 'BLZ', 'SLV', 'HND', 'NIC', 'CRI', 'PAN']),
    ('car', 'جزر الكاريبي', 'The Caribbean', '🏝️', ['CUB', 'JAM', 'HTI', 'DOM', 'BHS', 'TTO', 'BRB', 'DMA', 'GRD', 'LCA', 'VCT', 'KNA', 'ATG']),
    ('sam', 'أمريكا الجنوبية', 'South America', '🦜', ['BRA', 'ARG', 'CHL', 'PER', 'COL', 'VEN', 'ECU', 'BOL', 'PRY', 'URY', 'GUY', 'SUR']),
    ('oce', 'أوقيانوسيا', 'Oceania', '🦘', ['AUS', 'NZL', 'PNG', 'FJI', 'SLB', 'VUT', 'WSM', 'TON', 'KIR', 'TUV', 'NRU', 'FSM', 'MHL', 'PLW']),
]
# physical features: id → (Arabic, English, kind, source); sources: marine polygon names, region polygons, peaks, rivers, lakes, or a point (lon, lat)
PHYS = [
    # oceans
    ('o-pacific', 'المحيط الهادئ', 'Pacific Ocean', 'ocean', ('marine', ['North Pacific Ocean', 'South Pacific Ocean']), (-150, 5)),
    ('o-atlantic', 'المحيط الأطلسي', 'Atlantic Ocean', 'ocean', ('marine', ['North Atlantic Ocean', 'South Atlantic Ocean']), (-35, 15)),
    ('o-indian', 'المحيط الهندي', 'Indian Ocean', 'ocean', ('marine', ['INDIAN OCEAN']), (78, -20)),
    ('o-arctic', 'المحيط المتجمد الشمالي', 'Arctic Ocean', 'ocean', ('marine', ['Arctic Ocean']), (0, 84)),
    ('o-southern', 'المحيط الجنوبي', 'Southern Ocean', 'ocean', ('marine', ['SOUTHERN OCEAN']), (60, -62)),
    # seas and gulfs
    ('s-red', 'البحر الأحمر', 'Red Sea', 'sea', ('marine', ['Red Sea']), None),
    ('s-gulf', 'الخليج العربي', 'Arabian Gulf', 'sea', ('marine', ['Persian Gulf']), None),
    ('s-arabian', 'بحر العرب', 'Arabian Sea', 'sea', ('marine', ['Arabian Sea']), None),
    ('s-med', 'البحر الأبيض المتوسط', 'Mediterranean Sea', 'sea', ('marine', ['Mediterranean Sea']), None),
    ('s-black', 'البحر الأسود', 'Black Sea', 'sea', ('marine', ['Black Sea']), None),
    ('s-caspian', 'بحر قزوين', 'Caspian Sea', 'sea', ('marine', ['Caspian Sea']), None),
    ('s-caribbean', 'البحر الكاريبي', 'Caribbean Sea', 'sea', ('marine', ['Caribbean Sea']), None),
    ('s-scs', 'بحر الصين الجنوبي', 'South China Sea', 'sea', ('marine', ['South China Sea']), None),
    ('s-bengal', 'خليج البنغال', 'Bay of Bengal', 'sea', ('marine', ['Bay of Bengal']), None),
    ('s-mexico', 'خليج المكسيك', 'Gulf of Mexico', 'sea', ('marine', ['Gulf of Mexico']), None),
    ('s-japan', 'بحر اليابان', 'Sea of Japan', 'sea', ('marine', ['Sea of Japan']), None),
    ('s-coral', 'بحر المرجان', 'Coral Sea', 'sea', ('marine', ['Coral Sea']), None),
    ('s-hudson', 'خليج هدسون', 'Hudson Bay', 'sea', ('marine', ['Hudson Bay']), None),
    # mountains: peaks and ranges
    ('m-everest', 'جبل إيفرست', 'Mount Everest', 'peak', ('point', (86.925, 27.988)), None),
    ('m-k2', 'جبل كي ٢', 'K2', 'peak', ('point', (76.513, 35.881)), None),
    ('m-kilimanjaro', 'جبل كليمنجارو', 'Mount Kilimanjaro', 'peak', ('point', (37.355, -3.065)), None),
    ('m-elbrus', 'جبل إلبروس', 'Mount Elbrus', 'peak', ('point', (42.439, 43.355)), None),
    ('m-blanc', 'جبل مون بلان', 'Mont Blanc', 'peak', ('point', (6.865, 45.833)), None),
    ('m-denali', 'جبل دينالي', 'Denali', 'peak', ('point', (-151.007, 63.069)), None),
    ('m-aconcagua', 'جبل أكونكاغوا', 'Aconcagua', 'peak', ('point', (-70.011, -32.653)), None),
    ('m-kosciuszko', 'جبل كوسيوسكو', 'Mount Kosciuszko', 'peak', ('point', (148.263, -36.456)), None),
    ('m-vinson', 'جبل فينسون', 'Mount Vinson', 'peak', ('point', (-85.617, -78.525)), None),
    ('m-sawda', 'جبل السودة', 'Jabal Sawda', 'peak', ('point', (42.368, 18.267)), None),
    ('r-himalaya', 'جبال الهيمالايا', 'Himalayas', 'range', ('region', ['HIMALAYAS']), None),
    ('r-alps', 'جبال الألب', 'Alps', 'range', ('region', ['ALPS']), None),
    ('r-andes', 'جبال الأنديز', 'Andes', 'range', ('region', ['ANDES']), None),
    ('r-rocky', 'جبال روكي', 'Rocky Mountains', 'range', ('region', ['ROCKY MOUNTAINS']), None),
    ('r-ural', 'جبال الأورال', 'Ural Mountains', 'range', ('region', ['URAL MOUNTAINS']), None),
    ('r-caucasus', 'جبال القوقاز', 'Caucasus Mountains', 'range', ('region', ['CAUCASUS MTS.']), None),
    ('r-sarawat', 'جبال السروات', 'Sarawat Mountains', 'range', ('point', (41.5, 20.0)), None),
    # rivers and lakes
    ('v-nile', 'نهر النيل', 'Nile', 'river', ('river', ['Nile']), None),
    ('v-amazon', 'نهر الأمازون', 'Amazon', 'river', ('river', ['Amazonas']), None),
    ('v-mississippi', 'نهر المسيسيبي', 'Mississippi', 'river', ('river', ['Mississippi']), None),
    ('v-yangtze', 'نهر اليانغتسي', 'Yangtze', 'river', ('river', ['Chang', 'Yangtze']), None),
    ('v-congo', 'نهر الكونغو', 'Congo River', 'river', ('river', ['Congo']), None),
    ('v-danube', 'نهر الدانوب', 'Danube', 'river', ('river', ['Donau']), None),
    ('v-mekong', 'نهر الميكونغ', 'Mekong', 'river', ('river', ['Mekong']), None),
    ('v-euphrates', 'نهر الفرات', 'Euphrates', 'river', ('line', [(39.4, 39.3), (38.8, 38.8), (38.3, 38.0), (37.99, 37.03), (38.0, 36.82), (38.55, 35.84), (39.0, 35.95), (40.14, 35.33), (40.9, 34.45), (42.4, 34.1), (43.3, 33.42), (43.78, 33.35), (44.43, 32.47), (45.28, 31.31), (46.26, 31.04), (47.43, 31.01), (48.0, 30.45), (48.5, 29.95)]), None),
    ('v-tigris', 'نهر دجلة', 'Tigris', 'river', ('line', [(39.4, 38.5), (40.23, 37.91), (41.4, 37.8), (42.19, 37.33), (42.7, 36.9), (43.13, 36.34), (43.25, 35.5), (43.68, 34.6), (43.87, 34.2), (44.39, 33.32), (45.0, 32.95), (45.82, 32.5), (46.5, 32.1), (47.15, 31.84), (47.43, 31.01)]), None),
    ('l-victoria', 'بحيرة فيكتوريا', 'Lake Victoria', 'lake', ('lake', ['Lake Victoria']), None),
    ('l-baikal', 'بحيرة بايكال', 'Lake Baikal', 'lake', ('lake', ['Lake Baikal']), None),
    ('l-superior', 'بحيرة سوبيريور', 'Lake Superior', 'lake', ('lake', ['Lake Superior']), None),
    ('l-titicaca', 'بحيرة تيتيكاكا', 'Lake Titicaca', 'lake', ('lake', ['Lago Titicaca']), None),
    ('l-tanganyika', 'بحيرة تنجانيقا', 'Lake Tanganyika', 'lake', ('lake', ['Lake Tanganyika']), None),
    # deserts, peninsulas, islands, waterfalls
    ('d-sahara', 'الصحراء الكبرى', 'Sahara', 'desert', ('region', ['SAHARA']), None),
    ('d-gobi', 'صحراء غوبي', 'Gobi Desert', 'desert', ('region', ['GOBI DESERT']), None),
    ('d-rub', 'الربع الخالي', "Rub' al Khali", 'desert', ('point', (50.0, 20.5)), None),
    ('d-nafud', 'صحراء النفود', 'An Nafud', 'desert', ('point', (41.0, 28.3)), None),
    ('p-arabia', 'شبه الجزيرة العربية', 'Arabian Peninsula', 'land', ('region', ['ARABIAN PENINSULA']), None),
    ('p-greenland', 'جزيرة غرينلاند', 'Greenland', 'land', ('point', (-41.0, 73.0)), None),
    ('p-madagascar', 'جزيرة مدغشقر', 'Madagascar', 'land', ('region', ['MADAGASCAR']), None),
    ('f-niagara', 'شلالات نياغرا', 'Niagara Falls', 'falls', ('point', (-79.07, 43.08)), None),
    ('f-angel', 'شلالات آنجل', 'Angel Falls', 'falls', ('point', (-62.535, 5.967)), None),
]
PHYS_PACKS = [
    ('world', 'القارات والمحيطات', 'Continents and oceans', '🌍', None),
    ('seas', 'البحار والخلجان', 'Seas and gulfs', '🌊', 'sea'),
    ('mount', 'الجبال', 'Mountains', '🏔️', ('peak', 'range')),
    ('rivers', 'الأنهار والبحيرات', 'Rivers and lakes', '🏞️', ('river', 'lake')),
    ('lands', 'الصحاري والجزر', 'Deserts and islands', '🏜️', ('desert', 'land', 'falls')),
]

FACTS = {
    'AS': 'أكبر القارات وأكثرها سكانًا، وفيها المملكة العربية السعودية.', 'AF': 'ثاني أكبر القارات، يجري فيها نهر النيل.',
    'EU': 'قارة صغيرة كثيرة الدول، شمال البحر الأبيض المتوسط.', 'NA': 'فيها كندا والولايات المتحدة والمكسيك.',
    'SA': 'فيها غابات الأمازون وجبال الأنديز.', 'OC': 'أصغر القارات، أكبر دولها أستراليا.', 'AN': 'أبرد القارات، يغطيها الجليد ولا يسكنها أحد دائمًا.',
    'o-pacific': 'أكبر المحيطات وأعمقها.', 'o-atlantic': 'ثاني أكبر المحيطات، بين الأمريكتين وأوروبا وإفريقيا.',
    'o-indian': 'ثالث أكبر المحيطات، يقع جنوب شبه الجزيرة العربية.', 'o-arctic': 'أصغر المحيطات، يغطّي الجليد معظمه.',
    'o-southern': 'يحيط بالقارة القطبية الجنوبية.', 's-red': 'يفصل شبه الجزيرة العربية عن إفريقيا، وتطلّ عليه جدة.',
    's-gulf': 'تطلّ عليه المملكة من الشرق، ومعها الكويت وقطر والبحرين والإمارات.', 's-arabian': 'جزء من المحيط الهندي جنوب شبه الجزيرة العربية.',
    's-med': 'بحر بين أوروبا وإفريقيا وآسيا.', 's-black': 'بحر بين أوروبا وآسيا، تطلّ عليه تركيا.',
    's-caspian': 'أكبر مسطّح مائي مغلق في العالم، لا يتصل بمحيط.', 's-caribbean': 'تحيط به جزر الكاريبي وأمريكا الوسطى.',
    's-scs': 'بحر جنوب الصين، تحيط به دول جنوب شرق آسيا.', 's-bengal': 'شرق الهند، وهو جزء من المحيط الهندي.',
    's-mexico': 'بين المكسيك والولايات المتحدة.', 's-japan': 'بين اليابان وكوريا.', 's-coral': 'شمال شرق أستراليا، وفيه الحاجز المرجاني العظيم.',
    's-hudson': 'خليج كبير في شمال كندا.', 'm-everest': 'أعلى جبل في العالم، في جبال الهيمالايا.', 'm-k2': 'ثاني أعلى جبل في العالم.',
    'm-kilimanjaro': 'أعلى جبل في إفريقيا، في تنزانيا.', 'm-elbrus': 'أعلى جبل في أوروبا، في جبال القوقاز.', 'm-blanc': 'أعلى قمة في جبال الألب.',
    'm-denali': 'أعلى جبل في أمريكا الشمالية، في ألاسكا.', 'm-aconcagua': 'أعلى جبل في أمريكا الجنوبية، في جبال الأنديز.',
    'm-kosciuszko': 'أعلى جبل في أستراليا.', 'm-vinson': 'أعلى جبل في القارة القطبية الجنوبية.', 'm-sawda': 'أعلى قمة في المملكة العربية السعودية، قرب أبها.',
    'r-himalaya': 'أعلى سلسلة جبال في العالم، وفيها جبل إيفرست.', 'r-alps': 'أشهر جبال أوروبا، تغطّي الثلوج قممها.',
    'r-andes': 'أطول سلسلة جبال على اليابسة، غرب أمريكا الجنوبية.', 'r-rocky': 'سلسلة جبال طويلة غرب أمريكا الشمالية.',
    'r-ural': 'تُعدّ حدًّا بين أوروبا وآسيا.', 'r-caucasus': 'بين البحر الأسود وبحر قزوين.', 'r-sarawat': 'سلسلة جبال غرب المملكة، بمحاذاة البحر الأحمر.',
    'v-nile': 'أطول نهر في العالم، يجري في إفريقيا ويصبّ في البحر الأبيض المتوسط.', 'v-amazon': 'أكبر أنهار العالم في كمية الماء، في أمريكا الجنوبية.',
    'v-mississippi': 'من أكبر أنهار أمريكا الشمالية، يصبّ في خليج المكسيك.', 'v-yangtze': 'أطول نهر في آسيا، يجري في الصين.',
    'v-congo': 'نهر كبير في وسط إفريقيا، يعبر خط الاستواء مرتين.', 'v-danube': 'يعبر دولًا كثيرة في أوروبا ويصبّ في البحر الأسود.',
    'v-mekong': 'يجري في جنوب شرق آسيا.', 'v-euphrates': 'ينبع من تركيا ويجري في سوريا والعراق.',
    'v-tigris': 'ينبع من تركيا ويجري في العراق، ويلتقي بالفرات فيكوّنان شط العرب.', 'l-victoria': 'أكبر بحيرة في إفريقيا، ومنها ينبع النيل الأبيض.',
    'l-baikal': 'أعمق بحيرة في العالم، في روسيا.', 'l-superior': 'أكبر البحيرات العظمى في أمريكا الشمالية.',
    'l-titicaca': 'بحيرة عالية في جبال الأنديز بين بيرو وبوليفيا.', 'l-tanganyika': 'بحيرة طويلة وعميقة في شرق إفريقيا.',
    'd-sahara': 'أكبر صحراء حارّة في العالم، في شمال إفريقيا.', 'd-gobi': 'صحراء باردة في الصين ومنغوليا.',
    'd-rub': 'أكبر صحراء رملية متصلة في العالم، جنوب شرق المملكة.', 'd-nafud': 'صحراء رملها أحمر، في شمال المملكة.',
    'p-arabia': 'أكبر شبه جزيرة في العالم.', 'p-greenland': 'أكبر جزيرة في العالم.', 'p-madagascar': 'جزيرة كبيرة شرق إفريقيا.',
    'f-niagara': 'شلالات شهيرة بين كندا والولايات المتحدة.', 'f-angel': 'أعلى شلال في العالم، في فنزويلا.',
}
KIND_AR = {'ocean': 'محيط', 'sea': 'بحر أو خليج', 'peak': 'جبل', 'range': 'سلسلة جبال', 'river': 'نهر', 'lake': 'بحيرة', 'desert': 'صحراء', 'land': 'أرض وجزيرة', 'falls': 'شلالات', 'cont': 'قارة'}

FACTS_EN = {
    'AS': 'The biggest continent with the most people. Saudi Arabia is in Asia.', 'AF': 'The second biggest continent. The Nile flows through it.',
    'EU': 'A small continent with many countries, north of the Mediterranean Sea.', 'NA': 'Home to Canada, the United States and Mexico.',
    'SA': 'Home to the Amazon rainforest and the Andes mountains.', 'OC': 'The smallest continent. Its biggest country is Australia.',
    'AN': 'The coldest continent, covered in ice. Nobody lives there all year.',
    'o-pacific': 'The biggest and deepest ocean.', 'o-atlantic': 'The second biggest ocean, between the Americas and Europe and Africa.',
    'o-indian': 'The third biggest ocean, south of the Arabian Peninsula.', 'o-arctic': 'The smallest ocean, mostly covered in ice.',
    'o-southern': 'The ocean around Antarctica.', 's-red': 'It separates the Arabian Peninsula from Africa. Jeddah is on its coast.',
    's-gulf': 'Saudi Arabia is on its western shore, with Kuwait, Qatar, Bahrain and the UAE.', 's-arabian': 'Part of the Indian Ocean, south of the Arabian Peninsula.',
    's-med': 'A sea between Europe, Africa and Asia.', 's-black': 'A sea between Europe and Asia. Turkey is on its coast.',
    's-caspian': 'The biggest closed body of water in the world. It does not reach an ocean.', 's-caribbean': 'Surrounded by the Caribbean islands and Central America.',
    's-scs': 'A sea south of China, surrounded by Southeast Asian countries.', 's-bengal': 'East of India. It is part of the Indian Ocean.',
    's-mexico': 'Between Mexico and the United States.', 's-japan': 'Between Japan and Korea.', 's-coral': 'Northeast of Australia. The Great Barrier Reef is here.',
    's-hudson': 'A big bay in northern Canada.', 'm-everest': 'The highest mountain in the world, in the Himalayas.', 'm-k2': 'The second highest mountain in the world.',
    'm-kilimanjaro': 'The highest mountain in Africa, in Tanzania.', 'm-elbrus': 'The highest mountain in Europe, in the Caucasus.', 'm-blanc': 'The highest peak in the Alps.',
    'm-denali': 'The highest mountain in North America, in Alaska.', 'm-aconcagua': 'The highest mountain in South America, in the Andes.',
    'm-kosciuszko': 'The highest mountain in Australia.', 'm-vinson': 'The highest mountain in Antarctica.', 'm-sawda': 'The highest peak in Saudi Arabia, near Abha.',
    'r-himalaya': 'The highest mountain range in the world, with Mount Everest.', 'r-alps': 'Europe\'s best-known mountains, with snowy peaks.',
    'r-andes': 'The longest mountain range on land, in western South America.', 'r-rocky': 'A long mountain range in western North America.',
    'r-ural': 'They mark the border between Europe and Asia.', 'r-caucasus': 'Between the Black Sea and the Caspian Sea.', 'r-sarawat': 'Mountains in western Saudi Arabia, along the Red Sea.',
    'v-nile': 'The longest river in the world. It flows through Africa into the Mediterranean Sea.', 'v-amazon': 'The river with the most water in the world, in South America.',
    'v-mississippi': 'One of the biggest rivers in North America. It flows into the Gulf of Mexico.', 'v-yangtze': 'The longest river in Asia, in China.',
    'v-congo': 'A big river in central Africa. It crosses the Equator twice.', 'v-danube': 'It flows through many European countries into the Black Sea.',
    'v-mekong': 'It flows through Southeast Asia.', 'v-euphrates': 'It starts in Turkey and flows through Syria and Iraq.',
    'v-tigris': 'It starts in Turkey and flows through Iraq. It joins the Euphrates to form the Shatt al-Arab.', 'l-victoria': 'The biggest lake in Africa. The White Nile starts here.',
    'l-baikal': 'The deepest lake in the world, in Russia.', 'l-superior': 'The biggest of the Great Lakes in North America.',
    'l-titicaca': 'A lake high in the Andes, between Peru and Bolivia.', 'l-tanganyika': 'A long, deep lake in East Africa.',
    'd-sahara': 'The biggest hot desert in the world, in North Africa.', 'd-gobi': 'A cold desert in China and Mongolia.',
    'd-rub': 'The biggest continuous sand desert in the world, in southeastern Saudi Arabia.', 'd-nafud': 'A red sand desert in northern Saudi Arabia.',
    'p-arabia': 'The biggest peninsula in the world.', 'p-greenland': 'The biggest island in the world.', 'p-madagascar': 'A big island east of Africa.',
    'f-niagara': 'Famous waterfalls between Canada and the United States.', 'f-angel': 'The highest waterfall in the world, in Venezuela.',
}
KIND_EN = {'ocean': 'Ocean', 'sea': 'Sea or gulf', 'peak': 'Mountain', 'range': 'Mountain range', 'river': 'River', 'lake': 'Lake', 'desert': 'Desert', 'land': 'Land and island', 'falls': 'Waterfall', 'cont': 'Continent'}

def load(name): return json.load(open(os.path.join(NE, name), encoding='utf-8'))['features']

def main():
    feats = load('ne_50m_admin_0_countries.geojson')
    groups = {}
    for f in feats:
        q = f['properties']; groups.setdefault(q['ADM0_A3_SA'], []).append(f)
    places = load('ne_110m_populated_places.geojson')
    caps = {}
    for f in places:
        q = f['properties']
        if q['ADM0CAP'] == 1: caps.setdefault(q['SOV_A3'], []).append(q)
    taught_ids = {c for p in PACKS for c in p[4]}
    # areas that the Saudi view gives to another country (the Golan Heights to Syria, Crimea to Ukraine):
    # cut them out of the country that holds them in the base data and join them to their owner
    host_of = {f['properties']['ADM0_A3']: f['properties']['ADM0_A3_SA'] for f in feats}
    plus, minus, drop_box = {}, {}, {}
    for f in load('ne_50m_admin_0_breakaway_disputed_areas.geojson'):
        q = f['properties']
        if q['NAME'] not in ('Golan Heights', 'Crimea'): continue
        host, owner = host_of[q['ADM0_A3']], q['ADM0_A3_SA']
        rs = [r for r in (qring(x) for x in rings_of(f['geometry'])) if r]
        plus.setdefault(owner, []).extend(rs)
        if q['NAME'] == 'Crimea': drop_box[host] = bbox(rs)           # Crimea is its own island-like ring: drop it from the host
        else: minus.setdefault(host, []).extend(r[::-1] for r in rs)
    countries, shapes, land = [], {}, {}
    for gid, fs in groups.items():
        main = next((f for f in fs if f['properties']['ADM0_A3'] == gid), fs[0]); q = main['properties']
        rings = [r for f in fs for r in (qring(x) for x in rings_of(f['geometry'])) if r]
        if not rings: continue
        if gid in drop_box:
            x0, y0, x1, y1 = (v * Q for v in drop_box[gid])
            rings = [r for r in rings if not all(x0 - Q <= x <= x1 + Q and y0 - Q <= y <= y1 + Q for x, y in r)]
        if len(fs) > 1 or gid in plus or gid in minus:
            n0 = len(rings); rings = union(rings + plus.get(gid, []) + minus.get(gid, []))
            if gid in plus or gid in minus: print(f'  reshaped {gid}: {n0} rings -> {len(rings)}')
        cont = CONT_FIX.get(gid) or NE_CONT.get(q['CONTINENT'])
        sovereign = q['ADMIN'] == q['SOVEREIGNT'] and q['TYPE'] in ('Sovereign country', 'Country', 'Sovereignty')
        taught = (sovereign or gid in EXTRA) and gid not in NOT_TAUGHT and cont != 'AN'
        if taught and gid not in taught_ids: print('NOT IN A PACK:', gid, q['NAME'])
        area = sum(ring_area(r) for r in rings)
        # the box of the main land only (not French Guiana for France, Alaska and Hawaii for the USA, Svalbard for Norway)
        big = max(rings, key=ring_area); bc = (sum(x for x, _ in big) / len(big), sum(y for _, y in big) / len(big))
        near = [r for r in rings if ring_area(r) >= ring_area(big) * 0.03 and math.hypot(sum(x for x, _ in r) / len(r) - bc[0], sum(y for _, y in r) / len(r) - bc[1]) <= 60 * Q]
        bb = bbox(near or [big])
        lab = pt(q['LABEL_X'], q['LABEL_Y'])
        shapes[gid] = path(rings)
        if not taught:
            land[gid] = cont or ''; continue
        cap = None
        if gid in CAP_FIX:
            a, e, lon, lat = CAP_FIX[gid]; cap = {'ar': a, 'en': e, 'p': pt(lon, lat)}
        else:
            cs = caps.get(gid) or caps.get(q['SOV_A3']) or []
            c = next((c for c in cs if c['ADM0_A3'] == gid), cs[0] if cs else None)
            if c: cap = {'ar': c['NAME_AR'], 'en': c['NAME'], 'p': pt(c['LONGITUDE'], c['LATITUDE'])}
            else: print('NO CAPITAL:', gid)
        iso = (q['ISO_A2_EH'] if q['ISO_A2_EH'] != '-99' else q['ISO_A2']).lower()
        if gid == 'KOS': iso = 'xk'
        flag = os.path.isfile(os.path.join(FLAGS, iso + '.svg'))
        if not flag: print('NO FLAG:', gid, iso)
        countries.append({'id': gid, 'ar': NAME_FIX.get(gid, q['NAME_AR']), 'en': EN_FIX.get(gid, q['NAME']),
                          'c': cont, 'arab': gid in ARAB, 'cap': cap, 'flag': iso if flag else '', 'lab': lab, 'bb': bb,
                          'tiny': area < 6, 'pop': q['POP_EST'], 'mc': q['MAPCOLOR7']})
    for gid, a, e, cont, iso, lon, lat, cap in MICRO:
        if any(c['id'] == gid for c in countries): continue
        x, y = pt(lon, lat); ca, ce, clon, clat = cap
        countries.append({'id': gid, 'ar': a, 'en': e, 'c': cont, 'arab': False, 'cap': {'ar': ca, 'en': ce, 'p': pt(clon, clat)}, 'flag': iso,
                          'lab': [x, y], 'bb': [x - 1, y - 1, x + 1, y + 1], 'tiny': True, 'pop': 0, 'mc': 1})
    # coastline: all land joined (shared borders cancel out), drawn as a halo and a crisp outline
    # (from the 1:110m countries: it only draws the soft halo under the land, so it can be lighter)
    all_rings = [r for f in load('ne_110m_admin_0_countries.geojson') for r in (qring(x) for x in rings_of(f['geometry'])) if r]
    coast = path(union(all_rings))
    # neighbours: countries whose rings share an edge
    edge_owner, nb = {}, {}
    for f in feats:
        gid = f['properties']['ADM0_A3_SA']
        for r in (qring(x) for x in rings_of(f['geometry'])):
            if not r: continue
            for i in range(len(r)):
                a, b = r[i], r[(i + 1) % len(r)]; k = (a, b) if a < b else (b, a)
                o = edge_owner.setdefault(k, set()); o.add(gid)
    for owners in edge_owner.values():
        if len(owners) > 1:
            for a in owners: nb.setdefault(a, set()).update(owners - {a})
    known = {c['id'] for c in countries}
    for c in countries: c['nb'] = sorted(x for x in nb.get(c['id'], ()) if x in known)
    # physical features
    marine = {f['properties']['name']: f for f in load('ne_110m_geography_marine_polys.geojson')}
    regions = {}
    for f in load('ne_110m_geography_regions_polys.geojson'): regions.setdefault(f['properties']['NAME'], []).append(f)
    rivers = {}
    for f in load('ne_110m_rivers_lake_centerlines.geojson'): rivers.setdefault(f['properties']['name'], []).append(f)
    lakes = {f['properties']['name']: f for f in load('ne_110m_lakes.geojson')}
    phys, pshape = [], {}
    for pid, a, e, kind, (src, ref), lab in PHYS:
        item = {'id': pid, 'ar': a, 'en': e, 'k': kind}
        if src in ('marine', 'region', 'lake'):
            fs = [marine[n] for n in ref] if src == 'marine' else [lakes[n] for n in ref] if src == 'lake' else [f for n in ref for f in regions[n]]
            rings = [r for f in fs for r in (qring(x) for x in rings_of(f['geometry'])) if r]
            if src == 'marine' and len(fs) > 1: rings = union(rings)
            pshape[pid] = path(rings); item['bb'] = bbox(rings)
            if lab: item['lab'] = pt(*lab)
            else:
                f0 = fs[0]; g = f0['geometry']
                big = max(rings, key=ring_area); item['lab'] = [round(sum(x for x, _ in big) / len(big) / Q, 1), round(sum(y for _, y in big) / len(big) / Q, 1)]
        elif src == 'river':
            ps = []
            for n in ref:
                for f in rivers[n]:
                    g = f['geometry']; lines = g['coordinates'] if g['type'] == 'MultiLineString' else [g['coordinates']]
                    ps += [line_path(l) for l in lines]
            pshape[pid] = ''.join(ps)
            allpts = [P(lon, lat) for n in ref for f in rivers[n] for l in (f['geometry']['coordinates'] if f['geometry']['type'] == 'MultiLineString' else [f['geometry']['coordinates']]) for lon, lat in l]
            item['bb'] = bbox([allpts]); mid = allpts[len(allpts) // 2]; item['lab'] = [round(mid[0] / Q, 1), round(mid[1] / Q, 1)]
        elif src == 'line':
            pts = [P(lon, lat) for lon, lat in ref]
            pshape[pid] = path_open(pts); item['bb'] = bbox([pts]); mid = pts[len(pts) // 2]; item['lab'] = [round(mid[0] / Q, 1), round(mid[1] / Q, 1)]
        elif src == 'point':
            item['p'] = pt(*ref); item['lab'] = item['p']; x, y = item['p']; item['bb'] = [x - 8, y - 8, x + 8, y + 8]
        item['fact'] = FACTS.get(pid, ''); item['fact_en'] = FACTS_EN.get(pid, ''); phys.append(item)
    # continents: label points and bounding boxes from the countries
    conts = []
    for k in ['AS', 'AF', 'EU', 'NA', 'SA', 'OC', 'AN']:
        ids = [c['id'] for c in countries if c['c'] == k] if k != 'AN' else ['ATA']
        if k == 'AN': bb = [0, pt(0, -62)[1], W, H]
        else:
            bbs = [c['bb'] for c in countries if c['c'] == k and c['id'] not in ('RUS', 'USA', 'FJI', 'KIR', 'NZL')] or [[0, 0, W, H]]
            bb = [min(b[0] for b in bbs), min(b[1] for b in bbs), max(b[2] for b in bbs), max(b[3] for b in bbs)]
        lab = {'AS': (90, 45), 'AF': (20, 5), 'EU': (20, 52), 'NA': (-100, 45), 'SA': (-60, -15), 'OC': (135, -25), 'AN': (0, -80)}[k]
        conts.append({'id': k, 'ar': CONT_AR[k], 'en': CONT_EN[k], 'lab': pt(*lab), 'bb': bb, 'fact': FACTS[k], 'fact_en': FACTS_EN[k]})
    packs = [{'id': i, 'ar': a, 'en': e, 'em': em, 'ids': ids, 'kind': 'country'} for i, a, e, em, ids in PACKS]
    ppacks = []
    for i, a, e, em, kinds in PHYS_PACKS:
        if kinds is None: ids = [c['id'] for c in conts] + [p['id'] for p in phys if p['k'] == 'ocean']
        else:
            kinds = (kinds,) if isinstance(kinds, str) else kinds; ids = [p['id'] for p in phys if p['k'] in kinds]
        ppacks.append({'id': i, 'ar': a, 'en': e, 'em': em, 'ids': ids, 'kind': 'phys'})
    countries.sort(key=lambda c: c['ar'])
    # ---- write the app data (small) and the map shapes (big, loaded when needed)
    import hashlib
    gv = hashlib.md5(json.dumps({'c': shapes, 'p': pshape, 'q': Q, 's': S}, separators=(',', ':')).encode()).hexdigest()[:8]
    data = {'W': W, 'H': H, 'v': gv, 'kinds': KIND_AR, 'kinds_en': KIND_EN, 'landc': land, 'countries': countries, 'conts': conts, 'phys': phys, 'packs': ppacks[:1] + packs + ppacks[1:]}
    with open(OUT_JS, 'w', encoding='utf-8') as fo:
        fo.write('/* generated by tools/make_atlas.py from Natural Earth (public domain) – do not edit by hand */\nAPPDATA.atlas = ')
        fo.write(json.dumps(data, ensure_ascii=False, separators=(',', ':'))); fo.write(';\n')
        # every sentence the app speaks (tools/speech_list.js collects them for recorded voices); keep in step with app.js
        fo.write('''APPDATA.atlas.speakables = function () {
  const A = this, out = [], add = t => out.push([t, 'ar']);
  ['أحسنت', 'رائع', 'ممتاز', 'ما اسم هذه الدولة؟', 'ما اسم هذه القارة؟', 'ما اسم هذا المكان؟', 'أي دولة هذا علمها؟'].forEach(add);
  A.countries.forEach(c => { const line = c.ar + '، عاصمتها ' + (c.cap ? c.cap.ar : ''); add(line); add('أين ' + c.ar + '؟'); add('ما عاصمة ' + c.ar + '؟'); add('ما علم ' + c.ar + '؟'); });
  A.conts.concat(A.phys).forEach(x => { add(x.ar); add('أين ' + x.ar + '؟'); });
  const en = t => out.push([t, 'en']);
  ['Well done!', 'Great!', 'Excellent!', 'What is this country called?', 'What is this continent called?', 'What is this place called?', 'Which country has this flag?'].forEach(en);
  A.countries.forEach(c => { en(c.en + '. The capital is ' + (c.cap ? c.cap.en : '') + '.'); en('Where is ' + c.en + '?'); en('What is the capital of ' + c.en + '?'); en('Which flag belongs to ' + c.en + '?'); });
  A.conts.concat(A.phys).forEach(x => { en(x.en); en('Where is ' + x.en + '?'); });
  return out;
};
''')
    os.makedirs(OUT_GEO, exist_ok=True)
    grat, edge = graticule()
    geo = {'c': shapes, 'p': pshape, 'coast': coast, 'grat': grat, 'edge': edge}
    with open(os.path.join(OUT_GEO, 'world.js'), 'w', encoding='utf-8') as fo:
        fo.write('window.ATLAS_GEO=' + json.dumps(geo, separators=(',', ':')) + ';\n')
    os.makedirs(OUT_FLAGS, exist_ok=True)
    for c in countries:
        if c['flag']: shutil.copy2(os.path.join(FLAGS, c['flag'] + '.svg'), os.path.join(OUT_FLAGS, c['flag'] + '.svg'))
    print(f"atlas: {len(countries)} countries, {len(phys)} features, map {W}x{H}, world.js {os.path.getsize(os.path.join(OUT_GEO, 'world.js')) // 1024} KB, data.js {os.path.getsize(OUT_JS) // 1024} KB")

if __name__ == '__main__':
    main()

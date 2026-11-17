#!/usr/bin/env python3
"""
Build the whole site into ONE file: dist/index.html

    python3 build.py

Reads:
  src/portal/shell.html    page skeleton with {{PLACEHOLDERS}}
  src/portal/theme.css     THE LOOK: colors, font, corners (CSS variables used everywhere)
  src/portal/portal.css    styles for the menu pages
  src/portal/catalog.js    the menu (years -> subjects -> units)
  src/portal/i18n.js       English phrases for the menu pages (HS.tr), used when the interface language is English
  src/portal/portal.js     menu drawing + router + child picker + parent page
  src/core/                shared code for every app: core.js (profiles, spaced repetition, speech, drag & drop),
                           core.css, phrases.js, sync.js (online sync through Firebase) + firebase-config.js
  src/units/<id>.js        one file per school unit: content only, drawn by the unit engine (src/apps/unit)
  dist/assets/art.json     finished artwork made by tools/art_process.py: {id: {src, sm?}}. Becomes window.HS_ART;
                           HS.art(id, …) shows a picture only when it is listed here, otherwise the emoji fallback.
  src/audio/manifest.json  optional recorded voice clips: {"ar|text": "file.mp3"}, files in src/audio/clips/
                           (made by tools/make_audio.py); missing clips fall back to the device voice
  src/apps/<folder>/       one folder per app:
      app.json   {"id": "...", "title": "..."}
      app.html   the app's markup
      app.css    the app's styles (written normally; build scopes them to #app-<id>)
      data.js    content only: sets APPDATA.<id> = {...}
      app.js     logic (any other *.js here runs after it, same scope); may use ROOT (the app's container) and must set APPS.<id> = {open(sub), close()}
Only the Python standard library is needed.
"""
import base64, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')

def read(*p):
    with open(os.path.join(SRC, *p), encoding='utf-8') as f:
        return f.read()

def extra_js(base):
    """other .js files in an app folder (e.g. kg/thinking.js) run after app.js, inside the same scope"""
    folder = os.path.join(SRC, *base)
    names = sorted(f for f in os.listdir(folder) if f.endswith('.js') and f not in ('app.js', 'data.js'))
    return '\n'.join(f'/* ---- {n} ---- */\n' + read(*base, n) for n in names)


def scope_css(css, wrapper):
    """Prefix every selector with the app wrapper so apps cannot affect each other."""
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    out, i, n = [], 0, len(css)
    def prefix(selectors):
        res = []
        for s in selectors.split(','):
            s = s.strip()
            if not s:
                continue
            if s in ('html', 'body', ':root'):
                res.append(wrapper)
            elif s == '*':
                res.append(wrapper + ' *')
            elif s.startswith('body '):
                res.append(wrapper + ' ' + s[5:])
            else:
                res.append(wrapper + ' ' + s)
        return ','.join(dict.fromkeys(res))
    while i < n:
        j = css.find('{', i)
        if j < 0:
            break
        head = css[i:j].strip()
        depth, k = 0, j
        while k < n:
            if css[k] == '{':
                depth += 1
            elif css[k] == '}':
                depth -= 1
                if depth == 0:
                    break
            k += 1
        inner = css[j + 1:k]
        if head.startswith('@keyframes') or head.startswith('@font-face'):
            out.append(head + '{' + inner + '}')
        elif head.startswith('@media') or head.startswith('@supports'):
            out.append(head + '{' + scope_css(inner, wrapper) + '}')
        else:
            out.append(prefix(head) + '{' + inner + '}')
        i = k + 1
    return '\n'.join(out)

def main():
    apps_css, apps_html, apps_js = [], [], []
    ids = []
    for folder in sorted(os.listdir(os.path.join(SRC, 'apps'))):
        base = ('apps', folder)
        if not os.path.isfile(os.path.join(SRC, *base, 'app.json')):
            continue
        meta = json.loads(read(*base, 'app.json'))
        aid = meta['id']
        if not re.fullmatch(r'[a-z0-9]+', aid):
            sys.exit(f'app id "{aid}" in {folder}: use lowercase letters/digits only')
        if aid in ids:
            sys.exit(f'duplicate app id "{aid}"')
        ids.append(aid)
        apps_css.append(f'/* ===== app: {aid} ({folder}) ===== */\n' + scope_css(read(*base, 'app.css'), '#app-' + aid))
        # apps keep right-to-left even when the menu is in English (their lessons are Arabic)
        apps_html.append(f'<!-- ===== app: {aid} ===== -->\n<div class="screen" id="scr-{aid}" dir="rtl" lang="ar"><div id="app-{aid}">\n{read(*base, "app.html")}\n</div></div>')
        apps_js.append(f'<script>/* ===== data: {aid} ===== */\n{read(*base, "data.js")}\n</script>')
        apps_js.append(f'<script>/* ===== app: {aid} ===== */\n(function () {{\nconst ROOT = document.getElementById("app-{aid}");\n{read(*base, "app.js")}\n{extra_js(base)}\n}})();\n</script>')

    # warn about menu entries that point to a missing app
    cat = read('portal', 'catalog.js')
    for ref in re.findall(r"app:\s*'([^']+)'", cat):
        if ref not in ids:
            print(f'WARNING: catalog.js refers to app "{ref}" but no src/apps/*/app.json has that id')

    # ---- units (content only), skipping templates like _TEMPLATE.js
    units_js, unit_ids = [], []
    udir = os.path.join(SRC, 'units')
    for f in sorted(os.listdir(udir)) if os.path.isdir(udir) else []:
        if f.endswith('.js') and not f.startswith('_'):
            unit_ids.append(f[:-3])
            units_js.append(f'<script>/* ===== unit: {f} ===== */\n{read("units", f)}\n</script>')
    for ref in re.findall(r"unit:\s*'([^']+)'", read('portal', 'catalog.js')):
        if ref not in unit_ids:
            print(f'WARNING: catalog.js refers to unit "{ref}" but src/units/{ref}.js does not exist')

    # ---- recorded voice clips (optional)
    audio = {}
    man = os.path.join(SRC, 'audio', 'manifest.json')
    if os.path.isfile(man):
        with open(man, encoding='utf-8') as f:
            for key, fn in json.load(f).items():
                fp = os.path.join(SRC, 'audio', 'clips', fn)
                if os.path.isfile(fp):
                    with open(fp, 'rb') as af:
                        audio[key] = 'data:audio/mpeg;base64,' + base64.b64encode(af.read()).decode()
    audio_js = '<script>window.HS_AUDIO = ' + json.dumps(audio, ensure_ascii=False) + ';</script>'

    # ---- finished artwork (tools/art_process.py): only pictures whose files exist are offered to the site
    art, missing = {}, []
    reg = os.path.join(DIST, 'assets', 'art.json')
    if os.path.isfile(reg):
        with open(reg, encoding='utf-8') as f:
            for k, v in json.load(f).items():
                files = [x for x in v.values() if isinstance(x, str)] if isinstance(v, dict) else []
                if all(os.path.isfile(os.path.join(DIST, x)) for x in files): art[k] = v
                else: missing.append(k)
    for k in missing:
        print(f'WARNING: artwork "{k}" is in art.json but its file is missing; run tools/art_process.py')
    icons = art.pop('_icons', {})
    head = ''
    if icons:
        head = (f'<link rel="icon" type="image/png" sizes="64x64" href="{icons["favicon-64"]}">\n'
                f'<link rel="apple-touch-icon" href="{icons["apple-touch-icon"]}">\n'
                '<meta name="apple-mobile-web-app-title" content="مدرسة البيت">')
    art_js = '<script>window.HS_ART = ' + json.dumps(art, ensure_ascii=False, sort_keys=True) + ';</script>'

    page = read('portal', 'shell.html')
    for key, val in {
        'THEME_CSS': read('portal', 'theme.css'),
        'CORE_CSS': read('core', 'core.css'),
        'PORTAL_CSS': read('portal', 'portal.css'),
        'AUDIO_JS': audio_js,
        'ART_JS': art_js,
        'HEAD_ICONS': head,
        'CORE_JS': '<script>\n' + read('core', 'phrases.js') + '\n' + read('core', 'core.js') + '\n' + read('core', 'firebase-config.js') + '\n' + read('core', 'sync.js') + '\n</script>',
        'UNITS_JS': '\n'.join(units_js),
        'APPS_CSS': '\n\n'.join(apps_css),
        'APPS_HTML': '\n\n'.join(apps_html),
        'APPS_JS': '\n'.join(apps_js),
        'CATALOG_JS': cat,
        'PORTAL_JS': read('portal', 'i18n.js') + '\n' + read('portal', 'portal.js'),
    }.items():
        page = page.replace('{{%s}}' % key, val)

    os.makedirs(DIST, exist_ok=True)
    out = os.path.join(DIST, 'index.html')
    with open(out, 'w', encoding='utf-8') as f:
        f.write(page)
    print(f'Built {out}  ({len(page)//1024} KB, apps: {", ".join(ids)}; units: {", ".join(unit_ids)}; voice clips: {len(audio)}; artwork: {len(art)})')

if __name__ == '__main__':
    main()

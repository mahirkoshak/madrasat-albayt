"""Runs every browser test in this folder and prints a summary.
  python3 build.py && python3 tests/run_all.py          (needs: pip install playwright && playwright install chromium)
A test passes when it exits without an error (each test asserts what it checks)."""
import subprocess, sys, time, pathlib
HERE = pathlib.Path(__file__).resolve().parent
tests = sorted(HERE.glob('test_*.py')) if len(sys.argv) < 2 else [HERE / a for a in sys.argv[1:]]
res = []
for t in tests:
    t0 = time.time(); p = subprocess.run([sys.executable, t.name], cwd=HERE, capture_output=True, text=True, timeout=900)
    ok = p.returncode == 0; res.append((t.name, ok, time.time() - t0))
    print(('PASS ' if ok else 'FAIL ') + t.name + f'  ({time.time() - t0:.0f}s)', flush=True)
    if not ok: print('\n'.join((p.stdout + p.stderr).strip().splitlines()[-12:]))
print(f"\n{sum(o for _, o, _ in res)} of {len(res)} passed")
sys.exit(0 if all(o for _, o, _ in res) else 1)

"""Marathon plan schedules: data, HTML table rendering and progression checks.

Source of truth for the week-by-week tables in the marathon plan posts
(public/data/posts/marathon-training-plan-*.json). Edit a schedule here, regenerate the
table HTML with render_table(slug), and run the checks:

    python3 scripts/marathon_plans.py

Checks per plan: weekly mileage rises <= 15% (vs the previous non-cutback week), a cutback
week (<= 85%) at least every 4th week, a 2-3 week taper that declines each week, the peak
long run 3-5 weeks before race day, peak week near its target, and no week row shared
between plans. Exits non-zero if any check fails.

Week tokens (Mon..Sun, or Run1/Run2/Run3 for the 3-day plan):
  R          rest
  X40        cross-training, minutes (not counted in mileage)
  E5         easy 5 mi
  S5         easy 5 mi + strides
  H5:detail  easy 5 mi incl. hill reps
  T6:detail  6 mi incl. threshold work
  I7:detail  7 mi incl. intervals
  M7:detail  7 mi incl. marathon-pace segment
  L16[:detail] long run
  RACE       race day (not counted in weekly total)
Detail text may contain {n}: rendered as "n mi / k km".
"""
import re

KM = 1.609344


def km(mi):
    return round(mi * KM)


def fmt_dist(mi):
    return f"{mi:g}&nbsp;mi&nbsp;/ {km(mi)}&nbsp;km"


def expand(detail):
    return re.sub(r"\{(\d+(?:\.\d+)?)\}", lambda m: fmt_dist(float(m.group(1))), detail)


LABEL = {"E": "Easy", "S": "Easy + strides", "H": "Hills", "T": "Threshold", "I": "Intervals",
         "M": "Marathon pace", "L": "Long run"}
DEFAULT_DETAIL = {"S": "6 × 20 s strides"}


def parse(tok):
    if tok == "R":
        return ("R", 0, "")
    if tok == "RACE":
        return ("RACE", 0, "")
    if tok.startswith("X"):
        return ("X", 0, tok[1:])
    m = re.fullmatch(r"([ESHTIML])(\d+(?:\.\d+)?)(?::(.*))?", tok)
    if not m:
        raise ValueError(f"bad token {tok!r}")
    return (m.group(1), float(m.group(2)), m.group(3) or DEFAULT_DETAIL.get(m.group(1), ""))


def cell(tok):
    t, mi, d = parse(tok)
    if t == "R":
        return '<td class="rest">Rest</td>'
    if t == "RACE":
        return '<td class="race"><strong>RACE</strong><br>26.2&nbsp;mi / 42.2&nbsp;km</td>'
    if t == "X":
        return f'<td class="xt">Cross-train<br>{d}&nbsp;min</td>'
    extra = f"<br><small>{expand(d)}</small>" if d else ""
    return f'<td class="{t.lower()}"><strong>{LABEL[t]}</strong><br>{fmt_dist(mi)}{extra}</td>'


def week_total(days):
    return sum(parse(t)[1] for t in days)


def long_run(days):
    return max([parse(t)[1] for t in days if parse(t)[0] == "L"] or [0])


# ---------------------------------------------------------------------------
# Plans. Each week: (phase, [tokens]). Phase "Cutback" / "Taper" / "Race" are checked.
# ---------------------------------------------------------------------------
DAYS7 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

PLANS = {}

# Beginners: 18 weeks, 4 runs (Tue, Thu, Sat, Sun), base 12-15 mi
PLANS["marathon-training-plan-for-beginners"] = dict(
    name="Beginner 18-week", columns=DAYS7, base=(12, 15), peak_target=35, weeks=[
        ("Base", ["R", "E3", "X30", "S3", "R", "E2", "L5"]),
        ("Base", ["R", "E3", "X30", "S3", "R", "E3", "L5"]),
        ("Base", ["R", "E3", "X30", "S4", "R", "E3", "L6"]),
        ("Cutback", ["R", "E3", "X30", "S3", "R", "E2", "L4"]),
        ("Base", ["R", "E3", "X40", "S4", "R", "E3", "L7"]),
        ("Build", ["R", "E4", "X40", "T4:2 × 8 min @ T", "R", "E3", "L8"]),
        ("Build", ["R", "E4", "X40", "T4:3 × 8 min @ T", "R", "E3", "L10"]),
        ("Cutback", ["R", "E3", "X30", "S4", "R", "E3", "L7"]),
        ("Build", ["R", "E4", "X40", "T5:2 × 12 min @ T", "R", "E3", "L11"]),
        ("Build", ["R", "E4", "X40", "T5:20 min @ T", "R", "E4", "L12"]),
        ("Build", ["R", "E5", "X45", "T5:3 × 10 min @ T", "R", "E4", "L14"]),
        ("Cutback", ["R", "E4", "X30", "S4", "R", "E3", "L10"]),
        ("Peak", ["R", "E5", "X45", "M6:{3} @ goal pace", "R", "E4", "L15"]),
        ("Peak", ["R", "E5", "X45", "T6:25 min @ T", "R", "E4", "L17"]),
        ("Peak", ["R", "E5", "X45", "M6:{4} @ goal pace", "R", "E4", "L20"]),
        ("Taper", ["R", "E5", "X30", "T5:2 × 10 min @ T", "R", "E3", "L12"]),
        ("Taper", ["R", "E4", "X30", "M5:{3} @ goal pace", "R", "E3", "L8"]),
        ("Race", ["R", "S3", "R", "M3:{1} @ goal pace", "R", "E2", "RACE"]),
    ])

# 6 months: 24 weeks, 4 runs -> 5 runs from week 9, base 10-15 mi
PLANS["marathon-training-plan-6-months-08rp"] = dict(
    name="6-month (24-week)", columns=DAYS7, base=(10, 15), peak_target=40, weeks=[
        ("Base", ["R", "E3", "R", "S3", "X30", "E2", "L4"]),
        ("Base", ["R", "E3", "R", "S3", "X30", "E3", "L4"]),
        ("Base", ["R", "E3", "R", "S3", "X30", "E3", "L5"]),
        ("Cutback", ["R", "E2", "R", "S3", "X30", "E2", "L4"]),
        ("Base", ["R", "E3", "R", "S3", "X30", "E3", "L6"]),
        ("Base", ["R", "E3", "R", "S4", "X40", "E3", "L7"]),
        ("Base", ["R", "E4", "R", "S4", "X40", "E3", "L8"]),
        ("Cutback", ["R", "E3", "R", "S3", "X30", "E3", "L6"]),
        ("Strength", ["R", "E3", "E2", "H4:6 × 60 s uphill", "R", "E2", "L9"]),
        ("Strength", ["R", "E3", "E3", "H4:8 × 60 s uphill", "R", "E2", "L10"]),
        ("Strength", ["R", "E3", "E3", "T5:2 × 10 min @ T", "R", "E3", "L11"]),
        ("Cutback", ["R", "E3", "E2", "S4", "R", "E2", "L8"]),
        ("Build", ["R", "E4", "E3", "T5:3 × 10 min @ T", "R", "E3", "L12"]),
        ("Build", ["R", "E4", "E4", "T6:20 min @ T", "R", "E3", "L13"]),
        ("Build", ["R", "E5", "E4", "I6:6 × 800 m @ I", "R", "E3", "L14"]),
        ("Cutback", ["R", "E4", "E3", "S4", "R", "E3", "L10"]),
        ("Specific", ["R", "E5", "E4", "T7:25 min @ T", "R", "E3", "L15"]),
        ("Specific", ["R", "E5", "E4", "M7:{4} @ MP", "R", "E4", "L16"]),
        ("Specific", ["R", "E5", "E5", "I7:5 × 1 km @ I", "R", "E4", "L18"]),
        ("Cutback", ["R", "E4", "E4", "M6:{3} @ MP", "R", "E3", "L12"]),
        ("Peak", ["R", "E5", "E5", "T7:2 × 15 min @ T", "R", "E3", "L20"]),
        ("Taper", ["R", "E5", "E4", "M7:{4} @ MP", "R", "E3", "L14"]),
        ("Taper", ["R", "E4", "E3", "T5:2 × 10 min @ T", "R", "E3", "L10"]),
        ("Race", ["R", "S3", "R", "M3:{1} @ MP", "R", "E2", "RACE"]),
    ])

# 20 weeks: 5 runs, base ~20 mi, has run a half
PLANS["marathon-training-plan-20-weeks"] = dict(
    name="20-week", columns=DAYS7, base=(18, 22), peak_target=45, weeks=[
        ("Base", ["R", "S4", "E3", "E4", "R", "E3", "L8"]),
        ("Base", ["R", "H5:6 × 60 s uphill", "E3", "E4", "R", "E3", "L9"]),
        ("Base", ["R", "H5:8 × 60 s uphill", "E4", "E4", "R", "E3", "L10"]),
        ("Cutback", ["R", "S4", "E3", "E3", "R", "E3", "L8"]),
        ("Build", ["R", "T6:3 × 8 min @ T", "E4", "E4", "R", "E3", "L11"]),
        ("Build", ["R", "I6:6 × 800 m @ I", "E4", "E5", "R", "E3", "L12"]),
        ("Build", ["R", "T7:3 × 10 min @ T", "E4", "E5", "R", "E4", "L13"]),
        ("Cutback", ["R", "S5", "E4", "E4", "R", "E3", "L10"]),
        ("Build", ["R", "I7:5 × 1 km @ I", "E5", "M6:{3} @ MP", "R", "E3", "L14"]),
        ("Build", ["R", "T7:25 min @ T", "E5", "M6:{4} @ MP", "R", "E4", "L15"]),
        ("Build", ["R", "I8:6 × 1 km @ I", "E5", "M7:{5} @ MP", "R", "E4", "L16"]),
        ("Cutback", ["R", "S5", "E4", "E5", "R", "E3", "L12"]),
        ("Peak", ["R", "T8:2 × 15 min @ T", "E5", "M7:{5} @ MP", "R", "E4", "L17"]),
        ("Peak", ["R", "I8:5 × 1200 m @ I", "E5", "M8:{6} @ MP", "R", "E4", "L18"]),
        ("Peak", ["R", "T8:30 min @ T", "E5", "E6", "R", "E4", "L20"]),
        ("Cutback", ["R", "S6", "E4", "M6:{4} @ MP", "R", "E3", "L14"]),
        ("Peak", ["R", "I8:6 × 1 km @ I", "E5", "M8:{6} @ MP", "R", "E4", "L20"]),
        ("Taper", ["R", "T7:2 × 12 min @ T", "E5", "M7:{5} @ MP", "R", "E3", "L14"]),
        ("Taper", ["R", "I6:5 × 800 m @ I", "E4", "M6:{4} @ MP", "R", "E3", "L10"]),
        ("Race", ["R", "S4", "E3", "M4:{2} @ MP", "R", "E2", "RACE"]),
    ])

# 16 weeks: 5 runs, base 25-30 mi with a 10+ mi long run
PLANS["marathon-training-plan-16-weeks-v5fm"] = dict(
    name="16-week", columns=DAYS7, base=(25, 30), peak_target=48, weeks=[
        ("Base", ["R", "S5", "E4", "E5", "R", "E4", "L11"]),
        ("Base", ["R", "T6:3 × 8 min @ T", "E5", "E5", "R", "E4", "L12"]),
        ("Base", ["R", "I7:6 × 800 m @ I", "E5", "E5", "R", "E4", "L13"]),
        ("Cutback", ["R", "S5", "E4", "E5", "R", "E3", "L10"]),
        ("Build", ["R", "T7:3 × 10 min @ T", "E5", "M7:{4} @ MP", "R", "E4", "L14"]),
        ("Build", ["R", "I8:5 × 1 km @ I", "E5", "E6", "R", "E4", "L15"]),
        ("Build", ["R", "T8:25 min @ T", "E5", "M8:{5} @ MP", "R", "E4", "L16"]),
        ("Cutback", ["R", "S6", "E4", "E6", "R", "E4", "L12"]),
        ("Specific", ["R", "I8:6 × 1 km @ I", "E6", "M8:{6} @ MP", "R", "E4", "L17"]),
        ("Specific", ["R", "T8:2 × 15 min @ T", "E6", "E7", "R", "E5", "L18:last {3} @ MP"]),
        ("Specific", ["R", "I9:5 × 1200 m @ I", "E6", "M9:{7} @ MP", "R", "E5", "L19"]),
        ("Cutback", ["R", "S6", "E5", "M7:{5} @ MP", "R", "E4", "L14"]),
        ("Peak", ["R", "T9:30 min @ T", "E6", "M8:{6} @ MP", "R", "E4", "L21"]),
        ("Taper", ["R", "I8:6 × 800 m @ I", "E5", "M8:{6} @ MP", "R", "E4", "L14"]),
        ("Taper", ["R", "T7:2 × 10 min @ T", "E5", "M6:{4} @ MP", "R", "E3", "L10"]),
        ("Race", ["R", "S5", "E4", "M4:{2} @ MP", "R", "E2", "RACE"]),
    ])

# Intermediate: 18 weeks, 5-6 runs, base 30-35 mi
PLANS["marathon-training-plan-intermediate-runners"] = dict(
    name="Intermediate 18-week", columns=DAYS7, base=(30, 35), peak_target=55, weeks=[
        ("Base", ["R", "T6:3 × 10 min @ T", "E7", "E5", "R", "S4", "L12"]),
        ("Base", ["R", "I7:6 × 800 m @ I", "E8", "E5", "R", "S4", "L13"]),
        ("Base", ["R", "T7:4 × 8 min @ T", "E8", "E5", "R", "M6:{3} @ MP", "L14"]),
        ("Cutback", ["R", "S6", "E6", "E5", "R", "E4", "L11"]),
        ("Build", ["R", "I8:5 × 1 km @ I", "E9", "E5", "E3", "S5", "L15"]),
        ("Build", ["R", "T8:2 × 15 min @ T", "E9", "E5", "E4", "M7:{4} @ MP", "L16"]),
        ("Build", ["R", "I8:6 × 1 km @ I", "E10", "E5", "E4", "S5", "L17:last {3} @ MP"]),
        ("Cutback", ["R", "S6", "E7", "E5", "R", "E5", "L13"]),
        ("Specific", ["R", "T8:30 min @ T", "E10", "E5", "E4", "M7:{4} @ MP", "L18"]),
        ("Specific", ["R", "I9:5 × 1200 m @ I", "E10", "E5", "E4", "S5", "L20"]),
        ("Specific", ["R", "T9:3 × 12 min @ T", "E10", "E6", "E4", "S5", "L18:last {6} @ MP"]),
        ("Cutback", ["R", "S7", "E8", "E5", "R", "E5", "L14"]),
        ("Peak", ["R", "I9:6 × 1 km @ I", "E10", "E5", "E4", "S5", "L20"]),
        ("Peak", ["R", "T9:2 × 20 min @ T", "E11", "E6", "E4", "S5", "L19:last {4} @ MP"]),
        ("Peak", ["R", "I9:5 × 1200 m @ I", "E10", "E5", "E4", "S5", "L22:last {6} @ MP"]),
        ("Taper", ["R", "T8:2 × 15 min @ T", "E8", "E5", "R", "M7:{5} @ MP", "L15"]),
        ("Taper", ["R", "I7:6 × 800 m @ I", "E7", "E5", "R", "S4", "L11"]),
        ("Race", ["R", "S5", "E5", "M5:{3} @ MP", "R", "E3", "RACE"]),
    ])

# Sub-4: 16 weeks, 5 runs, 3-week cycles (2 up, 1 back), base 25-30 mi
PLANS["marathon-training-plan-sub-4-hours-km1h"] = dict(
    name="Sub-4 16-week", columns=DAYS7, base=(25, 30), peak_target=50, weeks=[
        ("Base", ["R", "I6:6 × 400 m @ I", "E4", "E5", "R", "E4", "L11"]),
        ("Base", ["R", "T6:3 × 10 min @ T", "E5", "M6:{3} @ MP", "R", "E4", "L13"]),
        ("Cutback", ["R", "S5", "E4", "M5:{2} @ MP", "R", "E3", "L10"]),
        ("Build", ["R", "I7:6 × 800 m @ I", "E5", "M7:{4} @ MP", "R", "E4", "L14"]),
        ("Build", ["R", "T7:20 min @ T", "E5", "E6", "R", "E4", "L16:last {3} @ MP"]),
        ("Cutback", ["R", "S6", "E4", "E5", "R", "E4", "L12"]),
        ("Specific", ["R", "I8:5 × 1 km @ I", "E5", "M8:{5} @ MP", "R", "E4", "L17"]),
        ("Specific", ["R", "T8:2 × 15 min @ T", "E6", "E6", "R", "E4", "L18:last {4} @ MP"]),
        ("Cutback", ["R", "S6", "E5", "M6:{4} @ MP", "R", "E4", "L13"]),
        ("Specific", ["R", "I8:6 × 1 km @ I", "E6", "M9:{6} @ MP", "R", "E5", "L18"]),
        ("Specific", ["R", "T9:25 min @ T", "E6", "E7", "R", "E5", "L20"]),
        ("Cutback", ["R", "S6", "E5", "M6:{4} @ MP", "R", "E5", "L14"]),
        ("Peak", ["R", "I9:5 × 1200 m @ I", "E7", "E8", "R", "E6", "L20:{8} @ MP in the second half"]),
        ("Taper", ["R", "T8:2 × 15 min @ T", "E6", "M8:{6} @ MP", "R", "E4", "L14"]),
        ("Taper", ["R", "I7:6 × 800 m @ I", "E5", "M6:{4} @ MP", "R", "E3", "L10"]),
        ("Race", ["R", "M5:{3} @ MP", "E4", "S3", "R", "E2", "RACE"]),
    ])

# 3 days a week: 16 weeks, Run 1 / Run 2 / Long run + 2 cross-training sessions, base 15-20 mi
PLANS["marathon-training-plan-3-days-a-week-vnjv"] = dict(
    name="3-day 16-week", columns=["Run 1 (e.g. Tue)", "Run 2 (e.g. Thu)", "Run 3: long (e.g. Sun)", "Cross-training"],
    base=(15, 20), peak_target=30, weeks=[
        ("Base", ["T5:2 × 8 min @ T", "S4", "L8", "X2 × 30"]),
        ("Base", ["T5:3 × 8 min @ T", "I5:6 × 400 m @ I", "L9", "X2 × 30"]),
        ("Base", ["T6:2 × 12 min @ T", "I5:8 × 400 m @ I", "L10", "X2 × 30"]),
        ("Cutback", ["T5:20 min @ T", "S4", "L8", "X2 × 30"]),
        ("Build", ["T6:3 × 10 min @ T", "I6:6 × 800 m @ I", "L11", "X2 × 40"]),
        ("Build", ["M7:{4} @ MP", "I6:5 × 1 km @ I", "L12", "X2 × 40"]),
        ("Build", ["T7:25 min @ T", "I6:6 × 1 km @ I", "L14", "X2 × 40"]),
        ("Cutback", ["M6:{3} @ MP", "S5", "L10", "X2 × 30"]),
        ("Specific", ["T7:2 × 15 min @ T", "I7:5 × 1200 m @ I", "L15", "X2 × 45"]),
        ("Specific", ["M6:{4} @ MP", "I6:4 × 1600 m @ I", "L17", "X2 × 45"]),
        ("Cutback", ["T6:20 min @ T", "S5", "L12", "X2 × 30"]),
        ("Peak", ["T5:25 min @ T", "M5:{3} @ MP", "L20", "X2 × 45–60"]),
        ("Peak", ["M6:{4} @ MP", "I5:6 × 800 m @ I", "L16:last {3} @ MP", "X2 × 45"]),
        ("Taper", ["T5:2 × 10 min @ T", "I5:5 × 800 m @ I", "L13", "X2 × 30"]),
        ("Taper", ["M5:{3} @ MP", "S4", "L10", "X2 × 30"]),
        ("Race", ["S4", "M3:{1} @ MP", "RACE", "X1 × 20"]),
    ])


def render_table(slug):
    p = PLANS[slug]
    head = "".join(f'<th scope="col">{c}</th>' for c in p["columns"])
    rows = []
    for i, (phase, days) in enumerate(p["weeks"], 1):
        tot = week_total(days)
        rows.append(
            f'<tr class="phase-{phase.lower()}"><th scope="row">{i}<br><small>{phase}</small></th>'
            + "".join(cell(t) for t in days)
            + f'<td class="total"><strong>{tot:g}&nbsp;mi</strong><br>{km(tot)}&nbsp;km</td></tr>'
        )
    caption = (f'{p["name"]} marathon training plan: every week in miles and kilometres. '
               'Totals exclude race day; km are rounded.')
    return (
        f'<div class="plan-table-wrap"><table class="plan-table" data-plan="{slug}">'
        f"<caption>{caption}</caption>"
        f'<thead><tr><th scope="col">Week</th>{head}<th scope="col">Total</th></tr></thead>'
        f'<tbody>{"".join(rows)}</tbody></table></div>'
    )


# ---------------------------------------------------------------------------
# Checks
# ---------------------------------------------------------------------------
def check(slug):
    p = PLANS[slug]
    weeks = p["weeks"]
    n = len(weeks)
    totals = [week_total(d) for _, d in weeks]
    longs = [long_run(d) for _, d in weeks]
    phases = [ph for ph, _ in weeks]
    results = []

    def ok(cond, msg):
        results.append(("PASS" if cond else "FAIL", msg))

    # weekly increase: each non-cutback build week vs the previous non-cutback week
    worst, worst_wk, prev = 0.0, None, None
    for i, (ph, t) in enumerate(zip(phases, totals)):
        if ph in ("Taper", "Race"):
            break
        if ph == "Cutback":
            ok(prev is not None and t <= 0.85 * prev, f"week {i+1} cutback is {t:g} mi = {t/prev:.0%} of previous build week")
            continue
        if prev is not None:
            inc = t / prev - 1
            if inc > worst:
                worst, worst_wk = inc, i + 1
        prev = t
    ok(worst <= 0.15, f"largest week-to-week rise {worst:.1%} (week {worst_wk}); limit 15%")
    ok(totals[0] <= p["base"][1] * 1.15,
       f"week 1 = {totals[0]:g} mi vs stated starting base {p['base'][0]}-{p['base'][1]} mi")

    # cutback cadence: no more than 3 consecutive build weeks before a cutback/taper
    run, longest = 0, 0
    for ph in phases:
        if ph in ("Cutback", "Taper", "Race"):
            run = 0
        else:
            run += 1
            longest = max(longest, run)
    cut_weeks = [i + 1 for i, ph in enumerate(phases) if ph == "Cutback"]
    ok(longest <= 3, f"cutback every 3-4 weeks: cutbacks at weeks {cut_weeks}; max {longest} build weeks in a row")

    # taper
    taper = [i for i, ph in enumerate(phases) if ph in ("Taper", "Race")]
    contiguous = taper == list(range(n - len(taper), n))
    peak = max(totals[: n - len(taper)])
    decreasing = all(totals[j] < totals[j - 1] for j in taper)
    ok(contiguous and 2 <= len(taper) <= 3 and decreasing,
       f"taper {len(taper)} weeks ({' → '.join(f'{totals[j]:g}' for j in taper)} mi, from peak {peak:g}; first taper week {totals[taper[0]]/peak:.0%} of peak)")

    # peak long run 3-5 weeks before race week
    pl = max(longs)
    last_pl = max(i for i, l in enumerate(longs) if l == pl) + 1
    ok(3 <= n - last_pl <= 5, f"peak long run {pl:g} mi / {km(pl)} km in week {last_pl} = {n - last_pl} weeks before race day")
    ok(abs(peak - p["peak_target"]) <= 2, f"peak week {peak:g} mi / {km(peak)} km (target ~{p['peak_target']})")
    ok(phases[-1] == "Race" and weeks[-1][1].count("RACE") == 1, "final week ends with race day")
    return results, totals, longs


if __name__ == "__main__":
    all_pass = True
    seqs = {}
    for slug, p in PLANS.items():
        res, totals, longs = check(slug)
        seqs[slug] = (tuple(totals), tuple(longs))
        print(f"\n{p['name']} ({len(p['weeks'])} weeks)  [{slug}]")
        print("  weekly mi:", " ".join(f"{t:g}" for t in totals))
        print("  long  mi:", " ".join(f"{l:g}" for l in longs))
        for status, msg in res:
            all_pass &= status == "PASS"
            print(f"  {status}  {msg}")
    print("\nDistinct schedules:")
    slugs = list(PLANS)
    for i, a in enumerate(slugs):
        for b in slugs[i + 1:]:
            ra = [tuple(d) for _, d in PLANS[a]["weeks"]]
            rb = [tuple(d) for _, d in PLANS[b]["weeks"]]
            shared = len(set(ra) & set(rb))
            if seqs[a] == seqs[b] or shared > 1:
                all_pass = False
                print(f"  FAIL  {a} vs {b}: {shared} identical week rows")
    print("  identical week rows across plans: " + str(sum(
        len(set(tuple(d) for _, d in PLANS[a]["weeks"]) & set(tuple(d) for _, d in PLANS[b]["weeks"]))
        for i, a in enumerate(slugs) for b in slugs[i + 1:])))
    print("\nALL CHECKS PASS" if all_pass else "\nSOME CHECKS FAILED")
    raise SystemExit(0 if all_pass else 1)

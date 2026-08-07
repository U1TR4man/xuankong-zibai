import ephem, math, json, datetime, sys

# Terms in the order they occur within a Gregorian year, starting 小寒 (285 deg)
YEAR_ORDER = ["小寒","大寒","立春","雨水","驚蟄","春分","清明","穀雨","立夏","小滿","芒種","夏至",
              "小暑","大暑","立秋","處暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"]
LON = {n: ((285 + i*15) % 360) for i, n in enumerate(YEAR_ORDER)}
# approximate day-of-year for each term (for bracketing)
APPROX_DOY = [5,20,4+31,19+31,6+59,21+59,5+90,20+90,5+120,21+120,6+151,21+151,
              7+181,23+181,7+212,23+212,7+243,23+243,8+273,23+273,7+304,22+304,7+334,22+334]

def apparent_sun_lon(d):
    s = ephem.Sun(d)
    return ephem.Ecliptic(ephem.Equatorial(s.g_ra, s.g_dec, epoch=d), epoch=d).lon

def solve(target_deg, guess):
    tgt = math.radians(target_deg)
    def f(dv):
        v = apparent_sun_lon(ephem.Date(dv)) - tgt
        return (v + math.pi) % (2*math.pi) - math.pi
    a, b = guess - 8.0, guess + 8.0
    fa = f(a)
    assert fa < 0, (target_deg, guess, fa)
    for _ in range(60):
        m = (a + b) / 2
        fm = f(m)
        if fm >= 0: b = m
        else: a, fa = m, fm
        if b - a < 1e-8: break
    return (a + b) / 2

def to_utc8(dv):
    y, mo, da, h, mi, s = ephem.Date(dv).tuple()
    return datetime.datetime(y, mo, da, h, mi) + datetime.timedelta(seconds=s) + datetime.timedelta(hours=8)

out = {}
for year in range(1900, 2101):
    base = datetime.datetime(year, 1, 1)
    row = []
    for i, name in enumerate(YEAR_ORDER):
        # guess in UTC: local doy minus 8h
        guess = ephem.Date(datetime.datetime(year,1,1) + datetime.timedelta(days=APPROX_DOY[i]-1, hours=-8))
        t = solve(LON[name], guess)
        local = to_utc8(t)
        secs = int(round((local - base).total_seconds()))
        row.append(secs)
    assert row == sorted(row), year
    out[str(year)] = row
    if year % 25 == 0: print('...', year, file=sys.stderr)

json.dump({"tz":"UTC+8","order":YEAR_ORDER,"epoch":"seconds since Jan 1 00:00:00 UTC+8 of that year","years":out},
          open('/sessions/elegant-relaxed-cray/mnt/玄空紫白/solarterms.raw.json','w'), ensure_ascii=False, separators=(',',':'))
print('done', len(out))

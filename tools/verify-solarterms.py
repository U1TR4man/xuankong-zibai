import json, datetime, sxtwl
d = json.load(open('/sessions/elegant-relaxed-cray/mnt/玄空紫白/solarterms.raw.json'))
order = d['order']
# sxtwl jieqi index order starts 冬至
SX = ['冬至','小寒','大寒','立春','雨水','驚蟄','春分','清明','穀雨','立夏','小滿','芒種','夏至','小暑','大暑','立秋','處暑','白露','秋分','寒露','霜降','立冬','小雪','大雪']
worst = (0,None); diffs=[]
for year in range(1900,2101):
    row = d['years'][str(year)]
    mine = {}
    base = datetime.datetime(year,1,1)
    for i,n in enumerate(order):
        mine[n] = base + datetime.timedelta(seconds=row[i])
    day = sxtwl.fromSolar(year,1,1)
    while True:
        if day.getSolarYear()!=year: break
        if day.hasJieQi():
            name = SX[day.getJieQi()]
            t = sxtwl.JD2DD(day.getJieQiJD())
            ref = datetime.datetime(int(t.Y),int(t.M),int(t.D),int(t.h),int(t.m))+datetime.timedelta(seconds=t.s)
            if name in mine:
                dd = abs((mine[name]-ref).total_seconds())
                diffs.append(dd)
                if dd>worst[0]: worst=(dd,(year,name,mine[name],ref))
        day = day.after(1)
print('compared', len(diffs))
print('max diff sec', worst[0], worst[1])
print('mean diff sec', sum(diffs)/len(diffs))
print('over 60s:', sum(1 for x in diffs if x>60))
print('over 30s:', sum(1 for x in diffs if x>30))

#!/usr/bin/env python3
"""Read-only audit of actual eight Day-02 UNESCO social files, no publishing."""
import io, json, math, hashlib
from pathlib import Path
from PIL import Image, ImageOps, ImageStat, ImageDraw, ImageFilter

ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/"social/4planet-launch-2026/day02"
OUT=ROOT/"ops/social/day02-qa"
OUT.mkdir(parents=True,exist_ok=True)

def dhash(im):
    g=im.convert("L").resize((9,8), Image.Resampling.LANCZOS)
    px=list(g.getdata()); out=0
    for y in range(8):
        for x in range(8):
            out=(out<<1)|int(px[y*9+x]>px[y*9+x+1])
    return out

def edge_bars(im):
    w,h=im.size
    band=max(8,int(w*.025))
    def stats(box):
        g=im.crop(box).convert("L")
        s=ImageStat.Stat(g)
        return {"mean":round(s.mean[0],1),"stddev":round(s.stddev[0],1)}
    left=stats((0,0,band,h));right=stats((w-band,0,w,h))
    mid=stats((w//3,0,2*w//3,h))
    return {"left":left,"right":right,"centre":mid,
      "suspected_black_pillars":all(z["mean"]<8 and z["stddev"]<10 for z in [left,right]) and mid["mean"]>27}
def audit(i):
    path=SOURCE/f"slide{i:02}.jpg"
    rec={"slide":i,"filename":str(path.relative_to(ROOT)),"exists":path.is_file(),"hard_errors":[],"warnings":[]}
    if not path.is_file():
        rec["hard_errors"].append("Missing actual JPEG");return rec,None,None
    data=path.read_bytes()
    rec["bytes"]=len(data);rec["sha256"]=hashlib.sha256(data).hexdigest()
    try:
        with Image.open(io.BytesIO(data)) as obj:
            rec["encoding"]=obj.format;rec["raw_size"]=list(obj.size)
            obj.verify()
        with Image.open(io.BytesIO(data)) as obj:
            img=ImageOps.exif_transpose(obj).convert("RGB")
        rec["dimensions"]=list(img.size)
        rec["ratio"]=round(img.width/img.height,6)
        if rec["encoding"]!="JPEG":rec["hard_errors"].append("Not a JPEG")
        if img.size!=(1080,1350):rec["hard_errors"].append("Carousel canvas not exact 1080x1350")
        if img.width<1080 or img.height<1350:rec["hard_errors"].append("Too few pixels")
        if len(data)>2_000_000:rec["warnings"].append("File exceeds 2MB")
        bars=edge_bars(img);rec["border_analysis"]=bars
        if bars["suspected_black_pillars"]:rec["warnings"].append("Possible black left/right pillar bars")
        small=img.resize((540,675),Image.Resampling.LANCZOS)
        edge=small.convert("L").filter(ImageFilter.FIND_EDGES)
        rec["edge_stddev_proxy"]=round(ImageStat.Stat(edge).stddev[0],1)
        if rec["edge_stddev_proxy"]<7:rec["warnings"].append("Low edge/detail proxy; inspect visually")
        h=dhash(img)
        return rec,img,h
    except Exception as exc:
        rec["hard_errors"].append(f"Unreadable/decode failed: {exc}")
        return rec,None,None

records=[];imgs=[];hashes=[]
for i in range(1,9):
    r,img,h=audit(i);records.append(r);imgs.append(img);hashes.append(h)
for a in range(8):
    for b in range(a+1,8):
        if hashes[a] is not None and hashes[b] is not None:
            distance=(hashes[a]^hashes[b]).bit_count()
            if distance<=4:
                records[a]["warnings"].append(f"Visual similarity to slide {b+1} (dHash {distance}/64); review")
                records[b]["warnings"].append(f"Visual similarity to slide {a+1} (dHash {distance}/64); review")
tilew,tileh=290,401
sheet=Image.new("RGB",(tilew*4,tileh*2),(10,12,18));draw=ImageDraw.Draw(sheet)
for j,img in enumerate(imgs):
    x=j%4*tilew;y=j//4*tileh
    if img:
        thumb=img.resize((275,344),Image.Resampling.LANCZOS)
        sheet.paste(thumb,(x+7,y+6))
    line=f"SLIDE {j+1:02d} | {records[j].get('dimensions','MISSING')}"
    draw.text((x+8,y+355),line,fill=(235,235,235))
    draw.text((x+8,y+376),"PASS" if not records[j]["hard_errors"] else "FAIL",fill=(120,240,170) if not records[j]["hard_errors"] else (245,135,125))
sheet.save(OUT/"day02-8-slide-contact.jpg",quality=89,optimize=True)
summary={"original_media_branch":"media/4planet-social-launch-2026","mode":"read-only","files":8,"files_present":sum(r["exists"] for r in records),"exact_1080x1350":sum(r.get("dimensions")==[1080,1350] for r in records),"hard_failures":sum(bool(r["hard_errors"]) for r in records),"warning_count":sum(len(r["warnings"]) for r in records),"note":"Pixel geometry check is not a platform-rendered Instagram QA; source credits remain in SOURCES-WEEK1.md; visual/editorial rights need human review.", "slides":records}
(OUT/"day02-audit.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False))
print("DAY02_AUDIT_SUMMARY",json.dumps({k:v for k,v in summary.items() if k!="slides"},ensure_ascii=False))
for r in records: print("DAY02_SLIDE",json.dumps({k:v for k,v in r.items() if k in ("slide","dimensions","bytes","warnings","hard_errors","edge_stddev_proxy","border_analysis")},ensure_ascii=False))
if summary["hard_failures"]:raise SystemExit(1)

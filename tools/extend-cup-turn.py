"""Stabilise the recorded turn; restore only off-screen plain cup ends.

The printed sleeve and changing light remain original recorded pixels. The
nearest complete recorded cup supplies the lid/base outside the video viewport.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import subprocess,io
import imageio_ffmpeg

root=Path(__file__).resolve().parents[1]
source=root.parent/'analysis/scrolltide-coffee-2026-10-10/coffee.webm'
out=root/'dist/assets/cup-turn'
base=Image.open(out/'12.webp').convert('RGBA').crop((10,7,330,473)).resize((320,455),Image.Resampling.LANCZOS)
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
for index,t in enumerate(np.linspace(5.72,7.24,24)):
    data=subprocess.run([ffmpeg,'-v','error','-ss',str(float(t)),'-i',str(source),'-frames:v','1','-f','image2pipe','-vcodec','png','-'],capture_output=True,check=True).stdout
    im=Image.open(io.BytesIO(data)).convert('RGBA');arr=np.array(im)[72:568,320:640,:3].mean(axis=2)
    rows=[]
    for yy,row in enumerate(arr):
        xs=np.flatnonzero(row>65)
        if len(xs)>85:rows.append((yy+72,int(xs.min()),int(xs.max())))
    first,last=rows[0][0],rows[-1][0]
    top=last-454 if first<=76 else first
    height=(last-first+1) if first>76 and last<564 else 455
    scale=455/height
    restored=base.copy()
    for y,lo,hi in rows:
        dest=int(round((y-top)*scale))
        if not 0<=dest<455:continue
        strip=im.crop((320,y,640,y+1))
        alpha=Image.new('L',(320,1),0)
        strength=int(min(1,(y-71)/10,(568-y)/10)*255)
        ImageDraw.Draw(alpha).line((max(0,lo-1),0,min(319,hi+1),0),fill=max(0,strength))
        strip.putalpha(alpha)
        restored.alpha_composite(strip,(0,dest))
    canvas=Image.new('RGBA',(340,480))
    canvas.alpha_composite(restored,(10,12))
    canvas.save(out/f'{index:02}.webp',lossless=True)
print('Extended original cup turn: 24 stabilised frames')

from pathlib import Path
from PIL import Image, ImageFilter, ImageDraw
import numpy as np
import json

root=Path(__file__).resolve().parents[1]
source=Image.open(root.parent/'analysis/scrolltide-coffee-2026-10-10/frames/frame-11.png').convert('RGB')
out=root/'dist/assets'
# The separate airborne beans are recovered as connected components, avoiding
# rectangular clipping and retaining their original recorded arrangement.
box=(548,180,960,385)
im=source.crop(box);a=np.array(im)
binary=((a[:,:,0]>65)&(a[:,:,1]>40)).astype('uint8')*255
binary=np.array(Image.fromarray(binary).filter(ImageFilter.MaxFilter(5)))>0
seen=np.zeros_like(binary);components=[]
for yy,xx in zip(*np.where(binary)):
    if seen[yy,xx]:continue
    todo=[(int(yy),int(xx))];seen[yy,xx]=True;coords=[]
    while todo:
        y,x=todo.pop();coords.append((y,x))
        for dy,dx in [(0,1),(0,-1),(1,0),(-1,0)]:
            ny,nx=y+dy,x+dx
            if 0<=ny<binary.shape[0] and 0<=nx<binary.shape[1] and binary[ny,nx] and not seen[ny,nx]:seen[ny,nx]=True;todo.append((ny,nx))
    if len(coords)<110:continue
    ys,xs=zip(*coords);left,right=min(xs),max(xs);top,bottom=min(ys),max(ys)
    gx,gy=left+box[0],top+box[1]
    if right-left<12 or bottom-top<12 or (gy>=363 and gx<745):continue
    if gx>895 and right-left<38 and bottom-top<45:continue # registration cross
    components.append((gx,gy,right-left+1,bottom-top+1,coords))
items=[]
for index,(gx,gy,w,h,coords) in enumerate(sorted(components,key=lambda c:(c[1],c[0]))):
    crop=source.crop((gx,gy,gx+w,gy+h)).convert('RGBA');mask=Image.new('L',(w,h),0);draw=ImageDraw.Draw(mask)
    byrow={}
    for y,x in coords:byrow.setdefault(y+box[1]-gy,[]).append(x+box[0]-gx)
    for y,xs in byrow.items():draw.line((min(xs),y,max(xs),y),fill=255)
    crop.putalpha(mask.filter(ImageFilter.GaussianBlur(.65)))
    name=f'airborne-{index:02}.webp';crop.save(out/name,lossless=True)
    items.append({'src':f'assets/{name}','x':gx-57,'y':gy-344,'width':w,'height':h})
# Include all of the wooden bowl and its pile of beans, excluding card pixels.
spoon_source=Image.open(root.parent/'analysis/scrolltide-coffee-2026-10-10/frames/frame-10.png').convert('RGB')
spoon_box=(480,373,960,503);spoon=spoon_source.crop(spoon_box).convert('RGBA');aa=np.array(spoon)
mask=np.array(Image.fromarray(((aa[:,:,0]>74)&(aa[:,:,1]>46)).astype('uint8')*255).filter(ImageFilter.MaxFilter(3)))
drawn=Image.new('L',spoon.size,0);d=ImageDraw.Draw(drawn)
for y in range(mask.shape[0]):
    xs=np.flatnonzero(mask[y]>0)
    if len(xs)>12:d.line((int(xs.min()),y,int(xs.max()),y),fill=255)
spoon.putalpha(drawn.filter(ImageFilter.GaussianBlur(.65)));spoon.save(out/'spoon.webp',lossless=True)
(root/'dist/beans.js').write_text('export const beans = '+json.dumps(items)+';\n',encoding='utf-8')
canvas=Image.new('RGBA',(960,572),'#1d120b')
for item in items:canvas.alpha_composite(Image.open(root/'dist'/item['src']).convert('RGBA'),(item['x']+57,item['y']+344))
canvas.alpha_composite(spoon,(480,373));canvas.convert('RGB').save(root/'discovery-review.jpg')
print(json.dumps(items))

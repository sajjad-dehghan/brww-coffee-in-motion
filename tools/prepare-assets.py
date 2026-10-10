"""Extract the original visible artwork from the supplied desktop recording.

All page copy and controls are implemented separately in HTML. These assets
contain product artwork only; no screen recording is used as the website UI.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg
import subprocess
import numpy as np
import json

ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT.parent / 'analysis' / 'scrolltide-coffee-2026-10-10'
OUT = ROOT / 'dist' / 'assets'
OUT.mkdir(parents=True, exist_ok=True)
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

def original(time):
    data = subprocess.run([FFMPEG, '-v', 'error', '-ss', str(time), '-i', str(REFERENCE / 'coffee.webm'), '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True, check=True).stdout
    import io
    return Image.open(io.BytesIO(data)).convert('RGB')

def cutout(image, bounds, points, name):
    crop = image.crop(bounds).convert('RGBA')
    mask = Image.new('L', crop.size, 0)
    ImageDraw.Draw(mask).polygon([(x-bounds[0],y-bounds[1]) for x,y in points], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(.45))
    crop.putalpha(mask)
    crop.save(OUT / name, lossless=True)

hero = original(0)
# The masks follow the silhouette; header/control pixels are excluded.
cutout(hero, (396,0,948,540), [(528,0),(851,0),(881,7),(898,23),(911,69),(935,98),(916,142),(914,181),(893,218),(873,248),(868,340),(861,425),(851,488),(832,520),(772,533),(680,529),(652,511),(633,454),(613,329),(607,278),(600,237),(593,211),(582,193),(550,174),(493,174),(460,180),(439,195),(421,228),(414,259),(421,312),(433,402),(441,465),(457,488),(499,497),(548,497),(578,482),(590,441),(601,383),(611,331),(624,267),(636,211),(579,200),(560,189),(506,163),(458,160),(455,145),(437,141),(439,129),(482,137),(470,113),(481,104),(519,121),(544,117),(533,100),(515,83),(518,72),(550,83),(575,70),(590,49),(584,19)], 'hero-art.webp')
# Refine the two independent cup contours and splash instead of clipping the
# front cup with the rear cup's contour. Remove the recorded mouse pointer.
hero_crop=hero.crop((396,0,948,540)).convert('RGBA')
hero_mask=Image.new('L',hero_crop.size,0);hd=ImageDraw.Draw(hero_mask)
small=[(446,177),(563,177),(575,180),(578,199),(590,202),(598,213),(605,227),(602,238),(595,246),(590,304),(581,389),(574,467),(562,487),(545,494),(486,496),(458,489),(444,480),(439,449),(429,371),(418,289),(416,249),(404,245),(400,237),(400,226),(407,216),(418,205),(426,199),(430,182)]
large=[(596,206),(624,189),(687,172),(777,158),(869,140),(893,178),(877,243),(870,302),(863,365),(858,425),(853,490),(841,516),(803,529),(742,532),(689,527),(667,518),(653,478),(641,412),(626,336),(610,265)]
for shape in [small,large]:hd.polygon([(x-396,y) for x,y in shape],fill=255)
ha=np.array(hero);ma=np.array(hero_mask)
foreground=(ha[:200,396:948].mean(axis=2)>42)
ma[:200][foreground]=255
hero_mask=Image.fromarray(ma).filter(ImageFilter.GaussianBlur(.45))
hero_crop.putalpha(hero_mask)
alternate=Image.open(REFERENCE/'frames'/'frame-15.png').convert('RGBA')
hero_crop.paste(alternate.crop((560,252,580,281)),(164,252))
hero_crop.save(OUT/'hero-art.webp',lossless=True)

products = original(3.4)
# At this timestamp products are fully visible, well below the sticky header.
# Determine their actual vertical position from the lid highlights.
for name,x1,x2 in [('cappuccino',118,238),('latte',400,532),('mocha',684,824)]:
    a=np.array(products)
    # A second, known reference frame is used to keep all product scales exact.
products=Image.open(REFERENCE/'frames'/'frame-04.png').convert('RGB')
cutout(products,(130,85,265,274),[(161,96),(230,96),(237,101),(238,109),(246,112),(249,120),(247,126),(243,132),(243,145),(239,192),(235,237),(230,256),(215,264),(170,264),(158,258),(153,233),(148,189),(144,146),(142,133),(138,128),(138,118),(143,111),(150,108),(151,101)],'cappuccino.webp')
cutout(products,(413,84,554,277),[(440,94),(519,94),(529,97),(531,104),(537,109),(541,114),(541,123),(536,127),(534,142),(529,197),(523,248),(518,262),(508,268),(459,269),(446,265),(440,252),(434,205),(429,155),(426,133),(421,129),(420,122),(423,111),(429,107),(431,98)],'latte.webp')
cutout(products,(701,80,843,277),[(734,85),(804,85),(814,90),(819,96),(820,104),(827,108),(831,112),(831,121),(825,127),(824,141),(820,189),(812,251),(806,264),(793,270),(748,269),(735,264),(729,250),(721,199),(716,150),(713,133),(707,128),(708,117),(713,108),(720,104),(723,94)],'mocha.webp')

# The spoon and individual airborne beans are extracted from the last section.
quiz=Image.open(REFERENCE/'frames'/'frame-10.png').convert('RGB')
cutout(quiz,(536,214,960,495),[(563,290),(581,270),(583,249),(599,231),(617,230),(630,249),(624,276),(604,290),(593,312),(577,337),(556,350),(545,344),(542,328),(552,305)],'bean-1.webp')
cutout(quiz,(636,182,700,253),[(655,184),(673,190),(691,216),(690,234),(678,242),(660,230),(643,207),(643,192)],'bean-2.webp')
cutout(quiz,(714,176,788,259),[(748,178),(768,192),(781,220),(773,242),(749,244),(732,225),(722,203),(730,186)],'bean-3.webp')
cutout(quiz,(824,178,894,250),[(854,182),(878,184),(888,197),(878,219),(866,240),(847,242),(837,228),(839,207)],'bean-4.webp')
cutout(quiz,(757,265,830,329),[(786,270),(807,279),(819,297),(813,312),(797,322),(780,315),(766,300),(766,283)],'bean-5.webp')
cutout(quiz,(638,292,711,360),[(669,298),(690,301),(704,316),(698,333),(680,348),(660,349),(646,336),(649,318)],'bean-6.webp')
cutout(quiz,(536,330,960,500),[(590,393),(612,383),(636,383),(650,376),(664,379),(671,372),(685,375),(697,376),(712,380),(736,393),(758,406),(789,414),(837,416),(894,417),(959,419),(959,473),(898,463),(839,456),(790,456),(756,457),(739,466),(715,479),(684,487),(644,486),(614,477),(593,461),(580,443),(575,427),(580,408)],'spoon.webp')

# Stabilise a short original cup-turn sequence into transparent frames.
turns=OUT/'cup-turn'
turns.mkdir(exist_ok=True)
for i,t in enumerate(np.linspace(6.46,6.62,24)):
    im=original(float(t)); ar=np.array(im)
    region=ar[66:565,320:640]
    lum=region.mean(axis=2)
    rows=[]
    for y,row in enumerate(lum):
        xs=np.flatnonzero(row>65)
        if len(xs)>85: rows.append((y,int(xs.min()),int(xs.max())))
    # Cup texture is much lighter than the uninterrupted surrounding background.
    top,bottom=rows[0][0],rows[-1][0]
    crop=im.crop((320,66+top,640,66+bottom+1)).convert('RGBA')
    mask=Image.new('L',crop.size,0);d=ImageDraw.Draw(mask)
    for y,lo,hi in rows: d.line((lo,y-top,hi,y-top),fill=255)
    mask=mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(.55))
    crop.putalpha(mask)
    canvas=Image.new('RGBA',(340,480))
    crop.thumbnail((316,466),Image.Resampling.LANCZOS)
    canvas.alpha_composite(crop,((340-crop.width)//2,(480-crop.height)//2))
    canvas.save(turns/f'{i:02}.webp',lossless=True)

receipt={'source':str(REFERENCE/'coffee.webm'),'asset_count':len(list(OUT.rglob('*.webp'))),'cup_frames':24,'notes':'Original recorded product artwork; real HTML text and controls are implemented separately.'}
(ROOT/'asset-receipt.json').write_text(json.dumps(receipt,indent=2),encoding='utf-8')
print(json.dumps(receipt))

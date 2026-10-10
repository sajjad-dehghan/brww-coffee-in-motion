from pathlib import Path
from PIL import Image
import json,hashlib,shutil,zipfile,struct
p=Path(r'D:\Projects\Coffee\site');v=p/'verification';samples=json.loads((v/'about-final-reveal-samples.json').read_text());frames=[];dur=[]
for i,s in enumerate(samples):
 frames.append(Image.open(v/f'about-motion-capture/final-{i:02}.jpg').convert('RGB'))
 nexttime=samples[i+1]['time'] if i+1<len(samples) else s['time']+650
 dur.append(max(20,round((nexttime-s['time'])/10)*10))
frames[0].save(v/'about-scroll-preview.gif',save_all=True,append_images=frames[1:],duration=dur,loop=0,optimize=False)
shutil.copyfile(p/'artwork/v3/cup-frames/000.png',p/'artwork/v3/cup-poster.png')
tracking=json.loads(Path(r'D:\Projects\Coffee\analysis\scrolltide-coffee-2026-10-10/about-motion/title-tracking.json').read_text());(v/'about-reference-tracking.json').write_text(json.dumps(tracking,indent=2))
b=(p/'dist/assets/cup-animation-v3.webp').read_bytes();offset=12;times=[]
while offset<len(b):
 name=b[offset:offset+4];n=struct.unpack('<I',b[offset+4:offset+8])[0]
 if name==b'ANMF':times.append(int.from_bytes(b[offset+8+12:offset+8+15],'little'))
 offset+=8+n+(n%2)
assert len(times)==420 and 13990<=sum(times)<=14010
fallback=json.loads((v/'cup-fallback-samples.json').read_text())
record={'revision':'v4-about-scroll-and-browser-fallback','reference':'https://www.scrolltide.co/templates/coffee','reference_tracking':'about-reference-tracking.json','observations':{'first_row':'Fade and inward horizontal translation visible around 4.6-5.0 seconds; left heading moves from x75 to x91 at 960px.','second_row':'Reveals later as the page scrolls farther down.','recording_limit':'Recorded preview; original implementation and Firefox installation are not accessible.'},'implementation':{'entrance_seconds':.5,'horizontal_start_rem':38,'trigger_viewport_fraction':.84,'independent_rows':True,'cup_motion_scroll_control':False},'browser_checks':{'engine':'Codex in-app browser','reference_size':[960,572],'first_row_reveals_while_second_row_hidden':True,'second_row_reveals_after_more_scroll':True,'video_without_webgl':{'size':[680,960],'fps':30,'period_seconds':14,'stationary_scroll_positions':sorted(set(s['scrollY'] for s in fallback)),'start_time':fallback[0]['video']['time'],'end_time':fallback[-1]['video']['time'],'playing':True},'webp_without_webgl_or_video':{'size':[680,960],'frames':len(times),'duration_ms':sum(times),'image_loaded_in_browser':True},'mobile_390':{'scroll_width':390,'cup_width':300},'mobile_320':{'scroll_width':320,'cup_width':272,'cup_bounds':[24,296]},'firefox_native_test':'unavailable; no connected Firefox control','errors_observed':[]},'reduced_motion':'Implemented; OS/browser emulation was not available for direct runtime verification.','publication':'Local preview updated. Earlier source-push connection resets still prevent a verified hosted deployment.'}
(v/'about-and-firefox-verification.json').write_text(json.dumps(record,indent=2)+'\n')
main=json.loads((v/'verification.json').read_text());main['about_scroll_and_browser_fallback']=record;(v/'verification.json').write_text(json.dumps(main,indent=2)+'\n')
readme=p/'README.txt';readme.write_text(readme.read_text()+'''
ABOUT SCROLL AND BROWSER COMPATIBILITY (V4)
------------------------------------------
Each feature row enters from its outside edge with a 0.5s fade and horizontal
translation, triggered near 84% of viewport height. Normal document scrolling
continues; the cup's automatic pose is independent of scrolling.
The silent small still-image fallback is replaced by renders of the same model:
680x960 H.264 video at 30fps, 14 seconds; a transparent animated WebP is the
secondary path when video playback is unavailable. Reduced motion uses a crisp
680x960 poster. Both animation paths pause off-screen/in hidden tabs.
WebGL uses at least 1.5x rendering resolution and requests the performance GPU.
Preview: http://127.0.0.1:5188/#about
Force pre-rendered path: http://127.0.0.1:5188/?cup-renderer=image#about
Force WebP path: http://127.0.0.1:5188/?cup-renderer=webp#about
Native Firefox was not connected; compatibility paths were verified in IAB.
See verification/about-and-firefox-verification.json and about-scroll-preview.gif.
Render source: artwork/v3/render-recipe.json and cup-export.html. To regenerate,
copy cup-export.html into dist temporarily, run the local server, open that page,
press Export, and download the ZIP through the UI. Remove the temporary page
from dist when finished. Raw 420 PNG frames are preserved locally under
artwork/v3/cup-frames but excluded from delivery archives and Git.
''')
receipt=json.loads((p/'asset-receipt.json').read_text());receipt['revision']='v4-about-scroll-and-browser-fallback';receipt['files']=[{'path':str(f.relative_to(p)).replace('\\','/'),'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()} for f in sorted((p/'dist').rglob('*')) if f.is_file()];receipt['cup_render']=record['browser_checks']['video_without_webgl'];(p/'asset-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
archive=p.parent/'brww-coffee-v4-browser-motion.zip'
exclude={'.git','.sites-runtime','.sites-checkout','node_modules','about-motion-capture','discovery-motion-capture','cup-frames'}
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for f in p.rglob('*'):
  if f.is_file() and not any(part in exclude for part in f.relative_to(p).parts) and f.suffix!='.zip':z.write(f,str(Path('brww-coffee')/f.relative_to(p)))
with zipfile.ZipFile(archive) as z:print('ZIP files',len(z.namelist()),'bad',z.testzip(),'bytes',archive.stat().st_size)
print('WebP duration',sum(times),'ms',len(times),'frames')

from pathlib import Path
from PIL import Image
import numpy as np,json,zipfile,hashlib
p=Path(r'D:\Projects\Coffee\site');v=p/'verification';samples=json.loads((v/'hero-depth-browser-samples.json').read_text())
files=[*(f'rest-{i}.jpg' for i in range(10)),*(f'left-{i}.jpg' for i in range(12)),*(f'right-{i}.jpg' for i in range(12)),*(f'exit-{i}.jpg' for i in range(12))]
frames=[Image.open(v/'hero-depth-capture'/name).convert('RGB') for name in files];dur=[]
for i,s in enumerate(samples):
 nexttime=samples[i+1]['time'] if i+1<len(samples) else s['time']+700
 dur.append(max(20,round((nexttime-s['time'])/10)*10))
frames[0].save(v/'hero-depth-preview.gif',save_all=True,append_images=frames[1:],duration=dur,loop=0,optimize=False)
assert all(s['scrollY']==0 for s in samples)
assert all(s['heading']==samples[0]['heading'] and s['header']==samples[0]['header'] for s in samples)
assert samples[9]['state']=='rest' and samples[21]['state']=='active' and samples[33]['state']=='active' and samples[-1]['state']=='rest'
tracking=json.loads(Path(r'D:\Projects\Coffee\analysis\scrolltide-coffee-2026-10-10/hero-hover/tracking.json').read_text());(v/'hero-reference-tracking.json').write_text(json.dumps(tracking,indent=2))
record={'revision':'v5-hero-pointer-depth','reference':'https://www.scrolltide.co/templates/coffee','source_segment_seconds':[0,1],'reference_evidence':'hero-reference-tracking.json','observation':'Very subtle movement of cup regions (roughly 0-1px per axis in sampled frames) with static text and a soft foreground shadow. Source code is unavailable, so exact effect parameters cannot be recovered.','implementation':{'same_transparent_artwork':True,'move_x_rem_max':2.5,'move_y_rem_range':[-2.7,.3],'depth_rem':6,'perspective_rem':1400,'scale':1.002,'tilt_x_deg_max':.45,'tilt_y_deg_max':.6,'tilt_z_deg_max':.13,'follow_transition_seconds':.18,'return_transition_seconds':.45,'alpha_hit_test':{'size':[160,160],'threshold':48},'touch_and_reduced_motion':'disabled','scroll_control':False},'browser_checks':{'engine':'Codex in-app browser','viewport':[960,572],'left_and_right_cup_hover':'passed','transparent_space_returns_to_rest':'passed','header_and_copy_bounds_unchanged':'passed','scroll_positions':sorted(set(s['scrollY'] for s in samples)),'explore_link_navigates_to_menu':'passed','native_firefox':'not available','touch_and_os_reduced_motion_runtime':'not emulated'},'preview':'hero-depth-preview.gif'}
(v/'hero-depth-verification.json').write_text(json.dumps(record,indent=2)+'\n')
main=json.loads((v/'verification.json').read_text());main['hero_pointer_depth']=record;(v/'verification.json').write_text(json.dumps(main,indent=2)+'\n')
readme=p/'README.txt';marker='\nHERO POINTER DEPTH (V5)';readme.write_text(readme.read_text().split(marker)[0]+marker+'''
-----------------------
The transparent hero artwork uses alpha-shaped shadows and a small pointer-driven
perspective lift. Only opaque cup/splash pixels trigger it; text, navigation and
transparent artwork margins do not. Pointer movement is coalesced with RAF; CSS
smooths following and return. Touch and reduced motion remain still. Scrolling,
window resize and tab hiding reset the effect. No WebGL is required for this effect.
See verification/hero-depth-verification.json and hero-depth-preview.gif.
''')
ignore=p/'.gitignore';text=ignore.read_text();line='verification/hero-depth-capture/'
if line not in text:ignore.write_text(text+'\n'+line+'\n')
receipt=json.loads((p/'asset-receipt.json').read_text());receipt['revision']='v5-hero-pointer-depth';receipt['files']=[{'path':str(f.relative_to(p)).replace('\\','/'),'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()} for f in sorted((p/'dist').rglob('*')) if f.is_file()];(p/'asset-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
archive=p.parent/'brww-coffee-v5-hero-depth.zip';exclude={'.git','.sites-runtime','.sites-checkout','node_modules','about-motion-capture','discovery-motion-capture','hero-depth-capture','cup-frames'}
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for f in p.rglob('*'):
  if f.is_file() and not any(part in exclude for part in f.relative_to(p).parts) and f.suffix!='.zip':z.write(f,str(Path('brww-coffee')/f.relative_to(p)))
with zipfile.ZipFile(archive) as z:print('ZIP files',len(z.namelist()),'bad',z.testzip(),'bytes',archive.stat().st_size)
print('Browser samples',len(samples),'unchanged heading/header verified')

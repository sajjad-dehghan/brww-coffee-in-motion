from pathlib import Path
import json
from PIL import Image

root=Path(__file__).resolve().parents[1]
samples=json.loads((root/'verification/discovery-motion-browser-samples.json').read_text())
start=samples[0]['time'];chosen=[(i,x) for i,x in enumerate(samples) if x['time']-start<3500]
frames=[];durations=[]
for j,(i,sample) in enumerate(chosen):
    # A browser recording of the actual page; retain surrounding card and footer.
    im=Image.open(root/f'verification/discovery-motion-capture/{i:02}.jpg').convert('RGB')
    frames.append(im.crop((40,205,960,548)).resize((920,343)))
    next_time=chosen[j+1][1]['time'] if j+1<len(chosen) else start+3500
    durations.append(max(10,round((next_time-sample['time'])/10)*10))
frames[0].save(root/'verification/discovery-motion-preview.gif',save_all=True,append_images=frames[1:],duration=durations,loop=0,optimize=False,disposal=2)
record={
    'reference':'../analysis/scrolltide-coffee-2026-10-10/coffee.webm',
    'source_segment_seconds':[8.9,11.8],
    'observed_motion':'Spoon and all floating beans translate vertically in phase; card and text stay fixed.',
    'reference_fit':{'period_seconds':3.495,'amplitude_px_at_960':7.161,'rms_error_px':.127},
    'implementation':{'period_seconds':3.5,'amplitude_rem':7.2,'easing':'cubic-bezier(.37,0,.63,1)','scroll_control':False},
    'browser_desktop':{'width':960,'height':572,'scroll_positions':sorted(set(s['scrollY'] for s in samples)),'card_top_positions':sorted(set(s['cardTop'] for s in samples)),'observed_travel_px':round(max(s['artTop'] for s in samples)-min(s['artTop'] for s in samples),3)},
    'preview':'discovery-motion-preview.gif'
}
(root/'verification/discovery-motion-verification.json').write_text(json.dumps(record,indent=2)+'\n')
print('Saved browser motion preview:',len(frames),'frames',sum(durations),'ms')

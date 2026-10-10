from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = Path('C:/Users/sedwna/.codex/generated_images/01a125e5-4cda-7d40-9f78-477cb961cdf3')
files = {
 'hero': 'exec-a4368291-afbc-44c3-bd2b-9204be3e8bd8.png',
 'cappuccino': 'exec-f85a2e50-f5ce-433e-9384-4dc2973e7207.png',
 'latte': 'exec-825bebb5-eab8-4ed9-9122-a69e6cceb00d.png',
 'mocha': 'exec-5eaeb981-a1f1-432e-9b35-85396bc4ec9f.png',
 'discovery': 'exec-7c8cd7f4-05e6-4c0e-b521-cd434b8f54b4.png'
}
for name, file in files.items():
 image = Image.open(source / file)
 image.save(root / 'artwork/v2' / (name+'.png'))
 # Preserve the generated alpha. Only encode a web delivery format; no new masking.
 image.save(root / 'dist/assets' / (name+'-v2.webp'), quality=94, method=6, exact=True)
 print(name, image.size, image.mode)

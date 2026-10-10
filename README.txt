BRWW COFFEE
===========

Interactive reconstruction of the public Scrolltide Coffee desktop recording.
Reference: https://www.scrolltide.co/templates/coffee

RUN LOCALLY
-----------
Requires Node.js 20 or later. There are no application package dependencies.
Run: npm run dev
Open: http://127.0.0.1:5188
Run checks: npm run check
The deployable static output is already in dist/; no build step is required.

PROJECT
-------
dist/index.html     Semantic page structure and the four reference sections
dist/styles.css     Desktop geometry and mobile layouts
dist/app.js         Navigation, dialogs, quiz and scroll-driven artwork
dist/store.js       Product data, integer currency calculations, cart sanitisation
dist/beans.js       Positions of the original airborne bean artwork
dist/assets/        Local artwork and fonts (no runtime third-party dependencies)
tests/              Behavioural tests for ordering state and recommendations
tools/server.mjs    Local static preview server
tools/*.py          Reproducible reference-artwork extraction helpers
verification/       Browser captures and verification record
.openai/hosting.json  Private Sites identity and static deployment configuration

IMPLEMENTED BEHAVIOUR
--------------------
Navigation and mobile menu; three selectable products; add/remove quantities;
integer-cent price totals; cart persistence on this device; a three-step coffee
quiz; saved local preferences; native accessible dialogs and keyboard dismissal;
scroll-driven original cup-turn frames; reduced-motion handling.

REFERENCE BOUNDARIES
-------------------
This is a real HTML/CSS/JavaScript page, not a screenshot/video used as the UI.
Product artwork comes from the supplied publicly visible preview recording.
The original Figma file, source code, high-resolution assets and mobile design
were not supplied. Typography and some geometry are reconstructed. Exact pixel
identity is not verified. The mobile composition is newly adapted.

The original recorded cup is partly outside its viewport at some angles. The
turn extraction stabilises the visible original sleeve/light pixels and uses a
complete recorded cup to restore off-screen plain ends. It is not real-time 3D.

Cart and preferences are browser-local. No real account service, payment or order
submission is connected. The order review states this explicitly. Do not treat
ratings and brand claims reproduced from the design as independently verified.
Footer platform links are generic destinations, not verified BRWW accounts.

REGENERATE ARTWORK
------------------
Use the saved original recording in ../analysis/scrolltide-coffee-2026-10-10/.
The Python environment requires Pillow, numpy and imageio_ffmpeg.
Run these tools in order:
  python tools/prepare-assets.py
  python tools/refine-discovery.py
  python tools/extend-cup-turn.py

PREVIEW AND PUBLICATION
-----------------------
The private Site address is:
https://brww-coffee-studio.finati001.chatgpt.site
Consult verification/deployment.json for the actual deployment outcome.

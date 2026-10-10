BRWW - COFFEE IN MOTION
======================

See README.md for the portfolio overview and current public demo.
This file preserves the detailed implementation and artwork notes.

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
dist/app.js         Navigation, dialogs, quiz and artwork integration
dist/store.js       Product data, integer currency calculations, cart sanitisation
dist/cup-model.js   Editable seven-part 3D cup geometry
dist/cup-scene.js   Materials, lighting and automatic animation
dist/vendor/        Local Three.js runtime and its MIT license
artwork/v2/         Full-resolution PNGs, model JSON and generation prompts
dist/assets/        Local artwork and fonts (no runtime third-party dependencies)
tests/              Behavioural tests for ordering state and recommendations
tools/server.mjs    Local static preview server
tools/*.py          Original extraction and V2 artwork packaging helpers
verification/       Browser captures and verification record
.openai/hosting.json  Private Sites identity and static deployment configuration

IMPLEMENTED BEHAVIOUR
--------------------
Navigation and mobile menu; three selectable products; add/remove quantities;
integer-cent price totals; cart persistence on this device; a three-step coffee
quiz; saved local preferences; native accessible dialogs and keyboard dismissal;
automatic real-time 3D cup rotation; reduced-motion handling.

REFERENCE BOUNDARIES
-------------------
This is a real HTML/CSS/JavaScript page, not a screenshot/video used as the UI.
V2 hero, product and discovery images were rebuilt with built-in ImageGen,
using the publicly visible preview as reference. Full-resolution PNGs and
exact prompts are preserved in artwork/v2/. WebP copies retain alpha.
The original Figma file, source code, high-resolution assets and mobile design
were not supplied. Typography and some geometry are reconstructed. Exact pixel
identity is not verified. The mobile composition is newly adapted.

The V2 central cup is an editable real-time Three.js model with seven parts,
AI-created paper and kraft textures, molded lid geometry, physical materials
and warm studio lights. Automatic eased turning is independent of scrolling.
Animation pauses when the cup is off-screen or the page is hidden. Reduced
motion shows a static front pose. Video and animated WebP renders of the same model are the WebGL fallbacks.
The original extraction assets are retained separately for historical review.

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
Public repository: https://github.com/sajjad-dehghan/brww-coffee-in-motion
Public demo: https://sajjad-dehghan.github.io/brww-coffee-in-motion/
The earlier private Sites registration was not successfully deployed.
.openai/hosting.json retains that existing registration for local history.

DISCOVERY MOTION
----------------
The original preview has a shared vertical float for the spoon and beans,
independent of scrolling. Measurement of its stationary 8.9-11.8s segment
yields a 3.495s sine period and a 7.161px amplitude at 960px. The implementation
uses a 3.5s loop with a 7.2rem amplitude and smooth sinusoidal easing.
It pauses off-screen and in hidden pages; reduced motion disables it.
See verification/discovery-motion-verification.json and the browser GIF.

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

HERO POINTER DEPTH (V5)
-----------------------
The transparent hero artwork uses alpha-shaped shadows and a small pointer-driven
perspective lift. Only opaque cup/splash pixels trigger it; text, navigation and
transparent artwork margins do not. Pointer movement is coalesced with RAF; CSS
smooths following and return. Touch and reduced motion remain still. Scrolling,
window resize and tab hiding reset the effect. No WebGL is required for this effect.
See verification/hero-depth-verification.json and hero-depth-preview.gif.

// The hero remains one transparent composition. Only its foreground moves;
// the copy, background and navigation keep their original positions.
export function mountHeroDepth(hero, art, reduced) {
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let alpha = null, raf = 0, point = null, active = false;
  const properties = ['--hero-x','--hero-y','--hero-z','--hero-rx','--hero-ry','--hero-rz','--hero-scale'];
  art.draggable = false;
  art.dataset.depth = 'rest';

  // Read a small alpha mask once. Transparent space never triggers the effect.
  art.decode().then(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 160;
    const context = canvas.getContext('2d', {willReadFrequently:true});
    context.drawImage(art, 0, 0, 160, 160);
    alpha = context.getImageData(0, 0, 160, 160).data;
  }).catch(() => { /* Leave the artwork still if its alpha mask is unavailable. */ });

  function reset() {
    cancelAnimationFrame(raf); raf = 0; point = null;
    if (!active) return;
    active = false;
    art.classList.remove('depth-active');
    art.dataset.depth = 'rest';
    properties.forEach(name => art.style.removeProperty(name));
  }
  function draw() {
    raf = 0;
    if (!point || !alpha || !fine.matches || reduced.matches || document.hidden) { reset(); return; }
    // Layout offsets do not include the animated transform, avoiding feedback.
    const rect = hero.getBoundingClientRect();
    const x = (point.x - rect.left - art.offsetLeft) / art.offsetWidth;
    const y = (point.y - rect.top - art.offsetTop) / art.offsetHeight;
    if (x < 0 || y < 0 || x >= 1 || y >= 1 || alpha[(Math.floor(y*160)*160+Math.floor(x*160))*4+3] < 48) { reset(); return; }
    const nx = Math.max(-1, Math.min(1, (x-.55)*2));
    const ny = Math.max(-1, Math.min(1, (y-.65)*2));
    active = true;
    art.dataset.depth = 'active';
    art.classList.add('depth-active');
    art.style.setProperty('--hero-x', `${nx*2.5}rem`);
    art.style.setProperty('--hero-y', `${-1.2+ny*1.5}rem`);
    art.style.setProperty('--hero-z', '6rem');
    art.style.setProperty('--hero-rx', `${-ny*.45}deg`);
    art.style.setProperty('--hero-ry', `${nx*.6}deg`);
    art.style.setProperty('--hero-rz', `${nx*.13}deg`);
    art.style.setProperty('--hero-scale', '1.002');
  }
  function move(event) {
    if (event.pointerType !== 'mouse' || !fine.matches || reduced.matches) { reset(); return; }
    if (event.target.closest('a,button,input')) { reset(); return; }
    point = {x:event.clientX, y:event.clientY};
    if (!raf) raf = requestAnimationFrame(draw);
  }
  hero.addEventListener('pointermove', move, {passive:true});
  hero.addEventListener('pointerleave', reset);
  hero.addEventListener('pointercancel', reset);
  addEventListener('scroll', reset, {passive:true});
  addEventListener('resize', reset);
  document.addEventListener('visibilitychange', reset);
  fine.addEventListener('change', reset);
  reduced.addEventListener('change', reset);
  return {dispose(){
    reset();
    hero.removeEventListener('pointermove', move);
    hero.removeEventListener('pointerleave', reset);
    hero.removeEventListener('pointercancel', reset);
    removeEventListener('scroll', reset);
    removeEventListener('resize', reset);
    document.removeEventListener('visibilitychange', reset);
    fine.removeEventListener('change', reset);
    reduced.removeEventListener('change', reset);
  }};
}

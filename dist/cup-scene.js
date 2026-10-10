import * as T from './vendor/three.module.js';
import {createCup} from './cup-model.js';

function surface(kind) {
  const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1024;
  const c=canvas.getContext('2d');let seed=kind==='paper'?4289:9801;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  c.fillStyle=kind==='paper'?'#dcd1ac':'#4e4439';c.fillRect(0,0,2048,1024);
  for(let i=0;i<145000;i++){const x=random()*2048,y=random()*1024;const bright=random()>.5;c.fillStyle=bright?'rgba(255,244,207,.085)':'rgba(46,30,17,.09)';c.fillRect(x,y,.4+random()*1.4,.3+random()*1.5);}
  for(let i=0;i<7300;i++){const x=random()*2048,y=random()*1024,r=.5+random()**3*5;c.fillStyle=`rgba(${kind==='paper'?'63,48,26':'37,27,18'},${.2+random()*.65})`;c.beginPath();c.ellipse(x,y,r,r*(.3+random()*.65),random()*Math.PI,0,Math.PI*2);c.fill();if(random()>.6){c.strokeStyle='#ebdfb27a';c.lineWidth=.6;c.stroke();}}
  if(kind==='sleeve'){c.font='400 215px Arial, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#cdbb94';c.fillText('BRWW',1024,512,310);}
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
  return map;
}

export async function mountCup(container) {
  let renderer;
  try {renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});} catch {return null;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  const scene=new T.Scene();const camera=new T.PerspectiveCamera(27,1,.1,30);camera.position.set(0,.2,6.9);camera.lookAt(0,.03,0);
  scene.add(new T.HemisphereLight(0xfff3d9,0x291d16,2.0));
  const key=new T.DirectionalLight(0xffedd4,3.3);key.position.set(-3,4,4);scene.add(key);
  const fill=new T.DirectionalLight(0xffffff,1.1);fill.position.set(3,1,2);scene.add(fill);
  const rim=new T.DirectionalLight(0xeacba3,2);rim.position.set(2,3,-3);scene.add(rim);
  const loader=new T.TextureLoader();
  let paper,sleeve;
  try {
    const textures=await Promise.all([loader.loadAsync('assets/paper-texture-v2.webp'),loader.loadAsync('assets/sleeve-texture-v2.webp')]);
    paper=textures[0];paper.colorSpace=T.SRGBColorSpace;paper.wrapS=T.RepeatWrapping;paper.repeat.set(1.7,1);paper.anisotropy=8;
    const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1024;const c=canvas.getContext('2d');
    for(let x=0;x<2048;x+=512)c.drawImage(textures[1].image,x,0,512,1024);
    c.font='400 215px Arial, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#d4c5a1';c.fillText('BRWW',1024,512,310);
    sleeve=new T.CanvasTexture(canvas);sleeve.colorSpace=T.SRGBColorSpace;sleeve.anisotropy=8;textures[1].dispose();
  } catch {paper=surface('paper');sleeve=surface('sleeve');}
  const cup=createCup({paper:new T.MeshStandardMaterial({map:paper,bumpMap:paper,bumpScale:.004,roughness:.96}),sleeve:new T.MeshStandardMaterial({map:sleeve,bumpMap:sleeve,bumpScale:.006,roughness:1}),lid:new T.MeshPhysicalMaterial({color:0x382f2b,roughness:.38,clearcoat:.2,clearcoatRoughness:.48})});
  cup.rotation.set(-.015,Math.PI,-.035);scene.add(cup);
  let visible=false,raf=0,current=Math.PI,disposed=false,lastTime=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  // Time-based continuous revolution: scroll never controls the object's pose.
  // Clamp elapsed time after tab suspension so the cup resumes without a jump.
  const draw=time=>{raf=0;if(disposed||!visible||document.hidden){lastTime=0;return;}const delta=lastTime?Math.min((time-lastTime)/1000,.05):0;lastTime=time;if(!reduced.matches)current+=delta*Math.PI*2/14;cup.rotation.y=reduced.matches?Math.PI:Math.PI+Math.sin(current-Math.PI)*1.15;renderer.render(scene,camera);if(!reduced.matches)raf=requestAnimationFrame(draw);};
  const request=()=>{if(!raf&&visible)raf=requestAnimationFrame(draw);};
  const resize=()=>{const r=container.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();request();};
  const ro=new ResizeObserver(resize);ro.observe(container);
  const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;lastTime=0;if(visible){resize();request();}},{rootMargin:'80px'});io.observe(container);
  const resume=()=>{lastTime=0;request();};document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);
  renderer.domElement.className='cup-canvas';renderer.domElement.setAttribute('aria-hidden','true');container.append(renderer.domElement);container.classList.add('webgl-ready');
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();visible=false;container.classList.remove('webgl-ready');});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{visible=true;container.classList.add('webgl-ready');resize();request();});
  resize();
  return {dispose(){disposed=true;cancelAnimationFrame(raf);ro.disconnect();io.disconnect();document.removeEventListener('visibilitychange',resume);reduced.removeEventListener('change',resume);scene.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose();});paper.dispose();sleeve.dispose();renderer.dispose();}};
}

import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {createCup} from '../dist/cup-model.js';
const root=path.resolve(import.meta.dirname,'..');
let readme=await readFile(path.join(root,'README.txt'),'utf8');
readme=readme.replace('Navigation, dialogs, quiz and scroll-driven artwork','Navigation, dialogs, quiz and artwork integration')
.replace('dist/beans.js       Positions of the original airborne bean artwork','dist/cup-model.js   Editable seven-part 3D cup geometry\ndist/cup-scene.js   Materials, lighting and automatic animation\ndist/vendor/        Local Three.js runtime and its MIT license\nartwork/v2/         Full-resolution PNGs, model JSON and generation prompts')
.replace('scroll-driven original cup-turn frames; reduced-motion handling.','automatic real-time 3D cup rotation; reduced-motion handling.')
.replace('Product artwork comes from the supplied publicly visible preview recording.','V2 hero, product and discovery images were rebuilt with built-in ImageGen,\nusing the publicly visible preview as reference. Full-resolution PNGs and\nexact prompts are preserved in artwork/v2/. WebP copies retain alpha.')
.replace('The original recorded cup is partly outside its viewport at some angles. The\nturn extraction stabilises the visible original sleeve/light pixels and uses a\ncomplete recorded cup to restore off-screen plain ends. It is not real-time 3D.','The V2 central cup is an editable real-time Three.js model with seven parts,\nAI-created paper and kraft textures, molded lid geometry, physical materials\nand warm studio lights. Automatic eased turning is independent of scrolling.\nAnimation pauses when the cup is off-screen or the page is hidden. Reduced\nmotion shows a static front pose. A recorded still is the WebGL fallback.\nThe original extraction assets are retained separately for historical review.')
.replace('tools/*.py          Reproducible reference-artwork extraction helpers','tools/*.py          Original extraction and V2 artwork packaging helpers');
await writeFile(path.join(root,'README.txt'),readme);
await writeFile(path.join(root,'artwork/v2/brww-cup-model.json'),JSON.stringify(createCup().toJSON()));
const record=JSON.parse(await readFile(path.join(root,'verification/verification.json'),'utf8'));
record.visual_result='V2 reconstructed high-resolution imagery and genuine real-time 3D cup; exact reference parity not verified';
record.limitations=record.limitations.filter(x=>!x.startsWith('Cup turn uses'));
record.artwork_v2={generated_with:'Built-in ImageGen',images:['hero','cappuccino','latte','mocha','discovery'],materials:['paper','kraft sleeve'],model:'Seven-part editable Three.js geometry',animation:'Automatic eased loop, independent of scrolling',verified_desktop:[1440,900],verified_mobile:[[390,844],[320,760]],unchanged_scroll_y_between_different_poses:1828.800048828125,browser_errors:[],fallback:'Static image when WebGL is unavailable',reduced_motion:'Implemented; OS-level emulation not performed'};
await writeFile(path.join(root,'verification/verification.json'),JSON.stringify(record,null,2)+'\n');
const receipt=[];
async function walk(dir){for(const item of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())await walk(file);else{const bytes=await readFile(file);receipt.push({path:path.relative(root,file).replaceAll('\\','/'),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}}}
await walk(path.join(root,'dist'));
await writeFile(path.join(root,'asset-receipt.json'),JSON.stringify({revision:'v2',files:receipt},null,2)+'\n');
console.log(`Saved ${receipt.length} asset receipts and V2 evidence.`);

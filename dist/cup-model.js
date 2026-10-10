import * as T from './vendor/three.module.js';

// Revolved profiles keep the paper wall, sleeve seam, lid rim and molded dome distinct.
export function createCup(materials={}) {
  const group=new T.Group();group.name='BRWW recycled-paper takeaway cup';
  const paper=materials.paper||new T.MeshStandardMaterial({color:0xd9cfaf,roughness:.93});
  const sleeve=materials.sleeve||new T.MeshStandardMaterial({color:0x71604a,roughness:1});
  const lid=materials.lid||new T.MeshPhysicalMaterial({color:0x342821,roughness:.38,clearcoat:.18});
  const lathe=(name,points,mat)=>{if(name.startsWith('Molded')||name.startsWith('Lid outer'))points=[...points].reverse();const geometry=new T.LatheGeometry(points.map(([r,y])=>new T.Vector2(r,y)),192);const pos=geometry.attributes.position,uv=geometry.attributes.uv;const ys=points.map(p=>p[1]),min=Math.min(...ys),range=Math.max(...ys)-min;for(let i=0;i<uv.count;i++)uv.setY(i,(pos.getY(i)-min)/range);uv.needsUpdate=true;const mesh=new T.Mesh(geometry,mat);mesh.name=name;group.add(mesh);return mesh;};
  lathe('Double-walled tapered paper body',[[0,-1.39],[.57,-1.39],[.6,-1.37],[.62,-1.31],[.79,1.095],[.805,1.12],[.802,1.125],[.777,1.125],[.762,1.095],[.595,-1.29],[0,-1.29]],paper);
  lathe('Raised kraft paper sleeve',[[.672,-.7],[.682,-.725],[.7,-.71],[.779,.46],[.777,.49],[.757,.51],[.752,.49],[.673,-.69]],sleeve);
  lathe('Molded takeaway lid',[[0,1.45],[.36,1.448],[.51,1.443],[.66,1.43],[.678,1.408],[.684,1.28],[.718,1.26],[.745,1.25],[.77,1.24],[.777,1.208],[.817,1.195],[.833,1.17],[.84,1.145],[.823,1.125],[.807,1.12],[.794,1.15],[.76,1.18],[0,1.18]],lid);
  lathe('Lid outer rolled lip',[[.79,1.13],[.85,1.105],[.852,1.09],[.839,1.078],[.79,1.08]],lid);
  const rim=new T.Mesh(new T.TorusGeometry(.65,.008,8,192),lid);rim.rotation.x=Math.PI/2;rim.position.y=1.441;rim.name='Lid fine molded ridge';group.add(rim);
  const recess=new T.Mesh(new T.SphereGeometry(1,32,16),new T.MeshStandardMaterial({color:0x0e0b09,roughness:.75}));recess.scale.set(.092,.006,.025);recess.position.set(0,1.449,.55);recess.name='Drinking aperture';group.add(recess);
  const vent=new T.Mesh(new T.SphereGeometry(.008,12,8),new T.MeshStandardMaterial({color:0x14100d}));vent.position.set(0,1.45,-.29);group.add(vent);
  return group;
}

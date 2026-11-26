/* ================= Malzemeler ================= */
const MAT = {};
const wallMats = {};
function makePaintMat(){
  const u = {uTop:{value:new T.Color()}, uBottom:{value:new T.Color()}, uSplit:{value:0}, uStripe:{value:0}, uStripeColor:{value:lin('#3a3936')}};
  const m = new T.MeshStandardMaterial({color:0xffffff, roughness:0.93, metalness:0, map:TEX.paint});
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = 'varying float vWorldY;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vWorldY = (modelMatrix * vec4(transformed, 1.0)).y;');
    sh.fragmentShader = 'uniform vec3 uTop;\nuniform vec3 uBottom;\nuniform float uSplit;\nuniform float uStripe;\nuniform vec3 uStripeColor;\nvarying float vWorldY;\n' +
      sh.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );',
      'vec3 wallCol = uTop;\n  if (uSplit > 0.001) {\n    wallCol = vWorldY < uSplit ? uBottom : uTop;\n    if (uStripe > 0.5 && abs(vWorldY - uSplit) < 0.011) wallCol = uStripeColor;\n  }\n  vec4 diffuseColor = vec4( wallCol, opacity );');
  };
  m.userData.u = u;
  return m;
}
function buildMaterials(){
  ['koltuk', 'ic', 'kapi', 'tavan'].forEach(g => { wallMats[g] = makePaintMat(); });
  MAT.stucco = new T.MeshStandardMaterial({color:0xffffff, map:TEX.concrete, bumpMap:TEX.concreteBump, bumpScale:0.006, roughness:0.96});
  MAT.brick = new T.MeshStandardMaterial({color:0xffffff, roughness:0.92, bumpScale:0.02});
  MAT.floor = new T.MeshStandardMaterial({map:TEX.floor, roughness:0.42, metalness:0});
  MAT.white = new T.MeshStandardMaterial({color:lin('#F1EFEA'), roughness:0.75});
  MAT.cove = new T.MeshStandardMaterial({color:lin('#8E8C88'), roughness:0.9});
  MAT.pvc = new T.MeshStandardMaterial({color:lin('#F4F3EF'), roughness:0.5});
  MAT.sill = new T.MeshStandardMaterial({color:lin('#E8E3DA'), roughness:0.35});
  MAT.glass = new T.MeshBasicMaterial({map:TEX.sky, color:0xffffff});
  MAT.walnut = new T.MeshStandardMaterial({color:lin('#5C3A25'), roughness:0.55});
  MAT.doorGlass = new T.MeshStandardMaterial({color:lin('#3A3D3E'), roughness:0.25, metalness:0.1});
  MAT.corridor = new T.MeshStandardMaterial({color:lin('#BDB8B0'), roughness:0.9, side:T.BackSide});
  MAT.skirting = new T.MeshStandardMaterial({color:lin('#D9CEBD'), roughness:0.6});
  MAT.curtain = new T.MeshStandardMaterial({color:lin('#EEE8DA'), roughness:0.95, side:T.DoubleSide, transparent:true, opacity:0.86, emissive:lin('#FFF6E6'), emissiveIntensity:0});
  MAT.spotOn = new T.MeshBasicMaterial({color:new T.Color(1.6, 1.4, 1.1)});
  MAT.spotOff = new T.MeshStandardMaterial({color:lin('#BDBAB3'), roughness:0.4, metalness:0.4});
  MAT.shadow = new T.MeshBasicMaterial({map:TEX.shadow, color:0x000000, transparent:true, opacity:0.32, depthWrite:false});
  MAT.edge = new T.MeshBasicMaterial({alphaMap:TEX.edge, color:0x000000, transparent:true, opacity:0.22, depthWrite:false});
  MAT.fabric = new T.MeshStandardMaterial({color:lin('#B5A790'), roughness:0.97});
  MAT.leaf = new T.MeshStandardMaterial({map:TEX.leaf, roughness:0.95});
  MAT.oak = new T.MeshStandardMaterial({color:lin('#9C6E43'), roughness:0.65});
  MAT.black = new T.MeshStandardMaterial({color:lin('#202122'), roughness:0.5, metalness:0.2});
  MAT.marble = new T.MeshStandardMaterial({color:lin('#232425'), roughness:0.3});
  MAT.leather = new T.MeshStandardMaterial({color:lin('#1E1F20'), roughness:0.45});
  MAT.red = new T.MeshStandardMaterial({color:lin('#B0261D'), roughness:0.38});
  MAT.booth = new T.MeshStandardMaterial({map:tex(boothCanvas(), 1, 1), roughness:0.4});
  MAT.sign = new T.MeshStandardMaterial({map:tex(textCanvas('TELEPHONE', 512, 96, '#111', '#f4f1ea', 'bold 66px Arial, sans-serif'), 1, 1), roughness:0.5, emissive:0xffffff, emissiveIntensity:0.08});
  MAT.rug = new T.MeshStandardMaterial({map:TEX.rug, roughness:1});
  MAT.tvOff = new T.MeshStandardMaterial({color:lin('#0c0d0e'), roughness:0.18, metalness:0.3});
  MAT.tvOn = new T.MeshBasicMaterial({map:tex(tvCanvas(), 1, 1), color:new T.Color(1.05, 1.05, 1.05)});
  MAT.clock = new T.MeshStandardMaterial({map:tex(clockCanvas(), 1, 1), transparent:true, roughness:0.4, metalness:0.2});
  MAT.peg = new T.MeshStandardMaterial({map:tex(pegCanvas(), 1, 1), roughness:0.7});
  MAT.radBlack = new T.MeshStandardMaterial({map:tex(radCanvas('#2a2b2c', '#141516'), 1, 1), roughness:0.5});
  MAT.radWhite = new T.MeshStandardMaterial({map:tex(radCanvas('#f2f1ee', '#cfcdc8'), 1, 1), roughness:0.5});
}


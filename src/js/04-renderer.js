/* ================= Renderer ================= */
const stage = $('#stage');
const renderer = new T.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputEncoding = T.sRGBEncoding;
renderer.toneMapping = T.ACESFilmicToneMapping;
renderer.toneMappingExposure = state.exposure;
stage.appendChild(renderer.domElement);
if (T.RectAreaLightUniformsLib) T.RectAreaLightUniformsLib.init();
const MAX_ANISO = renderer.capabilities.getMaxAnisotropy();
function tex(cv, rx, ry, srgb){ const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx || 1, ry || rx || 1); if (srgb !== false) t.encoding = T.sRGBEncoding; t.anisotropy = Math.min(8, MAX_ANISO); return t; }

const scene = new T.Scene();
function setBg(){ const cs = getComputedStyle(document.documentElement).getPropertyValue('--stage').trim() || '#CBC7C0'; scene.background = new T.Color(cs).convertSRGBToLinear(); dirty = true; }
const camera = new T.PerspectiveCamera(62, 1, 0.05, 60);
const controls = new T.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.09;
controls.minDistance = 0.25; controls.maxDistance = 16;
controls.rotateSpeed = 0.55; controls.zoomSpeed = 0.8; controls.panSpeed = 0.7;
controls.screenSpacePanning = true;
let dirty = true;
controls.addEventListener('change', () => { dirty = true; });


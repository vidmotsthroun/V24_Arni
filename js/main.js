// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// LOADER
const loader = new GLTFLoader();

// CAMERA
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1500);
camera.position.set(-35, 70, 100);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// WINDOW RESIZE HANDLING
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

// SCENE
const texture = new THREE.TextureLoader().load("images/download.jpg");
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;

const scene = new THREE.Scene();
scene.background = texture;

// CONTROLS
var controls = new OrbitControls(camera, renderer.domElement);

// ambient light
let hemiLight = new THREE.AmbientLight(0xffffff, 0.20);
scene.add(hemiLight);

// Add directional light
let dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(-30, 50, -30);
scene.add(dirLight);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.left = -70;
dirLight.shadow.camera.right = 70;
dirLight.shadow.camera.top = 70;
dirLight.shadow.camera.bottom = -70;

function createFloor(theX, theZ) {
  const TextureLoader = new THREE.TextureLoader();
  const texture = TextureLoader.load('images/360_F_249708673_iXEUEU6tUGcSjb5BJaCV7gSYn9078RYg.jpg');
  texture.colorSpace = THREE.SRGBColorSpace;

  let pos = { x: theX, y: -1, z: theZ };
  let scale = { x: 100, y: 2, z: 100 };

  let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(),
    new THREE.MeshStandardMaterial({ map: texture }));
  blockPlane.position.set(pos.x, pos.y, pos.z);
  blockPlane.scale.set(scale.x, scale.y, scale.z);
  blockPlane.castShadow = true;
  blockPlane.receiveShadow = true;
  scene.add(blockPlane);

  blockPlane.userData.ground = true;
}

// box
function createBox() {
  let scale = { x: 6, y: 6, z: 6 };
  let pos = { x: 15, y: scale.y / 2, z: 15 };

  let box = new THREE.Mesh(new THREE.BoxBufferGeometry(),
    new THREE.MeshPhongMaterial({ color: 0xDC143C }));
  box.position.set(pos.x, pos.y, pos.z);
  box.scale.set(scale.x, scale.y, scale.z);
  box.castShadow = true;
  box.receiveShadow = true;
  scene.add(box);

  box.userData.draggable = true;
  box.userData.name = 'BOX';
}

function createSphere() {
  let radius = 4;
  let pos = { x: 15, y: radius, z: -15 };

  let sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(radius, 32, 32),
    new THREE.MeshPhongMaterial({ color: 0x43a1f4 }));
  sphere.position.set(pos.x, pos.y, pos.z);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  scene.add(sphere);

  sphere.userData.draggable = true;
  sphere.userData.name = 'SPHERE';
}

function createCylinder() {
  let radius = 4;
  let height = 6;
  let pos = { x: -15, y: height / 2, z: 15 };

  let cylinder = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 32), new THREE.MeshPhongMaterial({ color: 0x90ee90 }));
  cylinder.position.set(pos.x, pos.y, pos.z);
  cylinder.castShadow = true;
  cylinder.receiveShadow = true;
  scene.add(cylinder);

  cylinder.userData.draggable = true;
  cylinder.userData.name = 'CYLINDER';
}

let pringles;

loader.load('models/pringles.glb', (gltf) => {
  pringles = gltf.scene;
  pringles.scale.set(9, 8, 9)
  pringles.position.set(0.5, -0.5, 0.5);
  pringles.castShadow = true;

  scene.add(pringles);
});

function draggablePringles() {
  let radius = 1.05;
  let height = 6;
  let pos = { x: 0, y: height / 2, z: 0 };

  let cylinder = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 32), new THREE.MeshPhongMaterial({ color: 0xee16500 }));
  cylinder.position.set(pos.x, pos.y, pos.z);
  cylinder.castShadow = true;
  cylinder.receiveShadow = true;
  scene.add(cylinder);

  cylinder.userData.draggable = true;
  cylinder.userData.name = 'PRINGLE';
}

const raycaster = new THREE.Raycaster(); // create once
const clickMouse = new THREE.Vector2();  // create once
const moveMouse = new THREE.Vector2();   // create once
var draggable;

function intersect(pos) {
  raycaster.setFromCamera(pos, camera);
  return raycaster.intersectObjects(scene.children);
}

// CLICK EVENT LISTENER
function onClick(event) {
  if (draggable != null) {
    controls.enabled = true;
    console.log(`dropping draggable ${draggable.userData.name}`);
    draggable = null;
    return;
  }

  clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const found = intersect(clickMouse);
  if (found.length > 0) {
    if (found[0].object.userData.draggable) {
      draggable = found[0].object;
      console.log(`found draggable ${draggable.userData.name}`);
    }
  }
}

// TOUCH START EVENT LISTENER
function onTouchStart(event) {
  event.preventDefault();
  onClick(event.touches[0]);
}

// MOUSE MOVE EVENT LISTENER
function onMouseMove(event) {
  moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  moveMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// TOUCH MOVE EVENT LISTENER
function onTouchMove(event) {
  event.preventDefault();
  onMouseMove(event.touches[0]);
}

// TOUCH END EVENT LISTENER
function onTouchEnd(event) {
  controls.enabled = true;
  event.preventDefault();
  if (draggable != null) {
    console.log(`dropping draggable ${draggable.userData.name}`);
    draggable = null;
  }
}

// Add event listeners
window.addEventListener('click', onClick);
window.addEventListener('touchstart', onTouchStart);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('touchmove', onTouchMove);
window.addEventListener('touchend', onTouchEnd);

function dragObject() {
  if (draggable != null) {
    controls.enabled = false;
    const found = intersect(moveMouse);
    if (found.length > 0) {
      for (let i = 0; i < found.length; i++) {
        if (!found[i].object.userData.ground)
          continue;

        let target = found[i].point;
        draggable.position.x = target.x;
        draggable.position.z = target.z;
        var thingy = draggable.userData.name;
        console.log(thingy);
        if (thingy == "PRINGLE") {
          pringles.position.x = target.x + 0.5;
          pringles.position.z = target.z + 0.5;
        }
      }
    }
  }
}

createFloor(0, 0);
createBox();
createSphere();
createCylinder();
draggablePringles();

function animate() {
  dragObject();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.PlaneGeometry(10, 20, 10, 20);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
const backwall = new THREE.Mesh(geometry, material);
backwall.position.z = -5;
scene.add(backwall); 

const leftwall = new THREE.Mesh(geometry, material);
leftwall.rotation.y = - Math.PI / 2;
leftwall.position.x = -5;
scene.add(leftwall);

const rightwall = new THREE.Mesh(geometry, material);
rightwall.rotation.y = Math.PI / 2;
rightwall.position.x = 5;
scene.add(rightwall);

camera.position.z = 30;

const floorGeometry = new THREE.PlaneGeometry(10, 10, 10, 10); 
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, wireframe: true }); 
const floor = new THREE.Mesh(floorGeometry, floorMaterial); 
floor.rotation.x = - Math.PI / 2;
floor.position.y = -10;
scene.add(floor);


function animate() { 
    requestAnimationFrame(animate); 
    renderer.render(scene, camera); 
} 
animate();

const centerPosition = new THREE.Vector3(0, 0, 0); // zakładamy, że środek jest w (0, 0, 0)
const cameraGroup = new THREE.Group();
cameraGroup.position.copy(centerPosition);
cameraGroup.add(camera);
camera.position.z = 30;
scene.add(cameraGroup);

// Przenieś kamerę z grupy na odpowiednią pozycję w odniesieniu do środka
camera.position.set(0, 0, 20); // ustal pozycję kamery względem środka
camera.lookAt(centerPosition); // upewnij się, że kamera patrzy na środek

document.addEventListener('keydown', onDocumentKeyDown, false);

function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 37) {
        // lewa strzałka
        camera.position.x -= 1;
    } else if (keyCode == 38) {
        // górna strzałka
        camera.position.y += 1;
    } else if (keyCode == 39) {
        // prawa strzałka
        camera.position.x += 1;
    } else if (keyCode == 40) {
        // dolna strzałka
        camera.position.y -= 1;
    } else if (keyCode == 81) {
        // Q
        cameraGroup.rotation.y -= 0.05;
    } else if (keyCode == 69) {
        // E
        cameraGroup.rotation.y += 0.05;
    }
}

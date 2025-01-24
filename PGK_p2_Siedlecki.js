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
var tetrisTypes = [createTetrisIBlock(), createTetrisLBlock(), createTetrisZBlock(), createTetrisTBlock()];
var tetrisBlocks = [];
var tetrisBlock = spawnBlock();
scene.add(tetrisBlock);
tetrisBlocks.push(tetrisBlock);
var fallSpeed = 0.001;
var lines = floor.position.y + 0.5;

function animate() { 
    requestAnimationFrame(animate); 
    
    tetrisBlocks.at(tetrisBlocks.length - 1).position.y -= fallSpeed;
    if (tetrisBlocks.at(tetrisBlocks.length - 1).position.y <= floor.position.y + 0.5) {
        tetrisBlocks.at(tetrisBlocks.length - 1).position.y = floor.position.y + 0.5;
        tetrisBlock = spawnBlock();
        scene.add(tetrisBlock);
        tetrisBlocks.push(tetrisBlock);
    }
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

document.addEventListener('keydown', onDocumentKeyDown);

function onDocumentKeyDown(event) {
    var keyCode = event.which || event.keyCode;
    if (keyCode == 81) {
        // Q
        cameraGroup.rotation.y -= 0.05;
    } else if (keyCode == 69) {
        // E
        cameraGroup.rotation.y += 0.05;
    }
    if(lines != tetrisBlock.position.y){
        if (keyCode == 65) {
            // A
            tetrisBlock.position.x -= 1;
        } else if (keyCode == 87) {
            // W
            rotateBlockZ(tetrisBlock, keyCode);
        } else if (keyCode == 68) {
            // D
            tetrisBlock.position.x += 1;
        } else if (keyCode == 83) {
            // S
            rotateBlockZ(tetrisBlock, keyCode);
        }
    }
}

function rotateBlockZ(block, keyCode) {
    if (keyCode == 87) {
        // Rotate the block by 90 degrees
        block.rotation.z += Math.PI / 2;
    } else if (keyCode == 83) {
        // Rotate the block by -90 degrees
        block.rotation.z -= Math.PI / 2;
    }
}

function createTetrisLBlock() {
    var group = new THREE.Group();

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    // Create the individual cubes of the "L" block
    var cube1 = new THREE.Mesh(geometry, material);
    var cube2 = new THREE.Mesh(geometry, material);
    var cube3 = new THREE.Mesh(geometry, material);
    var cube4 = new THREE.Mesh(geometry, material);

    // Position the cubes to form an "L" shape
    cube1.position.set(0, 0, 0);
    cube2.position.set(1, 0, 0);
    cube3.position.set(2, 0, 0);
    cube4.position.set(2, 1, 0);

    // Add the cubes to the group
    group.add(cube1);
    group.add(cube2);
    group.add(cube3);
    group.add(cube4);

    // Position the group
    group.position.set(0.5, 11, -0.5); // Start above the ground

    return group;
}

function createTetrisZBlock() {
    var group = new THREE.Group();

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    // Create the individual cubes of the "Z" block
    var cube1 = new THREE.Mesh(geometry, material);
    var cube2 = new THREE.Mesh(geometry, material);
    var cube3 = new THREE.Mesh(geometry, material);
    var cube4 = new THREE.Mesh(geometry, material);

    // Position the cubes to form a "Z" shape
    cube1.position.set(0, 0, 0);
    cube2.position.set(1, 0, 0);
    cube3.position.set(1, 1, 0);
    cube4.position.set(2, 1, 0);

    // Add the cubes to the group
    group.add(cube1);
    group.add(cube2);
    group.add(cube3);
    group.add(cube4);

    // Position the group
    group.position.set(0.5, 5, -0.5); // Start above the ground

    return group;
}

function createTetrisIBlock() {
    var group = new THREE.Group();

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0x0000ff });

    // Create the individual cubes of the "I" block
    var cube1 = new THREE.Mesh(geometry, material);
    var cube2 = new THREE.Mesh(geometry, material);
    var cube3 = new THREE.Mesh(geometry, material);
    var cube4 = new THREE.Mesh(geometry, material);

    // Position the cubes to form an "I" shape
    cube1.position.set(0, 0, 0);
    cube2.position.set(1, 0, 0);
    cube3.position.set(2, 0, 0);
    cube4.position.set(3, 0, 0);

    // Add the cubes to the group
    group.add(cube1);
    group.add(cube2);
    group.add(cube3);
    group.add(cube4);

    // Position the group
    group.position.set(0.5, 5, -0.5); // Start above the ground and to the far right

    return group;
}

function createTetrisTBlock() {
    var group = new THREE.Group();

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0xff00ff });

    // Create the individual cubes of the "T" block
    var cube1 = new THREE.Mesh(geometry, material);
    var cube2 = new THREE.Mesh(geometry, material);
    var cube3 = new THREE.Mesh(geometry, material);
    var cube4 = new THREE.Mesh(geometry, material);

    // Position the cubes to form a "T" shape
    cube1.position.set(0, 0, 0);
    cube2.position.set(1, 0, 0);
    cube3.position.set(2, 0, 0);
    cube4.position.set(1, 1, 0);

    // Add the cubes to the group
    group.add(cube1);
    group.add(cube2);
    group.add(cube3);
    group.add(cube4);

    // Position the group
    group.position.set(0.5, 5, -0.5); // Start above the ground and to the right

    return group;
}

function spawnBlock() {
    var blockType = tetrisTypes[Math.floor(Math.random() * tetrisTypes.length)];
    return blockType;
}
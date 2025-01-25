// Import Three.js
import * as THREE from 'three';

// Create the scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;
camera.position.y = 10;
camera.rotation.x = 0;

// Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
scene.add(ambientLight);

// Add directional light from the front
const frontLight = new THREE.DirectionalLight(0xffffff, 1.5);
frontLight.position.set(0, 10, 10);
scene.add(frontLight);

// Add directional light from the side
const sideLight = new THREE.DirectionalLight(0xffffff, 0.8);
sideLight.position.set(10, 10, 0);
scene.add(sideLight);

// Add directional light from the back
const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
backLight.position.set(0, 10, -10);
scene.add(backLight);

// Add point light from above
const topLight = new THREE.PointLight(0xffffff, 1, 100);
topLight.position.set(0, 20, 0);
scene.add(topLight);

// Create the room (10x20)
const roomWidth = 10;
const roomHeight = 20;
const roomDepth = 10;

const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x404040, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });

const backWallGeometry = new THREE.PlaneGeometry(roomWidth, roomHeight);
const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
backWall.position.z = -roomDepth / 2;
backWall.position.y = roomHeight / 2;
scene.add(backWall);

const leftWallGeometry = new THREE.PlaneGeometry(roomDepth, roomHeight);
const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
leftWall.rotation.y = Math.PI / 2;
leftWall.position.x = -roomWidth / 2;
leftWall.position.y = roomHeight / 2;
scene.add(leftWall);

const rightWallGeometry = new THREE.PlaneGeometry(roomDepth, roomHeight);
const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
rightWall.rotation.y = -Math.PI / 2;
rightWall.position.x = roomWidth / 2;
rightWall.position.y = roomHeight / 2;
scene.add(rightWall);

// Define tetromino shapes
const tetrominoes = [
    // I
    [
        [1, 1, 1, 1]
    ],
    // O
    [
        [1, 1],
        [1, 1]
    ],
    // T
    [
        [0, 1, 0],
        [1, 1, 1]
    ],
    // S
    [
        [0, 1, 1],
        [1, 1, 0]
    ],
    // Z
    [
        [1, 1, 0],
        [0, 1, 1]
    ],
    // J
    [
        [1, 0, 0],
        [1, 1, 1]
    ],
    // L
    [
        [0, 0, 1],
        [1, 1, 1]
    ]
];

// Function to create a tetromino mesh
function createTetromino(shape) {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
    shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const cube = new THREE.Mesh(geometry, material);
                cube.position.set(x, -y, 0);
                group.add(cube);
            }
        });
    });
    return group;
}

// Function to get a random tetromino
function getRandomTetromino() {
    const shape = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
    const tetromino = createTetromino(shape);
    tetromino.position.y = roomHeight - 1;
    return tetromino;
}

// Create the initial tetromino
let currentTetromino;
let blocks = [];
let animationId;

// Function to check for collisions
function checkCollision(tetromino) {
    for (let i = 0; i < tetromino.children.length; i++) {
        const cube = tetromino.children[i];
        const cubePosition = new THREE.Vector3();
        cube.getWorldPosition(cubePosition);

        // Check collision with floor
        if (cubePosition.y <= 0.5) {
            return true;
        }

        // Check collision with side walls
        if (cubePosition.x < -roomWidth / 2 + 0.5 || cubePosition.x > roomWidth / 2 - 0.5) {
            return true;
        }

        // Check collision with back and front walls
        if (cubePosition.z < -roomDepth / 2 + 0.5 || cubePosition.z > roomDepth / 2 - 0.5) {
            return true;
        }

        // Check collision with other blocks
        for (let j = 0; j < blocks.length; j++) {
            const blockCubePosition = new THREE.Vector3();
            blocks[j].getWorldPosition(blockCubePosition);

            if (cubePosition.distanceTo(blockCubePosition) < 1) {
                return true;
            }
        }
    }
    return false;
}

// Function to rotate a tetromino around its center
function rotateTetromino(tetromino, direction) {
    // Calculate the center of the tetromino
    const box = new THREE.Box3().setFromObject(tetromino);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Translate the tetromino to the origin
    tetromino.position.sub(center);

    // Rotate each block around the origin
    const matrix = new THREE.Matrix4();
    matrix.makeRotationZ(direction * Math.PI / 2);
    tetromino.children.forEach(cube => {
        cube.position.applyMatrix4(matrix);
    });

    // Translate the tetromino back to its original position
    tetromino.position.add(center);
}

// Function to rotate the room around its center
function rotateRoom(direction) {
    const center = new THREE.Vector3(0, roomHeight / 2, 0);
    const matrix = new THREE.Matrix4();
    matrix.makeRotationY(THREE.MathUtils.degToRad(direction * 15));

    camera.position.sub(center);
    camera.position.applyMatrix4(matrix);
    camera.position.add(center);
    camera.lookAt(center);

    console.log(`Camera rotated ${direction * 15} degrees`);
}

// Function to handle key presses
function handleKeyPress(event) {
    switch (event.key) {
        case 'a':
        case 'A':
            // Move tetromino left
            currentTetromino.position.x -= 1;
            if (checkCollision(currentTetromino)) {
                currentTetromino.position.x += 1;
            }
            break;
        case 'd':
        case 'D':
            // Move tetromino right
            currentTetromino.position.x += 1;
            if (checkCollision(currentTetromino)) {
                currentTetromino.position.x -= 1;
            }
            break;
        case 'w':
        case 'W':
            // Move tetromino forward (into the screen)
            currentTetromino.position.z -= 1;
            if (checkCollision(currentTetromino)) {
                currentTetromino.position.z += 1;
            }
            break;
        case 's':
        case 'S':
            // Move tetromino backward (out of the screen)
            currentTetromino.position.z += 1;
            if (checkCollision(currentTetromino)) {
                currentTetromino.position.z -= 1;
            }
            break;
        case 'q':
        case 'Q':
            // Rotate tetromino counterclockwise
            rotateTetromino(currentTetromino, 1);
            if (checkCollision(currentTetromino)) {
                // Try to move tetromino to the left or right to allow rotation
                currentTetromino.position.x -= 1;
                if (checkCollision(currentTetromino)) {
                    currentTetromino.position.x += 2;
                    if (checkCollision(currentTetromino)) {
                        currentTetromino.position.x -= 1;
                        rotateTetromino(currentTetromino, -1);
                    }
                }
            }
            break;
        case 'e':
        case 'E':
            // Rotate tetromino clockwise
            rotateTetromino(currentTetromino, -1);
            if (checkCollision(currentTetromino)) {
                // Try to move tetromino to the left or right to allow rotation
                currentTetromino.position.x -= 1;
                if (checkCollision(currentTetromino)) {
                    currentTetromino.position.x += 2;
                    if (checkCollision(currentTetromino)) {
                        currentTetromino.position.x -= 1;
                        rotateTetromino(currentTetromino, 1);
                    }
                }
            }
            break;
        case 'ArrowLeft':
            // Rotate room counterclockwise
            rotateRoom(-1);
            break;
        case 'ArrowRight':
            // Rotate room clockwise
            rotateRoom(1);
            break;
    }
}

// Add event listener for key presses
document.addEventListener('keydown', handleKeyPress);

// Function to remove filled lines
function removeFilledLines() {
    const lines = {};

    // Collect all blocks by their y position
    blocks.forEach(cube => {
        const y = Math.round(cube.position.y);
        if (!lines[y]) {
            lines[y] = [];
        }
        lines[y].push(cube);
    });

    // Find and remove filled lines
    Object.keys(lines).forEach(y => {
        if (lines[y].length >= roomWidth) {
            // Remove cubes in the filled line
            lines[y].forEach(cube => {
                scene.remove(cube);
                blocks = blocks.filter(block => block !== cube);
            });

            // Move all blocks above the removed line down
            Object.keys(lines).forEach(aboveY => {
                if (parseInt(aboveY) > parseInt(y)) {
                    lines[aboveY].forEach(cube => {
                        cube.position.y -= 1;
                    });
                }
            });
        }
    });
}

// Function to end the game
function endGame() {
    alert("Game Over!");
    // Stop the animation loop
    cancelAnimationFrame(animationId);
    showOverlay();
}

// Animation loop
function animate() {
    animationId = requestAnimationFrame(animate);

    // Move the tetromino down
    currentTetromino.position.y -= 0.05;
    if (checkCollision(currentTetromino)) {
        currentTetromino.position.y += 0.05;
        // Stop the tetromino at the collision point
        currentTetromino.children.forEach(cube => {
            const newCube = cube.clone();
            newCube.position.add(currentTetromino.position);
            scene.add(newCube);
            blocks.push(newCube);
        });
        scene.remove(currentTetromino);
        // Remove filled lines
        removeFilledLines();
        // Create a new tetromino
        currentTetromino = getRandomTetromino();
        if (checkCollision(currentTetromino)) {
            endGame();
            return;
        }
        scene.add(currentTetromino);
    }

    renderer.render(scene, camera);
}

// Function to start the game
function startGame() {
    hideOverlay();
    blocks.forEach(block => scene.remove(block));
    blocks = [];
    currentTetromino = getRandomTetromino();
    scene.add(currentTetromino);
    animate();
}

// Function to show the overlay
function showOverlay() {
    document.getElementById('overlay').style.display = 'flex';
    document.getElementById('helpButtonInGame').style.display = 'none';
}

// Function to hide the overlay
function hideOverlay() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('helpButtonInGame').style.display = 'block';
}

// Event listeners for buttons
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('helpButton').addEventListener('click', () => {
    const helpText = document.getElementById('helpTextOverlay');
    helpText.style.display = helpText.style.display === 'none' ? 'block' : 'none';
});
document.getElementById('helpButtonInGame').addEventListener('click', () => {
    const helpText = document.getElementById('helpText');
    helpText.style.display = helpText.style.display === 'none' ? 'block' : 'none';
});

// Show the overlay initially
showOverlay();
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

// Create the room (8x20x8)
const roomWidth = 8;
const roomHeight = 20;
const roomDepth = 8;

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

// Load textures
const textureLoader = new THREE.TextureLoader();
const textures = [
    textureLoader.load("texture/I-block_retro_texture.png"),
    textureLoader.load('texture/O-block_retro_texture.png'),
    textureLoader.load('texture/T-block_retro_texture.png'),
    textureLoader.load('texture/S-block_retro_texture.png'),
    textureLoader.load('texture/Z-block_retro_texture.png'),
    textureLoader.load('texture/J-block_retro_texture.png'),
    textureLoader.load('texture/L-block_retro_texture.png'),
    
];

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
function createTetromino(shape, texture) {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ map: texture });
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
    group.shape = shape; // Store the shape matrix in the group
    return group;
}

// Function to get a random tetromino
function getRandomTetromino() {
    const shapeIndex = Math.floor(Math.random() * tetrominoes.length);
    const shape = tetrominoes[shapeIndex];
    const texture = textures[shapeIndex];
    const tetromino = createTetromino(shape, texture);
    tetromino.position.y = roomHeight - 1;
    return tetromino;
}

// Create the initial tetromino
let currentTetromino;
let blocks = [];
let animationId;

// Function to rotate a tetromino shape matrix
function rotateMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            result[j][rows - 1 - i] = matrix[i][j];
        }
    }
    return result;
}

// Function to rotate a tetromino around its center
function rotateTetromino(tetromino, direction) {
    // Rotate the shape matrix
    const newShape = rotateMatrix(tetromino.shape);

    // Clear the current tetromino group
    const oldPosition = tetromino.position.clone();
    scene.remove(tetromino);

    // Create new cubes based on the rotated shape
    const material = new THREE.MeshStandardMaterial({ map: tetromino.children[0].material.map });
    const newTetromino = new THREE.Group();
    newShape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const cube = new THREE.Mesh(geometry, material);
                cube.position.set(x, -y, 0);
                newTetromino.add(cube);
            }
        });
    });

    newTetromino.shape = newShape; // Update the shape matrix in the group
    newTetromino.position.copy(oldPosition);
    scene.add(newTetromino);

    // Check for collisions and adjust position if necessary
    if (checkCollision(newTetromino)) {
        // Try to move tetromino to the left or right to allow rotation
        newTetromino.position.x -= 1;
        if (checkCollision(newTetromino)) {
            newTetromino.position.x += 2;
            if (checkCollision(newTetromino)) {
                newTetromino.position.x -= 1;
                newTetromino = rotateTetromino(newTetromino, -direction); // Revert rotation if no valid position found
            }
        }
    }

    return newTetromino;
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
            currentTetromino = rotateTetromino(currentTetromino, 1);
            if (checkCollision(currentTetromino)) {
                // Try to move tetromino to the left or right to allow rotation
                currentTetromino.position.x -= 1;
                if (checkCollision(currentTetromino)) {
                    currentTetromino.position.x += 2;
                    if (checkCollision(currentTetromino)) {
                        currentTetromino.position.x -= 1;
                        currentTetromino = rotateTetromino(currentTetromino, -1);
                    }
                }
            }
            break;
        case 'e':
        case 'E':
            // Rotate tetromino clockwise
            currentTetromino = rotateTetromino(currentTetromino, -1);
            if (checkCollision(currentTetromino)) {
                // Try to move tetromino to the left or right to allow rotation
                currentTetromino.position.x -= 1;
                if (checkCollision(currentTetromino)) {
                    currentTetromino.position.x += 2;
                    if (checkCollision(currentTetromino)) {
                        currentTetromino.position.x -= 1;
                        currentTetromino = rotateTetromino(currentTetromino, 1);
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

// Funkcja do usuwania wypełnionych poziomych linii
function removeFilledLines() {
    const lines = {};

    // Grupowanie wszystkich bloków według ich pozycji y i z
    blocks.forEach(cube => {
        const y = Math.round(cube.position.y); // Zaokrąglanie pozycji y do najbliższej liczby całkowitej
        const z = Math.round(cube.position.z); // Zaokrąglanie pozycji z do najbliższej liczby całkowitej
        if (!lines[y]) {
            lines[y] = {};
        }
        if (!lines[y][z]) {
            lines[y][z] = [];
        }
        lines[y][z].push(cube); // Dodawanie bloku do odpowiedniej tablicy
    });

    // Znajdowanie i usuwanie wypełnionych poziomych linii
    Object.keys(lines).forEach(y => {
        Object.keys(lines[y]).forEach(z => {
            if (lines[y][z].length >= roomWidth - 1) { // Sprawdzanie, czy liczba bloków w linii jest równa szerokości pokoju
                // Usuwanie bloków w wypełnionej linii
                lines[y][z].forEach(cube => {
                    scene.remove(cube); // Usuwanie bloku ze sceny
                    blocks = blocks.filter(block => block !== cube); // Usuwanie bloku z tablicy blocks
                });

                // Przesuwanie wszystkich bloków powyżej usuniętej linii w dół
                Object.keys(lines).forEach(aboveY => {
                    if (parseInt(aboveY) > parseInt(y)) {
                        Object.keys(lines[aboveY]).forEach(aboveZ => {
                            if (aboveZ === z) { // Sprawdzanie, czy blok znajduje się w tej samej pozycji z
                                lines[aboveY][aboveZ].forEach(cube => {
                                    cube.position.y -= 1; // Przesuwanie bloku w dół
                                });
                            }
                        });
                    }
                });
            }
        });
    });
}

// Funkcja do sprawdzania kolizji
function checkCollision(tetromino) {
    for (let i = 0; i < tetromino.children.length; i++) {
        const cube = tetromino.children[i];
        const cubePosition = new THREE.Vector3();
        cube.getWorldPosition(cubePosition);

        // Sprawdzanie kolizji z podłogą
        if (cubePosition.y <= 0.5) {
            return true;
        }

        // Sprawdzanie kolizji z bocznymi ścianami
        if (cubePosition.x < -roomWidth / 2 + 0.5 || cubePosition.x > roomWidth / 2 - 0.5) {
            return true;
        }

        // Sprawdzanie kolizji z tylną i przednią ścianą
        if (cubePosition.z < -roomDepth / 2 + 0.5 || cubePosition.z > roomDepth / 2 - 0.5) {
            return true;
        }

        // Sprawdzanie kolizji z innymi blokami
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


// Pętla animacji
function animate() {
    animationId = requestAnimationFrame(animate); // Żądanie kolejnej klatki animacji

    // Przesuwanie tetromino w dół
    currentTetromino.position.y -= 0.05; // Przesuwanie tetromino w dół o 0.05 jednostki
    if (checkCollision(currentTetromino)) { // Sprawdzanie kolizji
        currentTetromino.position.y += 0.05; // Cofanie ruchu, jeśli wystąpiła kolizja
        // Zatrzymywanie tetromino w punkcie kolizji
        currentTetromino.children.forEach(cube => {
            const newCube = cube.clone(); // Klonowanie bloku
            newCube.position.add(currentTetromino.position); // Dodawanie pozycji tetromino do pozycji bloku
            scene.add(newCube); // Dodawanie nowego bloku do sceny
            blocks.push(newCube); // Dodawanie nowego bloku do tablicy blocks
        });
        scene.remove(currentTetromino); // Usuwanie tetromino ze sceny
        // Usuwanie wypełnionych poziomych linii
        removeFilledLines();
        // Tworzenie nowego tetromino
        currentTetromino = getRandomTetromino();
        if (checkCollision(currentTetromino)) { // Sprawdzanie kolizji dla nowego tetromino
            endGame(); // Kończenie gry, jeśli nowo utworzone tetromino koliduje
            return;
        }
        scene.add(currentTetromino); // Dodawanie nowego tetromino do sceny
    }

    renderer.render(scene, camera); // Renderowanie sceny z użyciem kamery
}

// Function to end the game
function endGame() {
    // Stop the animation loop
    cancelAnimationFrame(animationId);
    showGameOverOverlay();
}

// Function to show the game over overlay
function showGameOverOverlay() {
    document.getElementById('gameOverOverlay').style.display = 'flex';
}

// Function to hide the game over overlay
function hideGameOverOverlay() {
    document.getElementById('gameOverOverlay').style.display = 'none';
}

// Event listeners for game over buttons
document.getElementById('restartButton').addEventListener('click', () => {
    hideGameOverOverlay();
    startGame();
});

document.getElementById('helpButtonGameOver').addEventListener('click', () => {
    const helpText = document.getElementById('helpTextOverlay');
    helpText.style.display = helpText.style.display === 'none' ? 'block' : 'none';
});

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
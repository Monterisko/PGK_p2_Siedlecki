// Import Three.js
import * as THREE from 'three';

// Utworzenie sceny
const scene = new THREE.Scene();

// Utworzenie kamery
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;
camera.position.y = 10;
camera.rotation.x = 0;

// Utworzenie renderera
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Dodanie światła otoczenia (ambient light)
const ambientLight = new THREE.AmbientLight(0x404040, 1); // Miękkie białe światło
scene.add(ambientLight);

// Dodanie światła kierunkowego z przodu
const frontLight = new THREE.DirectionalLight(0xffffff, 1.5); // białe światło o intensywności 1.5
frontLight.position.set(0, 10, 10);
scene.add(frontLight);

// Dodanie światła kierunkowego z boku
const sideLight = new THREE.DirectionalLight(0xffffff, 0.8); // białe światło o intensywności 0.8
sideLight.position.set(10, 10, 0);
scene.add(sideLight);

// Dodanie światła kierunkowego z tyłu
const backLight = new THREE.DirectionalLight(0xffffff, 0.5); // białe światło o intensywności 0.5
backLight.position.set(0, 10, -10);
scene.add(backLight);

// Dodanie światła punktowego z góry
const topLight = new THREE.PointLight(0xffffff, 2, 25);
topLight.position.set(0, 20, 0);
scene.add(topLight);

// Wymiary pokoju (8x20x8)
const roomWidth = 8;
const roomHeight = 20;
const roomDepth = 8;

// Utworzenie podłogi
const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x404040, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });

// Utworzenie tylniej ściany
const backWallGeometry = new THREE.PlaneGeometry(roomWidth, roomHeight);
const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
backWall.position.z = -roomDepth / 2;
backWall.position.y = roomHeight / 2;
scene.add(backWall);

// Utworzenie lewej ściany
const leftWallGeometry = new THREE.PlaneGeometry(roomDepth, roomHeight);
const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
leftWall.rotation.y = Math.PI / 2;
leftWall.position.x = -roomWidth / 2;
leftWall.position.y = roomHeight / 2;
scene.add(leftWall);

// Utworzenie prawej ściany
const rightWallGeometry = new THREE.PlaneGeometry(roomDepth, roomHeight);
const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
rightWall.rotation.y = -Math.PI / 2;
rightWall.position.x = roomWidth / 2;
rightWall.position.y = roomHeight / 2;
scene.add(rightWall);

// Załadaowanie tekstur dla bloków Tetrisa
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

// Typy bloków Tetrisa
const blockList = [
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

// Narzucenie odpowiednich tekstur na bloki
function createblock(shape, texture) {
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
    group.shape = shape; // Trzymanie kształtu bloku Tetris w grupie
    return group;
}

// Otrzymywanie losowego bloku Tetrisa
function getRandomblock() {
    const shapeIndex = Math.floor(Math.random() * blockList.length);
    const shape = blockList[shapeIndex];
    const texture = textures[shapeIndex];
    const block = createblock(shape, texture);
    block.position.y = roomHeight - 1;
    return block;
}

// Utworzenie inicjalnego bloku Tetrisa
let currentblock;
let blocks = [];
let animationId;

let lastRotationTime = 0;
const rotationDelay = 100; // Opóźnienie między obrotami w milisekundach

// Funkcja do obracania macierzy block
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

// Funkcja do obracania bloku wokół jego środka
function rotateblock(block, direction) {
    // Obracanie macierzy kształtu
    const newShape = rotateMatrix(block.shape);

    // Czyszczenie obecnej grupy
    const oldPosition = block.position.clone();
    scene.remove(block);

    // Tworzenie nowych kostek na podstawie obróconego kształtu
    const material = new THREE.MeshStandardMaterial({ map: block.children[0].material.map });
    const newblock = new THREE.Group();
    newShape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const cube = new THREE.Mesh(geometry, material);
                cube.position.set(x, -y, 0);
                newblock.add(cube);
            }
        });
    });

    newblock.shape = newShape; // Aktualizacja macierzy kształtu w grupie
    newblock.position.copy(oldPosition);
    scene.add(newblock);

    // Sprawdzanie kolizji i dostosowywanie pozycji w razie potrzeby
    if (checkCollision(newblock)) {
        // Próba przesunięcia block w lewo lub prawo, aby umożliwić obrót
        newblock.position.x -= 1;
        if (checkCollision(newblock)) {
            newblock.position.x += 2;
            if (checkCollision(newblock)) {
                newblock.position.x -= 1;
                scene.remove(newblock);
                scene.add(block); // Przywracanie starego block, jeśli nie znaleziono odpowiedniej pozycji
                return block;
            }
        }
    }

    return newblock;
}

// Funkcja do obsługi naciśnięć klawiszy
function handleKeyPress(event) {
    const currentTime = Date.now();
    if (currentTime - lastRotationTime < rotationDelay) {
        return; // Ignorowanie naciśnięcia klawisza, jeśli opóźnienie nie minęło
    }

    switch (event.key) {
        case 'a':
        case 'A':
            // Przesuwanie block w lewo
            currentblock.position.x -= 1;
            if (checkCollision(currentblock)) {
                currentblock.position.x += 1;
            }
            break;
        case 'd':
        case 'D':
            // Przesuwanie block w prawo
            currentblock.position.x += 1;
            if (checkCollision(currentblock)) {
                currentblock.position.x -= 1;
            }
            break;
        case 'w':
        case 'W':
            // Przesuwanie block do przodu (w głąb ekranu)
            currentblock.position.z -= 1;
            if (checkCollision(currentblock)) {
                currentblock.position.z += 1;
            }
            break;
        case 's':
        case 'S':
            // Przesuwanie block do tyłu (na zewnątrz ekranu)
            currentblock.position.z += 1;
            if (checkCollision(currentblock)) {
                currentblock.position.z -= 1;
            }
            break;
        case 'q':
        case 'Q':
            // Obracanie block przeciwnie do ruchu wskazówek zegara
            currentblock = rotateblock(currentblock, 1);
            lastRotationTime = currentTime;
            break;
        case 'e':
        case 'E':
            // Obracanie block zgodnie z ruchem wskazówek zegara
            currentblock = rotateblock(currentblock, -1);
            lastRotationTime = currentTime;
            break;
        case 'ArrowLeft':
            // Obracanie pokoju przeciwnie do ruchu wskazówek zegara
            rotateRoom(-1);
            break;
        case 'ArrowRight':
            // Obracanie pokoju zgodnie z ruchem wskazówek zegara
            rotateRoom(1);
            break;
    }
}

// Dodawanie nasłuchiwania na naciśnięcia klawiszy
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
            if (lines[y][z].length >= roomWidth - 1) { // Sprawdzanie, czy liczba bloków w linii jest równa szerokości pokoju - 1
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
function checkCollision(block) {
    for (let i = 0; i < block.children.length; i++) {
        const cube = block.children[i];
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

    // Przesuwanie block w dół
    currentblock.position.y -= 0.05; // Przesuwanie block w dół o 0.05 jednostki
    if (checkCollision(currentblock)) { // Sprawdzanie kolizji
        currentblock.position.y += 0.05; // Cofanie ruchu, jeśli wystąpiła kolizja
        // Zatrzymywanie block w punkcie kolizji
        currentblock.children.forEach(cube => {
            const newCube = cube.clone(); // Klonowanie bloku
            newCube.position.add(currentblock.position); // Dodawanie pozycji block do pozycji bloku
            scene.add(newCube); // Dodawanie nowego bloku do sceny
            blocks.push(newCube); // Dodawanie nowego bloku do tablicy blocks
        });
        scene.remove(currentblock); // Usuwanie block ze sceny
        // Usuwanie wypełnionych poziomych linii
        removeFilledLines();
        // Tworzenie nowego block
        currentblock = getRandomblock();
        if (checkCollision(currentblock)) { // Sprawdzanie kolizji dla nowego block
            endGame(); // Kończenie gry, jeśli nowo utworzone block koliduje
            return;
        }
        scene.add(currentblock); // Dodawanie nowego block do sceny
    }

    renderer.render(scene, camera); // Renderowanie sceny z użyciem kamery
}

// Zakończenie gry
function endGame() {
    // Stop the animation loop
    cancelAnimationFrame(animationId);
    showGameOverOverlay();
}

// Wyświetlanie ekranu końca gry
function showGameOverOverlay() {
    document.getElementById('gameOverOverlay').style.display = 'flex';
}

// Zamykanie ekranu końca gry
function hideGameOverOverlay() {
    document.getElementById('gameOverOverlay').style.display = 'none';
}

// Listener dla przycisku restart
document.getElementById('restartButton').addEventListener('click', () => {
    hideGameOverOverlay();
    startGame();
});

// Listener dla przycisku pomocy na ekranie końca gry
document.getElementById('helpButtonGameOver').addEventListener('click', () => {
    const helpText = document.getElementById('helpTextGameOver');
    helpText.style.display = helpText.style.display === 'none' ? 'block' : 'none';
});

// Start gry
function startGame() {
    hideOverlay();
    blocks.forEach(block => scene.remove(block));
    blocks = [];
    currentblock = getRandomblock();
    scene.add(currentblock);
    animate();
}

// Wyświetlenie overlay
function showOverlay() {
    document.getElementById('overlay').style.display = 'flex';
    document.getElementById('helpButtonInGame').style.display = 'none';
}

// Ukrycie overlay
function hideOverlay() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('helpButtonInGame').style.display = 'block';
}

// Listener dla przycisków
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('helpButton').addEventListener('click', () => {
    const helpText = document.getElementById('helpTextOverlay');
    helpText.style.display = helpText.style.display === 'none' ? 'block' : 'none';
});
document.getElementById('helpButtonInGame').addEventListener('click', () => {
    const helpText = document.getElementById('helpText');
    helpText.style.display = helpText.style.display === 'none' ? 'block' : 'none';
});

// Inicjalizacja overlay
showOverlay();
import * as THREE from 'three';
import { Asteroid } from './Asteroid';
import { Boss } from './Boss';
import { getWordsByDifficulty } from '../data/words';
import { audioManager } from '../audio/AudioManager';

export class TyperSpaceGame3D {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private asteroids: Asteroid[] = [];
    private currentTarget: Asteroid | null = null;
    private boss: Boss | null = null;
    private bossSpawned: boolean = false;
    private container: HTMLElement;

    // Game state
    private difficulty: string;
    private health: number = 3;
    private destroyed: number = 0;
    private totalAsteroids: number = 50;
    private totalKeystrokes: number = 0;
    private correctKeystrokes: number = 0;
    private gameActive: boolean = true;
    private spawnTimer: number = 0;
    private spawnInterval: number = 2.0;
    private asteroidSpeed: number = 3.0;
    private startTime: number = 0;

    // Word list
    private words: string[];
    private usedWords: string[] = [];

    // UI
    private uiContainer: HTMLElement;

    constructor(containerElement: HTMLElement, difficulty: string) {
        this.container = containerElement;
        this.difficulty = difficulty;
        this.words = getWordsByDifficulty(difficulty);

        // Adjust difficulty settings
        switch (difficulty) {
            case 'easy':
                this.spawnInterval = 2.5;
                this.asteroidSpeed = 2.5;
                break;
            case 'medium':
                this.spawnInterval = 2.0;
                this.asteroidSpeed = 3.0;
                break;
            case 'hard':
                this.spawnInterval = 1.5;
                this.asteroidSpeed = 3.5;
                break;
            case 'ultra':
                this.spawnInterval = 1.0;
                this.asteroidSpeed = 4.0;
                break;
        }

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.renderer = new THREE.WebGLRenderer({ antialias: true });

        this.init();
    }

    private init(): void {
        this.startTime = Date.now();

        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.set(-15, 0, 0);
        this.camera.lookAt(0, 0, 0);

        // Setup scene
        this.setupLighting();
        this.setupBackground();

        // Create UI
        this.createUI();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Handle keyboard input
        document.addEventListener('keypress', (e) => this.onKeyPress(e));

        // Start gameplay music
        audioManager.startGameplayMusic();

        // Start game loop
        this.animate();
    }

    private setupLighting(): void {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(-10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0x00d4ff, 0.5, 50);
        pointLight.position.set(-12, 0, 0);
        this.scene.add(pointLight);

        const accentLight = new THREE.PointLight(0xff6600, 0.3, 30);
        accentLight.position.set(15, 5, 0);
        this.scene.add(accentLight);
    }

    private setupBackground(): void {
        this.scene.background = new THREE.Color(0x000510);

        const starGeometry = new THREE.BufferGeometry();
        const starPositions = [];

        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 200;
            const y = (Math.random() - 0.5) * 200;
            const z = (Math.random() - 0.5) * 200;
            starPositions.push(x, y, z);
        }

        starGeometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(starPositions, 3)
        );

        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    private createUI(): void {
        this.uiContainer = document.createElement('div');
        this.uiContainer.style.position = 'absolute';
        this.uiContainer.style.top = '0';
        this.uiContainer.style.left = '0';
        this.uiContainer.style.width = '100%';
        this.uiContainer.style.padding = '20px';
        this.uiContainer.style.color = 'white';
        this.uiContainer.style.fontFamily = "'Courier New', monospace";
        this.uiContainer.style.fontSize = '20px';
        this.uiContainer.style.pointerEvents = 'none';
        this.uiContainer.style.zIndex = '1000';

        this.uiContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <div>Leben: <span id="health-value" style="color: #00ff00;">${this.health}</span></div>
                <div>Zerstört: <span id="destroyed-value" style="color: #00d4ff;">${this.destroyed}</span> / ${this.totalAsteroids}</div>
                <div>Genauigkeit: <span id="accuracy-value" style="color: #ffaa00;">0.0</span>%</div>
            </div>
            <div id="current-word-display" style="
                position: absolute;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 32px;
                color: #00ff00;
                font-weight: bold;
                text-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
            "></div>
        `;

        this.container.appendChild(this.uiContainer);
    }

    private spawnAsteroid(): void {
        if (this.destroyed >= this.totalAsteroids) return;

        const word = this.getRandomWord();

        const x = 20;
        const y = (Math.random() - 0.5) * 12;
        const z = (Math.random() - 0.5) * 10;

        const direction = new THREE.Vector3(-1, 0, 0);

        const asteroid = new Asteroid(
            this.scene,
            x,
            y,
            z,
            word,
            this.asteroidSpeed,
            direction
        );

        this.asteroids.push(asteroid);
    }

    private getRandomWord(): string {
        let availableWords = this.words.filter(w => this.usedWords.indexOf(w) === -1);

        if (availableWords.length === 0) {
            this.usedWords = [];
            availableWords = this.words.slice();
        }

        const word = availableWords[Math.floor(Math.random() * availableWords.length)];
        this.usedWords.push(word);
        return word;
    }

    private onKeyPress(event: KeyboardEvent): void {
        if (!this.gameActive) return;

        const char = event.key;
        if (!/^[a-zA-ZäöüÄÖÜß]$/.test(char)) return;

        this.totalKeystrokes++;

        // If boss is active, prioritize boss
        if (this.boss && !this.boss.isDefeated()) {
            if (this.boss.typeCharacter(char)) {
                this.correctKeystrokes++;
                audioManager.playTypeSound();

                if (this.boss.isDefeated()) {
                    this.boss.createExplosion(this.scene);
                    this.boss.destroy(this.scene);
                    this.boss = null;
                    audioManager.playEnemyDefeatedSound();
                    this.victory();
                }

                this.updateUI();
                return;
            } else {
                audioManager.playErrorSound();
                this.boss.resetProgress();
            }
            this.updateUI();
            return;
        }

        // Try current target first
        if (this.currentTarget && !this.currentTarget.isComplete()) {
            if (this.currentTarget.typeCharacter(char)) {
                this.correctKeystrokes++;
                audioManager.playTypeSound();

                if (this.currentTarget.isComplete()) {
                    this.destroyAsteroid(this.currentTarget);
                    this.currentTarget = null;
                }

                this.updateUI();
                return;
            } else {
                audioManager.playErrorSound();
                this.currentTarget.resetProgress();
                this.currentTarget = null;
            }
        }

        // Find new target
        this.currentTarget = null;
        let closestDistance = Infinity;

        for (const asteroid of this.asteroids) {
            if (asteroid.typedChars === 0 &&
                asteroid.word[0].toLowerCase() === char.toLowerCase()) {
                const distance = asteroid.getPosition().distanceTo(this.camera.position);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    this.currentTarget = asteroid;
                }
            }
        }

        if (this.currentTarget) {
            this.currentTarget.typeCharacter(char);
            this.correctKeystrokes++;
            audioManager.playTypeSound();
            this.updateUI();
        }
    }

    private destroyAsteroid(asteroid: Asteroid): void {
        asteroid.createExplosion(this.scene);
        asteroid.destroy(this.scene);

        const index = this.asteroids.indexOf(asteroid);
        if (index > -1) {
            this.asteroids.splice(index, 1);
        }

        this.destroyed++;
        audioManager.playEnemyDefeatedSound();

        if (this.destroyed >= this.totalAsteroids && !this.bossSpawned) {
            this.spawnBoss();
        }

        this.updateUI();
    }

    private spawnBoss(): void {
        this.bossSpawned = true;

        const bossWords = ['schwarzesloch', 'supernova', 'gravitationswelle'];

        this.boss = new Boss(
            this.scene,
            20,
            0,
            0,
            bossWords,
            3.0
        );

        console.log('⚠️ BOSS ERSCHEINT! ⚠️');
    }

    private updateUI(): void {
        const healthEl = document.getElementById('health-value');
        const destroyedEl = document.getElementById('destroyed-value');
        const accuracyEl = document.getElementById('accuracy-value');

        if (healthEl) healthEl.textContent = this.health.toString();
        if (destroyedEl) destroyedEl.textContent = this.destroyed.toString();

        if (accuracyEl && this.totalKeystrokes > 0) {
            const accuracy = (this.correctKeystrokes / this.totalKeystrokes * 100).toFixed(1);
            accuracyEl.textContent = accuracy;
        }
    }

    private gameOver(): void {
        this.gameActive = false;
        audioManager.playGameOverSound();
        audioManager.stopBackgroundMusic();

        const endTime = Date.now();
        const totalTime = (endTime - this.startTime) / 1000;
        const accuracy = this.totalKeystrokes > 0
            ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100)
            : 0;
        const wpm = Math.round((this.correctKeystrokes / 5) / (totalTime / 60));

        this.showResults(accuracy, wpm, totalTime, false);
    }

    private victory(): void {
        this.gameActive = false;
        audioManager.playLevelCompleteSound();
        audioManager.stopBackgroundMusic();

        const endTime = Date.now();
        const totalTime = (endTime - this.startTime) / 1000;
        const accuracy = this.totalKeystrokes > 0
            ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100)
            : 0;
        const wpm = Math.round((this.correctKeystrokes / 5) / (totalTime / 60));

        this.showResults(accuracy, wpm, totalTime, true);
    }

    private showResults(accuracy: number, wpm: number, time: number, success: boolean): void {
        this.container.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                color: white;
                text-align: center;
                font-family: 'Courier New', monospace;
                background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%);
            ">
                <h1 style="font-size: 4rem; color: ${success ? '#00ff00' : '#ff0000'}; margin-bottom: 2rem;">
                    ${success ? '🎉 Sieg!' : '💥 Game Over'}
                </h1>
                <div style="font-size: 1.5rem; color: #8892b0; margin-bottom: 2rem;">
                    <p>Genauigkeit: ${accuracy}%</p>
                    <p>Tippgeschwindigkeit: ${wpm} WPM</p>
                    <p>Zeit: ${time.toFixed(1)}s</p>
                    <p>Schwierigkeit: ${this.difficulty.toUpperCase()}</p>
                </div>
                <button onclick="location.reload()" style="
                    padding: 15px 40px;
                    font-size: 1.3rem;
                    font-weight: bold;
                    color: #fff;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: 2px solid #00d4ff;
                    border-radius: 50px;
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                ">
                    Zurück zum Menü
                </button>
            </div>
        `;
    }

    private onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    private animate = (): void => {
        if (!this.gameActive) return;

        requestAnimationFrame(this.animate);

        const deltaTime = 0.016; // ~60 FPS

        // Spawn asteroids
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnAsteroid();
            this.spawnTimer = 0;
        }

        // Update asteroids
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            asteroid.update(deltaTime, this.camera);

            // Check if asteroid reached player
            if (asteroid.getPosition().x < -12) {
                this.health--;
                asteroid.destroy(this.scene);
                this.asteroids.splice(i, 1);

                if (this.currentTarget === asteroid) {
                    this.currentTarget = null;
                }

                if (this.health <= 0) {
                    this.gameOver();
                }

                this.updateUI();
            }
        }

        // Update boss
        if (this.boss && !this.boss.isDefeated()) {
            this.boss.update(deltaTime, this.camera);

            // Check if boss reached player
            if (this.boss.getPosition().x < -12) {
                this.health = 0;
                this.gameOver();
            }
        }

        this.renderer.render(this.scene, this.camera);
    };
}

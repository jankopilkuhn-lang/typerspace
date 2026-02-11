import * as THREE from 'three';
import { Asteroid } from './Asteroid';
import { Boss } from './Boss';
import { getWordsByDifficulty } from '../data/words';
import { audioManager } from '../audio/AudioManager';
import { GAME_CONFIG } from '../config/game-config';
import { highscoreService } from '../services/HighscoreService';
import { Difficulty } from '../types/highscore';

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
    private speed: string; // Speed setting (easy/medium/hard/ultra)
    private isProMode: boolean;
    private health: number = 3;
    private destroyed: number = 0;
    private waveDestroyed: number = 0; // Asteroids destroyed in current wave
    private totalKeystrokes: number = 0;
    private correctKeystrokes: number = 0;
    private gameActive: boolean = true;
    private spawnTimer: number = 0;
    private spawnInterval: number = 2.0;
    private asteroidSpeed: number = 3.0;
    private startTime: number = 0;

    // Wave system
    private currentWave: number = 0;
    private totalWaves: number = GAME_CONFIG.waves.length;
    private inBossFight: boolean = false;
    private waitingForWaveStart: boolean = false; // Pause between waves

    // Word list
    private words: string[];
    private usedWords: string[] = [];

    // UI
    private uiContainer: HTMLElement;

    constructor(containerElement: HTMLElement, speed: string, isProMode: boolean = false) {
        this.container = containerElement;
        this.speed = speed;
        this.isProMode = isProMode;

        // Set speed settings from config
        const speedConfig = GAME_CONFIG.speeds[speed];
        this.spawnInterval = speedConfig.spawnInterval3D;
        this.asteroidSpeed = speedConfig.asteroidSpeed3D;

        // Load words for first wave
        const waveConfig = GAME_CONFIG.waves[this.currentWave];
        this.words = getWordsByDifficulty(waveConfig.wordDifficulty);

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

        // Get personal best highscore
        const stats = highscoreService.getStats();
        const personalBest = stats.personalBest[this.speed as Difficulty];
        const highscoreValue = personalBest ? highscoreService.formatScore(personalBest.score) : '-';

        this.uiContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <div>Leben: <span id="health-value" style="color: #00ff00;">${this.health}</span></div>
                <div><span id="destroyed-value" style="color: #00d4ff;">Welle 1: 0/${GAME_CONFIG.waves[0].wordsPerWave}</span></div>
                <div>Genauigkeit: <span id="accuracy-value" style="color: #ffaa00;">0.0</span>%</div>
                <div>Highscore: <span id="highscore-value" style="color: #FFD700;">${highscoreValue}</span></div>
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
        if (this.inBossFight) return; // No spawning during boss fight

        const waveConfig = GAME_CONFIG.waves[this.currentWave];
        if (this.waveDestroyed >= waveConfig.wordsPerWave) return; // Wave complete

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
            direction,
            this.isProMode
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

        // Check if waiting for wave start (Enter key to continue)
        if (this.waitingForWaveStart) {
            if (event.key === 'Enter' || event.key === ' ') {
                this.startNextWave();
            }
            return;
        }

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
                    audioManager.playEnemyDefeatedSound();
                    this.bossDefeated();
                }

                this.updateUI();
                return;
            } else {
                audioManager.playErrorSound();
                // In Pro Mode, reset word progress on wrong input
                if (this.isProMode) {
                    this.boss.resetProgress();
                }
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
                if (this.isProMode) {
                    // Pro Mode: reset word progress and lose target
                    this.currentTarget.resetProgress();
                    this.currentTarget = null;
                } else {
                    // Normal Mode: keep progress but lose target
                    // (can re-target later by typing the next expected letter)
                    this.currentTarget = null;
                }
            }
        }

        // Find new target (only if we don't have one)
        if (!this.currentTarget) {
            let closestDistance = Infinity;

            for (const asteroid of this.asteroids) {
                // Check if the typed character matches the expected character at current position
                if (asteroid.typedChars < asteroid.word.length &&
                    asteroid.word[asteroid.typedChars].toLowerCase() === char.toLowerCase()) {
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

                // Check if asteroid is now complete and destroy it
                if (this.currentTarget.isComplete()) {
                    this.destroyAsteroid(this.currentTarget);
                    this.currentTarget = null;
                }

                this.updateUI();
            }
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
        this.waveDestroyed++;
        audioManager.playEnemyDefeatedSound();

        // Check if wave complete
        const waveConfig = GAME_CONFIG.waves[this.currentWave];
        if (this.waveDestroyed >= waveConfig.wordsPerWave && !this.inBossFight) {
            this.waveComplete();
        }

        this.updateUI();
    }

    private waveComplete(): void {
        // Clear all remaining asteroids
        for (const asteroid of this.asteroids) {
            asteroid.destroy(this.scene);
        }
        this.asteroids = [];
        this.currentTarget = null;

        // Spawn boss for this wave
        this.spawnBoss();
    }

    private bossDefeated(): void {
        this.boss = null;
        this.inBossFight = false;
        this.bossSpawned = false;

        // Move to next wave
        this.currentWave++;

        // Check if all waves complete
        if (this.currentWave >= this.totalWaves) {
            this.victory();
            return;
        }

        // Pause game and wait for player input
        this.waitingForWaveStart = true;

        // Show wave transition with "Press ENTER" prompt
        const waveConfig = GAME_CONFIG.waves[this.currentWave];
        this.showWaveTransition(waveConfig.waveName);
    }

    private startNextWave(): void {
        // Remove transition overlay
        const overlay = document.getElementById('wave-transition-overlay');
        if (overlay) {
            overlay.remove();
        }

        // Reset wave stats
        this.waveDestroyed = 0;
        this.usedWords = [];

        // Load words for next wave
        const waveConfig = GAME_CONFIG.waves[this.currentWave];
        this.words = getWordsByDifficulty(waveConfig.wordDifficulty);

        // Resume game
        this.waitingForWaveStart = false;

        // Update UI
        this.updateUI();
    }

    private showWaveTransition(waveName: string): void {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'wave-transition-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '50%';
        overlay.style.left = '50%';
        overlay.style.transform = 'translate(-50%, -50%)';
        overlay.style.textAlign = 'center';
        overlay.style.fontFamily = 'Courier New, monospace';
        overlay.style.zIndex = '1000';

        overlay.innerHTML = `
            <div style="font-size: 56px; font-weight: bold; color: #00ff00; text-shadow: 0 0 20px rgba(0, 255, 0, 0.8); margin-bottom: 30px;">
                Boss besiegt!
            </div>
            <div style="font-size: 48px; font-weight: bold; color: #00ff00; text-shadow: 0 0 20px rgba(0, 255, 0, 0.8); margin-bottom: 50px;">
                ${waveName}
            </div>
            <div id="press-enter-prompt" style="font-size: 32px; font-weight: bold; color: #00d4ff; text-shadow: 0 0 15px rgba(0, 212, 255, 0.8);">
                Drücke ENTER um fortzufahren
            </div>
        `;

        this.container.style.position = 'relative';
        this.container.appendChild(overlay);

        // Pulsing animation for "Press ENTER"
        let opacity = 1;
        let direction = -1;
        const pulseInterval = setInterval(() => {
            const promptElement = document.getElementById('press-enter-prompt');
            if (!promptElement) {
                clearInterval(pulseInterval);
                return;
            }
            opacity += direction * 0.02;
            if (opacity <= 0.3 || opacity >= 1) {
                direction *= -1;
            }
            promptElement.style.opacity = opacity.toString();
        }, 30);
    }

    private spawnBoss(): void {
        this.bossSpawned = true;
        this.inBossFight = true;

        // Clear all remaining asteroids when boss appears
        for (const asteroid of this.asteroids) {
            asteroid.destroy(this.scene);
        }
        this.asteroids = [];
        this.currentTarget = null;

        // Get words from next difficulty level for boss fight
        const nextWaveIndex = Math.min(this.currentWave + 1, GAME_CONFIG.waves.length - 1);
        const bossWaveConfig = GAME_CONFIG.waves[nextWaveIndex];
        const bossWordList = getWordsByDifficulty(bossWaveConfig.wordDifficulty);

        // Select 3 random harder words for boss
        const bossWords: string[] = [];
        const shuffled = [...bossWordList].sort(() => Math.random() - 0.5);
        for (let i = 0; i < 3 && i < shuffled.length; i++) {
            bossWords.push(shuffled[i]);
        }

        this.boss = new Boss(
            this.scene,
            20,
            0,
            0,
            bossWords,
            3.0,
            this.isProMode
        );

        console.log('⚠️ BOSS ERSCHEINT! ⚠️');
    }

    private updateUI(): void {
        const healthEl = document.getElementById('health-value');
        const destroyedEl = document.getElementById('destroyed-value');
        const accuracyEl = document.getElementById('accuracy-value');

        if (healthEl) healthEl.textContent = this.health.toString();

        if (destroyedEl) {
            if (this.inBossFight) {
                destroyedEl.textContent = `Boss-Kampf!`;
            } else {
                const waveConfig = GAME_CONFIG.waves[this.currentWave];
                destroyedEl.textContent = `Welle ${this.currentWave + 1}: ${this.waveDestroyed}/${waveConfig.wordsPerWave}`;
            }
        }

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
        // Calculate total enemies from all waves
        const totalEnemies = GAME_CONFIG.waves.reduce((sum, wave) => sum + wave.wordsPerWave, 0);

        // Calculate score (but don't save yet - wait for name input)
        const entry = highscoreService.createEntry({
            correctKeystrokes: this.correctKeystrokes,
            totalKeystrokes: this.totalKeystrokes,
            enemiesDefeated: this.destroyed,
            totalEnemies: totalEnemies,
            time: time,
            difficulty: this.speed as Difficulty,
            proMode: this.isProMode,
            mode: '3D',
            success: success
        });

        // Temporarily save to check rank
        highscoreService.saveScore(entry);

        // Check if it's a new highscore
        const isNewHighscore = highscoreService.isNewHighscore(entry.score, this.speed as Difficulty);
        const highscoreRank = highscoreService.getLastSavedScoreRank(this.speed as Difficulty);

        // Load saved name
        const savedName = localStorage.getItem('typerspace_player_name') || '';

        // Build new highscore banner HTML
        const highscoreBanner = isNewHighscore && highscoreRank
            ? `<div style="font-size: 2rem; color: #00ff00; margin-bottom: 1.5rem; font-weight: bold;">
                   🏆 NEUER HIGHSCORE! #${highscoreRank} 🏆
               </div>`
            : '';

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
                <h1 style="font-size: 4rem; color: ${success ? '#00ff00' : '#ff0000'}; margin-bottom: 1rem;">
                    ${success ? '🎉 Sieg!' : '💥 Game Over'}
                </h1>
                <div style="font-size: 2.5rem; color: #FFD700; margin-bottom: 1rem; font-weight: bold;">
                    ⭐ SCORE: ${highscoreService.formatScore(entry.score)} ⭐
                </div>
                ${highscoreBanner}
                <div style="margin-bottom: 1.5rem;">
                    <label style="font-size: 1.3rem; color: #00d4ff; font-weight: bold; display: block; margin-bottom: 0.5rem;">
                        Dein Name für die Rangliste:
                    </label>
                    <input
                        type="text"
                        id="player-name-input-3d"
                        placeholder="Spieler"
                        maxlength="20"
                        value="${savedName}"
                        style="
                            width: 300px;
                            padding: 10px;
                            font-size: 1.2rem;
                            font-family: 'Courier New', monospace;
                            text-align: center;
                            background-color: #1a1e3a;
                            color: #ffffff;
                            border: 2px solid #00d4ff;
                            border-radius: 5px;
                            outline: none;
                        "
                        onfocus="this.style.borderColor='#00ff00'; this.style.boxShadow='0 0 10px rgba(0, 255, 0, 0.5)';"
                        onblur="this.style.borderColor='#00d4ff'; this.style.boxShadow='none';"
                    />
                </div>
                <div style="font-size: 1.3rem; color: #8892b0; margin-bottom: 0.5rem;">
                    <p>Schwierigkeit: ${this.speed.toUpperCase()} ${this.isProMode ? '⚡ Profi-Modus' : ''}</p>
                </div>
                <div style="font-size: 1.5rem; color: #8892b0; margin-bottom: 2rem;">
                    <p>Genauigkeit: ${accuracy}%</p>
                    <p>Tippgeschwindigkeit: ${wpm} WPM</p>
                    <p>Zeit: ${time.toFixed(1)}s</p>
                </div>
                <div style="margin-bottom: 1rem;">
                    <button id="save-score-btn-3d" style="
                        padding: 12px 30px;
                        font-size: 1.2rem;
                        font-weight: bold;
                        color: #000;
                        background-color: #00ff00;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-family: 'Courier New', monospace;
                        transition: all 0.2s;
                    "
                    onmouseover="this.style.boxShadow='0 0 15px rgba(0, 255, 0, 0.8)'; this.style.transform='scale(1.05)';"
                    onmouseout="this.style.boxShadow='none'; this.style.transform='scale(1)';">
                        ✓ Speichern
                    </button>
                </div>
                <div style="display: flex; gap: 20px;">
                    <button id="view-leaderboard-btn" style="
                        padding: 15px 40px;
                        font-size: 1.3rem;
                        font-weight: bold;
                        color: #FFD700;
                        background: linear-gradient(135deg, #1a1e3a 0%, #2d3561 100%);
                        border: 2px solid #FFD700;
                        border-radius: 50px;
                        cursor: pointer;
                        font-family: 'Courier New', monospace;
                    "
                    onmouseover="this.style.boxShadow='0 0 15px rgba(255, 215, 0, 0.8)';"
                    onmouseout="this.style.boxShadow='none';">
                        🏆 Rangliste
                    </button>
                    <button id="save-and-reload-btn" style="
                        padding: 15px 40px;
                        font-size: 1.3rem;
                        font-weight: bold;
                        color: #fff;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: 2px solid #00d4ff;
                        border-radius: 50px;
                        cursor: pointer;
                        font-family: 'Courier New', monospace;
                    "
                    onmouseover="this.style.boxShadow='0 0 15px rgba(0, 212, 255, 0.8)';"
                    onmouseout="this.style.boxShadow='none';">
                        🏠 Zurück zum Menü
                    </button>
                </div>
            </div>
        `;

        // Add event listeners for buttons
        const saveScoreBtn = document.getElementById('save-score-btn-3d');
        const leaderboardBtn = document.getElementById('view-leaderboard-btn');
        const menuBtn = document.getElementById('save-and-reload-btn');
        const nameInput = document.getElementById('player-name-input-3d') as HTMLInputElement;

        if (nameInput) {
            // Auto-focus the input
            setTimeout(() => nameInput.focus(), 100);

            // Handle Enter key - save score
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.saveScoreOnly(entry, nameInput);
                }
            });
        }

        // Save button - just saves without navigation
        if (saveScoreBtn && nameInput) {
            saveScoreBtn.addEventListener('click', () => {
                this.saveScoreOnly(entry, nameInput);
            });
        }

        // Leaderboard button - save and go to leaderboard
        if (leaderboardBtn && nameInput) {
            leaderboardBtn.addEventListener('click', () => {
                this.saveNameAndGoToLeaderboard(entry, nameInput);
            });
        }

        // Menu button - save and reload
        if (menuBtn && nameInput) {
            menuBtn.addEventListener('click', () => {
                this.saveNameAndReload(entry, nameInput);
            });
        }
    }

    private saveScoreOnly(entry: any, nameInput: HTMLInputElement): void {
        const playerName = nameInput.value.trim() || 'Spieler';

        // Save name to localStorage
        localStorage.setItem('typerspace_player_name', playerName);

        // Add name to entry and save again
        entry.playerName = playerName;
        highscoreService.saveScore(entry);

        // Show confirmation message
        const saveBtn = document.getElementById('save-score-btn-3d');
        if (saveBtn) {
            saveBtn.textContent = '✓ Gespeichert!';
            saveBtn.style.backgroundColor = '#00cc00';
            setTimeout(() => {
                saveBtn.textContent = '✓ Speichern';
                saveBtn.style.backgroundColor = '#00ff00';
            }, 2000);
        }
    }

    private saveNameAndGoToLeaderboard(entry: any, nameInput: HTMLInputElement): void {
        const playerName = nameInput.value.trim() || 'Spieler';

        // Save name to localStorage
        localStorage.setItem('typerspace_player_name', playerName);

        // Add name to entry and save again
        entry.playerName = playerName;
        highscoreService.saveScore(entry);

        // Navigate to start screen with Phaser mode enabled to show leaderboard
        // We'll use a URL parameter to indicate we want to go to leaderboard
        localStorage.setItem('typerspace_navigate_to_leaderboard', 'true');
        location.reload();
    }

    private saveNameAndReload(entry: any, nameInput: HTMLInputElement): void {
        const playerName = nameInput.value.trim() || 'Spieler';

        // Save name to localStorage
        localStorage.setItem('typerspace_player_name', playerName);

        // Add name to entry and save again
        entry.playerName = playerName;
        highscoreService.saveScore(entry);

        // Reload page
        location.reload();
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

        // Pause game logic during wave transition
        if (this.waitingForWaveStart) {
            this.renderer.render(this.scene, this.camera);
            return;
        }

        // Spawn asteroids (only if boss hasn't spawned yet)
        if (!this.bossSpawned) {
            this.spawnTimer += deltaTime;
            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnAsteroid();
                this.spawnTimer = 0;
            }
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

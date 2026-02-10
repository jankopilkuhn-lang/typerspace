declare var Phaser: any;

import { Enemy } from '../entities/Enemy';
import { getWordsByDifficulty } from '../data/words';
import { audioManager } from '../audio/AudioManager';
import { GAME_CONFIG } from '../config/game-config';
import { highscoreService } from '../services/HighscoreService';
import { Difficulty } from '../types/highscore';

/**
 * Level 1 - Main gameplay scene
 */
export class Level1Scene extends Phaser.State {
    private game: any;
    private player: any;
    private enemies: Enemy[] = [];
    private currentTarget: Enemy | null = null;

    // Game stats
    private enemiesDefeated: number = 0;
    private waveEnemiesDefeated: number = 0; // Enemies defeated in current wave
    private totalKeystrokes: number = 0;
    private correctKeystrokes: number = 0;
    private startTime: number = 0;

    // Wave system
    private currentWave: number = 0;
    private totalWaves: number = GAME_CONFIG.waves.length;

    // UI Elements
    private scoreText: any;
    private healthText: any;
    private highscoreText: any;
    private currentWordText: any;
    private damageOverlay: any;

    // Game settings
    private speed: string = 'easy'; // Speed setting (easy/medium/hard/ultra)
    private spawnTimer: number = 0;
    private spawnInterval: number = 2000; // ms
    private enemySpeed: number = 1;
    private health: number = 3;
    private isProMode: boolean = false;
    private waitingForWaveStart: boolean = false; // Pause between waves

    // Word list
    private wordList: string[];
    private usedWords: string[] = [];

    init(speed?: string, isProMode?: boolean): void {
        if (speed) {
            this.speed = speed;
        }
        if (isProMode !== undefined) {
            this.isProMode = isProMode;
        }

        // Reset game state
        this.health = GAME_CONFIG.startingHealth;
        this.enemiesDefeated = 0;
        this.waveEnemiesDefeated = 0;
        this.currentWave = 0;
        this.totalKeystrokes = 0;
        this.correctKeystrokes = 0;
        this.enemies = [];
        this.currentTarget = null;
        this.usedWords = [];
        this.spawnTimer = 0;

        // Set speed settings from config
        const speedConfig = GAME_CONFIG.speeds[this.speed];
        this.spawnInterval = speedConfig.spawnInterval2D;
        this.enemySpeed = speedConfig.enemySpeed2D;

        // Load words for first wave
        const waveConfig = GAME_CONFIG.waves[this.currentWave];
        this.wordList = getWordsByDifficulty(waveConfig.wordDifficulty);
    }

    create(): void {
        this.startTime = Date.now();

        // Start gameplay music
        audioManager.startGameplayMusic();

        // Background
        this.game.stage.backgroundColor = '#0a0e27';

        // Add stars background
        this.createStarfield();

        // Create player on the left side
        this.createPlayer();

        // Setup UI
        this.createUI();

        // Setup keyboard input
        this.game.input.keyboard.addCallbacks(this, null, null, this.onKeyPress);

        // Spawn first enemy
        this.spawnEnemy();
    }

    createStarfield(): void {
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.game.width;
            const y = Math.random() * this.game.height;
            const size = Math.random() * 2 + 1;

            const star = this.game.add.graphics(x, y);
            star.beginFill(0xffffff, Math.random() * 0.5 + 0.3);
            star.drawCircle(0, 0, size);
            star.endFill();
        }
    }

    createPlayer(): void {
        // Create player spaceship with NEON GLOW effects
        const graphics = this.game.add.graphics(0, 0);

        // === OUTER GLOW LAYERS (creates neon effect) ===
        // Outermost glow - cyan aura
        graphics.beginFill(0x00ffff, 0.15);
        graphics.moveTo(0, -20);
        graphics.lineTo(52, -12);
        graphics.lineTo(65, 0);
        graphics.lineTo(52, 12);
        graphics.lineTo(0, 20);
        graphics.lineTo(8, 0);
        graphics.endFill();

        // Middle glow layer
        graphics.beginFill(0x00d4ff, 0.25);
        graphics.moveTo(0, -18);
        graphics.lineTo(51, -10);
        graphics.lineTo(63, 0);
        graphics.lineTo(51, 10);
        graphics.lineTo(0, 18);
        graphics.lineTo(8, 0);
        graphics.endFill();

        // === MAIN BODY (fuselage) - brighter neon cyan ===
        graphics.beginFill(0x00eeff);
        graphics.moveTo(0, -15);
        graphics.lineTo(50, -8);
        graphics.lineTo(60, 0);
        graphics.lineTo(50, 8);
        graphics.lineTo(0, 15);
        graphics.lineTo(8, 0);
        graphics.endFill();

        // Body inner highlight (makes it look 3D)
        graphics.beginFill(0xffffff, 0.3);
        graphics.moveTo(5, -12);
        graphics.lineTo(48, -6);
        graphics.lineTo(56, 0);
        graphics.lineTo(48, 6);
        graphics.lineTo(5, 12);
        graphics.lineTo(10, 0);
        graphics.endFill();

        // === NEON OUTLINE - bright cyan glow ===
        graphics.lineStyle(3, 0x00ffff, 0.8);
        graphics.moveTo(0, -15);
        graphics.lineTo(50, -8);
        graphics.lineTo(60, 0);
        graphics.lineTo(50, 8);
        graphics.lineTo(0, 15);
        graphics.lineTo(8, 0);
        graphics.lineTo(0, -15);

        // === WINGS with glow ===
        // Top wing - outer glow
        graphics.lineStyle(0);
        graphics.beginFill(0x00ffff, 0.2);
        graphics.moveTo(8, -10);
        graphics.lineTo(33, -18);
        graphics.lineTo(42, -14);
        graphics.lineTo(17, -6);
        graphics.endFill();

        // Top wing - main
        graphics.beginFill(0x00ccff);
        graphics.moveTo(10, -8);
        graphics.lineTo(35, -15);
        graphics.lineTo(40, -12);
        graphics.lineTo(15, -8);
        graphics.endFill();

        // Top wing neon outline
        graphics.lineStyle(2, 0x66ffff, 0.9);
        graphics.moveTo(10, -8);
        graphics.lineTo(35, -15);
        graphics.lineTo(40, -12);
        graphics.lineTo(15, -8);

        // Bottom wing - outer glow
        graphics.lineStyle(0);
        graphics.beginFill(0x00ffff, 0.2);
        graphics.moveTo(8, 10);
        graphics.lineTo(33, 18);
        graphics.lineTo(42, 14);
        graphics.lineTo(17, 6);
        graphics.endFill();

        // Bottom wing - main
        graphics.beginFill(0x00ccff);
        graphics.moveTo(10, 8);
        graphics.lineTo(35, 15);
        graphics.lineTo(40, 12);
        graphics.lineTo(15, 8);
        graphics.endFill();

        // Bottom wing neon outline
        graphics.lineStyle(2, 0x66ffff, 0.9);
        graphics.moveTo(10, 8);
        graphics.lineTo(35, 15);
        graphics.lineTo(40, 12);
        graphics.lineTo(15, 8);

        // === COCKPIT with intense glow ===
        graphics.lineStyle(0);

        // Cockpit outer glow
        graphics.beginFill(0xffffff, 0.3);
        graphics.drawCircle(45, 0, 14);
        graphics.endFill();

        // Cockpit middle glow
        graphics.beginFill(0x00ffff, 0.5);
        graphics.drawCircle(45, 0, 11);
        graphics.endFill();

        // Cockpit window
        graphics.beginFill(0x66ffff);
        graphics.drawCircle(45, 0, 8);
        graphics.endFill();

        // Cockpit highlight (glare effect)
        graphics.beginFill(0xffffff, 0.9);
        graphics.drawCircle(47, -2, 4);
        graphics.endFill();

        graphics.beginFill(0xffffff);
        graphics.drawCircle(48, -2.5, 2);
        graphics.endFill();

        // === ENGINE GLOW (will be animated) ===
        // Outer engine aura
        graphics.lineStyle(0);
        graphics.beginFill(0xff9933, 0.3);
        graphics.moveTo(2, -12);
        graphics.lineTo(-12, -8);
        graphics.lineTo(-12, 8);
        graphics.lineTo(2, 12);
        graphics.endFill();

        // Engine flame - orange
        graphics.beginFill(0xff6600, 0.9);
        graphics.moveTo(0, -10);
        graphics.lineTo(-10, -6);
        graphics.lineTo(-10, 6);
        graphics.lineTo(0, 10);
        graphics.endFill();

        // Engine core - bright yellow/white
        graphics.beginFill(0xffee00);
        graphics.moveTo(0, -6);
        graphics.lineTo(-7, -4);
        graphics.lineTo(-7, 4);
        graphics.lineTo(0, 6);
        graphics.endFill();

        // Engine center - white hot core
        graphics.beginFill(0xffffff, 0.8);
        graphics.moveTo(0, -3);
        graphics.lineTo(-4, -2);
        graphics.lineTo(-4, 2);
        graphics.lineTo(0, 3);
        graphics.endFill();

        // === DETAIL LINES - neon cyan ===
        graphics.lineStyle(2, 0x00ffff, 0.7);
        graphics.moveTo(20, -6);
        graphics.lineTo(48, -4);
        graphics.moveTo(20, 6);
        graphics.lineTo(48, 4);

        // Additional tech details
        graphics.lineStyle(1, 0x66ffff, 0.6);
        graphics.moveTo(15, 0);
        graphics.lineTo(25, 0);
        graphics.moveTo(30, -3);
        graphics.lineTo(40, -2);
        graphics.moveTo(30, 3);
        graphics.lineTo(40, 2);

        const texture = graphics.generateTexture();
        graphics.destroy();

        this.player = this.game.add.sprite(100, this.game.height / 2, texture);
        this.player.anchor.setTo(0.5);

        // Store original scale for pulsing animation
        this.player.originalScale = 1.0;
    }

    createUI(): void {
        const style = {
            font: '24px Courier New',
            fill: '#ffffff',
            fontWeight: 'bold'
        };

        const waveConfig = GAME_CONFIG.waves[this.currentWave];
        this.scoreText = this.game.add.text(10, 10, `Welle ${this.currentWave + 1}: 0/${waveConfig.wordsPerWave}`, style);
        this.healthText = this.game.add.text(10, 40, `Leben: ${this.health}`, style);

        // Highscore display
        const stats = highscoreService.getStats();
        const personalBest = stats.personalBest[this.speed as Difficulty];
        const highscoreValue = personalBest ? highscoreService.formatScore(personalBest.score) : '-';
        this.highscoreText = this.game.add.text(10, 70, `Highscore: ${highscoreValue}`, {
            font: '20px Courier New',
            fill: '#FFD700',
            fontWeight: 'bold'
        });

        // Current word display
        const currentWordStyle = {
            font: '32px Courier New',
            fill: '#00ff00',
            fontWeight: 'bold'
        };
        this.currentWordText = this.game.add.text(
            this.game.width / 2,
            50,
            '',
            currentWordStyle
        );
        this.currentWordText.anchor.setTo(0.5);

        // Create damage overlay (red flash when hit)
        this.damageOverlay = this.game.add.graphics(0, 0);
        this.damageOverlay.beginFill(0xff0000, 0);
        this.damageOverlay.drawRect(0, 0, this.game.width, this.game.height);
        this.damageOverlay.endFill();
        this.damageOverlay.fixedToCamera = true;
    }

    spawnEnemy(): void {
        const waveConfig = GAME_CONFIG.waves[this.currentWave];
        if (this.waveEnemiesDefeated >= waveConfig.wordsPerWave) {
            return; // Wave complete, no more spawning
        }

        const word = this.getRandomWord();
        const x = this.game.width + 50;
        const y = Math.random() * (this.game.height - 100) + 50;

        const enemy = new Enemy(this.game, x, y, word, this.enemySpeed, this.isProMode);
        this.enemies.push(enemy);
    }

    getRandomWord(): string {
        // Get a word that hasn't been used yet
        let availableWords = this.wordList.filter(w => this.usedWords.indexOf(w) === -1);

        // If all words used, reset
        if (availableWords.length === 0) {
            this.usedWords = [];
            availableWords = this.wordList.slice();
        }

        const word = availableWords[Math.floor(Math.random() * availableWords.length)];
        this.usedWords.push(word);
        return word;
    }

    onKeyPress(char: string): void {
        if (!char || char.length === 0) return;

        // Check if waiting for wave start (Enter key to continue)
        if (this.waitingForWaveStart) {
            if (char === 'Enter' || char === ' ') {
                this.startNextWave();
            }
            return;
        }

        this.totalKeystrokes++;

        // If no current target, find one based on first letter
        if (!this.currentTarget) {
            this.findTargetByFirstLetter(char);
        }

        // Try to type on current target
        if (this.currentTarget) {
            const isCorrect = this.currentTarget.isTyped(char);

            if (isCorrect) {
                this.correctKeystrokes++;

                // Play typing success sound
                audioManager.playTypeSound();

                // Update current word display
                this.updateCurrentWordDisplay();

                // Check if enemy is defeated
                if (this.currentTarget.isComplete()) {
                    this.defeatEnemy(this.currentTarget);
                }
            } else {
                // Play error sound for incorrect key
                audioManager.playErrorSound();

                if (this.isProMode && this.currentTarget) {
                    // Pro Mode: reset word progress and lose target
                    this.currentTarget.resetProgress();
                    this.currentTarget = null;
                    this.currentWordText.text = '';
                } else {
                    // Normal Mode: keep progress but lose target
                    // (can re-target later by typing the next expected letter)
                    this.currentTarget = null;
                    this.currentWordText.text = '';

                    // Try to find a new target with the current character
                    this.findTargetByFirstLetter(char);
                    if (this.currentTarget) {
                        this.updateCurrentWordDisplay();
                    }
                }
            }
        }
    }

    findTargetByFirstLetter(char: string): void {
        // Find enemies that start with this letter
        const candidates = this.enemies.filter(e =>
            e.typedChars < e.word.length &&
            e.word[e.typedChars].toLowerCase() === char.toLowerCase()
        );

        if (candidates.length > 0) {
            // Select the closest enemy to the player
            candidates.sort((a, b) => a.getX() - b.getX());
            this.currentTarget = candidates[0];
            // Don't call isTyped here - it will be called in onKeyPress
            this.updateCurrentWordDisplay();
        }
    }

    updateCurrentWordDisplay(): void {
        if (this.currentTarget) {
            const typed = this.currentTarget.word.substring(0, this.currentTarget.typedChars);
            const remaining = this.currentTarget.word.substring(this.currentTarget.typedChars);
            this.currentWordText.text = typed + remaining;

            // Color the text
            this.currentWordText.clearColors();
            this.currentWordText.addColor('#00ff00', 0);
            if (remaining.length > 0) {
                this.currentWordText.addColor('#ffffff', typed.length);
            }
        } else {
            this.currentWordText.text = '';
        }
    }

    defeatEnemy(enemy: Enemy): void {
        // Remove from array
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }

        // Destroy sprite
        enemy.destroy();

        // Play enemy defeated sound
        audioManager.playEnemyDefeatedSound();

        // Update stats
        this.enemiesDefeated++;
        this.waveEnemiesDefeated++;

        const waveConfig = GAME_CONFIG.waves[this.currentWave];
        this.scoreText.text = `Welle ${this.currentWave + 1}: ${this.waveEnemiesDefeated}/${waveConfig.wordsPerWave}`;

        // Clear current target
        if (this.currentTarget === enemy) {
            this.currentTarget = null;
            this.currentWordText.text = '';
        }

        // Check if wave complete
        if (this.waveEnemiesDefeated >= waveConfig.wordsPerWave) {
            this.waveComplete();
        }
    }

    checkCollisions(): void {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            // Check if enemy reached player
            if (enemy.getX() < this.player.x + 50) {
                // Enemy hit the player
                this.health--;
                this.healthText.text = `Leben: ${this.health}`;

                // Create explosion effect
                enemy.explode();
                this.enemies.splice(i, 1);

                // Red screen flash effect
                this.showDamageEffect();

                // Clear target if it was this enemy
                if (this.currentTarget === enemy) {
                    this.currentTarget = null;
                    this.currentWordText.text = '';
                }

                // Check game over
                if (this.health <= 0) {
                    this.gameOver();
                }
            }
        }
    }

    showDamageEffect(): void {
        // Clear any existing damage overlay
        this.damageOverlay.clear();

        // Full screen red overlay with higher opacity
        this.damageOverlay.beginFill(0xff0000, 0.7);
        this.damageOverlay.drawRect(0, 0, this.game.width, this.game.height);
        this.damageOverlay.endFill();

        // Add darker red vignette around edges
        this.damageOverlay.beginFill(0x990000, 0.5);
        this.damageOverlay.drawRect(0, 0, this.game.width, 80);
        this.damageOverlay.drawRect(0, this.game.height - 80, this.game.width, 80);
        this.damageOverlay.drawRect(0, 0, 80, this.game.height);
        this.damageOverlay.drawRect(this.game.width - 80, 0, 80, this.game.height);
        this.damageOverlay.endFill();

        // Double flash effect for more impact
        const firstFlash = this.game.add.tween(this.damageOverlay);
        firstFlash.to({ alpha: 0.3 }, 100, Phaser.Easing.Quadratic.Out, true);

        firstFlash.onComplete.add(() => {
            const secondFlash = this.game.add.tween(this.damageOverlay);
            secondFlash.to({ alpha: 1 }, 80, Phaser.Easing.Quadratic.In, true);

            secondFlash.onComplete.add(() => {
                const finalFade = this.game.add.tween(this.damageOverlay);
                finalFade.to({ alpha: 0 }, 400, Phaser.Easing.Quadratic.Out, true);
                finalFade.onComplete.add(() => {
                    this.damageOverlay.alpha = 1;
                });
            });
        });

        // Screen shake effect for added impact
        this.shakeScreen();
    }

    shakeScreen(): void {
        const originalX = this.game.camera.x;
        const originalY = this.game.camera.y;
        const shakeIntensity = 8;
        const shakeDuration = 200;
        const shakeSteps = 10;
        const stepDuration = shakeDuration / shakeSteps;

        for (let i = 0; i < shakeSteps; i++) {
            this.game.time.events.add(stepDuration * i, () => {
                if (i < shakeSteps - 1) {
                    const offsetX = (Math.random() - 0.5) * shakeIntensity * (1 - i / shakeSteps);
                    const offsetY = (Math.random() - 0.5) * shakeIntensity * (1 - i / shakeSteps);
                    this.game.camera.x = originalX + offsetX;
                    this.game.camera.y = originalY + offsetY;
                } else {
                    // Reset to original position
                    this.game.camera.x = originalX;
                    this.game.camera.y = originalY;
                }
            });
        }
    }

    update(): void {
        // Pause game logic during wave transition
        if (this.waitingForWaveStart) {
            // Only update player animation during wave transition
            if (this.player) {
                const time = this.game.time.now / 1000;
                const pulseSpeed = 2.0;
                const pulseAmount = 0.15;
                this.player.alpha = 1.0 - (Math.sin(time * pulseSpeed) * pulseAmount * 0.5 + pulseAmount * 0.5);
                const scaleSpeed = 1.5;
                const scaleAmount = 0.02;
                const scalePulse = Math.sin(time * scaleSpeed) * scaleAmount;
                this.player.scale.setTo(1.0 + scalePulse, 1.0 + scalePulse);
            }
            return;
        }

        // Update enemies
        this.enemies.forEach(enemy => enemy.update());

        // Check collisions
        this.checkCollisions();

        // Spawn new enemies (only if wave not complete)
        const waveConfig = GAME_CONFIG.waves[this.currentWave];
        this.spawnTimer += this.game.time.elapsed;
        if (this.spawnTimer >= this.spawnInterval && this.waveEnemiesDefeated < waveConfig.wordsPerWave) {
            this.spawnEnemy();
            this.spawnTimer = 0;
        }

        // === NEON GLOW PULSING ANIMATION ===
        // Create smooth pulsing effect for the spaceship (only during active gameplay)
        if (this.player) {
            const time = this.game.time.now / 1000; // Convert to seconds

            // Pulse the alpha between 0.85 and 1.0 for a subtle breathing effect
            const pulseSpeed = 2.0; // Speed of pulsing
            const pulseAmount = 0.15; // How much it pulses
            this.player.alpha = 1.0 - (Math.sin(time * pulseSpeed) * pulseAmount * 0.5 + pulseAmount * 0.5);

            // Very subtle scale pulse (makes the glow feel more dynamic)
            const scaleSpeed = 1.5;
            const scaleAmount = 0.02; // Very subtle
            const scalePulse = Math.sin(time * scaleSpeed) * scaleAmount;
            this.player.scale.setTo(1.0 + scalePulse, 1.0 + scalePulse);
        }
    }

    waveComplete(): void {
        // Clear all remaining enemies
        for (const enemy of this.enemies) {
            enemy.destroy();
        }
        this.enemies = [];
        this.currentTarget = null;

        // Move to next wave
        this.currentWave++;

        // Check if all waves complete
        if (this.currentWave >= this.totalWaves) {
            this.levelComplete();
            return;
        }

        // Pause game and wait for player input
        this.waitingForWaveStart = true;

        // Show wave transition message with "Press ENTER" prompt
        const waveConfig = GAME_CONFIG.waves[this.currentWave];
        this.showWaveTransition(waveConfig.waveName);
    }

    startNextWave(): void {
        // Destroy transition texts
        if ((this as any).waveTransitionText) {
            (this as any).waveTransitionText.destroy();
        }
        if ((this as any).wavePromptText) {
            (this as any).wavePromptText.destroy();
        }
        if ((this as any).wavePulseTween) {
            (this as any).wavePulseTween.stop();
        }

        // Reset wave stats
        this.waveEnemiesDefeated = 0;
        this.usedWords = [];

        // Load words for next wave
        const waveConfig = GAME_CONFIG.waves[this.currentWave];
        this.wordList = getWordsByDifficulty(waveConfig.wordDifficulty);

        // Resume game
        this.waitingForWaveStart = false;

        // Update UI
        this.scoreText.text = `Welle ${this.currentWave + 1}: 0/${waveConfig.wordsPerWave}`;
    }

    showWaveTransition(waveName: string): void {
        // Create transition text
        const transitionText = this.game.add.text(
            this.game.width / 2,
            this.game.height / 2 - 50,
            `Welle abgeschlossen!\n\n${waveName}`,
            {
                font: 'bold 48px Courier New',
                fill: '#00ff00',
                align: 'center'
            }
        );
        transitionText.anchor.setTo(0.5);

        // Create "Press ENTER" text
        const promptText = this.game.add.text(
            this.game.width / 2,
            this.game.height / 2 + 80,
            'Drücke ENTER um fortzufahren',
            {
                font: 'bold 28px Courier New',
                fill: '#00d4ff',
                align: 'center'
            }
        );
        promptText.anchor.setTo(0.5);

        // Pulsing animation for prompt
        const pulse = this.game.add.tween(promptText);
        pulse.to({ alpha: 0.3 }, 800, Phaser.Easing.Quadratic.InOut, true, 0, -1, true);

        // Store references to destroy later when wave starts
        (this as any).waveTransitionText = transitionText;
        (this as any).wavePromptText = promptText;
        (this as any).wavePulseTween = pulse;
    }

    levelComplete(): void {
        const endTime = Date.now();
        const totalTime = (endTime - this.startTime) / 1000; // in seconds

        const accuracy = this.totalKeystrokes > 0
            ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100)
            : 0;

        const wpm = Math.round((this.correctKeystrokes / 5) / (totalTime / 60));

        // Calculate total enemies from all waves
        const totalEnemies = GAME_CONFIG.waves.reduce((sum, wave) => sum + wave.wordsPerWave, 0);

        // Play level complete sound
        audioManager.playLevelCompleteSound();

        // Stop gameplay music
        audioManager.stopBackgroundMusic();

        // Go to results scene
        this.game.state.start('ResultsScene', true, false, {
            accuracy: accuracy,
            wpm: wpm,
            time: totalTime,
            difficulty: this.speed,
            success: true,
            proMode: this.isProMode,
            enemiesDefeated: this.enemiesDefeated,
            totalEnemies: totalEnemies,
            correctKeystrokes: this.correctKeystrokes,
            totalKeystrokes: this.totalKeystrokes,
            mode: '2D'
        });
    }

    gameOver(): void {
        const endTime = Date.now();
        const totalTime = (endTime - this.startTime) / 1000;

        const accuracy = this.totalKeystrokes > 0
            ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100)
            : 0;

        const wpm = Math.round((this.correctKeystrokes / 5) / (totalTime / 60));

        // Calculate total enemies from all waves
        const totalEnemies = GAME_CONFIG.waves.reduce((sum, wave) => sum + wave.wordsPerWave, 0);

        // Play game over sound
        audioManager.playGameOverSound();

        // Stop gameplay music
        audioManager.stopBackgroundMusic();

        // Go to results scene
        this.game.state.start('ResultsScene', true, false, {
            accuracy: accuracy,
            wpm: wpm,
            time: totalTime,
            difficulty: this.speed,
            success: false,
            proMode: this.isProMode,
            enemiesDefeated: this.enemiesDefeated,
            totalEnemies: totalEnemies,
            correctKeystrokes: this.correctKeystrokes,
            totalKeystrokes: this.totalKeystrokes,
            mode: '2D'
        });
    }
}

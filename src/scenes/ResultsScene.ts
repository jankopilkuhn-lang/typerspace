declare var Phaser: any;

import { highscoreService } from '../services/HighscoreService';
import { Difficulty, GameMode } from '../types/highscore';

/**
 * Results Scene - Shows stats after level completion or game over
 */
export class ResultsScene extends Phaser.State {
    private game: any;
    private accuracy: number;
    private wpm: number;
    private time: number;
    private difficulty: string;
    private success: boolean;
    private proMode: boolean;
    private enemiesDefeated: number;
    private totalEnemies: number;
    private correctKeystrokes: number;
    private totalKeystrokes: number;
    private mode: GameMode;
    private score: number;
    private isNewHighscore: boolean;
    private highscoreRank: number | null;
    private unsavedEntry: any; // Store entry before saving with name
    private scoreSaved: boolean = false; // Track if score has been saved

    async init(data: any): Promise<void> {
        this.accuracy = data.accuracy || 0;
        this.wpm = data.wpm || 0;
        this.time = data.time || 0;
        this.difficulty = data.difficulty || 'easy';
        this.success = data.success || false;
        this.proMode = data.proMode || false;
        this.enemiesDefeated = data.enemiesDefeated || 0;
        this.totalEnemies = data.totalEnemies || 50;
        this.correctKeystrokes = data.correctKeystrokes || 0;
        this.totalKeystrokes = data.totalKeystrokes || 0;
        this.mode = data.mode || '2D';

        // Calculate score (but don't save yet - wait for name input)
        const entry = highscoreService.createEntry({
            correctKeystrokes: this.correctKeystrokes,
            totalKeystrokes: this.totalKeystrokes,
            enemiesDefeated: this.enemiesDefeated,
            totalEnemies: this.totalEnemies,
            time: this.time,
            difficulty: this.difficulty as Difficulty,
            proMode: this.proMode,
            mode: this.mode,
            success: this.success
        });

        this.score = entry.score;
        this.unsavedEntry = entry; // Store for later saving with name

        // Check if it's a new highscore (without saving yet)
        this.isNewHighscore = await highscoreService.isNewHighscore(this.score, this.difficulty as Difficulty);
        this.highscoreRank = await highscoreService.getEntryRank(entry);
    }

    create(): void {
        // Background
        this.game.stage.backgroundColor = '#0a0e27';

        let yPos = 80;

        // Title
        const titleStyle = {
            font: '48px Courier New',
            fill: this.success ? '#00ff00' : '#ff0000',
            fontWeight: 'bold'
        };
        const title = this.game.add.text(
            this.game.width / 2,
            yPos,
            this.success ? 'Level Geschafft!' : 'Game Over!',
            titleStyle
        );
        title.anchor.setTo(0.5);
        yPos += 70;

        // Score display (prominent)
        const scoreStyle = {
            font: '40px Courier New',
            fill: '#FFD700',
            fontWeight: 'bold'
        };
        const scoreText = this.game.add.text(
            this.game.width / 2,
            yPos,
            `⭐ SCORE: ${highscoreService.formatScore(this.score)} ⭐`,
            scoreStyle
        );
        scoreText.anchor.setTo(0.5);
        yPos += 60;

        // New highscore banner
        if (this.isNewHighscore && this.highscoreRank) {
            const highscoreBannerStyle = {
                font: '32px Courier New',
                fill: '#00ff00',
                fontWeight: 'bold'
            };
            const highscoreBanner = this.game.add.text(
                this.game.width / 2,
                yPos,
                `🏆 NEUER HIGHSCORE! #${this.highscoreRank} 🏆`,
                highscoreBannerStyle
            );
            highscoreBanner.anchor.setTo(0.5);
            yPos += 50;
        }

        // Name input field
        this.createNameInput(yPos);
        yPos += 80;

        // Difficulty and mode indicators
        const infoStyle = {
            font: '28px Courier New',
            fill: '#8892b0',
            fontWeight: 'normal'
        };
        const difficultyText = this.game.add.text(
            this.game.width / 2,
            yPos,
            `Schwierigkeit: ${this.getDifficultyText()}`,
            infoStyle
        );
        difficultyText.anchor.setTo(0.5);
        yPos += 40;

        if (this.proMode) {
            const proModeText = this.game.add.text(
                this.game.width / 2,
                yPos,
                '⚡ Profi-Modus: AN',
                infoStyle
            );
            proModeText.anchor.setTo(0.5);
            yPos += 40;
        }

        yPos += 10;

        // Stats
        const statsStyle = {
            font: '28px Courier New',
            fill: '#ffffff',
            fontWeight: 'bold'
        };

        const stats = [
            `Tippgenauigkeit: ${this.accuracy}%`,
            `Tippgeschwindigkeit: ${this.wpm} WPM`,
            `Zeit: ${this.time.toFixed(1)}s`,
            ``,
            this.getAccuracyRating(),
            this.getSpeedRating()
        ];

        stats.forEach(stat => {
            const text = this.game.add.text(this.game.width / 2, yPos, stat, statsStyle);
            text.anchor.setTo(0.5);
            yPos += 40;
        });

        // Buttons
        this.createButtons();
    }

    getDifficultyText(): string {
        switch (this.difficulty) {
            case 'easy': return 'Leicht';
            case 'medium': return 'Mittel';
            case 'hard': return 'Schwer';
            case 'ultra': return 'Ultraschwer';
            case 'extreme': return 'Extrem';
            default: return 'Leicht';
        }
    }

    getAccuracyRating(): string {
        if (this.accuracy >= 95) return '🌟 Perfekte Genauigkeit!';
        if (this.accuracy >= 85) return '✨ Sehr gut!';
        if (this.accuracy >= 70) return '👍 Gut gemacht!';
        if (this.accuracy >= 50) return '📝 Weiter üben!';
        return '💪 Nicht aufgeben!';
    }

    getSpeedRating(): string {
        if (this.wpm >= 60) return '🚀 Blitzschnell!';
        if (this.wpm >= 40) return '⚡ Schnell!';
        if (this.wpm >= 25) return '👌 Solides Tempo!';
        if (this.wpm >= 15) return '🐢 Gemächlich';
        return '🐌 Langsam und stetig';
    }

    createNameInput(yPos: number): void {
        // Label text
        const labelStyle = {
            font: '24px Courier New',
            fill: '#00d4ff',
            fontWeight: 'bold'
        };
        const label = this.game.add.text(
            this.game.width / 2,
            yPos,
            'Dein Name für die Rangliste:',
            labelStyle
        );
        label.anchor.setTo(0.5);

        // Create HTML input element
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'player-name-input';
        input.placeholder = 'Spieler';
        input.maxLength = 20;
        input.style.position = 'absolute';
        input.style.left = '50%';
        input.style.top = (yPos + 35) + 'px';
        input.style.transform = 'translateX(-50%)';
        input.style.width = '300px';
        input.style.padding = '10px';
        input.style.fontSize = '20px';
        input.style.fontFamily = 'Courier New, monospace';
        input.style.textAlign = 'center';
        input.style.backgroundColor = '#1a1e3a';
        input.style.color = '#ffffff';
        input.style.border = '2px solid #00d4ff';
        input.style.borderRadius = '5px';
        input.style.outline = 'none';
        input.style.zIndex = '1000';

        // Add focus effect
        input.addEventListener('focus', () => {
            input.style.borderColor = '#00ff00';
            input.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
        });
        input.addEventListener('blur', () => {
            input.style.borderColor = '#00d4ff';
            input.style.boxShadow = 'none';
        });

        // Load saved name from localStorage
        const savedName = localStorage.getItem('typerspace_player_name');
        if (savedName) {
            input.value = savedName;
        }

        document.body.appendChild(input);

        // Create save button
        const saveButton = document.createElement('button');
        saveButton.id = 'save-highscore-button';
        saveButton.textContent = '✓ Speichern';
        saveButton.style.position = 'absolute';
        saveButton.style.left = '50%';
        saveButton.style.top = (yPos + 80) + 'px';
        saveButton.style.transform = 'translateX(-50%)';
        saveButton.style.padding = '12px 30px';
        saveButton.style.fontSize = '20px';
        saveButton.style.fontFamily = 'Courier New, monospace';
        saveButton.style.fontWeight = 'bold';
        saveButton.style.backgroundColor = '#00ff00';
        saveButton.style.color = '#000000';
        saveButton.style.border = 'none';
        saveButton.style.borderRadius = '5px';
        saveButton.style.cursor = 'pointer';
        saveButton.style.zIndex = '1000';
        saveButton.style.transition = 'all 0.2s';

        // Add hover effect
        saveButton.addEventListener('mouseenter', () => {
            saveButton.style.backgroundColor = '#00ff00';
            saveButton.style.boxShadow = '0 0 15px rgba(0, 255, 0, 0.8)';
            saveButton.style.transform = 'translateX(-50%) scale(1.05)';
        });
        saveButton.addEventListener('mouseleave', () => {
            saveButton.style.backgroundColor = '#00ff00';
            saveButton.style.boxShadow = 'none';
            saveButton.style.transform = 'translateX(-50%) scale(1)';
        });

        // Add click handler
        saveButton.addEventListener('click', () => {
            this.saveScoreWithName();
        });

        document.body.appendChild(saveButton);

        // Auto-focus the input
        setTimeout(() => input.focus(), 100);

        // Handle Enter key
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveScoreWithName();
            }
        });
    }

    saveScoreWithName(): void {
        // Check if already saved to prevent duplicate entries
        if (this.scoreSaved) {
            return;
        }

        const input = document.getElementById('player-name-input') as HTMLInputElement;
        const button = document.getElementById('save-highscore-button') as HTMLButtonElement;
        if (!input) return;

        const playerName = input.value.trim() || 'Spieler';

        // Save name to localStorage for future use
        localStorage.setItem('typerspace_player_name', playerName);

        // Add name to entry and save
        this.unsavedEntry.playerName = playerName;
        highscoreService.saveScore(this.unsavedEntry);

        // Mark as saved
        this.scoreSaved = true;

        // Remove input field and button
        input.remove();
        if (button) button.remove();

        // Show confirmation message
        const confirmStyle = {
            font: '24px Courier New',
            fill: '#00ff00',
            fontWeight: 'bold'
        };
        const confirmText = this.game.add.text(
            this.game.width / 2,
            this.game.height / 2,
            `✓ Score gespeichert als "${playerName}"`,
            confirmStyle
        );
        confirmText.anchor.setTo(0.5);
        confirmText.alpha = 0;

        // Fade in and out animation
        const fadeIn = this.game.add.tween(confirmText);
        fadeIn.to({ alpha: 1 }, 500, Phaser.Easing.Quadratic.Out, true);
        fadeIn.onComplete.add(() => {
            const fadeOut = this.game.add.tween(confirmText);
            fadeOut.to({ alpha: 0 }, 500, Phaser.Easing.Quadratic.In, true, 1500);
        });
    }

    shutdown(): void {
        // Clean up input field and button when leaving scene
        const input = document.getElementById('player-name-input');
        if (input) {
            input.remove();
        }
        const button = document.getElementById('save-highscore-button');
        if (button) {
            button.remove();
        }
    }

    createButtons(): void {
        const buttonStyle = {
            font: '28px Courier New',
            fill: '#ffffff',
            fontWeight: 'bold'
        };

        const buttonY = this.game.height - 100;
        const spacing = 230;

        // Restart button
        const restartBtn = this.game.add.text(
            this.game.width / 2 - spacing,
            buttonY,
            '↻ Nochmal',
            buttonStyle
        );
        restartBtn.anchor.setTo(0.5);
        restartBtn.inputEnabled = true;
        restartBtn.input.useHandCursor = true;
        restartBtn.events.onInputDown.add(() => {
            this.saveScoreWithName();
            setTimeout(() => {
                this.game.state.start('Level1Scene', true, false, this.difficulty);
            }, 100);
        }, this);

        // Add hover effect
        restartBtn.events.onInputOver.add(() => {
            restartBtn.fill = '#00ff00';
        }, this);
        restartBtn.events.onInputOut.add(() => {
            restartBtn.fill = '#ffffff';
        }, this);

        // Leaderboard button (new!)
        const leaderboardBtn = this.game.add.text(
            this.game.width / 2,
            buttonY,
            '🏆 Rangliste',
            buttonStyle
        );
        leaderboardBtn.anchor.setTo(0.5);
        leaderboardBtn.inputEnabled = true;
        leaderboardBtn.input.useHandCursor = true;
        leaderboardBtn.events.onInputDown.add(() => {
            this.saveScoreWithName();
            setTimeout(() => {
                this.game.state.start('LeaderboardScene', true, false, { selectedDifficulty: this.difficulty });
            }, 100);
        }, this);

        // Add hover effect
        leaderboardBtn.events.onInputOver.add(() => {
            leaderboardBtn.fill = '#FFD700';
        }, this);
        leaderboardBtn.events.onInputOut.add(() => {
            leaderboardBtn.fill = '#ffffff';
        }, this);

        // Menu button
        const menuBtn = this.game.add.text(
            this.game.width / 2 + spacing,
            buttonY,
            '🏠 Menü',
            buttonStyle
        );
        menuBtn.anchor.setTo(0.5);
        menuBtn.inputEnabled = true;
        menuBtn.input.useHandCursor = true;
        menuBtn.events.onInputDown.add(() => {
            this.saveScoreWithName();
            setTimeout(() => {
                this.game.state.start('MenuScene');
            }, 100);
        }, this);

        // Add hover effect
        menuBtn.events.onInputOver.add(() => {
            menuBtn.fill = '#00d4ff';
        }, this);
        menuBtn.events.onInputOut.add(() => {
            menuBtn.fill = '#ffffff';
        }, this);
    }
}

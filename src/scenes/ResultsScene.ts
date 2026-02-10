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

    init(data: any): void {
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

        // Calculate and save highscore
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
        highscoreService.saveScore(entry);

        // Check if it's a new highscore
        this.isNewHighscore = highscoreService.isNewHighscore(this.score, this.difficulty as Difficulty);
        this.highscoreRank = highscoreService.getLastSavedScoreRank(this.difficulty as Difficulty);
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
            this.game.state.start('Level1Scene', true, false, this.difficulty);
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
            this.game.state.start('LeaderboardScene', true, false, { selectedDifficulty: this.difficulty });
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
            this.game.state.start('MenuScene');
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

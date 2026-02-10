declare var Phaser: any;

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

    init(data: any): void {
        this.accuracy = data.accuracy || 0;
        this.wpm = data.wpm || 0;
        this.time = data.time || 0;
        this.difficulty = data.difficulty || 'easy';
        this.success = data.success || false;
    }

    create(): void {
        // Background
        this.game.stage.backgroundColor = '#0a0e27';

        // Title
        const titleStyle = {
            font: '48px Courier New',
            fill: this.success ? '#00ff00' : '#ff0000',
            fontWeight: 'bold'
        };
        const title = this.game.add.text(
            this.game.width / 2,
            100,
            this.success ? 'Level Geschafft!' : 'Game Over!',
            titleStyle
        );
        title.anchor.setTo(0.5);

        // Stats
        const statsStyle = {
            font: '32px Courier New',
            fill: '#ffffff',
            fontWeight: 'bold'
        };

        const stats = [
            `Schwierigkeit: ${this.getDifficultyText()}`,
            ``,
            `Tippgenauigkeit: ${this.accuracy}%`,
            `Tippgeschwindigkeit: ${this.wpm} WPM`,
            `Zeit: ${this.time.toFixed(1)}s`,
            ``,
            this.getAccuracyRating(),
            this.getSpeedRating()
        ];

        let yPos = 200;
        stats.forEach(stat => {
            const text = this.game.add.text(this.game.width / 2, yPos, stat, statsStyle);
            text.anchor.setTo(0.5);
            yPos += 45;
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

        // Restart button
        const restartBtn = this.game.add.text(
            this.game.width / 2 - 150,
            this.game.height - 100,
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

        // Menu button
        const menuBtn = this.game.add.text(
            this.game.width / 2 + 150,
            this.game.height - 100,
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

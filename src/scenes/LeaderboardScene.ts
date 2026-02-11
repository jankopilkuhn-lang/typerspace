declare var Phaser: any;

import { highscoreService } from '../services/HighscoreService';
import { Difficulty, HighscoreEntry } from '../types/highscore';

/**
 * Leaderboard Scene - Shows top highscores per difficulty
 */
export class LeaderboardScene extends Phaser.State {
    private game: any;
    private selectedDifficulty: Difficulty = 'medium';
    private difficultyButtons: { [key in Difficulty]?: any } = {};
    private scoreTexts: any[] = [];
    private statsTexts: any[] = [];

    init(data?: any): void {
        // If coming from ResultsScene, select that difficulty
        if (data && data.selectedDifficulty) {
            this.selectedDifficulty = data.selectedDifficulty as Difficulty;
        }
    }

    create(): void {
        // Background
        this.game.stage.backgroundColor = '#0a0e27';

        // Create starfield
        this.createStarfield();

        // Title
        const titleStyle = {
            font: '56px Courier New',
            fill: '#FFD700',
            fontWeight: 'bold'
        };
        const title = this.game.add.text(
            this.game.width / 2,
            60,
            '🏆 RANGLISTE 🏆',
            titleStyle
        );
        title.anchor.setTo(0.5);

        // Difficulty tabs
        this.createDifficultyTabs();

        // Leaderboard content
        this.renderLeaderboard();

        // Personal stats
        this.renderPersonalStats();

        // Back button
        this.createBackButton();
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

    createDifficultyTabs(): void {
        const centerX = this.game.width / 2;
        const tabSpacing = 180;
        const totalTabs = 4;
        const startX = centerX - (tabSpacing * (totalTabs - 1)) / 2;

        console.log('LeaderboardScene: game.width =', this.game.width, 'centerX =', centerX, 'tabs startX =', startX);

        const difficulties: { name: string; value: Difficulty; color: string; x: number }[] = [
            { name: 'Leicht', value: 'easy', color: '#00ff00', x: startX },
            { name: 'Mittel', value: 'medium', color: '#ffff00', x: startX + tabSpacing },
            { name: 'Schwer', value: 'hard', color: '#ff9900', x: startX + tabSpacing * 2 },
            { name: 'Ultra', value: 'ultra', color: '#ff0000', x: startX + tabSpacing * 3 }
        ];

        difficulties.forEach(diff => {
            const isSelected = diff.value === this.selectedDifficulty;

            const buttonStyle = {
                font: isSelected ? '28px Courier New' : '24px Courier New',
                fill: diff.color,
                fontWeight: isSelected ? 'bold' : 'normal'
            };

            const button = this.game.add.text(
                diff.x,
                140,
                diff.name,
                buttonStyle
            );
            button.anchor.setTo(0.5);
            button.inputEnabled = true;
            button.input.useHandCursor = true;

            // Store reference
            this.difficultyButtons[diff.value] = button;

            // Click event
            button.events.onInputDown.add(() => {
                this.selectedDifficulty = diff.value;
                this.refreshLeaderboard();
            }, this);

            // Hover effects
            button.events.onInputOver.add(() => {
                if (diff.value !== this.selectedDifficulty) {
                    button.fontSize = 26;
                }
            }, this);

            button.events.onInputOut.add(() => {
                if (diff.value !== this.selectedDifficulty) {
                    button.fontSize = 24;
                }
            }, this);

            // Underline for selected tab
            if (isSelected) {
                const underline = this.game.add.graphics(0, 0);
                underline.lineStyle(3, parseInt(diff.color.replace('#', '0x')), 1);
                underline.moveTo(button.x - 50, button.y + 20);
                underline.lineTo(button.x + 50, button.y + 20);
            }
        });
    }

    async renderLeaderboard(): Promise<void> {
        // Clear previous score texts
        this.scoreTexts.forEach(text => text.destroy());
        this.scoreTexts = [];

        console.log('LeaderboardScene: Loading scores for difficulty:', this.selectedDifficulty);
        const scores = await highscoreService.getHighscores(this.selectedDifficulty, 10);
        console.log('LeaderboardScene: Loaded scores:', scores.length, scores);

        // Header
        const headerStyle = {
            font: '22px Courier New',
            fill: '#8892b0',
            fontWeight: 'bold'
        };

        // Center the table - use 1000px width centered in 1200px game width
        const centerX = this.game.width / 2;
        const tableWidth = 1000;
        const startX = centerX - tableWidth / 2;

        console.log('LeaderboardScene: table centerX =', centerX, 'tableWidth =', tableWidth, 'startX =', startX);

        const headers = [
            { text: '#', x: startX + 50 },
            { text: 'NAME', x: startX + 200 },
            { text: 'SCORE', x: startX + 380 },
            { text: 'ACC', x: startX + 560 },
            { text: 'WPM', x: startX + 700 },
            { text: 'ZEIT', x: startX + 840 },
            { text: 'PROFI', x: startX + 950 }
        ];

        headers.forEach(header => {
            const text = this.game.add.text(header.x, 200, header.text, headerStyle);
            text.anchor.setTo(0.5);
            this.scoreTexts.push(text);
        });

        // Separator line
        const line = this.game.add.graphics(0, 0);
        line.lineStyle(2, 0x8892b0, 1);
        line.moveTo(startX, 230);
        line.lineTo(startX + tableWidth, 230);
        this.scoreTexts.push(line);

        // Score entries
        const entryStyle = {
            font: '24px Courier New',
            fill: '#ffffff',
            fontWeight: 'normal'
        };

        if (scores.length === 0) {
            const emptyText = this.game.add.text(
                this.game.width / 2,
                350,
                'Noch keine Highscores für diesen Schwierigkeitsgrad.',
                { ...entryStyle, fill: '#8892b0' }
            );
            emptyText.anchor.setTo(0.5);
            this.scoreTexts.push(emptyText);
        } else {
            scores.forEach((entry, index) => {
                const yPos = 260 + (index * 35);

                // Rank
                const rank = this.game.add.text(startX + 50, yPos, `${index + 1}`, entryStyle);
                rank.anchor.setTo(0.5);
                this.scoreTexts.push(rank);

                // Player Name
                const playerName = entry.playerName || 'Spieler';
                const name = this.game.add.text(startX + 200, yPos, playerName, entryStyle);
                name.anchor.setTo(0.5);
                this.scoreTexts.push(name);

                // Score
                const scoreColor = index < 3 ? '#FFD700' : '#ffffff';
                const score = this.game.add.text(
                    startX + 380,
                    yPos,
                    highscoreService.formatScore(entry.score),
                    { ...entryStyle, fill: scoreColor }
                );
                score.anchor.setTo(0.5);
                this.scoreTexts.push(score);

                // Accuracy
                const accuracy = this.game.add.text(startX + 560, yPos, `${entry.accuracy}%`, entryStyle);
                accuracy.anchor.setTo(0.5);
                this.scoreTexts.push(accuracy);

                // WPM
                const wpm = this.game.add.text(startX + 700, yPos, `${entry.wpm}`, entryStyle);
                wpm.anchor.setTo(0.5);
                this.scoreTexts.push(wpm);

                // Time
                const time = this.game.add.text(startX + 840, yPos, `${entry.time.toFixed(1)}s`, entryStyle);
                time.anchor.setTo(0.5);
                this.scoreTexts.push(time);

                // Pro mode indicator
                const proMode = this.game.add.text(
                    startX + 950,
                    yPos,
                    entry.proMode ? '⚡' : '-',
                    entryStyle
                );
                proMode.anchor.setTo(0.5);
                this.scoreTexts.push(proMode);
            });
        }
    }

    async renderPersonalStats(): Promise<void> {
        // Clear previous stats texts
        this.statsTexts.forEach(text => text.destroy());
        this.statsTexts = [];

        const stats = await highscoreService.getStats();

        const statsStyle = {
            font: '22px Courier New',
            fill: '#8892b0',
            fontWeight: 'normal'
        };

        const statsY = 680;
        const spacing = 30;

        // Personal best for this difficulty
        const personalBest = stats.personalBest[this.selectedDifficulty];
        const bestScoreText = personalBest
            ? `Persönliche Bestleistung: ${highscoreService.formatScore(personalBest.score)}`
            : 'Persönliche Bestleistung: -';

        const statsLines = [
            bestScoreText,
            `Gespielte Spiele: ${stats.totalGames}`,
            `Erfolgsrate: ${stats.totalGames > 0 ? Math.round((stats.successfulGames / stats.totalGames) * 100) : 0}%`
        ];

        statsLines.forEach((line, index) => {
            const text = this.game.add.text(
                this.game.width / 2,
                statsY + (index * spacing),
                line,
                statsStyle
            );
            text.anchor.setTo(0.5);
            this.statsTexts.push(text);
        });
    }

    createBackButton(): void {
        const buttonStyle = {
            font: '28px Courier New',
            fill: '#ffffff',
            fontWeight: 'bold'
        };

        const backBtn = this.game.add.text(
            this.game.width / 2,
            this.game.height - 50,
            '← Zurück',
            buttonStyle
        );
        backBtn.anchor.setTo(0.5);
        backBtn.inputEnabled = true;
        backBtn.input.useHandCursor = true;

        backBtn.events.onInputDown.add(() => {
            // Reload page to return to start screen
            location.reload();
        }, this);

        backBtn.events.onInputOver.add(() => {
            backBtn.fill = '#00d4ff';
        }, this);

        backBtn.events.onInputOut.add(() => {
            backBtn.fill = '#ffffff';
        }, this);
    }

    async refreshLeaderboard(): Promise<void> {
        // Update difficulty tab styling
        const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'ultra'];
        difficulties.forEach(diff => {
            const button = this.difficultyButtons[diff];
            if (button) {
                const isSelected = diff === this.selectedDifficulty;
                button.fontSize = isSelected ? 28 : 24;
                button.fontWeight = isSelected ? 'bold' : 'normal';
            }
        });

        // Re-render leaderboard and stats
        await this.renderLeaderboard();
        await this.renderPersonalStats();

        // Re-draw underlines (simple approach: full refresh would be better in production)
        // For now, the tabs are functional without animated underlines
    }
}

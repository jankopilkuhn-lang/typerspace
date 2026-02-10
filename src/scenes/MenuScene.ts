declare var Phaser: any;

import { audioManager } from '../audio/AudioManager';

/**
 * Menu Scene - Difficulty selection
 */
export class MenuScene extends Phaser.State {
    private game: any;

    create(): void {
        // Start menu music
        audioManager.startMenuMusic();

        // Background
        this.game.stage.backgroundColor = '#0a0e27';

        // Create starfield
        this.createStarfield();

        // Title
        const titleStyle = {
            font: '64px Courier New',
            fill: '#00d4ff',
            fontWeight: 'bold'
        };
        const title = this.game.add.text(
            this.game.width / 2,
            100,
            'TyperSpace',
            titleStyle
        );
        title.anchor.setTo(0.5);

        // Subtitle
        const subtitleStyle = {
            font: '24px Courier New',
            fill: '#8892b0',
            fontWeight: 'normal'
        };
        const subtitle = this.game.add.text(
            this.game.width / 2,
            170,
            'Wähle deinen Schwierigkeitsgrad',
            subtitleStyle
        );
        subtitle.anchor.setTo(0.5);

        // Difficulty buttons
        this.createDifficultyButtons();

        // Audio controls
        this.createAudioControls();

        // Instructions
        const instructionsStyle = {
            font: '18px Courier New',
            fill: '#8892b0',
            align: 'center'
        };
        const instructions = this.game.add.text(
            this.game.width / 2,
            this.game.height - 80,
            'Tippe die Wörter auf den Gegnern, bevor sie dich erreichen!\n' +
            '50 Gegner pro Level - Viel Erfolg!',
            instructionsStyle
        );
        instructions.anchor.setTo(0.5);
    }

    createAudioControls(): void {
        const status = audioManager.getStatus();
        const buttonStyle = {
            font: '24px Courier New',
            fill: '#ffffff',
            fontWeight: 'bold'
        };

        // Music toggle button
        const musicBtn = this.game.add.text(
            this.game.width - 120,
            20,
            status.musicEnabled ? '🎵 Musik' : '🔇 Musik',
            buttonStyle
        );
        musicBtn.inputEnabled = true;
        musicBtn.input.useHandCursor = true;
        musicBtn.events.onInputDown.add(() => {
            const enabled = audioManager.toggleMusic();
            musicBtn.text = enabled ? '🎵 Musik' : '🔇 Musik';
            if (enabled) {
                audioManager.startMenuMusic();
            }
        }, this);

        // SFX toggle button
        const sfxBtn = this.game.add.text(
            this.game.width - 120,
            60,
            status.sfxEnabled ? '🔊 SFX' : '🔇 SFX',
            buttonStyle
        );
        sfxBtn.inputEnabled = true;
        sfxBtn.input.useHandCursor = true;
        sfxBtn.events.onInputDown.add(() => {
            const enabled = audioManager.toggleSFX();
            sfxBtn.text = enabled ? '🔊 SFX' : '🔇 SFX';
        }, this);
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

    createDifficultyButtons(): void {
        const difficulties = [
            { name: 'Leicht', value: 'easy', color: '#00ff00', y: 250 },
            { name: 'Mittel', value: 'medium', color: '#ffff00', y: 330 },
            { name: 'Schwer', value: 'hard', color: '#ff9900', y: 410 },
            { name: 'Ultraschwer', value: 'ultra', color: '#ff0000', y: 490 }
        ];

        difficulties.forEach(diff => {
            this.createButton(diff.name, diff.value, diff.color, diff.y);
        });
    }

    createButton(name: string, value: string, color: string, y: number): void {
        const buttonStyle = {
            font: '32px Courier New',
            fill: color,
            fontWeight: 'bold'
        };

        const button = this.game.add.text(
            this.game.width / 2,
            y,
            name,
            buttonStyle
        );
        button.anchor.setTo(0.5);
        button.inputEnabled = true;
        button.input.useHandCursor = true;

        // Add border rectangle
        const graphics = this.game.add.graphics(0, 0);
        graphics.lineStyle(2, parseInt(color.replace('#', '0x')), 1);
        graphics.drawRoundedRect(
            button.x - button.width / 2 - 20,
            button.y - button.height / 2 - 10,
            button.width + 40,
            button.height + 20,
            10
        );

        // Hover effects
        button.events.onInputOver.add(() => {
            button.fontSize = 36;
            graphics.clear();
            graphics.lineStyle(3, parseInt(color.replace('#', '0x')), 1);
            graphics.beginFill(parseInt(color.replace('#', '0x')), 0.2);
            graphics.drawRoundedRect(
                button.x - button.width / 2 - 20,
                button.y - button.height / 2 - 10,
                button.width + 40,
                button.height + 20,
                10
            );
            graphics.endFill();
        }, this);

        button.events.onInputOut.add(() => {
            button.fontSize = 32;
            graphics.clear();
            graphics.lineStyle(2, parseInt(color.replace('#', '0x')), 1);
            graphics.drawRoundedRect(
                button.x - button.width / 2 - 20,
                button.y - button.height / 2 - 10,
                button.width + 40,
                button.height + 20,
                10
            );
        }, this);

        // Click event
        button.events.onInputDown.add(() => {
            this.game.state.start('Level1Scene', true, false, value);
        }, this);
    }
}

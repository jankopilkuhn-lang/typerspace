// Phaser is loaded via CDN in index.html
declare var Phaser: any;

import { MenuScene } from './scenes/MenuScene';
import { Level1Scene } from './scenes/Level1Scene';
import { ResultsScene } from './scenes/ResultsScene';

console.log('TyperSpace module loaded!');
console.log('Phaser available:', typeof Phaser !== 'undefined');

let gameStarted = false;
let selectedDifficulty: string | null = null;
let isRetroMode = false;

function startGame(difficulty: string): void {
    console.log('startGame function called with difficulty:', difficulty);
    if (gameStarted) {
        console.log('Game already started, returning');
        return;
    }
    gameStarted = true;
    selectedDifficulty = difficulty;

    // Check retro mode checkbox
    const retroCheckbox = document.getElementById('retro-mode-checkbox') as HTMLInputElement;
    if (retroCheckbox) {
        isRetroMode = retroCheckbox.checked;
        console.log('Retro mode enabled:', isRetroMode);
    }

    // Hide start screen
    const startScreen = document.getElementById('start-screen');
    const gameContainer = document.getElementById('game-container');

    console.log('Start screen element:', startScreen);
    console.log('Game container element:', gameContainer);

    if (startScreen) {
        startScreen.style.display = 'none';
        console.log('Start screen hidden');
    }
    if (gameContainer) {
        gameContainer.classList.add('active');
        gameContainer.style.display = 'block';
        console.log('Game container activated');
    }

    // Initialize Phaser game
    console.log('Initializing Phaser game...');
    const config: any = {
        width: 1200,
        height: 800,
        renderer: Phaser.AUTO,
        parent: 'game-container',
        transparent: false,
        antialias: true
    };

    const game = new Phaser.Game(config);
    console.log('Phaser game created');

    // Add all scenes
    game.state.add('MenuScene', MenuScene);
    game.state.add('Level1Scene', Level1Scene);
    game.state.add('ResultsScene', ResultsScene);
    console.log('Scenes added');

    // Start game based on mode
    if (isRetroMode) {
        // Start 2D Phaser game (Retro mode)
        if (selectedDifficulty) {
            console.log('Starting 2D Retro Mode - Level1Scene with difficulty:', selectedDifficulty);
            game.state.start('Level1Scene', true, false, selectedDifficulty);
        } else {
            console.log('Starting 2D Retro Mode - MenuScene');
            game.state.start('MenuScene');
        }
    } else {
        // 3D mode - redirect to 3D game
        console.log('Starting 3D Mode with difficulty:', selectedDifficulty);
        start3DGame(selectedDifficulty);
        return;
    }
    console.log('Game started');
}

// Attach to window for debugging
(window as any).startGame = startGame;

// Setup when DOM is ready
const setupButtons = (): void => {
    console.log('setupButtons called');
    const buttons = document.querySelectorAll('.difficulty-btn');
    console.log('Difficulty buttons found:', buttons.length);

    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            const difficulty = (event.target as HTMLElement).getAttribute('data-difficulty');
            console.log('Difficulty button clicked:', difficulty);
            if (difficulty) {
                startGame(difficulty);
            }
        });
    });

    if (buttons.length === 0) {
        console.error('No difficulty buttons found!');
    } else {
        console.log('Click listeners attached to all difficulty buttons');
    }
};

// Wait for everything to load
if (document.readyState === 'loading') {
    console.log('Waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', setupButtons);
} else {
    console.log('DOM already loaded, setting up buttons immediately');
    setupButtons();
}

export default null;

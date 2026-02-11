// Phaser is loaded via CDN in index.html
declare var Phaser: any;

import { MenuScene } from './scenes/MenuScene';
import { Level1Scene } from './scenes/Level1Scene';
import { ResultsScene } from './scenes/ResultsScene';
import { LeaderboardScene } from './scenes/LeaderboardScene';
import { TyperSpaceGame3D } from './game3d/TyperSpaceGame3D';
import { testUpstashConnection } from './utils/testUpstash';

console.log('TyperSpace module loaded!');
console.log('Phaser available:', typeof Phaser !== 'undefined');

// Make test function available globally
(window as any).testUpstash = testUpstashConnection;

let gameStarted = false;
let selectedSpeed: string | null = null; // Now represents speed, not difficulty
let isRetroMode = false;
let isProMode = false;

function startGame(speed: string): void {
    console.log('startGame function called with speed:', speed);
    if (gameStarted) {
        console.log('Game already started, returning');
        return;
    }
    gameStarted = true;
    selectedSpeed = speed;

    // Check retro mode checkbox
    const retroCheckbox = document.getElementById('retro-mode-checkbox') as HTMLInputElement;
    if (retroCheckbox) {
        isRetroMode = retroCheckbox.checked;
        console.log('Retro mode enabled:', isRetroMode);
    }

    // Check pro mode checkbox
    const proCheckbox = document.getElementById('pro-mode-checkbox') as HTMLInputElement;
    if (proCheckbox) {
        isProMode = proCheckbox.checked;
        console.log('Pro mode enabled:', isProMode);
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
    game.state.add('LeaderboardScene', LeaderboardScene);
    console.log('Scenes added');

    // Start game based on mode
    if (isRetroMode) {
        // Start 2D Phaser game (Retro mode)
        if (selectedSpeed) {
            console.log('Starting 2D Retro Mode - Level1Scene with speed:', selectedSpeed);
            game.state.start('Level1Scene', true, false, selectedSpeed, isProMode);
        } else {
            console.log('Starting 2D Retro Mode - MenuScene');
            game.state.start('MenuScene');
        }
    } else {
        // 3D mode - redirect to 3D game
        console.log('Starting 3D Mode with speed:', selectedSpeed);
        start3DGame(selectedSpeed);
        return;
    }
    console.log('Game started');
}

function start3DGame(speed: string): void {
    console.log('Starting 3D game with speed:', speed);

    // Hide start screen
    const startScreen = document.getElementById('start-screen');
    const gameContainer = document.getElementById('game-container');

    if (startScreen) {
        startScreen.style.display = 'none';
    }
    if (gameContainer) {
        gameContainer.classList.add('active');
        gameContainer.style.display = 'block';
        // Clear any existing content
        gameContainer.innerHTML = '';
    }

    // Create and start 3D game
    new TyperSpaceGame3D(gameContainer!, speed, isProMode);
}

// Attach to window for debugging
(window as any).startGame = startGame;
(window as any).start3DGame = start3DGame;

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

    // Setup highscores button
    const highscoresBtn = document.getElementById('view-highscores-btn');
    if (highscoresBtn) {
        highscoresBtn.addEventListener('click', () => {
            console.log('Highscores button clicked');
            // Set flag to navigate to leaderboard
            localStorage.setItem('typerspace_navigate_to_leaderboard', 'true');
            // Reload page to trigger navigation
            location.reload();
        });
        console.log('Highscores button listener attached');
    }
};

// Check if we should auto-navigate to leaderboard (from 3D mode)
const checkLeaderboardNavigation = (): void => {
    const shouldNavigate = localStorage.getItem('typerspace_navigate_to_leaderboard');
    if (shouldNavigate === 'true') {
        // Clear flag
        localStorage.removeItem('typerspace_navigate_to_leaderboard');

        // Auto-start game in retro mode and go to leaderboard
        console.log('Auto-navigating to leaderboard from 3D mode');

        // Hide start screen
        const startScreen = document.getElementById('start-screen');
        const gameContainer = document.getElementById('game-container');

        if (startScreen) {
            startScreen.style.display = 'none';
        }
        if (gameContainer) {
            gameContainer.classList.add('active');
            gameContainer.style.display = 'block';
        }

        // Initialize Phaser
        const config: any = {
            width: 1200,
            height: 800,
            renderer: Phaser.AUTO,
            parent: 'game-container',
            transparent: false,
            antialias: true
        };

        const game = new Phaser.Game(config);

        // Add all scenes
        game.state.add('MenuScene', MenuScene);
        game.state.add('Level1Scene', Level1Scene);
        game.state.add('ResultsScene', ResultsScene);
        game.state.add('LeaderboardScene', LeaderboardScene);

        // Start directly at leaderboard
        game.state.start('LeaderboardScene');
    }
};

// Wait for everything to load
if (document.readyState === 'loading') {
    console.log('Waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        checkLeaderboardNavigation();
        setupButtons();
    });
} else {
    console.log('DOM already loaded, setting up buttons immediately');
    checkLeaderboardNavigation();
    setupButtons();
}

export default null;

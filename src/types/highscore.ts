/**
 * TyperSpace Highscore System - Type Definitions
 */

export type Difficulty = 'easy' | 'medium' | 'hard' | 'ultra';
export type GameMode = '2D' | '3D';

/**
 * Represents a single highscore entry
 */
export interface HighscoreEntry {
    id: string;                    // Unique identifier (timestamp-based)
    playerName?: string;           // Player name (optional for backwards compatibility)
    score: number;                 // Final calculated score
    accuracy: number;              // Accuracy percentage (0-100)
    wpm: number;                   // Words per minute
    time: number;                  // Time in seconds
    difficulty: Difficulty;
    proMode: boolean;              // Pro mode enabled
    mode: GameMode;                // Game mode (2D or 3D)
    success: boolean;              // Level completed successfully
    timestamp: number;             // Unix timestamp
    enemiesDefeated: number;       // Number of enemies defeated
    totalEnemies: number;          // Total enemies in level
}

/**
 * Personal statistics across all games
 */
export interface HighscoreStats {
    totalGames: number;
    successfulGames: number;
    averageAccuracy: number;
    averageWpm: number;
    personalBest: { [key in Difficulty]: HighscoreEntry | null };  // Best score per difficulty
}

/**
 * Data structure for localStorage
 */
export interface HighscoreData {
    version: string;
    lastUpdated: number;
    entries: {
        easy: HighscoreEntry[];
        medium: HighscoreEntry[];
        hard: HighscoreEntry[];
        ultra: HighscoreEntry[];
    };
}

/**
 * Stats passed from game scenes to calculate score
 */
export interface GameStats {
    correctKeystrokes: number;
    totalKeystrokes: number;
    enemiesDefeated: number;
    totalEnemies: number;
    time: number;
    difficulty: Difficulty;
    proMode: boolean;
    mode: GameMode;
    success: boolean;
}

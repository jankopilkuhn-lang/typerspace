/**
 * German word lists for different difficulty levels
 * Words are now loaded from level-words.json for easier maintenance
 */

import levelWordsData from './level-words.json';

interface LevelConfig {
    name: string;
    description: string;
    words: string[];
}

interface LevelWordsData {
    levels: {
        [key: string]: LevelConfig;
    };
}

// Type-safe access to the JSON data
const levelWords = levelWordsData as LevelWordsData;

// Export individual word lists for backwards compatibility
export const EASY_WORDS = levelWords.levels.easy.words;
export const MEDIUM_WORDS = levelWords.levels.medium.words;
export const HARD_WORDS = levelWords.levels.hard.words;
export const ULTRA_HARD_WORDS = levelWords.levels.ultra.words;
export const EXTREME_WORDS = levelWords.levels.extreme.words;

/**
 * Get words by difficulty level
 * @param difficulty - The difficulty level (easy, medium, hard, ultra)
 * @returns Array of words for the specified difficulty
 */
export function getWordsByDifficulty(difficulty: string): string[] {
    const level = levelWords.levels[difficulty];
    return level ? level.words : EASY_WORDS;
}

/**
 * Get all available difficulty levels
 * @returns Array of difficulty level keys
 */
export function getAvailableLevels(): string[] {
    return Object.keys(levelWords.levels);
}

/**
 * Get level configuration including name and description
 * @param difficulty - The difficulty level
 * @returns Level configuration object
 */
export function getLevelConfig(difficulty: string): LevelConfig | null {
    return levelWords.levels[difficulty] || null;
}

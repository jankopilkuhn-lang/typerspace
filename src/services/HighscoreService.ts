/**
 * TyperSpace Highscore System - Core Service
 * Singleton service for managing highscores with Upstash Redis or localStorage persistence
 */

import {
    HighscoreEntry,
    HighscoreStats,
    HighscoreData,
    GameStats,
    Difficulty
} from '../types/highscore';
import { upstashClient } from './UpstashClient';

export class HighscoreService {
    private static instance: HighscoreService;
    private readonly STORAGE_KEY = 'typerspace_highscores';
    private readonly VERSION = '1.0';
    private readonly MAX_ENTRIES_PER_DIFFICULTY = 50;
    private readonly useUpstash: boolean;

    // Cache for current session
    private cache: HighscoreData | null = null;
    private lastSavedScoreId: string | null = null;
    private initialized: boolean = false;

    private constructor() {
        this.useUpstash = upstashClient.isConfigured();
        console.log(`HighscoreService initialized with ${this.useUpstash ? 'Upstash' : 'localStorage'}`);
        this.initializeCache();
    }

    /**
     * Initialize cache (async)
     */
    private async initializeCache(): Promise<void> {
        if (this.useUpstash) {
            try {
                this.cache = await this.loadFromUpstash();
            } catch (error) {
                console.error('Failed to load from Upstash, falling back to localStorage:', error);
                this.cache = this.loadFromLocalStorage();
            }
        } else {
            this.cache = this.loadFromLocalStorage();
        }
        this.initialized = true;
    }

    /**
     * Wait for initialization
     */
    private async waitForInit(): Promise<void> {
        if (this.initialized) return;

        // Poll until initialized (with timeout)
        const startTime = Date.now();
        while (!this.initialized && Date.now() - startTime < 5000) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): HighscoreService {
        if (!HighscoreService.instance) {
            HighscoreService.instance = new HighscoreService();
        }
        return HighscoreService.instance;
    }

    /**
     * Calculate final score from game statistics
     */
    public calculateScore(stats: GameStats): number {
        // Base score: keystrokes + enemies
        const baseScore = (stats.correctKeystrokes * 10) + (stats.enemiesDefeated * 100);

        // Difficulty multiplier
        const difficultyMultipliers: { [key in Difficulty]: number } = {
            easy: 1.0,
            medium: 1.5,
            hard: 2.0,
            ultra: 3.0
        };
        const difficultyMultiplier = difficultyMultipliers[stats.difficulty] || 1.0;

        // Pro mode bonus
        const proModeBonus = stats.proMode ? 1.5 : 1.0;

        // Calculate accuracy
        const accuracy = stats.totalKeystrokes > 0
            ? (stats.correctKeystrokes / stats.totalKeystrokes) * 100
            : 0;

        // Accuracy factor
        let accuracyFactor = 0.8;
        if (accuracy >= 95) accuracyFactor = 1.5;
        else if (accuracy >= 85) accuracyFactor = 1.25;
        else if (accuracy >= 75) accuracyFactor = 1.1;
        else if (accuracy >= 60) accuracyFactor = 1.0;

        // Calculate WPM
        const timeInMinutes = stats.time > 0 ? stats.time / 60 : 1;
        const wpm = (stats.correctKeystrokes / 5) / timeInMinutes;

        // Speed bonus based on WPM
        let speedBonus = 0.9;
        if (wpm >= 60) speedBonus = 1.4;
        else if (wpm >= 45) speedBonus = 1.25;
        else if (wpm >= 30) speedBonus = 1.1;
        else if (wpm >= 20) speedBonus = 1.0;

        // Time penalty for very slow completion
        let timePenalty = 1.0;
        if (stats.time > 600) timePenalty = 0.8;
        else if (stats.time > 300) timePenalty = 0.9;

        // Success multiplier
        const successMultiplier = stats.success ? 1.0 : 0.7;

        // Calculate final score
        const finalScore = Math.round(
            baseScore *
            difficultyMultiplier *
            proModeBonus *
            accuracyFactor *
            speedBonus *
            timePenalty *
            successMultiplier
        );

        return Math.max(0, finalScore);
    }

    /**
     * Create a highscore entry from game stats
     */
    public createEntry(stats: GameStats): HighscoreEntry {
        const score = this.calculateScore(stats);
        const accuracy = stats.totalKeystrokes > 0
            ? Math.round((stats.correctKeystrokes / stats.totalKeystrokes) * 100)
            : 0;
        const wpm = Math.round((stats.correctKeystrokes / 5) / (stats.time / 60));

        const entry: HighscoreEntry = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            score,
            accuracy,
            wpm,
            time: stats.time,
            difficulty: stats.difficulty,
            proMode: stats.proMode,
            mode: stats.mode,
            success: stats.success,
            timestamp: Date.now(),
            enemiesDefeated: stats.enemiesDefeated,
            totalEnemies: stats.totalEnemies
        };

        return entry;
    }

    /**
     * Save a highscore entry
     */
    public saveScore(entry: HighscoreEntry): void {
        // Save asynchronously in background
        this.saveScoreAsync(entry).catch(error => {
            console.error('Failed to save highscore:', error);
        });
    }

    /**
     * Save a highscore entry (async)
     */
    private async saveScoreAsync(entry: HighscoreEntry): Promise<void> {
        await this.waitForInit();

        const data = this.cache || this.createEmptyData();

        // Add entry to appropriate difficulty array
        data.entries[entry.difficulty].push(entry);

        // Sort by score (descending)
        data.entries[entry.difficulty].sort((a, b) => b.score - a.score);

        // Keep only top MAX_ENTRIES_PER_DIFFICULTY
        data.entries[entry.difficulty] = data.entries[entry.difficulty].slice(
            0,
            this.MAX_ENTRIES_PER_DIFFICULTY
        );

        // Update metadata
        data.lastUpdated = Date.now();

        // Save to storage
        if (this.useUpstash) {
            await this.saveToUpstash(data);
        } else {
            this.saveToLocalStorage(data);
        }

        this.cache = data;
        this.lastSavedScoreId = entry.id;

        console.log(`Highscore saved: ${entry.score} (${entry.difficulty})`);
    }

    /**
     * Get top N highscores for a difficulty
     */
    public getHighscores(difficulty: Difficulty, limit: number = 10): HighscoreEntry[] {
        const data = this.cache || this.createEmptyData();
        const entries = data.entries[difficulty] || [];
        return entries.slice(0, limit);
    }

    /**
     * Check if a score qualifies as a new highscore (top 10)
     */
    public isNewHighscore(score: number, difficulty: Difficulty): boolean {
        const topScores = this.getHighscores(difficulty, 10);

        // If less than 10 entries, it's automatically a highscore
        if (topScores.length < 10) {
            return true;
        }

        // Check if score is higher than the 10th entry
        return score > topScores[9].score;
    }

    /**
     * Get the rank of a specific score (without saving)
     */
    public getScoreRank(score: number, difficulty: Difficulty): number {
        const topScores = this.getHighscores(difficulty, this.MAX_ENTRIES_PER_DIFFICULTY);

        // Find position where this score would be inserted
        let rank = 1;
        for (const entry of topScores) {
            if (score > entry.score) {
                break;
            }
            rank++;
        }

        return rank;
    }

    /**
     * Get the rank of a specific entry (without saving)
     * This checks the rank based on score only
     */
    public getEntryRank(entry: HighscoreEntry): number {
        return this.getScoreRank(entry.score, entry.difficulty);
    }

    /**
     * Get the rank of the last saved score (from current session)
     */
    public getLastSavedScoreRank(difficulty: Difficulty): number | null {
        if (!this.lastSavedScoreId) {
            return null;
        }

        const topScores = this.getHighscores(difficulty, this.MAX_ENTRIES_PER_DIFFICULTY);
        const index = topScores.findIndex(entry => entry.id === this.lastSavedScoreId);

        return index >= 0 ? index + 1 : null;
    }

    /**
     * Get personal statistics across all games
     */
    public getStats(): HighscoreStats {
        const data = this.cache || this.createEmptyData();

        // Collect all entries from all difficulties
        const allEntries: HighscoreEntry[] = [
            ...data.entries.easy,
            ...data.entries.medium,
            ...data.entries.hard,
            ...data.entries.ultra
        ];

        const totalGames = allEntries.length;
        const successfulGames = allEntries.filter(e => e.success).length;

        const averageAccuracy = totalGames > 0
            ? allEntries.reduce((sum, e) => sum + e.accuracy, 0) / totalGames
            : 0;

        const averageWpm = totalGames > 0
            ? allEntries.reduce((sum, e) => sum + e.wpm, 0) / totalGames
            : 0;

        // Get personal best for each difficulty
        const personalBest: { [key in Difficulty]: HighscoreEntry | null } = {
            easy: data.entries.easy[0] || null,
            medium: data.entries.medium[0] || null,
            hard: data.entries.hard[0] || null,
            ultra: data.entries.ultra[0] || null
        };

        return {
            totalGames,
            successfulGames,
            averageAccuracy: Math.round(averageAccuracy),
            averageWpm: Math.round(averageWpm),
            personalBest
        };
    }

    /**
     * Clear all highscores for a specific difficulty (or all if not specified)
     */
    public clearHighscores(difficulty?: Difficulty): void {
        const data = this.cache || this.createEmptyData();

        if (difficulty) {
            // Clear specific difficulty
            data.entries[difficulty] = [];
        } else {
            // Clear all
            data.entries.easy = [];
            data.entries.medium = [];
            data.entries.hard = [];
            data.entries.ultra = [];
        }

        data.lastUpdated = Date.now();

        // Save asynchronously
        if (this.useUpstash) {
            this.saveToUpstash(data).catch(error => {
                console.error('Failed to clear highscores in Upstash:', error);
            });
        } else {
            this.saveToLocalStorage(data);
        }

        this.cache = data;

        console.log(`Highscores cleared: ${difficulty || 'all'}`);
    }

    /**
     * Export highscores as JSON string
     */
    public exportHighscores(): string {
        const data = this.cache || this.createEmptyData();
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import highscores from JSON string
     */
    public importHighscores(json: string): boolean {
        try {
            const data = JSON.parse(json) as HighscoreData;

            // Validate structure
            if (!data.version || !data.entries) {
                console.error('Invalid highscore data structure');
                return false;
            }

            // Validate all difficulty arrays exist
            if (!data.entries.easy || !data.entries.medium ||
                !data.entries.hard || !data.entries.ultra) {
                console.error('Missing difficulty arrays');
                return false;
            }

            // Save imported data
            if (this.useUpstash) {
                this.saveToUpstash(data).catch(error => {
                    console.error('Failed to import to Upstash:', error);
                });
            } else {
                this.saveToLocalStorage(data);
            }
            this.cache = data;

            console.log('Highscores imported successfully');
            return true;
        } catch (error) {
            console.error('Failed to import highscores:', error);
            return false;
        }
    }

    /**
     * Format score with thousands separator
     */
    public formatScore(score: number): string {
        return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    /**
     * Get difficulty emoji
     */
    public getDifficultyEmoji(difficulty: Difficulty): string {
        const emojis: { [key in Difficulty]: string } = {
            easy: '🟢',
            medium: '⚡',
            hard: '💪',
            ultra: '🔥'
        };
        return emojis[difficulty];
    }

    /**
     * Load data from Upstash
     */
    private async loadFromUpstash(): Promise<HighscoreData> {
        try {
            const json = await upstashClient.get(this.STORAGE_KEY);

            if (!json) {
                console.log('No data found in Upstash, creating empty data');
                return this.createEmptyData();
            }

            const data = JSON.parse(json) as HighscoreData;

            // Version check (for future migrations)
            if (data.version !== this.VERSION) {
                console.warn('Highscore version mismatch, creating new data');
                return this.createEmptyData();
            }

            return data;
        } catch (error) {
            console.error('Failed to load from Upstash:', error);
            return this.createEmptyData();
        }
    }

    /**
     * Save data to Upstash
     */
    private async saveToUpstash(data: HighscoreData): Promise<void> {
        try {
            const json = JSON.stringify(data);
            await upstashClient.set(this.STORAGE_KEY, json);
            console.log('Saved to Upstash successfully');
        } catch (error) {
            console.error('Failed to save to Upstash:', error);
            throw error;
        }
    }

    /**
     * Load data from localStorage
     */
    private loadFromLocalStorage(): HighscoreData {
        try {
            const json = localStorage.getItem(this.STORAGE_KEY);

            if (!json) {
                return this.createEmptyData();
            }

            const data = JSON.parse(json) as HighscoreData;

            // Version check (for future migrations)
            if (data.version !== this.VERSION) {
                console.warn('Highscore version mismatch, creating new data');
                return this.createEmptyData();
            }

            return data;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return this.createEmptyData();
        }
    }

    /**
     * Save data to localStorage
     */
    private saveToLocalStorage(data: HighscoreData): void {
        try {
            const json = JSON.stringify(data);
            localStorage.setItem(this.STORAGE_KEY, json);
        } catch (error) {
            console.error('Failed to save to localStorage:', error);

            // Handle quota exceeded error
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                console.warn('Storage quota exceeded, reducing entries...');

                // Reduce entries to 25 per difficulty and try again
                Object.keys(data.entries).forEach(key => {
                    const difficulty = key as Difficulty;
                    data.entries[difficulty] = data.entries[difficulty].slice(0, 25);
                });

                try {
                    const json = JSON.stringify(data);
                    localStorage.setItem(this.STORAGE_KEY, json);
                } catch (retryError) {
                    console.error('Failed to save even with reduced entries:', retryError);
                }
            }
        }
    }

    /**
     * Create empty data structure
     */
    private createEmptyData(): HighscoreData {
        return {
            version: this.VERSION,
            lastUpdated: Date.now(),
            entries: {
                easy: [],
                medium: [],
                hard: [],
                ultra: []
            }
        };
    }
}

// Export singleton instance
export const highscoreService = HighscoreService.getInstance();

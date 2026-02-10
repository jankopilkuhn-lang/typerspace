/**
 * Game Configuration
 * Zentrale Konfigurationsdatei für TyperSpace
 */

export interface WaveConfig {
    wordsPerWave: number;        // Anzahl Wörter pro Welle
    wordDifficulty: string;      // Schwierigkeit der Wörter (easy, medium, hard, ultra)
    waveName: string;            // Name der Welle
}

export interface SpeedConfig {
    spawnInterval2D: number;     // Spawn-Intervall in ms für 2D-Modus
    spawnInterval3D: number;     // Spawn-Intervall in Sekunden für 3D-Modus
    enemySpeed2D: number;        // Geschwindigkeit der Enemies im 2D-Modus
    asteroidSpeed3D: number;     // Geschwindigkeit der Asteroiden im 3D-Modus
}

export const GAME_CONFIG = {
    // Wellen-Konfiguration
    waves: [
        {
            wordsPerWave: 15,
            wordDifficulty: 'easy',
            waveName: 'Welle 1: Leicht'
        },
        {
            wordsPerWave: 20,
            wordDifficulty: 'medium',
            waveName: 'Welle 2: Mittel'
        },
        {
            wordsPerWave: 25,
            wordDifficulty: 'hard',
            waveName: 'Welle 3: Schwer'
        },
        {
            wordsPerWave: 30,
            wordDifficulty: 'ultra',
            waveName: 'Welle 4: Ultra'
        }
    ] as WaveConfig[],

    // Geschwindigkeits-Konfiguration basierend auf Schwierigkeitsgrad
    speeds: {
        easy: {
            spawnInterval2D: 3000,
            spawnInterval3D: 3.0,
            enemySpeed2D: 0.6,
            asteroidSpeed3D: 2.0
        },
        medium: {
            spawnInterval2D: 2000,
            spawnInterval3D: 2.0,
            enemySpeed2D: 1.0,
            asteroidSpeed3D: 3.0
        },
        hard: {
            spawnInterval2D: 1500,
            spawnInterval3D: 1.5,
            enemySpeed2D: 1.5,
            asteroidSpeed3D: 3.5
        },
        ultra: {
            spawnInterval2D: 1000,
            spawnInterval3D: 1.0,
            enemySpeed2D: 2.0,
            asteroidSpeed3D: 4.0
        }
    } as Record<string, SpeedConfig>,

    // Allgemeine Einstellungen
    startingHealth: 3,
    bossHealth: 3,

    // Wellen-Anzeige
    showWaveTransition: true,
    waveTransitionDuration: 2000  // ms
};

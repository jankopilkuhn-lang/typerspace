declare var Phaser: any;

/**
 * Enemy entity with a word that needs to be typed
 */
export class Enemy {
    public sprite: any;
    public word: string;
    public typedChars: number = 0;
    public speed: number;
    private wordText: any;
    private game: any;
    private size: number;
    private rotationSpeed: number;
    private isProMode: boolean;

    constructor(game: any, x: number, y: number, word: string, speed: number, isProMode: boolean = false) {
        this.game = game;
        this.word = word;
        this.speed = speed;
        this.isProMode = isProMode;

        // Random size variation: small (0.6-0.8), medium (0.8-1.2), large (1.2-1.6)
        const sizeCategories = [
            { min: 0.6, max: 0.8 },   // Small
            { min: 0.8, max: 1.2 },   // Medium
            { min: 1.2, max: 1.6 }    // Large
        ];
        const category = sizeCategories[Math.floor(Math.random() * sizeCategories.length)];
        this.size = category.min + Math.random() * (category.max - category.min);

        // Random rotation speed for 3D tumbling effect (slower for larger asteroids)
        this.rotationSpeed = (0.001 + Math.random() * 0.002) / this.size;

        // Create asteroid-like sprite
        const graphics = game.add.graphics(0, 0);

        // Create irregular asteroid shape with random variations
        const points: number[] = [];
        const numPoints = 12; // Number of points for the asteroid
        const baseRadius = 35 * this.size;
        const radiusVariation = 15 * this.size;

        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const radius = baseRadius + (Math.random() - 0.5) * radiusVariation;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            points.push(x, y);
        }

        // Draw main asteroid body with darker base color for more contrast
        graphics.beginFill(0x5a4a3a);
        graphics.drawPolygon(points);
        graphics.endFill();

        // Enhanced 3D effect with multiple lighting layers - STRONGER CONTRAST

        // Layer 0: Ambient occlusion at edges (very dark rim for depth)
        const aoPoints: number[] = [];
        for (let i = Math.floor(numPoints * 0.5); i < Math.floor(numPoints * 0.95); i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const radius = (baseRadius + (Math.random() - 0.5) * radiusVariation) * 0.85;
            aoPoints.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        if (aoPoints.length >= 6) {
            graphics.beginFill(0x1a0a00, 0.75);
            graphics.drawPolygon(aoPoints);
            graphics.endFill();
        }

        // Layer 1: Strong shadow on bottom-right (darkest core shadow)
        const darkShadowPoints: number[] = [];
        for (let i = Math.floor(numPoints * 0.45); i < Math.floor(numPoints * 0.85); i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const radius = (baseRadius + (Math.random() - 0.5) * radiusVariation) * 0.65;
            darkShadowPoints.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        if (darkShadowPoints.length >= 6) {
            graphics.beginFill(0x2a1a0a, 0.8);
            graphics.drawPolygon(darkShadowPoints);
            graphics.endFill();
        }

        // Layer 2: Medium shadow for smooth transition
        const mediumShadowPoints: number[] = [];
        for (let i = Math.floor(numPoints * 0.4); i < Math.floor(numPoints * 0.75); i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const radius = (baseRadius + (Math.random() - 0.5) * radiusVariation) * 0.5;
            mediumShadowPoints.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        if (mediumShadowPoints.length >= 6) {
            graphics.beginFill(0x4a3a2a, 0.6);
            graphics.drawPolygon(mediumShadowPoints);
            graphics.endFill();
        }

        // Layer 3: Mid-tone transition area
        const midtonePoints: number[] = [];
        for (let i = Math.floor(numPoints * 0.15); i < Math.floor(numPoints * 0.5); i++) {
            const angle = (i / numPoints) * Math.PI * 2 - Math.PI / 6;
            const radius = (baseRadius + (Math.random() - 0.5) * radiusVariation) * 0.6;
            midtonePoints.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        if (midtonePoints.length >= 6) {
            graphics.beginFill(0x7a6a5a, 0.6);
            graphics.drawPolygon(midtonePoints);
            graphics.endFill();
        }

        // Layer 4: Bright highlight on top-left (strong reflected light)
        const brightHighlightPoints: number[] = [];
        for (let i = 0; i < Math.floor(numPoints * 0.35); i++) {
            const angle = (i / numPoints) * Math.PI * 2 - Math.PI / 3;
            const radius = (baseRadius + (Math.random() - 0.5) * radiusVariation) * 0.6;
            brightHighlightPoints.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        if (brightHighlightPoints.length >= 6) {
            graphics.beginFill(0xbaa090, 0.7);
            graphics.drawPolygon(brightHighlightPoints);
            graphics.endFill();
        }

        // Layer 5: Intense specular highlight (direct sun reflection)
        const specularPoints: number[] = [];
        for (let i = 0; i < Math.floor(numPoints * 0.2); i++) {
            const angle = (i / numPoints) * Math.PI * 2 - Math.PI / 4;
            const radius = (baseRadius + (Math.random() - 0.5) * radiusVariation) * 0.35;
            specularPoints.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        if (specularPoints.length >= 6) {
            graphics.beginFill(0xddc0a0, 0.65);
            graphics.drawPolygon(specularPoints);
            graphics.endFill();
        }

        // Layer 6: Super bright specular spot (peak highlight)
        const peakHighlight: number[] = [];
        for (let i = 0; i < Math.floor(numPoints * 0.12); i++) {
            const angle = (i / numPoints) * Math.PI * 2 - Math.PI / 4.5;
            const radius = (baseRadius + (Math.random() - 0.5) * radiusVariation) * 0.2;
            peakHighlight.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        if (peakHighlight.length >= 6) {
            graphics.beginFill(0xf0d0b0, 0.5);
            graphics.drawPolygon(peakHighlight);
            graphics.endFill();
        }

        // Add darker cracks/details
        graphics.lineStyle(1.5 * this.size, 0x3a2a1a, 0.5);
        const numCracks = Math.floor(2 + Math.random() * 3);
        for (let i = 0; i < numCracks; i++) {
            const startAngle = Math.random() * Math.PI * 2;
            const startRadius = baseRadius * 0.3;
            const endRadius = baseRadius * 0.8;
            const x1 = Math.cos(startAngle) * startRadius;
            const y1 = Math.sin(startAngle) * startRadius;
            const x2 = Math.cos(startAngle + 0.3) * endRadius;
            const y2 = Math.sin(startAngle + 0.3) * endRadius;
            graphics.moveTo(x1, y1);
            graphics.lineTo(x2, y2);
        }

        // Add crater-like circles with depth
        graphics.lineStyle(0);
        const numCraters = Math.floor(3 + Math.random() * 4);
        for (let i = 0; i < numCraters; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * baseRadius * 0.6;
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist;
            const craterSize = (3 + Math.random() * 5) * this.size;

            // Crater shadow (darker inner circle)
            graphics.beginFill(0x3a2a1a, 0.7);
            graphics.drawCircle(x, y, craterSize);
            graphics.endFill();

            // Crater highlight (lighter rim on top-left)
            graphics.beginFill(0x8a7a6a, 0.4);
            graphics.drawCircle(x - craterSize * 0.3, y - craterSize * 0.3, craterSize * 0.5);
            graphics.endFill();
        }

        // Add some rocky bumps for texture
        const numBumps = Math.floor(4 + Math.random() * 6);
        for (let i = 0; i < numBumps; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * baseRadius * 0.7;
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist;
            const bumpSize = (2 + Math.random() * 4) * this.size;

            graphics.beginFill(0x6a5a4a, 0.6);
            graphics.drawCircle(x, y, bumpSize);
            graphics.endFill();
        }

        const texture = graphics.generateTexture();
        graphics.destroy();

        this.sprite = game.add.sprite(x, y, texture);
        this.sprite.anchor.setTo(0.5);

        // Add word text above enemy
        const style = {
            font: '20px Courier New',
            fill: '#ffffff',
            fontWeight: 'bold'
        };
        this.wordText = game.add.text(0, -35, word, style);
        this.wordText.anchor.setTo(0.5);
        this.sprite.addChild(this.wordText);
    }

    update(): void {
        // Move enemy to the left
        this.sprite.x -= this.speed;

        // Add slow rotation for 3D tumbling effect
        this.sprite.rotation += this.rotationSpeed;

        // Keep text upright (counter-rotate the text to compensate for sprite rotation)
        this.wordText.rotation = -this.sprite.rotation;
    }

    updateTypedText(): void {
        if (this.typedChars > 0) {
            const typed = this.word.substring(0, this.typedChars);
            const remaining = this.word.substring(this.typedChars);
            this.wordText.text = typed + remaining;

            // Color typed part green
            this.wordText.clearColors();
            this.wordText.addColor('#00ff00', 0);
            if (remaining.length > 0) {
                this.wordText.addColor('#ffffff', typed.length);
            }
        }
    }

    isTyped(char: string): boolean {
        if (this.typedChars < this.word.length) {
            const expectedChar = this.word[this.typedChars];
            const inputChar = this.isProMode ? char : char.toLowerCase();
            const expectedToCompare = this.isProMode ? expectedChar : expectedChar.toLowerCase();

            if (inputChar === expectedToCompare) {
                this.typedChars++;
                this.updateTypedText();
                return true;
            }
        }
        return false;
    }

    isComplete(): boolean {
        return this.typedChars === this.word.length;
    }

    resetProgress(): void {
        this.typedChars = 0;
        this.updateTypedText();
    }

    destroy(): void {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }

    explode(): void {
        const explosionX = this.sprite.x;
        const explosionY = this.sprite.y;
        const explosionSize = this.size;

        // === 1. SHOCKWAVE RING ===
        const shockwave = this.game.add.graphics(explosionX, explosionY);
        shockwave.lineStyle(3, 0xffaa00, 0.8);
        shockwave.drawCircle(0, 0, 20 * explosionSize);
        shockwave.endFill();

        const shockwaveTween = this.game.add.tween(shockwave.scale);
        shockwaveTween.to({ x: 3, y: 3 }, 400, Phaser.Easing.Cubic.Out, true);
        const shockwaveAlpha = this.game.add.tween(shockwave);
        shockwaveAlpha.to({ alpha: 0 }, 400, Phaser.Easing.Cubic.Out, true);
        shockwaveAlpha.onComplete.add(() => shockwave.destroy());

        // === 2. BRIGHT CORE FLASH (simulates initial blast) ===
        const coreFlash = this.game.add.graphics(explosionX, explosionY);
        coreFlash.beginFill(0xffffff, 1);
        coreFlash.drawCircle(0, 0, 40 * explosionSize);
        coreFlash.endFill();

        const coreScale = this.game.add.tween(coreFlash.scale);
        coreScale.to({ x: 1.8, y: 1.8 }, 200, Phaser.Easing.Exponential.Out, true);
        const coreFade = this.game.add.tween(coreFlash);
        coreFade.to({ alpha: 0 }, 250, Phaser.Easing.Quadratic.Out, true);
        coreFade.onComplete.add(() => coreFlash.destroy());

        // === 3. FIRE PARTICLES (hot debris) ===
        const fireColors = [0xff3300, 0xff6600, 0xff9900, 0xffcc00, 0xffff00];
        const numFireParticles = 30;

        for (let i = 0; i < numFireParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 80 + Math.random() * 120;
            const size = (4 + Math.random() * 8) * explosionSize;
            const color = fireColors[Math.floor(Math.random() * fireColors.length)];

            const particle = this.game.add.graphics(explosionX, explosionY);
            particle.beginFill(color, 0.9);
            particle.drawCircle(0, 0, size);
            particle.endFill();

            // Add slight variation to make it more chaotic
            const targetX = explosionX + Math.cos(angle) * speed;
            const targetY = explosionY + Math.sin(angle) * speed + (Math.random() - 0.5) * 30;

            const duration = 400 + Math.random() * 300;
            const moveTween = this.game.add.tween(particle);
            moveTween.to({ x: targetX, y: targetY }, duration, Phaser.Easing.Quadratic.Out, true);

            const fadeTween = this.game.add.tween(particle);
            fadeTween.to({ alpha: 0 }, duration, Phaser.Easing.Quadratic.In, true);

            const scaleTween = this.game.add.tween(particle.scale);
            scaleTween.to({ x: 0.3, y: 0.3 }, duration, Phaser.Easing.Quadratic.In, true);

            fadeTween.onComplete.add(() => particle.destroy());
        }

        // === 4. ASTEROID CHUNKS (rocky debris) ===
        const numChunks = 12;
        for (let i = 0; i < numChunks; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 80;
            const chunkSize = (8 + Math.random() * 12) * explosionSize;

            const chunk = this.game.add.graphics(explosionX, explosionY);

            // Draw irregular chunk shape
            chunk.beginFill(0x6a5a4a, 0.9);
            chunk.drawRect(-chunkSize/2, -chunkSize/2, chunkSize, chunkSize);
            chunk.endFill();

            // Add shading to chunk
            chunk.beginFill(0x3a2a1a, 0.4);
            chunk.drawRect(0, 0, chunkSize/2, chunkSize/2);
            chunk.endFill();

            const targetX = explosionX + Math.cos(angle) * speed;
            const targetY = explosionY + Math.sin(angle) * speed;

            const duration = 500 + Math.random() * 400;
            const moveTween = this.game.add.tween(chunk);
            moveTween.to({ x: targetX, y: targetY }, duration, Phaser.Easing.Quadratic.Out, true);

            const rotateTween = this.game.add.tween(chunk);
            rotateTween.to({ rotation: Math.random() * Math.PI * 4 }, duration, Phaser.Easing.Linear.None, true);

            const fadeTween = this.game.add.tween(chunk);
            fadeTween.to({ alpha: 0 }, duration, Phaser.Easing.Quadratic.In, true);

            fadeTween.onComplete.add(() => chunk.destroy());
        }

        // === 5. SMOKE PUFFS (gray smoke clouds) ===
        const numSmoke = 8;
        for (let i = 0; i < numSmoke; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 20 + Math.random() * 40;
            const smokeSize = (15 + Math.random() * 25) * explosionSize;

            const smoke = this.game.add.graphics(explosionX, explosionY);
            smoke.beginFill(0x444444, 0.6);
            smoke.drawCircle(0, 0, smokeSize);
            smoke.endFill();

            const targetX = explosionX + Math.cos(angle) * speed;
            const targetY = explosionY + Math.sin(angle) * speed;

            const duration = 600 + Math.random() * 400;
            const moveTween = this.game.add.tween(smoke);
            moveTween.to({ x: targetX, y: targetY }, duration, Phaser.Easing.Sinusoidal.Out, true);

            const scaleTween = this.game.add.tween(smoke.scale);
            scaleTween.to({ x: 2.5, y: 2.5 }, duration, Phaser.Easing.Quadratic.Out, true);

            const fadeTween = this.game.add.tween(smoke);
            fadeTween.to({ alpha: 0 }, duration, Phaser.Easing.Quadratic.In, true);

            fadeTween.onComplete.add(() => smoke.destroy());
        }

        // === 6. SPARKS (small bright particles) ===
        const numSparks = 20;
        for (let i = 0; i < numSparks; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 100 + Math.random() * 150;
            const sparkSize = (2 + Math.random() * 3) * explosionSize;

            const spark = this.game.add.graphics(explosionX, explosionY);
            spark.beginFill(0xffffaa, 1);
            spark.drawCircle(0, 0, sparkSize);
            spark.endFill();

            const targetX = explosionX + Math.cos(angle) * speed;
            const targetY = explosionY + Math.sin(angle) * speed;

            const duration = 300 + Math.random() * 200;
            const moveTween = this.game.add.tween(spark);
            moveTween.to({ x: targetX, y: targetY }, duration, Phaser.Easing.Quadratic.Out, true);

            const fadeTween = this.game.add.tween(spark);
            fadeTween.to({ alpha: 0 }, duration, Phaser.Easing.Quadratic.Out, true);

            fadeTween.onComplete.add(() => spark.destroy());
        }

        // Destroy the asteroid sprite
        this.sprite.destroy();
    }

    getX(): number {
        return this.sprite.x;
    }
}

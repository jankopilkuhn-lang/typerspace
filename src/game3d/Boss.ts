import * as THREE from 'three';

export class Boss {
    public mesh: THREE.Mesh;
    public words: string[];
    public currentWordIndex: number = 0;
    public typedChars: number = 0;
    public speed: number;
    public velocity: THREE.Vector3;
    public size: number = 3.0; // Much bigger than asteroids
    public health: number = 3; // Takes 3 words to destroy
    private textSprite: THREE.Sprite;
    private rotationSpeed: THREE.Vector3;
    private glowMesh: THREE.Mesh;
    private isProMode: boolean;

    constructor(
        scene: THREE.Scene,
        x: number,
        y: number,
        z: number,
        words: string[],
        speed: number,
        isProMode: boolean = false
    ) {
        this.words = words;
        this.speed = speed;
        this.isProMode = isProMode;

        // Slow velocity
        this.velocity = new THREE.Vector3(-speed * 0.5, 0, 0);

        // Create boss geometry (bigger and more detailed)
        this.mesh = this.createBossMesh();
        this.mesh.position.set(x, y, z);
        this.mesh.scale.set(this.size, this.size, this.size);

        // Add glowing effect
        this.glowMesh = this.createGlowMesh();
        this.glowMesh.position.copy(this.mesh.position);
        this.glowMesh.scale.set(this.size * 1.2, this.size * 1.2, this.size * 1.2);

        // Slow menacing rotation
        this.rotationSpeed = new THREE.Vector3(0.005, 0.008, 0.003);

        // Create text sprite
        this.textSprite = this.createTextSprite(this.words[0]);
        this.textSprite.position.set(x, y + this.size * 1.5, z);

        // Add to scene
        scene.add(this.glowMesh);
        scene.add(this.mesh);
        scene.add(this.textSprite);
    }

    private createBossMesh(): THREE.Mesh {
        // Create complex geometry by combining multiple shapes
        const geometry = new THREE.DodecahedronGeometry(1, 1);

        // Deform for menacing look
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const vertex = new THREE.Vector3(
                positions.getX(i),
                positions.getY(i),
                positions.getZ(i)
            );

            const noise = Math.random() * 0.2 + 0.9;
            vertex.normalize().multiplyScalar(noise);

            positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }

        geometry.computeVertexNormals();

        // Dark menacing material with red tint
        const material = new THREE.MeshStandardMaterial({
            color: 0x8a1a1a,
            roughness: 0.7,
            metalness: 0.3,
            flatShading: true,
            emissive: 0x4a0a0a,
            emissiveIntensity: 0.5
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    private createGlowMesh(): THREE.Mesh {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });

        return new THREE.Mesh(geometry, material);
    }

    private createTextSprite(text: string): THREE.Sprite {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;

        // Dynamic canvas width based on text length (Boss words can be very long)
        const minWidth = 1024;
        const maxWidth = 3072;
        const estimatedWidth = Math.min(maxWidth, Math.max(minWidth, text.length * 70));
        canvas.width = estimatedWidth;
        canvas.height = 128;

        // Boss text has red background
        context.fillStyle = 'rgba(139, 0, 0, 0.9)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Dynamic font size based on word length
        let fontSize = 72;
        if (text.length > 10) fontSize = 64;
        if (text.length > 12) fontSize = 56;
        if (text.length > 15) fontSize = 48;
        if (text.length > 18) fontSize = 40;

        context.font = `Bold ${fontSize}px Courier New`;
        context.fillStyle = '#ffff00'; // Yellow text
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            depthTest: false,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(material);

        // Dynamic scale based on canvas width
        const scaleX = (canvas.width / 128) * 1;
        sprite.scale.set(scaleX, 2, 1);
        sprite.renderOrder = 999;

        return sprite;
    }

    public update(deltaTime: number, camera: THREE.Camera): void {
        // Move slowly
        this.mesh.position.x += this.velocity.x * deltaTime;
        this.mesh.position.y += Math.sin(Date.now() * 0.001) * 0.02; // Hovering effect

        // Menacing rotation
        this.mesh.rotation.x += this.rotationSpeed.x;
        this.mesh.rotation.y += this.rotationSpeed.y;
        this.mesh.rotation.z += this.rotationSpeed.z;

        // Update glow
        this.glowMesh.position.copy(this.mesh.position);
        this.glowMesh.rotation.x -= this.rotationSpeed.x * 0.5;
        this.glowMesh.rotation.y -= this.rotationSpeed.y * 0.5;

        // Pulsating glow
        const scale = this.size * 1.2 + Math.sin(Date.now() * 0.003) * 0.2;
        this.glowMesh.scale.set(scale, scale, scale);

        // Update text position
        if (this.textSprite) {
            this.textSprite.position.set(
                this.mesh.position.x,
                this.mesh.position.y + this.size * 1.5,
                this.mesh.position.z
            );
            this.textSprite.lookAt(camera.position);
        }
    }

    public typeCharacter(char: string): boolean {
        const currentWord = this.words[this.currentWordIndex];

        if (this.typedChars < currentWord.length) {
            const expectedChar = currentWord[this.typedChars];
            const inputChar = this.isProMode ? char : char.toLowerCase();
            const expectedToCompare = this.isProMode ? expectedChar : expectedChar.toLowerCase();

            if (inputChar === expectedToCompare) {
                this.typedChars++;
                this.updateText();

                // Check if word is complete
                if (this.typedChars >= currentWord.length) {
                    this.currentWordIndex++;
                    this.typedChars = 0;

                    // Move to next word or mark as defeated
                    if (this.currentWordIndex < this.words.length) {
                        this.updateText();
                    }
                }

                return true;
            }
        }
        return false;
    }

    private updateText(): void {
        if (this.currentWordIndex >= this.words.length) return;

        const currentWord = this.words[this.currentWordIndex];
        const remaining = currentWord.substring(this.typedChars);

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;

        // Dynamic canvas width based on remaining text length
        const minWidth = 1024;
        const maxWidth = 3072;
        const estimatedWidth = Math.min(maxWidth, Math.max(minWidth, remaining.length * 70));
        canvas.width = estimatedWidth;
        canvas.height = 128;

        // Red background
        context.fillStyle = 'rgba(139, 0, 0, 0.9)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Dynamic font size based on remaining text length
        let fontSize = 72;
        if (remaining.length > 10) fontSize = 64;
        if (remaining.length > 12) fontSize = 56;
        if (remaining.length > 15) fontSize = 48;
        if (remaining.length > 18) fontSize = 40;

        context.font = `Bold ${fontSize}px Courier New`;

        if (this.typedChars > 0) {
            context.fillStyle = '#00ff00'; // Green for progress
        } else {
            context.fillStyle = '#ffff00'; // Yellow
        }

        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(remaining, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        this.textSprite.material.map = texture;
        this.textSprite.material.needsUpdate = true;

        // Update sprite scale based on canvas width
        const scaleX = (canvas.width / 128) * 1;
        this.textSprite.scale.set(scaleX, 2, 1);
    }

    public resetProgress(): void {
        this.typedChars = 0;
        this.updateText();
    }

    public isDefeated(): boolean {
        return this.currentWordIndex >= this.words.length;
    }

    public createExplosion(scene: THREE.Scene): void {
        // Massive explosion
        const particleCount = 200;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 5;
            positions[i] = Math.cos(angle) * radius;
            positions[i + 1] = Math.sin(angle) * radius;
            positions[i + 2] = (Math.random() - 0.5) * 5;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xff0000,
            size: 0.5,
            transparent: true,
            opacity: 1.0
        });

        const particleSystem = new THREE.Points(particles, material);
        particleSystem.position.copy(this.mesh.position);
        scene.add(particleSystem);

        // Animate explosion
        let life = 1.0;
        const animate = () => {
            life -= 0.01;
            if (life > 0) {
                material.opacity = life;
                particleSystem.scale.multiplyScalar(1.15);
                requestAnimationFrame(animate);
            } else {
                scene.remove(particleSystem);
            }
        };
        animate();
    }

    public destroy(scene: THREE.Scene): void {
        scene.remove(this.mesh);
        scene.remove(this.glowMesh);
        scene.remove(this.textSprite);

        this.mesh.geometry.dispose();
        (this.mesh.material as THREE.Material).dispose();
        this.glowMesh.geometry.dispose();
        (this.glowMesh.material as THREE.Material).dispose();

        if (this.textSprite.material.map) {
            this.textSprite.material.map.dispose();
        }
        this.textSprite.material.dispose();
    }

    public getPosition(): THREE.Vector3 {
        return this.mesh.position;
    }
}

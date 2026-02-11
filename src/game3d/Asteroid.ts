import * as THREE from 'three';

export class Asteroid {
    public mesh: THREE.Mesh;
    public word: string;
    public typedChars: number = 0;
    public speed: number;
    public velocity: THREE.Vector3;
    public size: number;
    private textSprite: THREE.Sprite;
    private rotationSpeed: THREE.Vector3;
    private isProMode: boolean;

    constructor(
        scene: THREE.Scene,
        x: number,
        y: number,
        z: number,
        word: string,
        speed: number,
        direction?: THREE.Vector3,
        isProMode: boolean = false
    ) {
        this.word = word;
        this.speed = speed;
        this.isProMode = isProMode;

        // Set velocity based on direction or default to left
        if (direction) {
            this.velocity = direction.normalize().multiplyScalar(speed);
        } else {
            this.velocity = new THREE.Vector3(-speed, 0, 0);
        }

        // Random size variation
        const sizeVariations = [0.7, 1.0, 1.3, 1.6];
        this.size = sizeVariations[Math.floor(Math.random() * sizeVariations.length)];

        // Create asteroid geometry
        this.mesh = this.createAsteroidMesh();
        this.mesh.position.set(x, y, z);
        this.mesh.scale.set(this.size, this.size, this.size);

        // Random rotation
        this.mesh.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );

        // Random rotation speed (slower for larger asteroids)
        this.rotationSpeed = new THREE.Vector3(
            (Math.random() - 0.5) * 0.01 / this.size,
            (Math.random() - 0.5) * 0.01 / this.size,
            (Math.random() - 0.5) * 0.01 / this.size
        );

        // Create text sprite (separate from mesh so it's always visible)
        this.textSprite = this.createTextSprite(word);
        this.textSprite.position.set(x, y + this.size * 1.5, z);

        // Add both separately to scene
        scene.add(this.mesh);
        scene.add(this.textSprite);
    }

    private createAsteroidMesh(): THREE.Mesh {
        // Start with icosahedron geometry - higher detail level
        const geometry = new THREE.IcosahedronGeometry(1, 2);

        // Deform vertices for irregular shape with more variation
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const vertex = new THREE.Vector3(
                positions.getX(i),
                positions.getY(i),
                positions.getZ(i)
            );

            // Add more pronounced noise for irregular surface
            const noise = Math.random() * 0.4 + 0.8;
            vertex.normalize().multiplyScalar(noise);

            positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }

        geometry.computeVertexNormals();

        // Varied color palette for asteroids
        const colorVariations = [
            0x6a5a4a, // Original brown
            0x5a4a3a, // Darker brown
            0x7a6a5a, // Lighter brown
            0x5a5a5a, // Dark gray
            0x6a6a6a, // Medium gray
            0x4a3a2a  // Dark reddish-brown
        ];
        const asteroidColor = colorVariations[Math.floor(Math.random() * colorVariations.length)];

        // Varied material properties
        const roughness = 0.85 + Math.random() * 0.15; // 0.85-1.0
        const metalness = 0.05 + Math.random() * 0.1;  // 0.05-0.15

        // Create material with realistic asteroid look
        const material = new THREE.MeshStandardMaterial({
            color: asteroidColor,
            roughness: roughness,
            metalness: metalness,
            flatShading: true,
            emissive: asteroidColor,
            emissiveIntensity: 0.05 // Subtle glow
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    private createTextSprite(text: string): THREE.Sprite {
        // Create canvas for text with dynamic width
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;

        // Dynamic canvas width based on text length
        const minWidth = 512;
        const maxWidth = 2048;
        const estimatedWidth = Math.min(maxWidth, Math.max(minWidth, text.length * 60));
        canvas.width = estimatedWidth;
        canvas.height = 128;

        // Draw background
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Dynamic font size based on text length
        let fontSize = 72;
        if (text.length > 8) fontSize = 60;
        if (text.length > 12) fontSize = 50;
        if (text.length > 16) fontSize = 42;

        context.font = `Bold ${fontSize}px Courier New`;
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            depthTest: false,  // Always render on top
            depthWrite: false
        });
        const sprite = new THREE.Sprite(material);

        // Dynamic scale based on canvas width
        const scaleX = (canvas.width / 128) * 1;
        sprite.scale.set(scaleX, 1, 1);
        sprite.renderOrder = 999; // Render after everything else

        return sprite;
    }

    public update(deltaTime: number, camera: THREE.Camera): void {
        // Move in velocity direction
        this.mesh.position.x += this.velocity.x * deltaTime;
        this.mesh.position.y += this.velocity.y * deltaTime;
        this.mesh.position.z += this.velocity.z * deltaTime;

        // Rotate for 3D effect
        this.mesh.rotation.x += this.rotationSpeed.x;
        this.mesh.rotation.y += this.rotationSpeed.y;
        this.mesh.rotation.z += this.rotationSpeed.z;

        // Update text position to follow asteroid
        if (this.textSprite) {
            this.textSprite.position.set(
                this.mesh.position.x,
                this.mesh.position.y + this.size * 1.5,
                this.mesh.position.z
            );
            // Make text always face camera
            this.textSprite.lookAt(camera.position);
        }
    }

    public typeCharacter(char: string): boolean {
        if (this.typedChars < this.word.length) {
            const expectedChar = this.word[this.typedChars];
            const inputChar = this.isProMode ? char : char.toLowerCase();
            const expectedToCompare = this.isProMode ? expectedChar : expectedChar.toLowerCase();

            if (inputChar === expectedToCompare) {
                this.typedChars++;
                this.updateText();
                return true;
            }
        }
        return false;
    }

    private updateText(): void {
        // Update text to show remaining characters
        const remaining = this.word.substring(this.typedChars);

        // Recreate sprite with new text and dynamic width
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;

        // Dynamic canvas width based on remaining text length
        const minWidth = 512;
        const maxWidth = 2048;
        const estimatedWidth = Math.min(maxWidth, Math.max(minWidth, remaining.length * 60));
        canvas.width = estimatedWidth;
        canvas.height = 128;

        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Dynamic font size based on remaining text length
        let fontSize = 72;
        if (remaining.length > 8) fontSize = 60;
        if (remaining.length > 12) fontSize = 50;
        if (remaining.length > 16) fontSize = 42;

        context.font = `Bold ${fontSize}px Courier New`;

        // Color changes when typing
        if (this.typedChars > 0) {
            context.fillStyle = '#00ff00';
        } else {
            context.fillStyle = 'white';
        }

        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(remaining, canvas.width / 2, canvas.height / 2);

        // Update texture
        const texture = new THREE.CanvasTexture(canvas);
        this.textSprite.material.map = texture;
        this.textSprite.material.needsUpdate = true;

        // Update sprite scale based on canvas width
        const scaleX = (canvas.width / 128) * 1;
        this.textSprite.scale.set(scaleX, 1, 1);
    }

    public isComplete(): boolean {
        return this.typedChars >= this.word.length;
    }

    public resetProgress(): void {
        this.typedChars = 0;
        // Reset text to original word
        if (this.textSprite) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d')!;

            // Dynamic canvas width based on word length
            const minWidth = 512;
            const maxWidth = 2048;
            const estimatedWidth = Math.min(maxWidth, Math.max(minWidth, this.word.length * 60));
            canvas.width = estimatedWidth;
            canvas.height = 128;

            context.fillStyle = 'rgba(0, 0, 0, 0.7)';
            context.fillRect(0, 0, canvas.width, canvas.height);

            // Dynamic font size based on word length
            let fontSize = 72;
            if (this.word.length > 8) fontSize = 60;
            if (this.word.length > 12) fontSize = 50;
            if (this.word.length > 16) fontSize = 42;

            context.font = `Bold ${fontSize}px Courier New`;
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(this.word, canvas.width / 2, canvas.height / 2);

            const texture = new THREE.CanvasTexture(canvas);
            this.textSprite.material.map = texture;
            this.textSprite.material.needsUpdate = true;

            // Update sprite scale based on canvas width
            const scaleX = (canvas.width / 128) * 1;
            this.textSprite.scale.set(scaleX, 1, 1);
        }
    }

    public createExplosion(scene: THREE.Scene): void {
        // Create particle explosion
        const particleCount = 50;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 2;
            positions[i] = Math.cos(angle) * radius;
            positions[i + 1] = Math.sin(angle) * radius;
            positions[i + 2] = (Math.random() - 0.5) * 2;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xff6600,
            size: 0.3,
            transparent: true,
            opacity: 1.0
        });

        const particleSystem = new THREE.Points(particles, material);
        particleSystem.position.copy(this.mesh.position);
        scene.add(particleSystem);

        // Animate particles
        let life = 1.0;
        const animate = () => {
            life -= 0.02;
            if (life > 0) {
                material.opacity = life;
                particleSystem.scale.multiplyScalar(1.1);
                requestAnimationFrame(animate);
            } else {
                scene.remove(particleSystem);
            }
        };
        animate();
    }

    public destroy(scene: THREE.Scene): void {
        // Remove mesh
        scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        (this.mesh.material as THREE.Material).dispose();

        // Remove text sprite
        scene.remove(this.textSprite);
        if (this.textSprite.material.map) {
            this.textSprite.material.map.dispose();
        }
        this.textSprite.material.dispose();
    }

    public getPosition(): THREE.Vector3 {
        return this.mesh.position;
    }
}

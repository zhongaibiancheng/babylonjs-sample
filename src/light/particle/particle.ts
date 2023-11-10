import { Color4, Mesh, ParticleSystem, Scene, Texture, Vector3 } from "@babylonjs/core";

export default class ParticleCreator{
    _scene:Scene;
    _emitter:Mesh;

    constructor(scene:Scene){
        this._scene = scene;
    }

    public createLoveParticle(emitter):ParticleSystem{
        // Create a particle system
        var fireSystem = new ParticleSystem("particles", 100,this._scene);

        //Texture of each particle
        fireSystem.particleTexture = new Texture("textures/flare.png", this._scene);

        // Where the particles come from
        fireSystem.emitter = emitter; // the starting object, the emitter
        fireSystem.minEmitBox = new Vector3(-0.01, 0.01, -0.01); // Starting all from
        fireSystem.maxEmitBox = new Vector3(0.01, 0.01, 0.01); // To...

        // Colors of all particles
        fireSystem.color1 = new Color4(1, 0.5, 0, 1.0);
        fireSystem.color2 = new Color4(1, 0.5, 0, 1.0);
        fireSystem.colorDead = new Color4(0, 0, 0, 0.0);

        // Size of each particle (random between...
        fireSystem.minSize = 0.1;
        fireSystem.maxSize = 0.3;

        // Life time of each particle (random between...
        fireSystem.minLifeTime = 0.1;
        fireSystem.maxLifeTime = 0.15;

        // Emission rate
        fireSystem.emitRate = 100;

        // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
        fireSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;

        // Set the gravity of all particles
        fireSystem.gravity = new Vector3(0, 0, 0);

        // Direction of each particle after it has been emitted
        fireSystem.direction1 = new Vector3(0, 4, 0);
        fireSystem.direction2 = new Vector3(0, 4, 0);

        // Angular speed, in radians
        fireSystem.minAngularSpeed = 0;
        fireSystem.maxAngularSpeed = Math.PI;

        // Speed
        fireSystem.minEmitPower = 0.5;
        fireSystem.maxEmitPower = 1.0;
        fireSystem.updateSpeed = 0.003;
        return fireSystem;
    }
}
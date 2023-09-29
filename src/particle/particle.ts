import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, Mesh, MeshBuilder, ParticleSystem, prepareStringDefinesForClipPlanes, Scene, StandardMaterial, Texture, Vector3, Vector4, _PrimaryIsoTriangle } from "@babylonjs/core";

export default class Particle{
    _engine:Engine;
    _scene:Scene;
    _emitter:Mesh;
    _rocket:ParticleSystem;

    constructor(){
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(canvas);
        this._scene = new Scene(this._engine);

        const light = new HemisphericLight("light",new Vector3(1,1,1),this._scene);

        const camera = new ArcRotateCamera(
            "camera",
            Math.PI/2.0,
            Math.PI/2.0,
            2,
            Vector3.Zero(),
            this._scene);
        
        camera.attachControl(canvas,true);
        camera.wheelDeltaPercentage = 0.02;
        camera.setPosition(new Vector3(0,5,-2));

        const ground = MeshBuilder.CreateGround("ground",{width:15,height:16},this._scene);
        ground.position.y = -2;
        const mtl = new StandardMaterial("ground",this._scene);
        mtl.diffuseColor = new Color3(0.3,0.4,0.5);
        mtl.backFaceCulling = false;
        ground.material = mtl;
        // const mesh = MeshBuilder.CreateBox("box");
        // mesh.position.y = 1;
        // this._scene.registerBeforeRender(()=>{
        //     mesh.rotation.y += 0.01;
        //     mesh.rotation.x -= 0.01;
        // });
        this._createParticle();

        this._scene.onBeforeRenderObservable.add(()=>{
            this._emitter.position.y += .2;
        })
        this._main();
    }
    _createParticle(){
        const sphere = Mesh.CreateSphere("rocket", 4, 1, this._scene);
        sphere.isVisible = true;
        //the origin spawn point for all fireworks is determined by a TransformNode called "fireworks", this was placed in blender
        let randPos = Math.random() * 10;
        sphere.position = (new Vector3(0,2,0));
        this._emitter = sphere;

        const rocket = new ParticleSystem("particle",350,this._scene);
        rocket.particleTexture = new Texture("./textures/flare.png",this._scene);

        rocket.emitter = sphere;
        rocket.emitRate = 20;
        rocket.minEmitBox = new Vector3(0, 0, 0);
        rocket.maxEmitBox = new Vector3(0, 0, 0);
        rocket.color1 = new Color4(0.49, 0.57, 0.76);
        rocket.color2 = new Color4(0.29, 0.29, 0.66);
        rocket.colorDead = new Color4(0, 0, 0.2, 0.5);
        rocket.minSize = 1;
        rocket.maxSize = 1;
        rocket.addSizeGradient(0, 1);
        rocket.addSizeGradient(1, 0.01);

        this._rocket = rocket;
        this._rocket.start();
        // rocket.start();
        // particle.textureMask = new Color4(0.1, 0.8, 0.8, 1.0);

        // particle.emitter = emitter;
        // particle.minEmitBox = new Vector3(-1,0,0);
        // particle.maxEmitBox = new Vector3(1,0,0);

        // particle.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
        // particle.color2 = new Color4(0.2, 0.5, 1.0, 1.0);
        // particle.colorDead = new Color4(0,0,0.2,0);

        // particle.minSize = 0.1;
        // particle.maxSize = 0.5;

        // particle.minLifeTime = 0.1;
        // particle.maxLifeTime = 0.4;

        //  // Emission rate
        //  particle.emitRate = 350;

        // // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
        // particle.blendMode = ParticleSystem.BLENDMODE_ONEONE;

        // Set the gravity of all particles
        // particle.gravity = new Vector3(0, -9.81, 0);

        // Direction of each particle after it has been emitted
        // particle.direction1 = new Vector3(-7, 8, 3);
        // particle.direction2 = new Vector3(7, 8, -3);

        // Angular speed, in radians
        // particle.minAngularSpeed = 0;
        // particle.maxAngularSpeed = Math.PI;

        // Speed
        // particle.minEmitPower = 1;
        // particle.maxEmitPower = 3;
        // particle.updateSpeed = 0.005;

        // // Start the particle system
        // particle.start();

        // setTimeout(()=>{
        //     particle.stop();
        // },10000)

    }
    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}
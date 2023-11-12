
import ammo from "ammo.js";

import { ActionManager, AmmoJSPlugin, ArcRotateCamera, AxesViewer, Color3, Color4, 
    Engine, ExecuteCodeAction, HemisphericLight, Matrix, Mesh, MeshBuilder,
     ParticleSystem, 
     PhysicsImpostor, 
     PointerEventTypes, 
     Scene, SceneLoader, StandardMaterial, Texture, TextureUsage, Vector3,
      VertexData,
      _PrimaryIsoTriangle } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

export default class FireBall{
    _engine:Engine;
    _scene:Scene;
    _emitter:Mesh;
    _rocket:ParticleSystem;

    _player:any;
    _ball:any;
    constructor(){
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(canvas);
        this._scene = new Scene(this._engine);

        const light = new HemisphericLight("light",new Vector3(1,1,1),this._scene);

        var camera = new ArcRotateCamera("camera1",  0, 0, 0, new Vector3(0, 0, 0), this._scene);
        camera.setPosition(new Vector3(0, 5, -30));
        
        camera.attachControl(canvas,true);
        camera.wheelDeltaPercentage = 0.02;

        const ground = MeshBuilder.CreateGround("ground",{width:15,height:16},this._scene);
        ground.position.y = -2;
        const mtl = new StandardMaterial("ground",this._scene);
        mtl.diffuseColor = new Color3(0.3,0.4,0.5);
        mtl.backFaceCulling = false;
        ground.material = mtl;
        
        const axis =  new AxesViewer(this._scene, 5);
        this._setPhysics().then(()=>{
            this._loadCharacter().then(()=>{
                    this._createWeapon();
                });
            }
        );
        this._main();
        
        this._scene.onPointerObservable.add((pointerInfo)=>{
            switch (pointerInfo.type) {
                case PointerEventTypes.POINTERTAP:
                    switch (pointerInfo.event.button) {
                        case 0: 
                            console.log("LEFT");
                            this._ball.position = this._player.position;
                            this._ball.position.y = 2;

                            const originalFacing = new Vector3(0, 0, 1);
                            const facing = Vector3.TransformCoordinates(
                                originalFacing, 
                                this._player.getWorldMatrix().getRotationMatrix());
                            facing.normalize();

                            const f = facing.scaleInPlace(0.1);
                            const points = [
                                Vector3.Zero(),
                                f
                            ];
                            MeshBuilder.CreateLines("facing",{
                                points:points
                            });

                            this._ball.applyImpulse(
                                // new Vector3(0, 0, 20), 
                                f,
                                this._ball.getAbsolutePosition());
                            break;
                        case 1: 
                            console.log("MIDDLE");
                            break;
                        case 2: 
                            console.log("RIGHT");
                            break;
                    }
                break;
            }
            
            // var originalOrientation = new Vector3(0, 0, 1);
            // var orientation = this._player.getDirection(originalOrientation);
            // orientation.normalize();
            // console.log("***** orientation 1*********")
            // console.log(orientation);
            // console.log("***** orientation 2*********")

        })
    }

    private async _loadCharacter(){
        const result =  await SceneLoader.ImportMeshAsync(
            "",
            "./light/models/", "player.glb",this._scene);

        this._player = result.meshes[0];
        this._player.scaling.setAll(0.1);
        this._player.rotationQuaternion = null;

        this._player.rotation.y += Math.PI/4.0;

        const result_police = await SceneLoader.ImportMeshAsync(
            "",
        "./models/",
        "police_walking.glb",
        this._scene);
        const police = result_police.meshes[0];
        const outer_police = MeshBuilder.CreateBox("police",{
            width:0.5,height:3,depth:0.5
        },this._scene);

        police.parent = outer_police;

         //move origin of box collider to the bottom of the mesh (to match player mesh)
         outer_police.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0))

         //for collisions
         outer_police.ellipsoid = new Vector3(1, 1.5, 1);
         outer_police.ellipsoidOffset = new Vector3(0, 1.5, 0);
 
        //  outer_police.rotationQuaternion = new Quaternion(0, 0, 0, 0); // ro
        outer_police.position.x = 5;
        outer_police.position.z = 5;
        outer_police.isVisible = true;

        outer_police.physicsImpostor = new PhysicsImpostor(
            outer_police,
            PhysicsImpostor.BoxImpostor,
            {
                mass:0.1
            })
    }
    private _createFireball(){
        let pSystem = new ParticleSystem("particles", 500, this._scene);
		pSystem.emitter = this._ball;
		pSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;
		// pSystem.light = new BABYLON.PointLight("Omni1", new BABYLON.Vector3(0, 0, 0), scene);
		// pSystem.light.diffuse = new BABYLON.Color3(.8, 0, 0);
		// pSystem.light.range = 15;
			
		pSystem.particleTexture = new Texture("textures/flare.png", this._scene);
		pSystem.minEmitBox = new Vector3(0, -0.1, 0);
		pSystem.maxEmitBox = new Vector3(0, 0.1, 0);
		pSystem.color1 = new Color4(1.0, 0.05, 0.05, .9);
		pSystem.color2 = new Color4(0.85, 0.05, 0, .9);
		pSystem.colorDead = new Color4(.5, .02, 0, .5);
		pSystem.minSize = 0.2;
		pSystem.maxSize = 0.4;
		pSystem.minLifeTime = 0.1;
		pSystem.maxLifeTime = 0.15;
		pSystem.emitRate = 100;
		pSystem.gravity = new Vector3(0, 0, 0);
		pSystem.direction1 = new Vector3(0, .05, 0);
		pSystem.direction2 = new Vector3(0, -.05, 0);
		pSystem.minAngularSpeed = 1.5;
		pSystem.maxAngularSpeed = 2.5;
		pSystem.minEmitPower = 0.1;
		pSystem.maxEmitPower = 1;
		pSystem.updateSpeed = 0.008;

        pSystem.start();
    }
    private _createWeapon(){
        this._ball = MeshBuilder.CreateSphere("ball",{
            diameter:0.2,segments:32});
        this._ball.position.y = 2;
        this._ball.physicsImpostor = new PhysicsImpostor(
            this._ball,PhysicsImpostor.SphereImpostor,{
                mass:0.1,
                friction:0.1
            },
            this._scene);

        this._createFireball();
        this._ball.actionManager = new ActionManager(this._scene);
        this._ball.actionManager.registerAction(new ExecuteCodeAction({
            trigger: ActionManager.OnIntersectionEnterTrigger,
            parameter: this._scene.getMeshByName("police"),
        },
        () => {
            console.log("ball hit the police")
        },
        ));
    }
    private async _setPhysics(){
        const Ammo = await ammo();
        const physics = new AmmoJSPlugin(true,Ammo);
        this._scene.enablePhysics(new Vector3(0,0,0),physics);
    }
    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}


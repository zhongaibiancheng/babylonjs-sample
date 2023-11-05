
import { ArcRotateCamera, AxesViewer, Color3, Color4, 
    Engine, HemisphericLight, Mesh, MeshBuilder,
     ParticleSystem, 
     Animation, 
     Scene, SceneLoader, StandardMaterial, Texture, 
      _PrimaryIsoTriangle, 
      Vector3,
      PointerEventTypes} from "@babylonjs/core";
import { anaglyphPixelShader } from "@babylonjs/core/Shaders/anaglyph.fragment";
import "@babylonjs/loaders/glTF";

export default class Sword{
    _engine:Engine;
    _scene:Scene;
    _emitter:Mesh;
    _rocket:ParticleSystem;

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
        
        // const axis =  new AxesViewer(this._scene, 10);

        this._loadSword();
        this._main();
    }

    private async _loadSword(){
        const result_player = await SceneLoader.ImportMeshAsync(null,
            "/models/",
            "girl.glb",this._scene);
        const player = result_player.meshes[0];
        const animations = result_player.animationGroups;

        const idle = animations[0];
        const jumping = animations[1];
        const slash = animations[2];
        const top_to_down = animations[3];

        player.scaling.setAll(10);

        SceneLoader.ImportMesh(
            "",
            "./models/", "sword.glb",this._scene,(swords)=>{

        const sword = swords[0];
        // sword.scaling.setAll(0.1);
        sword.rotationQuaternion = null;

        var ps1 = new ParticleSystem("ps1", 4000, this._scene);

        const url = "/textures/fire.jpg";
        ps1.particleTexture = new Texture(url, this._scene);

        ps1.minSize = 0.1;
        ps1.maxSize = 1.5;
        ps1.minLifeTime = 0.1;
        ps1.maxLifeTime = 0.25;

        ps1.minEmitPower = .01;
        ps1.maxEmitPower = 0.5;

        ps1.minAngularSpeed = 0;
        ps1.maxAngularSpeed = 0;

        const emitter = MeshBuilder.CreateBox("mesh",{size:.1});
        emitter.isVisible = false;
        emitter.position.y += 9.5;
        emitter.position.x -= 0.25;
        emitter.rotation.x = Math.PI/2.0;
        emitter.parent = sword; 
        ps1.emitter = emitter;

        // ps1.manualEmitCount = 500;
        ps1.emitRate = 850;

        ps1.updateSpeed = 0.01;
        ps1.blendMode = ParticleSystem.BLENDMODE_ONEONE;

        ps1.color1 = new Color4(0.05, 0.05, 0.05, .5);
        ps1.color2 = new Color4(0.05, 0.05, 0.05, .25);
        ps1.colorDead = new Color4(0, 0, 0, 0);

        ps1.direction1 = new Vector3(-.3, 1, .3);
        ps1.direction2 = new Vector3(-1, -.2, -.3);
        ps1.minEmitBox = new Vector3(.1, .1, 6);
        ps1.maxEmitBox = new Vector3(.15, .1, -6);

        // turn the key! vrooom!
        ps1.start();

        sword.position.set(0,0,0);
        let handR = this._scene.transformNodes.find(
            node => node.name === "mixamorig:RightHandThumb1");

        // handR.bakeCurrentTransformIntoVertices();
        sword.scaling.setAll(5);
        // sword.setParent(handR);
        sword.parent = handR;
        
        let i=0;
        this._scene.onPointerObservable.add((pointerInfo)=>{
            switch(pointerInfo.type){
                case PointerEventTypes.POINTERDOWN:
                    i++;
                    if(i%4 ===1){//slash
                        slash.play(slash.loopAnimation);
                    }else if(i%4 ===2){//jumping
                        jumping.play(jumping.loopAnimation);
                    }else if(i%4 === 3){//top_to_down
                        top_to_down.play(top_to_down.loopAnimation);
                    }
                    break;
            }
        });
        

            const frameRate = 100;
            const rotate = new Animation(
                "rotate", 
                "rotation.x", 
                frameRate,
                Animation.ANIMATIONTYPE_FLOAT, 
                Animation.ANIMATIONLOOPMODE_CONSTANT
            );

            const rotate_keys = [];

            rotate_keys.push({
                frame: 0,
                value: 0,
            });

            rotate_keys.push({
                frame: 9 * frameRate,
                value: Math.PI/2.0,
            });

            rotate_keys.push({
                frame: 18 * frameRate,
                value: Math.PI,
            });
            rotate_keys.push({
                frame: 27 * frameRate,
                value: Math.PI/2.0 *3.0,
            });
            rotate_keys.push({
                frame: 36 * frameRate,
                value: 2.0*Math.PI,
            });
            rotate.setKeys(rotate_keys);

            const move = new Animation(
                "move", 
                "position.z", 
                frameRate,
                Animation.ANIMATIONTYPE_FLOAT, 
                Animation.ANIMATIONLOOPMODE_CONSTANT
            );

            const move_keys = [];

            move_keys.push({
                frame: 0,
                value: 0,
            });

            move_keys.push({
                frame: 9 * frameRate,
                value: 10,
            });

            move_keys.push({
                frame: 18 * frameRate,
                value: 20,
            });
            move_keys.push({
                frame: 27 * frameRate,
                value: 30,
            });
            move_keys.push({
                frame: 36 * frameRate,
                value: 40,
            });
            move.setKeys(move_keys);

            sword.animations = [];
            sword.animations.push(move);
            // sword.animations.push(rotate);
            // this._scene.beginAnimation(sword,0,36*frameRate,false);

        });
    }
    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}





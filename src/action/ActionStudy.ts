import '@babylonjs/inspector';

import { ArcRotateCamera, AxesViewer, Color3, Color4, 
    Engine, HemisphericLight, Mesh, MeshBuilder,
     Scene, StandardMaterial, Vector3,
      CannonJSPlugin,
      _PrimaryIsoTriangle, 
      PhysicsImpostor,
      ActionManager,
      ExecuteCodeAction,
      SceneLoader,
      AnimationGroup,
      Quaternion,
      Axis,
      Texture,
      Vector4} from "@babylonjs/core";

import "@babylonjs/loaders/glTF";
import * as CANNON from 'cannon-es';

//scene 资源
const ASSETS_PATH = "./dungeon/scene/";
const ASSETS_PATH_MODELS = "./dungeon/player/Characters/gltf/";

export default class ActionStudy{
    _engine:Engine;
    _scene:Scene;
    _emitter:Mesh;

    _input:{};

    _player:Mesh;

    boxes:Array<Mesh>;

    _walk:AnimationGroup;

    constructor(){
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(canvas);
        this._scene = new Scene(this._engine);

        this._scene.debugLayer.show();

        const light = new HemisphericLight("light",new Vector3(1,1,1),this._scene);

        var camera = new ArcRotateCamera("camera1",  0, 0, 0, new Vector3(0, 0, 0), this._scene);
        camera.setPosition(new Vector3(10, 5, -10));
        
        camera.attachControl(canvas,true);
        camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
        camera.wheelDeltaPercentage = 0.02;

        const axis =  new AxesViewer(this._scene, 10);

        this._setPhysics();

        this._createPhysicsWorld();

        this._createInputMap();
    
        this._createAction();

        this._main();
    }

    private _createAction(){
        this._scene.registerAfterRender(()=>{
            if(this._input && this._input["k"]){
                // this._kick_left.play(false);
            }else if(this._input && this._input["w"]){
                let pos = this._player.position;
                this._walk.play(false);
                this._player.position = pos.add(this._player.forward.normalize().scale(0.05));
            }else if(this._input && this._input["ArrowLeft"]){
                this._player.rotationQuaternion = this._player.rotationQuaternion.multiply(
                    Quaternion.RotationAxis(Axis.Y, Math.PI / 80) // 30 度对应的弧度是 Math.PI / 6
                );
            }else if(this._input && this._input["l"]){
                // this._kick_right.play(false);
            }
            else if(this._input && this._input["n"]){
                // this.attack_melee_left.play(false);
            }
            else if(this._input && this._input["m"]){
                // this.attack_melee_right.play(false);
            }
        });
    }
    private async _setPhysics(){
        const physics = new CannonJSPlugin(null, 10, CANNON);
        this._scene.enablePhysics(new Vector3(0, -9.8, 0), physics);
        var newTimeStep = 1 / 30;
        this._scene.getPhysicsEngine().getPhysicsPlugin().setTimeStep(newTimeStep);
    }
    
    private _createAnimationLabel(animations:Array<AnimationGroup>){
        const div = document.createElement("div");
        div.style.position = "fixed";
        div.style.display="flex";
        div.style.flexWrap="wrap";
        div.style.minHeight="300px";
        div.style.maxHeight="300px";
        div.style.overflow = "auto";
        div.style.maxWidth = "500px";
        div.style.minWidth = "500px";
        div.style.left="10px";
        div.style.top = "10px";
        div.style.background="pink";

        document.body.appendChild(div);

        animations.forEach(animation=>{
            const div_ = document.createElement("div");
            div_.style.margin="10px";
            div_.style.cursor = "pointer";

            div_.innerText = animation.name;
            div.appendChild(div_);

            div_.addEventListener("pointerdown",(event)=>{
                animation.play(true);
            });
            if(animation.name === 'Walking_B'){
                this._walk = animation;
            }
        })
    }
    private async _createPhysicsWorld():Promise<void>{
        const ground = MeshBuilder.CreateGround("ground",{width:45,height:46},this._scene);
        const mtl = new StandardMaterial("ground",this._scene);
        mtl.diffuseColor = new Color3(0.3,0.4,0.5);
        mtl.backFaceCulling = false;
        ground.material = mtl;

        const scaling = 1;
        ground.physicsImpostor = new PhysicsImpostor(ground,PhysicsImpostor.BoxImpostor,{
            mass:0,
            restitution:3,
            friction:3,
        });

        const env = await SceneLoader.ImportMeshAsync(
            null,
            "./dungeon/scene/",
            "scene_002.glb",
            this._scene
        );

        const result = await SceneLoader.ImportMeshAsync(
            null, 
            ASSETS_PATH_MODELS, 
            "Knight.glb",
        this._scene);

        const root = result.meshes[0] as Mesh;

        // root.scaling.setAll(scaling);
        this._player = root;

        const animations = result.animationGroups;

        this._createAnimationLabel(animations);

        const result_enemy = await SceneLoader.ImportMeshAsync(null,
            "./dungeon/models/",
            "boy.glb",
            this._scene);
        const enemy = result_enemy.meshes[0];

        enemy.rotationQuaternion = new Quaternion(0,0,0,0);

        enemy.position = this._scene.getTransformNodeById("enemy_001").getAbsolutePosition();
        enemy.scaling.setAll(2);

        // this._scene.stopAllAnimations();
    }

    private _createInputMap(){
        this._input = {};

        this._scene.actionManager = new ActionManager(this._scene);

        this._scene.actionManager.registerAction(new ExecuteCodeAction(
            ActionManager.OnKeyDownTrigger, (evt) =>{
            this._input[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        this._scene.actionManager.registerAction(new ExecuteCodeAction(
            ActionManager.OnKeyUpTrigger, (evt) =>{
            this._input[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

    }

    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}


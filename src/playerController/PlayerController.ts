import { AbstractMesh, ActionManager, 
    AnimationGroup, ArcRotateCamera, AxesViewer, Color3, 
    Color4, Engine, ExecuteCodeAction, 
    HemisphericLight, Mesh, MeshBuilder, ParticleSystem, 
    Quaternion, 
    Scene, SceneLoader, StandardMaterial,TransformNode, 
    UniversalCamera, Vector3, _PrimaryIsoTriangle } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
export default class PlayerController{
    _engine:Engine;
    _scene:Scene;
    _emitter:Mesh;
    _rocket:ParticleSystem;

    _camera:UniversalCamera;
    _camRoot:TransformNode;
    _yTilt:TransformNode;

    private _animations:{};
    private _player:AbstractMesh;

    private _inputMap:{};
    private _curAnim:AnimationGroup = null;

    private _preAnim:AnimationGroup = null;

    private static readonly ANIMATION_NAME:Array<string>= ["Samba","Idle","Walking","WalkingBack"];

    private static readonly PLAYER_MOVEMENT_SPEED:number = 0.04;
    private static readonly PLAYER_ROTATION_SPEED:number = 0.006;
    private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.5934119456780721, 0, 0);
    // private static readonly ORIGINAL_TILT: Vector3 = new Vector3(Math.PI/4.0, 0, 0);
    constructor(){
        this._animations = {};
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(canvas);
        this._scene = new Scene(this._engine);

        this._scene.clearColor = new Color4(1,1,1,0.2);

        this._scene.actionManager = new ActionManager(this._scene);

        const light = new HemisphericLight("light",new Vector3(1,1,1),this._scene);

        this._inputMap = {};

        new AxesViewer(this._scene,4);

        const ground = MeshBuilder.CreateGround("ground",{width:30,height:30},this._scene);
        // ground.position.y = -2;
        const mtl = new StandardMaterial("ground",this._scene);
        mtl.diffuseColor = new Color3(0.3,0.4,0.5);
        mtl.backFaceCulling = false;
        ground.material = mtl;

        this.loadCharacter();
        
        this.inputController();

        this._main();

        this._scene.registerBeforeRender(()=>{
            this._updateCamera();
        });

        window.addEventListener("resize",(evt)=>{
            this._engine.resize();
        });
    }
    
    private _setupPlayerCamera(){
        this._camRoot = new TransformNode("root",this._scene);
        this._camRoot.position = new Vector3(0,0,0);
        this._camRoot.rotation = new Vector3(0,Math.PI,0);
        // this._camRoot.rotationQuaternion = new Quaternion(0,Math.PI,0);
        //
        let yTilt = new TransformNode("ytilt");
        yTilt.rotation = PlayerController.ORIGINAL_TILT;
        yTilt.parent = this._camRoot;
        this._yTilt = yTilt;

        // our actual camera that's pointing at our root's position
        this._camera = new UniversalCamera("cam", new Vector3(0, 0, -20), this._scene);
        this._camera.lockedTarget = this._camRoot.position;
        this._camera.fov = 0.47350045992678597;
        this._camera.parent = yTilt;

        this._scene.activeCamera = this._camera;
    }

    private _updateCamera(){
        if(this._player){
            const pos = this._player.position;
            const end_pos = new Vector3(pos.x-2,pos.y + 1, pos.z - 2);
            this._camRoot.position = Vector3.Lerp(this._camRoot.position,end_pos,0.4);
        }
    }
    /**
     * 
     * 加载player model 和 动画
     * 
     */
    private async loadCharacter(){
        const result = await SceneLoader.ImportMeshAsync(null,
        "/models/",
        "HVGirl.glb",this._scene);

        this._player = result.meshes[0];

        this._player.scaling.setAll(0.1);

        this.loadAnimations();
        this._setUpAnimations();
    }
    private loadAnimations(){
        for(let name of PlayerController.ANIMATION_NAME){
            const animation = this._scene.getAnimationGroupByName(name);
            this._animations[name] = animation;
        }
    }

    private inputController(){
        this._scene.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnKeyDownTrigger,(evt)=>{
                this._inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
            })
        );

        this._scene.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnKeyUpTrigger,(evt)=>{
            this._inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
        }))
    }

    private _setUpAnimations(): void {

        this._scene.stopAllAnimations();
        this._animations['Walking'].loopAnimation = true;
        this._animations['WalkingBack'].loopAnimation = true;
        this._animations['Idle'].loopAnimation = true;

        //initialize current and previous
        this._curAnim = this._animations['Idle'];
        this._preAnim = null;
    }
    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
        this._setupPlayerCamera();

        this._scene.onBeforeRenderObservable.add(()=>{
            if(this._inputMap['w']){
                this._curAnim = this._animations['Walking'] as AnimationGroup;
                const speed = this._player.forward.scaleInPlace(PlayerController.PLAYER_MOVEMENT_SPEED);
                this._player.moveWithCollisions(speed);
            }else if(this._inputMap['s']){
                // this._curAnim = this._animations["WalkingBack"] as AnimationGroup;
                const speed = this._player.forward.scaleInPlace(-PlayerController.PLAYER_MOVEMENT_SPEED);
                this._player.moveWithCollisions(speed);
            }else if(this._inputMap['a']){
                // this._curAnim = this._animations["Samba"] as AnimationGroup;
                const rotation_speed = PlayerController.PLAYER_ROTATION_SPEED * (-1);
                this._player.rotate(Vector3.Up(),rotation_speed);
                this._camRoot.rotate(Vector3.Up(),rotation_speed);   
            }else if(this._inputMap['d']){
                const rotation_speed = PlayerController.PLAYER_ROTATION_SPEED;
                this._player.rotate(Vector3.Up(),rotation_speed);
                this._camRoot.rotate(Vector3.Up(),rotation_speed);

            }
            if(!this._curAnim){
                return;
            }
            if(!this._preAnim){
                this._curAnim.play(this._curAnim.loopAnimation);
                this._preAnim = this._curAnim;
                return;
            }
            if(this._preAnim != null && this._preAnim != this._curAnim){
                this._preAnim.stop();
                this._curAnim.play(this._curAnim.loopAnimation);

                this._preAnim = this._curAnim;
            }
        })
    }
}
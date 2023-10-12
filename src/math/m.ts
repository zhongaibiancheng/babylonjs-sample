import { AbstractMesh, ActionManager, 
    AnimationGroup, ArcRotateCamera, AxesViewer, Bone, Color3, 
    Color4, Engine, ExecuteCodeAction, 
    HemisphericLight, Material, Matrix, Mesh, MeshBuilder, ParticleSystem, 
    PointLight, 
    Quaternion, 
    Ray, 
    Scene, SceneLoader, ShadowGenerator, StandardMaterial,TransformNode, 
    UniversalCamera, Vector3, _PrimaryIsoTriangle } from "@babylonjs/core";
import { renderableTextureFormatToIndex } from "@babylonjs/core/Engines/WebGPU/webgpuTextureHelper";
import "@babylonjs/loaders/glTF";
import { Inspector } from '@babylonjs/inspector';

export default class Mat{
    _engine:Engine;
    _scene:Scene;
    _emitter:Mesh;
    _camera:ArcRotateCamera;

    private _animations:{};
    private _player:AbstractMesh;

    private _inputMap:{};

    private _weaponsMap:{};


    private _sword:AbstractMesh;

    private _curAnim:AnimationGroup = null;

    private _preAnim:AnimationGroup = null;

    private _shadowGenerator:ShadowGenerator;

    private static readonly ANIMATION_NAME:Array<string>= ["Die","idle","run","walking","kick"];

    private static readonly WEAPONS:Array<string> = ["sword"];

    private static readonly PLAYER_MOVEMENT_SPEED:number = 0.02;
    private static readonly PLAYER_ROTATION_SPEED:number = 0.01;
    private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.5934119456780721, 0, 0);

    private static readonly GRAVITY:Vector3 = new Vector3(0,-0.098,0);

    _rightArmBone:Bone;
    constructor(){
        Engine.CollisionsEpsilon = 0.00005;

        this._animations = {};
        this._weaponsMap = {};
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(canvas);
        this._scene = new Scene(this._engine);

        this._scene.collisionsEnabled = true;

        // this._scene.clearColor = new Color4(1,1,1,0.2);
        this._scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098); // a color that fit the overall color scheme better

        this._scene.actionManager = new ActionManager(this._scene);

        const light1 = new HemisphericLight("light",new Vector3(1,1,1),this._scene);

        this._inputMap = {};
        new AxesViewer(this._scene,4);

        const ground = MeshBuilder.CreateGround("ground",{width:30,height:30},this._scene);
        // ground.position.y = -2;
        const mtl = new StandardMaterial("ground",this._scene);
        mtl.diffuseColor = new Color3(0.3,0.4,0.5);
        mtl.backFaceCulling = false;
        ground.material = mtl;

        ground.checkCollisions = true;

        this._setupPlayerCamera();
        this._main();

        window.addEventListener("resize",(evt)=>{
            this._engine.resize();
        });


        const colors = [
            new Color4(1,0,0,1),
            new Color4(0,1,0,1),
            new Color4(0,0,1,1),
            new Color4(1,1,0,1),
            new Color4(0,1,1,1),
            new Color4(1,0,1,1),

        ];
        const cube = MeshBuilder.CreateBox("box1",{
            faceColors:colors},this._scene);

            cube.position.y = 2;

        const cube2 = cube.clone();
        cube2.position.x = 4;

        cube2.scaling.setAll(1.5);

cube.scaling.setAll(3);
cube.rotation.y = Math.PI/4.0;

        cube.computeWorldMatrix(true);
        const m = cube.getWorldMatrix();
        const scale = new Vector3();
        const rotation = new Quaternion();
        const position = new Vector3();

        m.decompose(scale,rotation,position);

        console.log(scale,rotation,position);

        // const mx =  Matrix.RotationX(Math.PI/2.0);
        // const my = Matrix.RotationY(Math.PI/2.0);

        // const matrix = my.multiply(mx);

        // const scale = new Vector3();
        // const rotation = new Quaternion();
        // const position = new Vector3();

        // matrix.decompose(scale,rotation,position);

        // console.log(scale,rotation,position);
        // matrix.decomposeToTransformNode(cube);
    }
    
    private _setupPlayerCamera(){
        this._camera = new ArcRotateCamera(
            "arcrotatecamera",
        Math.PI/2.0,
        Math.PI/2.0,
        2,
        Vector3.Zero(),
        this._scene);
        this._camera.attachControl(true);
    }

    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}
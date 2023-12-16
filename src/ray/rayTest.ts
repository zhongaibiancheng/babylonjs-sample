import { AbstractMesh, ActionManager, 
    AnimationGroup, ArcRotateCamera, AxesViewer, Bone, Color3, 
    Color4, Engine, ExecuteCodeAction, 
    HemisphericLight, Material, Matrix, Mesh, MeshBuilder, ParticleSystem, 
    PointLight, 
    Quaternion, 
    Ray, 
    RayHelper, 
    Scene, SceneLoader, ShadowGenerator, StandardMaterial,TransformNode, 
    UniversalCamera, Vector3, _PrimaryIsoTriangle } from "@babylonjs/core";
import { renderableTextureFormatToIndex } from "@babylonjs/core/Engines/WebGPU/webgpuTextureHelper";
import "@babylonjs/loaders/glTF";
import { Inspector } from '@babylonjs/inspector';

/**
 * 
 * 用照相机的朝向和 位置 来分别用ray来测试是否遮挡，发现
 * 结果一致。但是为什么用UniversalCamera来测试不正确呢？
 * 用ArcRotateCamera来测试是正确的。
 * 
 */
export default class RayTest{
    _engine:Engine;
    _scene:Scene;
    _emitter:Mesh;
    // _camera:ArcRotateCamera;
    _camera:UniversalCamera;

    _wall:Mesh;
    constructor(){
        Engine.CollisionsEpsilon = 0.00005;

        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(canvas);
        this._scene = new Scene(this._engine);

        this._scene.collisionsEnabled = true;

        // this._scene.clearColor = new Color4(1,1,1,0.2);
        this._scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098); // a color that fit the overall color scheme better

        this._scene.actionManager = new ActionManager(this._scene);

        const light1 = new HemisphericLight("light",new Vector3(1,1,1),this._scene);

        new AxesViewer(this._scene,4);

        const ground = MeshBuilder.CreateGround("ground",{width:30,height:30},this._scene);
        // ground.position.y = -2;
        const mtl = new StandardMaterial("ground",this._scene);
        mtl.diffuseColor = new Color3(0.3,0.4,0.5);
        mtl.backFaceCulling = false;
        ground.material = mtl;

        ground.checkCollisions = true;

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

        this._setupPlayerCamera();
        this._main();

        window.addEventListener("resize",(evt)=>{
            this._engine.resize();
        });

        
        this._createWall();

        this._scene.registerBeforeRender(()=>{
            /**
             * 用照相机的朝向来判断是否有遮挡
             */
            // const ray = this._camera.getForwardRay(60);
            // // const helper = new RayHelper(ray);
    
            // // helper.show(this._scene);
            // const pickInfo = this._scene.pickWithRay(ray);
            // if(pickInfo.hit && pickInfo.pickedMesh && 
            //     pickInfo.pickedMesh.name !== "ground" &&
            //     pickInfo.pickedMesh.name !== "box1"){
            //     console.log(pickInfo.pickedMesh);
            //     console.log("被遮盖");
            // }else{
            //     console.log("没有被遮盖");
            // }


            /**
             * 
             * 用照相机的位置和box1的位置，用ray来判断是否有遮挡
             */
            console.log(this._camera.rotation,this._camera.rotationQuaternion);
            const camera_pos = this._camera.position.clone();
            const box1_pos = this._scene.getMeshById("box1").position.clone();

            const direction = box1_pos.subtract(camera_pos).normalize();
            const ray = new Ray(camera_pos,direction);

            const helper = new RayHelper(ray);
            helper.show(this._scene);
            const pickInfo = this._scene.pickWithRay(ray);
            if(pickInfo.hit && pickInfo.pickedMesh && 
                pickInfo.pickedMesh.name !== "ground" &&
                pickInfo.pickedMesh.name !== "box1"){
                // console.log(pickInfo.pickedMesh);
                // console.log("被遮盖");
            }else{
                // console.log("没有被遮盖");
            }
        })
    }
    
    private _createWall(){
        const wall = MeshBuilder.CreatePlane("wall",{size:10,width:10,height:10},this._scene);
        wall.rotation.x += Math.PI;
        wall.rotation.y += Math.PI/4;

        wall.position = new Vector3(5*Math.sqrt(2),5,5*Math.sqrt(2));

        const w = wall.clone();
        w.rotation.x += Math.PI;
        w.position = new Vector3(-5*Math.sqrt(2),5,-5*Math.sqrt(2));

    }
    private _setupPlayerCamera(){
        // this._camera = new ArcRotateCamera(
        //     "arcrotatecamera",
        // Math.PI/2.0,
        // Math.PI/2.0,
        // 2,
        // Vector3.Zero(),
        // this._scene);
        // this._camera.attachControl(true);

        this._camera = new UniversalCamera("camera",new Vector3(35,30,35),this._scene);
        this._camera.lockedTarget = this._scene.getMeshById("box1").position;

        this._camera.attachControl(true);
    }

    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}
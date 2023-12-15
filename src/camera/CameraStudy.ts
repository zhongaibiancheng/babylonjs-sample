import { ArcRotateCamera, Color3, Color4, Engine, FollowCamera, HemisphericLight, Mesh, MeshBuilder, ParticleSystem, prepareStringDefinesForClipPlanes, Scene, StandardMaterial, Texture, Vector3, Vector4, _PrimaryIsoTriangle, ActionManager, ExecuteCodeAction } from "@babylonjs/core";

export default class CameraStudy{
    _engine:Engine;
    _scene:Scene;
    _emitter:Mesh;
    _rocket:ParticleSystem;

    constructor(){
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(canvas);
        this._scene = new Scene(this._engine);

        const light = new HemisphericLight("light",new Vector3(1,1,1),this._scene);

        const ground = MeshBuilder.CreateGround("ground",{width:15,height:16},this._scene);
        ground.position.y = -2;
        const mtl = new StandardMaterial("ground",this._scene);
        mtl.diffuseColor = new Color3(0.3,0.4,0.5);
        mtl.backFaceCulling = false;
        ground.material = mtl;
        const mesh = MeshBuilder.CreateBox("box");
        mesh.position.y = 1;

        // Parameters: name, position, scene
        const camera = new FollowCamera("FollowCam", 
        new Vector3(0, 10, -10), this._scene);

        // The goal distance of camera from target
        camera.radius = 30;

        // The goal height of camera above local origin (centre) of target
        camera.heightOffset = 10;

        // The goal rotation of camera around local origin (centre) of target in x y plane
        camera.rotationOffset = 0;

        // Acceleration of camera in moving from current to goal position
        camera.cameraAcceleration = 0.005;

        // The speed at which acceleration is halted
        camera.maxCameraSpeed = 10;

        // This attaches the camera to the canvas
        // camera.attachControl(true);

        // NOTE:: SET CAMERA TARGET AFTER THE TARGET'S CREATION AND NOTE CHANGE FROM BABYLONJS V 2.5
        // targetMesh created here.
        camera.target = mesh.position; // version 2.4 and earlier
        camera.lockedTarget = mesh; //version 2.5 onwards

        // this._scene.onBeforeRenderObservable.add(()=>{
        //     mesh.rotation.y += .01;
        //     mesh.rotation.z += 0.01;
        // });
        this._main();
    }
    
    _main():void{
        const paper = MeshBuilder.CreateBox("paper",{
            size:0.3,
            width:0.3,
            height:0.3},
            this._scene);
        // paper.position = this._scene.getTransformNodeByName("paper_pos").getAbsolutePosition();

        paper.actionManager = new ActionManager(this._scene);
        paper.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger,()=>{
            this._showDialogue();
        }));

        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
    private _showDialogue(){
        var modal = document.querySelector(".modal");
        console.log(modal);
        modal.classList.toggle("show-modal");
    }
}
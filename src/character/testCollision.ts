import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, Mesh, MeshBuilder, ParticleSystem, prepareStringDefinesForClipPlanes, Scene, StandardMaterial, Texture, Vector3, Vector4, _PrimaryIsoTriangle, ActionManager, ExecuteCodeAction } from "@babylonjs/core";

export default class TestCollision{
    _engine:Engine;
    _scene:Scene;
    _emitter:Mesh;
    _rocket:ParticleSystem;

    constructor(){
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(canvas);
    
        this._scene = new Scene(this._engine);

        const light = new HemisphericLight("light",new Vector3(0,1,1),this._scene);

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
        //relese keyboard
        camera.inputs.attached.keyboard.detachControl();

        const ground = MeshBuilder.CreateGround("ground",{width:15,height:16},this._scene);
       ground.checkCollisions = true;
        const roof = MeshBuilder.CreateGround("roof",{width:4,height:4},this._scene);
        roof.position.y = 0.5;
        roof.checkCollisions = true;

        const mesh = MeshBuilder.CreateBox("box");

        const material = new StandardMaterial("box_b",this._scene);
        material.backFaceCulling = true;
        material.diffuseColor = new Color3(0,0,1);

        mesh.material = material;
        mesh.scaling.setAll(0.2);
        mesh.position.y = 0.1;
mesh.position.x = -5;
        roof.material = material;

        this._scene.actionManager = new ActionManager(this._scene);
        
        // this.createObstacts();
        this._scene.actionManager.registerAction(
            new ExecuteCodeAction(
                ActionManager.OnKeyDownTrigger, (evt) => {
                    if(evt.sourceEvent.key == 'ArrowUp'){
                        let dir = mesh.forward;
                        dir.scaleInPlace(0.5);
                        mesh.moveWithCollisions(dir);

                    }else if(evt.sourceEvent.key == 'ArrowLeft'){
                        mesh.rotation.y += Math.PI/4.0;
                    }else if(evt.sourceEvent.key == 'ArrowRight'){
                        mesh.rotation.y -= Math.PI/4.0;
                    }else if(evt.sourceEvent.key == 'ArrowDown'){
                        let dir = mesh.forward.scale(-1);
                        dir.scaleInPlace(0.5);
                        mesh.moveWithCollisions(dir);
                    }
                    
                }
            )
        );
        this._main();
    }
    
    createObstacts(){
        for(let i=0;i<4;i++){
            const height = Math.random();
            const box = MeshBuilder.CreateBox("box-"+i,{
                size:Math.random(),
                height:height,
                width:Math.random()
            },this._scene);
            box.position.set(
                Math.random(),
                height/2.0,
            Math.random());

            box.checkCollisions = true;
        }
    }
    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}
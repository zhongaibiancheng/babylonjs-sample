import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, Mesh, MeshBuilder, ParticleSystem, prepareStringDefinesForClipPlanes, Scene, StandardMaterial, Texture, Vector3, Vector4, _PrimaryIsoTriangle } from "@babylonjs/core";

export default class First{
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
        
        this._main();
    }
    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}
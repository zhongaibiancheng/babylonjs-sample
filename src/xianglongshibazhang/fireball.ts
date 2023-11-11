
import { ArcRotateCamera, AxesViewer, Color3, Color4, 
    Engine, HemisphericLight, Mesh, MeshBuilder,
     ParticleSystem, 
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

        this._loadCharacter();
        this._createWeapon();

        this._main();
        
        this._scene.onPointerObservable.add(()=>{
            const originalFacing = new Vector3(0, 0, 1);
            const facing = Vector3.TransformCoordinates(
                originalFacing, 
                this._player.getWorldMatrix().getRotationMatrix());
            facing.normalize();

            const f = facing.scaleInPlace(10);
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
        police.position.x = 5;
        police.position.z = 5;
    }
    private _createWeapon(){
        this._ball = MeshBuilder.CreateSphere("ball",{
            diameter:0.2,segments:32});
        this._ball.position.y = 2;
    }
    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}


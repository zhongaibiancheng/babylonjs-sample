
import { ArcRotateCamera, AxesViewer, Color3, Color4, 
    Engine, HemisphericLight, Mesh, MeshBuilder,
     ParticleSystem, 
     Scene, SceneLoader, StandardMaterial, Texture, TextureUsage, Vector3,
      VertexData,
      _PrimaryIsoTriangle } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

export default class Test{
    _engine:Engine;
    _scene:Scene;
    _emitter:Mesh;

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
        
        const axis =  new AxesViewer(this._scene, 10);

        this._createCustomMesh();
        this._main();
    }

    _createCustomMesh(){
        const box1 = MeshBuilder.CreateBox("box",{},this._scene);
        box1.position.y = 0.5;
        box1.position.x = 4;

        const  sphere = MeshBuilder.CreateSphere("sphere",{segments:32,diameter:2},this._scene);
        sphere.position.x = 0;
        sphere.position.y = 5;

        sphere.parent = box1;

        box1.rotation.x += Math.PI/4.0;

        box1.computeWorldMatrix(true);
        sphere.computeWorldMatrix(true);
        console.log(sphere.position,sphere.getAbsolutePosition());
        // console.log(sphere.rotation);
        console.log(box1.position,box1.getAbsolutePosition());
    }
    
    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}


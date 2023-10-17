import { ArcRotateCamera, AxesViewer, Color3, Color4, 
    Engine, HemisphericLight, Mesh, MeshBuilder,
     ParticleSystem, 
     Scene, StandardMaterial, Texture, TextureUsage, Vector3,
      VertexData,
      _PrimaryIsoTriangle } from "@babylonjs/core";

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
        const mesh = new Mesh("custom",this._scene);
        const positions = [-5, 2, -3, -7, -2, -3, -3, -2, -3];// 5, 2, 3, 7, -2, 3, 3, -2, 3];
        const indices = [0,1,2]//3,4,5];

        const vertexData = new VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;

        var colors = [
            1, 0, 0, 1, 
            1, 0, 0, 1, 
            1, 0, 0, 1];

            // 0, 0, 1, 1, 
            // 0, 0, 1, 1, 
            //  0, 0, 1, 1]; //color array added
        var normals = [];
        const uvs=[0.5,1,0,0,1,0];
        // vertexData.colors = colors;
        VertexData.ComputeNormals(positions,indices,normals);

        vertexData.normals = normals;

        const texture = new Texture("http://i.imgur.com/JbvoYlB.png",this._scene);
        const mat = new StandardMaterial("mat",this._scene);
        mat.diffuseTexture = texture;

        mesh.material = mat;

        vertexData.uvs = uvs;
        vertexData.applyToMesh(mesh);

        // const mat = new StandardMaterial("mat",this._scene);
        // mat.backFaceCulling = false;

        // mesh.material = mat;
        
    }
    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}
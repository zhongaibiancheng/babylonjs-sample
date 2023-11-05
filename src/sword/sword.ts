
import { ArcRotateCamera, AxesViewer, Color3, Color4, 
    Engine, HemisphericLight, Mesh, MeshBuilder,
     ParticleSystem, 
     Scene, SceneLoader, StandardMaterial, Texture, TextureUsage, Vector3,
      VertexData,
      _PrimaryIsoTriangle } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

export default class Sword{
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

        // this._createCustomMesh();
        this._loadSword();
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
    private _loadSword(){
        // SceneLoader.ImportMesh("", "https://dl.dropbox.com/s/8nrso6rk52a8aim/", "character1.glb", this._scene, (meshes, particleSystem, skeletons) => {
        //     meshes[0].scaling = new Vector3(0.7, 0.7, 0.7);
        //     // SceneLoader.ImportMesh("", "https://dl.dropbox.com/s/x9prer72vjkqskj/", "scene%20%283%29.glb", this._scene, (weaponMeshes) => {
        //     //     // The weapon model is from https://sketchfab.com/Airsoftaaja

        //     //     weaponMeshes[0].scaling = new Vector3(0.01, 0.01, 0.01);
        //     //     let handBone = skeletons[0].bones.filter(bone => bone.name === "hand.R")[0];
        //     //     weaponMeshes[0].attachToBone(handBone,undefined);
        //     // });
        //     SceneLoader.ImportMesh("", "./models/", "sword.glb", this._scene, (weaponMeshes) => {
        //     // The weapon model is from https://sketchfab.com/Airsoftaaja
        //     weaponMeshes[0].scaling.scaleInPlace(0.1);
        //     let handR = this._scene.transformNodes.find(node => node.name === "hand.R");
        //     weaponMeshes[0].parent = handR;
        // });
        // });

        const result =  SceneLoader.ImportMesh(
            "",
            "./models/", "girl.glb",this._scene,(girl)=>{
                
            });
    }
    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}


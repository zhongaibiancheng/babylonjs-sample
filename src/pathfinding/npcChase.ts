import { ArcRotateCamera, AxesViewer, Color3, 
    Color4, Engine,
    HemisphericLight, MeshBuilder, 
    Scene, SceneLoader, StandardMaterial,TransformNode, 
    Vector3, _PrimaryIsoTriangle } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

import NPC from './npc';
export default class NPChase{
    _engine:Engine;
    _scene:Scene;

    _camera:ArcRotateCamera;

    canvas:HTMLCanvasElement;
    _player:any;
    staticMeshes:any;
    
    constructor(){
        Engine.CollisionsEpsilon = 0.00005;

        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(this.canvas);
        this._scene = new Scene(this._engine);

        this._scene.collisionsEnabled = true;

        this._scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098); // a color that fit the overall color scheme better

        const light1 = new HemisphericLight("light",new Vector3(1,1,1),this._scene);

        new AxesViewer(this._scene,4);

        this._setupPlayerCamera();

        this.staticMeshes = this._createStaticMeshes();
        this.loadCharacter().then(()=>{
            this._loadNPC();
        });
        this._main();
        window.addEventListener("resize",(evt)=>{
            this._engine.resize();
        });
    }
    
    private async _loadNPC(){
        const result = await SceneLoader.ImportMeshAsync(null,
            "/models/",
            "police_walking.glb",this._scene);
    
        const axes = new AxesViewer(this._scene,1);
        const npc = result.meshes[0];

        npc.position = new Vector3(5,0,5);

        axes.xAxis.parent = npc;
        axes.yAxis.parent = npc;
        axes.zAxis.parent = npc;
        npc.rotationQuaternion = null;

        const result_thief = await SceneLoader.ImportMeshAsync(null,
            "/models/thief/",
            "scene.gltf",this._scene);
    
        const axes_thief = new AxesViewer(this._scene,1);
        const npc_thief = result_thief.meshes[0];
        npc_thief.scaling.setAll(0.4);
        npc_thief.position = new Vector3(-4,0,-7);

        axes_thief.xAxis.parent = npc_thief;
        axes_thief.yAxis.parent = npc_thief;
        axes_thief.zAxis.parent = npc_thief;
        npc_thief.rotationQuaternion = null;

        let meshes = [];
        meshes.push(npc);
        meshes.push(npc_thief);

        const result_wazowski = await SceneLoader.ImportMeshAsync(null,
            "/models/wazowski/",
            "scene.gltf",this._scene);
    
        const axes_wazowski = new AxesViewer(this._scene,1);
        const npc_wazowski = result_wazowski.meshes[0];
        npc_wazowski.scaling.setAll(0.2);
        npc_wazowski.position = new Vector3(-4,0,8);

        axes_wazowski.xAxis.parent = npc_wazowski;
        axes_wazowski.yAxis.parent = npc_wazowski;
        axes_wazowski.zAxis.parent = npc_wazowski;

        npc_wazowski.rotationQuaternion = null;
        npc_wazowski.rotation.y += Math.PI;

        meshes.push(npc_wazowski);

        for(let i=0;i<15;i++){
            const c = MeshBuilder.CreateBox("box-npc-"+i);
            c.scaling.setAll(0.5);
            c.position = new Vector3(Math.random()*10,0.5,Math.random()*13);
            meshes.push(c);
        }
        const npc_controller = new NPC(this._scene,meshes,this.staticMeshes);
    }

    private _createStaticMeshes(){
        const meshes = [];
        const ground = MeshBuilder.CreateGround("ground",{width:30,height:30},this._scene);
        // ground.position.y = -2;
        const mtl = new StandardMaterial("ground",this._scene);
        mtl.diffuseColor = new Color3(0.3,0.4,0.5);
        mtl.backFaceCulling = false;
        ground.material = mtl;

        ground.checkCollisions = true;

        meshes.push(ground);

        for(let i=0;i<4;i++){
            const plant = MeshBuilder.CreateBox(
                "plant-"+i,
            {
                width:1,
                height:4,
                depth:1
            },
            this._scene
            )
            plant.position = new Vector3(i*4 - 10,2,0);

            meshes.push(plant);
        }

        return meshes;
    }
    
    private _setupPlayerCamera(){
        this._camera = new ArcRotateCamera(
            "arcrotatecamera",
        Math.PI/2.0,
        Math.PI/2.0,
        30,
        Vector3.Zero(),
        this._scene);
        this._camera.position.set(10,20,-10);
        this._camera.attachControl(true);
    }

    /**
     * 
     * 加载player model 和 动画
     * 
     */
    private async loadCharacter(){
        const result = await SceneLoader.ImportMeshAsync(null,
        "/models/",
        "player.glb",this._scene);

        const player = result.meshes[0];

        player.getChildMeshes().forEach((child)=>{
            child.isPickable = false;
            child.checkCollisions = false;
        });
        
        player.scaling.setAll(0.7);
        this._player = player;
        this._player.rotationQuaternion = null;

        const outer = MeshBuilder.CreateBox("outer",{
            width: 2,
            depth: 1, 
            height: 3 
        },this._scene);
        this._player.parent = outer;
        outer.position = new Vector3(0,0,0);
        outer.isVisible = false;
    }
    
    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}
import {
    ArcRotateCamera, AxesViewer, Color3, 
    Color4, Engine, 
    HemisphericLight, MeshBuilder,
    PointerEventTypes, 
    RecastJSPlugin, 
    Scene, SceneLoader,  StandardMaterial,TransformNode, 
    Vector3, _PrimaryIsoTriangle } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

import * as Recast from "recast-detour";

export default class PathFinding{
    _engine:Engine;
    _scene:Scene;

    _camera:ArcRotateCamera;

    canvas:HTMLCanvasElement;
    _player:any;

    constructor(){
        Engine.CollisionsEpsilon = 0.00005;

        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(this.canvas);
        this._scene = new Scene(this._engine);

        this._scene.collisionsEnabled = true;

        this._scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098); // a color that fit the overall color scheme better

        const light1 = new HemisphericLight("light",new Vector3(1,1,1),this._scene);

        new AxesViewer(this._scene,4);

        const ground = MeshBuilder.CreateGround("ground",{width:30,height:30},this._scene);
        // ground.position.y = -2;
        const mtl = new StandardMaterial("ground",this._scene);
        mtl.diffuseColor = new Color3(0.3,0.4,0.5);
        mtl.backFaceCulling = false;
        ground.material = mtl;

        ground.checkCollisions = true;

        this._setupPlayerCamera();

        this.loadCharacter().then(()=>{
        });

        this._loadNPC();

        this._main();
        window.addEventListener("resize",(evt)=>{
            this._engine.resize();
        });
    }
    
    private async _loadNPC(){
        //加载npc
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

            this._scene.onPointerObservable.add(pointerInfo=>{
                switch(pointerInfo.type){
                    case PointerEventTypes.POINTERDOWN:
                    //delete lines
                    const line = this._scene.getMeshByName("lines");
                    if(line){
                        this._scene.removeMesh(line);
                    }
                    //存储精灵和npc的位置，为了绘制线
                    const pos_npc = npc.position;
                    const pos_player = this._player.position;
                    const myPoints = [
                        pos_npc,
                        pos_player
                    ];
                        
                    const lines = MeshBuilder.CreateLines("lines", {points: myPoints});

                    //计算npc到精灵的指向 vector3
                    const vec3 = pos_player.subtract(pos_npc);
                    //normailize
                    let dir = vec3.normalize();
                    //计算xz平面上y轴的旋转角度
                    const angle = Math.atan2(dir.x,dir.z) + Math.PI;

                    //旋转精灵的y轴
                    npc.rotation.y = npc.rotation.y + (angle - npc.rotation.y )*0.1;

                    const pos = npc.position;
                    npc.position = pos.addInPlace(dir.scaleInPlace(0.4));
                    break;
                }
            })
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

    private _updateCamera(){

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
        
        this._player = player;
        this._player.rotationQuaternion = null;
    }
    
    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}
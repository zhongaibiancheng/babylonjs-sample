import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";

import * as CANNON from 'cannon-es'

import { 
    Scene, 
    Vector3, MeshBuilder, 
    Matrix,
    Quaternion,
    SceneLoader,
    PhysicsImpostor,
    CannonJSPlugin,
    Texture,
    StandardMaterial,
    DynamicTexture,
    Color4,
    Color3} from "@babylonjs/core";
import FireBall from "../weapon/fireball";
import { CustomMaterial } from "@babylonjs/materials";

/**资源文件目录 */
//scene 资源
const ASSETS_PATH = "./dungeon/scene/";
const ASSETS_PATH_MODELS = "./dungeon/models/";

export default class Environment{
    private _scene:Scene;

    constructor(){

    }
    public setScene(scene:Scene){
        this._scene = scene;
    }

    private async _setPhysics(){
        window.CANNON = CANNON;
        const physics = new CannonJSPlugin();
        this._scene.enablePhysics(new Vector3(0,-9.8,0),physics);
    }

    public async load(level:number=0){//默认演示
        const assets = await this._loadAssets(level);
        assets.allMeshes.forEach((child)=>{
            child.receiveShadows = true;
            child.checkCollisions = true;
        });

        this._createBlackboard();
    }

    private _createBlackboard(){
        // const blackboard = this._scene.getMeshByName("blackboard");
        const blackboard = MeshBuilder.CreatePlane("blackboard",{size:2,width:3.8,height:1.8},this._scene);
        // console.log(blackboard);

        blackboard.position = this._scene.getTransformNodeByName("blackboard_pos").getAbsolutePosition();
        // console.log(blackboard.position);
        const texture = new DynamicTexture("blackboard",{width:1024,height:512});

        blackboard.rotation.y += Math.PI;
        texture.update();

        const blackboard_material = new CustomMaterial("blackboard_material",this._scene);
        blackboard_material.diffuseTexture = texture;
        // blackboard_material.diffuseColor = new Color3(1,1,1);
        blackboard_material.diffuseTexture.hasAlpha = true;

        blackboard.material = blackboard_material;
        var font = "bold 64px monospace";
        texture.drawText("静夜思的作者是李白吗？", 50, 100, font, "black", "transparent", true, true);
    }
    /**
     * 加载各种3d model
     * @param level 
     * @returns 
     */
    private async _createScene(level:number=0){
        const scaling = 0.5;
        const allMeshes = [];
        const row = 5;
        const ground = MeshBuilder.CreatePlane("ground",{width:row,height:row},this._scene);
        const texture = new Texture("./dungeon/textures/stone_ground_1024x1024.png");
        const material = new StandardMaterial("ground_material",this._scene);
        material.diffuseTexture = texture;

        ground.material = material;

        ground.rotation.x = Math.PI/2.0;
        allMeshes.push(ground);

        const wall = MeshBuilder.CreateBox("wall",{width:1,height:1,size:1},this._scene);
        const texture_wall = new Texture("./dungeon/textures/red_brick_wall-512x512.png");
        const material_wall = new StandardMaterial("material_wall",this._scene);
        material_wall.diffuseTexture = texture_wall;

        wall.material = material_wall;
        allMeshes.push(wall);

        const map = this._createMap(5);

        const offsetZ = -(row)/2.0;
        const offsetX = -(row)/2.0;
        for(let i=0;i<map.length/scaling;i++){
            for(let j=0;j<map[i].length/scaling;j++){
                if(map[i][j] === 0){//0:wall
                    const wall_one = wall.clone();
                    wall_one.position.set(j+offsetX+0.5*scaling,0.5*scaling,i+offsetZ+0.5*scaling);
                }
            }
        }
        wall.dispose();
        return {
            allMeshes:allMeshes
        }
    }

    private async _loadAssets(level:number=0){
        let level_ = (level + 1) + "";
        
        level_ = level_.padStart(3,"0");
        console.log(`scene_${level_}.glb`);

        const result = await SceneLoader.ImportMeshAsync(
            "",
            ASSETS_PATH,
            `scene_${level_}.glb`);

        const env = result.meshes[0];

        const allMeshes = env.getChildMeshes();

        allMeshes.forEach(m=>{
            m.checkCollisions = true;
            m.receiveShadows = true;

            if(m.name.includes("wall_")){
                m.isVisible = true;
                m.checkCollisions = true;
            }

            if(m.name === 'ground'){
                m.isPickable = true;
                m.checkCollisions = true;

            }

            if(m.name.includes("collision")){
                m.isPickable = true;
                m.isVisible = false;
            }

            if(m.name.includes("Trigger")){
                m.isVisible = true;
                m.checkCollisions = false;
                m.isPickable = false;
            }

            //areas that will use box collisions
            if (m.name.includes("stairs") || m.name == "cityentranceground" || m.name == "fishingground.001" || m.name.includes("lilyflwr")) {
                m.checkCollisions = false;
                m.isPickable = false;
            }
        });

        return {
            env:env,
            allMeshes:allMeshes
        }
    }


    private _createMap(row:number):Array<Array<number>>{
        // const map = new Array<Array<number>>();
        
        // for(let i=0;i<row;i++){
        //     const row_data = [];
        //     for(let j=0;j<row;j++){
        //         row_data.push(Math.random()>0.5?0:1);
        //     }
        //     map.push(row_data);
        // }
        // return map;
        const map = [
            [0,0,0,0,0],
            [0,1,1,1,0],
            [0,1,1,1,0],
            [0,1,1,1,0],
            [0,0,1,0,0],
            ]
        return map;
    }
    /**
     * 
     * 加载人物和动画
     * 
     * @returns 
     * 
     */
    public async loadCharacterAssets():Promise<any>{
        //collision mesh
        const outer = MeshBuilder.CreateBox(
            "outer", 
            { 
                width: 0.8,
                depth: 0.7, 
                height: 1.3
            }, 
            this._scene);

        outer.scaling.setAll(0.5);
        outer.isVisible = true;
        outer.isPickable = false;
        outer.checkCollisions = true;

        //move origin of box collider to the bottom of the mesh (to match player mesh)
        outer.bakeTransformIntoVertices(Matrix.Translation(0, 0.7, 0))

        //for collisions
        outer.ellipsoid = new Vector3(1, 1.5, 1);
        outer.ellipsoidOffset = new Vector3(0, 1.5, 0);

        outer.rotationQuaternion = new Quaternion(0, 1, 0, 0);

        const result = await SceneLoader.ImportMeshAsync(
            null, 
            ASSETS_PATH_MODELS, 
            "player.glb", 
        this._scene);

        const root = result.meshes[0];
        root.scaling.setAll(.1);
        root.computeWorldMatrix();

        const animations = result.animationGroups;

        //body is our actual player mesh
        const body = root;
        body.parent = outer;
        body.isPickable = false; //so our raycasts dont hit ourself
        body.getChildMeshes().forEach(m => {
            m.isPickable = false;
        });

        return {
            outer:outer,
            animations:animations
        };
    }
}
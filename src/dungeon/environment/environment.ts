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
    Color3,
    AxesViewer,
    ActionManager,
    ExecuteCodeAction} from "@babylonjs/core";
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
        new AxesViewer(this._scene,10);
        const assets = await this._loadAssets(level);
        assets.allMeshes.forEach((child)=>{
            child.receiveShadows = true;
            child.checkCollisions = true;
        });

        // this._createBlackboard();
        // if(level === 0){
        //     const paper = MeshBuilder.CreateBox("paper",{
        //         size:0.3,
        //         width:0.3,
        //         height:0.3},
        //         this._scene);
        //     paper.position = this._scene.getTransformNodeByName("paper_pos").getAbsolutePosition();

        //     paper.actionManager = new ActionManager(this._scene);
        //     paper.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger,()=>{
        //         this._showDialogue();
        //     }))
        // }
    }

    private _showDialogue(){
        var modal = document.querySelector(".modal");
        console.log(modal);
        modal.classList.toggle("show-modal");
    }

    private _createBlackboard(){
        const blackboard = MeshBuilder.CreatePlane("blackboard",{size:2,width:3.8,height:1.8},this._scene);

        blackboard.position = this._scene.getTransformNodeByName("blackboard_pos").getAbsolutePosition();
        const texture = new DynamicTexture("blackboard",{width:1024,height:512});

        const context = texture.getContext();
        blackboard.rotation.y += Math.PI;
        texture.update();

        const blackboard_material = new CustomMaterial("blackboard_material",this._scene);
        blackboard_material.diffuseTexture = texture;
        blackboard_material.diffuseTexture.hasAlpha = true;

        blackboard.material = blackboard_material;
        var font = "bold 64px monospace";
        const words = "在程序世界里面,数据是以二进制\n的形式存储的。下列这个式子的\n计算结果是多少?\n    1111 - 0101 = ?";
        let y = 100;

        for (let word of words.split("\n")){
            var metrics = context.measureText(word) as any;
            // let fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
            let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

            y = y + actualHeight + 10;
            texture.drawText(word, 50, y, font, "black", "transparent", true, true);
        }

        for(let i =0;i<3;i++){
            const box = MeshBuilder.CreatePlane("box_"+i,{},this._scene);
            box.rotation.y += Math.PI;
            box.rotation.x += Math.PI/2.0;
            // box.rotation.z += Math.PI/2.0;
            box.position = this._scene.getTransformNodeByName("box_pos_"+(i+1)).getAbsolutePosition();
            // box.position.z += 0.5;

            const texture_ = new DynamicTexture("box_texture_"+i,{width:200,height:200});
            texture_.update();

            const context = texture_.getContext();
            const box_material = new CustomMaterial("box_material_"+i,this._scene);
            box_material.diffuseTexture = texture_;
            box_material.diffuseTexture.hasAlpha = true;
    
            box.material = box_material;

            let word = "" + (i*3+2);
            console.log(word);

            const measure = context.measureText(word);
            var font = "bold 54px monospace";
            texture_.drawText(word, (200-measure.width)/2.0, 130, font, "blue", "transparent", true, true);
        }
        
    }
    private async _loadPasswordWithPaper(){
        const result = await SceneLoader.ImportMeshAsync(
            "",
            ASSETS_PATH_MODELS,
            `paper.glb`);

        const paper = result.meshes[0];

        return paper;

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

        outer.rotation.y += Math.PI;
        outer.rotationQuaternion = Quaternion.Zero();
        // outer.rotationQuaternion = new Quaternion(0, 1, 0, 0);

        // const result = await SceneLoader.ImportMeshAsync(
        //     null, 
        //     ASSETS_PATH_MODELS, 
        //     "player.glb", 
        // this._scene);

        // const root = result.meshes[0];
        // root.scaling.setAll(.1);

        // const animations = result.animationGroups;

        // //body is our actual player mesh
        // const body = root;
        // body.parent = outer;
        // body.isPickable = false; //so our raycasts dont hit ourself
        // body.getChildMeshes().forEach(m => {
        //     m.isPickable = false;
        // });

        return {
            outer:outer,
            // animations:animations
            animations:[]
        };
    }
}
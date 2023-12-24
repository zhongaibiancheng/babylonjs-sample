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
    ExecuteCodeAction,
    Mesh} from "@babylonjs/core";
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
        this._setPhysics();
    }

    private async _setPhysics(){
        // window.CANNON = CANNON;
        const physics = new CannonJSPlugin(null, 10, CANNON);
        // this._scene.enablePhysics(new Vector3(0,-9.8,0),physics);
        this._scene.enablePhysics(new Vector3(0, -9.8, 0), 
        physics);
    }

    public async load(level:number=0){//默认演示
        // new AxesViewer(this._scene,10);
        const assets = await this._loadAssets(level);
        assets.allMeshes.forEach((child)=>{
            child.receiveShadows = true;
            // child.checkCollisions = true;
        });

    }

    private _showDialogue(){
        var modal = document.querySelector(".modal");
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

        const result = await SceneLoader.ImportMeshAsync(
            "",
            ASSETS_PATH,
            `scene_${level_}.glb`);

        const env = result.meshes[0];

        env.parent = null;
        const allMeshes = env.getChildMeshes();

        allMeshes.forEach(mesh=>{
            mesh.parent = null;
            mesh.physicsImpostor = new PhysicsImpostor(mesh,
                PhysicsImpostor.BoxImpostor,
                {
                    mass:0,
                    friction:0.1,
                    restitution:0
                });
        });
        // allMeshes.forEach(m=>{
        //     m.checkCollisions = false;
        //     m.receiveShadows = true;

        //     if(m.name.includes("wall_")){
        //         m.isVisible = true;
        //         // m.checkCollisions = true;
        //     }

        //     if(m.name === 'ground'){
        //         m.isPickable = true;
        //         m.checkCollisions = true;

        //     }

        //     if(m.name.includes("collision")){
        //         m.isPickable = true;
        //         m.isVisible = false;
        //     }

        //     if(m.name.includes("Trigger")){
        //         m.isVisible = true;
        //         m.checkCollisions = false;
        //         m.isPickable = false;
        //     }

        //     //areas that will use box collisions
        //     if (m.name.includes("stairs") || m.name == "cityentranceground" || m.name == "fishingground.001" || m.name.includes("lilyflwr")) {
        //         m.checkCollisions = false;
        //         m.isPickable = false;
        //     }
        // });

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
                width: 0.4,
                depth: 0.35, 
                height: 0.4
            }, 
            this._scene);

        // outer.isVisible = true;
        // outer.isPickable = false;
        // outer.checkCollisions = false;

        // //move origin of box collider to the bottom of the mesh (to match player mesh)
        // outer.bakeTransformIntoVertices(Matrix.Translation(0, 0.4, 0))

        // //for collisions
        // outer.ellipsoid = new Vector3(0.3, 0.25, 0.3);
        // outer.ellipsoidOffset = new Vector3(0, 0.25, 0);

        const result = await SceneLoader.ImportMeshAsync(
            null, 
            ASSETS_PATH_MODELS, 
            "boy.glb",
        this._scene);

        const root = result.meshes[0];

        const animations = result.animationGroups;

        this._scene.stopAllAnimations();
        // const outer = new Mesh("outer",this._scene);

        //body is our actual player mesh
        const body = root;

        
        body.computeWorldMatrix(true);
        outer.computeWorldMatrix(true);
        body.parent = outer;
        body.position.y = 2;

        body.isPickable = false; //so our raycasts dont hit ourself
        const parts ={};
        body.getChildMeshes().forEach(m => {
            m.isPickable = false;
            parts[m.name] = m;
            m.computeWorldMatrix(true);
            // console.log(m.name,m.getAbsolutePosition(),m.rotation);
            // parent不为null的时候，设置物理引擎信息不起作用！！！
            // this._createCharacterPhysicsImpostor(m);
        });

        // const colliders = [];
       
        
        // // 创建一个单位四元数
        var quaternion = new Quaternion();

        var rotationAxis = new Vector3(0, 1, 0); // 绕Y轴旋转
        var rotationAngle = Math.PI / 2; // 90度的弧度

        Quaternion.RotationAxisToRef(rotationAxis, rotationAngle, quaternion);

        // outer.rotationQuaternion = quaternion;
        outer.rotationQuaternion = Quaternion.Zero();
        // body.parent = outer;
        // body.rotationQuaternion = null;
        // body.rotation.y -= Math.PI;
        outer.position = this._scene.getTransformNodeByName("start_pos").getAbsolutePosition();

        const left_leg_mesh_original = parts['leg-left'] as Mesh;
        left_leg_mesh_original.computeWorldMatrix(true);
        const m = new StandardMaterial("m",this._scene);
        m.diffuseColor = new Color3(1,0,0);
        left_leg_mesh_original.material = m;

        const left_leg_mesh = left_leg_mesh_original.clone("left_leg_mesh",null,false,false);
        /**
         * 禁用物理影响：如果使用了物理引擎，
         * 可以暂时禁用克隆网格的物理影响，
         * 直到其位置正确设置后再启用。
         * 
         * 不用延迟的话，会出现下坠现象
         * 
         * 这个调查起来真的很难
         */
        setTimeout(()=>{
            left_leg_mesh.physicsImpostor = new PhysicsImpostor(
                left_leg_mesh,
                PhysicsImpostor.BoxImpostor,
                {
                    mass:0.0
                },
                this._scene
            );
        },1000);
        // this._scene.addMesh(left_leg_mesh);
        left_leg_mesh.rotationQuaternion = left_leg_mesh_original.rotationQuaternion?
        left_leg_mesh_original.rotationQuaternion:Quaternion.FromEulerVector(left_leg_mesh_original.rotation);

        left_leg_mesh.position = (left_leg_mesh_original.getAbsolutePosition());
        // 复制轴心点
        let pivotMatrix = left_leg_mesh_original.getPivotMatrix();
        left_leg_mesh.setPivotMatrix(pivotMatrix.clone(), false);

        // 复制旋转和缩放
        // cloneMesh.rotation = originalMesh.rotation.clone();
        left_leg_mesh.scaling = left_leg_mesh_original.scaling.clone();
        left_leg_mesh.computeWorldMatrix(true);
        left_leg_mesh.parent = null;
        

        // left_leg_mesh_original.dispose();



        // left_leg_mesh.physicsImpostor.sleep();

        // outer.physicsImpostor = new PhysicsImpostor(
        //     outer,
        //     PhysicsImpostor.BoxImpostor,{
        //         mass:20,
        //         friction:0.1,
        //         restitution:0
        // },this._scene);

        // // 这意味着物体可以在 Y 轴上自由旋转，但在 X 轴和 Z 轴上的旋转被阻止了。
        // outer.physicsImpostor.physicsBody.angularFactor = new CANNON.Vec3(0, 1, 0);
        
        return {
            outer:outer,
            // colliders:colliders,
            colliders:[],
            animations:animations
        };
    }
    private _createCharacterPhysicsImpostor(m){
        m.getChildMeshes().forEach(child=>{
            child.physicsImposter = new PhysicsImpostor(child,
                PhysicsImpostor.NoImpostor,
                {mass:1},
                this._scene);
        });
        m.physicsImposter = new PhysicsImpostor(m,
            PhysicsImpostor.BoxImpostor,
            {
                mass:0.1,
                friction:0.1,
                restitution:0,
            },
            this._scene);
    }
}
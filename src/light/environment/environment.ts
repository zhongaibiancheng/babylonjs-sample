import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
// import Ammo from 'ammojs-typed';
import * as CANNON from 'cannon-es'

import { 
    Scene, 
    // AmmoJSPlugin,
    Vector3, MeshBuilder, 
    Matrix,
    Quaternion,
    SceneLoader,
    PhysicsImpostor,
    PointerEventTypes,
    Mesh,
    CannonJSPlugin,
    AmmoJSPlugin,
    SpriteManager,
    Sprite,
    StandardMaterial,
    Texture,
    Color3,
    VertexData} from "@babylonjs/core";
import FireBall from "../weapon/fireball";

/**资源文件目录 */
const ASSETS_PATH = "./light/scene/";
const ASSETS_PATH_MODELS = "./light/models/";

export default class Environment{
    private _scene:Scene;

    // constructor(scene){
    //     this._scene = scene;
    // }

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

    public async load(level:number=0){//toturial
        console.log("loading level " + level +" data");

        const assets = await this._loadAssets(level);
        assets.allMeshes.forEach((child)=>{
            child.receiveShadows = true;
            child.checkCollisions = true;
        });

        if(level === 0 || level === 1){
            this._setPhysics().then(()=>{
                //生成武器
                const fireball = new FireBall(this._scene);

                // this._loadRock().then(rock=>{
                //     for(let i=0;i<4;i++){
                //         const root = rock.root.clone();

                //         root.position.x = 4*Math.sin(90*i/180*Math.PI);
                //         root.position.z = 4*Math.cos(90*i/180*Math.PI);
                //         root.position.y = 1.5;

                //         root.scaling.setAll(0.2);
                //         const fractures = [];
                //         let outer;

                //         for(let child of root.getChildMeshes()){
                //             if(child.name === ".Cube"){
                //                 outer = child;

                //                 outer.physicsImpostor = new PhysicsImpostor(
                //                     outer,
                //                     PhysicsImpostor.BoxImpostor,
                //                     {
                //                         mass:0.1,
                //                         ignoreParent: true,
                //                     },
                //                     this._scene);
                //                 outer.physicsImpostor.sleep();

                //                 outer.physicsImpostor.registerOnPhysicsCollide(
                //                     fireball.bullet.physicsImpostor, 
                //                     (main, collided)=>{
                //                         console.log("fireball hit the rock now ************");
                //                         outer.isVisible = false;
                                        
                //                         const fractures = outer.metadata.fractures;
                //                         for(let i=0;i<fractures.length;i++){
                //                             let mesh = fractures[i];

                //                             mesh.physicsImpostor.wakeUp();
                //                         }

                //                         setTimeout(()=>{
                //                             outer.dispose();
                //                             fractures.forEach(element => {
                //                                 element.dispose();
                //                             });
                //                         },3000);
                //                 });
                //                 continue;
                //             }
                //             if(child.name.includes("Cube_cell")){//fracture
                //                 let mesh = child;
                                
                //                 mesh.scaling.setAll(0.2);

                //                 mesh.parent = null;
                //                 mesh.position = mesh.position.scale(0.2);

                //                 mesh.position.x += root.position.x;
                //                 mesh.position.y += root.position.y;
                //                 mesh.position.z += root.position.z;

                //                 mesh.physicsImpostor = new PhysicsImpostor(
                //                     mesh,
                //                     PhysicsImpostor.BoxImpostor,
                //                     // PhysicsImpostor.ConvexHullImpostor,
                //                     {
                //                         mass: Math.random()*2,
                //                         friction: 1,
                //                         restitution: 0.2,
                //                         nativeOptions: {},
                //                         ignoreParent: true,
                //                         disableBidirectionalTransformation: false
                //                     },
                //                     this._scene
                //                 );
                //                 mesh.physicsImpostor.sleep();
                //                 fractures.push(mesh);
                //             }
                //         }
                //         outer.metadata = {
                //             fractures:fractures
                //         }

                //     }
                //     rock.root.dispose();
                // });
                const m = this._scene.getMeshByName("ground");
                if(m){
                    m.physicsImpostor = new PhysicsImpostor(
                        m,
                        PhysicsImpostor.BoxImpostor,
                        {
                            mass:0
                        },
                        this._scene
                    );
                }
            });
        }
        // this._scene.onPointerObservable.add((pointerInfo)=>{
        //     switch (pointerInfo.type) {
        //         case PointerEventTypes.POINTERTAP:
        //             switch (pointerInfo.event.button) {
        //                 case 0:
        //                     if(pointerInfo.pickInfo.pickedMesh){
        //                         const outer = pointerInfo.pickInfo.pickedMesh;
        //                         if(outer.name === '.Cube'){
        //                             outer.isVisible = false;
                                    
        //                             const fractures = outer.metadata.fractures;
        //                             for(let i=0;i<fractures.length;i++){
        //                                 let mesh = fractures[i];

        //                                 // mesh.physicsImpostor.physicsBody.setActivationState(1);
        //                                 mesh.physicsImpostor.wakeUp();
        //                                 // mesh.physicsImpostor.forceUpdate();
        //                             }

        //                             setTimeout(()=>{
        //                                 outer.dispose();
        //                                 // fractures.forEach(element => {
        //                                 //     element.dispose();
        //                                 // });
        //                             },3000);
        //                         }
        //                     }
        //                     break;
        //             }
        //         }
        // });

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
        
        //wood
        const result_box = await SceneLoader.ImportMeshAsync(
            "",
            ASSETS_PATH_MODELS,
            "boost_box.glb");
        const box = result_box.meshes[0];
        box.name = "love";
        box.position.y = 1.5;

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

    /**
     * 
     * 加载岩石(该岩石可以爆炸)
     * 
     */
    private async _loadRock(){
        const explode =  await SceneLoader.ImportMeshAsync(
            "",
            "./light/models/", 
            "rock.glb",
            this._scene);

        let root:any;

        for(let i=0;i<explode.meshes.length;i++){
            let mesh = explode.meshes[i];
            //root node
            if(mesh.name === '__root__'){
                root = mesh;
                break;
            }
        }

        return {
            root:root
        }
    }
}
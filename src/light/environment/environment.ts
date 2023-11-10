import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";

import { 
    Scene, 
    Vector3, MeshBuilder, 
    Matrix,
    Quaternion,
    SceneLoader,
    AssetsManager} from "@babylonjs/core";

/**资源文件目录 */
const ASSETS_PATH = "./light/scene/";
const ASSETS_PATH_MODELS = "./light/models/";
export default class Environment{
    private _scene:Scene;
    private _assetsManager:AssetsManager;

    constructor(scene){
        this._scene = scene;
        this._assetsManager = new AssetsManager(scene);

        this._assetsManager.onProgress = 
        (remainingCount, totalCount, lastFinishedTask)=>{
            console.log('We are loading the scene. ' + remainingCount + ' out of ' + totalCount + ' items still need to be loaded.');
        };
    
    this._assetsManager.onFinish = function(tasks) {
console.log("finished loaded assets");
    };
    }

    public async load(){
        const assets = await this._loadAssets();
        assets.allMeshes.forEach((child)=>{
            child.receiveShadows = true;
            child.checkCollisions = true;
        });
    }

    private async _loadAssets(){
        const result = await SceneLoader.ImportMeshAsync(
            "",
            ASSETS_PATH,
            "scene_001.glb");

        const env = result.meshes[0];
        env.computeWorldMatrix(true);
        
        const allMeshes = env.getChildMeshes();

        allMeshes.forEach(m=>{
            m.checkCollisions = true;
            m.receiveShadows = true;

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
                width: 2,
                depth: 1, 
                height: 3 
            }, 
            this._scene);

        outer.isVisible = false;
        outer.isPickable = false;
        outer.checkCollisions = true;

        //move origin of box collider to the bottom of the mesh (to match player mesh)
        outer.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0))

        //for collisions
        outer.ellipsoid = new Vector3(1, 1.5, 1);
        outer.ellipsoidOffset = new Vector3(0, 1.5, 0);

        outer.rotationQuaternion = new Quaternion(0, 0, 0, 0); // rotate the player mesh 180 since we want to see the back of the player

        const result = await SceneLoader.ImportMeshAsync(
            null, 
            ASSETS_PATH_MODELS, 
            "player.glb", 
        this._scene);

        const root = result.meshes[0];
        root.scaling.setAll(.1);
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
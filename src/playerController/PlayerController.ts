import { AbstractMesh, ActionManager, 
    AnimationGroup, ArcRotateCamera, AxesViewer, Color3, 
    Color4, Engine, ExecuteCodeAction, 
    HemisphericLight, Matrix, Mesh, MeshBuilder, ParticleSystem, 
    PointLight, 
    Ray, Texture,
    Scene, SceneLoader, ShadowGenerator, StandardMaterial,TransformNode, 
    UniversalCamera, Vector3, _PrimaryIsoTriangle, CubeTexture, Vector2, PickingInfo } from "@babylonjs/core";


import { SkyMaterial, TerrainMaterial, WaterMaterial } from '@babylonjs/materials';
import "@babylonjs/loaders/glTF";

const SIZE = {
    width:100,
    height:100,
    depth:100
}

export default class PlayerController{
    _engine:Engine;
    _scene:Scene;
    _emitter:Mesh;
    _rocket:ParticleSystem;

    _camera:UniversalCamera;
    // _camera:ArcRotateCamera;
    _camRoot:TransformNode;
    _yTilt:TransformNode;

    private _animations:{};
    private _player:AbstractMesh;
    private _ground:Mesh;
    private _inputMap:{};

    private _weaponsMap:{};
    private _curAnim:AnimationGroup = null;

    private _preAnim:AnimationGroup = null;

    private _shadowGenerator:ShadowGenerator;

    private static readonly ANIMATION_NAME:Array<string>= ["Samba","Idle","Walking","WalkingBack"];

    private static readonly WEAPONS:Array<string> = ["sword"];

    private static readonly PLAYER_MOVEMENT_SPEED:number = 0.08;
    private static readonly PLAYER_ROTATION_SPEED:number = 0.06;
    private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.5934119456780721, 0, 0);

    private static readonly GRAVITY:Vector3 = new Vector3(0,-0.098,0);


    // private static readonly ORIGINAL_TILT: Vector3 = new Vector3(Math.PI/4.0, 0, 0);

    constructor(){
        Engine.CollisionsEpsilon = 0.00005;

        this._animations = {};
        this._weaponsMap = {};
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(canvas);
        this._scene = new Scene(this._engine);

        this._scene.collisionsEnabled = true;

        // this._scene.clearColor = new Color4(1,1,1,0.2);
        this._scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098); // a color that fit the overall color scheme better

        this._scene.actionManager = new ActionManager(this._scene);

        const light1 = new HemisphericLight("light",new Vector3(1,1,1),this._scene);

        this._inputMap = {};
        new AxesViewer(this._scene,4);

        this._createTerrainGround();

        // Sky material
        var skyboxMaterial = new SkyMaterial("skyMaterial", this._scene);
        skyboxMaterial.backFaceCulling = false;
        //skyboxMaterial._cachedDefines.FOG = true;
        skyboxMaterial.inclination = 0;
        // Sky mesh (box)
        var skybox = Mesh.CreateBox("skyBox", 1000.0, this._scene);
        skybox.material = skyboxMaterial;

        // this._createWater(skybox,this._ground);
        this._main();

        this.loadCharacter().then(()=>{
            //load weapons
            // this._loadWeapons();
        });
        
        this.inputController();

        this._main();

        this._scene.registerBeforeRender(()=>{
            this._updateCamera();
        });

        window.addEventListener("resize",(evt)=>{
            this._engine.resize();
        });
    }
    //TODO
    _createWater(skybox,ground){
        // Water
        var waterMesh = Mesh.CreateGround("waterMesh", 512, 512, 32, this._scene, false);
        
        waterMesh.position.y = -15;
        var water = new WaterMaterial("water", this._scene);
        water.bumpTexture = new Texture("textures/waterbump.png", this._scene);
        
        // Water properties
        water.windForce = -15;
        water.waveHeight = 1.3;
        water.windDirection = new Vector2(1, 1);
        water.waterColor = new Color3(0.1, 0.1, 0.6);
        water.colorBlendFactor = 0.3;
        water.bumpHeight = 0.1;
        water.waveLength = 0.1;
        
        // Add skybox and ground to the reflection and refraction
        water.addToRenderList(skybox);
        water.addToRenderList(ground);
        
        // Assign the water material
        waterMesh.material = water;
    }
    _createTerrainGround(){
        // // Create terrain material
        var terrainMaterial = new TerrainMaterial("terrainMaterial", this._scene);
        terrainMaterial.specularColor = new Color3(0.5, 0.5, 0.5);
        terrainMaterial.specularPower = 64;
        
        // Set the mix texture (represents the RGB values)
        terrainMaterial.mixTexture = new Texture("textures/mixMap.png", this._scene);
        
        // Diffuse textures following the RGB values of the mix map
        // diffuseTexture1: Red
        // diffuseTexture2: Green
        // diffuseTexture3: Blue
        terrainMaterial.diffuseTexture1 = new Texture("textures/floor.png", this._scene);
        terrainMaterial.diffuseTexture2 = new Texture("textures/rock.png", this._scene);
        terrainMaterial.diffuseTexture3 = new Texture("textures/grass.png", this._scene);
        
        // Bump textures according to the previously set diffuse textures
        terrainMaterial.bumpTexture1 = new Texture("textures/floor_bump.png", this._scene);
        terrainMaterial.bumpTexture2 = new Texture("textures/rockn.png", this._scene);
        terrainMaterial.bumpTexture3 = new Texture("textures/grassn.png", this._scene);
    
        // Rescale textures according to the terrain
        terrainMaterial.diffuseTexture1.uScale = terrainMaterial.diffuseTexture1.vScale = 1;
        terrainMaterial.diffuseTexture2.uScale = terrainMaterial.diffuseTexture2.vScale = 1;
        terrainMaterial.diffuseTexture3.uScale = terrainMaterial.diffuseTexture3.vScale = 1;
        
        // Ground
        this._ground = Mesh.CreateGroundFromHeightMap("ground", "textures/heightMap.png", SIZE.width, SIZE.height, 100, 0, 10, this._scene, false);
        // ground.position.y = -2.05;
        this._ground.position.y = 0;
        this._ground.material = terrainMaterial;

        this._ground.isPickable = true;
        this._ground.checkCollisions = false;
        // ground.scaling.set(100,1,100);

        const texture = new Texture("textures/grass.png", this._scene);
        const materail = new StandardMaterial("ground",this._scene);
        materail.diffuseTexture = texture;

        const positions = [
            {
                x:-SIZE.width,
                z:SIZE.height
            },
            {
                x:0,
                z:SIZE.height
            },
            {
                x:SIZE.width,
                z:SIZE.height
            },
            {
                x:-SIZE.width,
                z:0
            },
            {
                x:SIZE.width,
                z:0
            },
            {
                x:-SIZE.width,
                z:-SIZE.height
            },
            {
                x:0,
                z:-SIZE.height
            },
            {
                x:SIZE.width,
                z:-SIZE.height
            }
        ];
        for(let i=0;i<positions.length;i++){
            let gr = MeshBuilder.CreateGround(
                "ground3"+i,{width:SIZE.width,height:SIZE.height},this._scene);
            gr.position.z = positions[i].z;
            gr.position.x = positions[i].x;
            gr.material = materail;

            gr.isPickable = true;
            gr.checkCollisions = false;
    
        }
    }

    private _setupPlayerCamera(){
        this._camRoot = new TransformNode("root",this._scene);
        this._camRoot.position = new Vector3(0,0,0);
        // this._camRoot.rotation = new Vector3(0,Math.PI,0);
        // this._camRoot.rotationQuaternion = new Quaternion(0,Math.PI,0);
        //
        let yTilt = new TransformNode("ytilt");
        yTilt.rotation = PlayerController.ORIGINAL_TILT;
        yTilt.parent = this._camRoot;
        this._yTilt = yTilt;

        // this._camera = new ArcRotateCamera("camera1",  0, 0, 0, new Vector3(0, 0, 0), this._scene);
        // this._camera.setPosition(new Vector3(0, 5, -30));

        // this._camera.attachControl(true);
        // this._camera.wheelDeltaPercentage = 0.02;

        // our actual camera that's pointing at our root's position
        this._camera = new UniversalCamera("cam", new Vector3(0, 0, -20), this._scene);
        this._camera.lockedTarget = this._camRoot.position;
        this._camera.fov = 0.47350045992678597;
        this._camera.parent = yTilt;

        this._scene.activeCamera = this._camera;
    }

    private _updateCamera(){
        if(this._player){
            const pos = this._player.position;
            const end_pos = new Vector3(pos.x-2,pos.y + 1, pos.z - 2);
            this._camRoot.position = Vector3.Lerp(this._camRoot.position,end_pos,0.4);
        }
    }

    private async _loadWeapons(){
        const result = await SceneLoader.ImportMeshAsync(
            null,
            "/models/",
            "sword.glb",
            this._scene);
        const sword = result.meshes[0];
        this._weaponsMap['sword']=sword;
        // sword.rotate(new Vector3(0,0,1),Math.PI/2.0);
        sword.position.y = 1;
        // sword.scaling.setAll(10);
    }
    /**
     * 
     * 加载player model 和 动画
     * 
     */
    private async loadCharacter(){
        const result = await SceneLoader.ImportMeshAsync(null,
        "/models/",
        "HVGirl.glb",this._scene);

        const player = result.meshes[0];
        
        const outer = MeshBuilder.CreateBox("outer",{
            width:0.8,
            height:2.2,
            depth:0.8
        },this._scene);

        outer.position.y = 11;
        outer.bakeTransformIntoVertices(Matrix.Translation(0, 1.1, 0))
        outer.ellipsoid = new Vector3(0.4, 1.1, 0.4);
        outer.ellipsoidOffset = new Vector3(0, 1.1, 0);

        outer.checkCollisions = true;
        outer.isPickable = false;
        outer.isVisible = false;

        player.scaling.setAll(0.1);
        player.rotate(Vector3.Up(),Math.PI);
        player.getChildMeshes().forEach((child)=>{
            child.isPickable = false;
            child.checkCollisions = false;
        });
        player.parent = outer;
        this._player = outer;

        const light = new PointLight("sparklight", new Vector3(0, 0, 0), this._scene);
        light.diffuse = new Color3(0.08627450980392157, 0.10980392156862745, 0.15294117647058825);
        light.intensity = 35;
        light.radius = 1;
    
        this._shadowGenerator = new ShadowGenerator(1024, light);
        this._shadowGenerator.darkness = 0.4;
        light.parent = this._player;

        this._shadowGenerator.addShadowCaster(this._player);
// this._scene.getMeshByName("sparklight").parent = this._player;

        this.loadAnimations();
        this._setUpAnimations();
    }
    private loadAnimations(){
        for(let name of PlayerController.ANIMATION_NAME){
            const animation = this._scene.getAnimationGroupByName(name);
            this._animations[name] = animation;
        }
    }

    private _loadModel():void{
        const wall1 = MeshBuilder.CreateBox("wall1",{width:4,height:2,depth:0.4},this._scene);
        wall1.position = new Vector3(3,1,0);

        wall1.checkCollisions = true;

    }
    private inputController(){
        this._scene.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnKeyDownTrigger,(evt)=>{
                this._inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
            })
        );

        this._scene.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnKeyUpTrigger,(evt)=>{
            this._inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
        }))
    }

    private _setUpAnimations(): void {

        this._scene.stopAllAnimations();
        this._animations['Walking'].loopAnimation = true;
        this._animations['WalkingBack'].loopAnimation = true;
        this._animations['Idle'].loopAnimation = true;

        //initialize current and previous
        this._curAnim = this._animations['Idle'];
        this._preAnim = null;
    }
    private _isFloor(offsetX:number,offsetY:number,offsetZ:number,distance):PickingInfo{
        const p_pos = this._player.position;
        const pos = new Vector3(
            p_pos.x + offsetX,
            p_pos.y + offsetY,
            p_pos.z + offsetZ);
        const ray = new Ray(pos,Vector3.Down(),distance);

        const predicate = (mesh)=>{
            return mesh.isPickable && mesh.isEnabled();
        }
        let pick = this._scene.pickWithRay(ray,predicate);

        return pick;
    }
    private _isGround():Boolean{
        const result = this._isFloor(0,0.5,0,0.6);
        return result && result.hit;
    }
    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
        this._loadModel();
        this._setupPlayerCamera();

        this._scene.onBeforeRenderObservable.add(()=>{
            if(!this._player){
                return;
            }
            let gravity = Vector3.Zero();
            if(!this._isGround()){
                gravity = PlayerController.GRAVITY;
            }
            // console.log(gravity);
            if(this._inputMap['w']){
                this._curAnim = this._animations['Walking'] as AnimationGroup;
                let speed = this._player.forward.scaleInPlace(PlayerController.PLAYER_MOVEMENT_SPEED);
                const pos = speed.addInPlace(gravity);
                const pick = this._isFloor(pos.x,pos.y + 0.5,pos.z,0.6);
                let distance = 0.0;
                if(pick && pick.hit){
                    distance = pos.y + 0.5 - pick.distance;
                    gravity.y += distance;
                }
                
                this._player.moveWithCollisions(speed.addInPlace(gravity));
            }else if(this._inputMap['s']){
                // this._curAnim = this._animations["WalkingBack"] as AnimationGroup;
                const speed = this._player.forward.scaleInPlace(-PlayerController.PLAYER_MOVEMENT_SPEED);
                this._player.moveWithCollisions(speed.addInPlace(gravity));
                this._player.moveWithCollisions(speed);
            }else if(this._inputMap['a']){
                // this._curAnim = this._animations["Samba"] as AnimationGroup;
                const rotation_speed = PlayerController.PLAYER_ROTATION_SPEED * (-1);
                this._player.rotate(Vector3.Up(),rotation_speed);
                this._camRoot.rotate(Vector3.Up(),rotation_speed);   
            }else if(this._inputMap['d']){
                const rotation_speed = PlayerController.PLAYER_ROTATION_SPEED;
                this._player.rotate(Vector3.Up(),rotation_speed);
                this._camRoot.rotate(Vector3.Up(),rotation_speed);
            }else{
                if(gravity.x !=0 || gravity.y != 0 || gravity.z !=0){
                    this._player.moveWithCollisions(gravity);
                }
            }
            if(!this._curAnim){
                return;
            }
            if(!this._preAnim){
                this._curAnim.play(this._curAnim.loopAnimation);
                this._preAnim = this._curAnim;
                return;
            }
            if(this._preAnim != null && this._preAnim != this._curAnim){
                this._preAnim.stop();
                this._curAnim.play(this._curAnim.loopAnimation);

                this._preAnim = this._curAnim;
            }
        })
    }
}
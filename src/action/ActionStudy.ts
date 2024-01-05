import '@babylonjs/inspector';

import { ArcRotateCamera, AxesViewer, Color3, Color4, 
    Engine, HemisphericLight, Mesh, MeshBuilder,
     Scene, StandardMaterial, Vector3,
      CannonJSPlugin,
      _PrimaryIsoTriangle, 
      PhysicsImpostor,
      ActionManager,
      ExecuteCodeAction,
      SceneLoader,
      AnimationGroup,
      Quaternion,
      Axis,
      Texture,
      Vector4,
      ParticleSystem,
      TrailMesh,
      Tools} from "@babylonjs/core";

import "@babylonjs/loaders/glTF";
import * as CANNON from 'cannon-es';

import Enemy from './Enemy';

//scene 资源
const ASSETS_PATH = "./dungeon/scene/";
const ASSETS_PATH_MODELS = "./dungeon/player/Characters/gltf/";

export default class ActionStudy{
    _engine:Engine;
    _scene:Scene;
    _emitter:Mesh;

    _input:{};

    _player:Mesh;

    boxes:Array<Mesh>;

    _walk:AnimationGroup;

    _enemies:Array<Enemy>;

    constructor(){
        this._enemies = new Array<Enemy>();
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(canvas);
        this._scene = new Scene(this._engine);

        this._scene.debugLayer.show();

        this._scene.collisionsEnabled = true;

        const light = new HemisphericLight("light",new Vector3(1,1,1),this._scene);

        var camera = new ArcRotateCamera("camera1",  0, 0, 0, new Vector3(0, 0, 0), this._scene);
        camera.setPosition(new Vector3(10, 5, -10));
        
        camera.attachControl(canvas,true);
        camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
        camera.wheelDeltaPercentage = 0.02;

        const axis =  new AxesViewer(this._scene, 10);

        this._setPhysics();

        this._createPhysicsWorld();

        this._createInputMap();
    
        this._createAction();

        // this._test();

        this._main();
    }

    private _createAction(){
        this._scene.registerAfterRender(()=>{
            if(this._input && this._input["k"]){
                // this._kick_left.play(false);
            }else if(this._input && this._input["w"]){
                let pos = this._player.position;
                this._walk.play(false);
                this._player.position = pos.add(this._player.forward.normalize().scale(0.05));
                // this._input["w"]['done'] = true;

            }else if(this._input && this._input["ArrowLeft"]
                // &&this._input["ArrowLeft"]['down']
                // &&!this._input["ArrowLeft"]['done']
                ){
                this._player.rotationQuaternion = this._player.rotationQuaternion.multiply(
                    Quaternion.RotationAxis(Axis.Y, Math.PI / 80) // 30 度对应的弧度是 Math.PI / 6
                );

                // this._input["ArrowLeft"]['done'] = true;

            }else if(this._input && this._input["l"]
            // &&this._input["l"]['down']&&
            //     !this._input["l"]['done']
                ){
                // this._kick_right.play(false);
                
                // this._input["l"]['done'] = true;
            }
            else if(this._input && this._input["n"]){
                // this.attack_melee_left.play(false);
            }
            else if(this._input && this._input["m"]
            // &&this._input["m"]['down']
            // &&!this._input["m"]['done']
            ){
                // this.attack_melee_right.play(false);
                // this._input["m"]['done'] = true;
            }
        });
    }
    private async _setPhysics(){
        const physics = new CannonJSPlugin(null, 10, CANNON);
        this._scene.enablePhysics(new Vector3(0, -9.8, 0), physics);
        var newTimeStep = 1 / 30;
        this._scene.getPhysicsEngine().getPhysicsPlugin().setTimeStep(newTimeStep);
    }
    
    private _createAnimationLabel(animations:Array<AnimationGroup>){
        const div = document.createElement("div");
        div.style.position = "fixed";
        div.style.display="flex";
        div.style.flexWrap="wrap";
        div.style.minHeight="300px";
        div.style.maxHeight="300px";
        div.style.overflow = "auto";
        div.style.maxWidth = "500px";
        div.style.minWidth = "500px";
        div.style.left="10px";
        div.style.top = "10px";
        div.style.background="pink";

        document.body.appendChild(div);

        animations.forEach(animation=>{
            const div_ = document.createElement("div");
            div_.style.margin="10px";
            div_.style.cursor = "pointer";

            div_.innerText = animation.name;
            div.appendChild(div_);

            div_.addEventListener("pointerdown",(event)=>{
                animation.play(true);
            });
            if(animation.name === 'Walking_B'){
                this._walk = animation;
            }
        })
    }
    private _createFlameParticle(sword){
        // var ps1 = new ParticleSystem("ps1", 2000, this._scene);

        // const url = "/textures/fire.jpg";
        // ps1.particleTexture = new Texture(url, this._scene);

        // ps1.minSize = 0.1;
        // ps1.maxSize = 0.3;
        // ps1.minLifeTime = 1;
        // ps1.maxLifeTime = 15;

        // ps1.minEmitPower = 1;
        // ps1.maxEmitPower = 5;

        // ps1.minAngularSpeed = 0;
        // ps1.maxAngularSpeed = 0;

        // const emitter = MeshBuilder.CreateBox("mesh",{size:.1});
        // emitter.isVisible = false;
        // emitter.position.y += 1;
        // emitter.position.x -= 0;
        // emitter.position.z = 0;
        // emitter.rotation.x = Math.PI/2.0;

        // emitter.parent = sword; 
        // ps1.emitter = emitter;

        // ps1.emitRate = 20;

        // ps1.updateSpeed = 1;
        // ps1.blendMode = ParticleSystem.BLENDMODE_ONEONE;

        // ps1.color1 = new Color4(0.05, 0.05, 0.05, .5);
        // ps1.color2 = new Color4(0.05, 0.05, 0.05, .25);
        // ps1.colorDead = new Color4(0, 0, 0, 0);

        // ps1.direction1 = new Vector3(-.5, 1, .5);
        // ps1.direction2 = new Vector3(0.5, -.2, -.5);
        // ps1.minEmitBox = new Vector3(.1, .1, 1);
        // ps1.maxEmitBox = new Vector3(.1, .1, -1);

        // // turn the key! vrooom!
        // ps1.start();

        // // 创建剑气特效
        // var swordTrail = new ParticleSystem("swordTrail", 4000, this._scene);
        // swordTrail.particleTexture = new Texture("/textures/fire.jpg", this._scene);

        // const emitter = MeshBuilder.CreateBox("mesh",{size:.1});
        // emitter.isVisible = false;
        // emitter.position.y += 1;
        // emitter.position.x -= 0;
        // emitter.position.z = 0;
        // emitter.rotation.x = Math.PI/2.0;

        // emitter.parent = sword; 
 
        // swordTrail.emitter = emitter; // 剑气起始点

        // // swordTrail.minEmitBox = new Vector3(-1, 0, 0); // 发射盒子的最小坐标
        // // swordTrail.maxEmitBox = new Vector3(1, 0, 0); // 发射盒子的最大坐标

        // swordTrail.color1 = new Color4(1, 0, 0, 1); // 开始颜色
        // swordTrail.color2 = new Color4(1, 1, 0, 0); // 结束颜色
        // swordTrail.minSize = 0.1;
        // swordTrail.maxSize = 0.2;
        // swordTrail.minLifeTime = 0.1;
        // swordTrail.maxLifeTime = 0.5;
        // swordTrail.emitRate = 1000;
        
        // swordTrail.blendMode = ParticleSystem.BLENDMODE_ONEONE;

        // // swordTrail.direction1 = new Vector3(-1, 0, 0);
        // // swordTrail.direction2 = new Vector3(-2, 0, 0);

        // swordTrail.direction1 = new Vector3(-.5, 1, .5);
        // swordTrail.direction2 = new Vector3(0.5, -.2, -.5);

        // swordTrail.minEmitBox = new Vector3(.01, .01, 1);
        // swordTrail.maxEmitBox = new Vector3(.04, .04, -1);

        // swordTrail.minAngularSpeed = 0;
        // swordTrail.maxAngularSpeed = Math.PI;

        // swordTrail.minEmitPower = 2;
        // swordTrail.maxEmitPower = 5;
        // swordTrail.updateSpeed = 0.007;

        // swordTrail.start();


        // 创建 TrailingMesh
        const sword_p = MeshBuilder.CreateBox("b",{width:0.1,height:2,depth:0.01},this._scene);
        sword_p.parent = sword;
        sword_p.position.y = 1.3;

        sword_p.isVisible = false;

        var trailingMesh = new TrailMesh("trail", sword_p, this._scene, 0.8, 20, true);
        var material = new StandardMaterial("trailMaterial", this._scene);
        material.emissiveColor = new Color3(0, 0.5, 1); // 蓝色剑气
        trailingMesh.material = material;
    }

    private _test(){
        // 创建一个 Mesh 作为扇形形状
        var radius = 2; // 扇形半径
        var startAngle = 0; // 扇形起始角度（弧度）
        var endAngle = Math.PI / 2; // 扇形结束角度（弧度）
        var tessellation = 100; // 分段数

        var fanShape = MeshBuilder.CreateCylinder("fanShape", {
            height: 0.1,
            diameterTop: radius * 2,
            diameterBottom: radius * 2,
            tessellation: tessellation,
            arc: endAngle - startAngle
        }, this._scene);

        fanShape.position.y = 2;
        // 创建 TrailMesh
        var fanTrail = new TrailMesh("fanTrail", fanShape, this._scene);
        const trailMaterial = new StandardMaterial("fanTrailMaterial", this._scene);
        trailMaterial.emissiveColor = new Color3(1, 0, 0); // 设置颜色
        trailMaterial.backFaceCulling = false; // 剔除背面
        trailMaterial.wireframe = false; // 非线框模式

                
    }
    private async _createPhysicsWorld():Promise<void>{
        const ground = MeshBuilder.CreateGround("ground",{width:45,height:46},this._scene);
        const mtl = new StandardMaterial("ground",this._scene);
        mtl.diffuseColor = new Color3(0.3,0.4,0.5);
        mtl.backFaceCulling = false;
        ground.material = mtl;

        const scaling = 1;
        ground.physicsImpostor = new PhysicsImpostor(ground,PhysicsImpostor.BoxImpostor,{
            mass:0,
            restitution:3,
            friction:3,
        });

        const env = await SceneLoader.ImportMeshAsync(
            null,
            "./dungeon/scene/",
            "scene_002.glb",
            this._scene
        );

        this._enemies.push(new Enemy("a",this._scene) as never);
        this._enemies.push(new Enemy("b",this._scene) as never);
        this._enemies.push(new Enemy("c",this._scene) as never);
        this._enemies.push(new Enemy("d",this._scene) as never);

        const result = await SceneLoader.ImportMeshAsync(
            null, 
            ASSETS_PATH_MODELS, 
            "Knight.glb",
        this._scene);

        const root = result.meshes[0] as Mesh;
console.log(result.animationGroups);
const idle = result.animationGroups[36];
idle.play(true);
        // root.scaling.setAll(scaling);
        this._player = root;

        let h2_sword,h1_sword;
        this._player.getChildMeshes().forEach(mesh=>{
            if(mesh.name === '2H_Sword'){
                h2_sword = mesh;
                h2_sword.checkCollisions = true;

                this._createFlameParticle(h2_sword);
            }else if(mesh.name === '1H_Sword'){
                h1_sword = mesh;
                h1_sword.checkCollisions = true;
            }
        });

        this._scene.onBeforeRenderObservable.add(()=>{
            this._enemies.forEach(enemy=>{
                if(h1_sword.intersectsMesh(enemy.player)){
                    const message = new CustomEvent("damageMessage",
                    {
                        detail:{
                            objB:enemy.player,
                            damageVal:10
                        }
                    });
                    window.dispatchEvent(message);

                }else if(h2_sword.intersectsMesh(enemy.player)){
                    const message = new CustomEvent("damageMessage",
                    {
                        detail:{
                            objB:enemy,
                            damageVal:5
                        }
                    });
                    window.dispatchEvent(message);
                }
            });
        })
        const animations = result.animationGroups;

        this._createAnimationLabel(animations);
    }

    private _createInputMap(){
        this._input = {};

        this._scene.actionManager = new ActionManager(this._scene);

        this._scene.actionManager.registerAction(new ExecuteCodeAction(
            ActionManager.OnKeyDownTrigger, (evt) =>{
            // this._input[evt.sourceEvent.key] = {
            //     down:evt.sourceEvent.type == "keydown",
            //     done:false
            // }
            this._input[evt.sourceEvent.key] =evt.sourceEvent.type == "keydown"
        }));

        this._scene.actionManager.registerAction(new ExecuteCodeAction(
            ActionManager.OnKeyUpTrigger, (evt) =>{
            // this._input[evt.sourceEvent.key] = {
            //     down:evt.sourceEvent.type == "keydown",
            //     done:false
            // };
            this._input[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown"
        }));

    }

    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}


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
      Animation,
      Quaternion,
      Axis,
      Texture,
      ParticleSystem,
      TrailMesh,
      ShaderMaterial,
      Effect,
      Matrix,
      Camera} from "@babylonjs/core";

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

    _attacking:Boolean=false;

    _camera:Camera;

    _trailingMesh:TrailMesh;

    constructor(){
        this._enemies = new Array<Enemy>();
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(canvas);
        this._scene = new Scene(this._engine);
        this._scene.gravity = new Vector3(0, -9.8, 0);
        // this._scene.debugLayer.show();

        this._scene.collisionsEnabled = true;

        const light = new HemisphericLight("light",new Vector3(1,1,1),this._scene);

        var camera = new ArcRotateCamera("camera1",  0, 0, 0, new Vector3(0, 0, 0), this._scene);
        camera.setPosition(new Vector3(10, 5, -10));
        
        camera.attachControl(canvas,true);
        camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
        camera.wheelDeltaPercentage = 0.02;

        this._camera = camera;
        const axis =  new AxesViewer(this._scene, 10);

        // this._setPhysics();

        this._createPhysicsWorld();

        this._createInputMap();
    
        this._createAction();

        this._main();
    }

    private _createAction(){
        this._scene.registerAfterRender(()=>{
            if(this._input && this._input["k"]){

            }else if(this._input && this._input["w"]){
                this._walk.play(false);
                const direction = this._player.forward.normalize().scale(0.1);
                this._player.moveWithCollisions(direction);
            }else if(this._input && this._input["ArrowLeft"]){
                this._player.rotationQuaternion = this._player.rotationQuaternion.multiply(
                    Quaternion.RotationAxis(Axis.Y, Math.PI / 80)
                );
            }else if(this._input && this._input["l"]){
            }
            else if(this._input && this._input["n"]){
            }
            else if(this._input && this._input["m"]){
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
                this._attacking = true;
                animation.play(false);
                this._trailingMesh.isVisible = true;
                animation.onAnimationGroupEndObservable.add(()=>{
                    this._trailingMesh.isVisible = false;
                });
                
            });

            if(animation.name === 'Walking_B'){
                this._walk = animation;
            }
        })
    }
    private _createFlameParticle(sword){
        // 创建 TrailingMesh
        const sword_p = MeshBuilder.CreateBox("b",{width:0.1,height:2,depth:0.01},this._scene);
        sword_p.parent = sword;
        sword_p.position.y = 1.3;

        sword_p.isVisible = false;

        var trailingMesh = new TrailMesh("trail", sword_p, this._scene, 0.8, 20, true);
        var material = new StandardMaterial("trailMaterial", this._scene);
        material.emissiveColor = new Color3(0, 0.5, 1); // 蓝色剑气
        trailingMesh.material = material;
        this._trailingMesh = trailingMesh;
        this._trailingMesh.isVisible = false;
    }

    private _createFootCircle(){
        // Create a particle system
        var particleSystem = new ParticleSystem("particles", 1000, this._scene);

        //Texture of each particle
        particleSystem.particleTexture = new Texture("textures/fire.jpg", this._scene);

        // Where the particles come from
        // particleSystem.emitter = Vector3.Zero(); // the starting location
        const cirle_particle_emitter = MeshBuilder.CreateBox(
            "cirle_particle_emitter",
            {size:1},
            this._scene);

        cirle_particle_emitter.parent = this._player;
        // cirle_particle_emitter.isVisible = false;
        cirle_particle_emitter.checkCollisions = false;
        cirle_particle_emitter.isPickable = false;

        particleSystem.emitter = cirle_particle_emitter;

        particleSystem.direction1 = new Vector3(0, 0.2, 0);
        particleSystem.direction2 = new Vector3(0, 0.2, 0);

        // Colors of all particles
        particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
        particleSystem.color2 = new Color4(0.2, 0.5, 1.0, 1.0);
        particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0);

        // Size of each particle (random between...
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.12;

        // Life time of each particle (random between...
        particleSystem.minLifeTime = 0.1;
        particleSystem.maxLifeTime = 0.20;

        // Emission rate
        particleSystem.emitRate = 4000;

        var radius = 1.5; // 圆形的半径

        // Speed
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 3;
        particleSystem.updateSpeed = 0.005;

        // Start the particle system
        particleSystem.start();
    }

    async _loadShaderFile(url) {
        const response = await fetch(url);
        return response.text();
    }

    private async _createPhysicsWorld():Promise<void>{
        const ground = MeshBuilder.CreateGround("ground",{width:100,height:100},this._scene);
        const mtl = new StandardMaterial("ground",this._scene);
        mtl.diffuseColor = new Color3(0.3,0.4,0.5);
        mtl.backFaceCulling = false;
        ground.material = mtl;

        ground.checkCollisions = true;
        const scaling = 1;

        this._enemies.push(new Enemy("a",this._engine,this._camera,this._scene) as never);
        this._enemies.push(new Enemy("b",this._engine,this._camera,this._scene) as never);
        this._enemies.push(new Enemy("c",this._engine,this._camera,this._scene) as never);
        this._enemies.push(new Enemy("d",this._engine,this._camera,this._scene) as never);

        const result = await SceneLoader.ImportMeshAsync(
            null, 
            ASSETS_PATH_MODELS, 
            "Knight.glb",
        this._scene);

        const root = result.meshes[0] as Mesh;

        const idle = result.animationGroups[36];
        idle.play(true);

        const outer = MeshBuilder.CreateBox("outer",{
            width:0.8,
            height:2.4,
            depth:0.6
        });
        outer.checkCollisions = true;
        //for collisions
        outer.ellipsoid = new Vector3(0.4, 1.2, 0.3);
        outer.ellipsoidOffset = new Vector3(0, 1.2, 0);
        root.parent = outer;
        // root.position.y =-1;
        outer.position.y = 0;

        outer.bakeTransformIntoVertices(Matrix.Translation(0, 1.2, 0));
        this._player = outer;

        //TODO 初始值Quaternion.Zero()设成这个后，不能够直接相乘，因为直接相乘后结果为0
        // this._player.rotationQuaternion = Quaternion.Zero();
        this._player.rotationQuaternion = new Quaternion(0,1,0,0);

        // 创建一个环形网格作为光环
        var halo = MeshBuilder.CreateTorus("halo", { 
            diameter: 2.6, 
            thickness: 0.2,
            tessellation: 30
        }, this._scene);

        // // 将光环放置在角色周围
        // halo.position = this._player.position.clone();
        // halo.position.y += 0.3; // Y轴上向上移动1单位

        halo.checkCollisions = false;
        halo.parent = this._player;

        Effect.ShadersStore['customVertexShader'] = `
        precision highp float;
        attribute vec3 position;
        uniform mat4 worldViewProjection;
        
        void main() {
            vec4 p = vec4(position, 1.);
            gl_Position = worldViewProjection * p;
        }
    `;

        Effect.ShadersStore['customFragmentShader'] = `
        precision highp float;

        uniform float time;
        void main() {
            float blink = abs(sin(time));
            if(blink < 0.85){
                blink = 0.85;
            }
            // 定义光环的颜色
            vec3 color = vec3(0.5, 0.8, 1.0); // 蓝色

            // 应用闪烁因子到光环颜色
            color *= blink;

            // 设置片段的最终颜色
            gl_FragColor = vec4(color, .1); // 完全不透明
        }
    `;
        var shaderMaterial = new ShaderMaterial('custom', this._scene, 'custom', {
                uniforms: ["worldViewProjection","time"]
        });
        
        // 更新时间uniform
        var time = 0;
        this._scene.onBeforeRenderObservable.add(() => {
            time += this._scene.getEngine().getDeltaTime() * 0.001; // 将时间转换为秒
            shaderMaterial.setFloat("time", time);
        });
        halo.material = shaderMaterial;

        let h2_sword,h1_sword;
        this._player.getChildMeshes().forEach(mesh=>{
            
            if(mesh.name === '2H_Sword'){
                mesh.checkCollisions = true;
                h2_sword = mesh;
                this._createFlameParticle(h2_sword);
            }else if(mesh.name === '1H_Sword'){
                mesh.checkCollisions = true;
                h1_sword = mesh;
            }
        });

        this._scene.onBeforeRenderObservable.add(()=>{
            this._enemies.forEach(enemy=>{
                if(h1_sword.intersectsMesh(enemy.player)&&this._attacking){
                    const message = new CustomEvent("damageMessage",
                    {
                        detail:{
                            objB:enemy,
                            damageVal:10
                        }
                    });
                    window.dispatchEvent(message);
                    this._attacking = false;
                }else if(h2_sword.intersectsMesh(enemy.player)&&this._attacking){
                    const message = new CustomEvent("damageMessage",
                    {
                        detail:{
                            objB:enemy,
                            damageVal:5
                        }
                    });
                    window.dispatchEvent(message);
                    this._attacking = false;
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
            this._input[evt.sourceEvent.key] =evt.sourceEvent.type == "keydown"
        }));

        this._scene.actionManager.registerAction(new ExecuteCodeAction(
            ActionManager.OnKeyUpTrigger, (evt) =>{
            this._input[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown"
        }));

    }

    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}


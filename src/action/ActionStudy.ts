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
      Effect} from "@babylonjs/core";

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
        // var ps1 = new ParticleSystem("ps1", 100, this._scene);

        // const url = "/textures/fire.jpg";
        // ps1.particleTexture = new Texture(url, this._scene);

        // ps1.minSize = 0.1;
        // ps1.maxSize = 0.3;
        // ps1.minLifeTime = 1;
        // ps1.maxLifeTime = 1.1;

        // ps1.minEmitPower = 1;
        // ps1.maxEmitPower = 1.1;

        // ps1.minAngularSpeed = 0;
        // ps1.maxAngularSpeed = 0;

        // const emitter = MeshBuilder.CreateBox("mesh",{size:.1});
        // emitter.isVisible = false;
        // emitter.position.y += 1;
        // emitter.position.x -= 0.05;
        // emitter.position.z -= 0.1;
        // emitter.rotation.x = Math.PI/2.0;

        // emitter.parent = sword; 
        // ps1.emitter = emitter;

        // ps1.emitRate = 100;

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
        // particleSystem.startPositionFunction = function (
        //     worldMatrix, 
        //     positionToUpdate, 
        //     particle, 
        //     isLocal) {
        //     var angle = Math.random() * Math.PI * 2;
        //     var distance = radius;
        //     positionToUpdate.x = distance * Math.cos(angle);
        //     positionToUpdate.z = distance * Math.sin(angle);
        //     positionToUpdate.y = 0.3; // 根据需要调整z坐标
        // };

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
        // console.log(result.animationGroups);
        const idle = result.animationGroups[36];
        idle.play(true);
        // root.scaling.setAll(scaling);
        this._player = root;

        // this._createFootCircle();

        // 创建一个环形网格作为光环
        var halo = MeshBuilder.CreateTorus("halo", { 
            diameter: 2.6, 
            thickness: 0.2,
            tessellation: 30
        }, this._scene);

        // 将光环放置在角色周围
        halo.position = this._player.position.clone();
        halo.position.y += 0.3; // Y轴上向上移动1单位

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

        // 在渲染循环中更新光环位置
        this._scene.onBeforeRenderObservable.add(() => {
            halo.position.x = this._player.position.x;
            halo.position.z = this._player.position.z;
        });

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


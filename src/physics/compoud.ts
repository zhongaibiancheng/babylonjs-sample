import '@babylonjs/inspector';

import { ArcRotateCamera, AxesViewer, Color3, Color4, 
    Engine, HemisphericLight, Mesh, MeshBuilder,
     Scene, StandardMaterial, Vector3,
      CannonJSPlugin,
      _PrimaryIsoTriangle, 
      PhysicsImpostor,
      HingeJoint,
      DebugLayer,
      ActionManager,
      ExecuteCodeAction,
      SceneLoader,
      AnimationGroup,
      Quaternion,
      Axis,
      Texture,
      Vector4} from "@babylonjs/core";

import "@babylonjs/loaders/glTF";
import * as CANNON from 'cannon-es';

//scene 资源
const ASSETS_PATH = "./dungeon/scene/";
const ASSETS_PATH_MODELS = "./dungeon/models/";

export default class Compound{
    _engine:Engine;
    _scene:Scene;
    _emitter:Mesh;

    _input:{};
    _kick_left:AnimationGroup;
    _kick_right:AnimationGroup;

    attack_melee_left:AnimationGroup;
    attack_melee_right:AnimationGroup;

    _walk:AnimationGroup;

    _player:Mesh;

    boxes:Array<Mesh>;

    constructor(){
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(canvas);
        this._scene = new Scene(this._engine);
        // const debugLayer = new DebugLayer(this._scene);
        // debugLayer.show();
        this._scene.debugLayer.show();

        const light = new HemisphericLight("light",new Vector3(1,1,1),this._scene);

        var camera = new ArcRotateCamera("camera1",  0, 0, 0, new Vector3(0, 0, 0), this._scene);
        camera.setPosition(new Vector3(10, 5, -10));
        
        camera.attachControl(canvas,true);
        camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
        camera.wheelDeltaPercentage = 0.02;

        const axis =  new AxesViewer(this._scene, 10);

        this._setPhysics();

        this._createPhysicsWorld();

        this.boxes = this._createBoxes();

        this._createInputMap();
    
        this._main();
    }

    private async _setPhysics(){
        const physics = new CannonJSPlugin(null, 10, CANNON);
        this._scene.enablePhysics(new Vector3(0, -9.8, 0), physics);
        var newTimeStep = 1 / 30;
    this._scene.getPhysicsEngine().getPhysicsPlugin().setTimeStep(newTimeStep);

    }
    
    private async _createPhysicsWorld():Promise<void>{
        const ground = MeshBuilder.CreateGround("ground",{width:45,height:46},this._scene);
        const mtl = new StandardMaterial("ground",this._scene);
        mtl.diffuseColor = new Color3(0.3,0.4,0.5);
        mtl.backFaceCulling = false;
        ground.material = mtl;

        const scaling = 10.0;
        ground.physicsImpostor = new PhysicsImpostor(ground,PhysicsImpostor.BoxImpostor,{
            mass:0,
            restitution:3,
            friction:3,
        });

        const result = await SceneLoader.ImportMeshAsync(
            null, 
            ASSETS_PATH_MODELS, 
            "boy.glb",
        this._scene);

        const root = result.meshes[0] as Mesh;

        root.scaling.setAll(scaling);
        this._player = root;

        const animations = result.animationGroups;
// console.log(animations);

        this._kick_left = animations[1];
        this._kick_right = animations[0];
        this.attack_melee_left = animations[3];
        this.attack_melee_right = animations[2];

        this._walk = animations[9];
        this._scene.stopAllAnimations();
        let torso,head,left_leg,right_leg,left_arm,right_arm;

        root.getChildMeshes().forEach(mesh=>{
            console.log(mesh.name);

            if(mesh.name === 'torso'){
                torso = mesh;
            }else if(mesh.name === 'head'){
                head = mesh;
                const material = new StandardMaterial("head_material");
                material.diffuseColor = new Color3(0,0,1);

                head.material = material;
            }else if(mesh.name ==='leg-left'){
                left_leg = mesh;
            }else if(mesh.name ==='leg-right'){
                right_leg = mesh;
            }else if(mesh.name ==='arm-left'){
                left_arm = mesh;
            }else if(mesh.name ==='arm-right'){
                right_arm = mesh;
            }
        });
       
        const left_leg_bouding_info = left_leg.getBoundingInfo().boundingBox;
        const left_leg_size = left_leg_bouding_info.extendSize;
        const left_leg_mesh = MeshBuilder.CreateBox("left_leg",{
            width:left_leg_size.x*2*scaling,
            height:left_leg_size.y*2.*scaling,
            depth:left_leg_size.z*2.3*scaling
        },this._scene);

        left_leg_mesh.position = left_leg.getAbsolutePosition();
        left_leg_mesh.position.y -= 0.1*scaling;
        left_leg_mesh.physicsImpostor = new PhysicsImpostor(left_leg_mesh,
            PhysicsImpostor.BoxImpostor,
            {mass:0.0});
        
        const right_leg_bouding_info = right_leg.getBoundingInfo().boundingBox;
        const right_leg_size = right_leg_bouding_info.extendSize;
        const right_leg_mesh = MeshBuilder.CreateBox("right_leg",{
            width:right_leg_size.x*2*scaling,
            height:right_leg_size.y*2.*scaling,
            depth:right_leg_size.z*2.3*scaling
        },this._scene);

        right_leg_mesh.position = right_leg.getAbsolutePosition();
        right_leg_mesh.position.y -= 0.1*scaling;
        right_leg_mesh.physicsImpostor = new PhysicsImpostor(right_leg_mesh,
            PhysicsImpostor.BoxImpostor,
            {mass:0.0});

        let left_arm_mesh = left_arm.clone();
        left_arm_mesh.scaling.setAll(scaling);

        left_arm_mesh.parent = null;
        left_arm_mesh.position = left_arm.getAbsolutePosition();

        left_arm_mesh.physicsImpostor = new PhysicsImpostor(left_arm_mesh,
            PhysicsImpostor.BoxImpostor,
            {mass:0.0});

        let right_arm_mesh = right_arm.clone();
        right_arm_mesh.scaling.setAll(scaling);

        right_arm_mesh.parent = null;
        right_arm_mesh.position = right_arm.getAbsolutePosition();

        // left_arm_mesh.position.y -= 0.1*scaling;
        right_arm_mesh.physicsImpostor = new PhysicsImpostor(right_arm_mesh,
            PhysicsImpostor.BoxImpostor,
            {mass:0.0});

        this._scene.registerAfterRender(()=>{
            left_leg.computeWorldMatrix(true);
            right_leg.computeWorldMatrix(true);
            left_arm.computeWorldMatrix(true);
            right_arm.computeWorldMatrix(true);

            // left_leg_mesh.position = left_leg.getAbsolutePosition();
            // // 计算子 mesh 的世界变换矩阵
            // var worldMatrix = left_leg.getWorldMatrix();

            // // 创建向量用于存放分解后的位置、旋转和缩放信息
            // var position = new Vector3();
            // var rotation = new Quaternion();
            // var scale = new Vector3();

            // // 从世界变换矩阵中分解位置、旋转和缩放
            // worldMatrix.decompose(scale, rotation, position);

            // left_leg_mesh.rotationQuaternion = rotation;

            this._copyInformationFromOriginal(left_leg,left_leg_mesh);
            this._copyInformationFromOriginal(right_leg,right_leg_mesh);

            this._copyInformationFromOriginal(left_arm,left_arm_mesh);
            this._copyInformationFromOriginal(right_arm,right_arm_mesh);
            // this._copyInformationFromOriginal(right_arm,right_arm_mesh);

            // right_leg_mesh.position = right_leg.getAbsolutePosition();
            // let matrix = right_leg.getWorldMatrix();
            
            // let position_right = Vector3.Zero();
            // let rotation_right = Quaternion.Zero();
            // let scaling_right = Vector3.Zero();

            // matrix.decompose(scaling_right,rotation_right,position_right);
            // right_leg_mesh.rotationQuaternion = rotation_right;

            this.boxes.forEach(box=>{
                //左脚碰撞
                left_leg_mesh.physicsImpostor.registerOnPhysicsCollide(box.physicsImpostor,(collider,other,point)=>{
                    box.physicsImpostor.applyImpulse(left_leg_mesh.forward.normalize().scale(0.2),
                    box.getAbsolutePosition());
                });

                //右脚碰撞
                right_leg_mesh.physicsImpostor.registerOnPhysicsCollide(box.physicsImpostor,(collider,other,point)=>{
                    box.physicsImpostor.applyImpulse(right_leg_mesh.forward.normalize().scale(0.2),
                    box.getAbsolutePosition());
                })

                //左手碰撞
                left_arm_mesh.physicsImpostor.registerOnPhysicsCollide(box.physicsImpostor,(collider,other,point)=>{
                    box.physicsImpostor.applyImpulse(left_arm_mesh.forward.normalize().scale(0.1),
                    box.getAbsolutePosition());
                });

                //右手碰撞
                right_arm_mesh.physicsImpostor.registerOnPhysicsCollide(box.physicsImpostor,(collider,other,point)=>{
                    box.physicsImpostor.applyImpulse(right_arm_mesh.forward.normalize().scale(0.1),
                    box.getAbsolutePosition());
                })
            });
        });

        this._scene.registerAfterRender(()=>{
            if(this._input && this._input["k"]){
                this._kick_left.play(false);
            }else if(this._input && this._input["w"]){
                let pos = this._player.position;
                this._walk.play(false);
                this._player.position = pos.add(this._player.forward.normalize().scale(0.05));
            }else if(this._input && this._input["ArrowLeft"]){
                this._player.rotationQuaternion = this._player.rotationQuaternion.multiply(
                    Quaternion.RotationAxis(Axis.Y, Math.PI / 80) // 30 度对应的弧度是 Math.PI / 6
                );
            }else if(this._input && this._input["l"]){
                this._kick_right.play(false);
            }
            else if(this._input && this._input["n"]){
                this.attack_melee_left.play(false);
            }
            else if(this._input && this._input["m"]){
                this.attack_melee_right.play(false);
            }
        });
    }

    private _copyInformationFromOriginal(original,dest){
        dest.position = original.getAbsolutePosition();
        let matrix = original.getWorldMatrix();
        
        let position_right = Vector3.Zero();
        let rotation_right = Quaternion.Zero();
        let scaling_right = Vector3.Zero();

        matrix.decompose(scaling_right,rotation_right,position_right);
        dest.rotationQuaternion = rotation_right;
    }
    private _createLeg(){
        const leg = MeshBuilder.CreateBox("leg",{
            width:0.4,
            depth:0.4,
            height:1
        },this._scene);
        leg.position.y = 0.5;

        return leg;
    }

    private _createInputMap(){
        this._input = {};

        this._scene.actionManager = new ActionManager(this._scene);

        this._scene.actionManager.registerAction(new ExecuteCodeAction(
            ActionManager.OnKeyDownTrigger, (evt) =>{
            this._input[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        this._scene.actionManager.registerAction(new ExecuteCodeAction(
            ActionManager.OnKeyUpTrigger, (evt) =>{
            this._input[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

    }

    private _createBoxes():Array<Mesh>{
        let scaling = 3;
        let y = 10;
        const boxes = [];

        for(let i=0;i<4;i++){
            const mat = new StandardMaterial("mat");
            const texture = new Texture("https://assets.babylonjs.com/environments/numbers.jpg");
            mat.diffuseTexture = texture;
    
            var columns = 6;
            var rows = 1;
    
            const faceUV = new Array(6);
    
            for (let i = 0; i < 6; i++) {
                faceUV[i] = new Vector4(i / columns, 0, (i + 1) / columns, 1 / rows);
            }
    
            const options = {
                faceUV: faceUV,
                wrap: true,
                // size:scaling
            };
    
            const box = MeshBuilder.CreateBox("box", options);
            box.scaling.setAll(scaling);

            box.material = mat;

            box.position.x = -10;
            box.position.y = y;

            box.physicsImpostor = new PhysicsImpostor(box,PhysicsImpostor.BoxImpostor,{
                mass:30*Math.random(),
                restitution:0,
                friction:1.0
            },this._scene);

            scaling -=0.5;
            y -=3;

            boxes.push(box);
        }
        
        return boxes;
    }

    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}


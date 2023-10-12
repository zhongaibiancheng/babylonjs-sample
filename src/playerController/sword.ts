import { AbstractMesh, ActionManager, 
    AnimationGroup, ArcRotateCamera, AxesViewer, Bone, Color3, 
    Color4, Engine, ExecuteCodeAction, 
    HemisphericLight, Material, Matrix, Mesh, MeshBuilder, ParticleSystem, 
    PointLight, 
    Quaternion, 
    Ray, 
    Scene, SceneLoader, ShadowGenerator, StandardMaterial,TransformNode, 
    UniversalCamera, Vector3, _PrimaryIsoTriangle } from "@babylonjs/core";
import { renderableTextureFormatToIndex } from "@babylonjs/core/Engines/WebGPU/webgpuTextureHelper";
import "@babylonjs/loaders/glTF";
import { Inspector } from '@babylonjs/inspector';
export default class Sword{
    _engine:Engine;
    _scene:Scene;
    _emitter:Mesh;
    _rocket:ParticleSystem;

    _camera:ArcRotateCamera;

    private _animations:{};
    private _player:AbstractMesh;

    private _inputMap:{};

    private _weaponsMap:{};


    private _sword:AbstractMesh;

    private _curAnim:AnimationGroup = null;

    private _preAnim:AnimationGroup = null;

    private _shadowGenerator:ShadowGenerator;

    private static readonly ANIMATION_NAME:Array<string>= ["Die","idle","run","walking","kick"];

    private static readonly WEAPONS:Array<string> = ["sword"];

    private static readonly PLAYER_MOVEMENT_SPEED:number = 0.02;
    private static readonly PLAYER_ROTATION_SPEED:number = 0.01;
    private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.5934119456780721, 0, 0);

    private static readonly GRAVITY:Vector3 = new Vector3(0,-0.098,0);


    _rightArmBone:Bone;
    constructor(){
        Engine.CollisionsEpsilon = 0.00005;

        this._animations = {};
        this._weaponsMap = {};
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(canvas);
        this._scene = new Scene(this._engine);

        this._scene.collisionsEnabled = true;

        // this._scene.debugLayer.show();
        Inspector.Show(this._scene, {
            embedMode: true
          });

        // this._scene.clearColor = new Color4(1,1,1,0.2);
        this._scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098); // a color that fit the overall color scheme better

        this._scene.actionManager = new ActionManager(this._scene);

        const light1 = new HemisphericLight("light",new Vector3(1,1,1),this._scene);

        this._inputMap = {};
        new AxesViewer(this._scene,4);

        const ground = MeshBuilder.CreateGround("ground",{width:30,height:30},this._scene);
        // ground.position.y = -2;
        const mtl = new StandardMaterial("ground",this._scene);
        mtl.diffuseColor = new Color3(0.3,0.4,0.5);
        mtl.backFaceCulling = false;
        ground.material = mtl;

        ground.checkCollisions = true;

        this._setupPlayerCamera();

        this.loadCharacter().then(()=>{
            //load weapons
            this._loadWeapons();
        });
        
        this.inputController();

        this._main();

        // this._scene.registerBeforeRender(()=>{
        //     this._updateCamera();
        // });

        window.addEventListener("resize",(evt)=>{
            this._engine.resize();
        });


        // const cube1 = MeshBuilder.CreateBox("p1",{},this._scene);
        // cube1.scaling.setAll(0.6);

        // const m1 = new StandardMaterial("m1",this._scene);
        // m1.diffuseColor = new Color3(1,0,0);
        // cube1.material = m1;
        // cube1.position.y = 2;

        // const cube2 = MeshBuilder.CreateBox("c1",{},this._scene);
        // const c1 = new StandardMaterial("c1",this._scene);
        // c1.diffuseColor = new Color3(1,1,0);
        // cube2.material = c1;

        // cube2.scaling.setAll(0.5);
        // cube2.position.set(5,1,2);
        // cube2.parent = cube1;

        // this._scene.onBeforeRenderObservable.add(()=>{
        //     cube1.rotation.y += 0.02;
        //     cube2.rotation.x += 0.01;
        // })
    }
    
    private _setupPlayerCamera(){
        this._camera = new ArcRotateCamera(
            "arcrotatecamera",
        Math.PI/2.0,
        Math.PI/2.0,
        2,
        Vector3.Zero(),
        this._scene);
        this._camera.attachControl(true);
    }

    private _updateCamera(){

    }

    private async _loadWeapons(){
        // const result = await SceneLoader.ImportMeshAsync(
        //     null,
        //     "/models/",
        //     "sword.glb",
        //     this._scene);
        // const sword = result.meshes[0];
        // this._weaponsMap['sword']=sword;
        // sword.rotate(new Vector3(0,0,1),Math.PI/4.0);
        // sword.position.y = 1;
        // sword.scaling.setAll(0.1);
    }
    /**
     * 
     * 加载player model 和 动画
     * 
     */
    private async loadCharacter(){
        const result1 = await SceneLoader.ImportMeshAsync(
            null,
            "/models/",
            "sword.glb",
            this._scene);
        const sword = result1.meshes[0];
        this._weaponsMap['sword']=sword;
        // sword.rotate(new Vector3(0,0,1),Math.PI/4.0);
        sword.scaling.setAll(1);

        const result = await SceneLoader.ImportMeshAsync(null,
        "/models/",
        "player.glb",this._scene);
        // "player1.glb",this._scene);
        // "neymar_jr_avatar.glb",this._scene);
        this.loadAnimations();
        this._setUpAnimations();
        const player = result.meshes[0];

        // // console.log(result.skeletons[0]);
        // const outer = MeshBuilder.CreateBox("outer",{
        //     width:0.8,
        //     height:2.2,
        //     depth:0.8
        // },this._scene);

        // // outer.position.y = 1.1;
        // outer.bakeTransformIntoVertices(Matrix.Translation(0, 1.1, 0))
        // outer.ellipsoid = new Vector3(0.4, 1.1, 0.4);
        // outer.ellipsoidOffset = new Vector3(0, 1.1, 0);

        // outer.checkCollisions = true;
        // outer.isPickable = false;
        // outer.isVisible =false;

        // outer.position.z = 4;
        // player.scaling.setAll(0.1);
        // player.rotate(Vector3.Up(),Math.PI);
        player.getChildMeshes().forEach((child)=>{
            child.isPickable = false;
            child.checkCollisions = false;
        });
        // const skeleton = result.skeletons[0];

        sword.scaling.setAll(0.1);

        // const cube = MeshBuilder.CreateBox("tset",{},this._scene);
        // cube.scaling.setAll(0.1);
        let handR = this._scene.transformNodes.find(
            node => node.name === "mixamorig:RightHandThumb1");
            // node => node.name === "RightHandIndex4_051");

        // console.log(handR);

        // player.computeWorldMatrix(true);
        // handR.computeWorldMatrix(true);
        // sword.parent = handR;
        // const pos = handR.getAbsolutePosition();

        // sword.setAbsolutePosition(pos);
        this._sword = sword;
        // const pos = handR.getAbsolutePosition();
        // this._sword.position.set(pos.x,pos.y,pos.z);
        
        // player.parent = outer;
        player.checkCollisions = false;
        player.isPickable = false;

        this._player = player;
        // this._player = outer;


        const light = new PointLight("sparklight", new Vector3(0, 0, 0), this._scene);
        light.diffuse = new Color3(0.08627450980392157, 0.10980392156862745, 0.15294117647058825);
        light.intensity = 35;
        light.radius = 1;
    
        this._shadowGenerator = new ShadowGenerator(1024, light);
        this._shadowGenerator.darkness = 0.4;
        light.parent = this._player;

        this._shadowGenerator.addShadowCaster(this._player);
    }
    private loadAnimations(){
        for(let name of Sword.ANIMATION_NAME){
            const animation = this._scene.getAnimationGroupByName(name);
            this._animations[name] = animation;
        }
    }

    private _loadModel():void{
        // const wall1 = MeshBuilder.CreateBox("wall1",{width:4,height:2,depth:0.4},this._scene);
        // wall1.position = new Vector3(3,1,0);

        // wall1.checkCollisions = true;

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
        this._animations['walking'].loopAnimation = true;
        this._animations['kick'].loopAnimation = true;
        this._animations['idle'].loopAnimation = true;

        //initialize current and previous
        this._curAnim = this._animations['idle'];
        this._preAnim = null;
    }
    private _isFloor(offsetX:number,offsetY:number,offsetZ:number,distance):Boolean{
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

        if (pick.hit) { 
            return true;
        } else { 
            return false;
        }
    }
    private _isGround():Boolean{
        const result = this._isFloor(0,0.5,0,0.6);
        return result;
    }
    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })

        const r = 4;
        let arc = 0;
        let pace = 0.01;

        const points = [];
        let angle = 0;
        for(let i=0;i<2*Math.PI;i+=2*Math.PI/360){
            const p = new Vector3(r*Math.sin(i),0,r*Math.cos(i));
            points.push(p);
        }

        const circle = MeshBuilder.CreateLines("circle",{points:points},this._scene);
        circle.color = new Color3(7, 2, 0.5);
       
        // You need to find (perhaps by trial and error) a, b, c, x, y, z such
        // that the weapon is placed directly in the troll's hand. I'm currently
        // using dat.gui to tune these values in real-time to quickly find these
        const offsetPosition = new Vector3(-.1, -0.1, -0.05);
        const offsetRotation = new Vector3(0, Math.PI/6.0, Math.PI);

        // Update location of weapon before every frame render
        this._scene.registerBeforeRender(() => {
            if(!this._player){
                return;
            }
            let handR = this._scene.transformNodes.find(
            node => node.name === "mixamorig:RightHandThumb1");

            // Find absolute position and rotation of the trollMesh hand

            handR.computeWorldMatrix(true);
            this._player.computeWorldMatrix(true);

            const scale = new Vector3();
            const rotation = new Quaternion();
            const position = new Vector3();
            const matrix = handR.getWorldMatrix();
            const matrix2 = this._player.getWorldMatrix();
            const matrix3 = matrix2.multiply(matrix);
            matrix.decompose(scale, rotation, position);

            // Set weaponMesh's absolute position and rotation to those of the
            // trollMesh hand
            this._sword.setAbsolutePosition(handR.getAbsolutePosition());
            this._sword.rotationQuaternion = rotation;

            // Apply the position and rotation offsets found above (a, b, c, x, y, z)
            const rotationMatrix = new Matrix();
            rotation.toRotationMatrix(rotationMatrix);
            const translation = Vector3.TransformCoordinates(offsetPosition, rotationMatrix);
            // const translation = Vector3.TransformCoordinates(offsetPosition, matrix);
            this._sword.position.addInPlace(translation);
            this._sword.rotationQuaternion.multiplyInPlace(offsetRotation.toQuaternion());
        });
        this._scene.onBeforeRenderObservable.add(()=>{
            if(!this._player){
                return;
            }
            let gravity = Vector3.Zero();
            if(!this._isGround()){
                gravity = Sword.GRAVITY;
            }
            if(this._inputMap['w']){
                this._curAnim = this._animations['walking'] as AnimationGroup;
                let speed = this._player.forward.scaleInPlace(Sword.PLAYER_MOVEMENT_SPEED);
                // this._player.moveWithCollisions(speed);

                this._player.moveWithCollisions(speed.addInPlace(gravity));
                console.log(speed.addInPlace(gravity));
                console.log("move forward");
            }else if(this._inputMap['s']){
                // this._curAnim = this._animations["WalkingBack"] as AnimationGroup;
                const speed = this._player.forward.scaleInPlace(-Sword.PLAYER_MOVEMENT_SPEED);
                this._player.moveWithCollisions(speed.addInPlace(gravity));
                this._player.moveWithCollisions(speed);
            }else if(this._inputMap['a']){
                // this._curAnim = this._animations["Samba"] as AnimationGroup;
                const rotation_speed = Sword.PLAYER_ROTATION_SPEED * (-1);
                this._player.rotate(Vector3.Up(),rotation_speed);

            }else if(this._inputMap['d']){
                const rotation_speed = Sword.PLAYER_ROTATION_SPEED;
                this._player.rotate(Vector3.Up(),rotation_speed);
            }else if(this._inputMap[' ']){
                this._curAnim = this._animations['kick'];
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
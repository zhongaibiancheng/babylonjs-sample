import { AbstractMesh, ActionManager, 
    AnimationGroup, ArcRotateCamera, AxesViewer, Color3, 
    Color4, Engine, ExecuteCodeAction, 
    HemisphericLight, Matrix, Mesh, MeshBuilder, ParticleSystem, 
    PointLight, 
    Ray, Texture,
    Scene, SceneLoader, ShadowGenerator, StandardMaterial,TransformNode, 
    UniversalCamera, Vector3, _PrimaryIsoTriangle, CubeTexture, Vector2, PickingInfo, NodeMaterial, Quaternion } from "@babylonjs/core";

import { SkyMaterial, TerrainMaterial, WaterMaterial } from 
'@babylonjs/materials';
import "@babylonjs/loaders/glTF";

import InputController from './inputController';

const SIZE = {
    width:100,
    height:100,
    depth:100
}

export default class PlayerController {
// extends TransformNode{
    private static readonly DASH_TIME:number = 10; //how many frames the dash lasts
    private static readonly DASH_FACTOR: number = 2.5;
    private static readonly JUMP_FORCE: number = 0.80;
    private static readonly GRAVITY: number = -2.8;

    private _idle:AnimationGroup;
    private _jump:AnimationGroup;
    private _run:AnimationGroup;
    private _land:AnimationGroup;
    private _dash:AnimationGroup;

    private _preAnims:AnimationGroup;
    private _curAnims:AnimationGroup;

    private _dashPressed:boolean = false;
    private _isFalling:boolean = false;
    private _jumped:boolean = false;
    private _grounded:boolean = false;

    private _input:InputController;

    private _gravity:Vector3 = new Vector3(0,-0.0098,0);

    private _h:number;
    private _v:number;
    private _inputAmt: number;
    private _moveDirection:Vector3 = new Vector3();
    private _delta_time:number = 0;
    private _canDash:boolean = false;
    public dashTime:number = 0;

    private _lastGroundPos:Vector3 = Vector3.Zero();
    private _jumpCount:number = 0;
    _engine:Engine;
    _scene:Scene;
    _emitter:Mesh;
    _rocket:ParticleSystem;

    _camera:UniversalCamera;
    // _camera:ArcRotateCamera;
    _camRoot:TransformNode;
    _yTilt:TransformNode;

    //Player
    public mesh: Mesh; //outer collisionbox of player

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

    // private static readonly GRAVITY:Vector3 = new Vector3(0,-0.098,0);

    // private static readonly ORIGINAL_TILT: Vector3 = new Vector3(Math.PI/4.0, 0, 0);

    constructor(){
        // super("scene_test_");
        Engine.CollisionsEpsilon = 0.000005;

        this._animations = {};
        this._weaponsMap = {};
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(canvas);
        this._scene = new Scene(this._engine);

        this._scene.collisionsEnabled = true;

        this._scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098); // a color that fit the overall color scheme better

        this._scene.actionManager = new ActionManager(this._scene);

        const light1 = new HemisphericLight("light",new Vector3(1,1,1),this._scene);

        this._inputMap = {};

        this._input = new InputController(this._scene);

        new AxesViewer(this._scene,4);

        // Sky material
        var skyboxMaterial = new SkyMaterial("skyMaterial", this._scene);
        skyboxMaterial.backFaceCulling = false;
        //skyboxMaterial._cachedDefines.FOG = true;
        skyboxMaterial.inclination = 0;
        // Sky mesh (box)
        var skybox = Mesh.CreateBox("skyBox", 1000.0, this._scene);
        skybox.material = skyboxMaterial;

        this._main();

        this.inputController();

        this._scene.registerBeforeRender(()=>{
            this._updateFromControll();
            this._updateGroundDetection();
            this._updateCamera();
            this._animatePlayer();
        });

        window.addEventListener("resize",(evt)=>{
            this._engine.resize();
        });
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

    private _updateFromControll():void{
        if(!this.mesh){
            return;
        }
        this._delta_time = this._scene.getEngine().getDeltaTime()/1000.0;
        this._h = this._input.horizontal;
        this._v = this._input.vertical;

        this._moveDirection = Vector3.Zero();

        //--DASHING--
        //limit dash to once per ground/platform touch
        //can only dash when in the air
        if (this._input.dashing && !this._dashPressed && this._canDash && !this._grounded) {
            this._canDash = false;
            this._dashPressed = true;
    
            //sfx and animations
            this._curAnims = this._dash;
        }

        let dashFactor = 1;
        //if you're dashing, scale movement
        if (this._dashPressed) {
            if (this.dashTime > PlayerController.DASH_TIME) {
                this.dashTime = 0;
                this._dashPressed = false;
            } else {
                dashFactor = PlayerController.DASH_FACTOR;
            }
            this.dashTime++;
        }

        let fwd = this._camRoot.forward;
        let right = this._camRoot.right;

        let fwd_vec3  = fwd.scaleInPlace(this._v);
        let right_vec3 = right.scaleInPlace(this._h);

        let dir = fwd_vec3.addInPlace(right_vec3);
        let dir_nor = dir.normalize();

        this._moveDirection = new Vector3(dir_nor.x,0,dir_nor.z);

        this._inputAmt = Math.abs(this._h) + Math.abs(this._v);
        if(this._inputAmt > 1){
            this._inputAmt = 1;
        }

        this._moveDirection.scaleInPlace(this._inputAmt * PlayerController.PLAYER_MOVEMENT_SPEED);

        //检查是否旋转
        let rot = new Vector3(this._input.horizontalAxis,0,this._input.verticalAxis);
        if(rot.length() === 0){
            return;
        }

        let angle = Math.atan2(this._input.horizontalAxis,this._input.verticalAxis);
        angle +=this._camRoot.rotation.y ;
        let targ = Quaternion.FromEulerAngles(0, angle, 0);

        this.mesh.rotationQuaternion = Quaternion.Slerp(
            this.mesh.rotationQuaternion,
            targ,
            10*this._delta_time);

        return;
    }

    private _updateCamera(){
        if(this.mesh){
            const pos = this.mesh.position;
            const end_pos = new Vector3(pos.x-2,pos.y + 1, pos.z - 2);
            this._camRoot.position = Vector3.Lerp(this._camRoot.position,end_pos,0.4);
        }
    }

    private async _loadModel(){
        const result = await SceneLoader.ImportMeshAsync(
            '',
            '/scene/',
            'scene.glb',
            this._scene);
        // const scene = result.meshes[0];

        const env = result.meshes[0];

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

        //player
        const result_ = await SceneLoader.ImportMeshAsync(
            "",
            "/models/",
            "player.glb",
            this._scene);

        const root = result_.meshes[0];
        const animations = result_.animationGroups;

        this._idle = animations[1];
        this._land = animations[3];
        this._jump = animations[2];
        this._run = animations[4];
        this._dash = animations[0];

        this._curAnims = this._idle;
        this._preAnims = this._idle;
        this._preAnims.play(this._preAnims.loopAnimation);

        //body is our actual player mesh
        const body = root;

        //collision mesh
        const outer = MeshBuilder.CreateBox("outer", { width: 2, depth: 1, height: 3 }, this._scene);
        outer.isVisible = false;
        outer.isPickable = false;
        outer.checkCollisions = true;

        //move origin of box collider to the bottom of the mesh (to match player mesh)
        outer.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0))

        //for collisions
        outer.ellipsoid = new Vector3(1, 1.5, 1);
        outer.ellipsoidOffset = new Vector3(0, 1.5, 0);

        outer.rotationQuaternion = new Quaternion(0, 0, 0, 0); // rotate the player mesh 180 since we want to see the back of the player

        body.isPickable = false; //so our raycasts dont hit ourself
        body.getChildMeshes().forEach(m => {
            m.isPickable = false;
        });
        body.parent = outer;
        const position = this._scene.getTransformNodeByName("startPosition").getAbsolutePosition();

        outer.position = position;

        this.mesh = outer;

        // this.mesh.parent = this;
        this.mesh.actionManager = new ActionManager(this._scene);

        this.mesh.actionManager.registerAction(new ExecuteCodeAction({
            trigger:ActionManager.OnIntersectionEnterTrigger,
            parameter:this._scene.getMeshByName("ground")
        },()=>{
            if(this.mesh && this._lastGroundPos){
                this.mesh.position.copyFrom(this._lastGroundPos);
            }
        }));
        // this._setUpAnimations();
    }
    private _checkSlope(): boolean {
        if(!this.mesh){
            return false;
        }
        //only check meshes that are pickable and enabled (specific for collision meshes that are invisible)
        let predicate = function (mesh) {
            return mesh.isPickable && mesh.isEnabled();
        }

        //4 raycasts outward from center
        let raycast = new Vector3(this.mesh.position.x, this.mesh.position.y + 0.5, this.mesh.position.z + .25);
        let ray = new Ray(raycast, Vector3.Up().scale(-1), 1.5);
        let pick = this._scene.pickWithRay(ray, predicate);

        let raycast2 = new Vector3(this.mesh.position.x, this.mesh.position.y + 0.5, this.mesh.position.z - .25);
        let ray2 = new Ray(raycast2, Vector3.Up().scale(-1), 1.5);
        let pick2 = this._scene.pickWithRay(ray2, predicate);

        let raycast3 = new Vector3(this.mesh.position.x + .25, this.mesh.position.y + 0.5, this.mesh.position.z);
        let ray3 = new Ray(raycast3, Vector3.Up().scale(-1), 1.5);
        let pick3 = this._scene.pickWithRay(ray3, predicate);

        let raycast4 = new Vector3(this.mesh.position.x - .25, this.mesh.position.y + 0.5, this.mesh.position.z);
        let ray4 = new Ray(raycast4, Vector3.Up().scale(-1), 1.5);
        let pick4 = this._scene.pickWithRay(ray4, predicate);

        if (pick.hit && !pick.getNormal().equals(Vector3.Up())) {
            if(pick.pickedMesh.name.includes("stair")) { 
                return true; 
            }
        } else if (pick2.hit && !pick2.getNormal().equals(Vector3.Up())) {
            if(pick2.pickedMesh.name.includes("stair")) { 
                return true; 
            }
        }
        else if (pick3.hit && !pick3.getNormal().equals(Vector3.Up())) {
            if(pick3.pickedMesh.name.includes("stair")) { 
                return true; 
            }
        }
        else if (pick4.hit && !pick4.getNormal().equals(Vector3.Up())) {
            if(pick4.pickedMesh.name.includes("stair")) { 
                return true; 
            }
        }
        return false;
    }
    private _updateGroundDetection(): void {
        if(!this.mesh){
            return;
        }
        const is_ground = this._isGrounded();

        if (!is_ground) {
            if (this._checkSlope() && this._gravity.y <= 0) {
                //if you are considered on a slope, you're able to jump and gravity wont affect you
                this._gravity.y = 0;
                this._jumpCount = 1;
                this._grounded = true;
            } else {
                //keep applying gravity
                this._gravity = this._gravity.addInPlace(Vector3.Up().scale(this._delta_time * PlayerController.GRAVITY));
                this._grounded = false;
            }
        }
        //limit the speed of gravity to the negative of the jump power
        if (this._gravity.y < -PlayerController.JUMP_FORCE) {
            this._gravity.y = -PlayerController.JUMP_FORCE;
        }
        //下落过程
        if(this._gravity.y <0 && this._jumped){
            this._isFalling = true;
        }
        this._moveDirection = this._moveDirection.addInPlace(this._gravity);
        this.mesh.moveWithCollisions(this._moveDirection);

        if (this._isGrounded()) {
            this._gravity.y = 0;
            this._grounded = true;
            this._lastGroundPos.copyFrom(this.mesh.position);

            this._jumpCount = 1;
            this._isFalling = false;
            this._jumped = false;
        }
        if(this._input.jumpKeyDown && this._jumpCount >0){
            this._gravity.y = PlayerController.JUMP_FORCE;
            this._jumpCount--;
            this._jumped = true;
            this._isFalling = false;
        }
    }
    private _floorRaycast(offsetX:number,offsetZ:number,distance:number):boolean{
        if(!this.mesh){
            return false;
        }
        const pos = new Vector3(
            this.mesh.position.x + offsetX,
            this.mesh.position.y + 0.5,
            this.mesh.position.z + offsetZ);

        const ray = new Ray(pos,Vector3.Up().scale(-1),distance);
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
    private _isGrounded(): boolean {
        if (this._floorRaycast(0, 0, 0.6)) {
            return true;
        } else {
            return false;
        }
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

    private _animatePlayer(): void {
        if (!this._dashPressed && !this._isFalling && !this._jumped 
            && (this._input.inputMap["ArrowUp"] //|| this._input.mobileUp
            || this._input.inputMap["ArrowDown"] //|| this._input.mobileDown
            || this._input.inputMap["ArrowLeft"] //|| this._input.mobileLeft
            || this._input.inputMap["ArrowRight"] //|| this._input.mobileRight)
            )){

            this._curAnims = this._run;
            // this.onRun.notifyObservers(true);
        } 
        else if (this._jumped && !this._isFalling && !this._dashPressed) {
            this._curAnims = this._jump;
        } 
        else if (!this._isFalling && this._grounded) {
            this._curAnims = this._idle;
            //only notify observer if it's playing
            // if(this.scene.getSoundByName("walking").isPlaying){
            //     this.onRun.notifyObservers(false);
            // }
        } else if (this._isFalling) {
            this._curAnims = this._land;
        }

        //Animations
        if(this._curAnims != null && this._preAnims !== this._curAnims){
            this._preAnims.stop();
            this._curAnims.play(this._curAnims.loopAnimation);
            this._preAnims = this._curAnims;
        }
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
                gravity.y = PlayerController.GRAVITY;
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
                console.log(gravity);
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
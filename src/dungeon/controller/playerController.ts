import { 
    TransformNode, 
    ShadowGenerator, 
    Scene, 
    Mesh, 
    UniversalCamera, 
    Vector3, 
    Camera, 
    Quaternion, 
    Ray, ActionManager, ExecuteCodeAction, AnimationGroup, ArcRotateCamera, AxesViewer, Color3, Color4, Engine, HemisphericLight, FreeCamera, MeshBuilder, Matrix, RayHelper, FollowCamera, Axis } from "@babylonjs/core";
import InputController from './inputController';
import Weapon from "../weapon/weapon";
import FireBall from "../weapon/fireball";
import { 
    AdvancedDynamicTexture,Rectangle, Ellipse,
    InputText,Slider,
    Button,Container, Control,
    StackPanel,TextBlock } from "@babylonjs/gui";

export default class PlayerController extends TransformNode {
    public camera;
    public scene: Scene;
    private _input: InputController;

    private _h: number;
    private _v: number;
    private _inputAmt: number;
    private _moveDirection: Vector3 = new Vector3();
    private _delta_time: number = 0;

    //Player
    public mesh: Mesh; //outer collisionbox of player

    //const values
    private static readonly PLAYER_SPEED: number = 0.45;
    private static readonly JUMP_FORCE: number = 0.80;
    private static readonly GRAVITY: number = -2.8;
    private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.5934119456780721, 0, 0);

    //角色移动速度
    private _move_speed:number =0;

    private _gravity: Vector3 = new Vector3();
    private _lastGroundPos: Vector3 = new Vector3();
    private _grounded: Boolean = true;
    private _jumpCount: number = 1;

    private win: boolean = false;

    private _action_0:AnimationGroup;
    private _action_1:AnimationGroup;
    private _idle: AnimationGroup;
    private _jump: AnimationGroup;
    private _death :AnimationGroup;
    private _back:AnimationGroup;
    private _fly:AnimationGroup;
    private _walk:AnimationGroup;

    private _preAnims: AnimationGroup;
    private _curAnims: AnimationGroup;

    //下落
    private _isFalling: boolean = false;

    private _walking: boolean = false;

    //跳起
    private _jumped: boolean = false;

    private _dashPressed: boolean = false;
    private _canDash: boolean = false;

    private _decceleration:Vector3;
    private _acceleration:Vector3;
    private _velocity:Vector3;

    public dashTime: number = 0;

    private _weapon:Weapon;

    private _engine:Engine;
    private _canvas:HTMLCanvasElement;
    
    constructor(assets: Mesh, scene: Scene,
        shadowGenerator: ShadowGenerator,
         input?: InputController, animations?: AnimationGroup[],
         engine?:Engine,
         canvas?:HTMLCanvasElement) {
        super("player_controller", scene);

        this.scene = scene;
        this._engine = engine;

        this._canvas = canvas;
        this.scene.collisionsEnabled = true;

        this.mesh = assets;
        this.mesh.parent = this;

        this._setupPlayerCamera();
        this._input = input;

        this._action_0 = animations[0];
        this._action_1 = animations[1];
        this._back = animations[2];
        this._death = animations[3];
        this._fly = animations[4];
        this._idle = animations[5];
        this._jump = animations[6];
        this._walk = animations[7];

        this._decceleration = new Vector3(-0.0005, -0.0001, -50.0);
        this._acceleration = new Vector3(1, 0.25, 50.0);
        this._velocity = new Vector3(0, 0, 0);

        // this.mesh.actionManager.registerAction(new ExecuteCodeAction({
        //     trigger: ActionManager.OnIntersectionEnterTrigger,
        //     parameter: this.scene.getMeshByName("ground")
        // }, () => {
        //     this.mesh.position.copyFrom(this._lastGroundPos);
        // }));

        this._setUpAnimations();

        // this._moveMessageBubble();
    }
    /**
     * 
     * 将武器添加到player身体上
     * @param weapon 
     */
    public attachWeapon(weapon:Weapon){
        this._weapon = weapon;
        this._weapon.attachToPlayer(this.mesh);
    }

    public attack(target:Mesh){
        if(this._weapon && this._weapon.attackable()){
            this._weapon.attack(target);
        }else if(this._weapon){
            const weapon = new FireBall(this._scene);
            this.attachWeapon(weapon as any);
            this.attack(null);
        }
    }

    /**
     * 
     * 播放角色动画
     *
     * 
     */
    private _animatePlayer(): void {
        if (!this._dashPressed && !this._isFalling && !this._jumped
            && (this._input.forward
                || this._input.backward)) {
            this._curAnims = this._walk;
        }
        else if (this._jumped && !this._isFalling && !this._dashPressed) {
            this._curAnims = this._jump;
        }
        else if (!this._isFalling && this._grounded) {
            this._curAnims = this._idle;
        } 

        //Animations
        if (this._curAnims != null && this._preAnims !== this._curAnims) {
            this._preAnims.stop();
            this._curAnims.play(this._curAnims.loopAnimation);
            this._preAnims = this._curAnims;
        }
    }

    private _floorRaycast(offsetX: number, offsetZ: number, distance: number): boolean {
        const pos = new Vector3(
            this.mesh.position.x + offsetX,
            this.mesh.position.y + 0.5,
            this.mesh.position.z + offsetZ);

            // MeshBuilder.CreateLines("test",
            // {
            //     points:[this.mesh.position,pos]
            // });
            
        const ray = new Ray(pos, Vector3.Up().scale(-1), distance);
        const predicate = (mesh) => {
            return mesh.isPickable && mesh.isEnabled();
        }
        let pick = this.scene.pickWithRay(ray, predicate);

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
    
    private _updateFromControll(): void {
        if(this._input.attackKeys.E){
            this.attack(null);
        }
        this._delta_time = this.scene.getEngine().getDeltaTime() / 1000.0;

        const velocity = this._velocity;
        const frameDecceleration = new Vector3(
            velocity.x * this._decceleration.x,
            velocity.y * this._decceleration.y,
            velocity.z * this._decceleration.z
        );
        frameDecceleration.scaleInPlace(this._delta_time);
        frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
            Math.abs(frameDecceleration.z), Math.abs(velocity.z));

        velocity.addInPlace(frameDecceleration);

        let _Q = new Quaternion();
        const _A = new Vector3();
        let _R = this.mesh.rotationQuaternion;

        const acc = this._acceleration.clone();
        if (this._input.running) {
            acc.scaleInPlace(2.0);
        }
        let forward = new Vector3(0, 0, -1);

        if (this._input.forward) {
            velocity.z += acc.z * this._delta_time;
        }
        if (this._input.backward) {
            velocity.z -= acc.z * this._delta_time;
        }

        if (this._input.left) {
            _A.set(0, 1, 0);
            _Q = Quaternion.RotationAxis(_A, 4.0 * -Math.PI * this._delta_time * this._acceleration.y);
            _R = _R.multiply(_Q);
        }

        if (this._input.right) {
            _A.set(0, 1, 0);
            _Q = Quaternion.RotationAxis(_A, 4.0 * Math.PI * this._delta_time * this._acceleration.y);
            _R = _R.multiply(_Q);
        }

        //babylonjs quaternion.multiply 方法有问题，
        //zero multiply一个不为零quaternion，结果为0
        //这个运算应该是错的。
        if(_R.length()===0){
            this.mesh.rotationQuaternion = _Q;
        }else{
            this.mesh.rotationQuaternion = _R;
        }

        //静止状态
        if(velocity.length() === 0){
            this._moveDirection = Vector3.Zero();
            return;
        }
        
        if(forward.length() !==0){
            //applyRotationQuaternion 旋转的四元祖信息
            forward = forward.applyRotationQuaternion(this.mesh.rotationQuaternion);
            forward.normalize();

            forward.scaleInPlace(velocity.z * this._delta_time);

            this._moveDirection = forward;
        }
        // else{
        //     this._moveDirection = velocity;
        // }
        return;
    }
    
    private _updateGroundDetection(): void {
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
        if (this._gravity.y < 0 && this._jumped) {
            this._isFalling = true;
        }

        this._moveDirection = this._moveDirection.addInPlace(this._gravity);
 
        this.mesh.moveWithCollisions(this._moveDirection);

        this._walking = true;

        if (this._isGrounded()) {
            this._gravity.y = 0;
            this._grounded = true;
            this._lastGroundPos.copyFrom(this.mesh.position);

            this._jumpCount = 1;
            this._isFalling = false;
            this._jumped = false;
        }
        if (this._input.jumpKeyDown && this._jumpCount > 0) {
            this._gravity.y = PlayerController.JUMP_FORCE;
            this._jumpCount--;
            this._jumped = true;
            this._isFalling = false;
            this._walking = false;
        }
    }

    private _updateCamera(): void {

    }

    private _beforeRenderUpdate(): void {
        this._updateFromControll();
        this._updateGroundDetection();

        this._animatePlayer();

        this._moveMessageBubble();
    }

    public activatePlayerCamera(): UniversalCamera {
        this.scene.registerBeforeRender(() => {
            this._beforeRenderUpdate();
            this._updateCamera();
        })
        return this.camera;
    }

   
    private _moveMessageBubble(){
        // this.camera.computeWorldMatrix(true);
        // this.mesh.computeWorldMatrix(true);
        // const camera_target_pos = this.mesh.getAbsolutePosition().add(this.camera.position);
        
        let camera_target_pos = this.camera.position.clone();
        const quaternion = this.mesh.rotationQuaternion;

        camera_target_pos = camera_target_pos.applyRotationQuaternion(quaternion);

        const player_pos = this.mesh.position.clone();
        player_pos.y += 0.6;
        const ray = new Ray(camera_target_pos,player_pos.subtract(camera_target_pos));
        
        // const rayhelper = new RayHelper(ray);
        // rayhelper.show(this.scene);
        let bubble = document.getElementById('messageBubble');
        // 执行射线检测
        var hit = this.scene.pickWithRay(ray);
        if (hit && hit.pickedMesh && 
            !hit.pickedMesh.name.includes("floor")) {
                bubble.style.display = "none";
        } else {
            // 在你的动画循环中
            let position = this.mesh.getAbsolutePosition().clone();
            position.y += 2;
            // 将3D坐标转换为屏幕坐标
            let screenCoords = Vector3.Project(
                position,
                Matrix.IdentityReadOnly,
                this._scene.getTransformMatrix(),
                this.camera.viewport.toGlobal(
                    this._engine.getRenderWidth(), 
                    this._engine.getRenderHeight())
            );
            // 更新HTML元素的位置
            bubble.style.left = `${screenCoords.x + 20}px`;
            bubble.style.top = `${screenCoords.y}px`;
            bubble.style.display = "block";

            this._showMessageBubble("shit ok fuck \n sb fuck idle");
        }
    }
    private _showMessageBubble(message) {
        const bubble = document.getElementById('messageBubble');
        const talktext = bubble.getElementsByClassName("talktext")[0] as HTMLDivElement;
        talktext.innerHTML = message;
        bubble.style.display = 'block';
    }
    
    private _hideMessageBubble() {
        var bubble = document.getElementById('messageBubble');
        bubble.style.display = 'none';
    }
    private _setupPlayerCamera(): Camera {
        //our actual camera that's pointing at our root's position
        this.camera = new UniversalCamera("cam", new Vector3(0, 20, 30), this.scene);

        // this.camera.rotationQuaternion = Quaternion.Zero();
        // this._scene.getMeshByName("outer").position = this._scene.getTransformNodeByName("start_pos").getAbsolutePosition(); 
        this.camera.lockedTarget = this.mesh;
        this.camera.fov = 0.47350045992678597;

        this.camera.parent = this.mesh;
        this.camera.attachControl(true);
        this.camera.inputs.clear();

        // this.camera.rotationQuaternion = new Quaternion(0,1,0,0);
        this.scene.activeCamera = this.camera;

        return this.camera;
    }

    private _checkSlope(): boolean {
        //only check meshes that are pickable and enabled (specific for collision meshes that are invisible)
        let predicate = function (mesh) {
            return mesh.isPickable && mesh.isEnabled();
        }

        //4 raycasts outward from center
        let raycast = new Vector3(this.mesh.position.x, this.mesh.position.y + 0.5, this.mesh.position.z + .25);
        let ray = new Ray(raycast, Vector3.Up().scale(-1), 1.5);
        let pick = this.scene.pickWithRay(ray, predicate);

        let raycast2 = new Vector3(this.mesh.position.x, this.mesh.position.y + 0.5, this.mesh.position.z - .25);
        let ray2 = new Ray(raycast2, Vector3.Up().scale(-1), 1.5);
        let pick2 = this.scene.pickWithRay(ray2, predicate);

        let raycast3 = new Vector3(this.mesh.position.x + .25, this.mesh.position.y + 0.5, this.mesh.position.z);
        let ray3 = new Ray(raycast3, Vector3.Up().scale(-1), 1.5);
        let pick3 = this.scene.pickWithRay(ray3, predicate);

        let raycast4 = new Vector3(this.mesh.position.x - .25, this.mesh.position.y + 0.5, this.mesh.position.z);
        let ray4 = new Ray(raycast4, Vector3.Up().scale(-1), 1.5);
        let pick4 = this.scene.pickWithRay(ray4, predicate);

        if (pick.hit && !pick.getNormal().equals(Vector3.Up())) {
            if (pick.pickedMesh.name.includes("stair")) {
                return true;
            }
        } else if (pick2.hit && !pick2.getNormal().equals(Vector3.Up())) {
            if (pick2.pickedMesh.name.includes("stair")) {
                return true;
            }
        }
        else if (pick3.hit && !pick3.getNormal().equals(Vector3.Up())) {
            if (pick3.pickedMesh.name.includes("stair")) {
                return true;
            }
        }
        else if (pick4.hit && !pick4.getNormal().equals(Vector3.Up())) {
            if (pick4.pickedMesh.name.includes("stair")) {
                return true;
            }
        }
        return false;
    }
    
    private _setUpAnimations(): void {
        this.scene.stopAllAnimations();

        this._idle.loopAnimation = true;
        this._walk.loopAnimation = true;
        //initialize current and previous
        this._curAnims = this._idle;
        this._preAnims = this._walk;
    }

}
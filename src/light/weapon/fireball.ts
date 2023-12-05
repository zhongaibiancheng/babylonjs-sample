import { Color4, Mesh, MeshBuilder, ParticleSystem, PhysicsImpostor, Quaternion, Scene, Texture, TransformNode, Vector3 } from "@babylonjs/core";

//用来控制火球的状态
enum STATE{
    //刚开始生成 可以随着player移动
    STOP=1,

    //朝着目标开始行进
    RUNNING,

    //撞击到了目标物
    DEAD
}

export default class FireBall extends TransformNode{
    private _scene_mine:Scene;
    private _ball:Mesh;
    private _particle:ParticleSystem;

    private _player:Mesh;

    private _state:STATE;
    private _velocity:Vector3;

    public bullet:Mesh;

    constructor(scene:Scene){
        super("fireball");
        this._scene = scene;

        this._state = STATE.STOP;
        this._velocity = Vector3.Zero();

        this._create();

        this._scene.registerBeforeRender(()=>{
            if(this._state === STATE.STOP){//
                if(this._ball && this._player){
                    this._ball.rotationQuaternion = this._player.rotationQuaternion.clone();

                    const pos = this._player.position.clone();
                    this._ball.position.x = pos.x;
                    this._ball.position.z = pos.z;
                }
            }else if(this._state === STATE.RUNNING){
                // this._ball.position.addInPlace(this._velocity);
            }else if(this._state === STATE.DEAD){
                this._velocity = Vector3.Zero();
                this._ball.isVisible = false;
                this._particle.stop();
            }
        })
    }

    public attachToPlayer(player:Mesh){
        this._player = player;

        this._particle.start();
        // this._ball.parent = player;
        const pos = this._player.position.clone();
        this._ball.position.x = pos.x;
        this._ball.position.z = pos.z;

        this._ball.position.y = this._player.position.y + 1.4;

        this._ball.physicsImpostor.sleep();
        this._state = STATE.STOP;
    }

    public attackable(){
        return this._state === STATE.STOP;
    }
    public attack(target:Mesh){

        if(this._state === STATE.STOP){
            let forward = new Vector3(0, 0, -1);
            
            this._player.computeWorldMatrix(true);

            let facing = forward.applyRotationQuaternion(this._player.rotationQuaternion);
            facing.normalize();

            this._velocity = facing.scaleInPlace(5);
            this._ball.physicsImpostor.wakeUp();
            this._state = STATE.RUNNING;
            this._ball.physicsImpostor.applyImpulse(this._velocity,this._ball.getAbsolutePosition());

        }
    }
    private _create(){
        this._ball = MeshBuilder.CreateSphere("fireball",{
            diameter:0.1,segments:32});

        this._ball.isVisible = true;
        this._ball.rotationQuaternion = Quaternion.Zero();

        this.bullet = this._ball;

        this._particle = this._createParticle();

        this._ball.physicsImpostor = new PhysicsImpostor(
            this._ball,
            PhysicsImpostor.SphereImpostor,
            {
                mass:0.1
            },
            this._scene);

        this._ball.physicsImpostor.sleep();
    }
    /**
     * 生成火球particle
     * 
     */
    private _createParticle(){
        let pSystem = new ParticleSystem(
            "fireball_particles", 
            20000, 
            this._scene);
		pSystem.emitter = this._ball;
		pSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;

		pSystem.particleTexture = new Texture("./light/textures/flare.png", this._scene);
		pSystem.minEmitBox = new Vector3(-0.2, -0.2, -0.2);
		pSystem.maxEmitBox = new Vector3(0.2, 0.2, 0.2);
		pSystem.color1 = new Color4(1.0, 0.05, 0.05, .9);
		pSystem.color2 = new Color4(0.85, 0.05, 0, .9);
		pSystem.colorDead = new Color4(.5, .02, 0, .5);
		pSystem.minSize = 0.7;
		pSystem.maxSize = 0.8;
		pSystem.minLifeTime = 0.1;
		pSystem.maxLifeTime = 0.15;
		pSystem.emitRate = 500;
		pSystem.gravity = new Vector3(0, 0, 0);
		pSystem.direction1 = new Vector3(0, .05, 0);
		pSystem.direction2 = new Vector3(0, -.05, 0);
		pSystem.minAngularSpeed = 0.15;
		pSystem.maxAngularSpeed = 0.25;
		pSystem.minEmitPower = 0.5;
		pSystem.maxEmitPower = 1;
		pSystem.updateSpeed = 0.008;

        return pSystem;
    }
}
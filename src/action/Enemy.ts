import { AnimationGroup, Mesh, Quaternion, Scene, SceneLoader, Vector3 } from "@babylonjs/core";
import { 
    AdvancedDynamicTexture,Rectangle, 
    InputText,Slider,
    Button,Container, Control,
    StackPanel,TextBlock } from "@babylonjs/gui";

export default class Enemy{
    _id:string;
    _name:string;

    _animations:Array<AnimationGroup>;

    _scene:Scene;
    _player:Mesh;

    _health:number = 100.0;
    _deathAnimation:AnimationGroup;

    _healthBar:Rectangle;

    constructor(name:string,scene:Scene){

        this._id = this._generateId();
        this._name = name;
        this._scene = scene;

        this._loadModel();

        // 在其他对象中监听自定义消息
        window.addEventListener("damageMessage", 
        this._damageMessageHandler.bind(this));
    }

    /**
     * 被攻击的消息处理函数
     * @param event 
     */
    private _damageMessageHandler(event){
        var message = (event as any).detail;
        var objB = (event as any).objB;
        var damageVal =(event as any).damageVal;
        if(objB.id === this._id){//被攻击的是自己
            this._health -= damageVal;
            if(this._health > 0){
                this._updateHealthBar();
            }else{
                this._deathAnimation.play(false);

                setTimeout(()=>{
                    this._dispose();
                    window.removeEventListener("damageMessage", this._damageMessageHandler.bind(this))
                },1000);
            }
        }
    }

    private _dispose(){
        this._player.dispose();
        this._healthBar.dispose();
    }

    private _updateHealthBar(){
        var healthPercentage = this._health / 100;
        this._healthBar.width = (200 * healthPercentage) + "px"; // 根据生命值百分比调整宽度
    }

    private async _loadModel(){
        const result = await SceneLoader.ImportMeshAsync(null,
            "./dungeon/models/",
            "boy.glb",
            this._scene);
        
        this._player = result.meshes[0] as Mesh;
        this._player.rotationQuaternion = new Quaternion(0,0,0,0);

        this._player.position = this._scene.getTransformNodeById("enemy_001").getAbsolutePosition();
        this._player.scaling.setAll(2);

        this._animations = result.animationGroups;

        console.log(this._animations);
        this._deathAnimation = this._animations[0];

        this._createHealthBar();
    }

    private _createHealthBar(){
        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        var healthBar = new Rectangle();
        healthBar.width = "200px";
        healthBar.height = "20px";
        healthBar.cornerRadius = 10;
        healthBar.color = "red";
        healthBar.thickness = 1;
        healthBar.linkOffsetX = "20px";
        healthBar.linkOffsetY = "-50px";
        advancedTexture.addControl(healthBar);

        this._healthBar = healthBar;
        // 将生命值条绑定到角色模型
        this._scene.registerBeforeRender( ()=>{
            this._healthBar.linkWithMesh(this._player);
            // this._healthBar.linkOffsetX =  "10px";
            // this._healthBar.linkOffsetY =  "30px";
        });
    }

    private _generateId():string{
        return "";
    }

    get id(): string {
        return this._id;
    }

    public 

}
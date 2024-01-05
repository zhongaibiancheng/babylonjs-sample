import { AnimationGroup, Mesh, Quaternion, Scene, SceneLoader, Vector3 } from "@babylonjs/core";
import { 
    AdvancedDynamicTexture,Rectangle, 
    InputText,Slider,
    Button,Container, Control,
    StackPanel,TextBlock } from "@babylonjs/gui";
import { v4 as uuid } from 'uuid';
    
export default class Enemy{
    _id:string;
    _name:string;

    _animations:Array<AnimationGroup>;

    _scene:Scene;
    _player:Mesh;

    _health:number = 100.0;
    _deathAnimation:AnimationGroup;

    _healthBar:Rectangle;
    _healthBarContainer:Rectangle;
    _healthText:TextBlock;

    _idle:AnimationGroup;

    constructor(name:string,scene:Scene){
        this._id = this._generateId();
        this._name = name;
        this._scene = scene;

        this._loadModel();

        // 在其他对象中监听自定义消息
        window.addEventListener("damageMessage", this._damageMessageHandler.bind(this));
    }

    /**
     * 被攻击的消息处理函数
     * @param event 
     */
    private _damageMessageHandler(event){
        var message = (event as any).detail;
        var objB = (message as any).objB;
        var damageVal =(message as any).damageVal;
        if(objB.id === this._id){//被攻击的是自己
            this._health -= damageVal;
            if(this._health > 0){
                this._updateHealthBar();
            }else if(this._health ===0){
                this._deathAnimation.play(false);
                this._dispose();
                setTimeout(()=>{
                    window.removeEventListener("damageMessage", this._damageMessageHandler.bind(this))
                },2000);
            }
        }
    }

    private _dispose(){
        this._player.dispose();
        this._healthBarContainer.dispose();
        this._healthBar.dispose();
    }

    private _updateHealthBar(){
        var healthPercentage = this._health / 100;
        this._healthText.text = `${this._health}%`;
        this._healthBar.width = (100 * healthPercentage) + "px"; // 根据生命值百分比调整宽度
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    private async _loadModel(){
        const result = await SceneLoader.ImportMeshAsync(null,
            "./dungeon/models/",
            "boy.glb",
            this._scene);
        
        this._player = result.meshes[0] as Mesh;
        this._player.rotationQuaternion = new Quaternion(0,0,0,0);

        // this._player.position = this._scene.getTransformNodeById("enemy_001").getAbsolutePosition();
        this._player.position = new Vector3(
            this.getRandomInt(-10,10),
            0,
            this.getRandomInt(-20,20));

        this._player.scaling.setAll(2);

        this._player.checkCollisions = true;
        
        this._animations = result.animationGroups;

        this._idle = this._animations[18];
        this._deathAnimation = this._animations[4];

        this._idle.play(true);

        this._createHealthBar();
    }

    private _createHealthBar(){
        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        // 创建一个2D矩形作为健康条的底部背景
        var healthBarBackground = new Rectangle();
        healthBarBackground.width = "100px";
        healthBarBackground.height = "16px";
        healthBarBackground.cornerRadius = 8;
        healthBarBackground.color = "white";
        healthBarBackground.background = "black";

        this._healthBarContainer = healthBarBackground;
        this._healthBarContainer.linkOffsetX = "20px";
        this._healthBarContainer.linkOffsetY = "-50px";

        advancedTexture.addControl(healthBarBackground);

        // 创建一个2D矩形作为健康条的显示
        var healthBar = new Rectangle();
        healthBar.width = "100%";
        healthBar.height = "100%";
        healthBar.color = "red";
        healthBar.background="red";

        healthBar.cornerRadius = 10;
        healthBar.thickness = 1;
        healthBar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        healthBarBackground.addControl(healthBar);
        // advancedTexture.addControl(healthBar);

        this._healthBar = healthBar;

        var text1 = new TextBlock("health");
    
        // text1.fontFamily = "Helvetica";
        // text1.textWrapping = true;
        
        text1.text = `${this._health}%`;
        text1.color = "white";
        text1.fontSize = "10px";

        text1.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

        this._healthText = text1;
        healthBarBackground.addControl(text1);

        // 将生命值条绑定到角色模型
        this._scene.registerBeforeRender( ()=>{
            this._healthBarContainer.linkWithMesh(this._player);
        });
    }

    private _generateId():string{
        return uuid();
    }

    get id(): string {
        return this._id;
    }

    get player():Mesh{
        return this._player;
    }
}
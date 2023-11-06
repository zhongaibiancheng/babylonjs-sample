import { Camera, Effect, PostProcess, Scene } from "@babylonjs/core";
import { TextBlock, StackPanel, AdvancedDynamicTexture, Image, Button, Rectangle, Control, Grid } from "@babylonjs/gui";

export default class GUI{
    private _scene:Scene;
    private _camera:Camera;

    constructor(scene,camera){
        this._scene = scene;
        this._camera = camera;

        const gui = AdvancedDynamicTexture.CreateFullscreenUI("ui");
        
        //create header
        this._createHeader(gui);

    }
    private _createHeader(parent:AdvancedDynamicTexture){
        const rect = new Rectangle();
        rect.width = "350px";
        rect.height = "30px";

        rect.thickness = 0;
        rect.left = "20px";
        rect.top ="15px";
        rect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        rect.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        //heath bar
        const health_bar = new Image("background","./demo/sprites/health_bar.png");
        health_bar.width="105px";
        health_bar.height = "24px";
        health_bar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        health_bar.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        rect.addControl(health_bar);

        const rect_coin = new Rectangle();
        rect_coin.thickness = 0;
        rect_coin.width  = "70px";
        rect_coin.height = "25px";
        rect_coin.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        rect_coin.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

        const coin = new Image("bar_coin","./demo/sprites/bar_star.png");
        coin.width="68px";
        coin.height = "25px";
        
        coin.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        coin.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

        rect_coin.addControl(coin);

        //text
        const coin_count = new TextBlock("coin_count","");
        coin_count.text = "9999";
        coin_count.fontSize = "12px";
        coin_count.paddingLeft = "15px";
        coin_count.paddingTop = "2px";
        coin_count.color = "white";

        coin_count.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        coin_count.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        rect_coin.addControl(coin_count);

        rect.addControl(rect_coin);

        //diamond
        const rect_diamond = new Rectangle();
        rect_diamond.thickness = 0;
        rect_diamond.width  = "70px";
        rect_diamond.height = "25px";
        rect_diamond.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        rect_diamond.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

        const diamond = new Image("bar_diamond","./demo/sprites/bar_diamond.png");
        diamond.width="68px";
        diamond.height = "25px";
        diamond.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        diamond.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        rect_diamond.addControl(diamond);

        //text
        const diamond_count = new TextBlock("diamond_count","");
        diamond_count.text = "9999";
        diamond_count.fontSize = "12px";
        diamond_count.paddingLeft = "15px";
        diamond_count.paddingTop = "2px";
        diamond_count.color = "white";

        diamond_count.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        diamond_count.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        rect_diamond.addControl(diamond_count);

        rect.addControl(rect_diamond);
        parent.addControl(rect);

        this._createButton(parent);
    }
    
    private _createButton(parent){
        const rect = new Rectangle();
        rect.thickness = 0;

        rect.width = "130px";
        rect.height = "30px";
        rect.top = "15px";
        rect.paddingRight = "20px";

        rect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        rect.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        const setting = Button.CreateImageOnlyButton(
            "setting", 
            "./demo/sprites/button/setting.png");
        setting.thickness = 0;
        setting.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        setting.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        setting.width = "30px";
        setting.height = "30px";

        rect.addControl(setting);

        const user = Button.CreateImageOnlyButton(
            "setting", 
            "./demo/sprites/button/user.png");
        user.thickness = 0;
        user.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        user.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        user.width = "30px";
        user.height = "30px";

        rect.addControl(user);

        const home = Button.CreateImageOnlyButton(
            "setting", 
            "./demo/sprites/button/home.png");
        home.thickness = 0;
        home.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        home.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        home.width = "30px";
        home.height = "30px";

        rect.addControl(home);
        parent.addControl(rect);

    }
}
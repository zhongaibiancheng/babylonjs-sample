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

        user.onPointerDownObservable.add(()=>{
            this._createInventoryMenu(parent);
        });

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

    //---- Pause Menu Popup ----
    private _createInventoryMenu(parent): void {

        const inventoryMenu = new Rectangle();
        inventoryMenu.background = "green";

        inventoryMenu.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        inventoryMenu.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        inventoryMenu.height = 0.7;
        inventoryMenu.width = 0.4;
        inventoryMenu.thickness = 1;
        inventoryMenu.isVisible = true;

        const image = new Image("inventory","./demo/sprites/content.png");
        image.width = "284px";
        image.height = "376px";
        image.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        image.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        inventoryMenu.addControl(image);

        const rect = new Rectangle();
        rect.top = "60px";
        rect.left = "20px";
        rect.width = "240px";
        rect.height = "310px";

        rect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        rect.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        const rect_right = new Rectangle();
        rect_right.top = "60px";
        rect_right.left = "260px";
        rect_right.width = "240px";
        rect_right.height = "310px";

        rect_right.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        rect_right.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        const right = new Image("content_detail","./demo/sprites/content_detail.png");
        rect_right.addControl(right);
        inventoryMenu.addControl(rect_right);

        const item = new Image("inventory_item","./demo/sprites/inventory/item.png");

        const grid = new Grid();
        grid.height = "240px";
        grid.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        for(let i=0;i<5;i++){
            grid.addRowDefinition(0.2);
            grid.addColumnDefinition(0.2);
        }
        const items=["sword.png","book.png","key.png","treasure.png"];

        for(let i=0;i<5;i++){
            for(let j=0;j<5;j++){
                grid.addControl(item.clone(),i,j);

                if(i*5+j<items.length){
                    const sword = new Image("sword","./demo/sprites/inventory/"+items[i*5+j]);
                    sword.width = "25px";
                    sword.height = "25px";
                    grid.addControl(sword,i,j);
                }
            }
        }
        rect.addControl(grid);

        inventoryMenu.addControl(rect);

        const bottom_grid = new Grid();
        bottom_grid.height = "50px";
        bottom_grid.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

        for(let i=0;i<5;i++){
            bottom_grid.addColumnDefinition(0.2);
            bottom_grid.addControl(item.clone(),0,i);
        }
        rect.addControl(bottom_grid);
        parent.addControl(inventoryMenu);
/*
        //background image
        const image = new Image("pause", "sprites/pause.jpeg");
        pauseMenu.addControl(image);

        //stack panel for the buttons
        const stackPanel = new StackPanel();
        stackPanel.width = .83;
        pauseMenu.addControl(stackPanel);

        const resumeBtn = Button.CreateSimpleButton("resume", "RESUME");
        resumeBtn.width = 0.18;
        resumeBtn.height = "44px";
        resumeBtn.color = "white";
        resumeBtn.fontFamily = "Viga";
        resumeBtn.paddingBottom = "14px";
        resumeBtn.cornerRadius = 14;
        resumeBtn.fontSize = "12px";
        resumeBtn.textBlock.resizeToFit = true;
        resumeBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        resumeBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        stackPanel.addControl(resumeBtn);

        this._pauseMenu = pauseMenu;

        //when the button is down, make menu invisable and remove control of the menu
        resumeBtn.onPointerDownObservable.add(() => {
            this._pauseMenu.isVisible = false;
            this._playerUI.removeControl(pauseMenu);
            this.pauseBtn.isHitTestVisible = true;
            
            //game unpaused, our time is now reset
            this.gamePaused = false;
            this._startTime = new Date().getTime();

            //--SOUNDS--
            this._scene.getSoundByName("gameSong").play();
            this._pause.stop();

            if(this._sparkWarningSfx.isPaused) {
                this._sparkWarningSfx.play();
            }
            this._sfx.play(); //play transition sound
        });

        const controlsBtn = Button.CreateSimpleButton("controls", "CONTROLS");
        controlsBtn.width = 0.18;
        controlsBtn.height = "44px";
        controlsBtn.color = "white";
        controlsBtn.fontFamily = "Viga";
        controlsBtn.paddingBottom = "14px";
        controlsBtn.cornerRadius = 14;
        controlsBtn.fontSize = "12px";
        resumeBtn.textBlock.resizeToFit = true;
        controlsBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        controlsBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

        stackPanel.addControl(controlsBtn);

        //when the button is down, make menu invisable and remove control of the menu
        controlsBtn.onPointerDownObservable.add(() => {
            //open controls screen
            this._controls.isVisible = true;
            this._pauseMenu.isVisible = false;

            //play transition sound
            this._sfx.play();
        });

        const quitBtn = Button.CreateSimpleButton("quit", "QUIT");
        quitBtn.width = 0.18;
        quitBtn.height = "44px";
        quitBtn.color = "white";
        quitBtn.fontFamily = "Viga";
        quitBtn.paddingBottom = "12px";
        quitBtn.cornerRadius = 14;
        quitBtn.fontSize = "12px";
        resumeBtn.textBlock.resizeToFit = true;
        quitBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        quitBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        stackPanel.addControl(quitBtn);

        //set up transition effect
        Effect.RegisterShader("fade",
            "precision highp float;" +
            "varying vec2 vUV;" +
            "uniform sampler2D textureSampler; " +
            "uniform float fadeLevel; " +
            "void main(void){" +
            "vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;" +
            "baseColor.a = 1.0;" +
            "gl_FragColor = baseColor;" +
            "}");
        this.fadeLevel = 1.0;

        quitBtn.onPointerDownObservable.add(() => {
            const postProcess = new PostProcess("Fade", "fade", ["fadeLevel"], null, 1.0, this._scene.getCameraByName("cam"));
            postProcess.onApply = (effect) => {
                effect.setFloat("fadeLevel", this.fadeLevel);
            };
            this.transition = true;

            //--SOUNDS--
            this.quitSfx.play();
            if(this._pause.isPlaying){
                this._pause.stop();
            }
        })
        */
    }

}
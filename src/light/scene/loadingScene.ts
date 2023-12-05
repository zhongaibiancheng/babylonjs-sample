import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { 
    Engine, Scene,
    FreeCamera,
    Vector3,
    Color4,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control } from "@babylonjs/gui";

import BaseScene from './baseScene'
import {SceneParams} from '../utils/const';

export default class LoadingScene extends BaseScene{
    constructor(engine:Engine,scene:Scene){
        super(engine,scene);
    }
    async init(params:SceneParams|undefined):Promise<Scene>{
        this._scene.detachControl();
        
        const scene = new Scene(this._engine);
        
        scene.clearColor = new Color4(1,0,0,1);

        const camera = new FreeCamera("camera2",new Vector3(0,0,0),scene);
        camera.setTarget(new Vector3(0,0,0));

        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI2");
        guiMenu.idealHeight = 720;

        //--PROGRESS DIALOGUE--
        const next = Button.CreateImageOnlyButton(
            "next", 
            "./demo/sprites/arrowBtn.png");
        next.rotation = Math.PI / 2;
        next.thickness = 0;
        next.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        next.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        next.width = "64px";
        next.height = "64px";

        guiMenu.addControl(next);

        next.onPointerUpObservable.add(() => {
            this._scene.detachControl();
            // this._engine.displayLoadingUI(); //if the game hasn't loaded yet, we'll see a loading screen

            // canplay = true;
            if(params && params.callback){
                params.callback();
            }
            scene.detachControl();
        });

        this._engine.displayLoadingUI();
        //--START LOADING AND SETTING UP THE GAME DURING THIS SCENE--
        await params.setup_game();

        //--WHEN SCENE IS FINISHED LOADING--
        await scene.whenReadyAsync();
        console.log("loaded assets *****");
        this._engine.hideLoadingUI();

        return scene;
    }
}
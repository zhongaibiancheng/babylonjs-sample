import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { 
    Engine, Scene,
    FreeCamera,
    Vector3,
    Color4,
    HemisphericLight,
    Mesh,
    PointLight,
    Color3,
    ShadowGenerator,
    AnimationGroup
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control } from "@babylonjs/gui";

import BaseScene from './baseScene'
import {SceneParams} from '../utils/const';
import PlayerController from "../controller/playerController";
import InputController from '../controller/inputController';
import GUI from "../ui/ui";

export default class GameScene extends BaseScene{
    _player_mesh:Mesh;
    _player:PlayerController;

    _animations:Array<AnimationGroup>;
    gui:AdvancedDynamicTexture;

    constructor(engine:Engine,scene:Scene){
        super(engine,scene);
    }
    private async _initializeGameAsync(scene): Promise<void> {
        var light0 = new HemisphericLight("HemiLight", new Vector3(0, 1, 0), scene);

        const light = new PointLight("sparklight", new Vector3(0, 0, 0), scene);
        light.diffuse = new Color3(0.08627450980392157, 0.10980392156862745, 0.15294117647058825);
        light.intensity = 35;
        light.radius = 1;
    
        const shadowGenerator = new ShadowGenerator(1024, light);
        shadowGenerator.darkness = 0.4;
    
        const input = new InputController(scene);

        //Create the player
        this._player = new PlayerController(
            this._player_mesh, 
            scene, 
            shadowGenerator,
            input,
            this._animations
            );
        
        this._player.activatePlayerCamera();
    }

    async init(params:SceneParams|undefined):Promise<Scene>{
        this._player_mesh = params.player_mesh;
        this._animations = params.animations;
        this._scene.detachControl();

        const scene = params.game_scene;
        scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098); // a color that fit the overall color scheme better

        const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        playerUI.idealHeight = 720;

        await this._initializeGameAsync(scene);
        
         //--WHEN SCENE IS FINISHED LOADING--
        await scene.whenReadyAsync();
        scene.getMeshByName("outer").position = scene.getTransformNodeByName("startPosition").getAbsolutePosition(); //move the player to the start position
        
        const gui = new GUI(scene,this._player.camera);

        return scene;
    }
}
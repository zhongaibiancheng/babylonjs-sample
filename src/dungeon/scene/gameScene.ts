import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { 
    Engine, Scene,
    Vector3,
    Color4,
    HemisphericLight,
    Mesh,
    AnimationGroup,
} from "@babylonjs/core";

import { AdvancedDynamicTexture} from "@babylonjs/gui";

import BaseScene from './baseScene'
import {SceneParams} from '../utils/const';
import PlayerController from "../controller/playerController";
import InputController from '../controller/inputController';
import GUI from "../ui/ui";

import ParticleCreator from '../particle/particle';

export default class GameScene extends BaseScene{
    _player_mesh:Mesh;
    _player:PlayerController;

    _animations:Array<AnimationGroup>;
    gui:AdvancedDynamicTexture;
    _canvas:HTMLCanvasElement;
    _colliders:[];
    
    constructor(engine:Engine,scene:Scene,canvas:HTMLCanvasElement){
        super(engine,scene);

        this._engine = engine;
        this._canvas = canvas
    }
    
    private async _initializeGameAsync(scene): Promise<void> {
        var light0 = new HemisphericLight("HemiLight", new Vector3(0, 1, 0), scene);    
        const input = new InputController(scene);

        //Create the player
        this._player = new PlayerController(
            this._player_mesh, 
            scene, 
            // shadowGenerator,
            undefined,
            input,
            this._animations,
            this._colliders,
            this._engine,
            this._canvas
            );
        
        this._player.activatePlayerCamera();
    }

    async init(params:SceneParams|undefined):Promise<Scene>{
        this._player_mesh = params.player_mesh;
        this._animations = params.animations;

        this._engine.displayLoadingUI();
        const gui = new GUI(this._scene,undefined);
        
        this._scene.detachControl();

        const scene = params.game_scene;
        scene.clearColor = new Color4(0, 0, 0);

        this._colliders = params.colliders;

        await this._initializeGameAsync(scene);
        

        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();

        return scene;
    }

   
}
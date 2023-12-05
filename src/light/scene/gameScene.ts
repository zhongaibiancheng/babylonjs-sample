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
    Animation,
    SpriteManager,
    Sprite,
    MeshBuilder,
    FreeCamera
} from "@babylonjs/core";

import { AdvancedDynamicTexture,Button,Control} from "@babylonjs/gui";

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

    constructor(engine:Engine,scene:Scene){
        super(engine,scene);

        this._engine = engine;
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
            this._engine
            );
        
        this._player.activatePlayerCamera();
    }

    async init(params:SceneParams|undefined):Promise<Scene>{
        this._player_mesh = params.player_mesh;
        this._animations = params.animations;

        this._engine.displayLoadingUI();
        this._scene.detachControl();

        const scene = params.game_scene;
        scene.clearColor = new Color4(0, 0, 0);
        // const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        // playerUI.idealHeight = 720;

        await this._initializeGameAsync(scene);
        
        scene.getMeshByName("outer").position = scene.getTransformNodeByName("start_pos").getAbsolutePosition(); //move the player to the start position

        if(params.level === 0){//toturial 
            this._createSprite(scene);
            this._createParticle(scene);
            this._waveBoard(scene);
        }else if(params.level === 1){

        }
         //--WHEN SCENE IS FINISHED LOADING--
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();

        return scene;
    }

    private _createParticle(scene){
        //创建love particle
        const node = scene.getMeshByName("love");
        node.computeWorldMatrix(true);

        const sphere = MeshBuilder.CreateSphere("emitter",{
            diameter: 0.03, 
            segments: 32
        }, scene);

        sphere.parent = node;

        const creator = new ParticleCreator(scene);
        const particle = creator.createLoveParticle(sphere);
        particle.start();

        //创建wood particle
        const wood = scene.getTransformNodeByName("wood_pos");
        const wood_particle = creator.createWoodParticle(wood);
        wood_particle.start();
    }
    /**
     * 生成精灵花草
     * @param scene 
     */
    private _createSprite(scene){
        //生成花
        const spriteManagerTrees = new SpriteManager(
            "flowerManager", 
            "./light/textures/grass_flowers.png", 
            200, 
            {width: 128, height: 128},scene);

        for(let i=1;i<4;i++){
            const node = "flower_pos_00"+i;
            const flower = scene.getTransformNodeByName(node);
            const tree = new Sprite("flower", spriteManagerTrees);
            tree.width = 1+Math.random();
            tree.height = 1+Math.random();
            tree.position = flower.getAbsolutePosition();
            tree.position.y = 0.5;
        }

        //grass
        const grassManagerTrees = new SpriteManager(
            "grass", 
            "./light/textures/grass.png", 
            2000, 
            {width: 256, height: 256},scene);

        for(let i=1;i<3;i++){
            const node = "grass_pos_00"+i;
            const flower = scene.getTransformNodeByName(node);
            const tree = new Sprite("grass", grassManagerTrees);
            tree.width = 1+Math.random();
            tree.height = 1+Math.random();
            tree.position = flower.getAbsolutePosition();
            tree.position.y = 0;
        }

        //grass weed
        const grass_weedManagerTrees = new SpriteManager(
            "grass", 
            "./light/textures/grass_weed.png", 
            2000, 
            {width: 256, height: 256},scene);

        for(let i=1;i<2;i++){
            const node = "grass_weed_pos_00"+i;
            const flower = scene.getTransformNodeByName(node);
            const tree = new Sprite("grass_weed", grass_weedManagerTrees);
            tree.width = 1+Math.random();
            tree.height = 1+Math.random();
            tree.position = flower.getAbsolutePosition();
            tree.position.y = 0.7;
        }
    }
    /**
     * 晃动board
     * @param scene 
     */
    private _waveBoard(scene){
        //board
        const board = scene.getTransformNodeByName("Placa");

        const animation = board.animations[0];
        var animationGroup = new AnimationGroup("wave board");
        animationGroup.addTargetedAnimation(animation, board);

        animationGroup.play(true);
    }
}
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { 
    Engine, Scene, ArcRotateCamera, 
    Color3,
    Vector3, HemisphericLight, Mesh, MeshBuilder, 
    AnimationGroup,
    Color4} from "@babylonjs/core";

import StartScene from './scene/startScene';
import LoadingScene from './scene/loadingScene';
import GameScene from "./scene/gameScene";
import Environment from "./environment/environment";

enum State{
    START =0,
    GAME =1,
    LOSE =2,
    LOADINGSCENE=3
}
class App{
    _engine:Engine;
    _scene:Scene;
    _game_scene:Scene;
    _canvas:HTMLCanvasElement;
    _state:State;
    _environment:Environment;

    _player_mesh:Mesh;
    _animations:Array<AnimationGroup>;

    constructor(){
        this._canvas = this._createCanvas();
        this._engine = new Engine(this._canvas,true);
        this._scene = new Scene(this._engine);

        const camera = new ArcRotateCamera(
            "camera",
            Math.PI / 2, 
            Math.PI / 2, 
            20, 
            Vector3.Zero(), 
            this._scene);

        camera.attachControl(this._canvas,true);

        this._main();
    }

    private _createCanvas(){
        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "game-canvas";
        document.body.appendChild(canvas);

        return canvas;
    }

    _main(){
        this._gotoStart();
        this._engine.runRenderLoop(()=>{
            switch(this._state){
                case State.LOADINGSCENE:
                case State.GAME:
                // case State.LOSE:
                case State.START:
                    this._scene.render();
                    break;
                default:
                    break;
            }
        })
    }
    async _gotoStart(){
        const start = new StartScene(this._engine,this._scene);
        const scene = await start.init({
            callback:this._gotoLoading.bind(this)
        });

        this._scene.dispose();
        this._scene = scene;
        this._state = State.START;
    }
    async _gotoLoading(){
        const loading = new LoadingScene(this._engine,this._scene);
        const scene = await loading.init({
            callback:this._gotoGame.bind(this),
            setup_game:this._setup_game.bind(this)
        });

        this._scene.dispose();
        this._scene = scene;
        this._state = State.LOADINGSCENE;
    }
    async _gotoGame(){
        const game = new GameScene(this._engine,this._scene);
        game.init({
            callback:undefined,
            game_scene:this._game_scene,
            player_mesh:this._player_mesh,
            animations:this._animations,
            environment:this._environment,
        });

        this._scene.dispose();
        this._scene = this._game_scene;
        this._state = State.GAME;
        this._scene.attachControl();
    }
    // async _gotoLose(){
    //     const lose = new LoseScene(this._engine,this._scene);
    //     const scene = await lose.init({callback:this._gotoStart.bind(this)});

    //     this._scene.dispose();
    //     this._scene = scene;
    //     this._state = State.LOSE;
    //     this._scene.attachControl();
    // }
    async _setup_game(){
        this._game_scene = new Scene(this._engine);
        //--CREATE ENVIRONMENT--
        const environment = new Environment(this._game_scene);
        this._environment = environment;
        await this._environment.load(); //environment
        const result = await this._environment.loadCharacterAssets();
        this._player_mesh = result.outer;
        this._animations  = result.animations;
    }
}
/* eslint-disable */
const app = new App();
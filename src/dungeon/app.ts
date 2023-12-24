import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { 
    Engine, Scene, ArcRotateCamera, 
    Vector3, HemisphericLight, Mesh,
    AnimationGroup,
    Color4,
    ExecuteCodeAction,
    ActionManager,
    FreeCamera} from "@babylonjs/core";

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
    _colliders:[];
    _animations:Array<AnimationGroup>;

    _level:number = 0;
    _starting_entrance:Boolean = false;

    constructor(){
        this._starting_entrance = false;
        // Engine.CollisionsEpsilon = 0.0000005;

        // this._canvas = this._createCanvas();
        this._canvas = document.getElementById("canvas") as HTMLCanvasElement;
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

   async _main(){
        await this._setup_game();
        await this._gotoGame();
        this._engine.runRenderLoop(()=>{
            switch(this._state){
                case State.LOADINGSCENE:
                case State.GAME:
                case State.START:
                    this._scene.render();
                    break;
                default:
                    break;
            }
        });
    }
    
    async _gotoGame(){
        const game = new GameScene(this._engine,this._scene,this._canvas);
        game.init({
            callback:undefined,
            game_scene:this._game_scene,
            player_mesh:this._player_mesh,
            animations:this._animations,
            colliders:this._colliders,
            environment:this._environment,
            level:this._level
        });

        this._scene.dispose();
        this._scene = this._game_scene;
        this._state = State.GAME;
        this._scene.attachControl();
    }

    async _setup_game(){
        this._game_scene = new Scene(this._engine);

        this._environment = new Environment();
        this._environment.setScene(this._game_scene);

        await this._environment.load(0); //environment
        const result = await this._environment.loadCharacterAssets();

        this._player_mesh = result.outer;
        this._animations  = result.animations;
        this._colliders = result.colliders;

        if(!this._player_mesh.actionManager){
            this._player_mesh.actionManager = new ActionManager(this._game_scene);
        }
        if(!this._game_scene.getMeshByName("entrance_arrow")){
            return;
        }
        this._player_mesh.actionManager.registerAction(
            new ExecuteCodeAction({
            trigger: ActionManager.OnIntersectionEnterTrigger,
            parameter: this._game_scene.getMeshByName("entrance_arrow")
        }, async () => {
            if(this._starting_entrance){
                return;
            }
            this._starting_entrance = true;
            
            this._engine.displayLoadingUI();
            this._game_scene = new Scene(this._engine);
            this._game_scene.clearColor = new Color4(0,0,1,1);

            this._environment.setScene(this._game_scene);

            const camera = new FreeCamera("camera2",
            new Vector3(0,10,0),this._game_scene);
            camera.setTarget(new Vector3(0,0,0));

            const result =  await this._environment.loadCharacterAssets();
            this._player_mesh = result.outer;
            this._animations  = result.animations;

            if(!this._player_mesh.actionManager){
                this._player_mesh.actionManager = new ActionManager(this._game_scene);
            }

            // this._level = this._level + 1;

            await this._environment.load(this._level); //environment
            
            const game = new GameScene(this._engine,this._game_scene,this._canvas);

            await game.init({
                callback:undefined,
                game_scene:this._game_scene,
                player_mesh:this._player_mesh,
                animations:this._animations,
                environment:this._environment,
                level:this._level
            });

            var light0 = new HemisphericLight("HemiLight", new Vector3(0, 1, 0), this._game_scene);    
            this._scene.dispose();
            this._scene = this._game_scene;
            this._state = State.GAME;
            this._scene.attachControl();

            await this._scene.whenReadyAsync();
            this._engine.hideLoadingUI();
        }));
    }
}
/* eslint-disable */
const app = new App();
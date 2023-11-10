import { Engine, MeshBuilder, Scene,PBRSpecularGlossinessMaterial, Vector3, Color3, CubeTexture, Texture, ContainerAssetTask, SliderConstraint, SceneLoader, AxesViewer, Color4, HemisphericLight, ArcRotateCamera } from "@babylonjs/core";
import { 
    AdvancedDynamicTexture,Rectangle, 
    InputText,Slider,
    Button,Container, Control,
    StackPanel,TextBlock } from "@babylonjs/gui";

    import "@babylonjs/loaders/glTF";

export default class GUI{
    _scene:Scene;
    _npc:any;
    canvas:HTMLCanvasElement;
    _engine:Engine;
    _camera:ArcRotateCamera;

    constructor(){
        Engine.CollisionsEpsilon = 0.00005;

        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(this.canvas);
        this._scene = new Scene(this._engine);

        this._scene.collisionsEnabled = true;

        this._scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098); // a color that fit the overall color scheme better
        const light1 = new HemisphericLight("light",new Vector3(1,1,1),this._scene);

        new AxesViewer(this._scene,4);

        this._setupPlayerCamera();
        this._loadNPC();
        this._main();

        window.addEventListener("resize",(evt)=>{
            this._engine.resize();
        });
    }
    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
    private _setupPlayerCamera(){
        this._camera = new ArcRotateCamera(
            "arcrotatecamera",
        Math.PI/2.0,
        Math.PI/2.0,
        2,
        Vector3.Zero(),
        this._scene);
        this._camera.attachControl(true);
    }
    private async _loadNPC(){
        const result = await SceneLoader.ImportMeshAsync(null,
            "/models/",
            "police_walking.glb",this._scene);
    
        const axes = new AxesViewer(this._scene,1);
        const npc = result.meshes[0];
        npc.position = new Vector3(5,0,5);

        axes.xAxis.parent = npc;
        axes.yAxis.parent = npc;
        axes.zAxis.parent = npc;
        npc.rotationQuaternion = null;

        this._npc = npc;
        const gui = AdvancedDynamicTexture.CreateFullscreenUI("ui");

        const text = new TextBlock("title","C++长老");
        text.parent = this._npc;

        gui.addControl(text);

    }
}
// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
// import "@babylonjs/loaders/glTF";
// import { 
//     Engine, Scene, ArcRotateCamera, 
//     FreeCamera,
//     Vector3, HemisphericLight, Mesh, MeshBuilder, 
//     Color4, 
//     Camera} from "@babylonjs/core";

// import GUI from './GUI/gui';

// class App{
//     _engine:Engine;
//     _scene:Scene;
//     _game_scene:Scene;
//     _canvas:HTMLCanvasElement;

//     constructor(){
//         this._canvas = this.createCanvas();
//         this._engine = new Engine(this._canvas,true);
//         const gui = new GUI(this._engine);
//         // this._scene = new Scene(this._engine);
//         this._scene = gui.scene;

//         const camera = new ArcRotateCamera(
//             "camera",
//             Math.PI / 2, 
//             Math.PI / 2, 
//             2, 
//             Vector3.Zero(), 
//             this._scene);

//         camera.attachControl(this._canvas,true);
//         camera.wheelDeltaPercentage = 0.02;
//         camera.setPosition(new Vector3(0,0,10));
        
//         /* eslint-disable */
//         const light = new HemisphericLight(
//             "light1",
//             new Vector3(1,1,0),
//             this._scene);

//         /* eslint-disable */
//         window.addEventListener("keydown",(evt)=>{
//             if(evt.shiftKey && evt.ctrlKey && evt.altKey && evt.key === 'i'){
//                 if(this._scene.debugLayer.isVisible()){
//                     this._scene.debugLayer.hide();
//                 }else{
//                     this._scene.debugLayer.show();
//                 }
//             }
//         })
        
//         gui.draw();
//         this._main();
//     }
//     createCanvas(){
//         const canvas = document.createElement("canvas");
//         canvas.style.width = "100%";
//         canvas.style.height = "100%";
//         canvas.id = "game-canvas";
//         document.body.appendChild(canvas);

//         return canvas;
//     }
//     _main(){
//         this._engine.runRenderLoop(()=>{
//             this._scene.render();
//         })
//     }
// }
// /* eslint-disable */
// const app = new App();
import Particle from './particle/particle';
const particle = new Particle();
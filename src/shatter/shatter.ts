// import ammo from "ammo.js";
import Ammo from 'ammojs-typed';
import { AmmoJSPlugin, AnimationGroup, ArcRotateCamera, AxesViewer, Color3, Color4, 
    Engine, FadeInOutBehavior, HemisphericLight, Mesh, MeshAssetTask, MeshBuilder,
     NodeMaterial,
     ParticleSystem, 
     PhysicsImpostor, 
     PointerEventTypes, 
     Quaternion, 
     Scene, SceneLoader, StandardMaterial, Texture, TextureUsage, Vector3,
      VertexData,
      _PrimaryIsoTriangle } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import '@babylonjs/loaders/OBJ/objFileLoader';
import { Inspector } from '@babylonjs/inspector';

export default class Shatter{
    _engine:Engine;
    _scene:Scene;
    _emitter:Mesh;
    _physics:AmmoJSPlugin;
    constructor(){
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(canvas);
        this._scene = new Scene(this._engine);

        // Inspector.Show(this._scene,{});
        const light = new HemisphericLight("light",new Vector3(1,1,1),this._scene);

        var camera = new ArcRotateCamera("camera1",  0, 0, 0, new Vector3(0, 0, 0), this._scene);
        camera.setPosition(new Vector3(0, 5, -30));
        
        camera.attachControl(canvas,true);
        camera.wheelDeltaPercentage = 0.02;

        const ground = MeshBuilder.CreateGround("ground",{width:50,height:50},this._scene);
        ground.position.y = -2;
        const mtl = new StandardMaterial("ground",this._scene);
        mtl.diffuseColor = new Color3(0.3,0.4,0.5);
        mtl.backFaceCulling = false;
        ground.material = mtl;
        
        const axis =  new AxesViewer(this._scene, 10);

        this._setPhysics().then(()=>{
            ground.physicsImpostor = new PhysicsImpostor(ground,PhysicsImpostor.BoxImpostor,{
                mass:0
            });
            this._shatterBox();
        });
        

        this._main();
    }
    private async _setPhysics(){
        const ammo = await Ammo();
        this._physics = new AmmoJSPlugin(true,ammo);
        
        this._scene.enablePhysics(new Vector3(0,-9.8,0),this._physics);
        //cannon
        // this._scene.enablePhysics();

        // this._physics.setTimeStep(0);

    }

    private async _shatterBox(){
        const explode =  await SceneLoader.ImportMeshAsync(
            "",
            "./models/", "explode.glb",this._scene);

        let i = 0;
        const root = this._scene.getMeshByName("__root__");
        root.position.y += 0;

        const outer = this._scene.getMeshByName("Cube");
        outer.isVisible = true;

        for(i=0;i<explode.meshes.length;i++){
            let mesh = explode.meshes[i];
            
            if(mesh.name === "Cube"){
                continue;
            }
            mesh.position.y += root.position.y;
            mesh.parent = null;
            mesh.physicsImpostor = new PhysicsImpostor(
                mesh,
                PhysicsImpostor.ConvexHullImpostor,
                {
                    mass: Math.random()*2,
                    friction: 1,
                    restitution: 0.2,
                    nativeOptions: {},
                    ignoreParent: true,
                    disableBidirectionalTransformation: false
                }
            );
            mesh.physicsImpostor.physicsBody.setActivationState(5);
        }

        const fractures = [];
        // const fadeout = new FadeInOutBehavior();
        
        this._scene.onPointerObservable.add((pointerInfo)=>{
            switch (pointerInfo.type) {
                case PointerEventTypes.POINTERTAP:
                    switch (pointerInfo.event.button) {
                        case 0:
                            outer.isVisible = false;
                            outer.dispose(true,true);
                            // 

                            // this._physics.setTimeStep(1/60.0);
                            for(i=0;i<explode.meshes.length;i++){
                                let mesh = explode.meshes[i];
                                if(mesh === outer){
                                    continue;
                                }
                                mesh.physicsImpostor.physicsBody.setActivationState(1);
                                mesh.physicsImpostor.forceUpdate();

                                fractures.push(mesh);
                                // fadeout.attach(mesh as Mesh);
                            }
                            // setTimeout(()=>{
                            //     fractures.forEach((fracture,index)=>{
                            //         // fadeout.fadeOutTime = 2000;
                            //         // fadeout.fadeOut();
                            //         fracture.dispose(true,true);
                            //     });
                            // },5000);
                            break;
                    }
                }
        });
    }
    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}


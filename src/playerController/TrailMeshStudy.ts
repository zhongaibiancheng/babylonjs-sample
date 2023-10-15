import { AbstractMesh, ActionManager, 
    AnimationGroup, ArcRotateCamera, AxesViewer, Bone, Color3, 
    Color4, Engine, ExecuteCodeAction, 
    HemisphericLight, Material, Matrix, Mesh, MeshBuilder, ParticleSystem, 
    PointLight, 
    Quaternion, 
    Ray, 
    Scene, SceneLoader, ShadowGenerator, Space, StandardMaterial,TrailMesh,TransformNode, 
    UniversalCamera, Vector3, _PrimaryIsoTriangle } from "@babylonjs/core";

    import "@babylonjs/loaders/glTF";
import { Inspector } from '@babylonjs/inspector';
import { ThinSprite } from "@babylonjs/core/Sprites/thinSprite";

export default class TrailMeshStudy{
    _engine:Engine;
    _scene:Scene;
    _emitter:Mesh;
    _rocket:ParticleSystem;

    _camera:ArcRotateCamera;

    private _animations:{};
    private _player:AbstractMesh;

    private _inputMap:{};

    private _weaponsMap:{};

    private _sword:AbstractMesh;

    private _curAnim:AnimationGroup = null;

    private _preAnim:AnimationGroup = null;

    private _shadowGenerator:ShadowGenerator;

    private static readonly ANIMATION_NAME:Array<string>= ["Die","idle","run","walking","kick"];

    private static readonly WEAPONS:Array<string> = ["sword"];

    private static readonly PLAYER_MOVEMENT_SPEED:number = 0.02;
    private static readonly PLAYER_ROTATION_SPEED:number = 0.01;
    private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.5934119456780721, 0, 0);

    private static readonly GRAVITY:Vector3 = new Vector3(0,-0.098,0);

    constructor(){
        Engine.CollisionsEpsilon = 0.00005;

        this._animations = {};
        this._weaponsMap = {};
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(canvas);
        this._scene = new Scene(this._engine);

        this._scene.collisionsEnabled = true;

        // this._scene.debugLayer.show();
        Inspector.Show(this._scene, {
            embedMode: true
          });

        // this._scene.clearColor = new Color4(1,1,1,0.2);
        this._scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098); // a color that fit the overall color scheme better

        this._scene.actionManager = new ActionManager(this._scene);

        const light1 = new HemisphericLight("light",new Vector3(1,1,1),this._scene);

        this._inputMap = {};
        new AxesViewer(this._scene,4);

        const ground = MeshBuilder.CreateGround("ground",{width:30,height:30},this._scene);
        // ground.position.y = -2;
        const mtl = new StandardMaterial("ground",this._scene);
        mtl.diffuseColor = new Color3(0.3,0.4,0.5);
        mtl.backFaceCulling = false;
        ground.material = mtl;

        ground.checkCollisions = true;

        this._setupPlayerCamera();

        this._loadWeapons().then(()=>{
           this.createTail();
        });
        this._main();

        window.addEventListener("resize",(evt)=>{
            this._engine.resize();
        });

        const cube1 = MeshBuilder.CreateBox("p1",{},this._scene);
        
        cube1.scaling.setAll(0.6);

        const m1 = new StandardMaterial("m1",this._scene);
        m1.diffuseColor = new Color3(1,0,0);
        cube1.material = m1;
        cube1.bakeCurrentTransformIntoVertices();
        let alpha = 0.1;
        cube1.position.x = Math.cos(alpha) * 4;
        cube1.position.z = Math.sin(alpha) * 4;
        cube1.position.y = 4;
        cube1.computeWorldMatrix(true);

        const tn1 = new TransformNode("tn1", this._scene);
        tn1.scaling = cube1.scaling;
        tn1.position = cube1.position;
        tn1.computeWorldMatrix(true);

        const tn2 = new TransformNode("tn2", this._scene);
        tn2.scaling = cube1.scaling;
        tn2.position = cube1.position;
        tn2.computeWorldMatrix(true);

        const trail = new TrailMesh("trail",cube1,this._scene,0.5,60,true);
        const sourceMat = new StandardMaterial("sourceMat", this._scene);
        sourceMat.emissiveColor = sourceMat.diffuseColor = Color3.Red();
        sourceMat.specularColor = Color3.Black();
        trail.material = sourceMat;

        const trail2 = new TrailMesh("t1",tn1,this._scene,0.5,60,true);
        const sm2 = sourceMat.clone("tn2");
        sm2.diffuseColor = Color3.Green();
        trail2.material = sm2;

        const trail3 = new TrailMesh("t2",tn2,this._scene,0.5,60,true);
        const sm3 = sourceMat.clone("tn3");
        sm3.diffuseColor = Color3.Blue();
        trail3.material = sm3;

        this._scene.onBeforeRenderObservable.add(()=>{
            alpha += Math.PI / 120;
            
            cube1.position.x = Math.sin(alpha) * 5;
            cube1.position.z = Math.cos(alpha) * 5;
            cube1.rotation.x = Math.PI * alpha / 2;
            cube1.rotation.y = alpha;

            tn1.rotation.x = cube1.rotation.x + Math.PI/3;
            tn1.rotation.y = cube1.rotation.y + Math.PI/3;

            tn2.rotation.x = cube1.rotation.x + Math.PI/3;
            tn2.rotation.y = cube1.rotation.y + Math.PI/3;

            if(this._sword){
                this._sword.position.x +=Math.sin(alpha);
                this._sword.position.z +=Math.cos(alpha);
                this._sword.rotate(
                    new Vector3(0, 1, 0), 0.001, Space.WORLD);
            }
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

    private createTail(){
        const tail = new TrailMesh("tail",this._sword,this._scene,0.5,60,true);
        const sourceMat = new StandardMaterial("d",this._scene);
        sourceMat.emissiveColor = sourceMat.diffuseColor = Color3.Red();
        sourceMat.specularColor = Color3.Black();
        tail.material = sourceMat;
    }
    private async _loadWeapons(){
        const result = await SceneLoader.ImportMeshAsync(
            null,
            "/models/",
            "sword.glb",
            this._scene);
        const sword = result.meshes[0];
        this._weaponsMap['sword']=sword;

        // sword.rotate(new Vector3(0,0,1),0.0);
        sword.position = new Vector3(-4.5,0,0);
        // sword.position.y = 1;
        // sword.scaling.setAll(0.1);

        const outer = MeshBuilder.CreateBox("outer_sword",{
            width:7,
            height:0.2,
            depth:0.4,
        },this._scene);
        outer.position.y = 3;
        

        sword.parent = outer;
        this._sword = outer;
        this._sword.isVisible = false;
        this._sword.computeWorldMatrix(true);

    }
    
    private inputController(){
        this._scene.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnKeyDownTrigger,(evt)=>{
                this._inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
            })
        );

        this._scene.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnKeyUpTrigger,(evt)=>{
            this._inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
        }))
    }

    private _setUpAnimations(): void {
        this._scene.stopAllAnimations();
        this._animations['walking'].loopAnimation = true;
        this._animations['kick'].loopAnimation = true;
        this._animations['idle'].loopAnimation = true;

        //initialize current and previous
        this._curAnim = this._animations['idle'];
        this._preAnim = null;
    }
    private _isFloor(offsetX:number,offsetY:number,offsetZ:number,distance):Boolean{
        const p_pos = this._player.position;
        const pos = new Vector3(
            p_pos.x + offsetX,
            p_pos.y + offsetY,
            p_pos.z + offsetZ);
        const ray = new Ray(pos,Vector3.Down(),distance);

        const predicate = (mesh)=>{
            return mesh.isPickable && mesh.isEnabled();
        }
        let pick = this._scene.pickWithRay(ray,predicate);

        if (pick.hit) { 
            return true;
        } else { 
            return false;
        }
    }

    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}
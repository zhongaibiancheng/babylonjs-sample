import { AbstractMesh, ActionManager, 
    AnimationGroup, ArcRotateCamera, AxesViewer, Bone, Color3, 
    Color4, Engine, ExecuteCodeAction, 
    HemisphericLight, Material, Matrix, Mesh, MeshBuilder, ParticleSystem, 
    PointLight, 
    PointerEventTypes, 
    Quaternion, 
    Ray, 
    RecastJSPlugin, 
    Scene, SceneLoader, ShadowGenerator, StandardMaterial,TransformNode, 
    UniversalCamera, Vector3, _PrimaryIsoTriangle } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

import * as Recast from "recast-detour";

export default class PathFinding{
    _engine:Engine;
    _scene:Scene;

    _camera:ArcRotateCamera;

    canvas:HTMLCanvasElement;
    _player:any;

    constructor(){
        Engine.CollisionsEpsilon = 0.00005;

        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(this.canvas);
        this._scene = new Scene(this._engine);

        this._scene.collisionsEnabled = true;

        // this._scene.clearColor = new Color4(1,1,1,0.2);
        this._scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098); // a color that fit the overall color scheme better

        const light1 = new HemisphericLight("light",new Vector3(1,1,1),this._scene);

        new AxesViewer(this._scene,4);

        this._setupPlayerCamera();

        this.loadCharacter().then(()=>{
        });

        this._loadNPC();
        
        this._creatNavMesh();

        this._main();
        window.addEventListener("resize",(evt)=>{
            this._engine.resize();
        });
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
            // npc.rotation.y += Math.PI/2.0;

            let local = new Vector3();
            console.log(npc.getDirection(local),local);

            console.log(npc.position);

            this._scene.onPointerObservable.add(pointerInfo=>{
                switch(pointerInfo.type){
                    case PointerEventTypes.POINTERDOWN:
                    const line = this._scene.getMeshByName("lines");
                    if(line){
                        this._scene.removeMesh(line);
                    }
                    
                        // npc.rotation.y += Math.PI/4.0;
                        const pos_npc = npc.position;
                        const pos_player = this._player.position;
                        const myPoints = [
                            pos_npc,
                            pos_player
                        ];
                        
                        const lines = MeshBuilder.CreateLines("lines", {points: myPoints});
                        const vec3 = pos_player.subtract(pos_npc);
                        let dir = vec3.normalize();
                        const angle = Math.atan2(dir.x,dir.z) + Math.PI;
                        npc.rotation.y = npc.rotation.y + (angle - npc.rotation.y )*0.05;

                        const pos = npc.position;
                        npc.position = pos.addInPlace(dir.scaleInPlace(0.4));
                        // console.log(vec3,pos_npc,pos_player);
                        break;
                }
            })
    }
    private _createStaticMeshes(){
        const meshes = [];
        const ground = MeshBuilder.CreateGround("ground",{width:30,height:30},this._scene);
        // ground.position.y = -2;
        const mtl = new StandardMaterial("ground",this._scene);
        mtl.diffuseColor = new Color3(0.3,0.4,0.5);
        mtl.backFaceCulling = false;
        ground.material = mtl;

        ground.checkCollisions = true;

        meshes.push(ground);

        for(let i=0;i<4;i++){
            const plant = MeshBuilder.CreateBox(
                "plant-"+i,
            {
                width:1,
                height:4,
                depth:1
            },
            this._scene
            )
            plant.position = new Vector3(i*4 - 10,2,0);

            meshes.push(plant);
        }

        return meshes;
    }
    private async _creatNavMesh(){
        var agents = [];
        // initialize the recast plugin
        const navigationPlugin = new RecastJSPlugin(await (Recast as any)());
        var navmeshParameters = {
            cs: 0.2,
            ch: 0.2,
            walkableSlopeAngle: 90,
            walkableHeight: 1.0,
            walkableClimb: 1,
            walkableRadius: 1,
            maxEdgeLen: 12.,
            maxSimplificationError: 1.3,
            minRegionArea: 8,
            mergeRegionArea: 20,
            maxVertsPerPoly: 6,
            detailSampleDist: 6,
            detailSampleMaxError: 1,
            };

        const meshes = this._createStaticMeshes();
        const navigationMesh = navigationPlugin.createNavMesh(meshes,
            navmeshParameters);

        var navmeshdebug = navigationPlugin.createDebugNavMesh(this._scene);
        navmeshdebug.position = new Vector3(0, 5, 0);
    
        var matdebug = new StandardMaterial('matdebug', this._scene);
        matdebug.diffuseColor = new Color3(0.1, 0.2, 1);
        matdebug.alpha = 0.2;
        navmeshdebug.material = matdebug;

        // crowd
    var crowd = navigationPlugin.createCrowd(10, 0.1, this._scene);
    var i;
    var agentParams = {
        radius: 0.1,
        height: 0.2,
        maxAcceleration: 4.0,
        maxSpeed: 1.0,
        collisionQueryRange: 0.5,
        pathOptimizationRange: 0.0,
        separationWeight: 1.0};
        
    for (i = 0; i <1; i++) {
        var width = 0.20;
        var agentCube = MeshBuilder.CreateBox("cube", { size: width, height: width }, this._scene);
        var targetCube = MeshBuilder.CreateBox("cube", { size: 0.1, height: 0.1 }, this._scene);
        var matAgent = new StandardMaterial('mat2', this._scene);
        var variation = Math.random();
        matAgent.diffuseColor = new Color3(0.4 + variation * 0.6, 0.3, 1.0 - variation * 0.3);
        agentCube.material = matAgent;
        var randomPos = navigationPlugin.getRandomPointAround(new Vector3(-2.0, 0.1, -1.8), 0.5);
        var transform = new TransformNode("");
        //agentCube.parent = transform;
        var agentIndex = crowd.addAgent(randomPos, agentParams, transform);
        agents.push({idx:agentIndex, trf:transform, mesh:agentCube, target:targetCube});
    }
    
    var startingPoint;
    var currentMesh;
    var pathLine;
    var getGroundPosition = ()=> {
        var pickinfo = this._scene.pick(this._scene.pointerX, this._scene.pointerY);
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }

    var pointerDown = (mesh)=> {
            currentMesh = mesh;
            startingPoint = getGroundPosition();
            if (startingPoint) { // we need to disconnect camera from canvas
                setTimeout(()=> {
                    // this._camera.detachControl();
                }, 0);
                var agents = crowd.getAgents();
                var i;
                for (i=0;i<agents.length;i++) {
                    var randomPos = navigationPlugin.getRandomPointAround(startingPoint, 1.0);
                    crowd.agentGoto(agents[i], navigationPlugin.getClosestPoint(startingPoint));
                }
                var pathPoints = navigationPlugin.computePath(crowd.getAgentPosition(agents[0]), navigationPlugin.getClosestPoint(startingPoint));
                pathLine = MeshBuilder.CreateDashedLines("ribbon", {points: pathPoints, updatable: true, instance: pathLine}, this._scene);
            }
    }
    
    // this._scene.onPointerObservable.add((pointerInfo) => {      		
    //     switch (pointerInfo.type) {
    //         case PointerEventTypes.POINTERDOWN:
    //             if(pointerInfo.pickInfo.hit) {
    //                 pointerDown(pointerInfo.pickInfo.pickedMesh)
    //             }
    //             break;
    //             }
    //         });

        this._scene.onBeforeRenderObservable.add(()=> {
            if(!this._player){
                return;
            }
            var agentCount = agents.length;
            for(let i = 0;i<agentCount;i++)
            {
                var ag = agents[i];
                // ag.mesh.position = crowd.getAgentPosition(ag.idx);
                this._player.position = crowd.getAgentPosition(ag.idx);
                let vel = crowd.getAgentVelocity(ag.idx);
                crowd.getAgentNextTargetPathToRef(ag.idx, ag.target.position);
                if (vel.length() > 0.2)
                {
                    vel.normalize();
                    var desiredRotation = Math.atan2(vel.x, vel.z)+Math.PI;
                    // ag.mesh.rotation.y = ag.mesh.rotation.y + (desiredRotation - ag.mesh.rotation.y) * 0.05;
                    this._player.rotation.y = this._player.rotation.y + (desiredRotation - this._player.rotation.y) * 0.05;
                }
            }
        });

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

    private _updateCamera(){

    }

    /**
     * 
     * 加载player model 和 动画
     * 
     */
    private async loadCharacter(){

        const result = await SceneLoader.ImportMeshAsync(null,
        "/models/",
        "player.glb",this._scene);

        const player = result.meshes[0];

        player.getChildMeshes().forEach((child)=>{
            child.isPickable = false;
            child.checkCollisions = false;
        });
        
        this._player = player;
        this._player.rotationQuaternion = null;
    }
    
    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}
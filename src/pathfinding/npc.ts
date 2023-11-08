import { AbstractMesh, AxesViewer, Color3, EventState, KeyboardEventTypes, KeyboardInfo, MeshBuilder,
    PointerEventTypes,
    RecastJSPlugin, 
    Scene, SceneLoader, StandardMaterial,TransformNode, 
    Vector3, _PrimaryIsoTriangle } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

import * as Recast from "recast-detour";

export default class NPC{
    _scene:Scene;

    _player:any;
    _npc:any;
    _chasing:boolean = false;
    _staticMeshes:Array<any>;

    agents:[];
    crowd:any;
    navigationPlugin:RecastJSPlugin;
    pathLine:any;

    _distance:number = 0;
    constructor(scene:Scene,npc:AbstractMesh,staticMeshes:Array<any>){
        this._scene = scene;
        this._player = this._scene.getMeshByName("outer");

        this._npc = npc;

        this._staticMeshes = staticMeshes;

        this._createNavMesh();
       
        this._scene.onBeforeRenderObservable.add(()=> {
            if(!this._npc || !this.crowd){
                return;
            }
            const distance = this._distanceToPlayer();
            console.log(distance);

            if(distance >=1 && distance <=10 && this._chasing){
                // if(this._distance != distance){
                //     this._chasing = true;
    
                    var startingPoint;
                    // startingPoint = this.getGroundPosition();
                    // this._player.position = startingPoint;
                    startingPoint = this._player.position;
                    if (startingPoint) { // we need to disconnect camera from canvas
                        var agents = this.crowd.getAgents();
    
                        for (var i=0;i<agents.length;i++) {
                            var randomPos = this.navigationPlugin.getRandomPointAround(startingPoint, 1.0);
                            this.crowd.agentGoto(agents[i], this.navigationPlugin.getClosestPoint(startingPoint));
                        }
                        var pathPoints = this.navigationPlugin.computePath(this.crowd.getAgentPosition(agents[0]), this.navigationPlugin.getClosestPoint(startingPoint));
                        this.pathLine = MeshBuilder.CreateDashedLines("ribbon", {points: pathPoints, updatable: true, instance: this.pathLine}, this._scene);
                    }
            //     }
            // }
            // else{
                var agentCount = this.agents.length;
                for(let i = 0;i<agentCount;i++)
                {
                    var ag = this.agents[i] as any;
                    // ag.mesh.position = crowd.getAgentPosition(ag.idx);
                    this._npc.position = this.crowd.getAgentPosition(ag.idx);
                    let vel = this.crowd.getAgentVelocity(ag.idx);
                    this.crowd.getAgentNextTargetPathToRef(ag.idx, ag.target.position);
                    if (vel.length() > 0.2)
                    {
                        vel.normalize();
                        var desiredRotation = Math.atan2(vel.x, vel.z)+Math.PI;
                        // ag.mesh.rotation.y = ag.mesh.rotation.y + (desiredRotation - ag.mesh.rotation.y) * 0.05;
                        this._npc.rotation.y = this._npc.rotation.y + (desiredRotation - this._npc.rotation.y) * 0.05;
                    }
                }
            }
        });
        this._scene.onPointerObservable.add((pointerInfo) => {      		
            switch (pointerInfo.type) {
                case PointerEventTypes.POINTERDOWN:
                    if(pointerInfo.pickInfo.hit) {
                        // this.pointerDown()
                        this._chasing = true;
                    }
                    break;
                    }
        });

        this._scene.onKeyboardObservable.add((keyInfo)=>{
            switch (keyInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    switch (keyInfo.event.key) {
                        case "a":
                        case "A":
                            this._player.position.x -= 1;
                        break;
                        case "d":
                        case "D":
                            this._player.position.x += 1;
                        break;
                        case "w":
                        case "W":
                            this._player.position.z += 1;
                        break;
                        case "s":
                        case "S":
                            this._player.position.z -= 1;
                        break;
                    }
                break;
            }
        });
    }

    getGroundPosition(){
        var pickinfo = this._scene.pick(this._scene.pointerX, this._scene.pointerY);
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }
        return null;
    }
    
    /**
     * 计算npc 和 player 之间的距离
     * 
     * @returns 直线距离
     */
    private _distanceToPlayer():number{
        const player_pos = this._player.position;
        const npc_pos = this._npc.position;
        console.log(player_pos,npc_pos);
        const distance = Vector3.Distance(player_pos,npc_pos);
        return distance;
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

    private async _createNavMesh(){
        this.agents = [];
        // initialize the recast plugin
        this.navigationPlugin = new RecastJSPlugin(await (Recast as any)());
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

        const navigationMesh = this.navigationPlugin.createNavMesh(
            this._staticMeshes,
            navmeshParameters);

        // var navmeshdebug = navigationPlugin.createDebugNavMesh(this._scene);
        // navmeshdebug.position = new Vector3(0, 5, 0);
    
        // var matdebug = new StandardMaterial('matdebug', this._scene);
        // matdebug.diffuseColor = new Color3(0.1, 0.2, 1);
        // matdebug.alpha = 0.2;
        // navmeshdebug.material = matdebug;

        // crowd
        this.crowd = this.navigationPlugin.createCrowd(10, 0.1, this._scene);

        var agentParams = {
            radius: 0.1,
            height: 0.2,
            maxAcceleration: 4.0,
            maxSpeed: 1.0,
            collisionQueryRange: 0.5,
            pathOptimizationRange: 0.0,
            separationWeight: 1.0};
        
        for (var i = 0; i <1; i++) {
            var width = 0.20;
            var agentCube = MeshBuilder.CreateBox("cube", { size: width, height: width }, this._scene);
            var targetCube = MeshBuilder.CreateBox("cube", { size: 0.1, height: 0.1 }, this._scene);

            var matAgent = new StandardMaterial('mat2', this._scene);
            var variation = Math.random();
            matAgent.diffuseColor = new Color3(0.4 + variation * 0.6, 0.3, 1.0 - variation * 0.3);
            agentCube.material = matAgent;
            var randomPos = this.navigationPlugin.getRandomPointAround(new Vector3(-2.0, 0.1, -1.8), 0.5);
            var transform = new TransformNode("");
            //agentCube.parent = transform;
            var agentIndex = this.crowd.addAgent(randomPos, agentParams, transform);
            this.agents.push({idx:agentIndex, trf:transform, mesh:agentCube, target:targetCube} as never);
        }
    }
    // pointerDown(){
    //     var startingPoint;
    //     // startingPoint = this.getGroundPosition();
    //     // this._player.position = startingPoint;
    //     startingPoint = this._player.position;
    //     if (startingPoint) { // we need to disconnect camera from canvas
    //         var agents = this.crowd.getAgents();

    //         for (var i=0;i<agents.length;i++) {
    //             var randomPos = this.navigationPlugin.getRandomPointAround(startingPoint, 1.0);
    //             this.crowd.agentGoto(agents[i], this.navigationPlugin.getClosestPoint(startingPoint));
    //         }
    //         var pathPoints = this.navigationPlugin.computePath(this.crowd.getAgentPosition(agents[0]), this.navigationPlugin.getClosestPoint(startingPoint));
    //         this.pathLine = MeshBuilder.CreateDashedLines("ribbon", {points: pathPoints, updatable: true, instance: this.pathLine}, this._scene);
    //     }
    // }
    
}
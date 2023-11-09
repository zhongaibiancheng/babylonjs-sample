/*
*多个npc自动跟踪player的方法实现
*
* 
*/
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
    _npc:Array<AbstractMesh>;
    _chasing:boolean = false;
    _staticMeshes:Array<any>;

    agents:[];
    crowd:any;
    navigationPlugin:RecastJSPlugin;
    pathLine:any;

    _distance:number = 0;
    constructor(scene:Scene,npc:Array<AbstractMesh>,staticMeshes:Array<any>){
        this._scene = scene;
        this._player = this._scene.getMeshByName("outer");

        this._npc = npc;

        this._staticMeshes = staticMeshes;

        this._createNavMesh();
       
        let j=0;
        this._scene.onBeforeRenderObservable.add(()=> {
            if(!this._npc || !this.crowd){
                return;
            }
            if(this._chasing){
                    var startingPoint;
                    startingPoint = this._player.position;

                    if (startingPoint) { // we need to disconnect camera from canvas
                        var agents = this.crowd.getAgents();
    
                        for (var i=0;i<agents.length;i++) {
                            const distance = this._distanceToPlayer(i);
                            if(distance >=5 && distance<=10){
                                const dir = this._npc[i].position.subtract(this._player.position);
                                dir.normalize();

                            //    var randomPos = this.navigationPlugin.getRandomPointAround(startingPoint, 0.1);
                                var randomPos = this._player.position.clone();    
                                randomPos = randomPos.addInPlace(dir.scaleInPlace(1.5));
                                
                                this.crowd.agentGoto(agents[i], this.navigationPlugin.getClosestPoint(randomPos));
                                // var pathPoints = this.navigationPlugin.computePath(this.crowd.getAgentPosition(agents[i]), this.navigationPlugin.getClosestPoint(randomPos));
                                // this.pathLine = MeshBuilder.CreateDashedLines("ribbon", {points: pathPoints, updatable: true, instance: this.pathLine}, this._scene);        
                            }
                        }
                    }
            //     }
            // }
            // else{
                var agentCount = this.agents.length;
                for(let i = 0;i<agentCount;i++)
                {
                    var ag = this.agents[i] as any;
                    ag.mesh.position = this.crowd.getAgentPosition(ag.idx);

                    let vel = this.crowd.getAgentVelocity(ag.idx);
                    this.crowd.getAgentNextTargetPathToRef(ag.idx, ag.target.position);

                    if (vel.length() > 0.2)
                    {
                        // vel.normalize();
                        // var desiredRotation = Math.atan2(vel.x, vel.z)+Math.PI;
                        const dir = ag.target.position.subtract(ag.mesh.position);
                        dir.normalize();

                        var desiredRotation = Math.atan2(dir.x, dir.z);
                        if(desiredRotation <0){
                            desiredRotation = desiredRotation + Math.PI;
                        }

// ag.mesh.rotation.y = 1.0 * Math.PI - desiredRotation;
                        ag.mesh.rotation.y = ag.mesh.rotation.y + (desiredRotation - ag.mesh.rotation.y) * 0.05;
                        // this._npc.rotation.y = this._npc.rotation.y + (desiredRotation - this._npc.rotation.y) * 0.05;
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
    private _distanceToPlayer(i):number{
        const player_pos = this._player.position;
        const npc_pos = this._npc[i].position;

        const distance = Vector3.Distance(player_pos,npc_pos);
        return distance;
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

        this.navigationPlugin.createNavMesh(
            this._staticMeshes,
            navmeshParameters);

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
        
        for (var i = 0; i <this._npc.length; i++) {
            var width = 0.20;
            var agentCube = MeshBuilder.CreateBox("cube", { size: width, height: width }, this._scene);
            var targetCube = MeshBuilder.CreateBox("cube", { size: 0.1, height: 0.1 }, this._scene);

            var matAgent = new StandardMaterial('mat2', this._scene);
            var variation = Math.random();
            matAgent.diffuseColor = new Color3(0.4 + variation * 0.6, 0.3, 1.0 - variation * 0.3);
            agentCube.material = matAgent;
            // var randomPos = this.navigationPlugin.getRandomPointAround(this._npc[i].position,0.01);
            var randomPos = this.navigationPlugin.getClosestPoint(this._npc[i].position);

            var transform = new TransformNode("npc_node_"+i);

            var agentIndex = this.crowd.addAgent(randomPos, agentParams, transform);
            this.agents.push({idx:agentIndex, trf:transform, mesh:this._npc[i], target:targetCube} as never);
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
import * as BABYLON from 'babylonjs';
import {SkyMaterial, TerrainMaterial, WaterMaterial} from 'babylonjs-materials';

const SIZE = {
    width:100,
    height:100,
    depth:100
}
export default class Demo{
    _engine:BABYLON.Engine;
    _scene:BABYLON.Scene;
    _emitter:BABYLON.Mesh;
    _rocket:BABYLON.ParticleSystem;

    constructor(){
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new BABYLON.Engine(canvas);
        this._scene = new BABYLON.Scene(this._engine);

        const light = new BABYLON.HemisphericLight("light",new BABYLON.Vector3(0, 1, 0),this._scene);

        var camera = new BABYLON.ArcRotateCamera("camera1",  0, 0, 0, new BABYLON.Vector3(0, 0, 0), this._scene);
        camera.setPosition(new BABYLON.Vector3(0, 5, -30));
        
        camera.attachControl(canvas,true);
        camera.wheelDeltaPercentage = 0.02;

        const axis =  new BABYLON.AxesViewer(this._scene, 10);

        this._createTerrainGround();

        // Sky material
        var skyboxMaterial = new SkyMaterial("skyMaterial", this._scene);
        skyboxMaterial.backFaceCulling = false;
        //skyboxMaterial._cachedDefines.FOG = true;
        skyboxMaterial.inclination = 0;
        // Sky mesh (box)
        var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, this._scene);
        skybox.material = skyboxMaterial;
        this._main();
    }

    _createTerrainGround(){
        // Create terrain material
        var terrainMaterial = new TerrainMaterial("terrainMaterial", this._scene);
        terrainMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        terrainMaterial.specularPower = 64;
        
        // Set the mix texture (represents the RGB values)
        terrainMaterial.mixTexture = new BABYLON.Texture("textures/mixMap.png", this._scene);
        
        // Diffuse textures following the RGB values of the mix map
        // diffuseTexture1: Red
        // diffuseTexture2: Green
        // diffuseTexture3: Blue
        terrainMaterial.diffuseTexture1 = new BABYLON.Texture("textures/floor.png", this._scene);
        terrainMaterial.diffuseTexture2 = new BABYLON.Texture("textures/rock.png", this._scene);
        terrainMaterial.diffuseTexture3 = new BABYLON.Texture("textures/grass.png", this._scene);
        
        // Bump textures according to the previously set diffuse textures
        terrainMaterial.bumpTexture1 = new BABYLON.Texture("textures/floor_bump.png", this._scene);
        terrainMaterial.bumpTexture2 = new BABYLON.Texture("textures/rockn.png", this._scene);
        terrainMaterial.bumpTexture3 = new BABYLON.Texture("textures/grassn.png", this._scene);
    
        // Rescale textures according to the terrain
        terrainMaterial.diffuseTexture1.uScale = terrainMaterial.diffuseTexture1.vScale = 1;
        terrainMaterial.diffuseTexture2.uScale = terrainMaterial.diffuseTexture2.vScale = 1;
        terrainMaterial.diffuseTexture3.uScale = terrainMaterial.diffuseTexture3.vScale = 1;
        
        // Ground
        var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "textures/heightMap.png", SIZE.width, SIZE.height, 100, 0, 10, this._scene, false);
        // ground.position.y = -2.05;
        ground.position.y = 0;
        ground.material = terrainMaterial;

        // ground.scaling.set(100,1,100);

        const texture = new BABYLON.Texture("textures/grass.png", this._scene);
        const materail = new BABYLON.StandardMaterial("ground",this._scene);
        materail.diffuseTexture = texture;

        const positions = [
            {
                x:-SIZE.width,
                z:SIZE.height
            },
            {
                x:0,
                z:SIZE.height
            },
            {
                x:SIZE.width,
                z:SIZE.height
            },
            {
                x:-SIZE.width,
                z:0
            },
            {
                x:SIZE.width,
                z:0
            },
            {
                x:-SIZE.width,
                z:-SIZE.height
            },
            {
                x:0,
                z:-SIZE.height
            },
            {
                x:SIZE.width,
                z:-SIZE.height
            }
        ];
        for(let i=0;i<positions.length;i++){
            let gr = BABYLON.MeshBuilder.CreateGround(
                "ground3"+i,{width:SIZE.width,height:SIZE.height},this._scene);
            gr.position.z = positions[i].z;
            gr.position.x = positions[i].x;
            gr.material = materail;
    
        }
        // Sky material
        // var skyboxMaterial = new SkyMaterial("skyMaterial", this._scene);
        // skyboxMaterial.backFaceCulling = false;
        // //skyboxMaterial._cachedDefines.FOG = true;
        // skyboxMaterial.disableColorWrite = true;
        // // Sky mesh (box)
        // var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, this._scene);
        // skybox.material = skyboxMaterial;

        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this._scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox3", this._scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.disableLighting = true;
       
        // // Water
        // var waterMesh = BABYLON.Mesh.CreateGround("waterMesh", 512, 512, 32, this._scene, false);
        // waterMesh.position.y -= 10;

        // var water = new WaterMaterial("water", this._scene);
        // water.bumpTexture = new BABYLON.Texture("textures/waterbump.png", this._scene);
        
        // // Water properties
        // water.windForce = -15;
        // water.waveHeight = 1.3;
        // water.windDirection = new BABYLON.Vector2(1, 1);
        // water.waterColor = new BABYLON.Color3(0.1, 0.1, 0.6);
        // water.colorBlendFactor = 0.3;
        // water.bumpHeight = 0.1;
        // water.waveLength = 0.1;
        
        // // Add skybox and ground to the reflection and refraction
        // // water.addToRenderList(skybox);
        // // water.addToRenderList(ground);
        
        // // Assign the water material
        // waterMesh.material = water;
    }
    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}
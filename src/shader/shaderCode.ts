import { ArcRotateCamera, AxesViewer, Color3, Color4, 
    Effect, 
    Engine, HemisphericLight, Mesh, MeshBuilder,
     ParticleSystem, 
     Scene, ShaderMaterial, StandardMaterial, Texture, TextureUsage, Vector3,
      VertexData,
      _PrimaryIsoTriangle } from "@babylonjs/core";

export default class ShaderCode{
    _engine:Engine;
    _scene:Scene;
    _emitter:Mesh;
    _rocket:ParticleSystem;

    constructor(){
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this._engine = new Engine(canvas);
        this._scene = new Scene(this._engine);

        const light = new HemisphericLight("light",new Vector3(1,1,1),this._scene);

        var camera = new ArcRotateCamera("camera1",  0, 0, 0, new Vector3(0, 0, 0), this._scene);
        camera.setPosition(new Vector3(0, 5, -30));
        
        camera.attachControl(canvas,true);
        camera.wheelDeltaPercentage = 0.02;

        const ground = MeshBuilder.CreateGround("ground",{width:15,height:16},this._scene);
        ground.position.y = -2;
        const mtl = new StandardMaterial("ground",this._scene);
        mtl.diffuseColor = new Color3(0.3,0.4,0.5);
        mtl.backFaceCulling = false;
        ground.material = mtl;
        
        const axis =  new AxesViewer(this._scene, 10);

        // this._createCustomMesh();
        this._createColorMesh();
        this._main();
    }

    _createColorMesh(){
        const box = MeshBuilder.CreateBox("box",{},this._scene);
        box.position.y = 2;

        Effect.ShadersStore['colorVertexShader']=`
        precision highp float;
        attribute vec3 position;
        uniform mat4 worldViewProjection;

        void main(void){
            vec4 p= vec4(position,1.);
            gl_Position = worldViewProjection *p;
        }
        `;

        Effect.ShadersStore['colorFragmentShader']=`
        precision highp float;
        uniform vec3 color;
        
        void main(void){
            gl_FragColor = vec4(color,1.0);
        }
        `;

        const shader = new ShaderMaterial("ss",
        this._scene,
        "color",
        {
            attributes:['position'],
            uniforms: ["worldViewProjection", "color"]
        });

        let color = new Color3(0,0,0);
        shader.setColor3("color",color);

        this._scene.onBeforeRenderObservable.add(()=>{
            // color = new Color3(Math.random(),Math.random(),Math.random());
            var t = Date.now() * 0.001;
            color.r = Math.sin(t) * 0.5 + 0.5; 
            shader.setColor3('color',color);
        });

        box.material = shader;

    }
    _createCustomMesh(){
        const box = MeshBuilder.CreateBox("box",{},this._scene);
        Effect.ShadersStore["customVertexShader"] = "\r\n" + 
               "precision highp float;\r\n" + 
               "// Attributes\r\n" + 
               "attribute vec3 position;\r\n" + 
               "attribute vec2 uv;\r\n" + 
               "// Uniforms\r\n" + 
               "uniform mat4 worldViewProjection;\r\n" + 

               "// Varying\r\n" + 
               "varying vec2 vUV;\r\n" + 
               "void main(void) {\r\n" + 
                  "gl_Position = worldViewProjection * vec4(position, 1.0);\r\n" + 
                  "vUV = uv;\r\n"+"}\r\n";
        Effect.ShadersStore["customFragmentShader"] = "\r\n"+
                  "precision highp float;\r\n" + 
                  "varying vec2 vUV;\r\n" + 
                  "uniform sampler2D textureSampler;\r\n" + 
               "void main(void) {\r\n"+
                  "gl_FragColor = texture2D(textureSampler, vUV);\r\n"+"}\r\n";

            var shaderMaterial = new ShaderMaterial("shader", this._scene, {
               vertex: "custom",
               fragment: "custom",
            },
            {
               attributes: ["position", "normal", "uv"],
               uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
            });

            var mainTexture = new Texture("textures/laminate_floor_02_diff_1k.jpg", this._scene);

            shaderMaterial.setTexture("textureSampler", mainTexture);

            shaderMaterial.backFaceCulling = false;

            box.material = shaderMaterial;
        
    }
    _main():void{
        this._engine.runRenderLoop(()=>{
            this._scene.render();
        })
    }
}
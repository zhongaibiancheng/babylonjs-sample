import { Engine, MeshBuilder, Scene,PBRSpecularGlossinessMaterial, Vector3, Color3, CubeTexture, Texture, ContainerAssetTask } from "@babylonjs/core";
import { 
    AdvancedDynamicTexture,Rectangle, 
    InputText,
    Button,Container, Control,
    StackPanel,TextBlock } from "@babylonjs/gui";

export default class Gui{
    scene:Scene;
    constructor(engine:Engine){
        this.scene = new Scene(engine);
    }
    draw(){
        const torus = MeshBuilder.CreateTorus("torus",{diameter:1,thickness:0.3,tessellation:80},this.scene);
        torus.position.x = -4;
        this.scene.registerBeforeRender(()=>{
            torus.rotation.x += 0.01;
            torus.rotation.z += 0.01;
        });

        const pbr = new PBRSpecularGlossinessMaterial('pbr',this.scene);
        pbr.diffuseColor = new Color3(1,234/255,1);
        pbr.glossiness = 1;
        pbr.environmentTexture = CubeTexture.CreateFromPrefilteredData('https://playground.babylonjs.com/textures/environment.dds', this.scene);
        pbr.specularGlossinessTexture = new Texture('../../textures/glossiness_texture.png', this.scene);
      
        torus.material = pbr;

        const gui = AdvancedDynamicTexture.CreateFullscreenUI("ui");
        // const btn = Button.CreateSimpleButton("btn","Click me");
        // btn.width = "200px";
        // btn.height = "200px";
        // btn.color = "white";
        // btn.background = 'deepskyblue';

        const btn = Button.CreateImageButton("btn","click me",
        '../../textures/play.svg');
        btn.width = "200px";
        btn.height = "50px";
        btn.color = "white";
        btn.background = 'deepskyblue';
        btn.image.left = "30px";

        btn.onPointerUpObservable.add(()=>{
            alert("click me");
        });
        gui.addControl(btn);

        // const btn2 = btn.clone();
        // btn2.left = "100px";
        // btn2.top = "-100px";

        // btn2.onPointerUpObservable.add(()=>{
        //     // alert("btn2");
        //     (torus.material as PBRSpecularGlossinessMaterial).diffuseColor = Color3.Green();
        // });
        // gui.addControl(btn2);

        // const container = new Container("container");
        // container.width = 0.5;
        // container.background = "black";
        // container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        // gui.addControl(container);

        // const rectangle = new Rectangle("rect");
        // rectangle.width = "200px";
        // rectangle.height = "200px";
        // rectangle.cornerRadius = 30;

        // gui.addControl(rectangle);
        // const text = new TextBlock();
        // text.text = 'Hello World!';
        // text.color = 'white';
        // text.fontSize = 72;
        // text.fontFamily = 'Montserrat Black';
        // text.shadowColor = '#000';
        // text.shadowOffsetX = 2;
        // text.shadowOffsetY = 2;
        // gui.addControl(text);

        // const input = new InputText("value","Please input number");
        // input.width = 0.2;
        // input.height = '40px';
        // input.text = 'Default text';
        // input.color = 'black';
        // input.background = 'deepskyblue';
        // input.focusedBackground = 'white';
        // input.onTextChangedObservable.add(function(value) {
        //     (torus.material as PBRSpecularGlossinessMaterial).diffuseColor = 
        //     new Color3(0, 0, parseFloat(value.text));
        // });
        // gui.addControl(input);


        
    }
}
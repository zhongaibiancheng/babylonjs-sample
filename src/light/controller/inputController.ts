import { ActionManager, ExecuteCodeAction, Scalar, Scene } from "@babylonjs/core";

/**
 * 
 * 用来处理用户输入操作 键盘/鼠标事件
 * 
 * 
 */
export default class InputController{
    public inputMap:any;

    public jumpKeyDown:boolean = false;
    public running:boolean = false;

    public forward:boolean = false;
    public backword:boolean = false;

    public left:boolean = false;
    public right:boolean = false;

    constructor(scene:Scene){
        scene.actionManager = new ActionManager(scene);
        this.inputMap = {};

        scene.actionManager.registerAction(
            new ExecuteCodeAction(
                ActionManager.OnKeyDownTrigger, (evt) => {
                    this.inputMap[evt.sourceEvent.key] = 
                    evt.sourceEvent.type == "keydown";
                }
            )
        );
        scene.actionManager.registerAction(
            new ExecuteCodeAction(
                ActionManager.OnKeyUpTrigger, (evt) => {
                    this.inputMap[evt.sourceEvent.key] = 
                    evt.sourceEvent.type == "keydown";
                }
            )
        );
        scene.onBeforeRenderObservable.add(()=>{
            this._updateFromKeyboard();
        })
    }
    _updateFromKeyboard(){
        if(this.inputMap["ArrowLeft"]){
            this.left = true;
        }else {
            this.left = false;
        }

        if(this.inputMap["ArrowRight"]){
            this.right = true;
        }else{
            this.right = false;
        }

        if(this.inputMap["ArrowUp"]){
            this.forward = true;
        }else{
            this.forward = false;
        }

        if(this.inputMap["ArrowDown"]){
            this.backword = true;
        }else{
            this.backword = false;
        }

        if(this.inputMap["Shift"]){
            this.running = true;
        }else{
            this.running = false;
        }

        if(this.inputMap[" "]){
            this.jumpKeyDown = true;
        }else{
            this.jumpKeyDown = false;
        }
    }
}
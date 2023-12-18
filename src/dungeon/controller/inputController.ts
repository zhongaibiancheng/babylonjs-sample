import { ActionManager, ExecuteCodeAction, Scalar, Scene } from "@babylonjs/core";

/**
 * 
 * 用来处理用户输入操作 键盘/鼠标事件
 * 
 * 
 */
export default class InputController{
    private _inputMap:any;

    public jumpKeyDown:boolean = false;
    public running:boolean = false;

    public forward:boolean = false;
    public backward:boolean = false;

    public left:boolean = false;
    public right:boolean = false;

    public attackKeys = {
        E:false
    };

    constructor(scene:Scene){
        scene.actionManager = new ActionManager(scene);
        this._inputMap = {};

        scene.actionManager.registerAction(
            new ExecuteCodeAction(
                ActionManager.OnKeyDownTrigger, (evt) => {
                    this._inputMap[evt.sourceEvent.key] = 
                    evt.sourceEvent.type == "keydown";
                }
            )
        );
        scene.actionManager.registerAction(
            new ExecuteCodeAction(
                ActionManager.OnKeyUpTrigger, (evt) => {
                    this._inputMap[evt.sourceEvent.key] = 
                    evt.sourceEvent.type == "keydown";
                }
            )
        );
        scene.onBeforeRenderObservable.add(()=>{
            this._updateFromKeyboard();
        })
    }
    _updateFromKeyboard(){
        if(this._inputMap["ArrowLeft"]){
            this.left = true;
        }else {
            this.left = false;
        }

        if(this._inputMap["ArrowRight"]){
            this.right = true;
        }else{
            this.right = false;
        }

        if(this._inputMap["ArrowUp"]){
            this.forward = true;
        }else{
            this.forward = false;
        }

        if(this._inputMap["ArrowDown"]){
            this.backward = true;
        }else{
            this.backward = false;
        }

        if(this._inputMap["Shift"]){
            this.running = true;
        }else{
            this.running = false;
        }

        if(this._inputMap[" "]){
            this.jumpKeyDown = true;
        }else{
            this.jumpKeyDown = false;
        }

        if(this._inputMap["E"]||this._inputMap["e"]){
            this.attackKeys.E = true;
        }else{
            this.attackKeys.E = false;
        }
    }
}
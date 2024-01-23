
// import Particle from './particle/particle';
//const particle = new Particle();

// import CameraStudy  from "./camera/CameraStudy";
// const camera = new CameraStudy();

// import PlayerController from './playerController/PlayerController';
// const player = new PlayerController();

// import Sword from './playerController/sword';
// const s = new Sword();

// import Mat from './math/m';
// const mm = new Mat();

// import TrailMeshStudy from './playerController/TrailMeshStudy';
// const trail = new TrailMeshStudy();

// import First from './shader/first';
// const first = new First();

// import ShaderCode from './shader/shaderCode';
// const shade = new ShaderCode();

// import Demo from './demo/Demo';
// const demo = new Demo();

// import Sword from './sword/sword_particle';
// const sword = new Sword();

// import PathFinding from './pathfinding/pathfinding';
// const pathfinding = new PathFinding();

// import PathFinding from './pathfinding/pathfinding_toward_move';
// const pathfinding = new PathFinding();

// import NPChase from './pathfinding/npcChase';
// const npcChase = new NPChase();

// import GUI from './GUI/gui';
// const gui = new GUI();

// import FireBall from './xianglongshibazhang/fireball';
// const fireball = new FireBall();

// import Shatter from './shatter/shatter';
// const shatter = new Shatter();

// import LoadingScene from './loadingscene/loadingscene';
// const lodingscene = new LoadingScene();

// import TestCollision from './character/testCollision';
// const collision = new TestCollision();

// import RayTest from './ray/rayTest';
// const ray = new RayTest();

// import Test from './sword/test';
// const test = new Test();

// import Compound from './physics/compoud';
// const compound = new Compound();

import ActionStudy from './action/ActionStudy';
async function create(){
    const compound = new ActionStudy();
    await compound.create();
    compound.main();
}
create();
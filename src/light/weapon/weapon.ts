import { Mesh } from "@babylonjs/core";
import Inventory from "./inventory";

export default interface Weapon extends Inventory{
    attachToPlayer:(mesh:Mesh)=>void;
    attack:(target:Mesh)=>void;
}
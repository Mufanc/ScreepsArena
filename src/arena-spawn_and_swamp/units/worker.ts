import { Game, Unit } from "../unit";

import * as co from "game/constants"
import { getObjectsByPrototype } from "game/utils";
import { Creep, Structure, StructureContainer } from "game/prototypes";


export class Worker extends Unit('MC2') {
    static initialEnergy = true  // 初始 3 个 Container 还有能量
    static sources(): StructureContainer[] {
        return getObjectsByPrototype(StructureContainer)
    }

    action(index: number) {
        let source = Game.mSpawn.findClosestByPath(Worker.sources().filter(it => it.store.energy))!
        if (source.getRangeTo(Game.mSpawn) > 4) {
            Worker.initialEnergy = false
        }

        if (Worker.initialEnergy) {
            let target: Creep | Structure = (index == 0 ? Game.mSpawn : Worker.units()[index - 1]) as any
            if (index == Worker.units().count(it => !!it.getRangeTo(Game.mSpawn)) - 1) {  // 传输链的最后一个工人来回走
                if (this.store.getFreeCapacity(co.RESOURCE_ENERGY)) {
                    this.moveTo(source.unitTo(Game.mSpawn))
                    this.withdraw(source, co.RESOURCE_ENERGY)
                } else {
                    this.moveTo(target)
                }
            } else {  // 其余工人站定不动
                this.moveTo(target.unitTo(source))
            }

            this.transfer(target, co.RESOURCE_ENERGY)
        } else {
            if (this.store.getFreeCapacity(co.RESOURCE_ENERGY)) {
                this.moveTo(source)
                this.withdraw(source, co.RESOURCE_ENERGY)
            } else {
                this.moveTo(Game.mSpawn)
                this.transfer(Game.mSpawn, co.RESOURCE_ENERGY)
            }
        }
    }
}

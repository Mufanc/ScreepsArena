import { Game, Unit } from "../unit";

import * as co from "game/constants"
import { getObjectsByPrototype } from "game/utils";
import { StructureContainer } from "game/prototypes";
import { lazy } from "common/utils";


export class Farmer extends Unit('MCMC') {
    @lazy(() => getObjectsByPrototype(StructureContainer))
    static energySources: StructureContainer[]
    action() {
        if (this.store.getFreeCapacity(co.RESOURCE_ENERGY)) {
            let target = Game.mSpawn.findClosestByPath(Farmer.energySources.filter(it => it.store.energy))!
            this.moveTo(target)
            this.withdraw(target, co.RESOURCE_ENERGY)
        } else {
            this.moveTo(Game.mSpawn)
            this.transfer(Game.mSpawn, co.RESOURCE_ENERGY)
        }
    }
}

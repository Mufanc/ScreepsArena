import { BodyParts } from "common/utils";

import * as co from "game/constants"
import { getObjectsByPrototype } from "game/utils";
import { Creep, Source, StructureSpawn } from "game/prototypes";

let spawn: StructureSpawn, source: Source


abstract class Unit {
    static creeps: { action(): void }[] = []

    $creep: Creep
    constructor(creep: Creep) {
        this.$creep = creep
        Unit.creeps.push(this)
    }
    abstract action(): void
}


class Warrior extends Unit {
    action() {
        let target = spawn.findClosestByPath(getObjectsByPrototype(Creep).filter(it => !it.my))!
        this.$creep.moveTo(target)
        this.$creep.attack(target)
        this.$creep.rangedMassAttack()
    }

    static spawn() {
        let result = spawn.spawnCreep(BodyParts('M3AR2'))
        if (result.object) {
            return new Warrior(result.object)
        } else {
            return result.error
        }
    }
}


class Worker extends Unit {
    action() {
        if (this.$creep.store.getFreeCapacity(co.RESOURCE_ENERGY)) {
            this.$creep.moveTo(source)
            this.$creep.harvest(source)
        } else {
            this.$creep.moveTo(spawn)
            this.$creep.transfer(spawn, co.RESOURCE_ENERGY)
        }
    }

    static spawn() {
        let result = spawn.spawnCreep(BodyParts('M2W2C'))
        if (result.object) {
            return new Worker(result.object)
        } else {
            return result.error
        }
    }
}


// noinspection JSUnusedGlobalSymbols
export function loop() {
    spawn = spawn || getObjectsByPrototype(StructureSpawn)[0]
    source = source || getObjectsByPrototype(Source)[0]
    Unit.creeps.forEach(it => it.action())
    if (Unit.creeps.length < 3) {
        Worker.spawn()
    } else {
        Warrior.spawn()
    }
}

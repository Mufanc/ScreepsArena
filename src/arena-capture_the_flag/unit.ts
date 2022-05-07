import { lazy } from "common/utils";
import { Mirror } from "common/ext";
import { Newable } from "common/types";

import * as co from "game/constants"
import { Flag } from "arena/prototypes"
import { Creep, Id, StructureTower } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";

Flag.prototype.unitTo = Creep.prototype.unitTo


export class Game {
    @lazy(() => getObjectsByPrototype(Flag).find(it => it.my))
    static mFlag: Flag

    @lazy(() => getObjectsByPrototype(Flag).find(it => !it.my))
    static eFlag: Flag

    @lazy(() => getObjectsByPrototype(StructureTower).filter(it => it.my))
    static mTowers: StructureTower[]

    @lazy(() => getObjectsByPrototype(StructureTower).filter(it => !it.my))
    static eTowers: StructureTower[]

    static mCreeps: Creep[]; static eCreeps: Creep[]

    static enemyRange: number

    static update() {
        this.mCreeps = getObjectsByPrototype(Creep).filter(it => it.my)
        this.eCreeps = getObjectsByPrototype(Creep).filter(it => !it.my)
        this.enemyRange = this.eCreeps.minBy(it => it.getManhattanRangeTo(this.mFlag))
            ?.getManhattanRangeTo(this.mFlag) ?? 1000
    }
}


type CreepType = co.ATTACK | co.RANGED_ATTACK | co.HEAL
const CreepTypes = { [co.ATTACK]: 0, [co.RANGED_ATTACK]: 0, [co.HEAL]: 0 }

const typeId: (creep: Creep) => CreepType = (() => {
    let cache = new Map<Id<Creep>, CreepType>()
    return (creep: Creep) => {
        return cache.get(creep.id) || (() => {
            let count = new Map<CreepType, number>()
            for (let part of creep.body) {
                if (part.type != co.ATTACK && part.type != co.RANGED_ATTACK && part.type != co.HEAL) continue
                let type = ((type) => {
                    switch (type) {
                        case co.ATTACK:
                        case co.RANGED_ATTACK:
                        case co.HEAL:
                            return type
                        default: throw new Error("Unknown body-part type!")
                    }
                })(part.type)
                count.set(type, (count.get(type) ?? 0) + 1)
            }
            let type = Array(...count.entries()).maxBy(it => it[1])!![0]
            cache.set(creep.id, type)
            return type
        })()
    }
})()


declare module "game/prototypes" {
    interface Creep {
        hp(type?: 'V' | 'T', norm?: boolean): number
    }
}
Creep.prototype.hp = function (this: Creep, type = 'V', norm = false) {
    let parts = this.body.filter(it => type == 'T' || it.type in CreepTypes).map(it => it.hits)
    let hits = parts.reduce((a, b) => a + b), hitsMax = parts.length * 100
    if (norm) {
        return hits / hitsMax
    }
    return hits
}


export interface UnitConstructor<T> {
    units(): T[]
    new(proxy: Creep): {
        action(index: number): void
    }
}

export function Unit(type: CreepType) {
    return class Unit extends Mirror<Creep> {
        action(ignored: number): void { throw new Error("Stub!") }
        static units<T>(this: Newable<T>): T[] {
            return Game.mCreeps.filter(it => typeId(it) == type).map(it => new this(it))
        }
    }
}


export function chooseToAttack(creeps: Creep[]) {
    return creeps.filter(it => it.hp() != 0).minBy(it => it.hp()) ||
        creeps.minBy(it => it.hp('T'))!
}


export function runCreeps(
    ...types: ({ units(): any[] } & Newable<{ action(index: number): void }>)[]
) {
    for (let construct of types) {
        for (let [ index, item ] of construct.units().entries()) {
            item.action(index)
        }
    }
}

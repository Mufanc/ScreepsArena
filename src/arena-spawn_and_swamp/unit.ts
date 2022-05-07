import { Mirror } from "common/ext";
import { BodyParts, lazy } from "common/utils";
import { Constructor } from "common/types";

import * as co from "game/constants"
import { Creep, StructureSpawn } from "game/prototypes";
import { getObjectsByPrototype, getTicks } from "game/utils";

export class Game {
    static mCreeps: Creep[]

    @lazy(() => getObjectsByPrototype(StructureSpawn).find(it => it.my))
    static mSpawn: StructureSpawn;

    @lazy(() => getObjectsByPrototype(StructureSpawn).find(it => !it.my))
    static eSpawn: StructureSpawn;
    static refresh() {
        this.mCreeps = getObjectsByPrototype(Creep).filter(it => it.my)
    }
}


declare module "game/prototypes" {
    interface Creep {
        get signature(): string
    }
}
Object.defineProperty(
    Creep.prototype, 'signature', {
        get(this: Creep): string {
            let sign = '', last = '#', count = 0
            for (let part of this.body) {
                let type
                switch (part.type) {
                    case co.MOVE: { type = 'M'; break }
                    case co.WORK: { type = 'W'; break }
                    case co.CARRY: { type = 'C'; break }
                    case co.ATTACK: { type = 'A'; break }
                    case co.RANGED_ATTACK: { type = 'R'; break }
                    case co.HEAL: { type = 'H'; break; }
                    case co.TOUGH: { type = 'T'; break; }
                    default: throw new Error('Unexpected body-part')
                }
                if (last == type) {
                    count++
                } else {
                    sign += (count ? count + 1 : '') + type
                    count = 0
                }
                last = type
            }
            sign += count ? count + 1 : ''
            return sign
        }
    }
)


export function Unit(signature: string) {
    return class Unit extends Mirror<Creep> {
        // noinspection JSUnusedGlobalSymbols
        action(ignored: number) { throw new Error("Stub!") }

        static spawn<T>(this: new(creep: Creep) => T): T | number {
            let result = Game.mSpawn.spawnCreep(BodyParts(signature))
            if (result.object) {
                return new this(result.object)
            } else {
                return result.error!
            }
        }

        private static $cache = new Map<any, [number, any]>()  // Map<Unit, [ getTicks(), ...units ]>
        static units<T extends Constructor<Unit>>(this: T): (T & Creep)[] {
            let cache = Unit.$cache.get(this)
            if (cache && cache[0] == getTicks()) {
                return cache[1]
            }
            let result: any = Game.mCreeps.filter(it => it.signature == signature).map(it => new this(it))
            Unit.$cache.set(this, [getTicks(), result])
            return result
        }
    }
}

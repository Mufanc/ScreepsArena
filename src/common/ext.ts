import { Nullable } from "./types";

import { Creep, GameObject, RoomPosition, Structure } from "game/prototypes";


abstract class _Mirror<T> {
    protected constructor(obj: T) {
        let $this = this
        return new Proxy(obj as any, {
            get(target: any, name: string, proxy: any): any {
                if (name in $this) {
                    return Reflect.get($this, name)
                }
                return Reflect.get(target, name, proxy)
            }
        })
    }
}
export const Mirror: new<T>(obj: T) => _Mirror<T> & T = _Mirror as any
export type Mirror<T> = _Mirror<T> & T


interface KeyFunc<T> { (item: T): any }
interface ConditionFunc<T> { (item: T): boolean}
declare global {
    interface Array<T> {
        minBy(key: KeyFunc<T>): Nullable<T>
        maxBy(key: KeyFunc<T>): Nullable<T>
        sortBy(key: KeyFunc<T>): Array<T>
        count(condition: ConditionFunc<T>): number
    }
}
Array.prototype.minBy = function <T>(this: Array<T>, key: KeyFunc<T>) {
    if (!this.length) return null
    return this.reduce((a, b) => key(a) < key(b) ? a : b)
}
Array.prototype.maxBy = function <T>(this: Array<T>, key: KeyFunc<T>) {
    if (!this.length) return null
    return this.reduce((a, b) => key(a) > key(b) ? a : b)
}
Array.prototype.sortBy = function <T>(this: Array<T>, key: KeyFunc<T>) {
    return this.sort((a, b) => {
        return key(a) < key(b) ? -1 : 1
    })
}
Array.prototype.count = function <T>(this: Array<T>, condition: ConditionFunc<T>) {
    let count = 0
    this.forEach(it => condition(it) && count++)
    return count
}


declare module "game/prototypes" {
    interface Creep {
        getManhattanRangeTo(target: RoomPosition): number
        nextTo(
            target: RoomPosition, position: [number, number]
        ): number | undefined
    }
}
Creep.prototype.getManhattanRangeTo = function(target): number {
    return Math.abs(this.x - target.x) + Math.abs(this.y - target.y)
}
Creep.prototype.nextTo = function (this: Creep, target, position) {
    return this.moveTo({
        x: target.x + position[0],
        y: target.y + position[1]
    })
}


declare module "game/prototypes" {
    interface GameObject {
        unitTo(target: RoomPosition): RoomPosition
    }
}
function unitTo(this: GameObject, target: RoomPosition, inverse = false) {
    let { x: mx, y: my } = this, { x: tx, y: ty } = target
    let dx = tx - mx, dy = ty - my, flag = inverse ? -1 : 1
    let length = Math.sqrt(dx * dx + dy * dy)
    return {
        x: Math.round(mx + flag * dx / length),
        y: Math.round(my + flag * dy / length)
    }
}
Creep.prototype.unitTo = unitTo
Structure.prototype.unitTo = unitTo


export { }

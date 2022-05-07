import * as co from "game/constants"


export function Implements<T>() {
    return (ignored: T) => {}
}


export function lazy(func: () => any) {
    return (target: any, name: string) => {
        let result: any
        Object.defineProperty(
            target, name, {
                get() {
                    if (result) return result
                    return result = func()
                }
            }
        )
    }
}


export function BodyParts(signature: string): co.BodyPartConstant[] {
    let parts: co.BodyPartConstant[] = [], record
    for (let ch of signature) {
        let part
        switch (ch) {
            case 'M': { part = co.MOVE; break }
            case 'W': { part = co.WORK; break }
            case 'C': { part = co.CARRY; break }
            case 'A': { part = co.ATTACK; break }
            case 'R': { part = co.RANGED_ATTACK; break }
            case 'H': { part = co.HEAL; break; }
            case 'T': { part = co.TOUGH; break; }
            default: {
                if (ch.match(/\d/) && record) {
                    parts.push(...Array(Number(ch)).fill(record))
                } else {
                    throw new Error('Bad pattern!')
                }
            }
        }
        (record && part) && parts.push(record)
        record = part
    }
    record && parts.push(record)
    return parts
}

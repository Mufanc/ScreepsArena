import {Newable} from "common/types";
import {Game} from "./unit";
import {Worker, Ranger} from "./units/professions"
import {getCpuTime} from "game/utils";
import {arenaInfo} from "game";


export function runCreeps(
    ...types: ({ units(): any[] } & Newable<{ action(index: number): void }>)[]
) {
    for (let construct of types) {
        for (let [ index, item ] of construct.units().entries()) {
            item.action(index)
        }
    }
}


// noinspection JSUnusedGlobalSymbols
export function loop() {
    Game.refresh()
    runCreeps(Worker, Ranger)

    if (Worker.units().length < 3) {
        Worker.spawn()
    } else {
        Ranger.spawn()
    }

    console.log(`cpu time limit: ${Math.floor(getCpuTime() / arenaInfo.cpuTimeLimit * 100)}%`)
}

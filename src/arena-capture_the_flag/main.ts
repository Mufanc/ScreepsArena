import { Mirror } from "common/ext";
import { chooseToAttack, Game, runCreeps, Unit } from "./unit";

import * as co from "game/constants";
import { getCpuTime, getTicks } from "game/utils";
import { Creep, StructureTower } from "game/prototypes";
import { arenaInfo } from "game";


class Tower extends Mirror<StructureTower> {
    action(): void {
        if (this.slay()) return
        let healTarget = this.findInRange(Game.mCreeps, 50)
            .filter(it => it.hp('V', true) <= 0.25)
            .minBy(it => it.hp())
        if (healTarget && !Game.mFlag.findInRange(Game.eCreeps, 4).length) {
            this.heal(healTarget)
        } else {
            this.attack(chooseToAttack(this.findInRange(Game.eCreeps, 30)))
        }
    }

    slay(): boolean {
        if (this.store.energy < 10) return false
        let target = Game.eCreeps.find((creep) => {
            let health = creep.hp(), damage = Tower.getDamageByRange(this.getRangeTo(creep))
            return health && health < 1.5 * damage
        })
        if (target) {
            this.attack(target)
            return true
        }
        return false
    }

    static getDamageByRange(range: number): number {
        if (range > 50) return 0
        if (range >= 20) return 35
        if (range <= 5) return 150
        return 35 + 115 * (20 - range) / 15
    }

    static units(): Tower[] {
        return Game.mTowers.map(it => new Tower(it))
    }
}


class Warrior extends Unit(co.ATTACK) {
    action(index: number) {
        switch (index) {
            case 0: {
                this.moveTo(Game.mFlag)
                break
            }
            case 1: {
                let enemies = Game.mFlag.findInRange(Game.eCreeps, 4)
                if (enemies.length && enemies.length <= 3) {
                    this.moveTo(enemies.minBy(it => it.getRangeTo(Game.mFlag))!)
                } else {
                    this.moveTo(Game.mFlag.unitTo(Game.eFlag))
                }
                break
            }
        }
        this.attack(this.findInRange(Game.eCreeps, 1).minBy(it => it.hp())!)
    }
}


class Archer extends Unit(co.RANGED_ATTACK) {
    action() {
        // Todo: 生命值低时逃离
        if (getTicks() < 1500 && Game.eCreeps.length) {  // 按兵不动
            if (Game.enemyRange < 20) {
                this.moveTo(this.findClosestByPath(Game.eCreeps)!)
            }
        } else {
            if (Game.enemyRange < 105) {  // 防御
                if (Game.enemyRange < 100) {
                    this.moveTo(Game.mFlag.findClosestByRange(Game.eCreeps)!)
                } else {
                    this.moveTo(Game.mFlag)
                }
            } else {  // 进攻
                let priestNearby = this.findInRange(Priest.units(), 3).length;
                let priestInFront = Priest.units().maxBy(it => it.getManhattanRangeTo(Game.mFlag))
                if (priestNearby || priestInFront == null) {
                    this.moveTo(Game.eFlag)
                } else if (this.getManhattanRangeTo(Game.mFlag) < priestInFront.getManhattanRangeTo(Game.mFlag)) {
                    this.moveTo(priestInFront)
                }
            }
        }
        this.$attack()
    }

    $attack() {
        let range = Object.fromEntries(
            [1, 2, 3].map(n => [n, this.findInRange(Game.eCreeps, n).length])
        )
        let attackAll = (range[3] - range[2] - range[1]) + (range[2] - range[1]) * 4 + range[1] * 10
        let attackOne = range[3] && 10
        if (attackAll > attackOne) {
            this.rangedMassAttack()
        } else {
            this.rangedAttack(chooseToAttack(this.findInRange(Game.eCreeps, 3)))
        }
    }
}


class Priest extends Unit(co.HEAL) {
    action(index: number) {
        // Todo: 远离敌人 & 接近本方
        let target = Game.mCreeps.filter(it => it.hits != it.hitsMax).minBy(it => it.hp())!
        let archers = Archer.units()
        if (Game.mCreeps.every(it => it.hits == it.hitsMax)) {
            this.moveTo(archers[index % archers.length])
        } else {
            this.moveTo(target!)
        }
        this.$heal(target)
    }
    $heal(target: Creep) {
        if (this.heal(target) == co.ERR_NOT_IN_RANGE && this.rangedHeal(target) == co.ERR_NOT_IN_RANGE) {
            this.$heal(this.findInRange(Game.mCreeps, 3).minBy(it => it.hp())!)
        }
    }
}


// noinspection JSUnusedGlobalSymbols
export function loop() {
    Game.update()
    runCreeps(Tower, Warrior, Archer, Priest)
    console.log(`cpu time limit: ${Math.floor(getCpuTime() / arenaInfo.cpuTimeLimit * 100)}%`)
}
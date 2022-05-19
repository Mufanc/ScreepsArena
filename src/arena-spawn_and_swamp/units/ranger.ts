import {Game, Unit} from "../unit"

export class Ranger extends Unit('M4R2M5H') {
    action() {
        this.$heal()
        this.$attack()

        if (this.hits > 1000) {
            this.action_radical()
        } else if (this.hits > 800) {
            this.action_conservative()
        } else {
            this.action_low_health()
        }

    }

    private action_radical() {
        this.moveTo(Game.mSpawn.findClosestByPath(Game.eCreeps) || Game.eSpawn)
    }

    private action_conservative() {
        this.moveTo(this.unitTo(this.findClosestByRange(Game.eCreeps)!, true))
    }

    private action_low_health() {
        this.moveTo(this.unitTo(this.findClosestByRange(Game.eCreeps)!, true))
    }

    private $heal() {
        if (this.hits < this.hitsMax) {
            this.heal(this)
        } else {
            let target = this.findInRange(Game.mCreeps, 3).minBy(it => it.hits)!
            if (this.getRangeTo(target) == 1) {
                this.heal(target)
            } else {
                this.rangedHeal(target)
            }
        }
    }

    private $attack() {
        if (this.findInRange(Game.eCreeps, 3).length) {
            let range = Object.fromEntries(
                [1, 2, 3].map(n => [n, this.findInRange(Game.eCreeps, n).length])
            )
            let attackAll = (range[3] - range[2] - range[1]) + (range[2] - range[1]) * 4 + range[1] * 10
            let attackOne = range[3] && 10
            if (attackAll > attackOne) {
                this.rangedMassAttack()
            } else {
                this.rangedAttack(this.findInRange(Game.eCreeps, 3).minBy(it => it.hits)!)
            }
        } else {
            this.rangedAttack(Game.eSpawn)
        }
    }
}

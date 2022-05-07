import { Game, Unit } from "../unit"

export class Ranger extends Unit('M4R2M5H') {
    action() {
        this.heal(this)
        this.moveTo(Game.eSpawn)
        this.rangedAttack(Game.eSpawn)
    }
}

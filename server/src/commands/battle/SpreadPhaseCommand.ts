import { BaseCommand } from '../base/Command';
import { GridSystem } from '../../systems/GridSystem';

export class SpreadPhaseCommand extends BaseCommand {
  private gridSystem: GridSystem;

  constructor() {
    super();
    this.gridSystem = new GridSystem();
  }

  execute(): void {
    const updates = this.gridSystem.calculateSpread(this.state);
    
    updates.forEach(update => {
      const cell = this.state.battleGrid.get(update.index.toString());
      if (cell && cell.owner === 0) {
        cell.owner = update.owner;
        cell.hp = update.hp;
      }
    });
  }
}

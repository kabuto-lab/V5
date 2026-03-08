import { BaseCommand } from '../base/Command';

export class ProcessTickCommand extends BaseCommand {
  execute(): void {
    this.state.battleTick++;

    // Execute phases in order
    this.room.dispatcher.dispatch(new SpreadPhaseCommand());
    this.room.dispatcher.dispatch(new CombatPhaseCommand());
    this.room.dispatcher.dispatch(new InfestationPhaseCommand());
    this.room.dispatcher.dispatch(new CheckVictoryCommand());
  }
}

// Import other commands
import { SpreadPhaseCommand } from './SpreadPhaseCommand';
import { CombatPhaseCommand } from './CombatPhaseCommand';
import { InfestationPhaseCommand } from './InfestationPhaseCommand';
import { CheckVictoryCommand } from './CheckVictoryCommand';

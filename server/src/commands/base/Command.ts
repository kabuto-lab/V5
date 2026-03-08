import { Command } from '@colyseus/command';
import { BattleRoom } from '../../rooms/BattleRoom';

export abstract class BaseCommand<T = any> extends Command<BattleRoom, T> {
  protected get state() {
    return this.room.state;
  }

  protected get roomInstance() {
    return this.room;
  }
}

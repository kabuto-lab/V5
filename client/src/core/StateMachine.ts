type StateTransition<T extends string> = {
  from: T;
  to: T;
  condition?: () => boolean;
  action?: () => void;
};

export class StateMachine<T extends string> {
  private current: T;
  private transitions: Map<T, StateTransition<T>[]> = new Map();
  private listeners: Map<T, (() => void)[]> = new Map();

  constructor(initial: T) {
    this.current = initial;
  }

  addTransition(transition: StateTransition<T>) {
    if (!this.transitions.has(transition.from)) {
      this.transitions.set(transition.from, []);
    }
    this.transitions.get(transition.from)!.push(transition);
  }

  canTransition(to: T): boolean {
    const available = this.transitions.get(this.current) || [];
    return available.some(t => t.to === to && (!t.condition || t.condition()));
  }

  transition(to: T): boolean {
    if (!this.canTransition(to)) return false;

    const available = this.transitions.get(this.current) || [];
    const transition = available.find(t => t.to === to);

    this.current = to;
    transition?.action?.();

    const listeners = this.listeners.get(to) || [];
    listeners.forEach(cb => cb());

    return true;
  }

  get state() {
    return this.current;
  }

  on(state: T, callback: () => void) {
    if (!this.listeners.has(state)) {
      this.listeners.set(state, []);
    }
    this.listeners.get(state)!.push(callback);
  }
}

// Game-specific state machine
export type GamePhase = 'lobby' | 'setup' | 'countdown' | 'battle' | 'ended';

export const createGameStateMachine = () => {
  const sm = new StateMachine<GamePhase>('lobby');

  sm.addTransition({ from: 'lobby', to: 'setup' });
  sm.addTransition({
    from: 'setup',
    to: 'countdown',
    condition: () => {
      // Check if all players ready
      return true; // Implement actual check
    }
  });
  sm.addTransition({ from: 'countdown', to: 'battle' });
  sm.addTransition({ from: 'battle', to: 'ended' });
  sm.addTransition({ from: 'ended', to: 'lobby' });

  return sm;
};

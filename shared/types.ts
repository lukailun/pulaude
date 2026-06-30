export type BuddyState =
  | 'idle'
  | 'busy'
  | 'attention'
  | 'celebrate'
  | 'error'
  | 'sleep'
  | 'love';

export interface StateMessage {
  type: 'state_change';
  state: BuddyState;
  timestamp: number;
  sessionId: string;
}

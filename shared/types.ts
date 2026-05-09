export type ClaudeState =
  | 'IDLE'
  | 'THINKING'
  | 'READING'
  | 'WRITING'
  | 'EXECUTING'
  | 'WORKING'
  | 'COMPLETE'
  | 'ERROR'
  | 'APPROVAL'
  | 'DISCONNECTED';

export interface StateMessage {
  type: 'state_change';
  state: ClaudeState;
  previousState?: ClaudeState;
  tool?: string;
  toolDetail?: string;
  timestamp: number;
  sessionId: string;
}

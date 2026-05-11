export type ClaudeState =
  | 'IDLE'
  | 'INITIALIZING'
  | 'THINKING'
  | 'COMPACTING_CONTEXT'
  | 'READING'
  | 'WRITING'
  | 'EXECUTING'
  | 'APPROVAL'
  | 'WAITING_ELICITATION'
  | 'SUBAGENT_RUNNING'
  | 'TASK_MANAGEMENT'
  | 'COMPLETE'
  | 'TOOL_ERROR'
  | 'API_ERROR'
  | 'DISCONNECTED'
  | 'WORKING'
  | 'PERMISSION_DENIED';

export interface StateMessage {
  type: 'state_change';
  state: ClaudeState;
  previousState?: ClaudeState;
  tool?: string;
  toolDetail?: string;
  timestamp: number;
  sessionId: string;
}

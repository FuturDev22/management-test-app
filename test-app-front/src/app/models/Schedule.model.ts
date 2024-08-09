export interface Schedule {
    id?: number;
    scenarioId: number;
    scheduledTime: string;
    executed: boolean;
    executionStatus?: string;
  }
  
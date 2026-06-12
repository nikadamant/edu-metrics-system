export interface Question {
  questionText: string;
  options: string[];
  correctAnswer: number;
  estimatedTime: number;
}

export interface Test {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface MetricEvent {
  eventType: 'tab-switch' | 'copy-paste' | 'context-menu' | 'time-anomaly';
  details: string;
  timestamp: Date;
}
// ===== Chapter Types =====
export interface ILesson {
  lessonNumber: number;
  lessonTitle: string;
  simulationCount: number;
  slug: string;
}

export interface IChapter {
  _id?: string;
  grade: 10 | 11 | 12;
  chapterNumber: number;
  chapterTitle: string;
  volume: 1 | 2;
  slug: string;
  lessons: ILesson[];
  order: number;
  icon: string;
  color: string;
}

// ===== Simulation Types =====
export interface IControl {
  type: 'slider' | 'checkbox' | 'select' | 'input';
  name: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number | string | boolean;
  options?: string[];
  showIf?: {
    control: string;
    value: number | string | boolean | (number | string | boolean)[];
  };
  displayValues?: string[];
}

export interface ISimulationConfig {
  boardSize: { width: number; height: number };
  boundingBox: [number, number, number, number];
  showAxis: boolean;
  showGrid: boolean;
  theme: 'light' | 'dark';
}

export type VisualizationType = 'jsxgraph' | 'plotly' | 'canvas' | 'custom';

export interface ISimulation {
  _id?: string;
  // Metadata
  grade: 10 | 11 | 12;
  chapterSlug: string;
  lessonSlug: string;
  title: string;
  description: string;
  order: number;
  // Code (hidden from client list)
  simulationCode: string;
  visualizationType: VisualizationType;
  // Config
  config: ISimulationConfig;
  controls: IControl[];
  // Educational content
  mathContent: string;
  explanation: string;
  keyInsights: string[];
  // Meta
  tags: string[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ===== API Response Types =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

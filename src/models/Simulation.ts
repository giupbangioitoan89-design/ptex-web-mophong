import mongoose, { Schema, Document } from 'mongoose';

export interface IControlDoc {
  type: 'slider' | 'checkbox' | 'select' | 'input';
  name: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue: mongoose.Schema.Types.Mixed;
  options?: string[];
}

export interface ISimulationDoc extends Document {
  // Metadata
  grade: 10 | 11 | 12;
  chapterSlug: string;
  lessonSlug: string;
  title: string;
  description: string;
  order: number;
  // Code (hidden)
  simulationCode: string;
  visualizationType: 'jsxgraph' | 'plotly' | 'canvas' | 'custom';
  // Config
  config: {
    boardSize: { width: number; height: number };
    boundingBox: [number, number, number, number];
    showAxis: boolean;
    showGrid: boolean;
    theme: 'light' | 'dark';
  };
  controls: IControlDoc[];
  // Educational
  mathContent: string;
  explanation: string;
  keyInsights: string[];
  // Meta
  tags: string[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
  isPublished: boolean;
}

const ControlSchema = new Schema<IControlDoc>(
  {
    type: { type: String, required: true, enum: ['slider', 'checkbox', 'select', 'input'] },
    name: { type: String, required: true },
    label: { type: String, required: true },
    min: Number,
    max: Number,
    step: Number,
    defaultValue: { type: Schema.Types.Mixed, required: true },
    options: [String],
  },
  { _id: false }
);

const SimulationSchema = new Schema<ISimulationDoc>(
  {
    grade: { type: Number, required: true, enum: [10, 11, 12], index: true },
    chapterSlug: { type: String, required: true, index: true },
    lessonSlug: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },

    simulationCode: { type: String, required: true },
    visualizationType: {
      type: String,
      required: true,
      enum: ['jsxgraph', 'plotly', 'canvas', 'custom'],
      default: 'jsxgraph',
    },

    config: {
      boardSize: {
        width: { type: Number, default: 600 },
        height: { type: Number, default: 500 },
      },
      boundingBox: { type: [Number], default: [-6, 6, 6, -6] },
      showAxis: { type: Boolean, default: true },
      showGrid: { type: Boolean, default: true },
      theme: { type: String, default: 'light', enum: ['light', 'dark'] },
    },

    controls: { type: [ControlSchema], default: [] },

    mathContent: { type: String, default: '' },
    explanation: { type: String, default: '' },
    keyInsights: { type: [String], default: [] },

    tags: { type: [String], default: [] },
    difficulty: {
      type: String,
      default: 'basic',
      enum: ['basic', 'intermediate', 'advanced'],
    },
    isPublished: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Compound index for fast queries
SimulationSchema.index({ grade: 1, chapterSlug: 1, lessonSlug: 1, order: 1 });
SimulationSchema.index({ grade: 1, isPublished: 1 });

export default mongoose.models.Simulation ||
  mongoose.model<ISimulationDoc>('Simulation', SimulationSchema);

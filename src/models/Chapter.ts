import mongoose, { Schema, Document } from 'mongoose';

export interface ILessonDoc {
  lessonNumber: number;
  lessonTitle: string;
  simulationCount: number;
  slug: string;
}

export interface IChapterDoc extends Document {
  grade: 10 | 11 | 12;
  chapterNumber: number;
  chapterTitle: string;
  volume: 1 | 2;
  slug: string;
  lessons: ILessonDoc[];
  order: number;
  icon: string;
  color: string;
}

const LessonSchema = new Schema<ILessonDoc>({
  lessonNumber: { type: Number, required: true },
  lessonTitle: { type: String, required: true },
  simulationCount: { type: Number, default: 0 },
  slug: { type: String, required: true },
});

const ChapterSchema = new Schema<IChapterDoc>(
  {
    grade: { type: Number, required: true, enum: [10, 11, 12], index: true },
    chapterNumber: { type: Number, required: true },
    chapterTitle: { type: String, required: true },
    volume: { type: Number, required: true, enum: [1, 2] },
    slug: { type: String, required: true },
    lessons: { type: [LessonSchema], default: [] },
    order: { type: Number, required: true },
    icon: { type: String, default: '📐' },
    color: { type: String, default: '#3b82f6' },
  },
  { timestamps: true }
);

// Compound index for fast queries
ChapterSchema.index({ grade: 1, order: 1 });
ChapterSchema.index({ grade: 1, slug: 1 }, { unique: true });

export default mongoose.models.Chapter ||
  mongoose.model<IChapterDoc>('Chapter', ChapterSchema);

'use client';

import Link from 'next/link';
import type { IChapter } from '@/types';

interface ChapterCardProps {
  chapter: IChapter;
}

export default function ChapterCard({ chapter }: ChapterCardProps) {
  const totalSims = chapter.lessons.reduce((sum, l) => sum + l.simulationCount, 0);

  return (
    <Link
      href={`/lop/${chapter.grade}/${chapter.slug}`}
      className="chapter-card animate-in"
      style={{ '--card-color': chapter.color } as React.CSSProperties}
    >
      <div className="card-icon" style={{ background: `${chapter.color}20` }}>
        {chapter.icon}
      </div>
      <div className="card-number">
        Chương {chapter.chapterNumber} · Tập {chapter.volume}
      </div>
      <div className="card-title">{chapter.chapterTitle}</div>
      <div className="card-meta">
        <span className="lesson-count">
          📖 {chapter.lessons.length} bài
        </span>
        {totalSims > 0 && (
          <span className="lesson-count">
            🎯 {totalSims} mô phỏng
          </span>
        )}
      </div>
    </Link>
  );
}

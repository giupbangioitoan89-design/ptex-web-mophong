import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Chapter from '@/models/Chapter';

// GET /api/chapters?grade=10
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get('grade');

    const filter: Record<string, unknown> = {};
    if (grade) filter.grade = parseInt(grade);

    const chapters = await Chapter.find(filter)
      .sort({ grade: 1, order: 1 })
      .lean();

    return NextResponse.json({ success: true, data: chapters, count: chapters.length });
  } catch (error) {
    console.error('[API] chapters error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chapters' },
      { status: 500 }
    );
  }
}

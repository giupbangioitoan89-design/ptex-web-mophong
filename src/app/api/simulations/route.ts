import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Simulation from '@/models/Simulation';

// GET /api/simulations?grade=10&chapter=ham-so&lesson=ham-bac-hai
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get('grade');
    const chapter = searchParams.get('chapter');
    const lesson = searchParams.get('lesson');

    const filter: Record<string, unknown> = { isPublished: true };
    if (grade) filter.grade = parseInt(grade);
    if (chapter) filter.chapterSlug = chapter;
    if (lesson) filter.lessonSlug = lesson;

    // List view: exclude simulationCode for security
    const simulations = await Simulation.find(filter)
      .select('-simulationCode')
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: simulations,
      count: simulations.length,
    });
  } catch (error) {
    console.error('[API] simulations list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch simulations' },
      { status: 500 }
    );
  }
}

// POST /api/simulations — Create new simulation
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const simulation = await Simulation.create(body);

    return NextResponse.json(
      { success: true, data: simulation },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] simulation create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create simulation' },
      { status: 500 }
    );
  }
}

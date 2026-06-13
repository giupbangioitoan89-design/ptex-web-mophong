import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Simulation from '@/models/Simulation';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/simulations/:id — Full detail including simulationCode
export async function GET(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const simulation = await Simulation.findById(id).lean();

    if (!simulation) {
      return NextResponse.json(
        { success: false, error: 'Simulation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: simulation });
  } catch (error) {
    console.error('[API] simulation get error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch simulation' },
      { status: 500 }
    );
  }
}

// PUT /api/simulations/:id — Update simulation
export async function PUT(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const simulation = await Simulation.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!simulation) {
      return NextResponse.json(
        { success: false, error: 'Simulation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: simulation });
  } catch (error) {
    console.error('[API] simulation update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update simulation' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Chapter from '@/models/Chapter';
import Simulation from '@/models/Simulation';
import Setting from '@/models/Setting';
import { CURRICULUM } from '@/data/curriculum';
import { demoSimulations } from '@/data/simulations';

// POST /api/seed — Seed chapters + demo simulations
export async function POST() {
  try {
    await connectDB();

    // Seed default site password
    await Setting.findOneAndUpdate(
      { key: 'site_password' },
      { value: '1234567890' },
      { upsert: true, new: true }
    );

    // 1. Seed chapters
    let chaptersCreated = 0;
    for (const ch of CURRICULUM) {
      await Chapter.findOneAndUpdate(
        { grade: ch.grade, slug: ch.slug },
        ch,
        { upsert: true, new: true }
      );
      chaptersCreated++;
    }

    // 2. Seed demo simulations
    // Clean up incorrect slug simulation if exists
    await Simulation.deleteMany({ chapterSlug: 'ham-so-do-thi-va-ung-dung' });

    // Clean up all old simulations for this grade 11 trig lesson
    await Simulation.deleteMany({
      grade: 11,
      chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
      lessonSlug: 'goc-luong-giac-duong-tron'
    });

    let simsCreated = 0;
    for (const sim of demoSimulations) {
      await Simulation.findOneAndUpdate(
        { grade: sim.grade, chapterSlug: sim.chapterSlug, lessonSlug: sim.lessonSlug, title: sim.title },
        sim,
        { upsert: true, new: true }
      );
      simsCreated++;
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${chaptersCreated} chapters and ${simsCreated} demo simulations`,
    });
  } catch (error) {
    console.error('[API] seed error:', error);
    return NextResponse.json(
      { success: false, error: 'Seed failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

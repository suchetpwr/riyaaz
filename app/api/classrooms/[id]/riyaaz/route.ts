import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { normalizeDate } from '@/lib/utils';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createRiyaazSchema = z.object({
  date: z.string(),
  durationMinutes: z.number().min(1),
  raga: z.string().min(1),
  recordingUrl: z.string().url().optional(),
  notes: z.string().min(1, 'Notes are required'),
});

// GET /api/classrooms/[id]/riyaaz - Get riyaaz entries for current student
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const classroomId = params.id;

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        classroomId_studentId: {
          classroomId,
          studentId: session.user.id,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all riyaaz entries
    const entries = await prisma.riyaazEntry.findMany({
      where: {
        classroomId,
        studentId: session.user.id,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Get riyaaz entries error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/classrooms/[id]/riyaaz - Create riyaaz entry (allows multiple per day)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const classroomId = params.id;
    const body = await req.json();
    const { date, durationMinutes, raga, recordingUrl, notes } =
      createRiyaazSchema.parse(body);

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        classroomId_studentId: {
          classroomId,
          studentId: session.user.id,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const normalizedDate = normalizeDate(date);

    // Validate date - cannot log future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const logDate = new Date(normalizedDate);
    logDate.setHours(0, 0, 0, 0);

    if (logDate > today) {
      return NextResponse.json(
        { error: 'Cannot log riyaaz for future dates' },
        { status: 400 }
      );
    }

    // Create new entry (allows multiple per day)
    const entry = await prisma.riyaazEntry.create({
      data: {
        classroomId,
        studentId: session.user.id,
        date: normalizedDate,
        durationMinutes,
        raga,
        recordingUrl,
        notes,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Create riyaaz entry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculatePoints } from '@/lib/utils';
import { z } from 'zod';

const mendStreakSchema = z.object({
  missedDate: z.string(), // ISO date string of the missed day to mend
});

// POST /api/classrooms/[id]/mend-streak - Mend a broken streak (costs 50 points)
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
    const { missedDate } = mendStreakSchema.parse(body);

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

    // Calculate current points
    const riyaazEntries = await prisma.riyaazEntry.findMany({
      where: {
        classroomId,
        studentId: session.user.id,
      },
    });

    const homeworkSubmissions = await prisma.homeworkSubmission.findMany({
      where: {
        studentId: session.user.id,
        assignment: {
          classroomId,
        },
      },
    });

    const totalPoints = calculatePoints(riyaazEntries, homeworkSubmissions);
    const MEND_COST = 50;
    const pointsAfterMend = totalPoints - (enrollment.streakMends * MEND_COST);

    // Check if student has enough points
    if (pointsAfterMend < MEND_COST) {
      return NextResponse.json(
        { 
          error: 'Not enough points',
          message: `You need ${MEND_COST} points to mend a streak. You have ${pointsAfterMend} available points.`
        },
        { status: 400 }
      );
    }

    // Check if there's already an entry for this date
    const existingEntry = await prisma.riyaazEntry.findFirst({
      where: {
        classroomId,
        studentId: session.user.id,
        date: new Date(missedDate),
      },
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: 'Already practiced on this date' },
        { status: 400 }
      );
    }

    // Check if the date is in the past (can't mend future dates or today)
    const mendDateObj = new Date(missedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    mendDateObj.setHours(0, 0, 0, 0);

    if (mendDateObj >= today) {
      return NextResponse.json(
        { error: 'Can only mend past missed days' },
        { status: 400 }
      );
    }

    // Create a "mended" riyaaz entry (0 minutes, special marker)
    await prisma.riyaazEntry.create({
      data: {
        classroomId,
        studentId: session.user.id,
        date: mendDateObj,
        durationMinutes: 0,
        raga: 'Streak Mend',
        notes: 'Streak mended using points',
      },
    });

    // Increment streak mends counter
    const updatedEnrollment = await prisma.enrollment.update({
      where: {
        classroomId_studentId: {
          classroomId,
          studentId: session.user.id,
        },
      },
      data: {
        streakMends: enrollment.streakMends + 1,
      },
    });

    return NextResponse.json({
      message: 'Streak mended successfully',
      pointsSpent: MEND_COST,
      remainingPoints: pointsAfterMend - MEND_COST,
      streakMendsUsed: updatedEnrollment.streakMends,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Mend streak error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

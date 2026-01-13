import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateStreaks, calculatePoints } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// GET /api/classrooms/[id]/stats - Get student stats for a specific classroom
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

    // Get riyaaz entries
    const riyaazEntries = await prisma.riyaazEntry.findMany({
      where: {
        classroomId,
        studentId: session.user.id,
      },
      select: {
        date: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Get homework submissions
    const homeworkSubmissions = await prisma.homeworkSubmission.findMany({
      where: {
        studentId: session.user.id,
        assignment: {
          classroomId,
        },
      },
    });

    // Calculate stats
    const streaks = calculateStreaks(riyaazEntries);
    const totalPoints = calculatePoints(riyaazEntries, homeworkSubmissions);
    const MEND_COST = 50;
    const availablePoints = totalPoints - (enrollment.streakMends * MEND_COST);
    const lastPracticedDate =
      riyaazEntries.length > 0 ? riyaazEntries[0].date : null;

    return NextResponse.json({
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
      totalPoints,
      availablePoints,
      streakMendsUsed: enrollment.streakMends,
      lastPracticedDate,
      totalRiyaazDays: new Set(
        riyaazEntries.map((e) => new Date(e.date).toDateString())
      ).size,
      totalHomeworkSubmissions: homeworkSubmissions.length,
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

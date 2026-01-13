import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateStreaks, calculatePoints } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// GET /api/classrooms/[id]/leaderboard
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const classroomId = params.id;

    // Verify access to classroom
    if (session.user.role === 'TEACHER') {
      const classroom = await prisma.classroom.findFirst({
        where: {
          id: classroomId,
          teacherId: session.user.id,
        },
      });
      if (!classroom) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
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
    }

    // Get all students enrolled in this classroom
    const enrollments = await prisma.enrollment.findMany({
      where: { classroomId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Calculate stats for each student
    const leaderboard = await Promise.all(
      enrollments.map(async (enrollment) => {
        const studentId = enrollment.studentId;

        // Get all riyaaz entries for this student in this classroom
        const riyaazEntries = await prisma.riyaazEntry.findMany({
          where: {
            classroomId,
            studentId,
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
            studentId,
            assignment: {
              classroomId,
            },
          },
        });

        // Calculate streaks and points
        const streaks = calculateStreaks(riyaazEntries);
        const totalPoints = calculatePoints(riyaazEntries, homeworkSubmissions);

        // Get last practiced date
        const lastPracticedDate =
          riyaazEntries.length > 0 ? riyaazEntries[0].date : null;

        return {
          studentId: enrollment.student.id,
          studentName: enrollment.student.name,
          currentStreak: streaks.currentStreak,
          longestStreak: streaks.longestStreak,
          totalPoints,
          lastPracticedDate,
        };
      })
    );

    // Sort by total points descending
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

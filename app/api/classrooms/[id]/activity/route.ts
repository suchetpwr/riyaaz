import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateStreaks, calculatePoints } from '@/lib/utils';

// GET /api/classrooms/[id]/activity - Get recent activity for a classroom
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const classroomId = params.id;

    // Verify ownership
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId: session.user.id,
      },
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get recent riyaaz entries
    const recentRiyaaz = await prisma.riyaazEntry.findMany({
      where: { classroomId },
      include: {
        student: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    // Get recent homework submissions
    const recentHomework = await prisma.homeworkSubmission.findMany({
      where: {
        assignment: {
          classroomId,
        },
      },
      include: {
        student: {
          select: {
            name: true,
          },
        },
        assignment: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
      take: 20,
    });

    // Combine and format activities
    const activities = [
      ...recentRiyaaz.map((entry) => ({
        type: 'riyaaz',
        studentName: entry.student.name,
        details: `${entry.raga}, ${entry.durationMinutes} min`,
        date: entry.date,
        timestamp: entry.createdAt,
      })),
      ...recentHomework.map((submission) => ({
        type: 'homework',
        studentName: submission.student.name,
        details: submission.assignment.title,
        date: submission.submittedAt,
        timestamp: submission.submittedAt,
      })),
    ];

    // Sort by timestamp descending
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return NextResponse.json(activities.slice(0, 20));
  } catch (error) {
    console.error('Get activity error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

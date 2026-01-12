import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/classrooms/[id] - Get classroom details
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

    // Verify access
    if (session.user.role === 'TEACHER') {
      const classroom = await prisma.classroom.findFirst({
        where: {
          id: classroomId,
          teacherId: session.user.id,
        },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      });

      if (!classroom) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      return NextResponse.json(classroom);
    } else {
      // Student access
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          classroomId_studentId: {
            classroomId,
            studentId: session.user.id,
          },
        },
        include: {
          classroom: {
            include: {
              teacher: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!enrollment) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      return NextResponse.json(enrollment.classroom);
    }
  } catch (error) {
    console.error('Get classroom error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

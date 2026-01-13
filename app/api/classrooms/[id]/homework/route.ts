import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createHomeworkSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

// GET /api/classrooms/[id]/homework - Get homework assignments for a classroom
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

    // Get assignments
    const assignments = await prisma.homeworkAssignment.findMany({
      where: { classroomId },
      include: {
        _count: {
          select: {
            submissions: true,
          },
        },
        submissions:
          session.user.role === 'STUDENT'
            ? {
                where: {
                  studentId: session.user.id,
                },
              }
            : false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Get homework assignments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/classrooms/[id]/homework - Create homework assignment (teacher only)
export async function POST(
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

    const body = await req.json();
    const { title, description, dueDate } = createHomeworkSchema.parse(body);

    const assignment = await prisma.homeworkAssignment.create({
      data: {
        classroomId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Create homework assignment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

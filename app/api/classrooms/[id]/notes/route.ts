import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  recordingUrl: z.string().url().optional(),
});

// GET /api/classrooms/[id]/notes - Get class notes
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

    // Get notes
    const notes = await prisma.classNote.findMany({
      where: { classroomId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Get class notes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/classrooms/[id]/notes - Create class note (teacher only)
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
    const { title, content, recordingUrl } = createNoteSchema.parse(body);

    const note = await prisma.classNote.create({
      data: {
        classroomId,
        title,
        content,
        recordingUrl,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Create class note error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

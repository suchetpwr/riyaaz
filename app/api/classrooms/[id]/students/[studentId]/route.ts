import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// DELETE /api/classrooms/[id]/students/[studentId] - Remove student from classroom
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; studentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: classroomId, studentId } = params;

    // Verify teacher owns the classroom
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId: session.user.id,
      },
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        classroomId_studentId: {
          classroomId,
          studentId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Student not enrolled' }, { status: 404 });
    }

    // Delete the enrollment
    await prisma.enrollment.delete({
      where: {
        classroomId_studentId: {
          classroomId,
          studentId,
        },
      },
    });

    return NextResponse.json({ message: 'Student removed successfully' });
  } catch (error) {
    console.error('Remove student error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

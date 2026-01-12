-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN     "streakMends" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "class_notes" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "recordingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "class_notes_classroomId_idx" ON "class_notes"("classroomId");

-- AddForeignKey
ALTER TABLE "class_notes" ADD CONSTRAINT "class_notes_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

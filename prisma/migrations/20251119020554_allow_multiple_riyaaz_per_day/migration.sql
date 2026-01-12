-- DropIndex
DROP INDEX "riyaaz_entries_classroomId_studentId_date_key";

-- CreateIndex
CREATE INDEX "riyaaz_entries_studentId_date_idx" ON "riyaaz_entries"("studentId", "date");

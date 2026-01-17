'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';

interface LeaderboardEntry {
  studentId: string;
  studentName: string;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  lastPracticedDate: string | null;
}

interface Activity {
  type: string;
  studentName: string;
  details: string;
  date: string;
  timestamp: string;
}

interface Homework {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  _count: { submissions: number };
}

export default function TeacherClassroomPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [classroom, setClassroom] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHomeworkForm, setShowHomeworkForm] = useState(false);
  const [homeworkData, setHomeworkData] = useState({ title: '', description: '', dueDate: '' });
  const [expandedHomework, setExpandedHomework] = useState<string | null>(null);
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<Record<string, any[]>>({});
  const [notes, setNotes] = useState<any[]>([]);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteData, setNoteData] = useState({ title: '', content: '', recordingUrl: '' });
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({ name: '', description: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user) {
      fetchData();
    }
  }, [status, session]);

  const fetchData = async () => {
    try {
      const [classroomRes, leaderboardRes, activityRes, homeworkRes, notesRes] = await Promise.all([
        fetch(`/api/classrooms/${params.id}`),
        fetch(`/api/classrooms/${params.id}/leaderboard`),
        fetch(`/api/classrooms/${params.id}/activity`),
        fetch(`/api/classrooms/${params.id}/homework`),
        fetch(`/api/classrooms/${params.id}/notes`),
      ]);

      if (classroomRes.ok) setClassroom(await classroomRes.json());
      if (leaderboardRes.ok) setLeaderboard(await leaderboardRes.json());
      if (activityRes.ok) setActivities(await activityRes.json());
      if (homeworkRes.ok) setHomeworks(await homeworkRes.json());
      if (notesRes.ok) setNotes(await notesRes.json());
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/classrooms/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updatedClassroom = await response.json();
        setClassroom(updatedClassroom);
        setShowEditForm(false);
      }
    } catch (err) {
      console.error('Failed to update classroom:', err);
    }
  };

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${studentName} from this classroom?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/classrooms/${params.id}/students/${studentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh data
        fetchData();
      } else {
        alert('Failed to remove student');
      }
    } catch (err) {
      console.error('Failed to remove student:', err);
      alert('Failed to remove student');
    }
  };

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/classrooms/${params.id}/homework`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homeworkData),
      });

      if (response.ok) {
        const newHomework = await response.json();
        setHomeworks([newHomework, ...homeworks]);
        setHomeworkData({ title: '', description: '', dueDate: '' });
        setShowHomeworkForm(false);
      }
    } catch (err) {
      console.error('Failed to create homework:', err);
    }
  };

  const toggleHomeworkSubmissions = async (homeworkId: string) => {
    if (expandedHomework === homeworkId) {
      setExpandedHomework(null);
    } else {
      setExpandedHomework(homeworkId);
      // Fetch submissions if not already loaded
      if (!homeworkSubmissions[homeworkId]) {
        try {
          const response = await fetch(`/api/homework/${homeworkId}/submissions`);
          if (response.ok) {
            const submissions = await response.json();
            setHomeworkSubmissions({ ...homeworkSubmissions, [homeworkId]: submissions });
          }
        } catch (err) {
          console.error('Failed to fetch submissions:', err);
        }
      }
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/classrooms/${params.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...noteData,
          recordingUrl: noteData.recordingUrl || undefined,
        }),
      });

      if (response.ok) {
        const newNote = await response.json();
        setNotes([newNote, ...notes]);
        setNoteData({ title: '', content: '', recordingUrl: '' });
        setShowNoteForm(false);
      }
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  if (status === 'loading' || loading) {
    return <LoadingSpinner />;
  }

  if (!session || !classroom) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={session.user.name || 'Teacher'} userRole="TEACHER" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{classroom.name}</h1>
              {classroom.description && (
                <p className="text-gray-600">{classroom.description}</p>
              )}
            </div>
            <button
              onClick={() => {
                setEditData({
                  name: classroom.name,
                  description: classroom.description || '',
                });
                setShowEditForm(!showEditForm);
              }}
              className="btn btn-secondary"
            >
              {showEditForm ? 'Cancel' : 'Edit Classroom'}
            </button>
          </div>

          {showEditForm && (
            <form onSubmit={handleEditClassroom} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classroom Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Update Classroom
                </button>
              </div>
            </form>
          )}

          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Join Code:{' '}
              <span className="font-mono bg-gray-100 px-3 py-1 rounded ml-2">
                {classroom.joinCode}
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Leaderboard</h2>
              {leaderboard.length === 0 ? (
                <p className="text-gray-600">No students enrolled yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Rank</th>
                        <th className="text-left py-3 px-4">Student</th>
                        <th className="text-left py-3 px-4">Points</th>
                        <th className="text-left py-3 px-4">Current Streak</th>
                        <th className="text-left py-3 px-4">Longest Streak</th>
                        <th className="text-left py-3 px-4">Last Practiced</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry, index) => (
                        <tr key={entry.studentId} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-semibold">#{index + 1}</td>
                          <td className="py-3 px-4">{entry.studentName}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-primary-600">{entry.totalPoints}</span>
                          </td>
                          <td className="py-3 px-4">
                            {entry.currentStreak > 0 ? (
                              <span className="text-green-600">🔥 {entry.currentStreak}</span>
                            ) : (
                              '0'
                            )}
                          </td>
                          <td className="py-3 px-4">{entry.longestStreak}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {entry.lastPracticedDate
                              ? new Date(entry.lastPracticedDate).toLocaleDateString()
                              : 'Never'}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleRemoveStudent(entry.studentId, entry.studentName)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Homework Section */}
            <div className="card mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Homework Assignments</h2>
                <button
                  onClick={() => setShowHomeworkForm(!showHomeworkForm)}
                  className="btn btn-primary"
                >
                  {showHomeworkForm ? 'Cancel' : 'Create Assignment'}
                </button>
              </div>

              {showHomeworkForm && (
                <form onSubmit={handleCreateHomework} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        className="input"
                        value={homeworkData.title}
                        onChange={(e) => setHomeworkData({ ...homeworkData, title: e.target.value })}
                        placeholder="e.g., Alankars in Raag Yaman"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        className="input"
                        rows={3}
                        value={homeworkData.description}
                        onChange={(e) =>
                          setHomeworkData({ ...homeworkData, description: e.target.value })
                        }
                        placeholder="Assignment details..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        className="input"
                        value={homeworkData.dueDate}
                        onChange={(e) => setHomeworkData({ ...homeworkData, dueDate: e.target.value })}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">
                      Create Assignment
                    </button>
                  </div>
                </form>
              )}

              {homeworks.length === 0 ? (
                <p className="text-gray-600">No homework assignments yet.</p>
              ) : (
                <div className="space-y-4">
                  {homeworks.map((hw) => (
                    <div key={hw.id} className="border border-purple-200 rounded-xl p-4 bg-white hover:shadow-lg transition-all">
                      <div 
                        className="cursor-pointer"
                        onClick={() => toggleHomeworkSubmissions(hw.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">{hw.title}</h3>
                            {hw.description && (
                              <p className="text-sm text-gray-600 mt-1">{hw.description}</p>
                            )}
                          </div>
                          <button className="text-purple-600 hover:text-purple-800">
                            {expandedHomework === hw.id ? '▼' : '▶'}
                          </button>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          {hw.dueDate && (
                            <span className="badge badge-info">
                              📅 Due: {new Date(hw.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          <span className="badge badge-success">
                            ✓ {hw._count.submissions} submission{hw._count.submissions !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      
                      {/* Submissions List */}
                      {expandedHomework === hw.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          {homeworkSubmissions[hw.id]?.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No submissions yet</p>
                          ) : (
                            <div className="space-y-3">
                              {homeworkSubmissions[hw.id]?.map((submission: any) => (
                                <div key={submission.id} className="bg-purple-50 rounded-lg p-3">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium text-gray-900">
                                      {submission.student.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(submission.submittedAt).toLocaleString()}
                                    </span>
                                  </div>
                                  {submission.recordingUrl && (
                                    <a
                                      href={submission.recordingUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-purple-600 hover:text-purple-800 underline flex items-center gap-1"
                                    >
                                      🔗 View Recording
                                    </a>
                                  )}
                                  {submission.notes && (
                                    <p className="text-sm text-gray-600 mt-2 italic">
                                      "{submission.notes}"
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Class Notes Section */}
            <div className="card mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">📚 Class Notes</h2>
                <button
                  onClick={() => setShowNoteForm(!showNoteForm)}
                  className="btn btn-primary"
                >
                  {showNoteForm ? 'Cancel' : 'Add Note'}
                </button>
              </div>

              {showNoteForm && (
                <form onSubmit={handleCreateNote} className="mb-6 p-4 bg-purple-50 rounded-xl">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        className="input"
                        value={noteData.title}
                        onChange={(e) => setNoteData({ ...noteData, title: e.target.value })}
                        placeholder="e.g., Introduction to Raag Bhairav"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content *
                      </label>
                      <textarea
                        required
                        className="input"
                        rows={5}
                        value={noteData.content}
                        onChange={(e) => setNoteData({ ...noteData, content: e.target.value })}
                        placeholder="Theory notes, practice tips, etc..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recording URL (optional)
                      </label>
                      <input
                        type="url"
                        className="input"
                        value={noteData.recordingUrl}
                        onChange={(e) => setNoteData({ ...noteData, recordingUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">
                      Post Note
                    </button>
                  </div>
                </form>
              )}

              {notes.length === 0 ? (
                <p className="text-gray-600">No class notes yet.</p>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="border border-purple-200 rounded-xl p-4 bg-gradient-to-br from-purple-50 to-white">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{note.title}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap mb-3">{note.content}</p>
                      {note.recordingUrl && (
                        <a
                          href={note.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium"
                        >
                          🎵 Listen to Recording
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              {activities.length === 0 ? (
                <p className="text-gray-600 text-sm">No recent activity.</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium">{activity.studentName}</p>
                      <p className="text-gray-600">
                        {activity.type === 'riyaaz' ? '🎵' : '📝'} {activity.details}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                      {index < activities.length - 1 && <hr className="mt-4" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

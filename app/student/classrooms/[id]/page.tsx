'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';

interface RiyaazEntry {
  id: string;
  date: string;
  durationMinutes: number;
  raga: string;
  recordingUrl: string | null;
  notes: string | null;
}

interface Homework {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  submissions: any[];
}

interface Stats {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  availablePoints: number;
  streakMendsUsed: number;
  lastPracticedDate: string | null;
}

export default function StudentClassroomPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [classroom, setClassroom] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [entries, setEntries] = useState<RiyaazEntry[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRiyaazForm, setShowRiyaazForm] = useState(false);
  const [riyaazData, setRiyaazData] = useState({
    date: new Date().toISOString().split('T')[0],
    durationMinutes: 30,
    raga: '',
    recordingUrl: '',
    notes: '',
  });
  const [selectedHomework, setSelectedHomework] = useState<string | null>(null);
  const [submissionData, setSubmissionData] = useState({ recordingUrl: '', notes: '' });
  const [notes, setNotes] = useState<any[]>([]);
  const [showMendForm, setShowMendForm] = useState(false);
  const [mendDate, setMendDate] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user) {
      fetchData();
    }
  }, [status, session]);

  const fetchData = async () => {
    try {
      const [classroomRes, statsRes, entriesRes, homeworkRes, notesRes] = await Promise.all([
        fetch(`/api/classrooms/${params.id}`),
        fetch(`/api/classrooms/${params.id}/stats`),
        fetch(`/api/classrooms/${params.id}/riyaaz`),
        fetch(`/api/classrooms/${params.id}/homework`),
        fetch(`/api/classrooms/${params.id}/notes`),
      ]);

      if (classroomRes.ok) setClassroom(await classroomRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (entriesRes.ok) setEntries(await entriesRes.json());
      if (homeworkRes.ok) setHomeworks(await homeworkRes.json());
      if (notesRes.ok) setNotes(await notesRes.json());
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogRiyaaz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/classrooms/${params.id}/riyaaz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...riyaazData,
          durationMinutes: parseInt(riyaazData.durationMinutes.toString()),
          recordingUrl: riyaazData.recordingUrl || undefined,
          notes: riyaazData.notes || undefined,
        }),
      });

      if (response.ok) {
        fetchData();
        setShowRiyaazForm(false);
        setRiyaazData({
          date: new Date().toISOString().split('T')[0],
          durationMinutes: 30,
          raga: '',
          recordingUrl: '',
          notes: '',
        });
      }
    } catch (err) {
      console.error('Failed to log riyaaz:', err);
    }
  };

  const handleSubmitHomework = async (homeworkId: string) => {
    try {
      const response = await fetch(`/api/homework/${homeworkId}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordingUrl: submissionData.recordingUrl,
          notes: submissionData.notes || undefined,
        }),
      });

      if (response.ok) {
        fetchData();
        setSelectedHomework(null);
        setSubmissionData({ recordingUrl: '', notes: '' });
      }
    } catch (err) {
      console.error('Failed to submit homework:', err);
    }
  };

  const handleMendStreak = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm('Spend 50 points to mend your streak for this date?')) {
      return;
    }

    try {
      const response = await fetch(`/api/classrooms/${params.id}/mend-streak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missedDate: mendDate }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Streak mended! You now have ${data.remainingPoints} points remaining.`);
        fetchData();
        setShowMendForm(false);
        setMendDate('');
      } else {
        alert(data.message || data.error || 'Failed to mend streak');
      }
    } catch (err) {
      console.error('Failed to mend streak:', err);
      alert('An error occurred');
    }
  };

  if (status === 'loading' || loading) {
    return <LoadingSpinner />;
  }

  if (!session || !classroom || !stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={session.user.name || 'Student'} userRole="STUDENT" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{classroom.name}</h1>
          {classroom.description && (
            <p className="text-gray-600">{classroom.description}</p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <h3 className="text-sm text-white/80 mb-2">Current Streak</h3>
            <div className="text-3xl font-bold">
              {stats.currentStreak > 0 ? `🔥 ${stats.currentStreak}` : '0'}
            </div>
          </div>
          <div className="stat-card">
            <h3 className="text-sm text-white/80 mb-2">Longest Streak</h3>
            <div className="text-3xl font-bold">{stats.longestStreak}</div>
          </div>
          <div className="stat-card">
            <h3 className="text-sm text-white/80 mb-2">Total Points</h3>
            <div className="text-3xl font-bold">{stats.totalPoints}</div>
          </div>
          <div className="stat-card">
            <h3 className="text-sm text-white/80 mb-2">Available Points</h3>
            <div className="text-3xl font-bold">{stats.availablePoints}</div>
            <p className="text-xs text-white/70 mt-1">
              ({stats.streakMendsUsed} mends used)
            </p>
          </div>
        </div>

        {/* Mend Streak Section */}
        {stats.availablePoints >= 50 && (
          <div className="card mb-8 border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  🔧 Streak Mend Available
                </h3>
                <p className="text-sm text-gray-600">
                  Missed a day? Use 50 points to mend your streak and keep it going!
                </p>
              </div>
              <button
                onClick={() => setShowMendForm(!showMendForm)}
                className="btn btn-secondary"
              >
                {showMendForm ? 'Cancel' : 'Mend Streak'}
              </button>
            </div>

            {showMendForm && (
              <form onSubmit={handleMendStreak} className="mt-4 pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select the missed date to mend:
                </label>
                <div className="flex gap-3">
                  <input
                    type="date"
                    required
                    className="input flex-1"
                    value={mendDate}
                    onChange={(e) => setMendDate(e.target.value)}
                    max={new Date(Date.now() - 86400000).toISOString().split('T')[0]}
                  />
                  <button type="submit" className="btn btn-primary">
                    Mend (50 pts)
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * You can only mend past dates where you didn't practice
                </p>
              </form>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Riyaaz Section */}
          <div>
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Riyaaz</h2>
                <button
                  onClick={() => setShowRiyaazForm(!showRiyaazForm)}
                  className="btn btn-primary"
                >
                  {showRiyaazForm ? 'Cancel' : 'Log Today'}
                </button>
              </div>

              {showRiyaazForm && (
                <form onSubmit={handleLogRiyaaz} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        required
                        className="input"
                        value={riyaazData.date}
                        onChange={(e) => setRiyaazData({ ...riyaazData, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        className="input"
                        value={riyaazData.durationMinutes}
                        onChange={(e) =>
                          setRiyaazData({ ...riyaazData, durationMinutes: parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Raga *
                      </label>
                      <input
                        type="text"
                        required
                        className="input"
                        value={riyaazData.raga}
                        onChange={(e) => setRiyaazData({ ...riyaazData, raga: e.target.value })}
                        placeholder="e.g., Yaman"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recording URL
                      </label>
                      <input
                        type="url"
                        className="input"
                        value={riyaazData.recordingUrl}
                        onChange={(e) =>
                          setRiyaazData({ ...riyaazData, recordingUrl: e.target.value })
                        }
                        placeholder="https://drive.google.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        className="input"
                        rows={3}
                        value={riyaazData.notes}
                        onChange={(e) => setRiyaazData({ ...riyaazData, notes: e.target.value })}
                        placeholder="Any observations or notes..."
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">
                      Log Riyaaz
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                <h3 className="font-semibold">Practice History</h3>
                {entries.length === 0 ? (
                  <p className="text-gray-600 text-sm">No entries yet. Log your first riyaaz!</p>
                ) : (
                  <div className="space-y-3">
                    {entries.map((entry) => (
                      <div key={entry.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{entry.raga}</p>
                            <p className="text-sm text-gray-600">
                              {entry.durationMinutes} minutes
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                        {entry.recordingUrl && (
                          <a
                            href={entry.recordingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:underline"
                          >
                            🎵 View Recording
                          </a>
                        )}
                        {entry.notes && (
                          <p className="text-sm text-gray-600 mt-2">{entry.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Homework Section */}
          <div>
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Homework Assignments</h2>
              {homeworks.length === 0 ? (
                <p className="text-gray-600">No homework assignments yet.</p>
              ) : (
                <div className="space-y-4">
                  {homeworks.map((hw) => {
                    const isSubmitted = hw.submissions.length > 0;
                    const submission = hw.submissions[0];
                    return (
                      <div key={hw.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold">{hw.title}</h3>
                        {hw.description && (
                          <p className="text-sm text-gray-600 mt-1">{hw.description}</p>
                        )}
                        {hw.dueDate && (
                          <p className="text-sm text-gray-500 mt-2">
                            Due: {new Date(hw.dueDate).toLocaleDateString()}
                          </p>
                        )}

                        {isSubmitted ? (
                          <div className="mt-4 bg-green-50 border border-green-200 rounded p-3">
                            <p className="text-sm font-medium text-green-700 mb-2">
                              ✓ Submitted
                            </p>
                            <a
                              href={submission.recordingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary-600 hover:underline"
                            >
                              View your submission
                            </a>
                            {submission.notes && (
                              <p className="text-sm text-gray-600 mt-2">{submission.notes}</p>
                            )}
                          </div>
                        ) : selectedHomework === hw.id ? (
                          <div className="mt-4 space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Recording URL *
                              </label>
                              <input
                                type="url"
                                required
                                className="input"
                                value={submissionData.recordingUrl}
                                onChange={(e) =>
                                  setSubmissionData({
                                    ...submissionData,
                                    recordingUrl: e.target.value,
                                  })
                                }
                                placeholder="https://..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes
                              </label>
                              <textarea
                                className="input"
                                rows={2}
                                value={submissionData.notes}
                                onChange={(e) =>
                                  setSubmissionData({ ...submissionData, notes: e.target.value })
                                }
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSubmitHomework(hw.id)}
                                className="btn btn-primary"
                              >
                                Submit
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedHomework(null);
                                  setSubmissionData({ recordingUrl: '', notes: '' });
                                }}
                                className="btn btn-secondary"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedHomework(hw.id)}
                            className="mt-4 btn btn-primary"
                          >
                            Submit Homework
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Class Notes Section */}
            <div className="card mt-8">
              <h2 className="text-2xl font-bold mb-6">📚 Class Notes</h2>
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
        </div>
      </div>
    </div>
  );
}

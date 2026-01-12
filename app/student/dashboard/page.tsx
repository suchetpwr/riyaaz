'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

interface Enrollment {
  id: string;
  classroom: {
    id: string;
    name: string;
    description: string | null;
  };
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [classroomStats, setClassroomStats] = useState<Record<string, any>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.role !== 'STUDENT') {
      router.push('/teacher/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'STUDENT') {
      fetchEnrollments();
    }
  }, [session]);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/classrooms/student');
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
        
        // Fetch stats for each classroom
        data.forEach(async (enrollment: Enrollment) => {
          const statsRes = await fetch(`/api/classrooms/${enrollment.classroom.id}/stats`);
          if (statsRes.ok) {
            const stats = await statsRes.json();
            setClassroomStats((prev) => ({ ...prev, [enrollment.classroom.id]: stats }));
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/classrooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode: joinCode.toUpperCase() }),
      });

      if (response.ok) {
        setJoinCode('');
        fetchEnrollments();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to join classroom');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  if (status === 'loading' || loading) {
    return <LoadingSpinner />;
  }

  if (!session || session.user.role !== 'STUDENT') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={session.user.name || 'Student'} userRole="STUDENT" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">My Classrooms</h2>

        {/* Join Classroom Form */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold mb-4">Join a Classroom</h3>
          <form onSubmit={handleJoinClassroom} className="flex gap-4">
            <input
              type="text"
              placeholder="Enter join code (e.g., RZ-3F8K)"
              className="input flex-1"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              required
            />
            <button type="submit" className="btn btn-primary">
              Join
            </button>
          </form>
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Enrolled Classrooms */}
        {enrollments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">You haven't joined any classrooms yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => {
              const stats = classroomStats[enrollment.classroom.id];
              return (
                <div key={enrollment.id} className="card hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {enrollment.classroom.name}
                  </h3>
                  {enrollment.classroom.description && (
                    <p className="text-gray-600 text-sm mb-4">
                      {enrollment.classroom.description}
                    </p>
                  )}
                  
                  {stats && (
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current Streak:</span>
                        <span className="font-bold text-green-600">
                          {stats.currentStreak > 0 ? `🔥 ${stats.currentStreak}` : '0'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Points:</span>
                        <span className="font-bold text-primary-600">{stats.totalPoints}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Last Practiced:</span>
                        <span className="text-sm">
                          {stats.lastPracticedDate
                            ? new Date(stats.lastPracticedDate).toLocaleDateString()
                            : 'Never'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <Link
                    href={`/student/classrooms/${enrollment.classroom.id}`}
                    className="btn btn-primary w-full text-center"
                  >
                    Open Classroom
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  joinCode: string;
  _count: {
    enrollments: number;
  };
}

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.role !== 'TEACHER') {
      router.push('/student/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'TEACHER') {
      fetchClassrooms();
    }
  }, [session]);

  const fetchClassrooms = async () => {
    try {
      const response = await fetch('/api/classrooms');
      if (response.ok) {
        const data = await response.json();
        setClassrooms(data);
      }
    } catch (err) {
      console.error('Failed to fetch classrooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/classrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newClassroom = await response.json();
        setClassrooms([newClassroom, ...classrooms]);
        setFormData({ name: '', description: '' });
        setShowCreateForm(false);
      } else {
        setError('Failed to create classroom');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  if (status === 'loading' || loading) {
    return <LoadingSpinner />;
  }

  if (!session || session.user.role !== 'TEACHER') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={session.user.name || 'Teacher'} userRole="TEACHER" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Classrooms</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn btn-primary"
          >
            {showCreateForm ? 'Cancel' : 'Create Classroom'}
          </button>
        </div>

        {showCreateForm && (
          <div className="card mb-8">
            <h3 className="text-xl font-semibold mb-4">Create New Classroom</h3>
            <form onSubmit={handleCreateClassroom} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Classroom Name *
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Hindustani Classical Vocal - Beginner"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="input"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description of the classroom"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Create
              </button>
            </form>
          </div>
        )}

        {classrooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No classrooms yet. Create your first classroom!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((classroom) => (
              <div key={classroom.id} className="card hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {classroom.name}
                </h3>
                {classroom.description && (
                  <p className="text-gray-600 text-sm mb-4">{classroom.description}</p>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">
                    {classroom._count.enrollments}{' '}
                    {classroom._count.enrollments === 1 ? 'student' : 'students'}
                  </div>
                  <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">
                    {classroom.joinCode}
                  </div>
                </div>
                <Link
                  href={`/teacher/classrooms/${classroom.id}`}
                  className="btn btn-primary w-full text-center"
                >
                  View Classroom
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

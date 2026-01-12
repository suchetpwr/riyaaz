'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  userName: string;
  userRole: 'TEACHER' | 'STUDENT';
}

export default function Navbar({ userName, userRole }: NavbarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-purple-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🎵 Riyaaz Classroom
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">
              👋 {userName}
            </span>
            <span className="badge badge-info">
              {userRole === 'TEACHER' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
            </span>
            <button
              onClick={handleSignOut}
              className="btn btn-secondary text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

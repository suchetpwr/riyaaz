import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'TEACHER' | 'STUDENT';
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: 'TEACHER' | 'STUDENT';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'TEACHER' | 'STUDENT';
  }
}

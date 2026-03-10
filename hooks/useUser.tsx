import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Id } from '../convex/_generated/dataModel';

export type UserRole = 'student' | 'librarian';

interface User {
  _id: Id<"users">;
  name: string;
  email: string;
  role: UserRole;
  student_id?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('student');

  const userName = user ? user.name : (role === 'student' ? 'Student' : 'Librarian');

  return (
    <UserContext.Provider value={{ user, setUser, role, setRole, userName }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

import React, { createContext, useState, useContext, ReactNode } from 'react';

export type UserRole = 'Student' | 'Librarian';

interface UserContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>('Student');
  const userName = role === 'Student' ? 'Derill Student' : 'Admin Librarian';

  return (
    <UserContext.Provider value={{ role, setRole, userName }}>
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

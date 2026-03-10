import React from 'react';
import { useUser } from '../../hooks/useUser';
import { AdminProfile } from '../../components/admin/AdminProfile';
import { StudentProfile } from '../../components/student/StudentProfile';

export default function ProfileRouter() {
  const { role } = useUser();
  return role === 'librarian' ? <AdminProfile /> : <StudentProfile />;
}

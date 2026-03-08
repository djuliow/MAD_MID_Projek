import React from 'react';
import { useUser } from '../../hooks/useUser';
import { AdminDashboard } from '../../components/admin/AdminDashboard';
import { StudentHome } from '../../components/student/StudentHome';

export default function HomeRouter() {
  const { role } = useUser();
  return role === 'Librarian' ? <AdminDashboard /> : <StudentHome />;
}

import React from 'react';
import { useUser } from '../../hooks/useUser';
import { AdminBookManagement } from '../../components/admin/AdminBookManagement';
import { StudentSearch } from '../../components/student/StudentSearch';

export default function SearchRouter() {
  const { role } = useUser();
  return role === 'Librarian' ? <AdminBookManagement /> : <StudentSearch />;
}

import React from 'react';
import { useUser } from '../../hooks/useUser';
import { AdminBorrowManagement } from '../../components/admin/AdminBorrowManagement';
import { StudentBorrowed } from '../../components/student/StudentBorrowed';

export default function BorrowRouter() {
  const { role } = useUser();
  return role === 'Librarian' ? <AdminBorrowManagement /> : <StudentBorrowed />;
}

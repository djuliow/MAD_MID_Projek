// File ini berfungsi sebagai perute (router) untuk tab peminjaman.
// Mengalihkan tampilan antara AdminBorrowManagement (untuk pustakawan) 
// dan StudentBorrowed (untuk mahasiswa) berdasarkan peran pengguna yang login.

import React from 'react';
import { useUser } from '../../hooks/useUser';
import { AdminBorrowManagement } from '../../components/admin/AdminBorrowManagement';
import { StudentBorrowed } from '../../components/student/StudentBorrowed';

export default function BorrowRouter() {
  const { role } = useUser();
  // Merender komponen yang sesuai berdasarkan peran (role) pengguna
  return role === 'librarian' ? <AdminBorrowManagement /> : <StudentBorrowed />;
}

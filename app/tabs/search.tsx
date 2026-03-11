// File ini berfungsi sebagai perute (router) untuk fitur pencarian buku dan aset.
// Menampilkan AdminBookManagement untuk pengelolaan inventaris buku oleh admin 
// atau StudentSearch untuk fitur pencarian buku oleh mahasiswa.

import React from 'react';
import { useUser } from '../../hooks/useUser';
import { AdminBookManagement } from '../../components/admin/AdminBookManagement';
import { StudentSearch } from '../../components/student/StudentSearch';

export default function SearchRouter() {
  const { role } = useUser();
  // Menampilkan manajemen buku untuk admin atau fitur cari untuk mahasiswa
  return role === 'librarian' ? <AdminBookManagement /> : <StudentSearch />;
}

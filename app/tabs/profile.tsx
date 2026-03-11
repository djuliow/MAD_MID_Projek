// File ini berfungsi sebagai perute (router) untuk halaman profil.
// Menampilkan AdminProfile untuk pengguna dengan peran pustakawan 
// atau StudentProfile untuk pengguna dengan peran mahasiswa.

import React from 'react';
import { useUser } from '../../hooks/useUser';
import { AdminProfile } from '../../components/admin/AdminProfile';
import { StudentProfile } from '../../components/student/StudentProfile';

export default function ProfileRouter() {
  const { role } = useUser();
  // Memilih komponen profil berdasarkan peran pengguna
  return role === 'librarian' ? <AdminProfile /> : <StudentProfile />;
}

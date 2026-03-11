// File ini berfungsi sebagai perute (router) untuk halaman utama (Home).
// Mengalihkan tampilan antara AdminDashboard (untuk pustakawan) 
// dan StudentHome (untuk mahasiswa) berdasarkan peran pengguna.

import React from 'react';
import { useUser } from '../../hooks/useUser';
import { AdminDashboard } from '../../components/admin/AdminDashboard';
import { StudentHome } from '../../components/student/StudentHome';

export default function HomeRouter() {
  const { role } = useUser();
  // Merender Dashboard jika admin, atau Beranda Siswa jika mahasiswa
  return role === 'librarian' ? <AdminDashboard /> : <StudentHome />;
}

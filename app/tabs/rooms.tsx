// File ini berfungsi sebagai perute (router) untuk fitur pemesanan ruangan.
// Mengalihkan ke AdminRoomManagement untuk pengelolaan oleh admin 
// atau StudentRoomBooking untuk fitur pemesanan oleh mahasiswa.

import React from 'react';
import { useUser } from '../../hooks/useUser';
import { AdminRoomManagement } from '../../components/admin/AdminRoomManagement';
import { StudentRoomBooking } from '../../components/student/StudentRoomBooking';

export default function RoomRouter() {
  const { role } = useUser();
  // Mengarahkan ke manajemen ruangan atau pemesanan ruangan berdasarkan peran
  return role === 'librarian' ? <AdminRoomManagement /> : <StudentRoomBooking />;
}

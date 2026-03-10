import React from 'react';
import { useUser } from '../../hooks/useUser';
import { AdminRoomManagement } from '../../components/admin/AdminRoomManagement';
import { StudentRoomBooking } from '../../components/student/StudentRoomBooking';

export default function RoomRouter() {
  const { role } = useUser();
  return role === 'librarian' ? <AdminRoomManagement /> : <StudentRoomBooking />;
}

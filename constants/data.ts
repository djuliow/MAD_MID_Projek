export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  status: 'Available' | 'Borrowed';
  category: string;
  year: string;
  shelf: string;
  description: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  facilities: string[];
  status: 'Available' | 'Booked';
}

export const BOOKS: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    cover: 'https://m.media-amazon.com/images/I/81QuEGw8VPL._AC_UF1000,1000_QL80_.jpg',
    status: 'Available',
    category: 'Classic Literature',
    year: '1925',
    shelf: 'A-12',
    description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    cover: 'https://m.media-amazon.com/images/I/81gepf1eMqL._AC_UF1000,1000_QL80_.jpg',
    status: 'Borrowed',
    category: 'Fiction',
    year: '1960',
    shelf: 'B-05',
    description: 'The story of Atticus Finch, a lawyer in the Depression-era South, and his children, Scout and Jem.',
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    cover: 'https://m.media-amazon.com/images/I/71k05AAnZDL._AC_UF1000,1000_QL80_.jpg',
    status: 'Available',
    category: 'Dystopian',
    year: '1949',
    shelf: 'C-22',
    description: 'A novel about a dystopian future under a totalitarian regime.',
  },
  {
    id: '4',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    cover: 'https://m.media-amazon.com/images/I/81OthjkJBuL._AC_UF1000,1000_QL80_.jpg',
    status: 'Available',
    category: 'Fiction',
    year: '1951',
    shelf: 'D-08',
    description: 'The story of Holden Caulfield, a teenage boy who is struggling to find his place in the world.',
  },
  {
    id: '5',
    title: 'Brave New World',
    author: 'Aldous Huxley',
    cover: 'https://m.media-amazon.com/images/I/91D4Y939AFL._AC_UF1000,1000_QL80_.jpg',
    status: 'Available',
    category: 'Dystopian',
    year: '1932',
    shelf: 'C-23',
    description: 'A novel about a future society where people are genetically engineered and kept happy with drugs.',
  },
];

export const ROOMS: Room[] = [
  {
    id: 'r1',
    name: 'Study Room A',
    capacity: 4,
    facilities: ['Whiteboard', 'Power Outlets', 'AC'],
    status: 'Available',
  },
  {
    id: 'r2',
    name: 'Conference Room B',
    capacity: 10,
    facilities: ['Projector', 'Large Table', 'AC', 'Coffee Machine'],
    status: 'Available',
  },
  {
    id: 'r3',
    name: 'Quiet Pod 1',
    capacity: 1,
    facilities: ['Single Desk', 'Power Outlet', 'Silent Fan'],
    status: 'Booked',
  },
];

export interface Activity {
  id: string;
  studentName: string;
  action: 'Borrowed' | 'Returned';
  bookTitle: string;
  time: string;
}

export interface Reservation {
  id: string;
  roomName: string;
  studentName: string;
  date: string;
  timeSlot: string;
  status: 'Pending' | 'Approved' | 'Cancelled';
}

export const ACTIVITIES: Activity[] = [
  { id: 'a1', studentName: 'Alice Smith', action: 'Borrowed', bookTitle: 'The Great Gatsby', time: '10 mins ago' },
  { id: 'a2', studentName: 'Bob Johnson', action: 'Returned', bookTitle: '1984', time: '30 mins ago' },
  { id: 'a3', studentName: 'Charlie Brown', action: 'Borrowed', bookTitle: 'To Kill a Mockingbird', time: '1 hour ago' },
];

export const RESERVATIONS: Reservation[] = [
  { id: 'res1', roomName: 'Study Room A', studentName: 'David Lee', date: '2026-03-09', timeSlot: '10:00 - 12:00', status: 'Pending' },
  { id: 'res2', roomName: 'Conference Room B', studentName: 'Emma Wilson', date: '2026-03-09', timeSlot: '14:00 - 16:00', status: 'Approved' },
];

export const BORROWED_BOOKS = [
  {
    ...BOOKS[1],
    borrowDate: '2026-03-01',
    dueDate: '2026-03-15',
    status: 'Borrowed',
  },
  {
    id: 'b2',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    cover: 'https://m.media-amazon.com/images/I/712c9k6D+YL._AC_UF1000,1000_QL80_.jpg',
    borrowDate: '2026-02-20',
    dueDate: '2026-03-09',
    status: 'Borrowed',
    category: 'Fantasy',
    year: '1937',
    shelf: 'F-01',
    description: 'A fantasy novel about the adventures of a hobbit named Bilbo Baggins.',
  }
];

export const ADMIN_STATS = {
  totalBooks: 1250,
  borrowedBooks: 450,
  availableBooks: 800,
  activeReservations: 12,
};

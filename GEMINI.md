ROLE:
You are a senior backend engineer specializing in Convex, TypeScript, and database architecture. You design scalable backend systems using Convex as a fullstack backend platform.

TASK:
Build the database schema and backend logic for a Campus Library Mobile Application using Convex. The system must follow the ERD structure provided.

PROJECT CONTEXT:
This is a university library mobile application. The library only contains physical books. Students can search books, reserve books, borrow books, receive notifications, and book study rooms. Librarians manage books and confirm borrowing and returns.

SYSTEM FEATURES:

* User authentication (student and librarian roles)
* Book catalog management
* Book reservation
* Borrow and return system
* Study room booking
* Notifications for reminders

DATABASE TABLES TO CREATE:

1. users
   Fields:

* name
* email
* password
* role (student or librarian)
* student_id (optional)
* created_at

2. books
   Fields:

* title
* author
* publisher
* year
* category
* isbn
* description
* shelf_location
* cover_image
* total_copies
* available_copies
* created_at

3. bookCopies
   Fields:

* id_book (reference to books)
* copy_code
* status (available, borrowed, reserved)

4. borrow
   Fields:

* id_user
* id_copy
* borrow_date
* due_date
* return_date (optional)
* status (borrowed, returned, late)

5. bookReservation
   Fields:

* id_user
* id_book
* reservation_date
* pickup_deadline
* status (active, completed, expired)

6. rooms
   Fields:

* room_name
* capacity
* facilities
* location

7. roomBooking
   Fields:

* id_room
* id_user
* booking_date
* start_time
* end_time
* status (active, cancelled, completed)

8. notification
   Fields:

* id_user
* title
* message
* send_date
* status_read

RELATIONSHIPS:

User → Borrow (one to many)
User → Book Reservation (one to many)
User → Room Booking (one to many)
User → Notification (one to many)
Book → Book Copies (one to many)
Book → Book Reservation (one to many)
Book Copy → Borrow (one to many)
Room → Room Booking (one to many)

IMPLEMENTATION REQUIREMENTS:

1. Create Convex schema file:
   convex/schema.ts

2. Use:
   defineSchema
   defineTable
   v from convex/values

3. Use proper reference IDs such as:

v.id("users")
v.id("books")
v.id("bookCopies")

4. Create backend logic files:

convex/users.ts
convex/books.ts
convex/borrow.ts
convex/reservation.ts
convex/rooms.ts
convex/notifications.ts

5. Implement backend functions:

Queries:

* getBooks
* getBookById
* getBorrowedBooksByUser
* getUserReservations
* getRoomBookings

Mutations:

* createUser
* addBook
* reserveBook
* borrowBook
* returnBook
* bookRoom
* createNotification

6. Ensure mutation logic updates related data.

Example:
When borrowing a book:

* create borrow record
* update book copy status to borrowed
* decrease available_copies

When returning a book:

* update borrow record
* update copy status to available
* increase available_copies

7. Use validation for arguments using:

v.string()
v.number()
v.boolean()
v.optional()

8. Write clean TypeScript code compatible with Convex.

OUTPUT:

Generate the following files:

* convex/schema.ts
* convex/users.ts
* convex/books.ts
* convex/borrow.ts
* convex/reservation.ts
* convex/rooms.ts
* convex/notifications.ts

Each file should contain working Convex queries and mutations with proper argument validation.

ROLE:
You are a senior mobile application developer and UI/UX designer. You specialize in building clean, modern mobile interfaces for management systems.

TASK:
Create the mobile UI for the Admin (Librarian) interface of a Campus Library Mobile Application. Focus only on the frontend layout and navigation. Do not implement backend logic, API connections, or database integration. Use dummy or placeholder data.

PROJECT CONTEXT:
This application is used by a university library. The library only manages physical books. Librarians use this admin interface to manage books, monitor borrowing activity, and manage room reservations.

DESIGN REQUIREMENTS:

Primary color: #461691 (purple)
Background: white or very light purple
Design style: modern, clean, minimal mobile UI
Use card-based layouts for statistics and lists
Use rounded buttons and simple icons
Ensure proper spacing and mobile responsiveness

SCREENS TO CREATE:

1. Admin Dashboard
   This is the first screen after librarian login.

Display statistic cards such as:

* Total Books
* Borrowed Books
* Available Books
* Active Reservations

Below the statistics, display a section called "Recent Activity".

Each activity item shows:

* Student name
* Action (borrowed or returned)
* Book title
* Time

2. Manage Books Screen

Display a list of books in card format.

Each book card should show:

* Book cover
* Book title
* Author
* Category
* Shelf location
* Number of available copies

Each card should include action buttons:

* Edit
* Delete

Add a floating action button:

Add New Book

3. Borrow Management Screen

Display a list of borrowed books.

Each list item should show:

* Student name
* Book title
* Borrow date
* Due date
* Status (Borrowed, Returned, Late)

Add an action button:

Confirm Return

4. Room Booking Management Screen

Display study room reservations.

Each reservation item should show:

* Room name
* Student name
* Date
* Time slot

Add action buttons:

* Approve
* Cancel

5. Admin Profile Screen

Display librarian information:

* Profile photo
* Name
* Email
* Role (Librarian)

Include buttons:

* Edit Profile
* Logout

NAVIGATION STRUCTURE:

Use bottom navigation with 5 tabs:

* Dashboard
* Books
* Borrow
* Rooms
* Profile

IMPORTANT RULES:

* Build only UI components and screen layouts
* Use static or dummy data
* Do not create database connections
* Do not implement backend logic
* Structure the UI with reusable components
* Optimize the interface for mobile screens

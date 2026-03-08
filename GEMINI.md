ROLE:
You are a senior mobile application developer and UI designer with strong experience in building clean and modern mobile interfaces.

TASK:
Create a mobile application UI prototype for a Library Management App. Focus only on the frontend interface and navigation. Do NOT implement database, backend logic, API calls, or authentication systems. Use static or dummy data only.

PROJECT CONTEXT:
This application is designed for a physical library. The library only has physical books, not digital books. The application helps students find books, reserve books, check borrowed books, and book study rooms.

DESIGN REQUIREMENTS:

Primary color: #461691 (purple)
Secondary color: white or light purple
Design style: clean, modern, minimal mobile interface
Use card-based layouts for displaying books
Use rounded buttons and simple icons
Design should be optimized for mobile screens

SCREENS TO CREATE:

1. Splash Screen
   Display the library logo and app name.
   Use a purple background (#461691).

2. Login Screen
   Include:

* Email input field
* Password input field
* Login button
* Text link for Register

3. Home Screen
   Top section:

* Search bar

Sections on the home page:

* Recommended Books
* New Books

Each book card should show:

* Book cover
* Book title
* Author
* Availability status

4. Search Screen
   Components:

* Search bar at the top
* Optional filter button
* List of books

Each search result card shows:

* Book cover
* Title
* Author
* Status (Available or Borrowed)

5. Book Detail Screen
   Display:

* Book cover
* Title
* Author
* Category
* Year
* Shelf location in the library

Buttons:

* Reserve Book
* Add to Favorite

6. My Borrowed Books Screen
   Display list of books currently borrowed.

Each item should show:

* Book cover
* Title
* Borrow date
* Due date
* Status

If the due date is near, show a warning message.

7. Room Booking Screen
   Display available study rooms.

Each room card should show:

* Room name
* Capacity
* Facilities

Button:

* Book Room

8. Profile Screen
   Display:

* User photo
* Name
* Email
* Borrow history button
* Logout button

NAVIGATION:

Use bottom navigation with 5 tabs:

* Home
* Search
* Borrowed
* Rooms
* Profile

IMPORTANT RULES:

* Use dummy data for books and rooms
* Do not create database or backend
* Focus only on UI components and navigation structure
* Code should be clean and organized
* Make the UI responsive for mobile devices

# Folio — Library Management System

A full-stack Library Management System built with **Java Spring Boot**, **Object-Oriented Programming (OOP)**, **Embedded H2 SQL Database ("limited use of SQL")**, and a **Vanilla HTML/CSS/JavaScript** frontend with a custom Dark Forest design system.

> [!NOTE]
> All data lives on the server in the H2 database — nothing is stored in the browser.

---

## 📌 Core Architecture & Concept Guardrails

> [!IMPORTANT]
> **DEVELOPER / AGENT GUARDRAIL**:
> When modifying or optimizing this repository, **DO NOT CHANGE** the fundamental architecture:
> 1. **Backend**: Java Spring Boot (`com.library`) with RESTful API endpoints.
> 2. **OOP Principles**: Models must strictly maintain OOP design (`Librarian extends User`, `Book` encapsulates state, `Library` orchestrates business logic).
> 3. **Database**: Embedded H2 SQL Database via Spring `JdbcTemplate` fulfilling the academic requirement of **"limited use of SQL"**. Do **not** replace this with in-memory-only lists or external enterprise DBMS like Oracle or heavy ORMs unless explicitly requested.
> 4. **Frontend**: Standalone, framework-free Vanilla HTML5, CSS3, and JavaScript interacting via asynchronous `fetch()` calls against `/api/*`.

```text
JavaProject/
├── pom.xml                                   # Spring Boot 3.5.x, Java 21 bytecode, H2, Spring JDBC
├── mvnw / mvnw.cmd                           # Maven Wrapper (zero-install build tool)
├── src/main/
│   ├── java/com/library/
│   │   ├── LibraryApplication.java           # Spring Boot application entry point (@SpringBootApplication)
│   │   ├── model/
│   │   │   ├── Book.java                     # Book entity (encapsulated loan states & checkout logic)
│   │   │   ├── User.java                     # Base user entity (id, name, contact)
│   │   │   └── Librarian.java                # Extends User (demonstrates Inheritance & admin operations)
│   │   ├── service/
│   │   │   └── Library.java                  # Central service with JdbcTemplate & business rule enforcement
│   │   ├── utility/
│   │   │   └── FineCalculator.java           # Static utility class for overdue fine calculations
│   │   └── controller/
│   │       └── LibraryController.java        # REST Controller exposing 13 JSON API endpoints
│   └── resources/
│       ├── application.properties            # H2 in-memory DB configuration and web console settings
│       ├── schema.sql                        # DDL table creation (users, books, foreign keys)
│       ├── data.sql                          # DML seed data (initial catalogue, users, active/overdue loans)
│       └── static/                           # Client-side web assets served at http://localhost:8080/
│           ├── index.html                    # Application layout and responsive modal containers
│           ├── styles.css                    # Dark Forest CSS design tokens, tables, forms, toasts
│           └── app.js                        # Frontend controller & async fetch() API client
└── src/test/java/com/library/
    └── LibraryIntegrationTest.java           # Circulation workflow tests over real HTTP against H2
```

---

## 🏛️ Object-Oriented Programming (OOP) Implementation

This project was specifically designed to demonstrate core OOP principles:

### 1. Encapsulation
- All fields in [`Book.java`](file:///c:/Users/abhin/OneDrive/Desktop/Projects2026/JavaProject/src/main/java/com/library/model/Book.java) and [`User.java`](file:///c:/Users/abhin/OneDrive/Desktop/Projects2026/JavaProject/src/main/java/com/library/model/User.java) are marked `private`.
- State transitions (`checkout()`, `returnBook()`, `renew()`, `placeHold()`) are internal methods within the `Book` class rather than external manual mutations, preventing illegal states (e.g., setting borrower without setting due date).

### 2. Inheritance
- [`Librarian.java`](file:///c:/Users/abhin/OneDrive/Desktop/Projects2026/JavaProject/src/main/java/com/library/model/Librarian.java) inherits from [`User.java`](file:///c:/Users/abhin/OneDrive/Desktop/Projects2026/JavaProject/src/main/java/com/library/model/User.java) (`public class Librarian extends User`).
- Extends the reader identity with administrative permissions (adding books, removing unborrowed books, registering members).

### 3. Polymorphism
- `toString()` is overridden across `Book`, `User`, and `Librarian` for polymorphic string representation.
- Role-based specialization through subclassing.

### 4. Composition & Abstraction
- [`Library.java`](file:///c:/Users/abhin/OneDrive/Desktop/Projects2026/JavaProject/src/main/java/com/library/service/Library.java) uses **Composition** by maintaining dependencies on Spring's `JdbcTemplate` and mapping database records into OOP domain models via `RowMapper<Book>` and `RowMapper<User>`.
- The presentation layer (`LibraryController`) and frontend are completely decoupled from database internals through service abstraction.

### 5. Utility Separation
- [`FineCalculator.java`](file:///c:/Users/abhin/OneDrive/Desktop/Projects2026/JavaProject/src/main/java/com/library/utility/FineCalculator.java) extracts the fine assessment policy (`₹10` per day overdue) into a clean, reusable static utility.

---

## 💾 Database Architecture ("Limited Use of SQL")

To satisfy the academic specification (*"using Object-Oriented Programming principles in Java, with limited use of SQL"*), the system uses an embedded **H2 Database** configured with clean, explicit SQL commands via Spring's `JdbcTemplate`.

### Schema Definition (`schema.sql`)

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'READER'
);

CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(50) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'available',
    borrower_id INT DEFAULT NULL,
    due_date DATE DEFAULT NULL,
    renewed BOOLEAN DEFAULT FALSE,
    on_hold BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (borrower_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### SQL Usage in Service Layer
Direct SQL queries are restricted to essential persistence operations:
- **Retrieval**: `SELECT * FROM books WHERE id = ?`, `SELECT * FROM books WHERE LOWER(title) LIKE ? ...`
- **Insertion**: `INSERT INTO books (...) VALUES (...)`, `INSERT INTO users (...) VALUES (...)`
- **Update**: `UPDATE books SET status = ?, borrower_id = ?, due_date = ?, renewed = ?, on_hold = ? WHERE id = ?`
- **Deletion**: `DELETE FROM books WHERE id = ?`

### Built-in H2 Web Console
- **URL**: `http://localhost:8080/h2-console`
- **JDBC URL**: `jdbc:h2:mem:librarydb`
- **User Name**: `sa`
- **Password**: *(blank)*

---

## 📋 Circulation Business Rules

All circulation logic is strictly enforced in `Library.java`:
1. **Borrowing Limit**: A user can borrow a maximum of **3 books** concurrently (`MAX_LOANS = 3`).
2. **Availability Check**: Only books with status `available` can be checked out.
3. **Lending Period**: Standard loan duration is **14 days** from the checkout date.
4. **Renewal Policy**:
   - A loan can be renewed only **once** (`renewed = true`).
   - Renewal adds **7 days** to the current due date.
   - If a book is placed **on hold**, renewal is blocked.
5. **Hold System**: Readers can place a hold on any borrowed book to prevent further renewals.
6. **Overdue Fines**: Calculated at **₹10 per day** past the `due_date`. Upon return, overdue fines are reported to the user.
7. **Deletion Safety**: A book cannot be deleted while its status is `borrowed`.

---

## 🌐 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stats` | Returns total books, available, on loan, overdue counts, and fine totals |
| `GET` | `/api/books` | Returns all books (supports optional `?q=` search query) |
| `GET` | `/api/books/available` | Returns only books currently available for checkout |
| `GET` | `/api/loans` | Returns active loans with joined borrower names and live overdue fines |
| `GET` | `/api/users` | Returns all registered readers with active loan counts (supports `?q=`) |
| `POST`| `/api/books` | Adds a new book `{title, author, isbn, genre}` |
| `PUT` | `/api/books/{id}` | Updates existing book details |
| `DELETE`| `/api/books/{id}` | Deletes a book (returns error if currently borrowed) |
| `POST`| `/api/users` | Registers a new reader `{name, contact}` |
| `POST`| `/api/borrow` | Checks out a book `{bookId, userId}` |
| `POST`| `/api/return/{id}` | Returns a book and computes any late fines |
| `POST`| `/api/renew/{id}` | Extends loan by 7 days (blocked if renewed or on hold) |
| `POST`| `/api/hold/{id}` | Marks a borrowed book on hold to prevent renewal |

---

## 🎨 Frontend Architecture

The user interface is crafted using pure HTML5, vanilla CSS, and JavaScript:
- **Design System**: Dark Forest palette (deep pine greens, warm parchment cream typography, terracotta accent buttons).
- **Asynchronous Data**: All operations call `/api/*` endpoints asynchronously using native `fetch()`.
- **Dynamic Filtering**: The search bar triggers non-destructive DOM updates (`filterBooks()`, `filterReaders()`), providing instant filtering without losing input focus or cursor location.
- **Micro-interactions**: Subtle hover elevation, pill status indicators (`Available`, `Borrowed`, `Overdue`), toast notifications, and modal forms.

---

## 🚀 How to Run Locally

### Prerequisites
- Java JDK 21 or higher installed.

### 1. Start the Server
Run the Maven wrapper from the project root:
```powershell
.\mvnw.cmd spring-boot:run
```
*(On Linux/macOS: `./mvnw spring-boot:run`)*

> If you see `JAVA_HOME is set to an invalid directory`, point it at your JDK install for the session:
> ```powershell
> $env:JAVA_HOME = "C:\Program Files\Java\jdk-26.0.2"   # adjust to your version
> ```

### 2. Access the Application
- **Main Web Application**: [http://localhost:8080](http://localhost:8080)
- **H2 Database Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)

### 3. Run the Tests
The test suite covers the seeded catalogue, every circulation rule, and the fine calculation over real HTTP:
```powershell
.\mvnw.cmd test
```

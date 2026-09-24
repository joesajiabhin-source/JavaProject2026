package com.library.service;

import com.library.model.Book;
import com.library.model.LoanRecord;
import com.library.model.User;
import com.library.utility.FineCalculator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Core library service — manages books, users, and borrowing history
 * backed by an embedded H2 SQL database.
 * Demonstrates:
 *  - Limited use of SQL (SELECT, INSERT, UPDATE, DELETE with JdbcTemplate)
 *  - Object-Oriented Programming (domain models Book, User, LoanRecord, FineCalculator)
 *  - Encapsulation & Abstraction (business rules hidden inside service and models)
 */
@Service
public class Library {
    private static final int MAX_LOANS  = 3;
    private static final int LOAN_DAYS  = 14;
    private static final int RENEW_DAYS = 7;

    private final JdbcTemplate jdbcTemplate;

    // RowMapper to map SQL result set rows to OOP Book domain objects
    private final RowMapper<Book> bookRowMapper = (rs, rowNum) -> {
        Book b = new Book();
        b.setId(rs.getInt("id"));
        b.setTitle(rs.getString("title"));
        b.setAuthor(rs.getString("author"));
        b.setIsbn(rs.getString("isbn"));
        b.setGenre(rs.getString("genre"));
        b.setStatus(rs.getString("status"));
        b.setBorrowerId(rs.getInt("borrower_id"));
        Date bd = rs.getDate("borrow_date");
        b.setBorrowDate(bd != null ? bd.toLocalDate() : null);
        Date d = rs.getDate("due_date");
        b.setDueDate(d != null ? d.toLocalDate() : null);
        b.setRenewed(rs.getBoolean("renewed"));
        b.setHold(rs.getBoolean("on_hold"));
        return b;
    };

    // RowMapper to map SQL result set rows to OOP User domain objects
    private final RowMapper<User> userRowMapper = (rs, rowNum) -> {
        User u = new User();
        u.setId(rs.getInt("id"));
        u.setName(rs.getString("name"));
        u.setContact(rs.getString("contact"));
        return u;
    };

    // RowMapper to map SQL result set rows to OOP LoanRecord domain objects
    private final RowMapper<LoanRecord> loanRecordRowMapper = (rs, rowNum) -> {
        LoanRecord r = new LoanRecord();
        r.setId(rs.getInt("id"));
        r.setBookId(rs.getInt("book_id"));
        r.setBookTitle(rs.getString("book_title"));
        r.setUserId(rs.getInt("user_id"));
        r.setUserName(rs.getString("user_name"));
        Date bd = rs.getDate("borrow_date");
        r.setBorrowDate(bd != null ? bd.toLocalDate() : null);
        Date dd = rs.getDate("due_date");
        r.setDueDate(dd != null ? dd.toLocalDate() : null);
        Date rd = rs.getDate("return_date");
        r.setReturnDate(rd != null ? rd.toLocalDate() : null);
        r.setFineAmount(rs.getInt("fine_amount"));
        r.setFinePaid(rs.getBoolean("fine_paid"));
        return r;
    };

    public Library(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // ─── Book Management (SQL INSERT, UPDATE, DELETE) ───

    public void addBook(String title, String author, String isbn, String genre) {
        if (title == null || title.isBlank() || author == null || author.isBlank() ||
            isbn == null || isbn.isBlank() || genre == null || genre.isBlank()) {
            throw new IllegalArgumentException("All book fields (title, author, ISBN, genre) are required");
        }
        String sql = "INSERT INTO books (title, author, isbn, genre, status, borrower_id, borrow_date, due_date, renewed, on_hold) " +
                     "VALUES (?, ?, ?, ?, 'available', NULL, NULL, NULL, false, false)";
        jdbcTemplate.update(sql, title.trim(), author.trim(), isbn.trim(), genre.trim());
    }

    public String removeBook(int id) {
        Book b = findBook(id);
        if (b == null) return "Book not found";
        if (b.isBorrowed()) return "Return the book first";
        jdbcTemplate.update("DELETE FROM books WHERE id = ?", id);
        return null;
    }

    public String updateBook(int id, String title, String author, String isbn, String genre) {
        if (title == null || title.isBlank() || author == null || author.isBlank() ||
            isbn == null || isbn.isBlank() || genre == null || genre.isBlank()) {
            return "All book fields (title, author, ISBN, genre) are required";
        }
        Book b = findBook(id);
        if (b == null) return "Book not found";
        String sql = "UPDATE books SET title = ?, author = ?, isbn = ?, genre = ? WHERE id = ?";
        jdbcTemplate.update(sql, title.trim(), author.trim(), isbn.trim(), genre.trim(), id);
        return null;
    }

    // ─── User Management (SQL INSERT, UPDATE, DELETE) ───

    public void addUser(String name, String contact) {
        if (name == null || name.isBlank() || contact == null || contact.isBlank()) {
            throw new IllegalArgumentException("Reader name and contact are required");
        }
        String sql = "INSERT INTO users (name, contact, role) VALUES (?, ?, 'READER')";
        jdbcTemplate.update(sql, name.trim(), contact.trim());
    }

    public String updateUser(int id, String name, String contact) {
        if (name == null || name.isBlank() || contact == null || contact.isBlank()) {
            return "Reader name and contact are required";
        }
        User u = findUser(id);
        if (u == null) return "User not found";
        jdbcTemplate.update("UPDATE users SET name = ?, contact = ? WHERE id = ?", name.trim(), contact.trim(), id);
        return null;
    }

    public String removeUser(int id) {
        User u = findUser(id);
        if (u == null) return "User not found";
        if (loansForUser(id) > 0) return "Return all borrowed books first";
        jdbcTemplate.update("DELETE FROM users WHERE id = ?", id);
        return null;
    }

    // ─── Circulation (OOP Business Rules + SQL UPDATE) ──

    public String borrowBook(int bookId, int userId) {
        Book b = findBook(bookId);
        if (b == null || !b.isAvailable()) return "Book is not available";
        if (findUser(userId) == null) return "User not found";
        if (loansForUser(userId) >= MAX_LOANS) return "Reader has reached the " + MAX_LOANS + "-book limit";

        // OOP encapsulation: Book updates its internal checkout state
        b.checkout(userId, LOAN_DAYS);

        // SQL persistence
        String sql = "UPDATE books SET status = ?, borrower_id = ?, borrow_date = ?, due_date = ?, renewed = ?, on_hold = ? WHERE id = ?";
        jdbcTemplate.update(sql, b.getStatus(), b.getBorrowerId(), Date.valueOf(b.getBorrowDate()), Date.valueOf(b.getDueDate()), b.isRenewed(), b.isOnHold(), b.getId());
        return null;
    }

    /** Returns the fine amount, records loan history, or -1 on error. */
    public long returnBook(int bookId) {
        Book b = findBook(bookId);
        if (b == null || !b.isBorrowed()) return -1;

        User u = findUser(b.getBorrowerId());

        // OOP utility: calculate fine based on domain object
        long fine = FineCalculator.calcFine(b);

        // Determine loan dates
        LocalDate borrowDate = b.getBorrowDate() != null ? b.getBorrowDate() :
                (b.getDueDate() != null ? b.getDueDate().minusDays(LOAN_DAYS) : LocalDate.now().minusDays(LOAN_DAYS));
        LocalDate dueDate = b.getDueDate() != null ? b.getDueDate() : LocalDate.now();
        LocalDate returnDate = LocalDate.now();

        // Persistent loan history audit record
        String historySql = "INSERT INTO loan_history (book_id, book_title, user_id, user_name, borrow_date, due_date, return_date, fine_amount, fine_paid) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(historySql,
                b.getId(),
                b.getTitle(),
                u != null ? u.getId() : b.getBorrowerId(),
                u != null ? u.getName() : "Unknown Reader",
                Date.valueOf(borrowDate),
                Date.valueOf(dueDate),
                Date.valueOf(returnDate),
                fine,
                fine == 0 // unpaid if fine > 0, paid/no-fine if 0
        );

        // OOP model method: reset book
        b.returnBook();

        // SQL persistence
        String sql = "UPDATE books SET status = 'available', borrower_id = NULL, borrow_date = NULL, due_date = NULL, renewed = false, on_hold = false WHERE id = ?";
        jdbcTemplate.update(sql, b.getId());
        return fine;
    }

    public String renewBook(int bookId) {
        Book b = findBook(bookId);
        if (b == null || !b.isBorrowed()) return "Book is not on loan";
        if (b.isRenewed()) return "Already renewed once";
        if (b.isOnHold()) return "On hold — cannot renew";

        // OOP model method
        b.renew(RENEW_DAYS);

        // SQL persistence
        String sql = "UPDATE books SET due_date = ?, renewed = true WHERE id = ?";
        jdbcTemplate.update(sql, Date.valueOf(b.getDueDate()), b.getId());
        return null;
    }

    public String placeHold(int bookId) {
        Book b = findBook(bookId);
        if (b == null || !b.isBorrowed()) return "Book is not on loan";
        if (b.isOnHold()) return "Already on hold";

        // OOP model method
        b.placeHold();

        // SQL persistence
        jdbcTemplate.update("UPDATE books SET on_hold = true WHERE id = ?", b.getId());
        return null;
    }

    // ─── Loan History & Fine Payment ─────────────────────

    public List<LoanRecord> getAllLoanHistory() {
        return jdbcTemplate.query("SELECT * FROM loan_history ORDER BY id DESC", loanRecordRowMapper);
    }

    public List<LoanRecord> getLoanHistoryForUser(int userId) {
        return jdbcTemplate.query("SELECT * FROM loan_history WHERE user_id = ? ORDER BY id DESC", loanRecordRowMapper, userId);
    }

    public String payFine(int historyId) {
        List<LoanRecord> list = jdbcTemplate.query("SELECT * FROM loan_history WHERE id = ?", loanRecordRowMapper, historyId);
        if (list.isEmpty()) return "Loan record not found";
        LoanRecord rec = list.get(0);
        if (rec.getFineAmount() <= 0) return "No fine owed on this record";
        if (rec.isFinePaid()) return "Fine is already marked as paid";
        jdbcTemplate.update("UPDATE loan_history SET fine_paid = true WHERE id = ?", historyId);
        return null;
    }

    // ─── SQL Queries (SELECT) ───────────────────────────

    public Book findBook(int id) {
        List<Book> list = jdbcTemplate.query("SELECT * FROM books WHERE id = ?", bookRowMapper, id);
        return list.isEmpty() ? null : list.get(0);
    }

    public User findUser(int id) {
        List<User> list = jdbcTemplate.query("SELECT * FROM users WHERE id = ?", userRowMapper, id);
        return list.isEmpty() ? null : list.get(0);
    }

    public List<Book> getBooksBorrowedByUser(int userId) {
        return jdbcTemplate.query("SELECT * FROM books WHERE borrower_id = ? AND status = 'borrowed' ORDER BY id", bookRowMapper, userId);
    }

    public List<Book> searchBooks(String query) {
        if (query == null || query.isBlank()) return getAllBooks();
        String q = "%" + query.toLowerCase().trim() + "%";
        String sql = "SELECT * FROM books WHERE LOWER(title) LIKE ? OR LOWER(author) LIKE ? OR LOWER(isbn) LIKE ? OR LOWER(genre) LIKE ? ORDER BY id";
        return jdbcTemplate.query(sql, bookRowMapper, q, q, q, q);
    }

    public List<User> searchUsers(String query) {
        if (query == null || query.isBlank()) return getAllUsers();
        String q = "%" + query.toLowerCase().trim() + "%";
        String sql = "SELECT * FROM users WHERE LOWER(name) LIKE ? OR CAST(id AS VARCHAR) LIKE ? ORDER BY id";
        return jdbcTemplate.query(sql, userRowMapper, q, q);
    }

    public List<Book> getAllBooks() {
        return jdbcTemplate.query("SELECT * FROM books ORDER BY id", bookRowMapper);
    }

    public List<User> getAllUsers() {
        return jdbcTemplate.query("SELECT * FROM users ORDER BY id", userRowMapper);
    }

    public List<Book> getAvailableBooks() {
        return jdbcTemplate.query("SELECT * FROM books WHERE status = 'available' ORDER BY id", bookRowMapper);
    }

    public List<Book> getBorrowedBooks() {
        return jdbcTemplate.query("SELECT * FROM books WHERE status = 'borrowed' ORDER BY id", bookRowMapper);
    }

    public List<Book> getOverdueBooks() {
        return jdbcTemplate.query("SELECT * FROM books WHERE status = 'borrowed' AND due_date < CURRENT_DATE ORDER BY id", bookRowMapper);
    }

    public int loansForUser(int userId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM books WHERE borrower_id = ? AND status = 'borrowed'",
                Integer.class,
                userId
        );
        return count != null ? count : 0;
    }

    /** Dashboard stats as a Map for easy JSON serialization. */
    public Map<String, Object> getStats() {
        List<Book> overdue = getOverdueBooks();   // per-book due dates feed the fine total

        Map<String, Object> s = new HashMap<>();
        s.put("totalBooks",   count("SELECT COUNT(*) FROM books"));
        s.put("available",    count("SELECT COUNT(*) FROM books WHERE status = 'available'"));
        s.put("onLoan",       count("SELECT COUNT(*) FROM books WHERE status = 'borrowed'"));
        s.put("overdue",      overdue.size());
        s.put("totalFines",   FineCalculator.totalFines(overdue));
        s.put("totalReaders", count("SELECT COUNT(*) FROM users"));
        return s;
    }

    /** Runs a COUNT query without loading any rows into memory. */
    private int count(String sql) {
        Integer n = jdbcTemplate.queryForObject(sql, Integer.class);
        return n != null ? n : 0;
    }
}

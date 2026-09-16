package com.library.service;

import com.library.model.Book;
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
 * Core library service — manages books and users backed by an embedded H2 SQL database.
 * Demonstrates:
 *  - Limited use of SQL (SELECT, INSERT, UPDATE, DELETE with JdbcTemplate)
 *  - Object-Oriented Programming (domain models Book, User, FineCalculator)
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

    public Library(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // ─── Book Management (SQL INSERT, UPDATE, DELETE) ───

    public void addBook(String title, String author, String isbn, String genre) {
        String sql = "INSERT INTO books (title, author, isbn, genre, status, borrower_id, due_date, renewed, on_hold) " +
                     "VALUES (?, ?, ?, ?, 'available', NULL, NULL, false, false)";
        jdbcTemplate.update(sql, title, author, isbn, genre);
    }

    public String removeBook(int id) {
        Book b = findBook(id);
        if (b == null) return "Book not found";
        if (b.isBorrowed()) return "Return the book first";
        jdbcTemplate.update("DELETE FROM books WHERE id = ?", id);
        return null;
    }

    public String updateBook(int id, String title, String author, String isbn, String genre) {
        Book b = findBook(id);
        if (b == null) return "Book not found";
        String sql = "UPDATE books SET title = ?, author = ?, isbn = ?, genre = ? WHERE id = ?";
        jdbcTemplate.update(sql, title, author, isbn, genre, id);
        return null;
    }

    // ─── User Management (SQL INSERT) ───────────────────

    public void addUser(String name, String contact) {
        String sql = "INSERT INTO users (name, contact, role) VALUES (?, ?, 'READER')";
        jdbcTemplate.update(sql, name, contact);
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
        String sql = "UPDATE books SET status = ?, borrower_id = ?, due_date = ?, renewed = ?, on_hold = ? WHERE id = ?";
        jdbcTemplate.update(sql, b.getStatus(), b.getBorrowerId(), Date.valueOf(b.getDueDate()), b.isRenewed(), b.isOnHold(), b.getId());
        return null;
    }

    /** Returns the fine amount, or -1 on error. */
    public long returnBook(int bookId) {
        Book b = findBook(bookId);
        if (b == null || !b.isBorrowed()) return -1;

        // OOP utility: calculate fine based on domain object
        long fine = FineCalculator.calcFine(b);

        // OOP model method
        b.returnBook();

        // SQL persistence
        String sql = "UPDATE books SET status = 'available', borrower_id = NULL, due_date = NULL, renewed = false, on_hold = false WHERE id = ?";
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

    // ─── SQL Queries (SELECT) ───────────────────────────

    public Book findBook(int id) {
        List<Book> list = jdbcTemplate.query("SELECT * FROM books WHERE id = ?", bookRowMapper, id);
        return list.isEmpty() ? null : list.get(0);
    }

    public User findUser(int id) {
        List<User> list = jdbcTemplate.query("SELECT * FROM users WHERE id = ?", userRowMapper, id);
        return list.isEmpty() ? null : list.get(0);
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

package com.library.controller;

import com.library.model.Book;
import com.library.model.LoanRecord;
import com.library.model.User;
import com.library.service.Library;
import com.library.utility.FineCalculator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller — thin layer that delegates everything to Library service.
 * No business logic here.
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class LibraryController {

    private final Library library;

    public LibraryController(Library library) {
        this.library = library;
    }

    // ─── Dashboard ──────────────────────────────────

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return library.getStats();
    }

    // ─── Books ──────────────────────────────────────

    @GetMapping("/books")
    public List<Book> books(@RequestParam(required = false) String q) {
        return library.searchBooks(q);
    }

    @GetMapping("/books/available")
    public List<Book> available() {
        return library.getAvailableBooks();
    }

    @GetMapping("/books/{id}")
    public ResponseEntity<Book> getBook(@PathVariable int id) {
        Book book = library.findBook(id);
        if (book == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(book);
    }

    /** Active loans with borrower name and live overdue fine, for the frontend. */
    @GetMapping("/loans")
    public List<Map<String, Object>> loans() {
        return library.getBorrowedBooks().stream().map(b -> {
            User u = library.findUser(b.getBorrowerId());
            Map<String, Object> m = new HashMap<>();
            m.put("book", b);
            m.put("borrowerName", u != null ? u.getName() : "Unknown");
            m.put("fine", FineCalculator.calcFine(b));
            return m;
        }).toList();
    }

    @PostMapping("/books")
    public Map<String, Object> addBook(@RequestBody Map<String, String> body) {
        String title = body != null ? body.get("title") : null;
        String author = body != null ? body.get("author") : null;
        String isbn = body != null ? body.get("isbn") : null;
        String genre = body != null ? body.get("genre") : null;

        if (isBlank(title) || isBlank(author) || isBlank(isbn) || isBlank(genre)) {
            return err("All book fields (title, author, ISBN, genre) are required");
        }
        library.addBook(title.trim(), author.trim(), isbn.trim(), genre.trim());
        return ok("Book added");
    }

    @PutMapping("/books/{id}")
    public Map<String, Object> updateBook(@PathVariable int id, @RequestBody Map<String, String> body) {
        String title = body != null ? body.get("title") : null;
        String author = body != null ? body.get("author") : null;
        String isbn = body != null ? body.get("isbn") : null;
        String genre = body != null ? body.get("genre") : null;

        if (isBlank(title) || isBlank(author) || isBlank(isbn) || isBlank(genre)) {
            return err("All book fields (title, author, ISBN, genre) are required");
        }
        String err = library.updateBook(id, title.trim(), author.trim(), isbn.trim(), genre.trim());
        return err == null ? ok("Book updated") : err(err);
    }

    @DeleteMapping("/books/{id}")
    public Map<String, Object> removeBook(@PathVariable int id) {
        String err = library.removeBook(id);
        return err == null ? ok("Book removed") : err(err);
    }

    // ─── Users / Readers ────────────────────────────

    @GetMapping("/users")
    public List<Map<String, Object>> users(@RequestParam(required = false) String q) {
        return library.searchUsers(q).stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("contact", u.getContact());
            m.put("loans", library.loansForUser(u.getId()));
            return m;
        }).toList();
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> getUser(@PathVariable int id) {
        User u = library.findUser(id);
        if (u == null) {
            return ResponseEntity.notFound().build();
        }
        List<Book> borrowed = library.getBooksBorrowedByUser(id);
        List<Map<String, Object>> bookDetails = borrowed.stream().map(b -> {
            Map<String, Object> bm = new HashMap<>();
            bm.put("id", b.getId());
            bm.put("title", b.getTitle());
            bm.put("author", b.getAuthor());
            bm.put("isbn", b.getIsbn());
            bm.put("genre", b.getGenre());
            bm.put("dueDate", b.getDueDate());
            bm.put("fine", FineCalculator.calcFine(b));
            bm.put("renewed", b.isRenewed());
            bm.put("onHold", b.isOnHold());
            return bm;
        }).toList();

        long totalOverdueFines = borrowed.stream().mapToLong(FineCalculator::calcFine).sum();

        Map<String, Object> resp = new HashMap<>();
        resp.put("id", u.getId());
        resp.put("name", u.getName());
        resp.put("contact", u.getContact());
        resp.put("borrowedBooks", bookDetails);
        resp.put("totalFines", totalOverdueFines);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/users")
    public Map<String, Object> addUser(@RequestBody Map<String, String> body) {
        String name = body != null ? body.get("name") : null;
        String contact = body != null ? body.get("contact") : null;

        if (isBlank(name) || isBlank(contact)) {
            return err("Reader name and contact are required");
        }
        library.addUser(name.trim(), contact.trim());
        return ok("Reader registered");
    }

    @PutMapping("/users/{id}")
    public Map<String, Object> updateUser(@PathVariable int id, @RequestBody Map<String, String> body) {
        String name = body != null ? body.get("name") : null;
        String contact = body != null ? body.get("contact") : null;

        if (isBlank(name) || isBlank(contact)) {
            return err("Reader name and contact are required");
        }
        String err = library.updateUser(id, name.trim(), contact.trim());
        return err == null ? ok("Reader updated") : err(err);
    }

    @DeleteMapping("/users/{id}")
    public Map<String, Object> removeUser(@PathVariable int id) {
        String err = library.removeUser(id);
        return err == null ? ok("Reader removed") : err(err);
    }

    // ─── Circulation ────────────────────────────────

    @PostMapping("/borrow")
    public Map<String, Object> borrow(@RequestBody Map<String, Integer> body) {
        String err = library.borrowBook(body.get("bookId"), body.get("userId"));
        return err == null ? ok("Book checked out for 14 days") : err(err);
    }

    @PostMapping("/return/{id}")
    public Map<String, Object> returnBook(@PathVariable int id) {
        long fine = library.returnBook(id);
        if (fine < 0) return err("Book not found or not on loan");
        Map<String, Object> r = new HashMap<>();
        r.put("success", true);
        r.put("message", fine > 0 ? "Book returned. Late fee: ₹" + fine : "Book returned");
        r.put("fine", fine);
        return r;
    }

    @PostMapping("/renew/{id}")
    public Map<String, Object> renew(@PathVariable int id) {
        String err = library.renewBook(id);
        return err == null ? ok("Loan extended by 7 days") : err(err);
    }

    @PostMapping("/hold/{id}")
    public Map<String, Object> hold(@PathVariable int id) {
        String err = library.placeHold(id);
        return err == null ? ok("Hold placed — renewal blocked") : err(err);
    }

    // ─── Loan History & Fine Payment ─────────────────────

    @GetMapping("/history")
    public List<LoanRecord> history(@RequestParam(required = false) Integer userId) {
        if (userId != null) {
            return library.getLoanHistoryForUser(userId);
        }
        return library.getAllLoanHistory();
    }

    @PostMapping("/history/{id}/pay")
    public Map<String, Object> payFine(@PathVariable int id) {
        String err = library.payFine(id);
        return err == null ? ok("Fine marked as paid") : err(err);
    }

    // ─── Response helpers ───────────────────────────

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private Map<String, Object> ok(String msg)  { return Map.of("success", true,  "message", msg); }
    private Map<String, Object> err(String msg) { return Map.of("success", false, "error", msg); }
}

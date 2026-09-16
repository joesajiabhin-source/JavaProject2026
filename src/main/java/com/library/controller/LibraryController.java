package com.library.controller;

import com.library.model.Book;
import com.library.model.User;
import com.library.service.Library;
import com.library.utility.FineCalculator;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller — thin layer that delegates everything to Library service.
 * No business logic here.
 */
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
        library.addBook(body.get("title"), body.get("author"), body.get("isbn"), body.get("genre"));
        return ok("Book added");
    }

    @PutMapping("/books/{id}")
    public Map<String, Object> updateBook(@PathVariable int id, @RequestBody Map<String, String> body) {
        String err = library.updateBook(id, body.get("title"), body.get("author"), body.get("isbn"), body.get("genre"));
        return err == null ? ok("Book updated") : err(err);
    }

    @DeleteMapping("/books/{id}")
    public Map<String, Object> removeBook(@PathVariable int id) {
        String err = library.removeBook(id);
        return err == null ? ok("Book removed") : err(err);
    }

    // ─── Users ──────────────────────────────────────

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

    @PostMapping("/users")
    public Map<String, Object> addUser(@RequestBody Map<String, String> body) {
        library.addUser(body.get("name"), body.get("contact"));
        return ok("Reader registered");
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

    // ─── Response helpers ───────────────────────────

    private Map<String, Object> ok(String msg)  { return Map.of("success", true,  "message", msg); }
    private Map<String, Object> err(String msg) { return Map.of("success", false, "error", msg); }
}

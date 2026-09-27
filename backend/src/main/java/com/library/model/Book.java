package com.library.model;

import java.time.LocalDate;

/**
 * Represents a book in the library catalogue.
 * Demonstrates: Encapsulation (private fields + getters/setters)
 */
public class Book {
    private int id;
    private String title;
    private String author;
    private String isbn;
    private String genre;
    private String status;      // "available" or "borrowed"
    private int borrowerId;     // 0 = none
    private LocalDate borrowDate;
    private LocalDate dueDate;
    private boolean renewed;
    private boolean hold;

    /* Default constructor for JSON deserialization */
    public Book() {}

    public Book(int id, String title, String author, String isbn, String genre) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.genre = genre;
        this.status = "available";
    }

    // --- Getters ---
    public int getId()            { return id; }
    public String getTitle()      { return title; }
    public String getAuthor()     { return author; }
    public String getIsbn()       { return isbn; }
    public String getGenre()      { return genre; }
    public String getStatus()     { return status; }
    public int getBorrowerId()    { return borrowerId; }
    public LocalDate getBorrowDate() { return borrowDate; }
    public LocalDate getDueDate() { return dueDate; }
    public boolean isRenewed()    { return renewed; }
    public boolean isOnHold()     { return hold; }

    // --- Setters ---
    public void setId(int id)            { this.id = id; }
    public void setTitle(String title)   { this.title = title; }
    public void setAuthor(String author) { this.author = author; }
    public void setIsbn(String isbn)     { this.isbn = isbn; }
    public void setGenre(String genre)   { this.genre = genre; }
    public void setStatus(String status) { this.status = status; }
    public void setBorrowerId(int id)    { this.borrowerId = id; }
    public void setBorrowDate(LocalDate d) { this.borrowDate = d; }
    public void setDueDate(LocalDate d)  { this.dueDate = d; }
    public void setRenewed(boolean r)    { this.renewed = r; }
    public void setHold(boolean h)       { this.hold = h; }

    /** Check out this book to a borrower. */
    public void checkout(int borrowerId, int loanDays) {
        this.status = "borrowed";
        this.borrowerId = borrowerId;
        this.borrowDate = LocalDate.now();
        this.dueDate = LocalDate.now().plusDays(loanDays);
        this.renewed = false;
        this.hold = false;
    }

    /** Return this book — resets all loan fields. */
    public void returnBook() {
        this.status = "available";
        this.borrowerId = 0;
        this.borrowDate = null;
        this.dueDate = null;
        this.renewed = false;
        this.hold = false;
    }

    /** Extend the due date. */
    public void renew(int extraDays) {
        this.dueDate = this.dueDate.plusDays(extraDays);
        this.renewed = true;
    }

    public void placeHold()      { this.hold = true; }
    public boolean isAvailable() { return "available".equals(status); }
    public boolean isBorrowed()  { return "borrowed".equals(status); }

    @Override
    public String toString() {
        return String.format("[%d] \"%s\" by %s | %s | %s", id, title, author, genre, status);
    }
}

package com.library.model;

import com.library.service.Library;

/**
 * A librarian who can manage the library.
 * Demonstrates: Inheritance (extends User), delegation to Library
 */
public class Librarian extends User {

    public Librarian() { super(); }

    public Librarian(int id, String name, String contact) {
        super(id, name, contact);
    }

    /** Add a book via the library service. */
    public void addBook(Library lib, String title, String author, String isbn, String genre) {
        lib.addBook(title, author, isbn, genre);
    }

    /** Remove a book — returns error message or null on success. */
    public String removeBook(Library lib, int bookId) {
        return lib.removeBook(bookId);
    }

    /** Register a new reader. */
    public void registerUser(Library lib, String name, String contact) {
        lib.addUser(name, contact);
    }

    @Override
    public String toString() {
        return "Librarian: " + super.toString();
    }
}

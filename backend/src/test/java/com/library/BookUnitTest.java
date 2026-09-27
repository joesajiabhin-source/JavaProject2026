package com.library;

import com.library.model.Book;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for the Book model class — no database or Spring context required.
 * Covers: constructor, getters/setters, checkout, returnBook, renew, hold, status helpers.
 */
class BookUnitTest {

    // ─── Constructor and Getters ─────────────────────────────

    @Test
    void parameterizedConstructorSetsAllFieldsCorrectly() {
        Book book = new Book(1, "Clean Code", "Robert Martin", "978-0132350884", "Software");
        assertEquals(1, book.getId());
        assertEquals("Clean Code", book.getTitle());
        assertEquals("Robert Martin", book.getAuthor());
        assertEquals("978-0132350884", book.getIsbn());
        assertEquals("Software", book.getGenre());
        assertEquals("available", book.getStatus());
        assertEquals(0, book.getBorrowerId());
        assertNull(book.getBorrowDate());
        assertNull(book.getDueDate());
        assertFalse(book.isRenewed());
        assertFalse(book.isOnHold());
    }

    @Test
    void defaultConstructorCreatesEmptyBook() {
        Book book = new Book();
        assertNull(book.getTitle());
        assertNull(book.getAuthor());
        assertNull(book.getIsbn());
        assertNull(book.getGenre());
        assertNull(book.getStatus());
        assertEquals(0, book.getId());
    }

    // ─── Setters ─────────────────────────────────────────────

    @Test
    void settersMutateFieldsCorrectly() {
        Book book = new Book();
        book.setId(42);
        book.setTitle("Test Title");
        book.setAuthor("Test Author");
        book.setIsbn("1234567890");
        book.setGenre("Tech");
        book.setStatus("borrowed");
        book.setBorrowerId(7);
        book.setBorrowDate(LocalDate.of(2026, 1, 1));
        book.setDueDate(LocalDate.of(2026, 1, 15));
        book.setRenewed(true);
        book.setHold(true);

        assertEquals(42, book.getId());
        assertEquals("Test Title", book.getTitle());
        assertEquals("Test Author", book.getAuthor());
        assertEquals("1234567890", book.getIsbn());
        assertEquals("Tech", book.getGenre());
        assertEquals("borrowed", book.getStatus());
        assertEquals(7, book.getBorrowerId());
        assertEquals(LocalDate.of(2026, 1, 1), book.getBorrowDate());
        assertEquals(LocalDate.of(2026, 1, 15), book.getDueDate());
        assertTrue(book.isRenewed());
        assertTrue(book.isOnHold());
    }

    // ─── Checkout ────────────────────────────────────────────

    @Test
    void checkoutSetsCorrectBorrowFields() {
        Book book = new Book(1, "Title", "Author", "ISBN", "Genre");
        book.checkout(5, 14);

        assertEquals("borrowed", book.getStatus());
        assertEquals(5, book.getBorrowerId());
        assertNotNull(book.getBorrowDate());
        assertNotNull(book.getDueDate());
        assertEquals(LocalDate.now(), book.getBorrowDate());
        assertEquals(LocalDate.now().plusDays(14), book.getDueDate());
        assertFalse(book.isRenewed());
        assertFalse(book.isOnHold());
    }

    @Test
    void checkoutResetsRenewedAndHoldFlags() {
        Book book = new Book(1, "Title", "Author", "ISBN", "Genre");
        book.setRenewed(true);
        book.setHold(true);
        book.checkout(3, 7);

        assertFalse(book.isRenewed(), "Checkout should reset renewed flag");
        assertFalse(book.isOnHold(), "Checkout should reset hold flag");
    }

    // ─── Return ──────────────────────────────────────────────

    @Test
    void returnBookResetsAllLoanFields() {
        Book book = new Book(1, "Title", "Author", "ISBN", "Genre");
        book.checkout(5, 14);
        book.returnBook();

        assertEquals("available", book.getStatus());
        assertEquals(0, book.getBorrowerId());
        assertNull(book.getBorrowDate());
        assertNull(book.getDueDate());
        assertFalse(book.isRenewed());
        assertFalse(book.isOnHold());
    }

    // ─── Renew ───────────────────────────────────────────────

    @Test
    void renewExtendsDueDateAndSetsRenewedFlag() {
        Book book = new Book(1, "Title", "Author", "ISBN", "Genre");
        book.checkout(1, 14);
        LocalDate originalDue = book.getDueDate();

        book.renew(7);

        assertEquals(originalDue.plusDays(7), book.getDueDate());
        assertTrue(book.isRenewed());
    }

    // ─── Hold ────────────────────────────────────────────────

    @Test
    void placeHoldSetsHoldFlag() {
        Book book = new Book(1, "Title", "Author", "ISBN", "Genre");
        book.checkout(1, 14);
        book.placeHold();

        assertTrue(book.isOnHold());
    }

    // ─── Status Helpers ──────────────────────────────────────

    @Test
    void isAvailableReturnsTrueOnlyWhenStatusIsAvailable() {
        Book book = new Book(1, "Title", "Author", "ISBN", "Genre");
        assertTrue(book.isAvailable());
        assertFalse(book.isBorrowed());

        book.checkout(1, 14);
        assertFalse(book.isAvailable());
        assertTrue(book.isBorrowed());
    }

    @Test
    void isAvailableHandlesNullStatus() {
        Book book = new Book();
        assertFalse(book.isAvailable());
        assertFalse(book.isBorrowed());
    }

    // ─── toString ────────────────────────────────────────────

    @Test
    void toStringContainsBookDetails() {
        Book book = new Book(1, "Clean Code", "Robert Martin", "ISBN", "Software");
        String str = book.toString();
        assertTrue(str.contains("Clean Code"));
        assertTrue(str.contains("Robert Martin"));
        assertTrue(str.contains("Software"));
        assertTrue(str.contains("available"));
    }
}

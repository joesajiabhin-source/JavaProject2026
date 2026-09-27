package com.library;

import com.library.model.Book;
import com.library.utility.FineCalculator;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for the FineCalculator utility — no database or Spring context required.
 * Tests: fine rate, days overdue, calcFine, totalFines with various scenarios.
 */
class FineCalculatorUnitTest {

    private Book createBorrowedBook(LocalDate dueDate) {
        Book book = new Book(1, "Test", "Author", "ISBN", "Genre");
        book.setStatus("borrowed");
        book.setDueDate(dueDate);
        return book;
    }

    @Test
    void fineRateIsTenPerDay() {
        assertEquals(10, FineCalculator.FINE_RATE);
    }

    @Test
    void daysOverdueReturnsZeroWhenDueDateIsNull() {
        Book book = new Book(1, "Test", "Author", "ISBN", "Genre");
        assertEquals(0, FineCalculator.daysOverdue(book));
    }

    @Test
    void daysOverdueReturnsZeroWhenBookIsNotOverdue() {
        Book book = createBorrowedBook(LocalDate.now().plusDays(5));
        assertEquals(0, FineCalculator.daysOverdue(book));
    }

    @Test
    void daysOverdueReturnsZeroWhenDueDateIsToday() {
        Book book = createBorrowedBook(LocalDate.now());
        assertEquals(0, FineCalculator.daysOverdue(book));
    }

    @Test
    void daysOverdueReturnsCorrectPositiveDays() {
        Book book = createBorrowedBook(LocalDate.now().minusDays(3));
        assertEquals(3, FineCalculator.daysOverdue(book));
    }

    @Test
    void calcFineReturnsZeroForNonOverdueBook() {
        Book book = createBorrowedBook(LocalDate.now().plusDays(7));
        assertEquals(0, FineCalculator.calcFine(book));
    }

    @Test
    void calcFineCalculatesCorrectAmountForOverdueBook() {
        Book book = createBorrowedBook(LocalDate.now().minusDays(5));
        assertEquals(50, FineCalculator.calcFine(book)); // 5 days × ₹10
    }

    @Test
    void calcFineReturnsZeroWhenDueDateIsNull() {
        Book book = new Book(1, "Test", "Author", "ISBN", "Genre");
        assertEquals(0, FineCalculator.calcFine(book));
    }

    @Test
    void totalFinesReturnsZeroForEmptyList() {
        assertEquals(0, FineCalculator.totalFines(Collections.emptyList()));
    }

    @Test
    void totalFinesSumsAllOverdueBooks() {
        Book book1 = createBorrowedBook(LocalDate.now().minusDays(2)); // ₹20
        Book book2 = createBorrowedBook(LocalDate.now().minusDays(4)); // ₹40
        Book book3 = createBorrowedBook(LocalDate.now().plusDays(3));  // ₹0

        List<Book> books = Arrays.asList(book1, book2, book3);
        assertEquals(60, FineCalculator.totalFines(books)); // 20 + 40 + 0
    }

    @Test
    void totalFinesHandlesSingleOverdueBook() {
        Book book = createBorrowedBook(LocalDate.now().minusDays(10));
        assertEquals(100, FineCalculator.totalFines(List.of(book))); // 10 × ₹10
    }
}

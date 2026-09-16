package com.library.utility;

import com.library.model.Book;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Utility class for computing overdue fines.
 * Demonstrates: Static methods, single-responsibility
 */
public class FineCalculator {
    public static final int FINE_RATE = 10; // ₹10 per overdue day

    private FineCalculator() {} // prevent instantiation

    /** Days overdue (0 if not overdue). */
    public static long daysOverdue(Book book) {
        if (book.getDueDate() == null) return 0;
        long days = ChronoUnit.DAYS.between(book.getDueDate(), LocalDate.now());
        return Math.max(days, 0);
    }

    /** Fine for a single book. */
    public static long calcFine(Book book) {
        return daysOverdue(book) * FINE_RATE;
    }

    /** Total fines across a list of books. */
    public static long totalFines(List<Book> books) {
        return books.stream().mapToLong(FineCalculator::calcFine).sum();
    }
}

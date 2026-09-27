package com.library;

import com.library.model.LoanRecord;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for the LoanRecord model class — no database required.
 */
class LoanRecordUnitTest {

    @Test
    void parameterizedConstructorSetsAllFields() {
        LoanRecord rec = new LoanRecord(1, 10, "Clean Code", 20, "Alice",
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 15),
                LocalDate.of(2026, 1, 18), 30, false);

        assertEquals(1, rec.getId());
        assertEquals(10, rec.getBookId());
        assertEquals("Clean Code", rec.getBookTitle());
        assertEquals(20, rec.getUserId());
        assertEquals("Alice", rec.getUserName());
        assertEquals(LocalDate.of(2026, 1, 1), rec.getBorrowDate());
        assertEquals(LocalDate.of(2026, 1, 15), rec.getDueDate());
        assertEquals(LocalDate.of(2026, 1, 18), rec.getReturnDate());
        assertEquals(30, rec.getFineAmount());
        assertFalse(rec.isFinePaid());
    }

    @Test
    void defaultConstructorCreatesEmptyRecord() {
        LoanRecord rec = new LoanRecord();
        assertEquals(0, rec.getId());
        assertEquals(0, rec.getBookId());
        assertNull(rec.getBookTitle());
        assertEquals(0, rec.getFineAmount());
        assertFalse(rec.isFinePaid());
    }

    @Test
    void settersWorkCorrectly() {
        LoanRecord rec = new LoanRecord();
        rec.setId(5);
        rec.setBookId(100);
        rec.setBookTitle("Title");
        rec.setUserId(200);
        rec.setUserName("Bob");
        rec.setBorrowDate(LocalDate.of(2026, 6, 1));
        rec.setDueDate(LocalDate.of(2026, 6, 15));
        rec.setReturnDate(LocalDate.of(2026, 6, 20));
        rec.setFineAmount(50);
        rec.setFinePaid(true);

        assertEquals(5, rec.getId());
        assertEquals(100, rec.getBookId());
        assertEquals("Title", rec.getBookTitle());
        assertEquals(200, rec.getUserId());
        assertEquals("Bob", rec.getUserName());
        assertEquals(LocalDate.of(2026, 6, 1), rec.getBorrowDate());
        assertEquals(LocalDate.of(2026, 6, 15), rec.getDueDate());
        assertEquals(LocalDate.of(2026, 6, 20), rec.getReturnDate());
        assertEquals(50, rec.getFineAmount());
        assertTrue(rec.isFinePaid());
    }
}

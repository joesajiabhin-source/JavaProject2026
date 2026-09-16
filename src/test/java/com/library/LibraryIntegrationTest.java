package com.library;

import com.library.model.Book;
import com.library.utility.FineCalculator;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests that exercise the full circulation workflow over HTTP
 * against the real H2 database, using the seed data from data.sql.
 *
 * All tests share one database, so they are ordered: read-only assertions
 * first, the self-cleaning borrow test next, and the mutating tests last.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class LibraryIntegrationTest {

    @Autowired TestRestTemplate http;
    @Autowired com.library.service.Library library;

    private static final String ATOMIC  = "9780735211292"; // borrowed by Maya (1), on time
    private static final String SAPIENS = "9780062316097"; // borrowed by Noah (2), 3 days overdue, renewed, on hold

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> getLoans() {
        return http.getForObject("/api/loans", List.class);
    }

    private Book findByIsbn(String isbn) {
        return library.searchBooks(isbn).get(0);
    }

    // ─── Read-only: seed state ────────────────────────────

    @Test @Order(1)
    void seedDataLoads() {
        assertEquals(5, library.getAllBooks().size(), "data.sql should seed 5 books");
        assertEquals(3, library.getAllUsers().size(), "data.sql should seed 3 readers");
    }

    @Test @Order(2)
    void dashboardStatsMatchSeedState() {
        Map<String, Object> stats = http.getForObject("/api/stats", Map.class);
        assertEquals(5, ((Number) stats.get("totalBooks")).intValue());
        assertEquals(3, ((Number) stats.get("available")).intValue());
        assertEquals(2, ((Number) stats.get("onLoan")).intValue());
        assertEquals(1, ((Number) stats.get("overdue")).intValue(), "Sapiens is seeded 3 days overdue");
        assertEquals(30, ((Number) stats.get("totalFines")).longValue(), "Sapiens: 3 days × ₹10");
    }

    @Test @Order(3)
    void searchFindsBooksByTitleAuthorAndGenre() {
        assertEquals(1, library.searchBooks("Sapiens").size());
        assertEquals(1, library.searchBooks("James Clear").size());
        assertEquals(1, library.searchBooks("Self-growth").size());
        assertTrue(library.searchBooks("zzz-no-such-book").isEmpty());
        assertEquals(5, library.searchBooks(null).size(), "blank search returns the whole catalogue");
    }

    @Test @Order(4)
    @SuppressWarnings("unchecked")
    void loansCarryBorrowerNamesAndFines() {
        List<Map<String, Object>> loans = getLoans();
        assertEquals(2, loans.size());

        // Jackson deserializes the nested book JSON into a Map, so read fields from the map
        Map<String, Object> sapiens = loans.stream()
                .filter(l -> SAPIENS.equals(((Map<String, Object>) l.get("book")).get("isbn")))
                .findFirst().orElseThrow();
        assertEquals("Noah Williams", sapiens.get("borrowerName"));
        assertEquals(30L, ((Number) sapiens.get("fine")).longValue());

        Map<String, Object> atomic = loans.stream()
                .filter(l -> ATOMIC.equals(((Map<String, Object>) l.get("book")).get("isbn")))
                .findFirst().orElseThrow();
        assertEquals("Maya Patel", atomic.get("borrowerName"));
        assertEquals(0L, ((Number) atomic.get("fine")).longValue(), "Atomic Habits is not overdue yet");
    }

    @Test @Order(5)
    void fineCalculatorChargesOnlyOverdueDays() {
        assertEquals(0, FineCalculator.calcFine(findByIsbn(ATOMIC)));
        assertEquals(3, FineCalculator.daysOverdue(findByIsbn(SAPIENS)));
        assertEquals(30, FineCalculator.calcFine(findByIsbn(SAPIENS)));
    }

    @Test @Order(6)
    void borrowedBooksCannotBeDeleted() {
        ResponseEntity<Map> del = http.exchange("/api/books/3", HttpMethod.DELETE, null, Map.class);
        assertEquals(Boolean.FALSE, del.getBody().get("success"));
        assertEquals("Return the book first", del.getBody().get("error"));
        assertNotNull(library.findBook(3), "book must still exist after the blocked delete");
    }

    // ─── Self-cleaning: borrow rules ──────────────────────

    @Test @Order(7)
    @SuppressWarnings("unchecked")
    void borrowingFollowsAllBusinessRules() {
        // Book 1 (The Midnight Library) is available; Maya (1) starts with 1 loan
        Map<String, Object> ok = http.postForObject("/api/borrow",
                Map.of("bookId", 1, "userId", 1), Map.class);
        assertEquals(Boolean.TRUE, ok.get("success"), () -> String.valueOf(ok));

        // Same book again — no longer available
        Map<String, Object> again = http.postForObject("/api/borrow",
                Map.of("bookId", 1, "userId", 1), Map.class);
        assertEquals(Boolean.FALSE, again.get("success"));

        // Maya now has 2 loans; one more brings her to the 3-book limit (Atomic + Midnight + Design)
        http.postForObject("/api/borrow", Map.of("bookId", 4, "userId", 1), Map.class);

        // The 4th loan must be refused — book 5 is still on the shelf, so the
        // availability check passes and the limit rule is what blocks the borrow.
        Map<String, Object> limit = http.postForObject("/api/borrow",
                Map.of("bookId", 5, "userId", 1), Map.class);
        assertEquals("Reader has reached the 3-book limit", limit.get("error"));

        // Unknown user (availability is checked first, so use the still-available book 5)
        Map<String, Object> ghost = http.postForObject("/api/borrow",
                Map.of("bookId", 5, "userId", 999), Map.class);
        assertEquals("User not found", ghost.get("error"));

        // Return everything borrowed in this test, restoring the seed state
        // (book 5 was never checked out — the limit rule refused it)
        for (int id : new int[]{1, 4}) {
            Map<String, Object> res = http.postForObject("/api/return/" + id, null, Map.class);
            assertEquals(Boolean.TRUE, res.get("success"), "cleanup return of book " + id);
        }
    }

    // ─── Mutating: run last ────────────────────────────────

    @Test @Order(8)
    void renewalBlockedWhenAlreadyRenewedOrOnHold() {
        // Sapiens (3) is seeded renewed=true and on_hold=true
        Map<String, Object> renew = http.postForObject("/api/renew/3", null, Map.class);
        assertEquals("Already renewed once", renew.get("error"));

        Map<String, Object> hold = http.postForObject("/api/hold/3", null, Map.class);
        assertEquals("Already on hold", hold.get("error"));
    }

    @Test @Order(9)
    void returningChargesTheOverdueFine() {
        // Sapiens (3) is 3 days overdue → ₹30
        Map<String, Object> res = http.postForObject("/api/return/3", null, Map.class);
        assertEquals(Boolean.TRUE, res.get("success"));
        assertEquals(30L, ((Number) res.get("fine")).longValue());
        assertTrue(library.findBook(3).isAvailable(), "Sapiens should be back on the shelf");
    }

    @Test @Order(10)
    void unknownEndpointsReturnNotFound() {
        ResponseEntity<String> res = http.getForEntity("/api/nope", String.class);
        assertEquals(HttpStatus.NOT_FOUND, res.getStatusCode());
    }
}

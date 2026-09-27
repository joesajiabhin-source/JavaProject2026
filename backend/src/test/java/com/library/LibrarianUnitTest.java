package com.library;

import com.library.model.Librarian;
import com.library.model.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for the Librarian model class — verifies OOP inheritance from User.
 */
class LibrarianUnitTest {

    @Test
    void librarianExtendsUser() {
        Librarian librarian = new Librarian(1, "Admin", "admin@library.com");
        assertTrue(librarian instanceof User, "Librarian should be a subclass of User");
    }

    @Test
    void parameterizedConstructorSetsInheritedFields() {
        Librarian lib = new Librarian(10, "Head Librarian", "head@library.com");
        assertEquals(10, lib.getId());
        assertEquals("Head Librarian", lib.getName());
        assertEquals("head@library.com", lib.getContact());
    }

    @Test
    void defaultConstructorCreatesEmptyLibrarian() {
        Librarian lib = new Librarian();
        assertEquals(0, lib.getId());
        assertNull(lib.getName());
    }

    @Test
    void toStringPrefixesWithLibrarian() {
        Librarian lib = new Librarian(1, "Admin", "admin@library.com");
        String str = lib.toString();
        assertTrue(str.startsWith("Librarian:"), "toString should start with 'Librarian:'");
        assertTrue(str.contains("Admin"));
    }

    @Test
    void polymorphismWorksWithUserReference() {
        User user = new Librarian(1, "Poly Test", "poly@test.com");
        // Calling toString on a User reference should invoke Librarian's overridden toString
        assertTrue(user.toString().startsWith("Librarian:"),
                "Polymorphic call should invoke Librarian.toString()");
    }
}

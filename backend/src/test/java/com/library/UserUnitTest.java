package com.library;

import com.library.model.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for the User model class — no database or Spring context required.
 * Covers: constructor, getters/setters, toString.
 */
class UserUnitTest {

    @Test
    void parameterizedConstructorSetsAllFields() {
        User user = new User(1, "Alice", "alice@example.com");
        assertEquals(1, user.getId());
        assertEquals("Alice", user.getName());
        assertEquals("alice@example.com", user.getContact());
    }

    @Test
    void defaultConstructorCreatesEmptyUser() {
        User user = new User();
        assertEquals(0, user.getId());
        assertNull(user.getName());
        assertNull(user.getContact());
    }

    @Test
    void settersMutateFieldsCorrectly() {
        User user = new User();
        user.setId(10);
        user.setName("Bob");
        user.setContact("bob@test.com");

        assertEquals(10, user.getId());
        assertEquals("Bob", user.getName());
        assertEquals("bob@test.com", user.getContact());
    }

    @Test
    void toStringContainsUserDetails() {
        User user = new User(5, "Charlie", "charlie@example.com");
        String str = user.toString();
        assertTrue(str.contains("Charlie"));
        assertTrue(str.contains("charlie@example.com"));
        assertTrue(str.contains("5"));
    }
}

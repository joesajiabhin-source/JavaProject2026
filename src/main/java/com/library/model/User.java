package com.library.model;

/**
 * Base class for any person in the system.
 * Demonstrates: Encapsulation, serves as base for Inheritance
 */
public class User {
    private int id;
    private String name;
    private String contact;

    /* Default constructor for JSON deserialization */
    public User() {}

    public User(int id, String name, String contact) {
        this.id = id;
        this.name = name;
        this.contact = contact;
    }

    public int getId()         { return id; }
    public String getName()    { return name; }
    public String getContact() { return contact; }

    public void setId(int id)            { this.id = id; }
    public void setName(String name)     { this.name = name; }
    public void setContact(String c)     { this.contact = c; }

    @Override
    public String toString() {
        return String.format("[%d] %s (%s)", id, name, contact);
    }
}

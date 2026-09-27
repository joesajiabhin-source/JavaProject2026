package com.library.model;

import java.time.LocalDate;

/**
 * Represents a historical loan record of a returned book.
 * Tracks reader, book, loan duration, fine, and payment status.
 */
public class LoanRecord {
    private int id;
    private int bookId;
    private String bookTitle;
    private int userId;
    private String userName;
    private LocalDate borrowDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private int fineAmount;
    private boolean finePaid;

    public LoanRecord() {}

    public LoanRecord(int id, int bookId, String bookTitle, int userId, String userName,
                      LocalDate borrowDate, LocalDate dueDate, LocalDate returnDate,
                      int fineAmount, boolean finePaid) {
        this.id = id;
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.userId = userId;
        this.userName = userName;
        this.borrowDate = borrowDate;
        this.dueDate = dueDate;
        this.returnDate = returnDate;
        this.fineAmount = fineAmount;
        this.finePaid = finePaid;
    }

    public int getId()                   { return id; }
    public void setId(int id)           { this.id = id; }

    public int getBookId()               { return bookId; }
    public void setBookId(int bookId)   { this.bookId = bookId; }

    public String getBookTitle()         { return bookTitle; }
    public void setBookTitle(String t)  { this.bookTitle = t; }

    public int getUserId()               { return userId; }
    public void setUserId(int userId)   { this.userId = userId; }

    public String getUserName()          { return userName; }
    public void setUserName(String name){ this.userName = name; }

    public LocalDate getBorrowDate()     { return borrowDate; }
    public void setBorrowDate(LocalDate d){ this.borrowDate = d; }

    public LocalDate getDueDate()        { return dueDate; }
    public void setDueDate(LocalDate d) { this.dueDate = d; }

    public LocalDate getReturnDate()     { return returnDate; }
    public void setReturnDate(LocalDate d){ this.returnDate = d; }

    public int getFineAmount()           { return fineAmount; }
    public void setFineAmount(int fine) { this.fineAmount = fine; }

    public boolean isFinePaid()          { return finePaid; }
    public void setFinePaid(boolean paid){ this.finePaid = paid; }
}

-- Clean up tables if they exist
DROP TABLE IF EXISTS loan_history;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'READER'
);

-- Books table
CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(50) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'available',
    borrower_id INT DEFAULT NULL,
    borrow_date DATE DEFAULT NULL,
    due_date DATE DEFAULT NULL,
    renewed BOOLEAN DEFAULT FALSE,
    on_hold BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (borrower_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Loan history table (audit trail for completed loans and fine payments)
CREATE TABLE loan_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT,
    book_title VARCHAR(255) NOT NULL,
    user_id INT,
    user_name VARCHAR(255) NOT NULL,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE NOT NULL,
    fine_amount INT DEFAULT 0,
    fine_paid BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

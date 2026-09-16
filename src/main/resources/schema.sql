-- Clean up tables if they exist
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
    due_date DATE DEFAULT NULL,
    renewed BOOLEAN DEFAULT FALSE,
    on_hold BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (borrower_id) REFERENCES users(id) ON DELETE SET NULL
);

-- MySQL / InnoDB schema. Tables are preserved on restart.
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'READER'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Books table
CREATE TABLE IF NOT EXISTS books (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(50) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'available',
    borrower_id BIGINT UNSIGNED DEFAULT NULL,
    borrow_date DATE DEFAULT NULL,
    due_date DATE DEFAULT NULL,
    renewed BOOLEAN DEFAULT FALSE,
    on_hold BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (borrower_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Loan history table (audit trail for completed loans and fine payments)
CREATE TABLE IF NOT EXISTS loan_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    book_id BIGINT UNSIGNED,
    book_title VARCHAR(255) NOT NULL,
    user_id BIGINT UNSIGNED,
    user_name VARCHAR(255) NOT NULL,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE NOT NULL,
    fine_amount INT DEFAULT 0,
    fine_paid BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- PostgreSQL Schema for VaultCore Banking System

-- Table Definitions
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE accounts (
    account_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id),
    account_type VARCHAR(50) NOT NULL,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    account_id INT REFERENCES accounts(account_id),
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stored Procedures
CREATE OR REPLACE FUNCTION create_account(customer_id INT, account_type VARCHAR(50))
RETURNS VOID AS $$
BEGIN
    INSERT INTO accounts(customer_id, account_type)
    VALUES (customer_id, account_type);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION deposit(account_id INT, amount DECIMAL(10, 2))
RETURNS VOID AS $$
BEGIN
    UPDATE accounts
    SET balance = balance + amount
    WHERE account_id = account_id;
    INSERT INTO transactions(account_id, amount, transaction_type)
    VALUES (account_id, amount, 'deposit');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION withdraw(account_id INT, amount DECIMAL(10, 2))
RETURNS VOID AS $$
BEGIN
    IF (SELECT balance FROM accounts WHERE account_id = account_id) >= amount THEN
        UPDATE accounts
        SET balance = balance - amount
        WHERE account_id = account_id;
        INSERT INTO transactions(account_id, amount, transaction_type)
        VALUES (account_id, amount, 'withdrawal');
    ELSE
        RAISE EXCEPTION 'Insufficient funds';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER balance_check
BEFORE INSERT OR UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION check_balance();

CREATE OR REPLACE FUNCTION check_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.transaction_type = 'withdrawal' AND (SELECT balance FROM accounts WHERE account_id = NEW.account_id) < NEW.amount) THEN
        RAISE EXCEPTION 'Insufficient funds';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
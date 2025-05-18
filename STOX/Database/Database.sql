CREATE DATABASE IF NOT EXISTS stoxDB;
USE stoxDB;

-- ROLE TABLE
CREATE TABLE Role (
    Role_ID INT PRIMARY KEY AUTO_INCREMENT,
    Role_Name VARCHAR(50) UNIQUE
);

-- USER TABLE
CREATE TABLE User (
    User_ID INT PRIMARY KEY AUTO_INCREMENT,
    Business_Name VARCHAR(100),
    Business_Number VARCHAR(50),
    Email VARCHAR(100),
    Phone_Number VARCHAR(20),
    Address TEXT,
    Transit_Number VARCHAR(50),
    Password VARCHAR(100),
    DATE DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- USER_ROLE TABLE (join table)
CREATE TABLE User_Role (
    User_Role_ID INT PRIMARY KEY AUTO_INCREMENT,
    User_ID INT,
    Role_ID INT,
    FOREIGN KEY (User_ID) REFERENCES User(User_ID),
    FOREIGN KEY (Role_ID) REFERENCES Role(Role_ID)
);

-- CATEGORY TABLE
CREATE TABLE Category (
    Category_ID INT PRIMARY KEY AUTO_INCREMENT,
    Category_Name VARCHAR(50) UNIQUE
);

ALTER TABLE Category
ADD COLUMN User_ID INT,
ADD CONSTRAINT FK_Category_User FOREIGN KEY (User_ID) REFERENCES User(User_ID) ON DELETE CASCADE;


-- PRODUCT TABLE
CREATE TABLE Product (
    Product_ID INT PRIMARY KEY AUTO_INCREMENT,
    Product_Name VARCHAR(100),
    Description TEXT,
    Category_ID INT,
    User_ID INT,
    Stock_Quantity INT,
    Price DECIMAL(10,2),
    FOREIGN KEY (Category_ID) REFERENCES Category(Category_ID),
    FOREIGN KEY (User_ID) REFERENCES User(User_ID)
);

-- CUSTOMER TABLE
CREATE TABLE Customer (
    Customer_ID INT PRIMARY KEY AUTO_INCREMENT,
    Full_Name VARCHAR(100) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Phone_Number VARCHAR(50) NOT NULL,
    Address TEXT NOT NULL,
    User_ID INT,
    CONSTRAINT FK_Customer_User FOREIGN KEY (User_ID) REFERENCES User(User_ID) ON DELETE CASCADE
);


-- SALES INVOICE TABLE 
CREATE TABLE Invoice (
    Invoice_ID INT PRIMARY KEY AUTO_INCREMENT, 
    Customer_ID INT,                           
    Invoice_Date DATETIME DEFAULT CURRENT_TIMESTAMP, 
    Total_Amount DECIMAL(10,2),                 
    FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID)
);

ALTER TABLE Invoice ADD COLUMN User_ID INT NOT NULL;

-- SALES INVOICE ITEMS TABLE 
CREATE TABLE Invoice_Items (
    Invoice_Item_ID INT PRIMARY KEY AUTO_INCREMENT,  
    Invoice_ID INT,                                  
    Product_ID INT,                                 
    Quantity INT,                                    
    Price DECIMAL(10,2),                             
    FOREIGN KEY (Invoice_ID) REFERENCES Invoice(Invoice_ID),
    FOREIGN KEY (Product_ID) REFERENCES Product(Product_ID)
);

-- PURCHASE INVOICE TABLE (for stock purchases)
CREATE TABLE PurchaseInvoice (
    PurchaseInvoice_ID INT PRIMARY KEY AUTO_INCREMENT,
    Supplier_Name VARCHAR(100),
    Purchase_Date DATETIME DEFAULT CURRENT_TIMESTAMP,
    Total_Amount DECIMAL(10,2)
);

ALTER TABLE PurchaseInvoice ADD COLUMN User_ID INT NOT NULL;

-- PURCHASE INVOICE ITEMS TABLE 
CREATE TABLE PurchaseInvoice_Items (
    PurchaseInvoice_Item_ID INT PRIMARY KEY AUTO_INCREMENT,
    PurchaseInvoice_ID INT,
    Product_ID INT,
    Quantity INT,
    Purchase_Price DECIMAL(10,2),
    FOREIGN KEY (PurchaseInvoice_ID) REFERENCES PurchaseInvoice(PurchaseInvoice_ID),
    FOREIGN KEY (Product_ID) REFERENCES Product(Product_ID)
);

-- CONTACT TABLE
CREATE TABLE Contact (
    Contact_ID INT PRIMARY KEY AUTO_INCREMENT,
    Email VARCHAR(100),
    Message TEXT,
    Date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE UserActivityLogs (
    LogId INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    Action VARCHAR(255) NOT NULL,
    Timestamp DATETIME NOT NULL,
    FOREIGN KEY (UserId) REFERENCES User(User_ID) ON DELETE CASCADE
);

CREATE TABLE PasswordResetTokens (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    User_ID INT NOT NULL,
    Token VARCHAR(255) NOT NULL,
    Expiration DATETIME NOT NULL,
    FOREIGN KEY (User_ID) REFERENCES User(User_ID) ON DELETE CASCADE
);


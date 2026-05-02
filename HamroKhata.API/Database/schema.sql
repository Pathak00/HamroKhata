-- ============================================================
--  Hamro Khata – Database Schema
--  Run this script against SQL Server BEFORE running the app.
--  Data Source=VICTUS; Initial Catalog=HamroKhata
-- ============================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'HamroKhata')
BEGIN
    CREATE DATABASE HamroKhata;
    PRINT 'Database HamroKhata created.';
END
ELSE
    PRINT 'Database HamroKhata already exists.';
GO

USE HamroKhata;
GO

-- ============================================================
-- Users (Shop Owners)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users (
        Id           INT            NOT NULL IDENTITY(1,1) PRIMARY KEY,
        Name         NVARCHAR(150)  NOT NULL,
        Phone        NVARCHAR(20)   NOT NULL,
        PasswordHash NVARCHAR(255)  NOT NULL,
        CreatedAt    DATETIME2      NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT UQ_Users_Phone UNIQUE (Phone)
    );
    PRINT 'Table Users created.';
END
GO

-- ============================================================
-- Customers
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Customers' AND xtype='U')
BEGIN
    CREATE TABLE Customers (
        Id        INT           NOT NULL IDENTITY(1,1) PRIMARY KEY,
        UserId    INT           NOT NULL,
        Name      NVARCHAR(150) NOT NULL,
        Phone     NVARCHAR(20)  NOT NULL,
        PublicId  NVARCHAR(20)  NOT NULL,
        CreatedAt DATETIME2     NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT FK_Customers_Users   FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
        CONSTRAINT UQ_Customers_PublicId UNIQUE (PublicId)
    );
    PRINT 'Table Customers created.';
END
GO

-- ============================================================
-- Transactions
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Transactions' AND xtype='U')
BEGIN
    CREATE TABLE Transactions (
        Id           INT            NOT NULL IDENTITY(1,1) PRIMARY KEY,
        CustomerId   INT            NOT NULL,
        Amount       DECIMAL(18,2)  NOT NULL,
        Type         NVARCHAR(10)   NOT NULL,   -- 'Credit' | 'Payment'
        Note         NVARCHAR(500)  NULL,
        CreatedAt    DATETIME2      NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT FK_Transactions_Customers FOREIGN KEY (CustomerId) REFERENCES Customers(Id) ON DELETE CASCADE,
        CONSTRAINT CHK_Transaction_Type      CHECK (Type IN ('Credit', 'Payment')),
        CONSTRAINT CHK_Transaction_Amount    CHECK (Amount > 0)
    );
    PRINT 'Table Transactions created.';
END
GO

-- ============================================================
-- Indexes for performance
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Customers_UserId' AND object_id = OBJECT_ID('Customers'))
    CREATE NONCLUSTERED INDEX IX_Customers_UserId ON Customers(UserId);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Transactions_CustomerId' AND object_id = OBJECT_ID('Transactions'))
    CREATE NONCLUSTERED INDEX IX_Transactions_CustomerId ON Transactions(CustomerId);
GO

PRINT '=== Hamro Khata schema applied successfully ===';
GO

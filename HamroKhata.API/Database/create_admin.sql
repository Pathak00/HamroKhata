-- ============================================================
--  Hamro Khata – Create Admin User Script
--  Run AFTER the schema.sql has been applied.
--  This creates a default admin account.
--  Phone:    9999999999
--  Password: Admin@123   (BCrypt hash below)
-- ============================================================

USE HamroKhata;
GO

-- BCrypt hash for "Admin@123" (cost factor 11)
DECLARE @AdminHash NVARCHAR(255) = '$2a$11$VmUqhom4p13Wqc1EknMFs.QGPBF6hLJE5X0T4s4MNEuZ2ioRTqBW';

IF NOT EXISTS (SELECT 1 FROM Users WHERE Phone = '9999999999')
BEGIN
    INSERT INTO Users (Name, Phone, PasswordHash, IsAdmin)
    VALUES ('Super Admin', '9999999999', @AdminHash, 1);
    PRINT 'Admin user created. Phone: 9999999999 | Password: Admin@123';
END
ELSE
BEGIN
    -- Make sure the existing user is admin
    UPDATE Users SET IsAdmin = 1 WHERE Phone = '9999999999';
    PRINT 'Admin user already exists. IsAdmin flag ensured.';
END
GO

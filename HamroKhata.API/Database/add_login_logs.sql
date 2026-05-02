-- ============================================================
--  Hamro Khata – Add UserLoginLogs table
--  Run this against the HamroKhata database.
-- ============================================================

USE HamroKhata;
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserLoginLogs' AND xtype='U')
BEGIN
    CREATE TABLE UserLoginLogs (
        Id          INT            NOT NULL IDENTITY(1,1) PRIMARY KEY,
        UserId      INT            NOT NULL,
        LoggedInAt  DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
        IpAddress   NVARCHAR(45)   NULL,
        UserAgent   NVARCHAR(500)  NULL,

        CONSTRAINT FK_UserLoginLogs_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );

    CREATE NONCLUSTERED INDEX IX_UserLoginLogs_UserId ON UserLoginLogs(UserId);

    PRINT 'Table UserLoginLogs created.';
END
ELSE
    PRINT 'Table UserLoginLogs already exists.';
GO

PRINT '=== UserLoginLogs migration applied successfully ===';
GO

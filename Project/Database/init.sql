-- ######################################################################
-- # ASSUMES DATABASE ALREADY EXISTS
-- # This script only creates tables and seeds data
-- ######################################################################

USE TICKET_SYSTEM;
GO

-- ######################################################################
-- # MASTER LOOKUP TABLES
-- ######################################################################

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[MiHub_Divisions](
	[DIVISION_ID] [smallint] NOT NULL,
	[DIVISION_NAME] [varchar](255) NOT NULL,
PRIMARY KEY CLUSTERED ([DIVISION_ID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[MiHub_Labor_Department](
	[DEPARTMENT_ID] [smallint] NOT NULL,
	[DEPARTMENT_NAME] [varchar](255) NOT NULL,
PRIMARY KEY CLUSTERED ([DEPARTMENT_ID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[MiHub_Manufact_Noncon](
	[NONCON_ID] [tinyint] NOT NULL,
	[NONCON] [varchar](100) NOT NULL,
PRIMARY KEY CLUSTERED ([NONCON_ID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[MiHub_Quality_Ticket_Status](
	[STATUS_ID] [tinyint] NOT NULL,
	[STATUS_DESCRIPTION] [varchar](max) NOT NULL,
PRIMARY KEY CLUSTERED ([STATUS_ID] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

CREATE TABLE [dbo].[MiHub_Quality_Users](
	[ID] [smallint] NOT NULL,
	[ROLE] [tinyint] NOT NULL,
	[NAME] [nvarchar](55) NOT NULL,
	[EMAIL] [nvarchar](55) NOT NULL,
PRIMARY KEY CLUSTERED ([ID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[MiHub_Sequence](
	[SEQUENCE_ID] [smallint] NOT NULL,
	[SEQUENCE_NAME] [nvarchar](55) NOT NULL,
PRIMARY KEY CLUSTERED ([SEQUENCE_ID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[MiHub_WO](
	[WO_ID] [int] NOT NULL,
	[WO] [varchar](55) NOT NULL,
PRIMARY KEY CLUSTERED ([WO_ID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[MiHub_WO_Unit](
	[UNIT_ID] [smallint] NOT NULL,
	[UNIT_NAME] [nvarchar](55) NOT NULL,
PRIMARY KEY CLUSTERED ([UNIT_ID] ASC)
) ON [PRIMARY]
GO

-- ######################################################################
-- # WORK ORDER LINKING TABLES
-- ######################################################################

CREATE TABLE [dbo].[WorkOrder_LaborDepartments](
    [WO_ID] [int] NOT NULL,
    [DEPARTMENT_ID] [smallint] NOT NULL,
PRIMARY KEY CLUSTERED ([WO_ID] ASC, [DEPARTMENT_ID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[WorkOrder_Units](
    [WO_ID] [int] NOT NULL,
    [UNIT_ID] [smallint] NOT NULL,
PRIMARY KEY CLUSTERED ([WO_ID] ASC, [UNIT_ID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[WorkOrder_Sequences](
    [WO_ID] [int] NOT NULL,
    [SEQUENCE_ID] [smallint] NOT NULL,
PRIMARY KEY CLUSTERED ([WO_ID] ASC, [SEQUENCE_ID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[WorkOrder_Nonconformances](
    [WO_ID] [int] NOT NULL,
    [NONCON_ID] [tinyint] NOT NULL,
PRIMARY KEY CLUSTERED ([WO_ID] ASC, [NONCON_ID] ASC)
) ON [PRIMARY]
GO

-- ######################################################################
-- # TRANSACTION TABLES
-- ######################################################################

CREATE TABLE [dbo].[MiHub_Quality_Email_Buffer](
	[ID] [smallint] NOT NULL,
	[RECEIVER] [nvarchar](55) NULL,
	[TIME_SENT] [datetime] NULL,
PRIMARY KEY CLUSTERED ([ID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Ticket_Counters](
    [WO_ID] [int] NOT NULL,
    [LAST_TICKET_NUM] [int] NOT NULL DEFAULT 0,
    PRIMARY KEY CLUSTERED ([WO_ID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[MiHubWeb_Quality_Tickets](
	[TICKETID] [int] IDENTITY(1000,1) NOT NULL,
	[QUALITY_TICKET_ID] [nvarchar](100) NULL,
	[STATUS] [tinyint] NOT NULL,
	[INITIATOR] [smallint] NOT NULL,
	[WO] [int] NOT NULL,
	[UNIT] [smallint] NULL,
	[SEQUENCE] [smallint] NULL, 
	[DIVISION] [smallint] NOT NULL,
	[LABOR_DEPARTMENT] [smallint] NOT NULL,
	[OPEN_DATE] [datetime] NOT NULL,
	[CLOSE_DATE] [datetime] NULL,
	[MANUFACTURING_NONCONFORMANCE] [tinyint] NOT NULL,
	[DRAWING_NUM] [nvarchar](55) NULL,
	[DESCRIPTION] [nvarchar](max) NULL,
	[ASSIGNED_TO] [smallint] NULL,
	[ESTIMATED_LABOR_HOURS] [decimal](10, 2) NULL,
	[CORRECTIVE_ACTION] [nvarchar](max) NULL,
	[MATERIALS_USED] [nvarchar](max) NULL,
	[LAST_REOPEN_DATE] [datetime] NULL,
PRIMARY KEY CLUSTERED ([TICKETID] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

CREATE TABLE [dbo].[MiHubWeb_Quality_Tickets_Archive](
	[TICKETID] [int] NOT NULL,
	[QUALITY_TICKET_ID] [nvarchar](100) NULL,
	[STATUS] [tinyint] NOT NULL,
	[INITIATOR] [smallint] NOT NULL,
	[WO] [int] NOT NULL,
	[UNIT] [smallint] NULL,
	[SEQUENCE] [smallint] NULL,
	[DIVISION] [smallint] NOT NULL,
	[LABOR_DEPARTMENT] [smallint] NOT NULL,
	[OPEN_DATE] [datetime] NOT NULL,
	[CLOSE_DATE] [datetime] NULL,
	[MANUFACTURING_NONCONFORMANCE] [tinyint] NOT NULL,
	[DRAWING_NUM] [nvarchar](55) NULL,
	[DESCRIPTION] [nvarchar](max) NULL,
	[ASSIGNED_TO] [smallint] NULL,
	[ESTIMATED_LABOR_HOURS] [decimal](10, 2) NULL,
	[CORRECTIVE_ACTION] [nvarchar](max) NULL,
	[MATERIALS_USED] [nvarchar](max) NULL
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[MiHubWeb_Quality_Tickets_Closed](
	[TICKETID] [int] NOT NULL,
	[STATUS] [tinyint] NOT NULL,
	[INITIATOR] [smallint] NOT NULL,
	[WO] [int] NOT NULL,
	[UNIT] [smallint] NULL,
	[SEQUENCE] [smallint] NOT NULL,
	[DIVISION] [smallint] NOT NULL,
	[OPEN_DATE] [datetime] NOT NULL,
	[CLOSE_DATE] [datetime] NULL,
	[MANUFACTURING_NONCONFORMANCE] [tinyint] NOT NULL,
	[DRAWING_NUM] [int] NOT NULL,
	[PART_NUM] [int] NOT NULL,
	[DESCRIPTION] [nvarchar](max) NULL
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[MiHubWeb_Quality_Ticket_Closures](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[TICKET_ID] [int] NOT NULL,
	[CYCLE_START_DATE] [datetime] NULL,
	[CYCLE_CLOSE_DATE] [datetime] NOT NULL,
	[CORRECTIVE_ACTION] [nvarchar](max) NULL,
	[MATERIALS_USED] [nvarchar](max) NULL,
	[ESTIMATED_LABOR_HOURS] [decimal](10, 2) NULL,
	[CLOSED_BY] [smallint] NULL,
    CONSTRAINT [PK_Ticket_Closures] PRIMARY KEY CLUSTERED ([ID] ASC)
)
GO

CREATE TABLE [dbo].[MiHubWeb_Quality_Ticket_Notes](
    [NOTE_ID] [int] IDENTITY(1,1) NOT NULL,
    [TICKET_ID] [int] NOT NULL,
    [AUTHOR_ID] [smallint] NOT NULL,
    [NOTE_TEXT] [nvarchar](max) NOT NULL,
    [CREATED_AT] [datetime] DEFAULT GETDATE(),
    CONSTRAINT [PK_Ticket_Notes] PRIMARY KEY CLUSTERED ([NOTE_ID] ASC)
)
GO

CREATE TABLE [dbo].[MiHub_Quality_Attachments](
    [ID] [INT] IDENTITY(10000,1) PRIMARY KEY,
    [TICKETID] [INT] NOT NULL,
    [FileKey] [NVARCHAR](255) NOT NULL UNIQUE,
    [FileName] [NVARCHAR](255) NOT NULL,
    [FileData] [VARBINARY](MAX) NOT NULL,
    [MimeType] [NVARCHAR](100) NOT NULL
)
GO

CREATE TABLE [dbo].[AuditLogs](
    [LOG_ID] INT IDENTITY(1,1) NOT NULL,
    [USER_ID] SMALLINT NULL,
    [UserRole] TINYINT NULL,
    [TICKET_ID] INT NULL,
    [WO_ID] INT NULL,
    [ACTION] NVARCHAR(50) NOT NULL,
    [TIMESTAMP] DATETIME2 NOT NULL,
    CONSTRAINT [PK_AuditLogs] PRIMARY KEY CLUSTERED ([LOG_ID] ASC)
) ON [PRIMARY]
GO

-- ######################################################################
-- # INDEXES
-- ######################################################################

CREATE INDEX IX_AuditLogs_Timestamp ON [dbo].[AuditLogs] ([TIMESTAMP])
CREATE INDEX IX_AuditLogs_Action ON [dbo].[AuditLogs] ([ACTION])
CREATE INDEX IX_AuditLogs_UserRole ON [dbo].[AuditLogs] ([UserRole])
GO

-- ######################################################################
-- # DEFAULTS
-- ######################################################################

ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets] ADD DEFAULT (getdate()) FOR [OPEN_DATE]
GO

-- ######################################################################
-- # FOREIGN KEY CONSTRAINTS - Linking Tables
-- ######################################################################

ALTER TABLE [dbo].[WorkOrder_LaborDepartments] WITH CHECK ADD FOREIGN KEY([WO_ID])
REFERENCES [dbo].[MiHub_WO] ([WO_ID])
GO

ALTER TABLE [dbo].[WorkOrder_LaborDepartments] WITH CHECK ADD FOREIGN KEY([DEPARTMENT_ID])
REFERENCES [dbo].[MiHub_Labor_Department] ([DEPARTMENT_ID])
GO

ALTER TABLE [dbo].[WorkOrder_Units] WITH CHECK ADD FOREIGN KEY([WO_ID])
REFERENCES [dbo].[MiHub_WO] ([WO_ID])
GO

ALTER TABLE [dbo].[WorkOrder_Units] WITH CHECK ADD FOREIGN KEY([UNIT_ID])
REFERENCES [dbo].[MiHub_WO_Unit] ([UNIT_ID])
GO

ALTER TABLE [dbo].[WorkOrder_Sequences] WITH CHECK ADD FOREIGN KEY([WO_ID])
REFERENCES [dbo].[MiHub_WO] ([WO_ID])
GO

ALTER TABLE [dbo].[WorkOrder_Sequences] WITH CHECK ADD FOREIGN KEY([SEQUENCE_ID])
REFERENCES [dbo].[MiHub_Sequence] ([SEQUENCE_ID])
GO

ALTER TABLE [dbo].[WorkOrder_Nonconformances] WITH CHECK ADD FOREIGN KEY([WO_ID])
REFERENCES [dbo].[MiHub_WO] ([WO_ID])
GO

ALTER TABLE [dbo].[WorkOrder_Nonconformances] WITH CHECK ADD FOREIGN KEY([NONCON_ID])
REFERENCES [dbo].[MiHub_Manufact_Noncon] ([NONCON_ID])
GO

ALTER TABLE [dbo].[Ticket_Counters] WITH CHECK ADD FOREIGN KEY([WO_ID])
REFERENCES [dbo].[MiHub_WO] ([WO_ID])
GO

-- ######################################################################
-- # FOREIGN KEY CONSTRAINTS - Tickets
-- ######################################################################

ALTER TABLE [dbo].[MiHub_Quality_Attachments] WITH CHECK ADD CONSTRAINT [FK_Image_Ticket] 
FOREIGN KEY([TICKETID]) REFERENCES [dbo].[MiHubWeb_Quality_Tickets] ([TICKETID])
ON DELETE CASCADE
GO

ALTER TABLE [dbo].[MiHubWeb_Quality_Ticket_Closures] WITH CHECK 
ADD CONSTRAINT [FK_Closure_Ticket] FOREIGN KEY([TICKET_ID])
REFERENCES [dbo].[MiHubWeb_Quality_Tickets] ([TICKETID])
ON DELETE CASCADE
GO

ALTER TABLE [dbo].[MiHubWeb_Quality_Ticket_Notes] WITH CHECK 
ADD CONSTRAINT [FK_Notes_Ticket] FOREIGN KEY([TICKET_ID])
REFERENCES [dbo].[MiHubWeb_Quality_Tickets] ([TICKETID])
ON DELETE CASCADE
GO

ALTER TABLE [dbo].[MiHubWeb_Quality_Ticket_Notes] WITH CHECK 
ADD CONSTRAINT [FK_Notes_User] FOREIGN KEY([AUTHOR_ID])
REFERENCES [dbo].[MiHub_Quality_Users] ([ID])
GO

ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets] WITH CHECK ADD FOREIGN KEY([DIVISION])
REFERENCES [dbo].[MiHub_Divisions] ([DIVISION_ID])
GO

ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets] WITH CHECK ADD FOREIGN KEY([LABOR_DEPARTMENT])
REFERENCES [dbo].[MiHub_Labor_Department] ([DEPARTMENT_ID])
GO

ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets] WITH CHECK ADD FOREIGN KEY([ASSIGNED_TO])
REFERENCES [dbo].[MiHub_Quality_Users] ([ID])
GO

ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets] WITH CHECK ADD FOREIGN KEY([INITIATOR])
REFERENCES [dbo].[MiHub_Quality_Users] ([ID])
GO

ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets] WITH CHECK ADD FOREIGN KEY([MANUFACTURING_NONCONFORMANCE])
REFERENCES [dbo].[MiHub_Manufact_Noncon] ([NONCON_ID])
GO

ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets] WITH CHECK ADD FOREIGN KEY([SEQUENCE])
REFERENCES [dbo].[MiHub_Sequence] ([SEQUENCE_ID])
GO

ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets] WITH CHECK ADD FOREIGN KEY([STATUS])
REFERENCES [dbo].[MiHub_Quality_Ticket_Status] ([STATUS_ID])
GO

ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets] WITH CHECK ADD FOREIGN KEY([UNIT])
REFERENCES [dbo].[MiHub_WO_Unit] ([UNIT_ID])
GO

ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets] WITH CHECK ADD FOREIGN KEY([WO])
REFERENCES [dbo].[MiHub_WO] ([WO_ID])
GO

-- ######################################################################
-- # PERFORMANCE INDEXES
-- ######################################################################

-- Foreign Key Indexes for Ticket Table (Critical for Joins)
CREATE INDEX IX_Tickets_WO ON dbo.MiHubWeb_Quality_Tickets(WO);
CREATE INDEX IX_Tickets_Unit ON dbo.MiHubWeb_Quality_Tickets(UNIT);
CREATE INDEX IX_Tickets_Status ON dbo.MiHubWeb_Quality_Tickets(STATUS);
CREATE INDEX IX_Tickets_Division ON dbo.MiHubWeb_Quality_Tickets(DIVISION);
CREATE INDEX IX_Tickets_Sequence ON dbo.MiHubWeb_Quality_Tickets(SEQUENCE);
CREATE INDEX IX_Tickets_Initiator ON dbo.MiHubWeb_Quality_Tickets(INITIATOR);
CREATE INDEX IX_Tickets_AssignedTo ON dbo.MiHubWeb_Quality_Tickets(ASSIGNED_TO);

-- Foreign Key Indexes for Work Order Linking Tables
CREATE INDEX IX_WO_Labor_Dept ON dbo.WorkOrder_LaborDepartments(DEPARTMENT_ID);
CREATE INDEX IX_WO_Units_Unit ON dbo.WorkOrder_Units(UNIT_ID);
GO

-- ######################################################################
-- # SEED DATA
-- ######################################################################

-- Users
INSERT INTO dbo.MiHub_Quality_Users (ID, ROLE, NAME, EMAIL)
VALUES 
    (1001, 3, 'NROACH', 'nroach@miller.inc'),
    (1002, 2, 'CPORRETT', 'cporrett@miller.inc'),
    (1003, 1, 'OSARTELE', 'osartele@miller.inc'),
    (1004, 2, 'ASTOCKFORD', 'astockford@miller.inc'),
    (1005, 2, 'SMCCARTHY', 'smccarthy@miller.inc')
GO

-- Ticket Statuses
INSERT INTO dbo.MiHub_Quality_Ticket_Status (STATUS_ID, STATUS_DESCRIPTION)
VALUES 
    (0, 'Open'),
    (1, 'In Progress'),
    (2, 'Closed')
GO

-- Divisions
INSERT INTO dbo.MiHub_Divisions(DIVISION_ID, DIVISION_NAME)
VALUES (1, 'FlexAir'), (2, 'PFab'), (3, 'CInstall')
GO

-- Labor Departments
INSERT INTO dbo.MiHub_Labor_Department(DEPARTMENT_ID, DEPARTMENT_NAME)
VALUES (1, 'Welding'), (2, 'Assembly'), (3, 'Paint'), (4, 'Electrical'), (5, 'Detailing')
GO

-- Manufacturing Nonconformances
INSERT INTO dbo.MiHub_Manufact_Noncon (NONCON_ID, NONCON)
VALUES (1, 'Material'), (2, 'Design'), (3, 'Assembly'), (4, 'Detailing')
GO

-- Work Orders
INSERT INTO dbo.MiHub_WO (WO_ID, WO)
VALUES (1, '24113'), (2, '023186'), (3, '341118'), (4, '253233'), (5, '289933')
GO

-- Units
INSERT INTO dbo.MiHub_WO_Unit (UNIT_ID, UNIT_NAME)
VALUES
    (101, 'A1'), (102, 'A2'), (103, 'A3'), (104, 'A4'), (105, 'A5'),
    (106, 'B1'), (107, 'B2'), (108, 'B3'), (109, 'B4'), (110, 'B5')
GO

-- Sequences
INSERT INTO dbo.MiHub_Sequence(SEQUENCE_ID, SEQUENCE_NAME)
VALUES
    (101, 'REW-00300'), (102, '000400'), (103, 'DSA-20019'), (104, '019000'),
    (105, 'LMN-12345'), (106, 'ABC-67890')
GO

-- Link WO 1 to Departments
INSERT INTO dbo.WorkOrder_LaborDepartments (WO_ID, DEPARTMENT_ID)
VALUES (1, 1), (1, 2)
GO

-- Link WO 2 to Departments
INSERT INTO dbo.WorkOrder_LaborDepartments (WO_ID, DEPARTMENT_ID)
VALUES (2, 3), (2, 5)
GO

-- Link WO 1 to Units
INSERT INTO dbo.WorkOrder_Units (WO_ID, UNIT_ID)
VALUES (1, 101), (1, 102)
GO

-- Link WO 2 to Units
INSERT INTO dbo.WorkOrder_Units (WO_ID, UNIT_ID)
VALUES (2, 106), (2, 107)
GO

-- Link WOs to Sequences
INSERT INTO dbo.WorkOrder_Sequences (WO_ID, SEQUENCE_ID)
VALUES (1, 101), (1, 103), (2, 102), (2, 104)
GO

-- Link All WOs to All Nonconformances
INSERT INTO dbo.WorkOrder_Nonconformances (WO_ID, NONCON_ID)
VALUES
    (1, 1), (1, 2), (1, 3), (1, 4),
    (2, 1), (2, 2), (2, 3), (2, 4),
    (3, 1), (3, 2), (3, 3), (3, 4),
    (4, 1), (4, 2), (4, 3), (4, 4),
    (5, 1), (5, 2), (5, 3), (5, 4)
GO

-- WORK ORDER 3 (341118)
-- =============================================
-- Assign Departments: Welding (1) and Electrical (4)
INSERT INTO dbo.WorkOrder_LaborDepartments (WO_ID, DEPARTMENT_ID) VALUES (3, 1), (3, 4);
GO
-- Assign Units: A3 (103) and B3 (108)
INSERT INTO dbo.WorkOrder_Units (WO_ID, UNIT_ID) VALUES (3, 103), (3, 108);
GO
-- Assign Sequences: LMN-12345 (105) and ABC-67890 (106)
INSERT INTO dbo.WorkOrder_Sequences (WO_ID, SEQUENCE_ID) VALUES (3, 105), (3, 106);
GO

-- =============================================
-- WORK ORDER 4 (253233)
-- =============================================
-- Assign Departments: Assembly (2) and Paint (3)
INSERT INTO dbo.WorkOrder_LaborDepartments (WO_ID, DEPARTMENT_ID) VALUES (4, 2), (4, 3);
GO
-- Assign Units: A4 (104) and B4 (109)
INSERT INTO dbo.WorkOrder_Units (WO_ID, UNIT_ID) VALUES (4, 104), (4, 109);
GO
-- Assign Sequences: REW-00300 (101) and 019000 (104)
INSERT INTO dbo.WorkOrder_Sequences (WO_ID, SEQUENCE_ID) VALUES (4, 101), (4, 104);
GO

-- =============================================
-- WORK ORDER 5 (289933)
-- =============================================
-- Assign Departments: Detailing (5)
INSERT INTO dbo.WorkOrder_LaborDepartments (WO_ID, DEPARTMENT_ID) VALUES (5, 5);
GO
-- Assign Units: A5 (105) and B5 (110)
INSERT INTO dbo.WorkOrder_Units (WO_ID, UNIT_ID) VALUES (5, 105), (5, 110);
GO
-- Assign Sequences: 000400 (102) and DSA-20019 (103)
INSERT INTO dbo.WorkOrder_Sequences (WO_ID, SEQUENCE_ID) VALUES (5, 102), (5, 103);
GO
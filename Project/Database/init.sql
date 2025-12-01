-- Create the database
CREATE DATABASE TICKET_SYSTEM;
GO

-- Switch to the new database
USE TICKET_SYSTEM;
GO

-- ######################################################################
-- #
-- # MASTER LOOKUP TABLES
-- # These tables store the master lists for all possible options.
-- #
-- ######################################################################

/****** Object:  Table [dbo].[MiHub_Divisions]    Script Date: 9/29/2025 4:27:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MiHub_Divisions](
	[DIVISION_ID] [smallint] NOT NULL,
	[DIVISION_NAME] [varchar](255) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[DIVISION_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MiHub_Labor_Department]    Script Date: 11/15/2025 6:50:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MiHub_Labor_Department](
	[DEPARTMENT_ID] [smallint] NOT NULL,
	[DEPARTMENT_NAME] [varchar](255) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[DEPARTMENT_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MiHub_Manufact_Noncon]    Script Date: 9/29/2025 4:27:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MiHub_Manufact_Noncon](
	[NONCON_ID] [tinyint] NOT NULL,
	[NONCON] [varchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[NONCON_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MiHub_Quality_Ticket_Status]    Script Date: 9/29/2025 4:27:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MiHub_Quality_Ticket_Status](
	[STATUS_ID] [tinyint] NOT NULL,
	[STATUS_DESCRIPTION] [varchar](max) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[STATUS_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MiHub_Quality_Users]    Script Date: 9/29/2025 4:27:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MiHub_Quality_Users](
	[ID] [smallint] NOT NULL,
	[ROLE] [tinyint] NOT NULL,
	[NAME] [nvarchar](55) NOT NULL,
	[EMAIL] [nvarchar](55) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MiHub_Sequence]    Script Date: 9/29/2025 4:27:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MiHub_Sequence](
	[SEQUENCE_ID] [smallint] NOT NULL,
	[SEQUENCE_NAME] [nvarchar](55) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[SEQUENCE_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MiHub_WO]    Script Date: 9/29/2025 4:27:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MiHub_WO](
	[WO_ID] [int] NOT NULL,
	[WO] [varchar](55) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[WO_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MiHub_WO_Unit]    Script Date: 9/29/2025 4:27:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MiHub_WO_Unit](
	[UNIT_ID] [smallint] NOT NULL,
	[UNIT_NAME] [nvarchar](55) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UNIT_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- ######################################################################
-- #
-- # WORK ORDER LINKING TABLES
-- # These tables define the many-to-many relationships.
-- # They specify which options are valid for a given Work Order.
-- #
-- ######################################################################

/****** Object:  Table [dbo].[WorkOrder_LaborDepartments]    Script Date: 11/15/2025 6:50:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WorkOrder_LaborDepartments](
    [WO_ID] [int] NOT NULL,
    [DEPARTMENT_ID] [smallint] NOT NULL,
PRIMARY KEY CLUSTERED 
(
    [WO_ID] ASC,
    [DEPARTMENT_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[WorkOrder_LaborDepartments]  WITH CHECK ADD FOREIGN KEY([WO_ID])
REFERENCES [dbo].[MiHub_WO] ([WO_ID])
GO
ALTER TABLE [dbo].[WorkOrder_LaborDepartments]  WITH CHECK ADD FOREIGN KEY([DEPARTMENT_ID])
REFERENCES [dbo].[MiHub_Labor_Department] ([DEPARTMENT_ID])
GO

/****** Object:  Table [dbo].[WorkOrder_Units]    Script Date: 11/15/2025 6:50:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WorkOrder_Units](
    [WO_ID] [int] NOT NULL,
    [UNIT_ID] [smallint] NOT NULL,
PRIMARY KEY CLUSTERED 
(
    [WO_ID] ASC,
    [UNIT_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[WorkOrder_Units]  WITH CHECK ADD FOREIGN KEY([WO_ID])
REFERENCES [dbo].[MiHub_WO] ([WO_ID])
GO
ALTER TABLE [dbo].[WorkOrder_Units]  WITH CHECK ADD FOREIGN KEY([UNIT_ID])
REFERENCES [dbo].[MiHub_WO_Unit] ([UNIT_ID])
GO

/****** Object:  Table [dbo].[WorkOrder_Sequences]    Script Date: 11/15/2025 6:50:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WorkOrder_Sequences](
    [WO_ID] [int] NOT NULL,
    [SEQUENCE_ID] [smallint] NOT NULL,
PRIMARY KEY CLUSTERED 
(
    [WO_ID] ASC,
    [SEQUENCE_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[WorkOrder_Sequences]  WITH CHECK ADD FOREIGN KEY([WO_ID])
REFERENCES [dbo].[MiHub_WO] ([WO_ID])
GO
ALTER TABLE [dbo].[WorkOrder_Sequences]  WITH CHECK ADD FOREIGN KEY([SEQUENCE_ID])
REFERENCES [dbo].[MiHub_Sequence] ([SEQUENCE_ID])
GO

/****** Object:  Table [dbo].[WorkOrder_Nonconformances]    Script Date: 11/15/2025 6:50:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WorkOrder_Nonconformances](
    [WO_ID] [int] NOT NULL,
    [NONCON_ID] [tinyint] NOT NULL,
PRIMARY KEY CLUSTERED 
(
    [WO_ID] ASC,
    [NONCON_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[WorkOrder_Nonconformances]  WITH CHECK ADD FOREIGN KEY([WO_ID])
REFERENCES [dbo].[MiHub_WO] ([WO_ID])
GO
ALTER TABLE [dbo].[WorkOrder_Nonconformances]  WITH CHECK ADD FOREIGN KEY([NONCON_ID])
REFERENCES [dbo].[MiHub_Manufact_Noncon] ([NONCON_ID])
GO

-- ######################################################################
-- #
-- # TRANSACTION TABLES
-- # These tables store the main application data (tickets, images, etc.)
-- #
-- ######################################################################

/****** Object:  Table [dbo].[MiHub_Quality_Email_Buffer]    Script Date: 9/29/2025 4:27:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MiHub_Quality_Email_Buffer](
	[ID] [smallint] NOT NULL,
	[RECEIVER] [nvarchar](55) NULL,
	[TIME_SENT] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[MiHubWeb_Quality_Tickets]    Script Date: 11/15/2025 6:50:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MiHubWeb_Quality_Tickets](
	[TICKETID] [int] IDENTITY(1000,1) NOT NULL,
	[QUALITY_TICKET_ID] [nvarchar](100) NULL,
	[STATUS] [tinyint] NOT NULL,
	[INITIATOR] [smallint] NOT NULL,
	[WO] [int] NOT NULL,
	[UNIT] [smallint] NULL,
	[SEQUENCE] [smallint] NULL, -- CHANGED FROM NOT NULL TO NULL
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
PRIMARY KEY CLUSTERED 
(
	[TICKETID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  Table [dbo].[MiHubWeb_Quality_Tickets_Archive]    Script Date: 11/15/2025 6:50:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MiHubWeb_Quality_Tickets_Archive](
	[TICKETID] [int] NOT NULL,
	[QUALITY_TICKET_ID] [nvarchar](100) NULL,
	[STATUS] [tinyint] NOT NULL,
	[INITIATOR] [smallint] NOT NULL,
	[WO] [int] NOT NULL,
	[UNIT] [smallint] NULL,
	[SEQUENCE] [smallint] NULL, -- CHANGED FROM NOT NULL TO NULL
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
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[MiHubWeb_Quality_Tickets_Closed] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
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
	[DESCRIPTION] [nvarchar](max) NULL,
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[MiHub_Quality_Images]    Script Date: 9/29/2025 4:27:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MiHub_Quality_Images](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[TICKETID] [int] NOT NULL,
	[ImageKey] [nvarchar](255) NOT NULL,
	[ImageData] [varbinary](max) NOT NULL,
	[MimeType] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_MiHub_Quality_Images] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_MiHub_Quality_Images_ImageKey] UNIQUE NONCLUSTERED 
(
	[ImageKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  Foreign Key [FK_Image_Ticket] ******/
ALTER TABLE [dbo].[MiHub_Quality_Images]  WITH CHECK ADD  CONSTRAINT [FK_Image_Ticket] FOREIGN KEY([TICKETID])
REFERENCES [dbo].[MiHubWeb_Quality_Tickets] ([TICKETID])
ON DELETE CASCADE
GO

ALTER TABLE [dbo].[MiHub_Quality_Images] CHECK CONSTRAINT [FK_Image_Ticket]
GO

/****** Object:  Table [dbo].[AuditLogs]    Script Date: 11/25/2025 8:10:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[AuditLogs](
    [LOG_ID] INT IDENTITY(1,1) NOT NULL,
    [USER_ID] SMALLINT NULL,       -- reference only, no FK
    [UserRole] TINYINT NULL,       -- raw role number snapshot
    [TICKET_ID] INT NULL,          -- reference only, no FK
    [WO_ID] INT NULL,              -- reference only, no FK
    [ACTION] NVARCHAR(50) NOT NULL,
    [TIMESTAMP] DATETIME2 NOT NULL,
    CONSTRAINT [PK_AuditLogs] PRIMARY KEY CLUSTERED ([LOG_ID] ASC)
) ON [PRIMARY];
GO

CREATE INDEX IX_AuditLogs_Timestamp ON [dbo].[AuditLogs] ([TIMESTAMP]);
CREATE INDEX IX_AuditLogs_Action ON [dbo].[AuditLogs] ([ACTION]);
CREATE INDEX IX_AuditLogs_UserRole ON [dbo].[AuditLogs] ([UserRole]);
GO

-- ######################################################################
-- #
-- # FOREIGN KEY CONSTRAINTS
-- #
-- ######################################################################

ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets] ADD  DEFAULT (getdate()) FOR [OPEN_DATE]
GO
ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets]  WITH CHECK ADD FOREIGN KEY([DIVISION])
REFERENCES [dbo].[MiHub_Divisions] ([DIVISION_ID])
GO
ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets]  WITH CHECK ADD FOREIGN KEY([LABOR_DEPARTMENT])
REFERENCES [dbo].[MiHub_Labor_Department] ([DEPARTMENT_ID])
GO
ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets]  WITH CHECK ADD FOREIGN KEY([ASSIGNED_TO])
REFERENCES [dbo].[MiHub_Quality_Users] ([ID])
GO
ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets]  WITH CHECK ADD FOREIGN KEY([INITIATOR])
REFERENCES [dbo].[MiHub_Quality_Users] ([ID])
GO
ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets]  WITH CHECK ADD FOREIGN KEY([MANUFACTURING_NONCONFORMANCE])
REFERENCES [dbo].[MiHub_Manufact_Noncon] ([NONCON_ID])
GO
ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets]  WITH CHECK ADD FOREIGN KEY([SEQUENCE])
REFERENCES [dbo].[MiHub_Sequence] ([SEQUENCE_ID])
GO
ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets]  WITH CHECK ADD FOREIGN KEY([STATUS])
REFERENCES [dbo].[MiHub_Quality_Ticket_Status] ([STATUS_ID])
GO
ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets]  WITH CHECK ADD FOREIGN KEY([UNIT])
REFERENCES [dbo].[MiHub_WO_Unit] ([UNIT_ID])
GO
ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets]  WITH CHECK ADD FOREIGN KEY([WO])
REFERENCES [dbo].[MiHub_WO] ([WO_ID])
GO
USE [master]
GO
ALTER DATABASE [TICKET_SYSTEM] SET  READ_WRITE 
GO

-- ######################################################################
-- #
-- # SEED DATA
-- #
-- ######################################################################

USE [TICKET_SYSTEM]
GO

-- Populate Users Table
INSERT INTO dbo.MiHub_Quality_Users (ID, ROLE, NAME, EMAIL)
VALUES 
    (1001, 1, 'NROACH', 'nroach@miller.inc'),
    (1002, 1, 'CPORRETT', 'cporrett@miller.inc'),
    (1003, 2, 'OSARTELE', 'osartele@miller.inc'),
    (1004, 2, 'ASTOCKFORD', 'astockford@miller.inc'),
    (1005, 2, 'SMCCARTHY', 'smccarthy@miller.inc');
GO

-- Populate Ticket Status Table
INSERT INTO dbo.MiHub_Quality_Ticket_Status (STATUS_ID, STATUS_DESCRIPTION)
VALUES 
    (0, 'Open'),
	(1, 'In Progress'),
    (2, 'Closed');
GO

-- Populate Divisions Table
INSERT INTO dbo.MiHub_Divisions(DIVISION_ID, DIVISION_NAME)
VALUES
    (1, 'FlexAir'),
    (2, 'PFab'),
    (3, 'CInstall');
GO

-- Populate Labor Department Table (MASTER LIST)
INSERT INTO dbo.MiHub_Labor_Department(DEPARTMENT_ID, DEPARTMENT_NAME)
VALUES
    (1, 'Welding'),
    (2, 'Assembly'),
    (3, 'Paint'),
    (4, 'Electrical'),
    (5, 'Detailing');
GO

-- Populate Manufacturing Nonconformance Table (MASTER LIST)
INSERT INTO dbo.MiHub_Manufact_Noncon (NONCON_ID, NONCON)
VALUES
    (1, 'Material'),
    (2, 'Design'),
    (3, 'Assembly'),
    (4, 'Detailing');
GO

-- Populate Work Orders (WO) Table (MASTER LIST)
INSERT INTO dbo.MiHub_WO (WO_ID, WO)
VALUES
    (1, '24113'),
    (2, '023186'),
    (3, '341118'),
    (4, '253233'),
    (5, '289933');
GO

-- Populate WO Units Table (MASTER LIST)
INSERT INTO dbo.MiHub_WO_Unit (UNIT_ID, UNIT_NAME)
VALUES
    (101, 'A1'), (102, 'A2'), (103, 'A3'), (104, 'A4'), (105, 'A5'),
    (106, 'B1'), (107, 'B2'), (108, 'B3'), (109, 'B4'), (110, 'B5');
GO

-- Populate Sequence Table (MASTER LIST)
INSERT INTO dbo.MiHub_Sequence(SEQUENCE_ID, SEQUENCE_NAME)
VALUES
    (101, 'REW-00300'), (102, '000400'), (103, 'DSA-20019'), (104, '019000'),
    (105, 'LMN-12345'), (106, 'ABC-67890');
GO

-- ######################################################################
-- #
-- # SEED DATA - LINKING TABLES (Example Data)
-- #
-- ######################################################################

-- Define valid departments for WO 1 ('24113')
INSERT INTO dbo.WorkOrder_LaborDepartments (WO_ID, DEPARTMENT_ID)
VALUES
    (1, 1), -- Welding
    (1, 2); -- Assembly
GO

-- Define valid departments for WO 2 ('023186')
INSERT INTO dbo.WorkOrder_LaborDepartments (WO_ID, DEPARTMENT_ID)
VALUES
    (2, 3), -- Paint
    (2, 5); -- Detailing
GO

-- Define valid units for WO 1 ('24113')
INSERT INTO dbo.WorkOrder_Units (WO_ID, UNIT_ID)
VALUES
    (1, 101), -- A1
    (1, 102); -- A2
GO

-- Define valid units for WO 2 ('023186')
INSERT INTO dbo.WorkOrder_Units (WO_ID, UNIT_ID)
VALUES
    (2, 106), -- B1
    (2, 107); -- B2
GO

-- Define valid sequences for WO 1 ('24113')
INSERT INTO dbo.WorkOrder_Sequences (WO_ID, SEQUENCE_ID)
VALUES
    (1, 101), -- REW-00300
    (1, 103); -- DSA-20019
GO

-- Define valid nonconformances for ALL WOs (Example)
INSERT INTO dbo.WorkOrder_Nonconformances (WO_ID, NONCON_ID)
VALUES
    (1, 1), (1, 2), (1, 3), (1, 4), -- All 4 for WO 1
    (2, 1), (2, 2), (2, 3), (2, 4), -- All 4 for WO 2
    (3, 1), (3, 2), (3, 3), (3, 4), -- All 4 for WO 3
    (4, 1), (4, 2), (4, 3), (4, 4), -- All 4 for WO 4
    (5, 1), (5, 2), (5, 3), (5, 4); -- All 4 for WO 5
GO
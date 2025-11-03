-- Create the database
CREATE DATABASE TICKET_SYSTEM;
GO

-- Switch to the new database
USE TICKET_SYSTEM;
GO

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
/****** Object:  Table [dbo].[MiHub_Drawing_Num]    Script Date: 9/29/2025 4:27:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MiHub_Drawing_Num](
	[DRAWING_NUM_ID] [int] NOT NULL,
	[DRAWING_NUM] [nvarchar](55) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[DRAWING_NUM_ID] ASC
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
/****** Object:  Table [dbo].[MiHub_Part_Num]    Script Date: 9/29/2025 4:27:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MiHub_Part_Num](
	[PART_NUM_ID] [int] NOT NULL,
	[PART_NUM] [nvarchar](55) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[PART_NUM_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
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
/****** Object:  Table [dbo].[MiHub_Quality_Images]    Script Date: 9/29/2025 4:27:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MiHub_Quality_Images](
	[IMAGE_ID] [int] NOT NULL,
	[TICKETID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[IMAGE_ID] ASC
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
	[WO] [int] NOT NULL,
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
/****** Object:  Table [dbo].[MiHubWeb_Quality_Tickets]    Script Date: 9/29/2025 4:27:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MiHubWeb_Quality_Tickets](
	[TICKETID] [int] IDENTITY(1000,1) NOT NULL,
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
PRIMARY KEY CLUSTERED 
(
	[TICKETID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MiHubWeb_Quality_Tickets_Archive]    Script Date: 9/29/2025 4:27:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MiHubWeb_Quality_Tickets_Archive](
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
ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets] ADD  DEFAULT (getdate()) FOR [OPEN_DATE]
GO
ALTER TABLE [dbo].[MiHub_Quality_Images]  WITH CHECK ADD FOREIGN KEY([TICKETID])
REFERENCES [dbo].[MiHubWeb_Quality_Tickets] ([TICKETID])
GO
ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets]  WITH CHECK ADD FOREIGN KEY([DIVISION])
REFERENCES [dbo].[MiHub_Divisions] ([DIVISION_ID])
GO
ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets]  WITH CHECK ADD FOREIGN KEY([DRAWING_NUM])
REFERENCES [dbo].[MiHub_Drawing_Num] ([DRAWING_NUM_ID])
GO
ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets]  WITH CHECK ADD FOREIGN KEY([INITIATOR])
REFERENCES [dbo].[MiHub_Quality_Users] ([ID])
GO
ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets]  WITH CHECK ADD FOREIGN KEY([MANUFACTURING_NONCONFORMANCE])
REFERENCES [dbo].[MiHub_Manufact_Noncon] ([NONCON_ID])
GO
ALTER TABLE [dbo].[MiHubWeb_Quality_Tickets]  WITH CHECK ADD FOREIGN KEY([PART_NUM])
REFERENCES [dbo].[MiHub_Part_Num] ([PART_NUM_ID])
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

USE [TICKET_SYSTEM]
GO


-- ********Enter seed data to fill reference tables***********
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
    (1, 'Closed');
GO

-- Populate Divisions Table
INSERT INTO dbo.MiHub_Divisions(DIVISION_ID, DIVISION_NAME)
VALUES
    (1, 'FlexAir'),
    (2, 'PFab'),
    (3, 'CInstall');
GO

-- Populate Manufacturing Nonconformance Table
INSERT INTO dbo.MiHub_Manufact_Noncon (NONCON_ID, NONCON)
VALUES
    (1, 'Material'),
    (2, 'Design'),
    (3, 'Assembly'),
    (4, 'Detailing');
GO

-- Populate Work Orders (WO) Table
INSERT INTO dbo.MiHub_WO (WO_ID, WO)
VALUES
    (1, '24113'),
    (2, '023186'),
    (3, '341118'),
    (4, '253233'),
    (5, '289933'),
    (6, '113334'),
    (7, '256662'),
    (8, '245522'),
    (9, '247777'),
    (10, '230000'),
    (11, '222737'),
    (12, '276772'),
    (13, '228282'),
    (14, '122939'),
    (15, '300232');
GO

-- Populate WO Units Table
INSERT INTO dbo.MiHub_WO_Unit (UNIT_ID, UNIT_NAME)
VALUES
    (101, 'A1'), (102, 'A2'), (103, 'A3'), (104, 'A4'), (105, 'A5'),
    (106, 'B1'), (107, 'B2'), (108, 'B3'), (109, 'B4'), (110, 'B5');
GO

-- Populate Sequence Table (Partial List for Brevity)
INSERT INTO dbo.MiHub_Sequence(SEQUENCE_ID, SEQUENCE_NAME)
VALUES
    (101, 'REW-00300'), (102, '000400'), (103, 'DSA-20019'), (104, '019000'),
    (105, 'LMN-12345'), (106, 'ABC-67890'), (107, 'XYZ-10101'), (108, 'QRS-23456'),
    (109, 'STU-78901'), (110, 'VWX-01234');
GO

-- Populate Drawing Numbers Table (Partial List for Brevity)
INSERT INTO dbo.MiHub_Drawing_Num (DRAWING_NUM_ID, DRAWING_NUM)
VALUES
    (10000, ''),
    (23456, '24113-0100A30'),
    (23465, '24113-FS29A'),
    (23474, '2024-07-15-001'),
    (23483, '24113-Rework'),
    (23492, '2024-07-16-002');
GO

-- Populate Part Numbers Table (Partial List for Brevity)
INSERT INTO MiHub_Part_Num (PART_NUM_ID, PART_NUM)
VALUES
    (34252, '08FSV051104-026-48.75X120.00'),
    (34253, 'FS29A'),
    (34254, 'Several'),
    (34255, 'ABC-12345'),
    (34256, 'XYZ-67890');
GO
CREATE TABLE `production_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`status` enum('queued','processing','complete','error') NOT NULL DEFAULT 'queued',
	`trimSizeId` varchar(32) NOT NULL,
	`styleId` varchar(64) NOT NULL,
	`manuscriptFileName` varchar(512),
	`manuscriptFileKey` varchar(512),
	`wordCount` int,
	`chapterCount` int,
	`pdfUrl` text,
	`epubUrl` text,
	`pdfKey` varchar(512),
	`epubKey` varchar(512),
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `production_jobs_id` PRIMARY KEY(`id`)
);

CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`author` varchar(255),
	`genre` varchar(128),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `step_statuses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`stepId` varchar(64) NOT NULL,
	`status` enum('pending','complete','skipped') NOT NULL DEFAULT 'pending',
	`notes` text,
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `step_statuses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uploaded_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`stepId` varchar(64) NOT NULL,
	`inputName` varchar(255) NOT NULL,
	`fileName` varchar(512) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`mimeType` varchar(128),
	`fileSize` bigint,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `uploaded_files_id` PRIMARY KEY(`id`)
);

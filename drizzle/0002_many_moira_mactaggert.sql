CREATE TABLE `phase_due_dates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`phaseId` varchar(64) NOT NULL,
	`dueDate` bigint NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `phase_due_dates_id` PRIMARY KEY(`id`)
);

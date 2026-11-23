CREATE TABLE `clicks` (
	`id` integer PRIMARY KEY NOT NULL,
	`link_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`country` text,
	`region` text,
	`city` text,
	`referrer` text,
	`browser` text,
	`os` text,
	`device` text,
	`bot` integer DEFAULT false NOT NULL,
	`bot_name` text,
	FOREIGN KEY (`link_id`) REFERENCES `links`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `clicks_linkId_createdAt_id_idx` ON `clicks` (`link_id`,`created_at`,`id`);--> statement-breakpoint
CREATE INDEX `clicks_createdAt_idx` ON `clicks` (`created_at`);
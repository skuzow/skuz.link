CREATE TABLE `links` (
	`id` text PRIMARY KEY NOT NULL,
	`link` text NOT NULL,
	`redirect_url` text NOT NULL,
	`user_id` text NOT NULL,
	`clicks` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `links_link_unique` ON `links` (`link`);--> statement-breakpoint
CREATE INDEX `links_userId_idx` ON `links` (`user_id`);
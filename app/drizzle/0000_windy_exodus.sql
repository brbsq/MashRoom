CREATE TABLE `assignments` (
	`course_id` text NOT NULL,
	`id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`due` text,
	`url` text NOT NULL,
	PRIMARY KEY(`course_id`, `id`)
);
--> statement-breakpoint
CREATE TABLE `connections` (
	`user_id` text PRIMARY KEY NOT NULL,
	`access` text NOT NULL,
	`refresh` text,
	`expires` integer NOT NULL,
	`scope` text NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`section` text,
	`imported_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `members` (
	`course_id` text NOT NULL,
	`google_id` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	PRIMARY KEY(`course_id`, `google_id`)
);
--> statement-breakpoint
CREATE TABLE `oauth_flows` (
	`id` text PRIMARY KEY NOT NULL,
	`verifier` text NOT NULL,
	`purpose` text NOT NULL,
	`user_id` text,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`google_id` text NOT NULL,
	`name` text NOT NULL,
	`pet` text,
	`adopted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_google_id_unique` ON `users` (`google_id`);
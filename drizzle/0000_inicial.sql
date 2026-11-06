CREATE TABLE `catedras` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`materia_id` integer NOT NULL,
	`nombre` text NOT NULL,
	`detalle` text,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`materia_id`) REFERENCES `materias`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `catedras_materia_nombre_uq` ON `catedras` (`materia_id`,`nombre`);--> statement-breakpoint
CREATE TABLE `charlas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`titulo` text NOT NULL,
	`tipo` text DEFAULT 'Charla' NOT NULL,
	`tematica` text,
	`descripcion` text NOT NULL,
	`oradores` text DEFAULT '[]' NOT NULL,
	`fecha` text NOT NULL,
	`hora` text,
	`lugar` text NOT NULL,
	`modalidad` text DEFAULT 'Presencial' NOT NULL,
	`imagen` text,
	`inscripcion_url` text,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `charlas_slug_unique` ON `charlas` (`slug`);--> statement-breakpoint
CREATE TABLE `interuca` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`anio` integer NOT NULL,
	`disciplina` text NOT NULL,
	`rama` text,
	`equipo` text,
	`resultado` text NOT NULL,
	`resultado_detalle` text,
	`descripcion` text,
	`destacado` integer DEFAULT false NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `interuca_anio_idx` ON `interuca` (`anio`);--> statement-breakpoint
CREATE TABLE `interuca_fotos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`participacion_id` integer NOT NULL,
	`archivo` text NOT NULL,
	`orden` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`participacion_id`) REFERENCES `interuca`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `logro_imagenes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`logro_id` integer NOT NULL,
	`archivo` text NOT NULL,
	`orden` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`logro_id`) REFERENCES `logros`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `logros` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`titulo` text NOT NULL,
	`descripcion` text NOT NULL,
	`fecha` text NOT NULL,
	`area` text,
	`destacado` integer DEFAULT false NOT NULL,
	`orden` integer DEFAULT 0 NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `materiales` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`titulo` text NOT NULL,
	`descripcion` text,
	`tipo` text DEFAULT 'Resumen' NOT NULL,
	`materia_id` integer NOT NULL,
	`catedra_id` integer,
	`archivo` text NOT NULL,
	`archivo_nombre` text NOT NULL,
	`archivo_tipo` text NOT NULL,
	`archivo_tamano` integer NOT NULL,
	`fecha` text NOT NULL,
	`creado_por` integer,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`materia_id`) REFERENCES `materias`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`catedra_id`) REFERENCES `catedras`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`creado_por`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `materiales_materia_idx` ON `materiales` (`materia_id`);--> statement-breakpoint
CREATE INDEX `materiales_catedra_idx` ON `materiales` (`catedra_id`);--> statement-breakpoint
CREATE TABLE `materias` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`slug` text NOT NULL,
	`anio` integer,
	`descripcion` text,
	`imagen` text,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `materias_nombre_unique` ON `materias` (`nombre`);--> statement-breakpoint
CREATE UNIQUE INDEX `materias_slug_unique` ON `materias` (`slug`);--> statement-breakpoint
CREATE TABLE `miembros` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`cargo` text NOT NULL,
	`area` text,
	`descripcion` text,
	`foto` text,
	`orden` integer DEFAULT 0 NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `noticias` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`titulo` text NOT NULL,
	`categoria` text DEFAULT 'Institucional' NOT NULL,
	`resumen` text NOT NULL,
	`contenido` text NOT NULL,
	`portada` text,
	`fecha` text NOT NULL,
	`estado` text DEFAULT 'borrador' NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `noticias_slug_unique` ON `noticias` (`slug`);--> statement-breakpoint
CREATE TABLE `sesiones` (
	`id` text PRIMARY KEY NOT NULL,
	`usuario_id` integer NOT NULL,
	`expira_en` integer NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sesiones_usuario_idx` ON `sesiones` (`usuario_id`);--> statement-breakpoint
CREATE TABLE `usuarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`nombre` text NOT NULL,
	`password_hash` text NOT NULL,
	`rol` text DEFAULT 'estudiante' NOT NULL,
	`ultimo_ingreso` integer,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`actualizado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_email_unique` ON `usuarios` (`email`);
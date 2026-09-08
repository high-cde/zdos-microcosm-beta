CREATE TABLE `evidence_receipts` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `eventId` varchar(128) NOT NULL,
  `operation` varchar(128) NOT NULL,
  `status` varchar(32) NOT NULL,
  `detail` text NOT NULL,
  `ztrace` varchar(32),
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `evidence_receipts_id` PRIMARY KEY(`id`)
);

CREATE INDEX `evidence_receipts_user_created_idx` ON `evidence_receipts` (`userId`,`createdAt`);
CREATE UNIQUE INDEX `evidence_receipts_user_event_idx` ON `evidence_receipts` (`userId`,`eventId`);

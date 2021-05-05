-- ---
-- Globals
-- ---

-- SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
-- SET FOREIGN_KEY_CHECKS=0;

-- ---
-- Table 'Questions'
--
-- ---

DROP TABLE IF EXISTS `Questions`;

CREATE TABLE `Questions` (
  `product_id` INTEGER NOT NULL AUTO_INCREMENT DEFAULT 0,
  `question_id` INTEGER NOT NULL AUTO_INCREMENT DEFAULT 0,
  `question_body` VARCHAR(255) NULL AUTO_INCREMENT DEFAULT NULL,
  `question_date` DATETIME NULL DEFAULT NULL,
  `asker_name` VARCHAR(80) NULL DEFAULT NULL,
  `question_helpfulness` INTEGER NOT NULL AUTO_INCREMENT DEFAULT 0,
  `reported` BINARY NOT NULL DEFAULT '0',
  PRIMARY KEY (`question_id`)
);

-- ---
-- Table 'Answers'
--
-- ---

DROP TABLE IF EXISTS `Answers`;

CREATE TABLE `Answers` (
  `question_id` INTEGER NOT NULL AUTO_INCREMENT DEFAULT 0,
  `id` INTEGER NOT NULL DEFAULT NULL,
  `body` VARCHAR(255) NULL DEFAULT NULL,
  `date` DATETIME NULL DEFAULT NULL,
  `answerer_name` VARCHAR(80) NULL DEFAULT NULL,
  `helpfulness` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'Photos'
--
-- ---

DROP TABLE IF EXISTS `Photos`;

CREATE TABLE `Photos` (
  `answer_id` INTEGER NOT NULL AUTO_INCREMENT DEFAULT 0,
  `photo_id` INTEGER NOT NULL AUTO_INCREMENT DEFAULT 0,
  `photo_url` VARCHAR(255) NULL,
  PRIMARY KEY (`photo_id`)
);

-- ---
-- Table 'Product'
--
-- ---

DROP TABLE IF EXISTS `Product`;

CREATE TABLE `Product` (
  `product_id` INTEGER NOT NULL AUTO_INCREMENT DEFAULT 0,
  PRIMARY KEY (`product_id`)
);

-- ---
-- Foreign Keys
-- ---

ALTER TABLE `Questions` ADD FOREIGN KEY (product_id) REFERENCES `Product` (`product_id`);
ALTER TABLE `Answers` ADD FOREIGN KEY (question_id) REFERENCES `Questions` (`question_id`);
ALTER TABLE `Photos` ADD FOREIGN KEY (answer_id) REFERENCES `Answers` (`id`);

-- ---
-- Table Properties
-- ---

-- ALTER TABLE `Questions` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `Answers` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `Photos` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `Product` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ---
-- Test Data
-- ---

-- INSERT INTO `Questions` (`product_id`,`question_id`,`question_body`,`question_date`,`asker_name`,`question_helpfulness`,`reported`) VALUES
-- ('','','','','','','');
-- INSERT INTO `Answers` (`question_id`,`id`,`body`,`date`,`answerer_name`,`helpfulness`) VALUES
-- ('','','','','','');
-- INSERT INTO `Photos` (`answer_id`,`photo_id`,`photo_url`) VALUES
-- ('','','');
-- INSERT INTO `Product` (`product_id`) VALUES
-- ('');
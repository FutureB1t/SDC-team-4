-- ---
-- Globals
-- ---

-- SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
-- SET FOREIGN_KEY_CHECKS=0;

-- ---
-- Table 'Questions'
--
-- ---

DROP TABLE IF EXISTS Questions;

CREATE TABLE Questions (
  question_id SERIAL,
  product_id INTEGER NOT NULL DEFAULT 0,
  body VARCHAR(500) NULL DEFAULT NULL,
  date_written BIGINT NULL DEFAULT 0,
  asker_name VARCHAR(80) NULL DEFAULT NULL,
  asker_email VARCHAR(80) NULL DEFAULT NULL,
  reported INTEGER NOT NULL DEFAULT 0,
  helpful INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (question_id)
);

-- ---
-- Table 'Answers'
--
-- ---

DROP TABLE IF EXISTS Answers;

CREATE TABLE Answers (
  answer_id SERIAL,
  question_id INTEGER NOT NULL DEFAULT 0,
  body VARCHAR(500) NULL DEFAULT NULL,
  date BIGINT NULL DEFAULT NULL,
  answerer_name VARCHAR(80) NULL DEFAULT NULL,
  answerer_email VARCHAR(80) NULL DEFAULT NULL,
  reported INTEGER NOT NULL DEFAULT 0,
  helpfulness INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (answer_id)
);

-- ---
-- Table 'Photos'
--
-- ---

DROP TABLE IF EXISTS Photos;

CREATE TABLE Photos (
  photo_id SERIAL,
  answer_id INTEGER NOT NULL DEFAULT 0,
  url VARCHAR(255) NULL,
  PRIMARY KEY (photo_id)
);

-- ---
-- Table 'Product'
--
-- ---

DROP TABLE IF EXISTS Product;

CREATE TABLE Product (
  product_id SERIAL,
  name VARCHAR(80) NOT NULL,
  slogan VARCHAR(400) NULL,
  description VARCHAR(600),
  category VARCHAR(80),
  default_price INTEGER DEFAULT 0,
  PRIMARY KEY (product_id)
);

-- ---
-- Foreign Keys
-- ---

ALTER TABLE Questions ADD FOREIGN KEY (product_id) REFERENCES Product (product_id);
ALTER TABLE Answers ADD FOREIGN KEY (question_id) REFERENCES Questions (question_id);
ALTER TABLE Photos ADD FOREIGN KEY (answer_id) REFERENCES Answers (answer_id);

-- ---
-- Table Properties\l
-- ---

-- ALTER TABLE Questions ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE Answers ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE Photos ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE Product ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ---
-- Test Data
-- ---

INSERT INTO Product (product_id,name,slogan,description,category,default_price) VALUES
(-420,'Dope Hoodie','Even doper now','simply the dopest','hoodies',3000);
INSERT INTO Questions (product_id,question_id,body,date_written,asker_name,asker_email,reported,helpful) VALUES
(-420,-1017,'question?',1599958385988,'seller','seller@email.com',0,3);
INSERT INTO Answers (question_id,answer_id,body,date,answerer_name,answerer_email,reported,helpfulness) VALUES
(-1017,-6969,'hey this is an answer',1599958385988,'johnnyB','jb@email.com',0,5);
INSERT INTO Photos (answer_id,photo_id,url) VALUES
(-6969,-1337,'radical_photo_url');

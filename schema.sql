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
-- Indexes
-- ---
-- DROP INDEX IF EXISTS photo_id_index;
-- DROP INDEX IF EXISTS answer_id_index;
-- DROP INDEX IF EXISTS question_id_index;

CREATE INDEX CONCURRENTLY photo_id_index ON photos USING HASH (photo_id);
CREATE INDEX CONCURRENTLY answer_id_index ON answers USING HASH (answer_id);
CREATE INDEX CONCURRENTLY question_id_index ON questions USING HASH (question_id);

-- ---
-- Table Properties
-- ---

-- ALTER TABLE Questions ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE Answers ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE Photos ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE Product ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ---
-- Test Data
-- ---

INSERT INTO Product (product_id,name,slogan,description,category,default_price) VALUES
(1,'Dope Hoodie','Even doper now','simply the dopest','hoodies',3000);
INSERT INTO Questions (product_id,question_id,body,date_written,asker_name,asker_email,reported,helpful) VALUES
(1,1,'question?',1599958385988,'seller','seller@email.com',0,3);
INSERT INTO Answers (question_id,answer_id,body,date,answerer_name,answerer_email,reported,helpfulness) VALUES
(1,1,'hey this is an answer',1599958385988,'johnnyB','jb@email.com',0,5);
INSERT INTO Photos (answer_id,photo_id,url) VALUES
(1,1,'radical_photo_url');

-- ---
-- INITIALIZE SERIALIZATION
-- ---

SELECT setval(pg_get_serial_sequence('questions', 'question_id'), coalesce(max(question_id)+1, 1), false) FROM questions;
SELECT setval(pg_get_serial_sequence('answers', 'answer_id'), coalesce(max(answer_id)+1, 1), false) FROM answers;
SELECT setval(pg_get_serial_sequence('photos', 'photo_id'), coalesce(max(photo_id)+1, 1), false) FROM photos;

-- ---
-- SEED DATA
-- ---

COPY product FROM '/Users/curtiscastro/work/Projects/SDC-team-4/QA/product.csv' DELIMITER ',' CSV HEADER;
COPY questions FROM '/Users/curtiscastro/work/Projects/SDC-team-4/QA/questions.csv' DELIMITER ',' CSV HEADER;
COPY answers FROM '/Users/curtiscastro/work/Projects/SDC-team-4/QA/answers.csv' DELIMITER ',' CSV HEADER;
COPY photos FROM '/Users/curtiscastro/work/Projects/SDC-team-4/QA/answers_photos.csv' DELIMITER ',' CSV HEADER;
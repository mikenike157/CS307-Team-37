-- To run:
-- start mysql connection as a user that can create databases
-- type the following:
-- \. sql/init_db.sql

CREATE DATABASE PokerUniversity;
USE PokerUniversity;

CREATE TABLE Users (
  user_id INT UNIQUE NOT NULL AUTO_INCREMENT,
  username VARCHAR(40) UNIQUE NOT NULL,
  password BLOB NOT NULL, -- argon2 hash?
  security_question VARCHAR(100) NOT NULL,
  security_answer VARCHAR(100) NOT NULL,
  profile_picture BLOB,
  chips INT NOT NULL,
  PRIMARY KEY (user_id),
  INDEX username_index (username)
);

CREATE TABLE Games (
  game_id INT UNIQUE NOT NULL AUTO_INCREMENT,
  name VARCHAR(50),
  game_mode ENUM('tutorial', 'practice', 'ranked') NOT NULL,
  ante_amount INT NOT NULL,
  small_blind_amount INT NOT NULL,
  big_blind_amount INT NOT NULL,
  hints_allowed BOOL,
  PRIMARY KEY (game_id)
);

CREATE TABLE GameLog (
  game_log_id INT UNIQUE NOT NULL AUTO_INCREMENT,
  game_id INT NOT NULL,
  action INT NOT NULL,
  user_id INT,
  bot_name VARCHAR(40),
  data TEXT,
  PRIMARY KEY (game_log_id),
  FOREIGN KEY (game_id) REFERENCES Games(game_id),
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON DELETE SET NULL
);

CREATE TABLE FriendList (
  sender INT NOT NULL,
  recipient INT NOT NULL,
  accepted BOOL,
  FOREIGN KEY (sender) REFERENCES Users(user_id)
    ON DELETE CASCADE,
  FOREIGN KEY (recipient) REFERENCES Users(user_id)
    ON DELETE CASCADE
);

CREATE TABLE MuteList (
  sender INT NOT NULL,
  recipient INT NOT NULL,
  FOREIGN KEY (sender) REFERENCES Users(user_id)
    ON DELETE CASCADE,
  FOREIGN KEY (recipient) REFERENCES Users(user_id)
    ON DELETE CASCADE
);

CREATE TABLE BanList (
  ban_id INT UNIQUE NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  reason TEXT,
  expiry DATE,
  type ENUM('ban', 'silence'),
  PRIMARY KEY (ban_id),
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON DELETE CASCADE
);

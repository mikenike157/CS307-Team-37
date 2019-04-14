-- To run:
-- start postgresql connection on an empty database
-- type the following:
-- \i sql/init_db.sql

CREATE TYPE GameMode AS ENUM ('tutorial', 'practice', 'ranked');
CREATE TYPE BanType AS ENUM ('ban', 'silence');

CREATE TABLE Users (
  user_id BIGSERIAL UNIQUE NOT NULL,
  username VARCHAR(40) UNIQUE NOT NULL,
  password TEXT NOT NULL, -- argon2 hash?
  security_question VARCHAR(100) NOT NULL,
  security_answer TEXT NOT NULL, -- changed to be an argon2 hash too
  profile_picture BYTEA,
  chips INT NOT NULL,
  is_admin BOOL,
  num_wins INT DEFAULT 0,
  PRIMARY KEY (user_id)
);

CREATE INDEX UsernameIndex ON Users (username);

CREATE TABLE Games (
  game_id BIGSERIAL UNIQUE NOT NULL,
  name VARCHAR(50),
  game_mode GameMode NOT NULL,
  ante_amount INT NOT NULL,
  small_blind_amount INT NOT NULL,
  big_blind_amount INT NOT NULL,
  hints_allowed BOOL,
  PRIMARY KEY (game_id)
);

CREATE TABLE GameLog (
  game_log_id BIGSERIAL UNIQUE NOT NULL,
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
    ON DELETE CASCADE,
  UNIQUE (sender, recipient)
);

CREATE TABLE MuteList (
  sender INT NOT NULL,
  recipient INT NOT NULL,
  FOREIGN KEY (sender) REFERENCES Users(user_id)
    ON DELETE CASCADE,
  FOREIGN KEY (recipient) REFERENCES Users(user_id)
    ON DELETE CASCADE,
  UNIQUE (sender, recipient)
);

CREATE TABLE BanList (
  ban_id BIGSERIAL UNIQUE NOT NULL,
  user_id INT NOT NULL,
  reason TEXT,
  expiry TIMESTAMP,
  issuer_id INT,
  type BanType,
  PRIMARY KEY (ban_id),
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON DELETE CASCADE,
  FOREIGN KEY (issuer_id) REFERENCES Users(user_id)
    ON DELETE CASCADE
);

const argon2 = require("argon2");

const DEFAULT_CHIPS = 100;

/*
  userinfo is an object with the following fields:
  * username: username
  * password: password (raw)
  * securityQuestion: security question
  * securityAnswer: answer to question
*/


async function getRooms(client) {
  const res = await client.query("SELECT * FROM Games");
  console.log(res);
  return res;
}

async function leaderBoards(client) {

  const res = await client.query(
    "SELECT * from Users ORDER BY numWins  LIMIT 100;"
  )
  let retArray = [];

  for (let i = 0; i < res.rows.length; i++) {

  }

  return {

  }

}

async function createUser(client, userinfo) {
  if (userinfo.username === "" || userinfo.password === ""){
      throw new Error("empty username or password");
  }

  //console.log(userinfo);

  const userCheck = await client.query(
    "SELECT user_id FROM Users WHERE username = $1;",
    [userinfo.username]
  );

  if (userCheck.rows.length != 0) {
    return false;
  }

  const hash = await argon2.hash(userinfo.password, {
    type: argon2.argon2i
  });
  const securityAnswerHash = await argon2.hash(userinfo.securityAnswer, {
    type: argon2.argon2i
  });
  const res = await client.query(
    "INSERT INTO Users (username, password, security_question, security_answer, chips) VALUES ($1, $2, $3, $4, $5) RETURNING user_id;",
    [userinfo.username, hash, userinfo.securityQuestion, userinfo.securityAnswer, DEFAULT_CHIPS]);

  // I don't know why someone changed this to return the username and password
  // as well. These are already known to the caller!
  return {
    userId: res.rows[0]["user_id"],
    username: userinfo.username,
  }
}

async function getSecurityQuestion(client, username) {
  try {
    if (username === "") {
      throw new Error("empty username");
    }
  } catch (err) {
    return undefined;
  }
  let authRes = [];

  try {
    authRes = await client.query(
      "SELECT security_question, security_answer FROM Users WHERE Users.username = $1",
      [username]
    );
    if (authRes === undefined) {
      throw "Query unsuccessful";
    }
  } catch (err) {
    return userID;
  }
  if (authRes.rows.length == 0) {
    return {
      question: undefined,
      reason: "Username Incorrect"
    };
  }
  return {
    question: authRes.rows[0]["security_question"],
    answer: authRes.rows[0]["security_answer"]
  }
}

async function updateWin(client, userid) {
  console.log(userid);
  const res = await client.query(
    "UPDATE Users SET num_wins = num_wins + 1 WHERE user_id = $2;",
    [userid]
  );
  if (res.rowCount == 0) {
    throw "user not found";
  }
  return {
    numWins: res.rows[0]["num_wins"]
  };
}

async function updateChips(client, userid, chips) {
  // console.log(userid);
  const res = await client.query(
    "UPDATE Users SET chips = chips + $1 WHERE user_id = $2;",
    [chips, userid]
  );
  if (res.rowCount == 0) {
    throw "user not found";
  }
  console.log(res);
}

/*
  returns an object with the following fields if successfully logged in:
  * userId: user id
  returns an object with the following fields if not successful:
  * userId: undefined
  * reason: string
*/
async function validateUser(client, username, password) {
  console.log("validateUser");
  // Check if username and password are valid
  if (username === "" || password === ""){
    return {
      userId: undefined,
      reason: "Username and password must not be empty",
    };
  }
  let authRes = [];
  try {
    authRes = await client.query(
      "SELECT user_id, password FROM Users WHERE Users.username = $1",
      [username]
    );
    if (authRes === undefined) {
      throw "Query unsuccessful";
    }
  } catch (err) {
    // console.log(err);
    return {
      userId: undefined,
      reason: "Cannot connect to database",
    };
  }
  if (authRes.rows.length == 0 || !await argon2.verify(authRes.rows[0]["password"].toString(), password)) {
    return {
      userId: undefined,
      reason: "Username or password is incorrect"
    };
  }
  // Check if user is not banned
  const banRes = await client.query(
    "SELECT reason FROM BanList WHERE user_id = $1 AND (expiry IS NULL OR expiry > NOW()) and type = 'ban'",
    [authRes.rows[0]["user_id"]]
  );
  if (banRes.rows.length != 0) {
    return {
      userId: undefined,
      reason: "Banned: " + banRes.rows[0]["reason"]
    };
  }

  return {
    // returns user info for session purposes
    userId: authRes.rows[0]["user_id"],
    username: username,
  };
}

/*
  returns the number of chips held by a user (by id);
  throws if user is not found
*/
async function getChipCount(client, id) {
  const res = await client.query(
    "SELECT chips FROM Users WHERE user_id = $1",
    [id]
  );
  if (res.rows.length == 0) throw "User not found";
  let updatedChips = res.rows[0]["chips"];
  // console.log(updatedChips);
  return {
    newChipCount: updatedChips
  }
}

async function profileQuery(client, id) {
  const res = await client.query(
    "SELECT chips, num_wins FROM Users WHERE user_id = $1",
    [id]
  );
  if (res.rows.length == 0) throw "USER NOT FOUND";
  let numChips = res.rows[0]["chips"];
  let numWins = res.rows[0]["num_wins"];
  // console.log(numChips + " " + numWins);
  if (numWins == null) {
    numWins = 0;
  }
  return {
    numWins: numWins,
    numChips: numChips
  }
}

/*
  checks if user has enough chips; deducts that number if enough
  returns true if succeeded, false if failed
  throws if user is not found
*/
async function deductChips(client, id, amount) {
  try {
    const res1 = await client.query(
      "BEGIN;" +
      "  SELECT chips FROM Users WHERE user_id = $1 AND CHIPS >= $2",
      [id, amount]
    );
    if (res1.rows.length == 0) {
      await client.query("ROLLBACK");
      return false;
    }
    await client.query(
      "  UPDATE Users SET chips = chips - $2" +
      "    WHERE user_id = $1 AND chips >= $2;",
      [id, amount]
    );
    await client.query("COMMIT");
    return true;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }
}

/*
  updates username of user #id
  throws if user is not found
*/
async function updateUsername(client, id, newUsername) {
  const res = await client.query(
    "UPDATE Users SET username = $1 WHERE user_id = $2;",
    [newUsername, id]
  );
  if (res.rowCount == 0) {
    throw "user not found";
  }
  return true;
}

async function updatePassword(client, username, newPass) {
  // console.log(username);
  const hash = await argon2.hash(newPass, {
    type: argon2.argon2i
  });
  const res = await client.query(
    "UPDATE Users SET password = $1 WHERE username = $2;",
    [hash, username]
  );
  // console.log(res);
  if (res.rowCount == 0) {
    return {
      validate: false,
    }
  }
  return {
    validate: true,
  }
}

async function getUserIdByUsername(client, username) {
  const res = await client.query(
    "SELECT user_id FROM Users WHERE username = $1;",
    [username]
  );
  if (res.rowCount == 0) throw new Error("No such user " + username);
  return +res.rows[0]["user_id"];
}

async function validateSecurityQuestion(client, username, answer) {
  // console.log(answer);
  let authRes;
  authRes = await client.query(
  "SELECT security_answer FROM Users WHERE Users.username = $1",
    [username]
  );
  // console.log(authRes);
  if (authRes.rows.length == 0 ||
      !await argon2.verify(authRes.rows[0]["security_answer"].toString(), answer)) {
    return {
      validate: false
    }
  }
  return {
    validate: true
  }
}

async function getLeaderboardChips(client) {
  const res = await client.query(
    "SELECT (user_id, username, chips) FROM Users\n" +
    "ORDER BY chips DESC\n" +
    "LIMIT 100;"
  );
  return res.rows;
}

async function getLeaderboardWins(client) {
  const res = await client.query(
    "SELECT (user_id, username, num_wins) FROM Users\n" +
    "ORDER BY num_wins DESC\n" +
    "LIMIT 100;"
  );
  return res.rows;
}

async function getLeaderboardPercentage(client) {
  const res = await client.query(
    "SELECT (user_id, username, ROUND(CAST(num_wins as decimal)/games_played, 2)) FROM Users\n" +
    "WHERE games_played != 0 ORDER BY (num_wins/games_played) * 100 DESC\n" +
    "LIMIT 100;"
  );
  return res.rows;
}



async function getProfilePicture(client, userId) {
  const res = await client.query(
    "SELECT profile_picture FROM Users WHERE user_id = $1",
    [userId]
  );
  if (res.rows.length == 0) {
    return null;
  }
  return res.rows[0]["profile_picture"];
}

async function setProfilePicture(client, userId, pic) {
  const res = await client.query(
    "UPDATE Users SET profile_picture = $1 WHERE user_id = $2",
    [pic, userId]
  );
  if (res.rowCount == 0) {
    return false;
  }
  return true;
}

/*
  return a list of objects as such:
  {
    "id": (user id),
    "username": (user name),
  }
*/
async function getAllFriends(client, userId) {
  const res = await client.query(
    "WITH Friends AS (\n" +
    "SELECT recipient AS user_id FROM FriendList WHERE sender = $1 AND accepted UNION\n" +
    "SELECT sender AS user_id FROM FriendList WHERE recipient = $1 AND accepted)\n" +
    "SELECT Users.user_id AS id, Users.username AS username\n" +
    "FROM Users JOIN Friends ON Users.user_id = Friends.user_id;",
    [userId]
  );
  console.log(res);
  return res.rows;
}

/*
  add a friend request from user #`from` to user #`to` that is not yet accepted
*/
async function requestFriend(client, from, to) {
  if (from == to)
    throw new Error("Cannot be friends with self!");
  const res = await client.query(
    "INSERT INTO FriendList (sender, recipient, accepted)\n" +
    "VALUES ($1, $2, FALSE);",
    [from, to]
  );
  return true;
}

/*
  get a list of all pending friend requests to user #`to`
*/
async function getIncomingFriendRequests(client, to) {
  const res = await client.query(
    "WITH Friends AS (\n" +
    "SELECT sender AS user_id FROM FriendList WHERE recipient = $1 AND NOT accepted)\n" +
    "SELECT Users.user_id AS id, Users.username AS username\n" +
    "FROM Users JOIN Friends ON Users.user_id = Friends.user_id;",
    [to]
  );
  return res.rows;
}

async function acceptFriendRequest(client, from, to) {
  const res = await client.query(
    "UPDATE FriendList SET accepted = TRUE\n" +
    "WHERE sender = $1 AND recipient = $2 AND NOT accepted;",
    [from, to]
  );
  if (res.rowCount == 0) throw new Error("No such pending friend request");
}

async function deleteUser(client, id) {
  const res = await client.query(
    "DELETE FROM Users WHERE user_id = $1",
    [id]
  );
  if (res.rowCount == 0) throw new Error("No such user");
}

async function setMute(client, sender, recipient, value) {
  if (value) {
    await client.query(
      "INSERT INTO MuteList (sender, recipient) VALUES ($1, $2)\n" +
      "ON CONFLICT  DO NOTHING;",
      [sender, recipient]
    );
  } else {
    await client.query(
      "DELETE FROM MuteList WHERE sender = $1 AND recipient = $2;",
      [sender, recipient]
    );
  }
}

async function setMuteName(client, sender, recipient, value) {
  await setMute(
    client,
    await getUserIdByUsername(client, sender),
    await getUserIdByUsername(client, recipient),
    value);
}

async function isMuted(client, sender, recipient) {
  const res = await client.query(
    "SELECT * FROM MuteList WHERE sender = $1 AND recipient = $2;",
    [sender, recipient]
  );
  return res.rowCount != 0;
}

async function getLeaderboardChips(client) {
  const res = await client.query(
    "SELECT (user_id, username, chips) FROM Users\n" +
    "ORDER BY chips DESC\n" +
    "LIMIT 100;"
  );
  return res.rows;
}

async function getLeaderboardWins(client) {
  const res = await client.query(
    "SELECT (user_id, username, num_wins) FROM Users\n" +
    "ORDER BY num_wins DESC\n" +
    "LIMIT 100;"
  );
  return res.rows;
}

async function setAdmin(client, user, value) {
  console.log("FROM SET ADMIN: " + user + " " + value)
  const res = await client.query(
    "UPDATE Users SET is_admin = $1 WHERE user_id = $2",
    [value, user]
  );
  console.log(res.rows[0]);
  if (res.rowCount == 0) {
    throw "user not found";
  }
  console.log(res.rows[0][is_admin]);
  return res.rows[0]["is_admin"]
}

async function isAdmin(client, user) {
  const res = await client.query(
    "SELECT is_admin FROM Users WHERE user_id = $1",
    [user]
  );
  if (res.rowCount == 0) throw new Error("Nonexistent user");
  return res.rows[0]["is_admin"];
}

/*
  bans or silences a user
  client - PG client
  sender - user id of who issues the ban
  recipient - user id of who is banned
  reason - reason given to user,
  expiry - when it expires (null for permanent)
  type - 'ban' for ban; 'silence' for silence
*/
async function banUser(client, sender, recipient, reason, expiry, type) {
  console.log("IN BAN USER");
  await client.query("BEGIN;");
  try {
    if (!await isAdmin(client, sender)) {
      console.log("HERE")
      throw new Error("Only admins can ban or silence");
    }
    console.log("executing query");
    const res = await client.query(
      "INSERT INTO BanList (user_id, reason, expiry, issuer_id, type)\n" +
      "VALUES ($1, $2, $3, $4, $5)",
      [recipient, reason, expiry, sender, type]
    );
    console.log(res)
    await client.query("COMMIT;");
  } catch (e) {
    console.log(e)
    await client.query("ROLLBACK");
    throw e;
  }
}

async function updateStatus(client, id, status) {
  const res = await client.query(
    "UPDATE Users SET status = $1 where user_id = $2",
    [status, id]
  )
  if (res.countRows == 0) {
    throw new Error("User nonexistent");
  }
  return res.rows[0]["status"];
}

/*
  return a list of objects:
  - id: id of ban
  - sender: user id of the user who banned the recipient
  - reason: reason provided
  - expiry: timestamp or null if permanent
  - type: 'ban' or 'silence'
*/
async function getBans(client, recipient, onlyBans) {
  const res = await client.query(
    "SELECT ban_id AS id, issuer_id AS sender, reason, expiry, type FROM BanList\n" +
    "WHERE user_id = $1 AND (expiry IS NULL OR expiry > NOW())\n" +
    (onlyBans ? "AND type = 'ban';" : ";"),
    [recipient]
  );
  return res.rows;
}

async function removeBan(client, banId) {
  await client.query(
    "DELETE FROM BanList WHERE ban_id = $1",
    [banId]
  );
}

async function updateGameNum(client, id) {
  console.log("FROM TRANSACTION: " + id);
  const res = await client.query(
    "UPDATE Users SET games_played = (games_played + 1) WHERE user_id = $1",
    [id]
  );
  console.log(res.rows);
}


module.exports = {
  createUser: createUser,
  validateUser: validateUser,
  getChipCount: getChipCount,
  deductChips: deductChips,
  updateUsername: updateUsername,
  getUserIdByUsername: getUserIdByUsername,
  validateSecurityQuestion: validateSecurityQuestion,
  getSecurityQuestion: getSecurityQuestion,
  updatePassword: updatePassword,
  updateChips: updateChips,
  profileQuery: profileQuery,
  getProfilePicture: getProfilePicture,
  setProfilePicture: setProfilePicture,
  getAllFriends: getAllFriends,
  requestFriend: requestFriend,
  getIncomingFriendRequests: getIncomingFriendRequests,
  acceptFriendRequest: acceptFriendRequest,
  deleteUser: deleteUser,
  setMute: setMute,
  isMuted: isMuted,
  getLeaderboardChips: getLeaderboardChips,
  getLeaderboardWins: getLeaderboardWins,
  updateWin: updateWin,
  banUser: banUser,
  getBans: getBans,
  setAdmin: setAdmin,
  removeBan: removeBan,
  isAdmin: isAdmin,
  updateGameNum: updateGameNum,
  getLeaderboardPercentage: getLeaderboardPercentage,
  updateStatus: updateStatus,
  setMuteName: setMuteName,
};

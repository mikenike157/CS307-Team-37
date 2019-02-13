const argon2 = require("argon2");

const DEFAULT_CHIPS = 100;

/*
  userinfo is an object with the following fields:
  * username: username
  * password: password (raw)
  * securityQuestion: security question
  * securityAnswer: answer to question
*/
async function createUser(client, userinfo) {
  const hash = await argon2.hash(userinfo.password, {
    type: argon2.argon2i,
    raw: true,
  });
  const res = await client.query(
    "INSERT INTO Users (username, password, security_question, security_answer, chips, is_admin) VALUES ($1, $2, $3, $4, $5, FALSE) RETURNING user_id;",
    [userinfo.username, hash, userinfo.securityQuestion, userinfo.securityAnswer, DEFAULT_CHIPS]);
  return res.rows[0]["user_id"];
}

/*
  returns an object with the following fields if successfully logged in:
  * userId: user id
  returns an object with the following fields if not successful:
  * userId: undefined
  * reason: string
*/
async function validateUser(client, username, password) {
  // Check if username and password is valid
  const authRes = await client.query(
    "SELECT (user_id, password) FROM Users WHERE Users.username = $1;",
    [username]
  );
  if (authRes.rows.length == 0 || !await argon2.verify(authRes.rows[0]["password"], password)) {
    return {
      userId: undefined,
      reason: "Username or password is incorrect",
    };
  }
  // Check if user is not banned
  const banRes = await client.query(
    "SELECT (reason) FROM BanList WHERE user_id = $1 AND expiry > NOW and type = 'ban'",
    authRes.rows[0]["user_id"]
  );
  if (banRes.rows.length != 0) {
    return {
      userId: undefined,
      reason: "Banned: " + banRes.rows[0]["reason"]
    };
  }
  return {
    userId: authRes.rows[0]["user_id"]
  };
}

module.exports = {
  createUser: createUser,
  validateUser: validateUser,
};

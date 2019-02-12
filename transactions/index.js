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
    "INSERT INTO Users (username, password, security_question, security_answer, chips, is_admin) VALUES ($1, $2, $3, $4, $5, FALSE) RETURNING user_id",
    [userinfo.username, hash, userinfo.securityQuestion, userinfo.securityAnswer, DEFAULT_CHIPS]);
  return res.rows[0]["user_id"];
}

module.exports = {
  createUser: createUser,
};

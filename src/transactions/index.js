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

async function createUser(client, userinfo) {
  /*if (userinfo.username === "" || userinfo.password === ""){
    console.log( "empty username or password" );
    return undefined;
  }*/

  try{
    if (userinfo.username === "" || userinfo.password === ""){
       console.log( "empty username or password" );
       throw "Error";
    }
  } catch(err) {
    return false
  }

  console.log(userinfo);

  const hash = await argon2.hash(userinfo.password, {
    type: argon2.argon2i
  });

  console.log(hash);

  const res = await client.query(
    "INSERT INTO Users (username, password, security_question, security_answer, chips) VALUES ($1, $2, $3, $4, $5) RETURNING user_id;",
    [userinfo.username, hash, userinfo.securityQuestion, userinfo.securityAnswer, DEFAULT_CHIPS]);

  console.log("client released");

  return{
  //returns user info for session purposes
      userId: res.rows[0]["user_id"],
      username: res.rows[0]["username"],
      password: userinfo.password
  };
}

/*
  returns an object with the following fields if successfully logged in:
  * userId: user id
  returns an object with the following fields if not successful:
  * userId: undefined
  * reason: string
*/

async function getSecurityQuestion(client, username) {
  try {
    if (username === "") {
      throw "Error"
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
  }catch(err) {
    return userID
  }
  console.log(authRes);
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

async function validateUser(client, username, password) {
  // Check if username and password is valid

  try{
    if (username === "" || password === ""){
       console.log( "empty username or password" );
       throw "Error";

    }
  } catch(err) {
    return undefined;
  }



  console.log("begin validation");

  let authRes = [];

  try {
     authRes = await client.query(
      "SELECT user_id, password FROM Users WHERE Users.username = $1",
      [username]
    );
    if(authRes === undefined) {
      throw "Query unsuccessful";

    }
 } catch(err) {
    console.log(err);
      return {
        userId: undefined,
      };
    }
    console.log("HERE: " + authRes);
    if (authRes.rows.length == 0 || !await argon2.verify(authRes.rows[0]["password"].toString(), password)) {
      console.log("incorrect");
      return {
        userId: undefined,
        reason: "Username or password is incorrect"
      };
    }

  // Check if user is not banned
  const banRes = await client.query(
    "SELECT reason FROM BanList WHERE user_id = $1 AND expiry > NOW() and type = 'ban'",
    [authRes.rows[0]["user_id"]]
  );

  if (banRes.rows.length != 0) {
    return {
      userId: undefined,
      reason: "Banned: " + banRes.rows[0]["reason"]
    };
  }
  return {
    //returns user info for session purposes
    userId: authRes.rows[0]["user_id"],
    username: username,
    password: password
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
  return res.rows[0]["chips"];
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

module.exports = {
  createUser: createUser,
  validateUser: validateUser,
  getChipCount: getChipCount,
  deductChips: deductChips,
};

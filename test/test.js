const assert = require("assert");
const fs = require("fs");

const gameActions = require("../src/GameActions.js");
const handFinder = require("../src/handFinder.js");
const transactions = require("../src/transactions/index.js");
const pg = require("pg");

const mocha = require("mocha")

const client = new pg.Client({
  database: "poker-university-test",
});
client.connect();

async function shouldThrowException(f) {
  let ok = true;
  try {
    await f();
    ok = false;
  } catch { /* nothing */ }
  if (!ok) throw "didn't throw";
}

before(async function() {
  // Reset database
  let dropAllTables = fs.readFileSync("sql/drop_all_tables.sql", 'utf8');
  let initDb = fs.readFileSync("sql/init_db.sql", 'utf8');
  await client.query(dropAllTables);
  await client.query(initDb);
});

describe("transactions", function() {
  describe("#createUser()", function() {
    it("writes to the database", async function() {
      // Do not wrap this code in a try-catch block – this should not throw!
      let id = await transactions.createUser(client, {
        username: "uruwi",
        password: "passwordOrUruwi",
        securityQuestion: "What other name do you go by?",
        securityAnswer: "blue_bear_94",
      });
      assert(id != 0);
    });
    it("rejects duplicate usernames", async function() {
      await shouldThrowException(async function() {
        let id = await transactions.createUser(client, {
          username: "uruwi",
          password: "reject me",
          securityQuestion: "What is your favorite drink?",
          securityAnswer: "orange juice",
        });
      });
    });
    it("rejects empty usernames", async function() {
      await shouldThrowException(async function() {
        let id = await transactions.createUser(client, {
          username: "",
          password: "404",
          securityQuestion: "What is your favorite number?",
          securityAnswer: "404",
        });
      });
    });
    it("rejects empty passwords", async function() {
      await shouldThrowException(async function() {
        let id = await transactions.createUser(client, {
          username: "null",
          password: "",
          securityQuestion: "What is your favorite number?",
          securityAnswer: "404",
        });
      });
    });
  });
  describe("#validateUser()", function() {
    it("accepts a login with the correct user and pass", async function() {
      let res = await transactions.validateUser(client, "uruwi", "passwordOrUruwi");
      assert(res.userId != undefined);
    });
    it("rejects nonexistent users", async function() {
      let res = await transactions.validateUser(client, "kozet", "passwordOrUruwi");
      assert(
        res.userId == undefined &&
        res.reason == "Username or password is incorrect");
    });
    it("rejects incorrect passwords", async function() {
      let res = await transactions.validateUser(client, "uruwi", "passwordOfUruwi");
      assert(
        res.userId == undefined &&
        res.reason == "Username or password is incorrect");
    });
    // TODO: test bans
  });
  describe("#updateUsername()", function() {
    it("changes the username of an existing user", async function() {
      const id = await transactions.getUserIdByUsername(client, "uruwi");
      await transactions.updateUsername(client, id, "kozet");
      const id2 = await transactions.getUserIdByUsername(client, "kozet");
      assert(id == id2);
    });
    it("rejects nonexistent users", async function() {
      await shouldThrowException(async function() {
        await transactions.updateUsername(client, 4469, "dolphins");
      });
    })
  });
  describe("#validateSecurityQuestion()", function() {
    it("accepts the correct answer", async function() {
      const stat = await transactions.validateSecurityQuestion(client, "kozet", "blue_bear_94");
      assert(stat);
    });
    it("rejects wrong answers", async function() {
      const stat = await transactions.validateSecurityQuestion(client, "kozet", "arth_glas_94");
      assert(!stat);
    });
    it("rejects nonexistent users", async function() {
      const stat = await transactions.validateSecurityQuestion(client, "poodle", "golden retrievers");
      assert(!stat);
    });
  });
});

describe("handFinder", function() {
  describe("#finalhand", function() {
    it("has 1s in positions with cards", function() {
      const hand = [36, 27];
      const table = [41, 2, 17, 8, 38];
      const fmt = handFinder.finalhand(hand, table);
      assert(fmt[2][1] == 1);
      assert(fmt[0][2] == 1);
      assert(fmt[3][3] == 0);
    });
  });
});

//client.end();
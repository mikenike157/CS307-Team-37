const assert = require("assert");
const fs = require("fs");

const _ = require('lodash');
const display = require("../src/display.js");
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
  if (!ok) throw new Error("didn't throw");
}

function idsOnly(objs) {
  return objs.map((e) => +e.id).sort((a, b) => a - b);
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
      assert.equal(id, id2);
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
      assert(stat.validate);
    });
    it("rejects wrong answers", async function() {
      const stat = await transactions.validateSecurityQuestion(client, "kozet", "arth_glas_94");
      assert(!stat.validate);
    });
    it("rejects nonexistent users", async function() {
      const stat = await transactions.validateSecurityQuestion(client, "poodle", "golden retrievers");
      assert(!stat.validate);
    });
  });
  describe("#getProfilePicture()", function() {
    it("returns null if profile picture is not set", async function() {
      const id = await transactions.getUserIdByUsername(client, "kozet");
      const pic = await transactions.getProfilePicture(client, id);
      assert(pic == null);
    });
    it("returns the last profile picture set", async function() {
      const id = await transactions.getUserIdByUsername(client, "kozet");
      const pic = fs.readFileSync("test/boxes.png");
      const stat = await transactions.setProfilePicture(client, id, pic);
      assert(stat);
      const pic2 = await transactions.getProfilePicture(client, id);
      assert.equal(pic.compare(pic2), 0);
    });
  });
  /*
    To test the friends list, we add some new users:
    * kozet (already there)
    * rain
    * 38tacocat83
    * aaaaa
  */
  describe("#requestFriend()", function() {
    it("adds friend requests to the database", async function() {
      let id = await transactions.createUser(client, {
        username: "rain",
        password: "mevu",
        securityQuestion: "What is the word for 'rain' in Welsh?",
        securityAnswer: "glaw",
      });
      assert(id != 0);
      id = await transactions.createUser(client, {
        username: "38tacocat83",
        password: "burrito",
        securityQuestion: "Do you like tacos?",
        securityAnswer: "Of course!",
      });
      assert(id != 0);
      id = await transactions.createUser(client, {
        username: "aaaaa",
        password: "eeeee",
        securityQuestion: "Aaaaaaaah!",
        securityAnswer: "Eeeeeeeeh!",
      });
      assert(id != 0);
      const kozet = await transactions.getUserIdByUsername(client, "kozet");
      const rain = await transactions.getUserIdByUsername(client, "rain");
      const taco = await transactions.getUserIdByUsername(client, "38tacocat83");
      const aaaaa = await transactions.getUserIdByUsername(client, "aaaaa");
      await transactions.requestFriend(client, rain, kozet);
      await transactions.requestFriend(client, taco, kozet);
      await transactions.requestFriend(client, kozet, aaaaa);
      await transactions.requestFriend(client, rain, taco);
      const requestsToKozet = await transactions.getIncomingFriendRequests(client, kozet);
      const ids = idsOnly(requestsToKozet);
      assert.deepStrictEqual(ids, [rain, taco]);
    });
    it("reject friending yourself", async function() {
      shouldThrowException(async function() {
        const aaaaa = await transactions.getUserIdByUsername(client, "aaaaa");
        await transactions.requestFriend(client, aaaaa, aaaaa);
      });
    });
  });
  describe("#acceptFriendRequest", function() {
    it("registers friends", async function() {
      // Test that there are no accepted friends yet
      const kozet = await transactions.getUserIdByUsername(client, "kozet");
      const rain = await transactions.getUserIdByUsername(client, "rain");
      const friendsBeforeAccepting = await transactions.getAllFriends(client, kozet);
      assert.deepStrictEqual(friendsBeforeAccepting, []);
      // Accept friend request from rain
      await transactions.acceptFriendRequest(client, rain, kozet);
      const friendsAfterAccepting = idsOnly(await transactions.getAllFriends(client, kozet));
      assert.deepStrictEqual(friendsAfterAccepting, [rain]);
      const rainFriends = idsOnly(await transactions.getAllFriends(client, rain));
      assert.deepStrictEqual(rainFriends, [kozet]);
    });
    it("rejects accepts from nonexistent requests", async function() {
      const kozet = await transactions.getUserIdByUsername(client, "kozet");
      const rain = await transactions.getUserIdByUsername(client, "rain");
      const taco = await transactions.getUserIdByUsername(client, "38tacocat83");
      shouldThrowException(async function() {
        await transactions.acceptFriendRequest(client, taco, aaaaa);
      });
      shouldThrowException(async function() {
        await transactions.acceptFriendRequest(client, taco, rain);
      });
    });
    it("rejects accepts for requests that are already accepted", async function() {
      const kozet = await transactions.getUserIdByUsername(client, "kozet");
      const rain = await transactions.getUserIdByUsername(client, "rain");
      shouldThrowException(async function() {
        await transactions.acceptFriendRequest(client, rain, kozet);
      });
    });
  });
});

describe("handFinder", function() {
  describe("#finalhand", function() {
    it("has 1s in positions with cards", function() {
      const hand = [36, 27];
      const table = [41, 2, 17, 8, 38];
      const fmt = handFinder.finalhand(hand, table);
      assert.equal(fmt[2][1], 1);
      assert.equal(fmt[0][2], 1);
      assert.equal(fmt[3][3], 0);
    });
  });
});

describe("display", function() {
  describe("#nameCard", function() {
    it("names cards correctly", function() {
      assert.equal(display.nameCard(0), "2S");
      assert.equal(display.nameCard(5), "7S");
      assert.equal(display.nameCard(9), "JS");
      assert.equal(display.nameCard(10), "QS");
      assert.equal(display.nameCard(11), "KS");
      assert.equal(display.nameCard(12), "AS");
      assert.equal(display.nameCard(13), "2D");
      assert.equal(display.nameCard(20), "9D");
      assert.equal(display.nameCard(24), "KD");
      assert.equal(display.nameCard(26), "2C");
      assert.equal(display.nameCard(39), "2H");
      assert.equal(display.nameCard(51), "AH");
    });
  });
  describe("#namePlayerAndTableCards", function() {
    it("returns the name of all player and table cards", function() {
      const hands = [
        [36, 27],
        [11, 12],
      ];
      const table = [41, 2, 17, 8, 38];
      const actual = display.namePlayerAndTableCards(hands, table);
      const expected = [
        [
          ["QC", "3C"],
          ["KS", "AS"],
        ],
        ["4H", "4S", "6D", "10S", "AC"]
      ];
      assert.deepStrictEqual(actual, expected);
    })
  });
});

//client.end();
const { assert } = require('chai');

const { getUserObjByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserObjByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserObjByEmail("user@example.com", testUsers)
    const expectedOutput = testUsers.userRandomID;
    assert(user === expectedOutput);
  });
  it('should return undefined when the email is not in our user database', function() {
    const user2 = getUserObjByEmail("a@a.com", testUsers)
    console.log(user2);
    const expectedOutput2 = undefined;
    assert(user2 === expectedOutput2);
  });
});
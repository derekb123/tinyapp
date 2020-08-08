const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { getUserObjByEmail } = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.set('trust proxy', 1);


// Middleware
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const urlDatabase = {
  // b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  // i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" }
};

const users = {
};

//Functions
const generateRandomString = function() {
  let ranStr = Math.random().toString(36).slice(2, 8);
  return ranStr;
};

const urlsForUser = function(user_id) {
  let userURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === user_id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

//Routes
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    urls: urlDatabase,
    user: user
  };
  console.log(req.body);
  res.render("user_registration", templateVars);
});

app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    urls: urlDatabase,
    user: user
  };
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  const userCookie = req.session.user_id;
  let urls = urlsForUser(userCookie ,urlDatabase);
  console.log(urls);
  let templateVars = {
    user: user,
    userURLs : urls,
    userCookie : userCookie,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: user
  };
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const sURL = generateRandomString(); 
  urlDatabase[sURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${sURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  let userID = req.session.user_id;
  const user = users[userID];
  const shortURL = req.params.shortURL;
  let templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: user
  };

  if (urlDatabase[shortURL].userID === userID) {
    res.render("urls_show", templateVars);
  } else if (!userID) {
    res.status(400).send("You must be logged in to view this information.");
  } else if (urlDatabase[shortURL].id !== userID) {
    res.status(400).send("You can only view TinyURLs that you have created.");
  }
});


app.get("/u/:shortURL", (req, res) => {
  const fullURL = urlDatabase[req.params.shortURL].longURL;
  console.log("HERE");
  console.log(req.params.shortURL);
  res.redirect(`http://${fullURL}`);
  //res.send('OK');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  let userID = req.session.user_id;
  
  if (urlDatabase[shortURL].userID === userID) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let userID = req.session.user_id;
  if (urlDatabase[shortURL].userID === userID) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  }
});

app.post("/login", (req, res) => {
  const emailInput = req.body.email;
  const passwordInput = req.body.password;
  const userObj = getUserObjByEmail(emailInput, users);
  if (emailInput === '' || passwordInput === '') {
    res.status(400).send("User email or password invalid.");
  } else if (userObj === undefined) {
    res.status(403).send("User email has not been registered.");
  } else if (!bcrypt.compareSync(passwordInput, userObj.password)) {
    res.status(403).send("Password is incorrect.");
  } else {
    req.session.user_id = userObj.id;
    console.log(users);
    res.redirect('/urls');
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post("/register", (req, res) => {
  const ranID = generateRandomString();
  const emailInput = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (emailInput === '' || hashedPassword === '') {
    res.status(400).send("User email or password invalid.");
  } else if (getUserObjByEmail(emailInput, users)) {
    res.status(400).send("User email already registered.");
  } else {
    users[ranID] = {id: ranID, email: emailInput, password: hashedPassword};
    req.session.user_id = ranID;
    console.log(users);
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

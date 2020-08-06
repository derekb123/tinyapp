const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
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
}

function generateRandomString() {
  let ranStr = Math.random().toString(36).slice(2, 8);
  return ranStr;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const user = users[req.cookies['user_id']];
  let templateVars = { 
    urls: urlDatabase,
    userInfo: user
  };
  res.render("user_registration", templateVars);
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies['user_id']];
  let templateVars = { 
    urls: urlDatabase,
    userInfo: user
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies['user_id']];
  let templateVars = { 
    userInfo: user
  };
  res.render("urls_new", templateVars);
})

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies['user_id']];
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    userInfo: user
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  const sURL = generateRandomString(); // Log the POST request body to the console
  urlDatabase[sURL] = req.body.longURL;
  res.redirect(`/urls/${sURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const fullURL = urlDatabase[req.params.shortURL];
  console.log("HERE");
  console.log(req.params.shortURL);
  res.redirect(`http://${fullURL}`);
  //res.send('OK');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});


app.post("/urls/:shortURL", (req, res) => {
  console.log(req.body);
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  //console.log(req.body.username);
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  //console.log(req.body.username);
  res.clearCookie('username');
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const ranID = generateRandomString();
  users[ranID] = {id: ranID, email: req.body.email, password: req.body.password}
  res.cookie('user_id', ranID);
  console.log(users);
  res.redirect('/urls');
});

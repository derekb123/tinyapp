const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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

const urlsForUser = function (id, list) {
  userURLs = []
  for (item in list) {
    if (list[item].userID === id) {
      userURLs.push(list[item]);
    }
  }
  return userURLs;
}

// console.log('urlsForUser output:', urlsForUser("aJ48lW", urlDatabase)); 


// const emailCheck = function(email, list) {
//   for (item in list) {
//     if (email === list[item].email) {
//       return true;
//     }
//   }
//   return false;
// }

const emailRetrieve = function(email, list) {
  for (item in list) {
    if (email === list[item].email) {
      return list[item];
    }
  }
  return false;
}


//console.log('email check function', emailCheck("user2@example.com", users));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

/*ROUTES*/

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const user = users[req.cookies['user_id']];
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    urls: urlDatabase,
    userInfo: user
  };
  console.log(req.body);
  res.render("user_registration", templateVars);
});

app.get("/login", (req, res) => {
  const user = users[req.cookies['user_id']];
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    urls: urlDatabase,
    userInfo: user
  };
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies['user_id']];
  const userCookie = req.cookies['user_id'];
  let urls = urlsForUser(userCookie ,urlDatabase);
  let templateVars = {  
    urls: urlDatabase,
    userInfo: user,
    userURLs : urls,
    userCookie : userCookie
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies['user_id']];
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    userInfo: user
  };
  if (!req.cookies['user_id']){
    res.redirect('/login');
  } else {
      res.render("urls_new", templateVars);
  }
})

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies['user_id']];
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    userInfo: user
  };

  console.log(req.params.shortURL);
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  const sURL = generateRandomString(); // Log the POST request body to the console
  urlDatabase[sURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${sURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const fullURL = urlDatabase[req.params.shortURL].longURL;
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
  const emailInput = req.body.email;
  const pwInput = req.body.password;
  const objCheck = emailRetrieve(emailInput, users);
  if (objCheck === false ) {
    res.status(403).send("User email has not been registered.")
  } else if (objCheck.password !== pwInput){
    res.status(403).send("Email or password is incorrect.")
  } else {
  res.cookie('user_id', objCheck.id);
  console.log(users);
  res.redirect('/urls');
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.post("/register", (req, res) => {
  const ranID = generateRandomString();
  const emailInput = req.body.email;
  const pwInput = req.body.password;

  if (emailInput === '' || pwInput === '') {
    res.status(400).send("User email or password invalid.")
  }
  else if (emailRetrieve(emailInput, users)) {
    res.status(400).send("User email already registered.")
  } else {
  users[ranID] = {id: ranID, email: emailInput, password: pwInput}
  res.cookie('user_id', ranID);
  console.log(users);
  res.redirect('/urls');
  } 
});

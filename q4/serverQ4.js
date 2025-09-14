const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const app = express();
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
const PETS = path.join(__dirname, "availablePetInfo.txt");
const ACCOUNTS = path.join(__dirname, "login.txt");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {httpOnly: true}
}));

app.get('/', (req, res) => {
  res.render('home', { title: 'Home page'});
});

app.get('/home', (req, res) => {
  res.render('home', { title: 'Home page'});
});

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact us'});
});

app.get('/privacy', (req, res) => {
  res.render('privacy', { title: 'Privacy statement'});
});

app.get('/findpet', (req, res) => {
  res.render('findpet', { title: 'Find a dog/cat'});
});

app.get('/dogcare', (req, res) => {
  res.render('dogcare', { title: 'Dog care'});
});

app.get('/catcare', (req, res) => {
  res.render('catcare', { title: 'Cat care'});
});

function ensureLoggedIn(req, res, next) {
  if (req.session.loggedIn) {
    return next(); 
  } else {
    res.redirect('/login');
    return;
  }
}

app.get('/giveaway', ensureLoggedIn, (req, res) => {
  res.render('giveaway', { title: 'Giveaway pet'});
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Log in'});
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Register'});
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/home');
    }
    else{
    res.clearCookie('connect.sid');
    res.render('logout', { title: "Log out"});
    }
  });
});

app.get('/error', (req, res) => { 
  const message = req.session.errorMessage || 'Account information requirements not met.';
  const pageType = req.session.pageType;
  req.session.errorMessage = null; 
  req.session.pageType = null; 
  res.render('error', { title: 'Error', message, pageType });
});

app.post('/register', (req, res) => {
  const {username, pass} = req.body;
  const passRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{4,}$/;
  const userRegex = /^[a-zA-Z0-9]+$/;

  if (!userRegex.test(username)&&!passRegex.test(pass)) {
    req.session.errorMessage = 'Username and password do not meet requirements.';
    req.session.pageType = "registration page";
    return res.redirect('/error');
  }
  else if (!userRegex.test(pass)) {
    req.session.errorMessage = "Username must be: letters and digits";
    req.session.pageType = "registration page";
    return res.redirect('/error');
  }
  else if (!passRegex.test(pass)) {
    req.session.errorMessage = "Password must be: minimum 4 characters (letters and digits), must include 1 letter and 1 digit";
    req.session.pageType = 'registration page';
    return res.redirect('/error');
  }

  fs.readFile(ACCOUNTS, "utf8", (err, data) => {
    if (err) {
      res.status(500).send('Server error. Please try again later.');
      return;
    }

    const users = data.split('\n').filter(Boolean).map(line => line.split(':')[0]);
    if (users.includes(username)) {
      req.session.errorMessage = ('This username already exists.');
      req.session.pageType = "registration page";
      return res.redirect('/error');
    }

    const newUser = `${username}:${pass}`;
    fs.appendFile(ACCOUNTS, '\n'+newUser, (err) => {
      if (err) {
        res.status(500).send('Server error. Please try again later.');
        return;
      }
      res.redirect('/registered');
    });
  });
});

app.get('/registered', (req, res) => {
  res.render('registering', { title: 'Account created' });
});

app.post('/login', (req, res) => {
  const {username, pass} = req.body;

  fs.readFile(ACCOUNTS, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Server error. Please try again later.');
      return;
    }

    const users = data.split('\n').filter(Boolean);
    const user = users.find(line => {
      const [currentUser, currentPass] = line.split(':');
      return currentUser === username && currentPass === pass;
    });

    if (user) {
      req.session.loggedIn = true;
      req.session.username = username;
      res.redirect('/giveaway');
    } else {
      req.session.errorMessage = "This account information does not exist. Please try again.";
      req.session.pageType = "login page";
      return res.redirect('/error');
    }
  });
});

app.post('/giveaway', ensureLoggedIn, (req, res) => {

  const {
    pet, 
    breeds, 
    age, 
    gender, 
    moreDogs,
    moreCats,
    noPets,
    moreChildren,
    none,
    extraInfo, 
    ownerName,
    ownerEmail
  } = req.body;
  const username = req.session.username;

  const moreDogsVal = moreDogs==1 ? "1" : 0;
  const moreCatsVal = moreCats==1? "1": 0;
  const noPetsVal = noPets==1? 1 : "1";
  const moreChildrenVal = moreChildren==1? "1" : 0;
  const noneVal = none==1 ? "1" : 0;
  
  fs.readFile(PETS, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Server error. Please try again later.');
      return;
    }

    const lines = data.split('\n').filter(Boolean);
    const id = lines.length + 1;
    const newPet = `${id}:${username}:${pet}:${breeds}:${age}:${gender}:${moreDogsVal}:${moreCatsVal}:${noPetsVal}:${moreChildrenVal}:${noneVal}:${extraInfo=="undefined" || ""}:${ownerName || ""}:${ownerEmail || ""}\n`;
    fs.appendFile(PETS, newPet, (err) => {
      if (err) {
        res.status(500).send('Server error. Please try again later.');
        return;
      }

      res.redirect('/away-Submission');
    });
  });
});

app.get('/away-Submission', (req, res) => {
  res.render('awaySubmission', { title: 'Pet Submission success' });
});


app.post('/finding', (req, res) => {
  const {catOrDog, catDogBreeds, ageCategory, femOrMale, moreDogs, moreCats, noPets, moreChildren, none} = req.body;
  fs.readFile(PETS, "utf8", (err, data) => {
    if (err) {
      res.status(500).send('Server error. Please try again later.');
      return;
    }
    var numericAge = "";
    const pets = data.split("\n").filter(Boolean).map(line => {
      const [id, username, pet, breed, age, gender, hasDogs, hasCats, hasNoPets, hasChildren, doesntMatter, moreInfo, ownerName, ownerEmail] = line.split(':');
      numericAge = parseFloat(age);
      var ageStr = "";
      if(numericAge < 1){
         ageStr="0";
      }
      else if(numericAge >=1 && numericAge<=3){
        ageStr="1-3";
      }
      else if(numericAge >=4 && numericAge<=6){
        ageStr="4-6";
      }
      else if(numericAge >=7 && numericAge<=8){
        ageStr="7-8";
      }
      else if(numericAge >8){
        ageStr="8+";
      }

      return {
        id,
        username,
        catOrDog: pet, // catOrDog = Cat
        catDogBreeds: breed,
        ageCategory: ageStr,
        femOrMale: gender,
        moreDogs: hasDogs === "1", // moreDogs = true
        moreCats: hasCats === "1",
        noPets: hasNoPets === "1",
        moreChildren: hasChildren ==="1",
        none: doesntMatter === "1",
        moreInfo,
        ownerName,
        ownerEmail
      };
    });

    const petsFound = pets.filter(pet => {

      return (
        (pet.catOrDog === catOrDog) &&
        (catDogBreeds === "none" || pet.catDogBreeds === catDogBreeds) &&
        (ageCategory === "none" || pet.ageCategory === ageCategory) && 
        (femOrMale === "none" || pet.femOrMale === femOrMale) &&
        (moreDogs === undefined || pet.moreDogs == true) &&
        (noPets === undefined || pet.noPets == true) &&
        (moreChildren === undefined || pet.moreChildren == true) &&
        (none === undefined || pet.none == true) 
      );
      
    });

    res.render('findingMatch', { title: 'Search Results', pets: petsFound});
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

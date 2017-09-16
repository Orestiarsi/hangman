const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mustacheExpress = require('mustache-express');
const expressValidator = require('express-validator');
const fs = require('fs');
const pg = require('pg');

const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
const app = express();

app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use(expressValidator());

app.use(session({
  secret: 'cool stuff',
  resave: false,
  saveUninitialized: true
}));

let guessesLeft = 8;
const selections = [];
let guess;
let letterGuess = [];
let wordChoices = words.filter(function(word) {return word.length <= 8; });
let randomWord = wordChoices[Math.floor(Math.random() * wordChoices.length)];
let randomWordList = randomWord.split('');
let arrLength = randomWordList.length;

console.log(randomWordList);

for (let i = 0; i < randomWord.length; i++) {
  letterGuess.push('_');
}

let alreadyGuessed = false;
function checkGuess (req, res) {
 for(i = 0; i < randomWord.length; i++){
  if (guess === randomWord[i]) {
      letterGuess[i] = guess
      // console.log(letterGuess);
    }
  }

  for (let i=0; i < selections.length; i++) {
    if(guess === selections[i]) {
      alreadyGuessed = true;
    }
  }
  if (alreadyGuessed === false && randomWord.indexOf(guess) === -1) {
    selections.push(guess);
    guessesLeft--;
  }

  return letterGuess;

}

app.get('/', function (req, res){
  res.render('index', {letterGuess: letterGuess, selections: selections, guessesLeft: guessesLeft})
});

app.post('/', function(req, res){
  let guesses = req.body.letters.toLowerCase();
  guess = guesses;
  checkGuess(guess);
  if(guessesLeft === 0) {
    res.redirect('/lose');
  }
  let pickedWord = randomWordList.join(',');
  let finalGuessedWord = letterGuess.join(',');
  if(pickedWord === finalGuessedWord) {
    res.redirect('/win');
  }
 res.render('index', {letterGuess: letterGuess, selections: selections, guessesLeft: guessesLeft})
  console.log(selections)
})

app.get('/win', function(req, res){
 res.render('win');
})

app.get('/loose', function(req, res){
 res.render('loose');
})

app.listen(process.env_PORT || 4000)

require('dotenv').config()

const express = require('express');
const pokemon = require('pokemontcgsdk');
const https = require('https');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

pokemon.configure({apiKey: process.env.API_KEY});

let searchedPokemon = "";
let searchedSet = "";

let setData = [];
let cardData = [];

pokemon.set.all()
.then((sets) => {
  sets.forEach(set => {
    setData.push({
      "name": set.name,
      "id": set.id,
      "logo": set.images.logo
    });
  });
}).catch(error => {
  console.log(error);
  res.redirect("/error");
});

app.get("/", function(req, res) {
  searchedSet = "";
  res.render('index', {setData: setData});
});

app.get("/results", function(req, res) {
  res.render('results', {searchedPokemon: searchedPokemon, searchedSet: searchedSet, cardData: cardData});
});

app.get('/sets', function(req, res) {
  res.render('sets', {setData: setData})
});

app.post("/", function(req, res){
  searchedPokemon = req.body.pokemonName;
  setId = req.body.setId;
  pokemon.card.all({q: 'name:' + [searchedPokemon] + "*"})
  .then(cards => {
    cards.forEach(card => {
      if (card.set.id === setId) {
      searchedSet = card.set.name;
      cardData.push({
        "id": card.id,
        "image": card.images.small
      });
      } else if (setId === "") {
      searchedSet = "All";
      cardData.push({
        "id": card.id,
        "image": card.images.small
      });
      };
    });
    res.redirect('/results');
    }).catch(error => {
   console.log(error);
   res.redirect("/error");
   });
   cardData = [];
});

app.get('/sets/:setId', function(req, res) {
    setData.forEach(set => {
      if (req.params.setId == set.id) {
        pokemon.card.all({q: 'set.id:' + set.id})
        .then(cards => {
          searchedSet = cards[0].set.name;
          res.render('set', {searchedSet: searchedSet, cardData: cards});
          }).catch(error => {
          console.log(error);
          res.redirect("/error");
        });
      };
    });
});

app.get('/cards/:cardId', function(req, res) {
    pokemon.card.find(req.params.cardId)
    .then(card => {
      res.render('card', {cardData: card});
    }).catch(error => {
      console.log(error);
      res.redirect("/error");
    });
  });

app.get("/error", function(req, res) {
  res.render('error', {searchedPokemon: searchedPokemon});
})

app.listen(3000, function() {
  console.log("listening on port 3000")
});

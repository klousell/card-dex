require('dotenv').config()

const express = require('express');
const pokemon = require('pokemontcgsdk');
const https = require('https');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

pokemon.configure({apiKey: process.env.API_KEY});

let cardImages = [];
let searchedPokemon = "";
let searchedSet = "";

let setData = [];

pokemon.set.all()
.then((sets) => {
  sets.forEach(set => {
    setData.push({
      "name": set.name,
      "id": set.id,
      "logo": set.images.logo
    });
  });
});

app.get("/", function(req, res) {
  searchedSet = "";
  res.render('index', {setData: setData});
});

app.get("/results", function(req, res){
  res.render('results', {cardImages: cardImages, searchedPokemon: searchedPokemon, searchedSet: searchedSet})
});

app.get('/sets', function(req, res) {
  res.render('sets', {setData: setData})
  cardImages = [];
});

app.post("/", function(req, res){
  searchedPokemon = req.body.pokemonName;
  setId = req.body.setId;
  pokemon.card.all({q: 'name:' + searchedPokemon})
  .then(cards => {
    cards.forEach(card => {
      if (card.set.id === setId) {
      searchedSet = card.set.name;
      cardImages.push(card.images.small);
      } else if (setId === "") {
      searchedSet = "All";
      cardImages.push(card.images.small);
      }
    });
   res.redirect("/results");
  })
     cardImages = [];
});

app.get('/sets/:setId', function(req, res) {
  for (i = 0; i < setData.length; i++) {
    if (req.params.setId == setData[i].id) {
      pokemon.card.all({q: 'set.id:' + setData[i].id})
      .then(cards => {
        cards.forEach(card => {
          cardImages.push(card.images.small);
          searchedSet = card.set.name;
        });
        res.render('set', {cardImages: cardImages, searchedSet: searchedSet});
        cardImages = [];
      });
    };
  };
});

app.listen(3000, function() {
  console.log("listening on port 3000")
});

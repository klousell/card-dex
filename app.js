require('dotenv').config()

const express = require('express');
const pokemon = require('pokemontcgsdk');
const https = require('https');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

pokemon.configure({apiKey: process.env.API_KEY});

let cardSetNames = [];
let cardSetIds = [];
let cardSetLogos = [];
let cardImages = [];
let searchedPokemon = "";
let searchedSet = "";

https.get('https://api.pokemontcg.io/v2/sets/', (res) => {

  let allData = '';
  res.on('data', (d) => {
    allData += d;
  });

  res.on('end', () => {
    const parsedData = JSON.parse(allData);
    for (i = 0; i < parsedData.data.length; i++) {
      cardSetNames.push(parsedData.data[i].name);
      cardSetIds.push(parsedData.data[i].id);
      cardSetLogos.push(parsedData.data[i].images.logo);
    }

  });

}).on('error', (e) => {
  console.log(e);
});

app.get("/", function(req, res) {
      searchedSet = "";
      res.render('index', {cardSetNames: cardSetNames, cardSetIds: cardSetIds});
});

app.get("/results", function(req, res){
  res.render('results', {cardImages: cardImages, searchedPokemon: searchedPokemon, searchedSet: searchedSet})
});

app.get('/sets', function(req, res) {
  res.render('sets', {cardSetLogos: cardSetLogos, cardSetIds: cardSetIds, cardSetNames: cardSetNames})
    cardImages = [];
});

app.post("/", function(req, res){
  searchedPokemon = req.body.pokemonName;
  setId = req.body.setId;
  pokemon.card.all({q: 'name:' + searchedPokemon})
  .then(cards => {
    for (i = 0; i < cards.length; i++) {
      if (cards[i].set.id === setId) {
      searchedSet = cards[i].set.name;
      cardImages.push(cards[i].images.small);
    } else if (setId === "") {
      searchedSet = "All";
      cardImages.push(cards[i].images.small);
    }
    }
   res.redirect("/results");
  })
     cardImages = []
});

app.get('/sets/:setId', function(req, res) {
  cardSetIds.forEach(cardSetId => {
    if (req.params.setId == cardSetId) {
      pokemon.card.all({q: 'set.id:' + cardSetId})
      .then(cards => {
        cards.forEach(card => {
          cardImages.push(card.images.small);
          searchedSet = card.set.name;
        });
        res.render('set', {cardImages: cardImages, searchedSet: searchedSet});
      });
    };
  });
});

app.listen(3000, function() {
  console.log("listening on port 3000")
});

const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const port = 1234;
const {
  getAllBoats,
  getBoatById,
  deleteBoatById,
  addBoat,
  findBoats,
  checkContentInDB,
} = require("./database.js");

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ! ROUTES

// * Resurs     Metod	Förväntat svar
//   /	        GET	    Servar frontend (senare)
//   Denna endpoint serverar en minimal index.html.
//   http://localhost:3000/
//   http://localhost:3000/index.html

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

// * Resurs     Metod	Förväntat svar
//   /boats/	GET	    Returnerar en array med alla båtar
// Använd denna för att kontrollera vad som finns i databasen.
// http://localhost:3000/boats/
// [
//     { id: '001', model: 'Nimbus C9', ... },
//     { id: '002', model: 'Candela Seven', ''' },
//     ...
// ]

app.get("/boats/", (req, res) => {
  getAllBoats((response) => {
    res.send(response);
  });
});

// * Resurs	    Metod	Förväntat svar
//   /boat/:id	GET	    Returnerar en båt med efterfrågat id
//   /boat/	    POST	Sparar ett båt-objekt i databasen
//   /boat/:id	DELETE	Tar bort en båt från databasen

app.get("/boat/:id", (req, res) => {
  let id = req.params.id;
  getBoatById(id, (response) => {
    res.send(response);
  });
});

app.delete("/boat/:id", (req, res) => {
  let id = req.params.id;
  deleteBoatById(id, (response) => {
    res.send(response);
  });
});

app.post("/boat/", (req, res) => {
  addBoat(req.body, (response) => {
    res.send(response);
  });
});

// * Resurs	    Metod	Förväntat svar
//   /search/   GET	    Returnerar upp till fem sökträffar
//   Alla querystring-parametrar är valfria.
//   http://localhost:3000/search/?word=nimbus
//   http://localhost:3000/search/?word=nimbus&maxprice=30000&is_sail=yes&has_motor=yes
//   http://localhost:3000/search/?has_motor=yes&order=lowprice
//   Sökning
//   Man ska använda querystring för att tala om vad man söker efter. API:et ska hantera följande parametrar:

//   word - en sträng med ett ord som måste finnas i modellnamnet
//   maxprice - högsta tillåtna priset
//   Exempel: en sökning på word=ara matchar både BaRa och Skaraborg.

//   Sökresultatet ska sorteras med hjälp av sorteringsnyckeln:

//   lowprice - lägst pris först
//   name_asc - modellnamn, stigande i bokstavsordning
//   name_desc - modellnamn, fallande i bokstavsordning
//   oldest - äldst båt först, dvs fallande efter ålder
//   newest - yngst båt först
//   Exempel: order=lowprice ska sortera resultatet så den billigaste båten visas först.

app.get("/search/", (req, res) => {
  let query = req.query;
  findBoats(query, (response) => {
    res.send(response);
  });
});

// * Kontrollera så att det finns båtar i databasen, annars läs in dom mha boats.json

checkContentInDB();

// STARTA SERVER
app.listen(port, () => {
  console.log("Server is listening on port: " + port);
});

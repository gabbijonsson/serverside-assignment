const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const port = 1234;
const { getAllBoats, getBoatById, deleteBoatById, addBoat } = require('./database.js')

app.use( express.static(__dirname + '/public'));
app.use( bodyParser.urlencoded({extended: true}) );
app.use ( bodyParser.json() );

// ! ROUTES

// * Resurs     Metod	Förväntat svar
//   /	        GET	    Servar frontend (senare)
//   Denna endpoint serverar en minimal index.html.
//   http://localhost:3000/
//   http://localhost:3000/index.html

app.get('/', (req, res) => {
    res.sendFile('index.html')
})

// * Resurs     Metod	Förväntat svar
//   /boats/	GET	    Returnerar en array med alla båtar
// Använd denna för att kontrollera vad som finns i databasen.
// http://localhost:3000/boats/
// [
//     { id: '001', model: 'Nimbus C9', ... },
//     { id: '002', model: 'Candela Seven', ''' },
//     ...
// ]

app.get('/boats/', (req, res) => {
    getAllBoats(response => {
        res.send(response)
    })
})


// * Resurs	    Metod	Förväntat svar
//   /boat/:id	GET	    Returnerar en båt med efterfrågat id
//   /boat/	    POST	Sparar ett båt-objekt i databasen
//   /boat/:id	DELETE	Tar bort en båt från databasen

app.get('/boat/:id', (req, res) => {
    let id = req.params.id;
    getBoatById(id, response => {
        res.send(response)
    })
})

app.delete('/boat/:id', (req, res) => {
    let id = req.params.id;
    deleteBoatById(id, response => {
        res.send(response)
    })
})

app.post('/boat/', (req, res) => {
    console.log("POST req recieved")
    console.log(req.body);
    
    addBoat(req.body, response => {
        res.send(response)
    })
})





// STARTA SERVER
app.listen(port, () => {
    console.log('Server is listening on port: ' + port);
})
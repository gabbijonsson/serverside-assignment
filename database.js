const { MongoClient, ObjectID } = require("mongodb");
const fs = require("fs");

const url = "mongodb://127.0.0.1:27017/";
const dbName = "berrasboats";
const collectionName = "boats";

// * Kontrollera content i databasen

function checkContentInDB() {
  MongoClient.connect(
    url,
    { useUnifiedTopology: true },
    async (error, client) => {
      if (error) {
        console.log("An error occured. Could not connect." + error);
        return;
      }
      const col = client.db(dbName).collection(collectionName);
      try {
        col.countDocuments(function (countError, count) {
          if (!countError && count === 0) {
            // Om collection är tom, och vi inte får error, lägg till alla båtar på nytt.
            addAllBoats();
          } else if (countError) {
            console.log("Could not count documents in collection " + countError);
          } else {
            return;
          }
          client.close();
        });
      } catch (err) {
        console.log(err);
        client.close();
      }
    }
  );
}

// * Hämta upp båtar baserat på filter, sortera resultatet enligt sortBy (som kan vara tom)
function get(filter, cb, sortBy, limit=0) {
  MongoClient.connect(
    url,
    { useUnifiedTopology: true },
    async (error, client) => {
      if (error) {
        cb("An error occured. Could not connect." + error);
        return;
      }
      const col = client.db(dbName).collection(collectionName);
      try {
        const cursor = await col.find(filter).sort(sortBy).limit(limit);
        const array = await cursor.toArray();
        cb(array);
      } catch (err) {
        console.log("Invalid query" + err);
      } finally {
        client.close();
      }
    }
  );
}

// * Ta bort båt enligt filter-ID
function deleteBoatById(filter, cb) {
  MongoClient.connect(
    url,
    { useUnifiedTopology: true },
    async (error, client) => {
      if (error) {
        cb("An error occured. Could not connect." + error);
        return;
      }
      const col = client.db(dbName).collection(collectionName);
      try {
        let id = { _id: new ObjectID(filter) };
        const response = await col.deleteOne(id);
        cb(response.result);
      } catch (err) {
        console.log("Invalid query" + err);
      } finally {
        client.close();
      }
    }
  );
}

// * Lägg till båt
function addBoat(newDoc, cb) {
  MongoClient.connect(
    url,
    { useUnifiedTopology: true },
    async (error, client) => {
      if (error) {
        cb("An error occured. Could not connect." + error);
        return;
      }
      const col = client.db(dbName).collection(collectionName);
      try {
        const response = await col.insertOne(newDoc);
        cb(response.result);
      } catch (err) {
        console.log("Invalid query" + err);
      } finally {
        client.close();
      }
    }
  );
}

// * Lägg till alla båtar på nytt
function addAllBoats() {
  MongoClient.connect(
    url,
    { useUnifiedTopology: true },
    async (error, client) => {
      if (error) {
        console.log("An error occured. Could not connect." + error);
        return;
      }
      const col = client.db(dbName).collection(collectionName);
      let boats;
      let data = "";
      const fsReader = fs.createReadStream("./boats.json");
      fsReader.on("data", (chunk) => {
        data += chunk;
      });
      fsReader.on("end", () => {
        boats = JSON.parse(data);
        try {
          // För varje boat i boats, lägg till boat i collection. När sista båten lagts till, stäng kopplingen.
          boats.forEach((boat, i) => {
            col.insertOne(boat, (res) => {
              if (i === boats.length - 1) {
                client.close();
              }
            });
          });
        } catch (err) {
          console.log(err);
          client.close();
        }
      });
    }
  );
}

// * Hämta alla båtar
function getAllBoats(cb) {
  get({}, cb);
}

// * Hämta en båt, mha id.
function getBoatById(id, cb) {
  get({ _id: new ObjectID(id) }, (array) => cb(array[0]));
}

// * Filtrera och sortera båtar baserat på name, maxprice
// * och/eller order i query. Max 5 träffar visas.
function findBoats(query, cb) {
  const filter = {};
  let sortBy;
  switch (query.order) {
    case "lowprice":
      sortBy = { price: 1 };
      break;
    case "name_asc":
      sortBy = { model: 1 };
      break;
    case "name_desc":
      sortBy = { model: -1 };
      break;
    case "oldest":
      sortBy = { made: 1 };
      break;
    case "newest":
      sortBy = { made: -1 };
      break;
    default:
      sortBy = {};
      break;
  }
  if (query.name) {
    filter.model = { $regex: `.*${query.name}.*`, $options: "i" };
  }
  if (query.maxprice) {
    filter.price = { $lt: Number(query.maxprice) };
  }
  get(filter, cb, sortBy, 5);
}

module.exports = {
  getAllBoats,
  getBoatById,
  deleteBoatById,
  addBoat,
  findBoats,
  checkContentInDB,
};

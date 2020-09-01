const { MongoClient, ObjectID } = require('mongodb')

const url = 'mongodb://127.0.0.1:27017/';
const dbName = 'berrasboats';
const collectionName = 'boats';


function get(filter, cb) {
    MongoClient.connect(url, { useUnifiedTopology: true }, async(error, client) => {
        if(error) {
            cb('An error occured. Could not connect.' + error);
            return;
        }
        const col = client.db(dbName).collection(collectionName);
        try {
            const cursor = await col.find(filter);
            const array = await cursor.toArray();
            cb(array);
        } catch {
            cb('Invalid query' + error);
        } finally {
            client.close()
        }
    })
}

function deleteBoatById(filter, cb) {
    MongoClient.connect(url, { useUnifiedTopology: true }, async(error, client) => {
        if(error) {
            cb('An error occured. Could not connect.' + error);
            return;
        }
        const col = client.db(dbName).collection(collectionName);
        try {
            let id = { _id: new ObjectID(filter) }
            const response = await col.deleteOne(id);
            cb(response.result);
        } catch {
            cb('Invalid query' + error);
        } finally {
            client.close()
        }
    })
}

function addBoat(newDoc, cb) {
    MongoClient.connect(url, { useUnifiedTopology: true }, async(error, client) => {
        if(error) {
            cb('An error occured. Could not connect.' + error);
            return;
        }
        const col = client.db(dbName).collection(collectionName);
        try {
            const response = await col.insertOne(newDoc);
            cb(response.result);
        } catch {
            cb('Invalid query' + error);
        } finally {
            client.close()
        }
    })
}


function getAllBoats(cb) {
    get({}, cb)
}

function getBoatById(id, cb) {
    get({ _id: new ObjectID(id) }, array => cb( array[0] ))
}



module.exports = {
    getAllBoats,
    getBoatById,
    deleteBoatById,
    addBoat
}
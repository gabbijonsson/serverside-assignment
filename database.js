const { MongoClient, ObjectID } = require('mongodb')

const url = 'mongodb://127.0.0.1:27017/';
const dbName = 'berrasboats';
const collectionName = 'boats';


function get(filter, cb, sortBy) {
    MongoClient.connect(url, { useUnifiedTopology: true }, async(error, client) => {
        if(error) {
            cb('An error occured. Could not connect.' + error);
            return;
        }
        const col = client.db(dbName).collection(collectionName);
        try {
            const cursor = await col.find(filter).sort(sortBy);
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

function findBoats(query, cb) {
    const filter = {};
    let sortBy;
    switch(query.order) {            
        case 'lowprice':
            sortBy = { price: 1 };
            break;
        case 'name_asc':
            sortBy = { model: 1 };
            break;
        case 'name_desc':
            sortBy = { model: -1 };
            break;
        case 'oldest':
            sortBy = { made: 1 };
            break;
        case 'newest':
            sortBy = { made: -1 };
            break;    
        default:
            sortBy = {};
            break;
    }
    if(query.name) {
        filter.model = { "$regex": `.*${query.name}.*`, "$options": 'i' }
    }
    if(query.maxprice) {
        filter.price = { "$lt": Number(query.maxprice) }
    }
    get(filter, cb, sortBy)
    console.log(filter)
    
}


module.exports = {
    getAllBoats,
    getBoatById,
    deleteBoatById,
    addBoat,
    findBoats
}
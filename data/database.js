const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let database;

async function connect() {
    //include the mongodb:// part first (the MongoClient
    //connect method recognizes this)
    //this connect method returns a promise.
  const client = await MongoClient.connect('mongodb://localhost:27017')

  //retrieve the data from the database named "blog"
database = client.db('blog')
}

function getDb(){
    if (!database) {
        throw {message: 'database connection not established'};
    }

    return database
}

module.exports = {
    connectToDatabase: connect,
    getDb: getDb
}
const mongodb = require("mongodb")
const mongoClient = mongodb.MongoClient

const { port, key, DB_URL } = require("./config")

module.exports = (async ()=>{
	const client = await mongoClient.connect(DB_URL,{
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	return client
})()
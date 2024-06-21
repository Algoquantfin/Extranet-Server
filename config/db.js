// config/db.js
const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://growthsec:growthsec123@cluster0.thwyyfm.mongodb.net/";
let client;

const connectToMongoDB = async () => {
  try {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    console.log("Connected to MongoDB");
    return {
      pncDb: client.db("PNC"),
      otrDb: client.db("OTR"),
      gsmDb: client.db("GSM"),
    };
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
};

module.exports = { connectToMongoDB };

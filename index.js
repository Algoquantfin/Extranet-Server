// Server for mongoDB data 
const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Apply CORS middleware to allow requests from any origin
app.use(cors());

// MongoDB connection URI
const uri =
  "mongodb+srv://growthsec:growthsec123@cluster0.thwyyfm.mongodb.net/";

// MongoDB connection setup
let client, pncDb, otrDb, gsmDb;

const connectToMongoDB = async () => {
  try {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    pncDb = client.db("PNC");
    otrDb = client.db("OTR");
    gsmDb = client.db("GSM");
    console.log("Connected to MongoDB");

    // Start the server after successful MongoDB connection
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
};

// Function to fetch data from a collection
const fetchDataFromCollection = async (db, collectionName) => {
  try {
    const collection = db.collection(collectionName);
    const data = await collection.find().toArray();
    console.log(
      `Fetched ${data.length} documents from collection: ${collectionName}`
    );
    return data;
  } catch (error) {
    throw new Error(
      `Error fetching data from collection ${collectionName}: ${error}`
    );
  }
};

// Function to get the latest collection name based on date
const getLatestCollectionName = async (db) => {
  try {
    const today = new Date();
    let currentDate = formatDate(today);

    // Check if the current date collection exists
    let collectionExists = await checkCollectionExists(db, currentDate);
    if (collectionExists) {
      console.log(`Fetched latest collection name: ${currentDate}`);
      return currentDate;
    }

    // If current date collection doesn't exist, try previous dates sequentially
    let previousDate = subtractDayFromDate(today);
    while (previousDate && previousDate.getFullYear() >= 2000) {
      currentDate = formatDate(previousDate);
      collectionExists = await checkCollectionExists(db, currentDate);
      if (collectionExists) {
        console.log(`Fetched latest collection name: ${currentDate}`);
        return currentDate;
      }
      previousDate = subtractDayFromDate(previousDate);
    }

    throw new Error("No valid collections found");
  } catch (error) {
    throw new Error(`Error fetching latest collection name: ${error}`);
  }
};

// Function to check if a collection exists
const checkCollectionExists = async (db, collectionName) => {
  try {
    const collections = await db
      .listCollections({ name: collectionName })
      .toArray();
    return collections.length > 0;
  } catch (error) {
    console.error(
      `Error checking collection ${collectionName} existence:`,
      error
    );
    return false;
  }
};

// Function to format date as DDMMYY
const formatDate = (date) => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
};

// Function to subtract a day from a date
const subtractDayFromDate = (date) => {
  const yesterday = new Date(date);
  yesterday.setDate(date.getDate() - 1);
  return yesterday;
};

// Endpoint to serve PNC data based on collection name (date)
app.get("/pnc", async (req, res) => {
    try {
      let dateParam = req.query.date; // Date format as DDMMYY or undefined
  
      // Default to latest collection if no date is specified
      const date = dateParam ? dateParam : await getLatestCollectionName(pncDb);
  
      const data = await fetchDataFromCollection(pncDb, date);
      if (data.length === 0) {
        throw new Error(`No data found in PNC collection for date: ${date}`);
      }
  
      res.json(data);
    } catch (error) {
      console.error("Error fetching PNC data:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Endpoint to serve OTR data based on collection name (date)
  app.get("/otr", async (req, res) => {
    try {
      let dateParam = req.query.date; // Date format as DDMMYY or undefined
  
      // Default to latest collection if no date is specified
      const date = dateParam ? dateParam : await getLatestCollectionName(otrDb);
  
      const data = await fetchDataFromCollection(otrDb, date);
      if (data.length === 0) {
        throw new Error(`No data found in OTR collection for date: ${date}`);
      }
  
      res.json(data);
    } catch (error) {
      console.error("Error fetching OTR data:", error);
      res.status(500).json({ error: error.message });
    }
  });
  

// Function to get the latest GSM collection name based on date
const getLatestGsmCollectionName = async (db) => {
  try {
    const today = new Date();
    let currentDate = formatDate(today);

    console.log(`Searching for GSM collections starting with ${currentDate}`);

    // Check if the current date collection exists with GSM prefix followed by '_ASD_'
    let collectionExistsASD = await checkCollectionExists(
      db,
      `90234_GSM_ASD_${currentDate}`
    );
    if (collectionExistsASD) {
      console.log(
        `Fetched latest GSM collection name: 90234_GSM_ASD_${currentDate}`
      );
      return `90234_GSM_ASD_${currentDate}`;
    }

    // If ASD suffix collection doesn't exist, check for collections without the ASD suffix
    let collectionExists = await checkCollectionExists(
      db,
      `90234_GSM_${currentDate}`
    );
    if (collectionExists) {
      console.log(
        `Fetched latest GSM collection name: 90234_GSM_${currentDate}`
      );
      return `90234_GSM_${currentDate}`;
    }

    // If current date collection doesn't exist, try previous dates sequentially
    let previousDate = subtractDayFromDate(today);
    while (previousDate && previousDate.getFullYear() >= 2000) {
      currentDate = formatDate(previousDate);

      console.log(`Searching for GSM collections starting with ${currentDate}`);

      // Check ASD suffix collection for previous date
      collectionExistsASD = await checkCollectionExists(
        db,
        `90234_GSM_ASD_${currentDate}`
      );
      if (collectionExistsASD) {
        console.log(
          `Fetched latest GSM collection name: 90234_GSM_ASD_${currentDate}`
        );
        return `90234_GSM_ASD_${currentDate}`;
      }

      // Check non-ASD suffix collection for previous date
      collectionExists = await checkCollectionExists(
        db,
        `90234_GSM_${currentDate}`
      );
      if (collectionExists) {
        console.log(
          `Fetched latest GSM collection name: 90234_GSM_${currentDate}`
        );
        return `90234_GSM_${currentDate}`;
      }

      previousDate = subtractDayFromDate(previousDate);
    }

    throw new Error("No valid GSM collections found");
  } catch (error) {
    throw new Error(`Error fetching latest GSM collection name: ${error}`);
  }
};


// Endpoint to serve GSM data based on collection name (date)
app.get("/gsm", async (req, res) => {
    try {
      let dateParam = req.query.date; // Date format as DDMMYY or undefined
  
      // Default to latest collection if no date is specified
      let date = dateParam ? dateParam : await getLatestGsmCollectionName(gsmDb);
  
      // Format date as DDMMYY if it's not already in that format
      date = date.replace(/(\d{2})(\d{2})(\d{2})/, "$1$2$3");
  
      let collectionName = `90234_GSM_${date}`;
  
      // Check if the collection exists with ASD suffix
      let collectionExistsASD = await checkCollectionExists(
        gsmDb,
        `90234_GSM_ASD_${date}`
      );
      if (collectionExistsASD) {
        collectionName = `90234_GSM_ASD_${date}`;
      } else {
        // Check if the collection exists without ASD suffix
        let collectionExists = await checkCollectionExists(gsmDb, collectionName);
        if (!collectionExists) {
          throw new Error(`No data found in GSM collection for date: ${date}`);
        }
      }
  
      const data = await fetchDataFromCollection(gsmDb, collectionName);
      if (data.length === 0) {
        throw new Error(`No data found in GSM collection: ${collectionName}`);
      }
  
      res.json(data);
    } catch (error) {
      console.error("Error fetching GSM data:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  

// Start MongoDB connection and server
connectToMongoDB();





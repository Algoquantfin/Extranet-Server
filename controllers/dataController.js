// controllers/dataController.js
const { checkCollectionExists } = require("../utils/collectionUtils");
const { formatDate, subtractDayFromDate } = require("../utils/dateUtils");

const fetchDataFromCollection = async (db, collectionName) => {
  try {
    const collection = db.collection(collectionName);
    const data = await collection.find().toArray();
    console.log(`Fetched ${data.length} documents from collection: ${collectionName}`);
    return data;
  } catch (error) {
    throw new Error(`Error fetching data from collection ${collectionName}: ${error}`);
  }
};

const getLatestCollectionName = async (db) => {
  try {
    const today = new Date();
    let currentDate = formatDate(today);

    let collectionExists = await checkCollectionExists(db, currentDate);
    if (collectionExists) {
      return currentDate;
    }

    let previousDate = subtractDayFromDate(today);
    while (previousDate && previousDate.getFullYear() >= 2000) {
      currentDate = formatDate(previousDate);
      collectionExists = await checkCollectionExists(db, currentDate);
      if (collectionExists) {
        return currentDate;
      }
      previousDate = subtractDayFromDate(previousDate);
    }

    throw new Error("No valid collections found");
  } catch (error) {
    throw new Error(`Error fetching latest collection name: ${error}`);
  }
};

const getLatestGsmCollectionName = async (db) => {
  try {
    const today = new Date();
    let currentDate = formatDate(today);

    let collectionExistsASD = await checkCollectionExists(db, `90234_GSM_ASD_${currentDate}`);
    if (collectionExistsASD) {
      return `90234_GSM_ASD_${currentDate}`;
    }

    let collectionExists = await checkCollectionExists(db, `90234_GSM_${currentDate}`);
    if (collectionExists) {
      return `90234_GSM_${currentDate}`;
    }

    let previousDate = subtractDayFromDate(today);
    while (previousDate && previousDate.getFullYear() >= 2000) {
      currentDate = formatDate(previousDate);

      collectionExistsASD = await checkCollectionExists(db, `90234_GSM_ASD_${currentDate}`);
      if (collectionExistsASD) {
        return `90234_GSM_ASD_${currentDate}`;
      }

      collectionExists = await checkCollectionExists(db, `90234_GSM_${currentDate}`);
      if (collectionExists) {
        return `90234_GSM_${currentDate}`;
      }

      previousDate = subtractDayFromDate(previousDate);
    }

    throw new Error("No valid GSM collections found");
  } catch (error) {
    throw new Error(`Error fetching latest GSM collection name: ${error}`);
  }
};

module.exports = { fetchDataFromCollection, getLatestCollectionName, getLatestGsmCollectionName };

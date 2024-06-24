// upload.js

const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const { format, addDays, parse } = require("date-fns");
const cors = require("cors");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection setup
const mongoURL = "mongodb+srv://growthsec:growthsec123@cluster0.thwyyfm.mongodb.net/";
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });

// Function to sanitize collection names for MongoDB
const sanitizeCollectionName = (name) => {
  return name.replace(/[^a-zA-Z0-9_]/g, "_");
};

// Function to insert data into MongoDB
const insertData = async (db, collectionName, csvFilePath) => {
  const sanitizedCollectionName = sanitizeCollectionName(collectionName);
  const collection = db.collection(sanitizedCollectionName);
  const data = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row) => {
        data.push(row);
      })
      .on("end", async () => {
        try {
          await collection.insertMany(data, {
            ordered: false,
            bypassDocumentValidation: true,
          });
          fs.unlinkSync(csvFilePath); // Delete the file after processing
          resolve({
            message: `Inserted ${data.length} records into collection '${sanitizedCollectionName}'`,
          });
        } catch (error) {
          reject(
            `Failed to insert data into collection '${sanitizedCollectionName}': ${error.message}`
          );
        }
      })
      .on("error", (error) => {
        reject(`Error reading CSV file: ${error.message}`);
      });
  });
};

// Route for handling PNC file uploads
router.post("/upload-pnc", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  const fileName = req.file.originalname;

  if (!fileName.startsWith("PNC_OPT_90234") || !fileName.endsWith(".csv")) {
    return res.status(400).json({
      error: "Invalid file type. Only PNC_OPT_90234 CSV files are allowed.",
    });
  }

  const dateMatch = fileName.match(/PNC_OPT_90234_(\d{8})/);
  if (!dateMatch) {
    return res.status(400).json({
      error:
        "Invalid file name format. Expected format: PNC_OPT_90234_YYYYMMDD.csv",
    });
  }

  const dateString = dateMatch[1];
  const fileDate = parse(dateString, "ddMMyyyy", new Date());
  const nextTradingDay = addDays(fileDate, 1);
  const collectionName = format(nextTradingDay, "ddMMyy"); // Format as 'DDMMYY'

  try {
    const db = mongoose.connection.useDb("PNC");
    const result = await insertData(db, collectionName, filePath);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Route for handling OTR file uploads
router.post("/upload-otr", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  const fileName = req.file.originalname;

  if (!fileName.startsWith("FAO_ORDER_TO_TRADE_RATIO_") || !fileName.endsWith(".csv")) {
    return res.status(400).json({
      error: "Invalid file type. Only FAO_ORDER_TO_TRADE_RATIO CSV files are allowed.",
    });
  }

  const dateMatch = fileName.match(/FAO_ORDER_TO_TRADE_RATIO_(\d{8})/);
  if (!dateMatch) {
    return res.status(400).json({
      error:
        "Invalid file name format. Expected format: FAO_ORDER_TO_TRADE_RATIO_YYYYMMDD.csv",
    });
  }

  const dateString = dateMatch[1];
  const fileDate = parse(dateString, "ddMMyyyy", new Date());
  const nextTradingDay = addDays(fileDate, 1);
  const collectionName = format(nextTradingDay, "ddMMyy"); // Format as 'DDMMYY'

  try {
    const db = mongoose.connection.useDb("OTR");
    const result = await insertData(db, collectionName, filePath);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

module.exports = router;

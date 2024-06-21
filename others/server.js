const express = require("express");
const csv = require("csv-parser");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Apply CORS middleware to allow requests from any origin
app.use(cors());

// File paths
const fnoFilePath =
  "D:/project_python/FTP/working/Back_End/server/ftp/160524/FAO_ORDER_TO_TRADE_RATIO_16052024_90234.csv";
const pncFilePath =
  "D:/project_python/FTP/working/Back_End/server/ftp/160524/PNC_OPT_90234_16052024.csv";

// Function to fetch data from CSV file
const fetchData = (filePath, res) => {
  const results = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      res.json(results);
    })
    .on("error", (err) => {
      console.error(`Error reading file: ${err}`);
      res.status(500).json({ error: "Internal Server Error" });
    });
};

// Endpoint for fetching FNO data
app.get("/fno", (req, res) => {
  fetchData(fnoFilePath, res);
  console.log("FNO File Path", fnoFilePath);
});

// Endpoint for fetching PNC data
app.get("/pnc", (req, res) => {
  fetchData(pncFilePath, res);
  console.log("PNC File Path", pncFilePath);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
